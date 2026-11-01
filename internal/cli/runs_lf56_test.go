package cli

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/session"
)

// A5 (leftovers-56 FR-5): `organizer runs` over a fixture ledger names each
// run's card by its usage row's task, and (FR-6) prints the overhead share
// and the share with no task.
func TestLF56A5RunsCardIsUsageTask(t *testing.T) {
	fixtureEnv(t)
	at := func(h int) time.Time { return time.Date(2026, 10, 22, h, 0, 0, 0, time.Local) }
	root := "/nowhere/organizer"
	if err := session.AppendRuns(session.RunsPath(), []session.Run{
		// The archiver matched a card by its worktree; the ledger knows better.
		{PID: 10, SessionID: "s-build", Session: "organizer-probe-l56-roles", Cwd: root + "/.wt/old-card", Initiative: "organizer", Card: "old-card", Branch: "old-card", CostUSD: 6, FirstSeen: at(9), LastSeen: at(10), Ended: true},
		{PID: 11, SessionID: "s-fse", Session: "organizer-probe-fse", Cwd: root, CostUSD: 3, FirstSeen: at(9), LastSeen: at(10), Ended: true},
		{PID: 12, SessionID: "s-sup", Session: "organizer-probe-sup96", Cwd: root, CostUSD: 1, FirstSeen: at(9), LastSeen: at(10), Ended: true},
		// No usage row: the run keeps what the archiver gave it.
		{PID: 13, SessionID: "s-none", Cwd: "/elsewhere", CostUSD: 0.5, FirstSeen: at(9), LastSeen: at(10), Ended: true},
	}); err != nil {
		t.Fatal(err)
	}
	usageRows := map[string][2]string{ // session -> initiative, task
		"s-build": {"organizer", "lf56-run-roles"},
		"s-fse":   {"organizer", "overhead:fse"},
		"s-sup":   {"organizer", "wave:sup96"},
	}
	var ledger bytes.Buffer
	ledger.WriteString(`{"generation":1}` + "\n")
	for sid, a := range usageRows {
		b, _ := json.Marshal(map[string]any{"session_id": sid, "day": "2026-10-22", "initiative": a[0], "task": a[1], "role": "x"})
		ledger.Write(append(b, '\n'))
	}
	data := filepath.Join(os.Getenv("XDG_DATA_HOME"), "organizer")
	if err := os.WriteFile(filepath.Join(data, "usage.jsonl"), ledger.Bytes(), 0o644); err != nil {
		t.Fatal(err)
	}
	now := func() time.Time { return at(15) }

	var out, errb bytes.Buffer
	if code := runWith([]string{"runs", "--json"}, &out, &errb, now); code != 0 {
		t.Fatalf("exit %d: %s", code, errb.String())
	}
	var rows []session.Run
	if err := json.Unmarshal(out.Bytes(), &rows); err != nil {
		t.Fatal(err)
	}
	seen := 0
	for _, r := range rows {
		a, ok := usageRows[r.SessionID]
		if !ok {
			continue
		}
		seen++
		if r.Initiative != a[0] || r.Card != a[1] {
			t.Errorf("%s: runs says %s/%s, its usage row %s/%s", r.SessionID, r.Initiative, r.Card, a[0], a[1])
		}
	}
	if seen != 3 {
		t.Errorf("rows = %+v, want the three sessions with a usage row", rows)
	}

	out.Reset()
	if code := runWith([]string{"runs"}, &out, &errb, now); code != 0 {
		t.Fatalf("exit %d: %s", code, errb.String())
	}
	// $3 of $10.50 overhead, $0.50 with no task.
	if !strings.Contains(out.String(), "organizer/lf56-run-roles") || !strings.Contains(out.String(), "cost      28.6% overhead · 4.8% with no task") {
		t.Errorf("table:\n%s", out.String())
	}
}
