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
	ledger "organizer/internal/usage"
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
		// A usage row with no task: its reason gives the cause.
		{PID: 14, SessionID: "s-sup2", Session: "organizer-probe-sup2", Cwd: root, CostUSD: 1.5, FirstSeen: at(9), LastSeen: at(10), Ended: true},
		// No usage row: the run keeps what the archiver gave it.
		{PID: 13, SessionID: "s-none", Cwd: "/elsewhere", CostUSD: 0.5, FirstSeen: at(9), LastSeen: at(10), Ended: true},
	}); err != nil {
		t.Fatal(err)
	}
	usageRows := map[string][2]string{ // session -> initiative, task
		"s-build": {"organizer", "lf56-run-roles"},
		// No initiative root holds /nowhere/organizer, so a usage pass names
		// the FSE's overhead the factory's, and runs reads it as the pass
		// would (leftovers-62 FR-1).
		"s-fse": {"factory", "overhead:fse"},
		"s-sup": {"organizer", "wave:sup96"},
	}
	var ledger bytes.Buffer
	ledger.WriteString(`{"generation":1}` + "\n")
	for sid, a := range usageRows {
		b, _ := json.Marshal(map[string]any{"session_id": sid, "day": "2026-10-22", "initiative": a[0], "task": a[1], "role": "x"})
		ledger.Write(append(b, '\n'))
	}
	b, _ := json.Marshal(map[string]any{"session_id": "s-sup2", "day": "2026-10-22", "initiative": "organizer", "role": "supervisor", "reason": "no record or card names sup2 as its supervisor"})
	ledger.Write(append(b, '\n'))
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
	// $3 of $12 overhead; $2 with no task: $1.50 a supervisor no record
	// names, $0.50 a run with no usage row (Amendment 2).
	for _, want := range []string{"organizer/lf56-run-roles", "cost      25.0% overhead · 16.7% with no task\n",
		"          12.5% a supervisor no record or card names\n          4.2% a run with no usage row\n"} {
		if !strings.Contains(out.String(), want) {
			t.Errorf("table missing %q:\n%s", want, out.String())
		}
	}
}

// A6 (Amendment 2): `organizer usage` prints the share with no task by
// cause under the shares line.
func TestLF56A6UsagePrintsCauses(t *testing.T) {
	m := func(x float64) *float64 { return &x }
	v := ledger.View{Week: "2026-W44", FirstDay: "2026-10-26", ThisWeek: ledger.Totals{Week: "2026-W44", Sessions: 4, Money: 10},
		Sessions: []ledger.SessionRow{
			{ID: "a", Task: "lf56-run-roles", Money: m(4)},
			{ID: "b", Task: "overhead:fse", Money: m(3)},
			{ID: "c", Reason: "no record or card names sup32 as its supervisor", Money: m(2)},
			{ID: "d", Reason: "seat cl-build matches 2 cards (a, b)", Money: m(1)},
		}}
	var out bytes.Buffer
	WriteUsage(&out, v, "initiative")
	want := "cost      30.0% overhead · 30.0% with no task\n          20.0% a supervisor no record or card names\n          10.0% a seat several cards name\n\n"
	if !strings.Contains(out.String(), want) {
		t.Errorf("printed\n%s\nwant\n%s", out.String(), want)
	}
}
