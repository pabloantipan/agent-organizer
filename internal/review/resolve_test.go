package review

import (
	"errors"
	"strings"
	"testing"
)

// D1 (FR-13): a card whose branch is gone resolves to the newest
// `merge: <slug> ` or `merge: <slug>(` on main's first parent, as a commit
// against its first parent; a branch that exists wins over a merge; a
// longer slug sharing the prefix does not
// count; a card with neither is Missing naming both.
func TestCardRangesMerged(t *testing.T) {
	f := fixture{t: t, dir: t.TempDir()}
	f.git("init", "-q", "-b", "main")
	f.write("go.mod", "module example.com/m\n\ngo 1.22\n")
	f.write("p/a.go", "package p\n\nfunc A() int { return 1 }\n")
	f.git("add", ".")
	f.git("commit", "-q", "-m", "base")
	merge := func(branch, subject, body string) string {
		f.git("checkout", "-q", "-b", branch)
		f.write("p/a.go", "package p\n\nfunc A() int { return "+body+" }\n")
		f.git("commit", "-q", "-am", branch)
		f.git("checkout", "-q", "main")
		f.git("merge", "-q", "--no-ff", "-m", subject, branch)
		f.git("branch", "-q", "-D", branch)
		return f.git("rev-parse", "HEAD")
	}
	old := merge("c1", "merge: c1 (first try)", "2")
	newer := merge("c1b", "merge: c1(second)", "3")
	_ = merge("c1-x", "merge: c1-x (another card)", "4")
	paren := f.git("rev-parse", newer+"^1")
	if old == newer {
		t.Fatal("fixture")
	}
	repos := []Repo{{Dir: f.dir}}

	rs, err := CardRanges("c1", "c1", repos)
	if err != nil {
		t.Fatal(err)
	}
	if len(rs) != 1 || rs[0].Head != newer || rs[0].Base != paren || !strings.HasSuffix(rs[0].From, "first parent") {
		t.Errorf("merged card: %+v, want %s^1..%s", rs, newer, newer)
	}
	if rs, err := CardRanges("c1", "", repos); err != nil || rs[0].Head != newer {
		t.Errorf("no branch field, merged: %+v %v", rs, err)
	}

	f.git("branch", "-q", "c1", old)
	if rs, err := CardRanges("c1", "c1", repos); err != nil || rs[0].Head != old || rs[0].From != "merge-base main" {
		t.Errorf("branch present: %+v %v, want the branch", rs, err)
	}

	var m *Missing
	_, err = CardRanges("c9", "c9", repos)
	if !errors.As(err, &m) || !strings.Contains(m.What, "branch c9 of card c9 does not exist") || !strings.Contains(m.What, `has the subject "merge: c9" followed by the end of the subject or any character that cannot be in a slug (not a-z, 0-9, -)`) {
		t.Errorf("neither: %v", err)
	}
	if _, err := CardRanges("c", "", repos); !errors.As(err, &m) || !strings.Contains(m.What, "card c has no branch: field, and no commit") {
		t.Errorf("no branch field, not merged: %v", err)
	}
	if _, err := CardRanges("c1-", "", repos); !errors.As(err, &m) {
		t.Errorf("c1- matched another card's merge: %v", err)
	}
}

// M1 (leftovers-45 FR-1): a merge subject is the card's when the slug is
// followed by the end or a character no slug has; a longer slug is not.
func TestIsMergeOf(t *testing.T) {
	for subject, want := range map[string]bool{
		"merge: x, y":  true,
		"merge: x/y":   true,
		"merge: x":     true,
		"merge: x-2 y": false,
		"merge: x2":    false,
		"merge: xy":    false,
		"merge:x":      false,
	} {
		if got := isMergeOf(subject, "x"); got != want {
			t.Errorf("isMergeOf(%q, x) = %v, want %v", subject, got, want)
		}
	}
	if !isMergeOf("merge: lf44-ask-survives, an ask", "lf44-ask-survives") || isMergeOf("merge: lf44-ask-survives-2 (x)", "lf44-ask-survives") {
		t.Error("lf44-ask-survives")
	}
}

// M1 over git: the four subjects of the gate, each the only merge of a
// repo, for slug x; the first three resolve to their merge, the last is
// Missing.
func TestCardRangesMergeSubjects(t *testing.T) {
	for subject, resolves := range map[string]bool{
		"merge: x, y":  true,
		"merge: x/y":   true,
		"merge: x":     true,
		"merge: x-2 y": false,
	} {
		f := fixture{t: t, dir: t.TempDir()}
		f.git("init", "-q", "-b", "main")
		f.write("a.txt", "1\n")
		f.git("add", ".")
		f.git("commit", "-q", "-m", "base")
		f.git("checkout", "-q", "-b", "b")
		f.write("a.txt", "2\n")
		f.git("commit", "-q", "-am", "b")
		f.git("checkout", "-q", "main")
		f.git("merge", "-q", "--no-ff", "-m", subject, "b")
		f.git("branch", "-q", "-D", "b")
		head := f.git("rev-parse", "HEAD")
		rs, err := CardRanges("x", "x", []Repo{{Dir: f.dir}})
		var m *Missing
		switch {
		case resolves && (err != nil || len(rs) != 1 || rs[0].Head != head || rs[0].Base != f.git("rev-parse", head+"^1")):
			t.Errorf("%q: %+v %v, want %s^1..%s", subject, rs, err, head, head)
		case !resolves && !errors.As(err, &m):
			t.Errorf("%q resolved x: %+v %v", subject, rs, err)
		}
	}
}
