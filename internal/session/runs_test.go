package session

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func cardFixtures() []CardRef {
	return []CardRef{
		{Initiative: "organizer", Slug: "run-gate", Branch: "run-gate", Root: "/home/p/organizer"},
		{Initiative: "organizer", Slug: "crew", Branch: "crew-and-context", Root: "/home/p/organizer"},
		{Initiative: "organizer", Slug: "polish", Branch: "crew-and-context", Root: "/home/p/organizer"},
		{Initiative: "slack", Slug: "ui", Branch: "ui", Root: "/home/p/organizer/agent-slack"},
	}
}

func TestMatchCard(t *testing.T) {
	tests := []struct {
		name   string
		cwd    string
		branch string
		want   string // "<initiative>/<slug>", empty for no match
	}{
		{"worktree named after the branch", "/home/p/organizer/.wt/run-gate", "", "organizer/run-gate"},
		{"deeper inside the worktree", "/home/p/organizer/.wt/run-gate/internal/cli", "", "organizer/run-gate"},
		{"two cards on one branch is not a match", "/home/p/organizer", "crew-and-context", ""},
		{"branch of the checkout", "/home/p/organizer", "run-gate", "organizer/run-gate"},
		{"path beats branch", "/home/p/organizer/.wt/run-gate", "crew-and-context", "organizer/run-gate"},
		{"longest root wins", "/home/p/organizer/agent-slack/.wt/ui", "", "slack/ui"},
		{"no card claims it", "/home/p/organizer", "", ""},
		{"outside every root", "/tmp/scratch", "run-gate", ""},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c, ok := MatchCard(tt.cwd, tt.branch, cardFixtures())
			got := ""
			if ok {
				got = c.Initiative + "/" + c.Slug
			}
			if got != tt.want {
				t.Errorf("MatchCard(%q, %q) = %q, want %q", tt.cwd, tt.branch, got, tt.want)
			}
		})
	}
}

func writeRecord(t *testing.T, dir string, r Record) {
	t.Helper()
	if err := Write(dir, r); err != nil {
		t.Fatal(err)
	}
}

func TestRetireArchivesBeforePruning(t *testing.T) {
	dir := t.TempDir()
	runs := filepath.Join(t.TempDir(), "runs.jsonl")
	t0 := time.Date(2026, 9, 6, 10, 0, 0, 0, time.UTC)

	live := Record{PID: 100, SessionID: "s-live", Session: "organizer-probe-run-gate",
		Cwd: "/home/p/organizer/.wt/run-gate", Model: "Opus 5", UsedPercent: 12,
		InputTokens: 120000, WindowSize: 1000000, CostUSD: 3.5, UpdatedAt: t0}
	writeRecord(t, dir, live)

	// First pass: the process is alive, so nothing is retired, but the run is
	// opened so its first_seen survives the pid's death.
	n, err := Retire(dir, runs, map[int]bool{100: true}, 2*time.Minute, t0.Add(time.Second), cardFixtures(), nil)
	if err != nil || n != 0 {
		t.Fatalf("first pass: retired %d, err %v", n, err)
	}
	got := LoadRuns(runs)
	if len(got) != 1 || got[0].Ended || got[0].Card != "run-gate" || got[0].Initiative != "organizer" {
		t.Fatalf("after open: %+v", got)
	}
	if !got[0].FirstSeen.Equal(t0) {
		t.Errorf("first_seen = %v, want %v", got[0].FirstSeen, t0)
	}

	// The session keeps working; the statusline rewrites the record.
	t1 := t0.Add(90 * time.Minute)
	final := live
	final.UsedPercent, final.InputTokens, final.CostUSD, final.UpdatedAt = 58, 580000, 41.25, t1
	writeRecord(t, dir, final)

	// Second pass: the process is gone and past the grace, so the run is
	// closed with its final values and the record is pruned.
	n, err = Retire(dir, runs, map[int]bool{}, 2*time.Minute, t1.Add(5*time.Minute), cardFixtures(), nil)
	if err != nil || n != 1 {
		t.Fatalf("second pass: retired %d, err %v", n, err)
	}
	if _, err := os.Stat(filepath.Join(dir, "100.json")); !os.IsNotExist(err) {
		t.Error("record should be gone after it was archived")
	}
	got = LoadRuns(runs)
	if len(got) != 1 {
		t.Fatalf("folded to %d runs, want 1: %+v", len(got), got)
	}
	r := got[0]
	checks := []struct {
		name string
		ok   bool
	}{
		{"ended", r.Ended},
		{"first seen kept", r.FirstSeen.Equal(t0)},
		{"last seen final", r.LastSeen.Equal(t1)},
		{"wall", r.Wall() == 90*time.Minute},
		{"final context", r.UsedPercent == 58},
		{"final cost", r.CostUSD == 41.25},
		{"card", r.Card == "run-gate"},
		{"session", r.Session == "organizer-probe-run-gate"},
		{"model", r.Model == "Opus 5"},
	}
	for _, c := range checks {
		if !c.ok {
			t.Errorf("%s wrong: %+v", c.name, r)
		}
	}
}

func TestRetireKeepsYoungRecordsAndDoesNotDuplicate(t *testing.T) {
	dir := t.TempDir()
	runs := filepath.Join(t.TempDir(), "runs.jsonl")
	t0 := time.Date(2026, 9, 6, 10, 0, 0, 0, time.UTC)
	writeRecord(t, dir, Record{PID: 7, SessionID: "young", Cwd: "/tmp/x", UpdatedAt: t0})

	// Inside the grace window a dead pid is not retired: the caller may have
	// sampled the process table just before it appeared.
	if n, _ := Retire(dir, runs, map[int]bool{}, 2*time.Minute, t0.Add(time.Minute), nil, nil); n != 0 {
		t.Errorf("retired a record inside the grace window")
	}
	if _, err := os.Stat(filepath.Join(dir, "7.json")); err != nil {
		t.Error("young record should still be there")
	}
	// Past the grace it goes, once.
	if n, _ := Retire(dir, runs, map[int]bool{}, 2*time.Minute, t0.Add(3*time.Minute), nil, nil); n != 1 {
		t.Errorf("should have retired the record")
	}
	writeRecord(t, dir, Record{PID: 7, SessionID: "young", Cwd: "/tmp/x", UpdatedAt: t0})
	if n, _ := Retire(dir, runs, map[int]bool{}, 2*time.Minute, t0.Add(9*time.Minute), nil, nil); n != 0 {
		t.Errorf("an already-archived run must not be written twice")
	}
	if got := LoadRuns(runs); len(got) != 1 || !got[0].Ended {
		t.Errorf("archive = %+v, want one ended run", got)
	}
}

func TestLoadRunsSkipsJunkAndSortsNewestFirst(t *testing.T) {
	path := filepath.Join(t.TempDir(), "runs.jsonl")
	old := Run{PID: 1, SessionID: "a", LastSeen: time.Date(2026, 9, 1, 0, 0, 0, 0, time.UTC)}
	recent := Run{PID: 2, SessionID: "b", LastSeen: time.Date(2026, 9, 5, 0, 0, 0, 0, time.UTC)}
	if err := AppendRuns(path, []Run{old, recent}); err != nil {
		t.Fatal(err)
	}
	f, _ := os.OpenFile(path, os.O_WRONLY|os.O_APPEND, 0o600)
	f.WriteString("{ not json\n\n")
	f.Close()

	got := LoadRuns(path)
	if len(got) != 2 || got[0].SessionID != "b" || got[1].SessionID != "a" {
		t.Fatalf("got %+v, want b then a", got)
	}
	if LoadRuns(filepath.Join(t.TempDir(), "absent.jsonl")) != nil {
		t.Error("a missing archive should be empty, not an error")
	}
}
