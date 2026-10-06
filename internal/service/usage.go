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

	opts := s.scanOptions(false)
	opts.Agents = nil
	roots, _ := scan.Discover(opts)
	inits := make([]usage.Initiative, 0, len(roots))
	for _, root := range roots {
		si := scan.ReadInitiative(root, opts)
		in := usage.Initiative{ID: si.ID, Root: root}
		for _, c := range si.Cards {
			in.Cards = append(in.Cards, usage.Card{Slug: c.Slug, Title: c.Title, Seat: c.Seat, Body: c.Body})
		}
		if si.Cell != nil {
			in.Seats = si.Cell.Agents
		}
		inits = append(inits, in)
	}

	// A record that says $0 has not seen a cost yet (the statusline's open
	// line, a session killed before its first refresh): a session with
	// tokens never costs nothing, so it is "no cost recorded", not $0.
	var costs []usage.CostSource
	for _, r := range session.LoadRuns(session.RunsPath()) {
		costs = append(costs, usage.CostSource{SessionID: r.SessionID, Session: r.Session, Persona: r.Persona, CostUSD: r.CostUSD, HasCost: r.CostUSD > 0})
	}
	running := map[string]bool{}
	for pid, r := range session.Load(session.Dir()) {
		costs = append(costs, usage.CostSource{SessionID: r.SessionID, Session: r.Session, Persona: r.Persona, CostUSD: r.CostUSD, HasCost: r.CostUSD > 0})
		if alive(pid) {
			running[r.SessionID] = true
		}
	}

	ledger, offs := usage.DataPaths(filepath.Dir(session.Dir()))
	st, err := usage.Ingest(usage.Options{
		ProjectsDir: usage.ProjectsDir(),
		LedgerPath:  ledger,
		OffsetsPath: offs,
		Costs:       costs,
		Initiatives: inits,
	})
	if err != nil {
		return usage.View{}, err
	}
	v, err := usage.Build(usage.LoadLedger(ledger), week, running, nil)
	if err != nil {
		return usage.View{}, err
	}
	v.Machine = cfg.Machine
	v.Stats = st
	return v, nil
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
