package scan

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/model"
)

func fixtureHome(t *testing.T) string {
	t.Helper()
	p, err := filepath.Abs(filepath.Join("..", "..", "testdata", "home"))
	if err != nil {
		t.Fatal(err)
	}
	return p
}

func opts(home string) Options {
	return Options{
		Roots:      []string{home, filepath.Join(home, "work")},
		MaxDepth:   3,
		IgnoreDirs: []string{"node_modules"},
		Now:        func() time.Time { return time.Date(2026, 9, 2, 12, 0, 0, 0, time.UTC) },
	}
}

func TestDiscoverSkipsTrapsAndDedupes(t *testing.T) {
	home := fixtureHome(t)
	roots, problems := Discover(opts(home))
	if len(problems) != 0 {
		t.Fatalf("problems: %+v", problems)
	}
	want := []string{filepath.Join(home, "init-a"), filepath.Join(home, "work", "init-b")}
	if len(roots) != len(want) {
		t.Fatalf("roots=%v want %v", roots, want)
	}
	for i := range want {
		if roots[i] != want[i] {
			t.Errorf("roots[%d]=%s want %s", i, roots[i], want[i])
		}
	}
}

func TestDiscoverReportsMissingRoot(t *testing.T) {
	o := opts(fixtureHome(t))
	o.Roots = append(o.Roots, "/definitely/not/here")
	_, problems := Discover(o)
	if len(problems) != 1 {
		t.Fatalf("want 1 problem, got %+v", problems)
	}
}

func TestReadInitiativeCardsOrderAndProblems(t *testing.T) {
	home := fixtureHome(t)
	si := ReadInitiative(filepath.Join(home, "init-a"), opts(home))

	if si.ID != "init-a" || si.Client != "acme" || len(si.RepoStates) != 0 {
		t.Fatalf("initiative: %+v", si.Initiative)
	}
	var order []string
	for _, c := range si.Cards {
		order = append(order, c.Slug+":"+c.Status)
	}
	// now, blocked, next (newest updated first within status), then unknown, then archived
	want := []string{"alpha:now", "gamma:blocked", "beta:next", "nonext:next", "broken:", "old:done"}
	if len(order) != len(want) {
		t.Fatalf("order=%v", order)
	}
	for i := range want {
		if order[i] != want[i] {
			t.Errorf("order[%d]=%s want %s (full %v)", i, order[i], want[i], order)
		}
	}
	n, b, x := si.Counts()
	if n != 1 || b != 1 || x != 2 {
		t.Errorf("counts now=%d blocked=%d next=%d", n, b, x)
	}
	msgs := map[string]bool{}
	for _, p := range si.Problems {
		msgs[filepath.Base(p.Path)+"|"+p.Msg] = true
	}
	for _, want := range []string{
		"broken.md|no frontmatter: file must start with ---",
		"nonext.md|open card without next action",
	} {
		if !msgs[want] {
			t.Errorf("missing problem %q in %v", want, msgs)
		}
	}
	if si.Target != "2026-10-01" || len(si.Milestones) != 2 || si.Milestones[0].Title != "QA sign-off" {
		t.Errorf("planning dates: target=%q milestones=%+v", si.Target, si.Milestones)
	}
	for _, c := range si.Cards {
		if c.Slug == "alpha" && c.Due != "2026-09-12" {
			t.Errorf("alpha due=%q", c.Due)
		}
	}
	if si.LastUpdated().Format("2006-01-02") != "2026-09-01" {
		t.Errorf("last updated %s", si.LastUpdated())
	}
	for _, c := range si.Cards {
		if c.Slug == "alpha" && c.Body == "" {
			t.Error("alpha body should be kept")
		}
		if c.Slug == "old" && !c.Archived {
			t.Error("old should be archived")
		}
	}
}

func TestRunCollectsAll(t *testing.T) {
	home := fixtureHome(t)
	snap := Run(opts(home))
	if len(snap.Initiatives) != 2 {
		t.Fatalf("got %d initiatives", len(snap.Initiatives))
	}
	if snap.ScannedAt.Year() != 2026 {
		t.Error("ScannedAt should come from Options.Now")
	}
}

func TestGitStateOnRealRepo(t *testing.T) {
	if _, err := exec.LookPath("git"); err != nil {
		t.Skip("git not installed")
	}
	dir := t.TempDir()
	repo := filepath.Join(dir, "r")
	run := func(args ...string) {
		t.Helper()
		cmd := exec.Command("git", append([]string{"-C", repo}, args...)...)
		cmd.Env = append(os.Environ(), "GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t", "GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t")
		if out, err := cmd.CombinedOutput(); err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
	}
	if err := os.MkdirAll(repo, 0o755); err != nil {
		t.Fatal(err)
	}
	run("init", "-q", "-b", "work")
	if err := os.WriteFile(filepath.Join(repo, "a.txt"), []byte("a"), 0o644); err != nil {
		t.Fatal(err)
	}
	run("add", "a.txt")
	run("commit", "-q", "-m", "one")
	if err := os.WriteFile(filepath.Join(repo, "b.txt"), []byte("b"), 0o644); err != nil {
		t.Fatal(err)
	}

	// a feature branch with two commits on top of the work branch, for branchSpans
	run("checkout", "-q", "-b", "feat/x")
	if err := os.WriteFile(filepath.Join(repo, "c.txt"), []byte("c"), 0o644); err != nil {
		t.Fatal(err)
	}
	run("add", "c.txt")
	run("commit", "-q", "-m", "two", "--date=2026-01-05T10:00:00")
	run("checkout", "-q", "work")
	cards := []model.Card{
		{Slug: "x", Status: "now", Branch: "feat/x", Repos: []string{"nope", "r"}},
		{Slug: "m", Status: "now", Branch: "work", Repos: []string{"r"}},
		{Slug: "d", Status: "done", Branch: "feat/x", Repos: []string{"r"}},
	}
	branchSpans(dir, cards, 5*time.Second)
	if cards[0].BranchStart == "" || cards[0].BranchLast == "" {
		t.Errorf("feat/x span not found: %+v", cards[0])
	}
	if cards[1].BranchStart == "" {
		t.Errorf("work is not main, so its own history is the span: %+v", cards[1])
	}
	if cards[2].BranchStart != "" {
		t.Error("done cards are skipped")
	}

	states := gitStates(dir, []string{"r", "nope"}, 5*time.Second)
	if states[0].Branch != "work" || states[0].Dirty != 1 || states[0].LastCommit == "" || states[0].Missing {
		t.Errorf("repo state: %+v", states[0])
	}
	if !states[1].Missing {
		t.Errorf("missing repo should be flagged: %+v", states[1])
	}
	_ = model.StatusNow
}

func TestCardThreadsAreReadAndValidated(t *testing.T) {
	home := fixtureHome(t)
	si := ReadInitiative(filepath.Join(home, "init-a"), opts(home))

	var alpha *model.Card
	for i := range si.Cards {
		if si.Cards[i].Slug == "alpha" {
			alpha = &si.Cards[i]
		}
	}
	if alpha == nil {
		t.Fatal("alpha card missing from the fixture")
	}
	if len(alpha.Threads) != 1 || alpha.Threads[0] != "01M1N893SRYKX2F6H6G9WCCCMA" {
		t.Errorf("threads=%v", alpha.Threads)
	}
	if alpha.ThreadState != nil {
		t.Error("thread state is resolved against the live cell, never by the scan")
	}
}

func TestValidULID(t *testing.T) {
	cases := []struct {
		in   string
		want bool
	}{
		{"01M1N893SRYKX2F6H6G9WCCCMA", true},
		{"", false},
		{"not-a-ulid", false},
		{"01M1N893SRYKX2F6H6G9WCCCM", false},   // 25 chars
		{"01M1N893SRYKX2F6H6G9WCCCMAB", false}, // 27 chars
		{"01M1N893SRYKX2F6H6G9WCCCMI", false},  // I is not in Crockford base32
		{"01m1n893srykx2f6h6g9wcccma", false},  // lowercase
	}
	for _, c := range cases {
		if got := validULID(c.in); got != c.want {
			t.Errorf("validULID(%q)=%v want %v", c.in, got, c.want)
		}
	}
}

func TestReadCardBuildFields(t *testing.T) {
	home := fixtureHome(t)
	si := ReadInitiative(filepath.Join(home, "init-a"), opts(home))

	byslug := map[string]model.Card{}
	for _, c := range si.Cards {
		byslug[c.Slug] = c
	}
	alpha, ok := byslug["alpha"]
	if !ok {
		t.Fatal("alpha card not read")
	}
	tests := []struct {
		field string
		got   string
		want  string
	}{
		{"depends_on", strings.Join(alpha.DependsOn, ","), "beta"},
		{"boundary", strings.Join(alpha.Boundary, ","), "repo-one/src/,repo-one/README.md"},
		{"spec", alpha.Spec, "docs/alpha.md#shape"},
		{"gate", alpha.Gate, "go test ./... green and the golden refreshed"},
		{"review", alpha.Review, "tech lead reads the diff before merge"},
	}
	for _, tt := range tests {
		if tt.got != tt.want {
			t.Errorf("alpha %s = %q, want %q", tt.field, tt.got, tt.want)
		}
	}
	if m := alpha.MissingLaunchFields(); len(m) != 0 {
		t.Errorf("alpha should be launchable, missing %v", m)
	}
	// A card without the build fields is the common case and stays legal.
	if m := byslug["gamma"].MissingLaunchFields(); len(m) != 3 {
		t.Errorf("gamma missing = %v, want all three", m)
	}
}
