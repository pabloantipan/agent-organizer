package usage

import (
	"io/fs"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// copyFixture puts testdata/projects in a temp dir, so a test can append to
// a transcript the way a running session does.
func copyFixture(t *testing.T) string {
	t.Helper()
	dst := filepath.Join(t.TempDir(), "projects")
	src := filepath.Join("testdata", "projects")
	err := filepath.WalkDir(src, func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(src, p)
		if d.IsDir() {
			return os.MkdirAll(filepath.Join(dst, rel), 0o755)
		}
		b, err := os.ReadFile(p)
		if err != nil {
			return err
		}
		return os.WriteFile(filepath.Join(dst, rel), b, 0o644)
	})
	if err != nil {
		t.Fatal(err)
	}
	return dst
}

func fixtureInitiatives() []Initiative {
	return []Initiative{{
		ID:   "org",
		Root: "/home/p/org",
		Cards: []Card{
			{Slug: "ruled-line-floor", Title: "The Ruled line", Seat: "rlf-build", Body: "- supervisor sup46, spawned by the FSE.\n"},
			{Slug: "floating-icon-3", Title: "The floating list", Seat: "fi3-build", Body: "- supervisor sup46, spawned by the FSE.\n"},
		},
	}}
}

func opts(t *testing.T, projects string, costs []CostSource) Options {
	data := t.TempDir()
	ledger, offs := DataPaths(data)
	return Options{ProjectsDir: projects, LedgerPath: ledger, OffsetsPath: offs, Costs: costs,
		Initiatives: fixtureInitiatives(), Loc: time.UTC}
}

func byDay(ls []Line, sid string) map[string]Line {
	out := map[string]Line{}
	for _, l := range ls {
		if l.SessionID == sid {
			out[l.Day] = l
		}
	}
	return out
}

// G1: a message streamed three times counts once, a sub-agent's tokens land
// on its parent session, a session is split by local day, and a second pass
// over an unchanged home reads 0 bytes.
func TestIngestSumsOncePerMessageAndRereadsNothing(t *testing.T) {
	o := opts(t, copyFixture(t), nil)
	st, err := Ingest(o)
	if err != nil {
		t.Fatal(err)
	}
	if st.Files != 3 || st.BytesRead == 0 || !st.Changed {
		t.Fatalf("first pass: %+v", st)
	}
	days := byDay(LoadLedger(o.LedgerPath), "s-main")
	if len(days) != 2 {
		t.Fatalf("s-main days = %+v, want 2", days)
	}
	d5 := days["2026-10-05"]
	want5 := Kinds{Input: 10 + 1, Output: 100 + 2, CacheRead: 1000 + 3, CacheWrite: 500 + 4}
	if d5.Kinds != want5 || d5.Messages != 2 {
		t.Errorf("2026-10-05 = %+v (%d messages), want %+v over 2 messages (msg_1 once, the sub-agent's once)", d5.Kinds, d5.Messages, want5)
	}
	if d5.Models["claude-haiku-4-5"].Total() != 10 || d5.Models["claude-opus-5-5"].Total() != 1610 {
		t.Errorf("models = %+v", d5.Models)
	}
	d6 := days["2026-10-06"]
	if d6.Kinds != (Kinds{Input: 20, Output: 200, CacheRead: 2000}) || d6.Messages != 1 {
		t.Errorf("2026-10-06 = %+v, want msg_2 only (the synthetic one is not a model's)", d6)
	}
	if d5.Cwd != "/home/p/org/.wt/rlf" {
		t.Errorf("cwd = %q: the sub-agent's cwd must not name the session", d5.Cwd)
	}

	st, err = Ingest(o)
	if err != nil {
		t.Fatal(err)
	}
	if st.BytesRead != 0 || st.Changed {
		t.Errorf("second pass over an unchanged home: %+v, want 0 bytes and no change", st)
	}

	// The session goes on: a new message and one more repeat of the last one
	// (a stream that crosses passes). Only the new bytes are read.
	main := filepath.Join(o.ProjectsDir, "-home-p-org", "s-main.jsonl")
	f, _ := os.OpenFile(main, os.O_APPEND|os.O_WRONLY, 0o644)
	add := `{"type":"assistant","sessionId":"s-main","timestamp":"2026-10-06T10:00:09.000Z","message":{"id":"msg_s","model":"<synthetic>","usage":{"input_tokens":0,"output_tokens":0,"cache_read_input_tokens":0,"cache_creation_input_tokens":0}}}` + "\n" +
		`{"type":"assistant","sessionId":"s-main","timestamp":"2026-10-06T11:00:00.000Z","message":{"id":"msg_3","model":"claude-opus-5-5","usage":{"input_tokens":1,"output_tokens":1,"cache_read_input_tokens":1,"cache_creation_input_tokens":1}}}` + "\n" +
		`{"type":"assistant","sessionId":"s-main","timestamp":"2026-10-06T11:00:01.000Z","message":{"id":"msg_3","model":"claude-opus-5-5","usage":{"input_tokens":1,"output_tokens":1,"cache_read_input_tokens":1,"cache_creation_input_tokens":1}}}` + "\n" +
		`{"type":"assistant","sessionId":"s-main","timestamp":"2026-10-06T11:00:02.000Z","message":{"id":"msg_4","model":"claude-opus-5-5","usa`
	f.WriteString(add)
	f.Close()
	st, err = Ingest(o)
	if err != nil {
		t.Fatal(err)
	}
	if st.FilesRead != 1 || st.BytesRead == 0 {
		t.Errorf("third pass: %+v, want only the grown file read", st)
	}
	d6 = byDay(LoadLedger(o.LedgerPath), "s-main")["2026-10-06"]
	if d6.Kinds != (Kinds{Input: 21, Output: 201, CacheRead: 2001, CacheWrite: 1}) {
		t.Errorf("after growth 2026-10-06 = %+v: msg_3 once, the half-written line not yet", d6.Kinds)
	}
	if !d6.Last.Equal(time.Date(2026, 10, 6, 11, 0, 0, 0, time.UTC)) {
		t.Errorf("last = %v", d6.Last)
	}
}

// G3: a session with a record has its cost split over its days by tokens;
// one without has null and is counted as without cost.
func TestCostSplitByDayAndNullWithoutRecord(t *testing.T) {
	costs := []CostSource{
		{SessionID: "s-main", CostUSD: 2, HasCost: true},
		// A resumed session reports its cumulative cost again: the largest wins.
		{SessionID: "s-main", CostUSD: 3, HasCost: true, Session: "org-probe-rlf-build"},
	}
	o := opts(t, copyFixture(t), costs)
	if _, err := Ingest(o); err != nil {
		t.Fatal(err)
	}
	lines := LoadLedger(o.LedgerPath)
	days := byDay(lines, "s-main")
	t5, t6 := days["2026-10-05"].Total(), days["2026-10-06"].Total()
	c5, c6 := days["2026-10-05"].Cost, days["2026-10-06"].Cost
	if c5 == nil || c6 == nil {
		t.Fatalf("s-main costs = %v %v", c5, c6)
	}
	if want := 3 * float64(t5) / float64(t5+t6); *c5 < want-1e-9 || *c5 > want+1e-9 {
		t.Errorf("2026-10-05 cost = %v, want %v", *c5, want)
	}
	if s := *c5 + *c6; s < 3-1e-9 || s > 3+1e-9 {
		t.Errorf("split sums to %v, want 3", s)
	}
	if plain := byDay(lines, "s-plain")["2026-10-05"]; plain.Cost != nil {
		t.Errorf("s-plain cost = %v, want null", *plain.Cost)
	}

	v, err := Build(lines, "2026-W41", map[string]bool{"s-main": true}, time.UTC)
	if err != nil {
		t.Fatal(err)
	}
	if v.ThisWeek.WithoutCost != 1 || v.ThisWeek.Sessions != 2 || v.ThisWeek.Running != 1 {
		t.Errorf("week totals = %+v", v.ThisWeek)
	}
	if m := v.ThisWeek.Money; m < 3-1e-9 || m > 3+1e-9 {
		t.Errorf("week money = %v, want 3", m)
	}
	var plain *SessionRow
	for i := range v.Sessions {
		if v.Sessions[i].ID == "s-plain" {
			plain = &v.Sessions[i]
		}
	}
	if plain == nil || plain.Money != nil {
		t.Errorf("s-plain in the session list = %+v, want money null", plain)
	}
}

// FR-3: attribution is kept in the ledger, so it survives what it was read
// from: the card leaving the initiative does not unattribute the session.
func TestAttributionKeptWhenFirstSeen(t *testing.T) {
	o := opts(t, copyFixture(t), nil)
	if _, err := Ingest(o); err != nil {
		t.Fatal(err)
	}
	d := byDay(LoadLedger(o.LedgerPath), "s-main")["2026-10-05"]
	if d.Initiative != "org" || d.Role != RoleBuilder || d.Task != "ruled-line-floor" || d.Name != "org-probe-rlf-build" {
		t.Fatalf("attribution = %+v", d.Attribution)
	}
	plain := byDay(LoadLedger(o.LedgerPath), "s-plain")["2026-10-05"]
	if plain.Initiative != "" || plain.Reason == "" {
		t.Errorf("s-plain = %+v, want not attributed with a reason", plain.Attribution)
	}

	o.Initiatives = nil // the worktree and the card are gone
	main := filepath.Join(o.ProjectsDir, "-home-p-org", "s-main.jsonl")
	f, _ := os.OpenFile(main, os.O_APPEND|os.O_WRONLY, 0o644)
	f.WriteString(`{"type":"assistant","sessionId":"s-main","timestamp":"2026-10-07T11:00:00.000Z","message":{"id":"msg_9","model":"claude-opus-5-5","usage":{"input_tokens":1,"output_tokens":1,"cache_read_input_tokens":1,"cache_creation_input_tokens":1}}}` + "\n")
	f.Close()
	if _, err := Ingest(o); err != nil {
		t.Fatal(err)
	}
	for day, l := range byDay(LoadLedger(o.LedgerPath), "s-main") {
		if l.Task != "ruled-line-floor" {
			t.Errorf("%s lost its task: %+v", day, l.Attribution)
		}
	}
}
