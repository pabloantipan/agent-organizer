package service

import (
	"errors"
	"path/filepath"
	"syscall"

	"organizer/internal/scan"
	"organizer/internal/session"
	"organizer/internal/usage"
)

// Usage is one week of the token and money ledger (docs/specs/usage.md
// FR-4): it brings the ledger up to date from the transcripts, reading only
// what grew, then builds the week. An empty week is this week. The CLI's
// `organizer usage --json` and App.Usage return this same value.
func (s *Service) Usage(week string) (usage.View, error) {
	cfg := s.Config()
	if week == "" {
		week = usage.WeekOf(s.now())
	}
	if _, err := usage.WeekStart(week, nil); err != nil {
		return usage.View{}, err
	}

	in := s.usageInputs()

	dataDir := filepath.Dir(session.Dir())
	ledger, offs := usage.DataPaths(dataDir)
	st, err := usage.Ingest(usage.Options{
		ProjectsDir: usage.ProjectsDir(),
		LedgerPath:  ledger,
		OffsetsPath: offs,
		Costs:       in.costs,
		Initiatives: in.inits,
	})
	if err != nil {
		return usage.View{}, err
	}
	v, err := usage.Build(usage.LoadLedger(ledger), week, in.running, nil)
	if err != nil {
		return usage.View{}, err
	}
	v.Machine = cfg.Machine
	v.Stats = st
	// The changed rows go to the record after the view is built, in the
	// background, so the post never delays it (usage-post FR-6).
	startUsagePost(cfg, dataDir, ledger, s.now)
	return v, nil
}

// usageInputs is what a ledger pass attributes and costs sessions with: the
// initiatives on disk (scanned without git) and every cost record, plus the
// sessions still running. Usage passes them to Ingest and the runs readers
// to Attributions, so both apply one rule to the same inputs (leftovers-62
// FR-1).
type usageInputs struct {
	inits   []usage.Initiative
	costs   []usage.CostSource
	running map[string]bool
}

func (s *Service) usageInputs() usageInputs {
	// scanOptions reads the state for its agent options; the runs readers
	// call this from the app's goroutines, so it is built under the lock.
	s.mu.Lock()
	opts := s.scanOptions(false)
	s.mu.Unlock()
	opts.Agents = nil
	roots, _ := scan.Discover(opts)
	in := usageInputs{inits: make([]usage.Initiative, 0, len(roots)), running: map[string]bool{}}
	for _, root := range roots {
		si := scan.ReadInitiative(root, opts)
		ui := usage.Initiative{ID: si.ID, Root: root}
		for _, c := range si.Cards {
			ui.Cards = append(ui.Cards, usage.Card{Slug: c.Slug, Title: c.Title, Seat: c.Seat, Body: c.Body})
		}
		if si.Cell != nil {
			ui.Seats = si.Cell.Agents
		}
		in.inits = append(in.inits, ui)
	}

	// A record that says $0 has not seen a cost yet (the statusline's open
	// line, a session killed before its first refresh): a session with
	// tokens never costs nothing, so it is "no cost recorded", not $0.
	for _, r := range session.LoadRuns(session.RunsPath()) {
		in.costs = append(in.costs, usage.CostSource{SessionID: r.SessionID, PID: r.PID, At: r.LastSeen, Session: r.Session, Persona: r.Persona, CostUSD: r.CostUSD, HasCost: r.CostUSD > 0})
	}
	for pid, r := range session.Load(session.Dir()) {
		in.costs = append(in.costs, usage.CostSource{SessionID: r.SessionID, PID: r.PID, At: r.UpdatedAt, Session: r.Session, Persona: r.Persona, CostUSD: r.CostUSD, HasCost: r.CostUSD > 0})
		if alive(pid) {
			in.running[r.SessionID] = true
		}
	}
	return in
}

// alive reports whether a process exists; EPERM means it does, as someone
// else's.
func alive(pid int) bool {
	if pid <= 0 {
		return false
	}
	err := syscall.Kill(pid, 0)
	return err == nil || errors.Is(err, syscall.EPERM)
}
