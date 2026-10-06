package usage

import (
	"fmt"
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
	if st.Files != 5 || st.BytesRead == 0 || !st.Changed {
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

	// The session goes on, and a stream crosses two passes: msg_3's
	// mid-stream snapshot is complete when the pass runs, its final line
	// half-written. Only the new bytes are read, and msg_3 is counted once.
	main := filepath.Join(o.ProjectsDir, "-home-p-org", "s-main.jsonl")
	appendTo := func(text string) {
		f, err := os.OpenFile(main, os.O_APPEND|os.O_WRONLY, 0o644)
		if err != nil {
			t.Fatal(err)
		}
		f.WriteString(text)
		f.Close()
	}
	msg3 := func(out, write int) string {
		return fmt.Sprintf(`{"type":"assistant","sessionId":"s-main","timestamp":"2026-10-06T11:00:00.000Z","message":{"id":"msg_3","model":"claude-opus-5-5","usage":{"input_tokens":1,"output_tokens":%d,"cache_read_input_tokens":1,"cache_creation_input_tokens":%d}}}`, out, write)
	}
	appendTo(`{"type":"assistant","sessionId":"s-main","timestamp":"2026-10-06T10:00:09.000Z","message":{"id":"msg_s","model":"<synthetic>","usage":{"input_tokens":0,"output_tokens":0,"cache_read_input_tokens":0,"cache_creation_input_tokens":0}}}` + "\n" +
		msg3(1, 1) + "\n" + msg3(1, 1) + "\n")
	final := msg3(40, 3) + "\n"
	appendTo(final[:50])
	st, err = Ingest(o)
	if err != nil {
		t.Fatal(err)
	}
	if st.FilesRead != 1 || st.BytesRead == 0 {
		t.Errorf("third pass: %+v, want only the grown file read", st)
	}
	d6 = byDay(LoadLedger(o.LedgerPath), "s-main")["2026-10-06"]
	if d6.Kinds != (Kinds{Input: 21, Output: 201, CacheRead: 2001, CacheWrite: 1}) || d6.Messages != 2 {
		t.Errorf("after the snapshot 2026-10-06 = %+v (%d messages): msg_3's snapshot once, its final line not yet", d6.Kinds, d6.Messages)
	}

	// The final line lands, then a new message: msg_3 adds only what grew.
	appendTo(final[50:] + `{"type":"assistant","sessionId":"s-main","timestamp":"2026-10-06T12:00:00.000Z","message":{"id":"msg_4","model":"claude-opus-5-5","usage":{"input_tokens":2,"output_tokens":2,"cache_read_input_tokens":2,"cache_creation_input_tokens":2}}}` + "\n")
	if _, err := Ingest(o); err != nil {
		t.Fatal(err)
	}
	d6 = byDay(LoadLedger(o.LedgerPath), "s-main")["2026-10-06"]
	if d6.Kinds != (Kinds{Input: 23, Output: 242, CacheRead: 2003, CacheWrite: 5}) || d6.Messages != 3 {
		t.Errorf("after the stream ended 2026-10-06 = %+v (%d messages): msg_3 at its final usage once, msg_4 once", d6.Kinds, d6.Messages)
	}
	if !d6.Last.Equal(time.Date(2026, 10, 6, 12, 0, 0, 0, time.UTC)) {
		t.Errorf("last = %v", d6.Last)
	}
}

// A crash between the ledger's rename and the offsets' leaves them on two
// generations; the next pass rebuilds rather than count grown bytes twice.
func TestCrashBetweenRenamesDoesNotDoubleCount(t *testing.T) {
	o := opts(t, copyFixture(t), nil)
	if _, err := Ingest(o); err != nil {
		t.Fatal(err)
	}
	stale, err := os.ReadFile(o.OffsetsPath)
	if err != nil {
		t.Fatal(err)
	}
	main := filepath.Join(o.ProjectsDir, "-home-p-org", "s-main.jsonl")
	f, _ := os.OpenFile(main, os.O_APPEND|os.O_WRONLY, 0o644)
	f.WriteString(`{"type":"assistant","sessionId":"s-main","timestamp":"2026-10-06T12:00:00.000Z","message":{"id":"msg_c","model":"claude-opus-5-5","usage":{"input_tokens":5,"output_tokens":5,"cache_read_input_tokens":5,"cache_creation_input_tokens":5}}}` + "\n")
	f.Close()
	if _, err := Ingest(o); err != nil {
		t.Fatal(err)
	}
	want := byDay(LoadLedger(o.LedgerPath), "s-main")["2026-10-06"].Kinds
	// The new ledger landed, the new offsets did not.
	if err := os.WriteFile(o.OffsetsPath, stale, 0o600); err != nil {
		t.Fatal(err)
	}
	if _, err := Ingest(o); err != nil {
		t.Fatal(err)
	}
	if got := byDay(LoadLedger(o.LedgerPath), "s-main")["2026-10-06"].Kinds; got != want {
		t.Errorf("after the crash 2026-10-06 = %+v, want %+v (msg_c once)", got, want)
	}
}

// G3 (FR-2, Amendment 1), four sessions: one with a record has the record's
// cost split by day (its transcript's own cost-state does not override it);
// one with only a transcript cost-state has the transcript's; one whose
// record says $0 and whose transcript prices it has the transcript's; one
// with neither has null and is counted as without cost.
func TestCostFourCases(t *testing.T) {
	costs := []CostSource{
		{SessionID: "s-main", CostUSD: 2, HasCost: true},
		// A resumed session reports its cumulative cost again: the largest wins.
		{SessionID: "s-main", CostUSD: 3, HasCost: true, Session: "org-probe-rlf-build"},
		// The statusline's open line, before any cost: $0 is no record.
		{SessionID: "s-zero", CostUSD: 0, HasCost: true},
	}
	o := opts(t, copyFixture(t), costs)
	if _, err := Ingest(o); err != nil {
		t.Fatal(err)
	}
	lines := LoadLedger(o.LedgerPath)
	near := func(a, b float64) bool { return a-b < 1e-9 && b-a < 1e-9 }
	sum := func(sid string) (float64, string, int) {
		var c float64
		from, nulls := "", 0
		for _, l := range byDay(lines, sid) {
			if l.Cost == nil {
				nulls++
				continue
			}
			c += *l.Cost
			from = l.CostFrom
		}
		return c, from, nulls
	}

	// 1. A record: $3, split by tokens, not the transcript's $9.50.
	days := byDay(lines, "s-main")
	t5, t6 := days["2026-10-05"].Total(), days["2026-10-06"].Total()
	c5 := days["2026-10-05"].Cost
	if c5 == nil || !near(*c5, 3*float64(t5)/float64(t5+t6)) {
		t.Errorf("s-main 2026-10-05 cost = %v, want its token share of $3", c5)
	}
	if c, from, _ := sum("s-main"); !near(c, 3) || from != "record" {
		t.Errorf("s-main = $%v from %q, want $3 from the record", c, from)
	}
	// 2. Only the transcript: its last cost-state, $1.00, split 1:3 by tokens.
	if c, from, _ := sum("s-trans"); !near(c, 1) || from != "transcript" {
		t.Errorf("s-trans = $%v from %q, want $1 from the transcript", c, from)
	}
	if d := byDay(lines, "s-trans")["2026-10-05"].Cost; d == nil || !near(*d, 0.25) {
		t.Errorf("s-trans 2026-10-05 = %v, want $0.25 (4 of 16 tokens)", d)
	}
	// 3. A $0 record the transcript prices higher: the transcript's.
	if c, from, _ := sum("s-zero"); !near(c, 61.5) || from != "transcript" {
		t.Errorf("s-zero = $%v from %q, want $61.50 from the transcript", c, from)
	}
	// 4. Neither: null, and counted.
	if _, _, nulls := sum("s-plain"); nulls != 1 {
		t.Errorf("s-plain should have a null cost")
	}

	v, err := Build(lines, "2026-W41", map[string]bool{"s-main": true}, time.UTC)
	if err != nil {
		t.Fatal(err)
	}
	if v.ThisWeek.WithoutCost != 1 || v.ThisWeek.Sessions != 4 || v.ThisWeek.Running != 1 {
		t.Errorf("week totals = %+v", v.ThisWeek)
	}
	if !near(v.ThisWeek.Money, 3+1+61.5) {
		t.Errorf("week money = %v, want 65.5", v.ThisWeek.Money)
	}
	for _, s := range v.Sessions {
		if s.ID == "s-plain" && (s.Money != nil || s.CostFrom != "") {
			t.Errorf("s-plain in the session list = %+v, want money null", s)
		}
		if s.ID == "s-zero" && s.CostFrom != "transcript" {
			t.Errorf("s-zero cost_from = %q", s.CostFrom)
		}
	}
}

// An offsets file from before the transcripts' cost-state was read is
// dropped, and the ledger rebuilt, so old sessions get their cost.
func TestOldOffsetsRebuild(t *testing.T) {
	o := opts(t, copyFixture(t), nil)
	if _, err := Ingest(o); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(o.OffsetsPath, []byte(`{"files":{},"sessions":{}}`), 0o600); err != nil {
		t.Fatal(err)
	}
	st, err := Ingest(o)
	if err != nil || st.FilesRead != 5 || !st.Changed {
		t.Fatalf("rebuild pass: %+v %v", st, err)
	}
	if d := byDay(LoadLedger(o.LedgerPath), "s-main")["2026-10-05"]; d.Messages != 2 {
		t.Errorf("rebuilt line counted twice or lost: %+v", d)
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
