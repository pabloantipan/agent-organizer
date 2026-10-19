package review

import (
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"organizer/internal/model"
)

// fakeChangeCheck puts a change-check on the PATH that writes its
// arguments to args.txt beside it, prints body and exits with code.
func fakeChangeCheck(t *testing.T, body string, code int) (argsFile string) {
	t.Helper()
	dir := t.TempDir()
	argsFile = filepath.Join(dir, "args.txt")
	if err := os.WriteFile(filepath.Join(dir, "out.json"), []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	script := "#!/bin/sh\necho \"$@\" > '" + argsFile + "'\ncat '" + filepath.Join(dir, "out.json") + "'\nexit " + string(rune('0'+code)) + "\n"
	if err := os.WriteFile(filepath.Join(dir, "change-check"), []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", dir+string(os.PathListSeparator)+os.Getenv("PATH"))
	return argsFile
}

// R2: a fake change-check prints one flag of each kind on symbols that have
// nodes, plus a file-level one on a file with none and two words the map
// has no place for; each lands word for word, nothing else is added.
func TestReconcileFlagsOntoNodes(t *testing.T) {
	dir, merge, before := fixtureRepo(t)
	ranges, err := CommitRanges(merge, []Repo{{Dir: dir}})
	if err != nil {
		t.Fatal(err)
	}
	rm, err := Build("init", merge, ranges, []Source{GoTypes{}}, t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	argsFile := fakeChangeCheck(t, `{"card": "working-on/c.md", "flags": [
  {"flag": "undeclared", "repo": "m", "path": "p/a.go", "symbol": "D", "detail": "function"},
  {"flag": "declared, not changed", "repo": "", "path": "", "symbol": "p/a.go:B", "detail": "no matching change"},
  {"flag": "outside footprint", "repo": "m", "path": "p/a.go", "symbol": "A", "detail": "function"},
  {"flag": "undeclared", "repo": "m", "path": "web/x.ts", "symbol": "", "detail": "modified"},
  {"flag": "outside boundary", "repo": "m", "path": "p/a.go", "symbol": "", "detail": "modified"},
  {"flag": "untested?", "repo": "m", "path": "p/a.go", "symbol": "A", "detail": "no test"}
]}`, 1)
	flags, err := ChangeCheck(dir, "init", "c", rm.Base, rm.Head)
	if err != nil {
		t.Fatal(err)
	}
	args, _ := os.ReadFile(argsFile)
	if got, want := strings.TrimSpace(string(args)), "init c --base "+before+" --head "+merge+" --json"; got != want {
		t.Errorf("change-check args %q, want %q", got, want)
	}
	Reconcile(rm, flags)
	const p = "go:example.com/m/p."
	// untested is the map's own (FR-6) and stays as Build left it
	want := map[string][]string{p + "A": {"outside_footprint"}, p + "B": {"declared_not_changed"}, p + "D": {"undeclared"}}
	for _, n := range rm.Nodes {
		got := slices.DeleteFunc(slices.Clone(n.Flags), func(f string) bool { return f == "untested" })
		if !slices.Equal(got, want[n.ID]) && !(len(got) == 0 && want[n.ID] == nil) {
			t.Errorf("%s flags %v, want %v", n.ID, n.Flags, want[n.ID])
		}
	}
	type mm struct{ typ, node, file string }
	var got []mm
	for _, m := range rm.Mismatches {
		node := ""
		if m.Node != nil {
			node = *m.Node
		}
		got = append(got, mm{m.Type, node, m.File})
	}
	wantM := []mm{
		{"changed_not_declared", p + "D", ""},
		{"declared_not_changed", p + "B", ""},
		{"outside_footprint", p + "A", ""},
		{"changed_not_declared", "", "web/x.ts"},
	}
	if !slices.Equal(got, wantM) {
		t.Errorf("mismatches %+v, want %+v", got, wantM)
	}
	rm.Reconciled, rm.Reconciliation = true, "change-check c"
	var sum strings.Builder
	WriteSummary(&sum, rm, "")
	if !strings.Contains(sum.String(), "mismatches (change-check c): changed_not_declared 2, declared_not_changed 1, outside_footprint 1\n") {
		t.Errorf("summary %q", sum.String())
	}
}

// A declared name no node has is a node-less mismatch carrying the name;
// a flag on a file with several changed nodes flags each and is one
// file-level mismatch.
func TestReconcileNodeless(t *testing.T) {
	rm := &RevMap{Nodes: []Node{
		{ID: "ts:f.test.tsx#a", Level: "symbol", Parent: "ts:.", File: "f.test.tsx", Change: "added", Flags: []string{}},
		{ID: "ts:f.test.tsx#b", Level: "symbol", Parent: "ts:.", File: "f.test.tsx", Change: "deleted", Flags: []string{}},
		{ID: "ts:f.tsx#C", Level: "symbol", Parent: "ts:.", File: "f.tsx", Change: "affected", Flags: []string{}},
	}}
	Reconcile(rm, []CheckFlag{
		{Flag: "declared, not changed", Symbol: "s.css:.row"},
		{Flag: "outside footprint", Path: "f.test.tsx"},
	})
	if len(rm.Mismatches) != 2 || rm.Mismatches[0].Node != nil || rm.Mismatches[0].Symbol != "s.css:.row" || rm.Mismatches[0].File != "s.css" ||
		rm.Mismatches[1].Node != nil || rm.Mismatches[1].File != "f.test.tsx" || rm.Mismatches[1].Type != "outside_footprint" {
		t.Errorf("mismatches %+v", rm.Mismatches)
	}
	if !slices.Equal(rm.Nodes[0].Flags, []string{"outside_footprint"}) || !slices.Equal(rm.Nodes[1].Flags, []string{"outside_footprint"}) || len(rm.Nodes[2].Flags) != 0 {
		t.Errorf("flags %v %v %v", rm.Nodes[0].Flags, rm.Nodes[1].Flags, rm.Nodes[2].Flags)
	}
}

// FR-12's failures, each one line: not on the PATH, an exit that is not 0
// or 1, output that is not its JSON.
func TestChangeCheckFailures(t *testing.T) {
	orig := os.Getenv("PATH")
	t.Setenv("PATH", t.TempDir())
	if _, err := ChangeCheck(t.TempDir(), "i", "c", "a", "b"); err == nil || err.Error() != "change-check not on PATH" {
		t.Errorf("missing: %v", err)
	}
	t.Setenv("PATH", orig)
	fakeChangeCheck(t, "", 1)
	if _, err := ChangeCheck(t.TempDir(), "i", "c", "a", "b"); err == nil || !strings.Contains(err.Error(), "not its --json") {
		t.Errorf("exit 1, no output: %v", err)
	}
	fakeChangeCheck(t, `{"flags": []}`, 2)
	if _, err := ChangeCheck(t.TempDir(), "i", "c", "a", "b"); err == nil || !strings.Contains(err.Error(), "exit status 2") || strings.Contains(err.Error(), "\n") {
		t.Errorf("exit 2: %v", err)
	}
	fakeChangeCheck(t, `{"flags": []}`, 0)
	if f, err := ChangeCheck(t.TempDir(), "i", "c", "a", "b"); err != nil || len(f) != 0 {
		t.Errorf("clean: %v %v", f, err)
	}
}

// twoRepoCard is an initiative root holding repos alpha and beta, each a
// Go module whose branch c2 changes A in p/a.go, and a card c2 across
// both. It returns the scanned initiative.
func twoRepoCard(t *testing.T) *model.ScannedInitiative {
	root := t.TempDir()
	for _, name := range []string{"alpha", "beta"} {
		f := fixture{t: t, dir: filepath.Join(root, name)}
		f.write("go.mod", "module example.com/"+name+"\n\ngo 1.22\n")
		f.write("p/a.go", "package p\n\nfunc A() int { return 1 }\n")
		f.git("init", "-q", "-b", "main")
		f.git("add", ".")
		f.git("commit", "-q", "-m", "base")
		f.git("checkout", "-q", "-b", "c2")
		f.write("p/a.go", "package p\n\nfunc A() int { return 2 }\n")
		f.git("commit", "-q", "-am", "c2 in "+name)
	}
	return &model.ScannedInitiative{
		Initiative: model.Initiative{ID: "init", Path: root, Repos: []string{"alpha", "beta"}},
		Cards:      []model.Card{{Slug: "c2", Branch: "c2", Repos: []string{"alpha", "beta"}}},
	}
}

// stubChangeCheck puts a change-check on the PATH that appends its
// arguments to args.txt beside it, one line per call, exits 3 for
// `--repo <failing>` and otherwise prints one undeclared flag on A named
// by symbol alone, which matches A in both repos unless scoped.
func stubChangeCheck(t *testing.T, failing string) (argsFile string) {
	t.Helper()
	dir := t.TempDir()
	argsFile = filepath.Join(dir, "args.txt")
	script := "#!/bin/sh\necho \"$@\" >> '" + argsFile + "'\n" +
		"case \"$*\" in *\"--repo " + failing + " \"*) echo 'boom in " + failing + "' >&2; exit 3;; esac\n" +
		"echo '{\"flags\": [{\"flag\": \"undeclared\", \"repo\": \"\", \"path\": \"\", \"symbol\": \"A\", \"detail\": \"function\"}]}'\nexit 1\n"
	if err := os.WriteFile(filepath.Join(dir, "change-check"), []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", dir+string(os.PathListSeparator)+os.Getenv("PATH"))
	return argsFile
}

// M2 (leftovers-45 FR-2): a two-repo card runs change-check once per repo
// with its own --repo, base and head; beta's run fails, alpha's flag lands
// on alpha's A only, and the reconciliation names beta and its error.
func TestMakeChecksEachRepo(t *testing.T) {
	si := twoRepoCard(t)
	ranges, card, err := Resolve(si, "c2")
	if err != nil || len(ranges) != 2 || card != "c2" {
		t.Fatalf("resolve: %+v %q %v", ranges, card, err)
	}
	argsFile := stubChangeCheck(t, "beta")
	rm, err := Make(si, "c2", card, ranges, t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	args, _ := os.ReadFile(argsFile)
	t.Logf("change-check calls:\n%s", args)
	var want []string
	for _, r := range ranges {
		want = append(want, si.Path+" c2 --repo "+r.Name+" --base "+r.Base+" --head "+r.Head+" --json")
	}
	if got := strings.Split(strings.TrimSpace(string(args)), "\n"); !slices.Equal(got, want) {
		t.Errorf("calls %q, want %q", got, want)
	}
	if ranges[0].Base == ranges[1].Base || ranges[0].Head == ranges[1].Head {
		t.Fatal("fixture: both repos share a range")
	}
	const a, b = "go:example.com/alpha/p.A", "go:example.com/beta/p.A"
	nodes := byID(rm)
	if !slices.Contains(nodes[a].Flags, "undeclared") || slices.Contains(nodes[b].Flags, "undeclared") {
		t.Errorf("alpha A %v, beta A %v: want undeclared on alpha only", nodes[a].Flags, nodes[b].Flags)
	}
	if len(rm.Mismatches) != 1 || rm.Mismatches[0].Node == nil || *rm.Mismatches[0].Node != a {
		t.Errorf("mismatches %+v, want one on %s", rm.Mismatches, a)
	}
	if rm.Reconciled || !strings.HasPrefix(rm.Reconciliation, "beta: change-check failed: exit status 3: boom in beta") {
		t.Errorf("reconciled %v %q, want false naming beta and its error", rm.Reconciled, rm.Reconciliation)
	}
	t.Logf("reconciled %v, reconciliation %q", rm.Reconciled, rm.Reconciliation)

	// Both repos check: each flag on its own repo's A, reconciled.
	stubChangeCheck(t, "none")
	rm, err = Make(si, "c2", card, ranges, t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	nodes = byID(rm)
	if !rm.Reconciled || rm.Reconciliation != "change-check c2" || len(rm.Mismatches) != 2 ||
		!slices.Contains(nodes[a].Flags, "undeclared") || !slices.Contains(nodes[b].Flags, "undeclared") {
		t.Errorf("both check: %v %q %+v %v %v", rm.Reconciled, rm.Reconciliation, rm.Mismatches, nodes[a].Flags, nodes[b].Flags)
	}
}

// A one-range card runs change-check once, as before FR-2: no --repo.
func TestMakeOneRangeNoRepoFlag(t *testing.T) {
	si := twoRepoCard(t)
	si.Cards[0].Repos = []string{"alpha"}
	ranges, card, err := Resolve(si, "c2")
	if err != nil || len(ranges) != 1 {
		t.Fatalf("resolve: %+v %v", ranges, err)
	}
	argsFile := stubChangeCheck(t, "none")
	rm, err := Make(si, "c2", card, ranges, t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	args, _ := os.ReadFile(argsFile)
	if got, want := strings.TrimSpace(string(args)), si.Path+" c2 --base "+ranges[0].Base+" --head "+ranges[0].Head+" --json"; got != want {
		t.Errorf("call %q, want %q", got, want)
	}
	if !rm.Reconciled || rm.Reconciliation != "change-check c2" {
		t.Errorf("reconciled %v %q", rm.Reconciled, rm.Reconciliation)
	}
}
