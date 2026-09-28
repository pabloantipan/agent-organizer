package service

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/model"
	"organizer/internal/session"
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

// G6: the app's runs for one initiative sum input tokens per card over the
// archive and the sessions still running — and carry no dollar figure, which
// decision 0020 keeps in `organizer runs`. Everything reads from a temp
// XDG_DATA_HOME, so the real runs.jsonl is neither read nor written.
func TestInitiativeRunsSumsTokensPerCard(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	root := t.TempDir()
	worktree := filepath.Join(root, ".wt", "redesign-runs-binding")
	if err := os.MkdirAll(worktree, 0o755); err != nil {
		t.Fatal(err)
	}
	si := model.ScannedInitiative{}
	si.ID, si.Path = "organizer", root
	si.Cards = []model.Card{
		{Slug: "redesign-runs-binding", Branch: "redesign-runs-binding"},
		{Slug: "retire-keeps-the-cell", Branch: "retire-keeps-the-cell"},
	}
	other := model.ScannedInitiative{}
	other.ID, other.Path = "agent-slack", t.TempDir()
	s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si, other}}}}

	day := func(d int) time.Time { return time.Date(2026, 9, d, 10, 0, 0, 0, time.UTC) }
	archived := []session.Run{
		// Two finished runs on the card.
		{PID: 1, SessionID: "s1", Cwd: worktree, Model: "opus", InputTokens: 12_000, WindowSize: 200_000,
			CostUSD: 1.5, Initiative: "organizer", Card: "redesign-runs-binding", Branch: "redesign-runs-binding",
			FirstSeen: day(20), LastSeen: day(21), Ended: true},
		{PID: 2, SessionID: "s2", Cwd: worktree, Model: "opus", InputTokens: 30_000, WindowSize: 200_000,
			CostUSD: 4.25, Initiative: "organizer", Card: "redesign-runs-binding", Branch: "redesign-runs-binding",
			FirstSeen: day(22), LastSeen: day(23), Ended: true},
		// The open line of the session that is still running: stale numbers the
		// live record must replace, not be added to.
		{PID: 3, SessionID: "s3", Cwd: worktree, Model: "opus", InputTokens: 5_000, WindowSize: 200_000,
			CostUSD: 0.4, Initiative: "organizer", Card: "redesign-runs-binding", Branch: "redesign-runs-binding",
			FirstSeen: day(25), LastSeen: day(25)},
		// Another initiative's run is not this initiative's business.
		{PID: 4, SessionID: "s4", Cwd: other.Path, Model: "opus", InputTokens: 99_000,
			Initiative: "agent-slack", Card: "cell-pause", FirstSeen: day(24), LastSeen: day(24), Ended: true},
	}
	if err := session.AppendRuns(session.RunsPath(), archived); err != nil {
		t.Fatal(err)
	}
	live := session.Record{PID: 3, SessionID: "s3", Session: "organizer-probe-sup2", Cwd: worktree,
		Model: "opus", UsedPercent: 20, InputTokens: 40_000, WindowSize: 200_000, CostUSD: 6.75,
		UpdatedAt: day(26)}
	if err := session.Write(session.Dir(), live); err != nil {
		t.Fatal(err)
	}

	view := s.InitiativeRuns("organizer")
	const want = 12_000 + 30_000 + 40_000
	if view.Initiative != "organizer" || view.InputTokens != want {
		t.Errorf("view = %q %d tokens, want organizer %d", view.Initiative, view.InputTokens, want)
	}
	if len(view.Cards) != 1 {
		t.Fatalf("cards = %+v, want one (the other initiative's run filtered out)", view.Cards)
	}
	c := view.Cards[0]
	if c.Card != "redesign-runs-binding" || c.InputTokens != want {
		t.Errorf("card %q = %d tokens, want redesign-runs-binding %d", c.Card, c.InputTokens, want)
	}
	if len(c.Runs) != 3 || c.Live != 1 {
		t.Fatalf("runs = %d (%d live), want 3 folded runs, one live", len(c.Runs), c.Live)
	}
	// Newest last-seen first, and the live session's numbers are the record's
	// while its start is the one the archive remembers.
	r := c.Runs[0]
	if !r.Live || r.SessionID != "s3" || r.InputTokens != 40_000 || r.Ended {
		t.Errorf("newest run = %+v, want the live s3 at 40000 tokens", r)
	}
	if !r.FirstSeen.Equal(day(25)) || !r.LastSeen.Equal(day(26)) {
		t.Errorf("live run seen %s..%s, want %s..%s", r.FirstSeen, r.LastSeen, day(25), day(26))
	}

	// 0020: no dollar figure crosses into the app, whatever the archive holds.
	b, err := json.Marshal(view)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(strings.ToLower(string(b)), "cost") {
		t.Errorf("the bound view names a cost: %s", b)
	}
}

// A card of an initiative with a cell launches under the cell's wrapper:
// caro-stuff's cell is `caro`, so caro-probe, never caro-stuff-probe.
func TestPrepareLaunchUsesTheCellFamily(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	card := model.Card{Slug: "tr2-fix", Spec: "s", Gate: "g", Boundary: []string{"b"}}
	withCell := model.ScannedInitiative{}
	withCell.ID, withCell.Path = "caro-stuff", t.TempDir()
	withCell.Cell = &model.Cell{Project: "caro"}
	withCell.Cards = []model.Card{card}
	noCell := model.ScannedInitiative{}
	noCell.ID, noCell.Path = "qa-automation", t.TempDir()
	noCell.Cards = []model.Card{card}
	s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{withCell, noCell}}}}

	for id, want := range map[string]string{"caro-stuff": "/caro-probe'", "qa-automation": "/qa-automation-probe'"} {
		l, err := s.PrepareLaunch(id, "tr2-fix")
		if err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(l.Command, want) {
			t.Errorf("%s: command %q, want the wrapper %q", id, l.Command, want)
		}
	}
}
