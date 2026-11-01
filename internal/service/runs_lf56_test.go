package service

import (
	"testing"
	"time"

	"organizer/internal/session"
	"organizer/internal/usage"
)

// A5 (leftovers-56 FR-5): runsView names each run's card by its usage row's
// task; a run the ledger has not seen keeps the archiver's card.
func TestLF56A5RunsViewCardIsUsageTask(t *testing.T) {
	at := func(h int) time.Time { return time.Date(2026, 10, 22, h, 0, 0, 0, time.UTC) }
	archived := []session.Run{
		{PID: 1, SessionID: "s-build", Initiative: "organizer", Card: "old-card", Branch: "old-card", InputTokens: 10, FirstSeen: at(9), LastSeen: at(10), Ended: true},
		{PID: 2, SessionID: "s-fse", InputTokens: 20, FirstSeen: at(9), LastSeen: at(11), Ended: true},
		{PID: 3, SessionID: "s-kept", Initiative: "organizer", Card: "kept-card", InputTokens: 5, FirstSeen: at(9), LastSeen: at(9), Ended: true},
	}
	live := []session.Run{
		{PID: 4, SessionID: "s-sup", InputTokens: 30, FirstSeen: at(12), LastSeen: at(12)},
	}
	lines := []usage.Line{
		{SessionID: "s-build", Day: "2026-10-21", Attribution: usage.Attribution{Initiative: "organizer", Task: "stale"}},
		{SessionID: "s-build", Day: "2026-10-22", Attribution: usage.Attribution{Initiative: "organizer", Task: "lf56-run-roles"}},
		{SessionID: "s-fse", Day: "2026-10-22", Attribution: usage.Attribution{Initiative: "organizer", Task: "overhead:fse"}},
		{SessionID: "s-sup", Day: "2026-10-22", Attribution: usage.Attribution{Initiative: "organizer", Task: "wave:sup96"}},
		{SessionID: "s-other", Day: "2026-10-22", Attribution: usage.Attribution{Initiative: "factory", Task: "overhead:pair"}},
	}
	tasks := usage.BySession(lines)
	view := runsView("organizer", archived, live, tasks)
	got := map[string]string{}
	for _, c := range view.Cards {
		for _, r := range c.Runs {
			got[r.SessionID] = c.Card
			if r.Card != c.Card {
				t.Errorf("%s: row card %q under group %q", r.SessionID, r.Card, c.Card)
			}
			if r.SessionID == "s-build" && r.Branch != "" {
				t.Errorf("s-build kept old-card's branch %q", r.Branch)
			}
		}
	}
	want := map[string]string{"s-build": "lf56-run-roles", "s-fse": "overhead:fse", "s-sup": "wave:sup96", "s-kept": "kept-card"}
	for sid, w := range want {
		if got[sid] != w {
			t.Errorf("%s: card %q, want %q (its usage row's task)", sid, got[sid], w)
		}
	}
	if len(got) != len(want) {
		t.Errorf("runs = %v, want %v", got, want)
	}
}
