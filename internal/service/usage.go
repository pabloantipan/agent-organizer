package service

import (
	"errors"
	"path/filepath"
	"syscall"

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
	lines := usage.LoadLedger(ledger)
	v, err := usage.Build(lines, week, in.running, nil)
	if err != nil {
		return usage.View{}, err
	}
	v.Machine = cfg.Machine
	v.Stats = st
	v.Rejected = passRejected(dataDir, lines)
	// The changed rows go to the record after the view is built, in the
	// background, so the post never delays it (usage-post FR-6).
	startUsagePost(cfg, dataDir, ledger, s.now)
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
