package review

import (
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

// fixtureRepo is a small module with history: on main a.go holds A (calls
// B and C), B, C and type T, and a_test.go tests B through a helper; branch
// feat changes B's body, adds D (A now calls it), deletes C and touches a
// non-Go file; main then merges feat with --no-ff, and branch open, not
// merged, adds E. It returns the repo, the
// merge sha and the sha of main before it.
func fixtureRepo(t *testing.T) (dir, merge, before string) {
	t.Helper()
	dir = t.TempDir()
	run := func(args ...string) string {
		t.Helper()
		cmd := exec.Command("git", append([]string{"-C", dir}, args...)...)
		cmd.Env = append(os.Environ(), "GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t", "GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t", "GIT_CONFIG_GLOBAL=/dev/null")
		out, err := cmd.CombinedOutput()
		if err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
		return strings.TrimSpace(string(out))
	}
	write := func(rel, body string) {
		t.Helper()
		p := filepath.Join(dir, rel)
		_ = os.MkdirAll(filepath.Dir(p), 0o755)
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	run("init", "-q", "-b", "main")
	write("go.mod", "module example.com/m\n\ngo 1.22\n")
	write("p/a.go", `package p

// A calls B and C.
func A() int { return B() + C() }

// B is tested.
func B() int {
	return 1
}

func C() int { return 2 }

type T struct{ N int }
`)
	write("p/a_test.go", `package p

import "testing"

func helper() int { return B() }

func TestB(t *testing.T) {
	if helper() != 1 {
		t.Fatal()
	}
}
`)
	write("web/x.ts", "export const x = 1\n")
	run("add", ".")
	run("commit", "-q", "-m", "base")
	run("checkout", "-q", "-b", "feat")
	write("p/a.go", `package p

// A calls B and D.
func A() int { return B() + D() }

// B is tested.
func B() int {
	return 1 + 0
}

type T struct{ N int }

// D is new.
func D() int { return T{N: 3}.N }
`)
	write("web/x.ts", "export const x = 2\n")
	run("commit", "-q", "-am", "feat")
	run("checkout", "-q", "main")
	before = run("rev-parse", "HEAD")
	run("merge", "-q", "--no-ff", "-m", "merge feat", "feat")
	merge = run("rev-parse", "HEAD")
	run("checkout", "-q", "-b", "open")
	write("p/e.go", "package p\n\nfunc E() int { return A() }\n")
	run("add", ".")
	run("commit", "-q", "-m", "open")
	run("checkout", "-q", "main")
	return dir, merge, before
}

func byID(rm *RevMap) map[string]Node {
	m := map[string]Node{}
	for _, n := range rm.Nodes {
		m[n.ID] = n
	}
	return m
}

func hasEdge(rm *RevMap, from, to string) bool {
	for _, e := range rm.Edges {
		if e.From == from && e.To == to && e.Kind == "uses" && e.Source == "go/types" {
			return true
		}
	}
	return false
}

// M1, M2, M3, M4 on a fixture merge: first parent as base, Go definitions
// only, the right change per definition, one hop with uses edges, tests
// through a helper, untested on a changed function no test reaches.
func TestBuildOnMerge(t *testing.T) {
	dir, merge, before := fixtureRepo(t)
	ranges, err := CommitRanges(merge, []Repo{{Dir: dir}})
	if err != nil {
		t.Fatal(err)
	}
	if ranges[0].Base != before || ranges[0].Head != merge {
		t.Fatalf("range %+v, want base %s head %s", ranges[0], before, merge)
	}
	rm, err := Build("init", merge, ranges, GoTypes{}, t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	if rm.Base != before || rm.Head != merge || rm.Version != "0" {
		t.Errorf("revmap base %s head %s version %s", rm.Base, rm.Head, rm.Version)
	}
	nodes := byID(rm)
	const p = "go:example.com/m/p."
	want := map[string]string{p + "A": "modified", p + "B": "modified", p + "C": "deleted", p + "D": "added"}
	for id, ch := range want {
		if nodes[id].Change != ch {
			t.Errorf("%s change %q, want %q", id, nodes[id].Change, ch)
		}
	}
	for _, n := range rm.Nodes {
		if !strings.HasSuffix(n.File, ".go") {
			t.Errorf("node %s from a non-Go file %s", n.ID, n.File)
		}
		if n.Change != "affected" && want[n.ID] == "" {
			t.Errorf("changed node %s (%s) not in the expected list", n.ID, n.Change)
		}
	}
	if n := nodes[p+"T"]; n.Change != "affected" {
		t.Errorf("T (used by D) change %q, want affected", n.Change)
	}
	if !hasEdge(rm, p+"A", p+"D") || !hasEdge(rm, p+"A", p+"B") || !hasEdge(rm, p+"D", p+"T") {
		t.Errorf("missing uses edges: %+v", rm.Edges)
	}
	if hasEdge(rm, p+"A", p+"C") {
		t.Error("an edge from head's A to the deleted C")
	}
	if got := nodes[p+"B"].Evidence.Tests; !slices.Equal(got, []string{"p/a_test.go::TestB"}) {
		t.Errorf("B tests %v", got)
	}
	if !slices.Contains(nodes[p+"D"].Flags, "untested") || slices.Contains(nodes[p+"B"].Flags, "untested") {
		t.Errorf("flags: D %v, B %v", nodes[p+"D"].Flags, nodes[p+"B"].Flags)
	}
	if b := nodes[p+"C"]; b.RangeHead != nil || b.RangeBase == nil || len(b.Flags) != 0 {
		t.Errorf("deleted C: %+v", b)
	}
	if n := nodes[p+"B"]; n.RangeHead == nil || n.RangeHead[0] != 6 || n.Review.State != "unreviewed" || n.Risk != nil || n.Claim != nil {
		t.Errorf("B node %+v", n)
	}
	if rm.Mismatches == nil || rm.Stats.Changed != 4 || rm.Stats.Untested != 2 {
		t.Errorf("stats %+v mismatches %v", rm.Stats, rm.Mismatches)
	}
}

// M6: a card's branch against main's merge base; a card with no branch and
// a branch that does not exist are Missing, naming what is missing.
func TestCardRanges(t *testing.T) {
	dir, merge, _ := fixtureRepo(t)
	rs, err := CardRanges("open-card", "open", []Repo{{Dir: dir}})
	if err != nil {
		t.Fatal(err)
	}
	if rs[0].From != "merge-base main" || rs[0].Base != merge {
		t.Errorf("range %+v, want base %s (main)", rs[0], merge)
	}
	var m *Missing
	if _, err := CardRanges("c", "", []Repo{{Dir: dir}}); !errors.As(err, &m) || !strings.Contains(m.What, "no branch") {
		t.Errorf("no branch: %v", err)
	}
	if _, err := CardRanges("c", "gone", []Repo{{Dir: dir}}); !errors.As(err, &m) || !strings.Contains(m.What, "branch gone of card c does not exist") {
		t.Errorf("gone branch: %v", err)
	}
	if _, err := CommitRanges("nosuch", []Repo{{Dir: dir}}); !errors.As(err, &m) {
		t.Errorf("unknown commit: %v", err)
	}
}

// The review writes nothing into the reviewed repo: no worktree, no file.
func TestBuildLeavesRepoAlone(t *testing.T) {
	dir, merge, _ := fixtureRepo(t)
	ranges, _ := CommitRanges(merge, []Repo{{Dir: dir}})
	if _, err := Build("init", merge, ranges, GoTypes{}, t.TempDir()); err != nil {
		t.Fatal(err)
	}
	out, _ := exec.Command("git", "-C", dir, "status", "--porcelain").Output()
	wt, _ := exec.Command("git", "-C", dir, "worktree", "list").Output()
	if len(out) != 0 || strings.Count(string(wt), "\n") != 1 {
		t.Errorf("repo touched: status %q worktrees %q", out, wt)
	}
}

func TestReposOf(t *testing.T) {
	root := t.TempDir()
	_ = os.MkdirAll(filepath.Join(root, ".git"), 0o755)
	if r := ReposOf(root, "org", nil); len(r) != 1 || r[0].Dir != root {
		t.Errorf("no repos: %+v", r)
	}
	if r := ReposOf(root, "org", []string{"org"}); len(r) != 1 || r[0].Dir != root {
		t.Errorf("own name: %+v", r)
	}
	if r := ReposOf(root, "org", []string{"a", "b"}); len(r) != 2 || r[1].Name != "b" || r[1].Dir != filepath.Join(root, "b") {
		t.Errorf("two repos: %+v", r)
	}
}
