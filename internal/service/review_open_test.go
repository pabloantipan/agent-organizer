package service

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"

	"organizer/internal/model"
	"organizer/internal/review"
)

// realStart is the editor start OpenReviewAt uses, kept before any stub.
var realStart = startEditor

// stubEditor records every argv instead of starting an editor.
func stubEditor(t *testing.T) *[][]string {
	t.Helper()
	var got [][]string
	orig := startEditor
	startEditor = func(argv []string) error { got = append(got, argv); return nil }
	t.Cleanup(func() { startEditor = orig })
	return &got
}

// writeMap puts a map of card at head where ReviewStatus finds it, as a
// make would.
func writeMap(t *testing.T, id, card, base, head string) {
	t.Helper()
	b, _ := json.Marshal(review.RevMap{Initiative: id, Target: card, Base: base, Head: head})
	p := review.DefaultPath(id, head)
	if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(p, b, 0o644); err != nil {
		t.Fatal(err)
	}
}

// E1: the checkout is the card's worktree at the head, else the root at
// the head; neither is refused naming the short sha; a path out of the
// checkout and another machine's card are refused. None opens anything.
func TestOpenReviewAt(t *testing.T) {
	s, root := reviewFixture(t, "ok")
	got := stubEditor(t)
	s.cfg.Editor = "code"
	head := gitIn(t, root, "rev-parse", "c1")
	writeMap(t, "rv", "c1", gitIn(t, root, "rev-parse", "main"), head)
	// os.TempDir is a symlink on macOS; git reports the resolved path
	real, _ := filepath.EvalSymlinks(root)

	open := func() (string, error) {
		*got = nil
		err := s.OpenReviewAt("rv", "c1", "p/a.go", 3)
		if len(*got) == 0 {
			return "", err
		}
		return (*got)[0][len((*got)[0])-1], err
	}
	checkout := func() string {
		st, err := s.ReviewStatus("rv", "c1")
		if err != nil {
			t.Fatal(err)
		}
		if len(st.Checkouts) != 1 {
			t.Fatalf("checkouts %+v", st.Checkouts)
		}
		return st.Checkouts[0].Dir
	}

	// neither: main is checked out at the root and there is no worktree
	if arg, err := open(); err == nil || err.Error() != head[:7]+" is not checked out here" || arg != "" {
		t.Errorf("neither: %q %v", arg, err)
	}
	if d := checkout(); d != "" {
		t.Errorf("status checkout with neither: %q", d)
	}

	// the root at the head, no worktree
	gitIn(t, root, "checkout", "-q", "c1")
	if arg, err := open(); err != nil || arg != filepath.Join(root, "p/a.go")+":3" {
		t.Errorf("root: %q %v", arg, err)
	}
	if d := checkout(); d != root {
		t.Errorf("status checkout at the root: %q", d)
	}
	gitIn(t, root, "checkout", "-q", "main")

	// a worktree at the head comes first
	wt := filepath.Join(root, ".wt", "c1")
	gitIn(t, real, "worktree", "add", "-q", wt, "c1")
	if arg, err := open(); err != nil || arg != filepath.Join(wt, "p/a.go")+":3" {
		t.Errorf("worktree: %q %v", arg, err)
	}
	if d := checkout(); d != wt {
		t.Errorf("status checkout in the worktree: %q", d)
	}
	if !reflect.DeepEqual((*got)[0][:2], []string{"code", "-g"}) {
		t.Errorf("argv %v", (*got)[0])
	}

	// a path out of the checkout
	for _, p := range []string{"../x", "/etc/passwd", "p/../../x", ""} {
		*got = nil
		if err := s.OpenReviewAt("rv", "c1", p, 1); err == nil || len(*got) != 0 {
			t.Errorf("%q: %v, opened %v", p, err, *got)
		}
	}
	// a link inside the worktree pointing out of it
	if err := os.Symlink("/etc", filepath.Join(wt, "out")); err != nil {
		t.Fatal(err)
	}
	*got = nil
	if err := s.OpenReviewAt("rv", "c1", "out/passwd", 1); err == nil || !strings.Contains(err.Error(), "outside") || len(*got) != 0 {
		t.Errorf("link out: %v, opened %v", err, *got)
	}

	// another machine's card
	s.mu.Lock()
	s.state.Remote = []model.Snapshot{{Machine: "odyssey", Initiatives: []model.ScannedInitiative{
		{Initiative: model.Initiative{ID: "rv"}, Cards: []model.Card{{Slug: "far"}}},
	}}}
	s.mu.Unlock()
	*got = nil
	if err := s.OpenReviewAt("rv", "far", "p/a.go", 1); err == nil || !strings.Contains(err.Error(), "odyssey") || len(*got) != 0 {
		t.Errorf("remote card: %v, opened %v", err, *got)
	}
}

// E2: {file} and {line} where the editor carries them; else code and
// cursor take -g file:line and any other editor the file alone.
func TestEditorCommand(t *testing.T) {
	for _, c := range []struct {
		editor string
		want   []string
	}{
		{"code", []string{"code", "-g", "f:12"}},
		{"cursor", []string{"cursor", "-g", "f:12"}},
		{"vim", []string{"vim", "f"}},
		{"subl {file}:{line}", []string{"subl", "f:12"}},
		{"", []string{"code", "-g", "f:12"}},
		{"/usr/local/bin/code --reuse-window", []string{"/usr/local/bin/code", "--reuse-window", "-g", "f:12"}},
		{"nvim +{line}", []string{"nvim", "+12", "f"}},
	} {
		if got := editorCommand(c.editor, "f", 12); !reflect.DeepEqual(got, c.want) {
			t.Errorf("%q: %v, want %v", c.editor, got, c.want)
		}
	}
}

// S2 (leftovers-43 FR-2): the editor is waited on up to editorWait. A
// non-zero exit in that time says its first stderr line; one still running,
// or exiting 0, opened. None of these is an editor.
func TestStartEditorWaits(t *testing.T) {
	for _, c := range []struct {
		argv []string
		want string
	}{
		{[]string{"sh", "-c", "echo nope >&2; exit 1"}, "editor didn't open: nope"},
		{[]string{"sh", "-c", "printf '\\n  \\n' >&2; echo first >&2; echo second >&2; exit 2"}, "editor didn't open: first"},
		{[]string{"sleep", "5"}, ""},
		{[]string{"true"}, ""},
		{[]string{"sh", "-c", "exit 3"}, "editor didn't open: exit status 3"},
		{[]string{"/nonexistent/editor"}, "editor didn't open: "},
	} {
		start := time.Now()
		err := realStart(c.argv)
		took := time.Since(start)
		switch {
		case c.want == "" && err != nil:
			t.Errorf("%v: %v, want opened", c.argv, err)
		case c.want != "" && (err == nil || !strings.HasPrefix(err.Error(), c.want)):
			t.Errorf("%v: %v, want %q", c.argv, err, c.want)
		}
		if took > 2500*time.Millisecond {
			t.Errorf("%v took %v, want under 2.5 s", c.argv, took)
		}
		if c.want != "" && strings.Contains(fmt.Sprint(err), "Error:") {
			t.Errorf("%v: %v says Error:", c.argv, err)
		}
	}
}

// S2: OpenReviewAt answers what the editor answered, word for word.
func TestOpenReviewAtEditorFails(t *testing.T) {
	s, root := reviewFixture(t, "ok")
	head := gitIn(t, root, "rev-parse", "c1")
	writeMap(t, "rv", "c1", gitIn(t, root, "rev-parse", "main"), head)
	gitIn(t, root, "checkout", "-q", "c1")
	s.cfg.Editor = "code"
	orig := startEditor
	t.Cleanup(func() { startEditor = orig })
	var argv []string
	startEditor = func(a []string) error { argv = a; return realStart([]string{"sh", "-c", "echo nope >&2; exit 1"}) }
	if err := s.OpenReviewAt("rv", "c1", "p/a.go", 3); err == nil || err.Error() != "editor didn't open: nope" {
		t.Errorf("failing editor: %v", err)
	}
	if len(argv) == 0 || argv[0] != "code" {
		t.Errorf("argv %v", argv)
	}
}
