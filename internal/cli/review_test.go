package cli

import (
	"bytes"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"testing"
	"time"
)

// M6, the CLI half: a card with no branch exits 2 naming what is missing.
func TestReviewCardWithoutBranchExits2(t *testing.T) {
	home := t.TempDir()
	root := filepath.Join(home, "init-r")
	for rel, body := range map[string]string{
		"working-on/initiative.yaml": "id: init-r\ntitle: R\nstatus: active\n",
		"working-on/no-branch.md":    "---\ntitle: x\nstatus: next\nupdated: 2026-10-15\nnext: \"x\"\n---\n",
	} {
		p := filepath.Join(root, rel)
		_ = os.MkdirAll(filepath.Dir(p), 0o755)
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	cfg := filepath.Join(t.TempDir(), "config.yaml")
	if err := os.WriteFile(cfg, []byte("machine: test\nroots: ["+home+"]\nmax_depth: 2\nauth: off\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("ORGANIZER_CONFIG", cfg)
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	var out, errb bytes.Buffer
	code := runWith([]string{"review", "init-r", "no-branch"}, &out, &errb, time.Now)
	if code != 2 || !strings.Contains(errb.String(), "card no-branch has no branch") {
		t.Errorf("exit %d, stderr %q", code, errb.String())
	}
}

// FR-10: doctor names node, or says it is missing, beside go.
func TestReviewStatusNamesNode(t *testing.T) {
	if s := reviewStatus(); !strings.Contains(s, "go ") || !strings.Contains(s, "node ") {
		t.Errorf("reviewStatus %q", s)
	}
	t.Setenv("PATH", t.TempDir())
	if s := reviewStatus(); !strings.Contains(s, "go not on PATH") || !strings.Contains(s, "node not on PATH, so no TypeScript is read") {
		t.Errorf("reviewStatus without tools %q", s)
	}
}

// G1 / leftovers-41 FR-7: the help line for review reads as FR-7 and
// names the same flags as review.go's usage.
func TestReviewHelpLine(t *testing.T) {
	var b bytes.Buffer
	usage(&b)
	var line string
	for _, l := range strings.Split(b.String(), "\n") {
		if strings.HasPrefix(l, "  organizer review ") {
			line = l
		}
	}
	const want = "  organizer review <initiative> <card | sha> [--card slug] [--json] [--out path] [--work dir] [--marks]  the change of a card's branch or merge as revmap.json"
	if !strings.HasPrefix(line, want) || strings.Contains(line, "the Go change") {
		t.Errorf("help line %q", line)
	}
	flags := regexp.MustCompile(`--[a-z]+`)
	help, use := flags.FindAllString(line, -1), flags.FindAllString(reviewUsage, -1)
	slices.Sort(help)
	slices.Sort(use)
	if !slices.Equal(slices.Compact(help), slices.Compact(use)) {
		t.Errorf("help flags %v, usage flags %v", help, use)
	}
}

// reviewRepo is an initiative whose root is its one Go repo, with a commit
// changing F and a card c1; it sets the config and data dir and returns
// the commit and the root.
func reviewRepo(t *testing.T) (string, string) {
	t.Helper()
	home := t.TempDir()
	root := filepath.Join(home, "init-r")
	git := func(args ...string) string {
		t.Helper()
		cmd := exec.Command("git", append([]string{"-C", root}, args...)...)
		cmd.Env = append(os.Environ(), "GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t", "GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t", "GIT_CONFIG_GLOBAL=/dev/null")
		out, err := cmd.CombinedOutput()
		if err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
		return strings.TrimSpace(string(out))
	}
	write := func(rel, body string) {
		t.Helper()
		p := filepath.Join(root, rel)
		_ = os.MkdirAll(filepath.Dir(p), 0o755)
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("working-on/initiative.yaml", "id: init-r\ntitle: R\nstatus: active\n")
	write("working-on/c1.md", "---\ntitle: x\nstatus: now\nupdated: 2026-10-17\nnext: \"x\"\n---\n")
	write("go.mod", "module example.com/r\n\ngo 1.22\n")
	write("p/f.go", "package p\n\nfunc F() int { return 1 }\n")
	_ = os.MkdirAll(root, 0o755)
	git("init", "-q", "-b", "main")
	git("add", ".")
	git("commit", "-q", "-m", "base")
	write("p/f.go", "package p\n\nfunc F() int { return 2 }\n")
	git("commit", "-q", "-am", "change F")
	cfg := filepath.Join(t.TempDir(), "config.yaml")
	if err := os.WriteFile(cfg, []byte("machine: test\nroots: ["+home+"]\nmax_depth: 2\nauth: off\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("ORGANIZER_CONFIG", cfg)
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	return git("rev-parse", "HEAD"), root
}

// R3 (FR-12): no card, change-check not on the PATH, and a change-check
// exiting 1 with no JSON each write the map, say why in one line, exit 0.
func TestReviewWithoutReconciliation(t *testing.T) {
	sha, _ := reviewRepo(t)
	run := func(args ...string) (string, string) { // stdout, stderr
		t.Helper()
		var out, errb bytes.Buffer
		if code := runWith(append([]string{"review", "init-r"}, args...), &out, &errb, time.Now); code != 0 {
			t.Fatalf("review %v: exit %d, stderr %q", args, code, errb.String())
		}
		path := filepath.Join(os.Getenv("XDG_DATA_HOME"), "organizer", "review", "init-r", sha, "revmap.json")
		if _, err := os.Stat(path); err != nil {
			t.Errorf("review %v: no map: %v", args, err)
		}
		return out.String(), errb.String()
	}
	check := func(name, out, why string) {
		t.Helper()
		if strings.Count(out, "no reconciliation: ") != 1 || !strings.Contains(out, "no reconciliation: "+why+"\n") {
			t.Errorf("%s: summary %q, want one line %q", name, out, why)
		}
	}
	out, _ := run(sha)
	check("no card", out, "no card")

	// a PATH with what the build needs and no change-check
	bin := t.TempDir()
	for _, tool := range []string{"git", "go", "tar"} {
		p, err := exec.LookPath(tool)
		if err != nil {
			t.Skip(tool + " not on PATH")
		}
		if err := os.Symlink(p, filepath.Join(bin, tool)); err != nil {
			t.Fatal(err)
		}
	}
	orig := os.Getenv("PATH")
	t.Setenv("PATH", bin)
	out, _ = run(sha, "--card", "c1")
	check("missing", out, "change-check not on PATH")

	fake := t.TempDir()
	if err := os.WriteFile(filepath.Join(fake, "change-check"), []byte("#!/bin/sh\necho broken\nexit 1\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", fake+string(os.PathListSeparator)+orig)
	out, _ = run(sha, "--card", "c1")
	check("fails", out, "change-check failed: output is not its --json")
}

// D1, the CLI half (FR-13): a card whose branch was merged and deleted is
// reviewed as its merge against the first parent; a slug with neither a
// branch nor a merge exits 2 naming both.
func TestReviewMergedCard(t *testing.T) {
	_, dir := reviewRepo(t)
	git := func(args ...string) string {
		t.Helper()
		cmd := exec.Command("git", append([]string{"-C", dir}, args...)...)
		cmd.Env = append(os.Environ(), "GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t", "GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t", "GIT_CONFIG_GLOBAL=/dev/null")
		out, err := cmd.CombinedOutput()
		if err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
		return strings.TrimSpace(string(out))
	}
	if err := os.WriteFile(filepath.Join(dir, "working-on/c2.md"), []byte("---\ntitle: x\nstatus: now\nbranch: c2\nupdated: 2026-10-17\nnext: \"x\"\n---\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	git("add", ".")
	git("commit", "-q", "-m", "card c2")
	git("checkout", "-q", "-b", "c2")
	if err := os.WriteFile(filepath.Join(dir, "p/f.go"), []byte("package p\n\nfunc F() int { return 3 }\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	git("commit", "-q", "-am", "F returns 3")
	git("checkout", "-q", "main")
	git("merge", "-q", "--no-ff", "-m", "merge: c2 (F returns 3)", "c2")
	git("branch", "-q", "-D", "c2")
	merge, parent := git("rev-parse", "HEAD"), git("rev-parse", "HEAD^1")

	var out, errb bytes.Buffer
	if code := runWith([]string{"review", "init-r", "c2", "--json"}, &out, &errb, time.Now); code != 0 {
		t.Fatalf("exit %d, stderr %q", code, errb.String())
	}
	if !strings.Contains(out.String(), `"head": "`+merge+`"`) || !strings.Contains(out.String(), `"base": "`+parent+`"`) {
		t.Errorf("map is not %s^1..%s:\n%.400s", merge, merge, out.String())
	}
	out.Reset()
	errb.Reset()
	if err := os.WriteFile(filepath.Join(dir, "working-on/c3.md"), []byte("---\ntitle: x\nstatus: next\nbranch: c3\nupdated: 2026-10-17\nnext: \"x\"\n---\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	code := runWith([]string{"review", "init-r", "c3"}, &out, &errb, time.Now)
	if code != 2 || !strings.Contains(errb.String(), "branch c3 of card c3 does not exist") || !strings.Contains(errb.String(), `"merge: c3 "`) {
		t.Errorf("neither: exit %d, stderr %q", code, errb.String())
	}
}

// A3 (v3 FR-27): --marks prints the count line and one line per question
// or block, the asked one with the review's thread and the other `not
// asked`; a card with no map exits 2 naming organizer review.
func TestReviewMarksCoverage(t *testing.T) {
	_, dir := reviewRepo(t)
	git := func(args ...string) string {
		t.Helper()
		cmd := exec.Command("git", append([]string{"-C", dir}, args...)...)
		cmd.Env = append(os.Environ(), "GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t", "GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t", "GIT_CONFIG_GLOBAL=/dev/null")
		out, err := cmd.CombinedOutput()
		if err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
		return strings.TrimSpace(string(out))
	}
	for _, c := range []string{"cm", "nomap"} {
		if err := os.WriteFile(filepath.Join(dir, "working-on", c+".md"), []byte("---\ntitle: x\nstatus: now\nbranch: "+c+"\nupdated: 2026-10-18\nnext: \"x\"\n---\n"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	git("add", ".")
	git("commit", "-q", "-m", "cards")
	git("branch", "nomap")
	git("checkout", "-q", "-b", "cm")
	if err := os.WriteFile(filepath.Join(dir, "p/f.go"), []byte("package p\n\nfunc F() int { return 3 }\n\nfunc G() int { return 3 }\n\nfunc H() int { return 3 }\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	git("commit", "-q", "-am", "F, G and H")
	git("checkout", "-q", "main")
	head := git("rev-parse", "cm")

	var out, errb bytes.Buffer
	if code := runWith([]string{"review", "init-r", "cm"}, &out, &errb, time.Now); code != 0 {
		t.Fatalf("make the map: exit %d, stderr %q", code, errb.String())
	}
	f, g, h := "go:example.com/r/p.F", "go:example.com/r/p.G", "go:example.com/r/p.H"
	state := `{"initiative":"init-r","card":"cm","head":"` + head + `","thread":"T1","changed":[],"marks":[
		{"symbol":"` + f + `","state":"question","note":"why 3?","by":"pablo","at":"2026-10-18T09:00:00Z","hash":"x","asked":"M1"},
		{"symbol":"` + g + `","state":"blocked","note":"no","by":"pablo","at":"2026-10-18T09:00:00Z","hash":"x"},
		{"symbol":"` + h + `","state":"reviewed","note":"","by":"pablo","at":"2026-10-18T09:00:00Z","hash":"x"}]}`
	p := filepath.Join(os.Getenv("XDG_DATA_HOME"), "organizer", "review", "init-r", head, "state.json")
	if err := os.WriteFile(p, []byte(state), 0o644); err != nil {
		t.Fatal(err)
	}
	out.Reset()
	errb.Reset()
	if code := runWith([]string{"review", "init-r", "cm", "--marks"}, &out, &errb, time.Now); code != 0 {
		t.Fatalf("--marks: exit %d, stderr %q", code, errb.String())
	}
	want := "Reviewed 1 of 3 · 1 questions · 1 blocked\n" + f + "  question  T1\n" + g + "  blocked  not asked\n"
	if out.String() != want {
		t.Errorf("--marks:\n%s\nwant:\n%s", out.String(), want)
	}

	out.Reset()
	errb.Reset()
	code := runWith([]string{"review", "init-r", "nomap", "--marks"}, &out, &errb, time.Now)
	if code != 2 || !strings.Contains(errb.String(), "organizer review init-r nomap\n") || out.Len() != 0 {
		t.Errorf("no map: exit %d, stdout %q, stderr %q", code, out.String(), errb.String())
	}
}
