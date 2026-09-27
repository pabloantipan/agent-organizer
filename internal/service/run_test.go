package service

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"organizer/internal/cache"
	"organizer/internal/model"
)

func TestLaunchDir(t *testing.T) {
	root := t.TempDir()
	for _, d := range []string{".wt/run-gate", ".wt/organizer-legacy"} {
		if err := os.MkdirAll(filepath.Join(root, d), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	tests := []struct {
		name string
		card model.Card
		want string
	}{
		{"worktree named after the branch", model.Card{Slug: "x", Branch: "run-gate"}, ".wt/run-gate"},
		{"worktree named after the slug", model.Card{Slug: "run-gate", Branch: "none"}, ".wt/run-gate"},
		{"worktree named repo-slug", model.Card{Slug: "legacy", Branch: "none", Repos: []string{"organizer"}}, ".wt/organizer-legacy"},
		{"no worktree falls back to the root", model.Card{Slug: "other", Branch: "feat/other"}, ""},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			want := root
			if tt.want != "" {
				want = filepath.Join(root, tt.want)
			}
			if got := launchDir(root, tt.card); got != want {
				t.Errorf("launchDir = %q, want %q", got, want)
			}
		})
	}
}

func TestHeadBranch(t *testing.T) {
	repo := t.TempDir()
	gitDir := filepath.Join(repo, ".git")
	if err := os.MkdirAll(gitDir, 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(path, body string) {
		t.Helper()
		if err := os.WriteFile(path, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write(filepath.Join(gitDir, "HEAD"), "ref: refs/heads/crew-and-context\n")

	// A directory deep inside the checkout still finds it.
	deep := filepath.Join(repo, "internal", "cli")
	if err := os.MkdirAll(deep, 0o755); err != nil {
		t.Fatal(err)
	}
	if got := headBranch(deep); got != "crew-and-context" {
		t.Errorf("headBranch(deep) = %q", got)
	}

	// A worktree points at its git dir with a file, not a directory.
	wt := t.TempDir()
	wtGit := filepath.Join(repo, "worktrees", "run-gate")
	if err := os.MkdirAll(wtGit, 0o755); err != nil {
		t.Fatal(err)
	}
	write(filepath.Join(wtGit, "HEAD"), "ref: refs/heads/run-gate\n")
	write(filepath.Join(wt, ".git"), "gitdir: "+wtGit+"\n")
	if got := headBranch(wt); got != "run-gate" {
		t.Errorf("headBranch(worktree) = %q, want run-gate", got)
	}

	// A detached HEAD names no card.
	write(filepath.Join(gitDir, "HEAD"), "eb47adda26b3ecb8830f2c1a5d03c907a6c087c6\n")
	if got := headBranch(repo); got != "" {
		t.Errorf("detached HEAD = %q, want empty", got)
	}
	if got := headBranch(t.TempDir()); got != "" {
		t.Errorf("no checkout = %q, want empty", got)
	}
}

// The session-length warning reads the one ceiling and says what probe does:
// it refuses a name over zellij's socket budget, it never truncates one.
func TestPrepareLaunchWarnsOnlyOverTheSessionCeiling(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	card := func(slug string) model.Card {
		return model.Card{Slug: slug, Spec: "s", Gate: "g", Boundary: []string{"b"}}
	}
	long := "a-card-slug-long-enough-to-overflow-the-socket-budget-x" // organizer-probe- + 55 = 71
	si := model.ScannedInitiative{}
	si.ID, si.Path = "organizer", t.TempDir()
	si.Cards = []model.Card{card("redesign-goal-stages"), card(long)}
	s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}}

	lengthWarnings := func(slug string) []string {
		t.Helper()
		l, err := s.PrepareLaunch("organizer", slug)
		if err != nil {
			t.Fatal(err)
		}
		var out []string
		for _, w := range l.Warnings {
			if strings.Contains(w, "characters") {
				out = append(out, w)
			}
		}
		return out
	}
	if w := lengthWarnings("redesign-goal-stages"); len(w) != 0 {
		t.Errorf("organizer-probe-redesign-goal-stages fits, got %v", w)
	}
	w := lengthWarnings(long)
	if len(w) != 1 || !strings.Contains(w[0], "is 71 characters; zellij holds at most 68") || !strings.Contains(w[0], "probe refuses it") {
		t.Errorf("warnings %v, want the length, the ceiling and that probe refuses", w)
	}
	if len(w) == 1 && strings.Contains(w[0], "truncat") {
		t.Errorf("probe does not truncate: %q", w[0])
	}
}
