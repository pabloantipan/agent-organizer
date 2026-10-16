package usage

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// msg is one assistant message of a test transcript.
type msg struct {
	at    string // RFC 3339
	model string
	k     Kinds
}

// writeTranscript appends msgs to <projects>/-p/<sid>.jsonl, one id each.
func writeTranscript(t *testing.T, projects, sid string, msgs ...msg) {
	t.Helper()
	dir := filepath.Join(projects, "-p")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	f, err := os.OpenFile(filepath.Join(dir, sid+".jsonl"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	for _, m := range msgs {
		model := m.model
		if model == "" {
			model = "claude-opus-5-5"
		}
		u := map[string]any{"input_tokens": m.k.Input, "output_tokens": m.k.Output,
			"cache_read_input_tokens": m.k.CacheRead, "cache_creation_input_tokens": m.k.CacheWrite}
		if m.k.CacheWrite > 0 {
			u["cache_creation"] = map[string]int64{"ephemeral_1h_input_tokens": m.k.CacheWrite1h, "ephemeral_5m_input_tokens": m.k.CacheWrite - m.k.CacheWrite1h}
		}
		b, _ := json.Marshal(map[string]any{"type": "assistant", "sessionId": sid, "timestamp": m.at, "cwd": "/nowhere",
			"message": map[string]any{"id": sid + "-" + m.at, "model": model, "usage": u}})
		f.Write(append(b, '\n'))
	}
}

func tempOpts(t *testing.T, costs []CostSource) Options {
	o := opts(t, filepath.Join(t.TempDir(), "projects"), costs)
	o.Initiatives = nil
	return o
}

func ingest(t *testing.T, o Options) []Line {
	t.Helper()
	if _, err := Ingest(o); err != nil {
		t.Fatal(err)
	}
	return LoadLedger(o.LedgerPath)
}

func at(hm string) string { return "2026-10-14T" + hm + ":00.000Z" }

var one = Kinds{Input: 1, Output: 1}

// P1 (FR-3): 10:00, 10:03, 10:04, 10:30, 10:32 is 3 + 1 + 2 minutes of work;
// the 26-minute gap starts a new stretch and adds nothing.
func TestP1ActiveIsGapsOfFiveMinutesOrLess(t *testing.T) {
	o := tempOpts(t, nil)
	writeTranscript(t, o.ProjectsDir, "s", msg{at: at("10:00"), k: one}, msg{at: at("10:03"), k: one},
		msg{at: at("10:04"), k: one}, msg{at: at("10:30"), k: one}, msg{at: at("10:32"), k: one})
	ls := ingest(t, o)
	if len(ls) != 1 || ls[0].Active != 360 {
		t.Fatalf("lines = %+v, want one with active 360", ls)
	}
	v, err := Build(ls, "2026-W42", nil, time.UTC)
	if err != nil {
		t.Fatal(err)
	}
	if math.Abs(v.ThisWeek.Hours-0.1) > 1e-9 {
		t.Errorf("hours = %v, want 0.1 (first to last would be %v)", v.ThisWeek.Hours, ls[0].Last.Sub(ls[0].First).Hours())
	}
	if len(v.Sessions) != 1 || v.Sessions[0].Active != 360 {
		t.Errorf("session row active = %+v, want 360", v.Sessions)
	}
}

// Exactly five minutes still counts; a second more does not.
func TestActiveGapBoundary(t *testing.T) {
	o := tempOpts(t, nil)
	writeTranscript(t, o.ProjectsDir, "s", msg{at: at("10:00"), k: one}, msg{at: at("10:05"), k: one},
		msg{at: "2026-10-14T10:10:01.000Z", k: one})
	if ls := ingest(t, o); ls[0].Active != 300 {
		t.Errorf("active = %d, want 300", ls[0].Active)
	}
}

// P2 (FR-3): the same session read in two passes, split between 10:03 and
// 10:04, has the same active time as read in one.
func TestP2ActiveAcrossTwoPasses(t *testing.T) {
	o := tempOpts(t, nil)
	writeTranscript(t, o.ProjectsDir, "s", msg{at: at("10:00"), k: one}, msg{at: at("10:03"), k: one})
	if ls := ingest(t, o); ls[0].Active != 180 {
		t.Fatalf("first pass active = %d, want 180", ls[0].Active)
	}
	writeTranscript(t, o.ProjectsDir, "s", msg{at: at("10:04"), k: one}, msg{at: at("10:30"), k: one}, msg{at: at("10:32"), k: one})
	if ls := ingest(t, o); ls[0].Active != 360 {
		t.Errorf("two passes active = %d, want 360 as one pass", ls[0].Active)
	}
	// A sub-agent's messages land between the parent's, in a file of their
	// own read after it: they bridge the 26-minute gap.
	sub := filepath.Join(o.ProjectsDir, "-p", "s", "subagents")
	os.MkdirAll(sub, 0o755)
	var b bytes.Buffer
	for _, hm := range []string{"10:08", "10:12", "10:16", "10:20", "10:24", "10:28"} {
		fmt.Fprintf(&b, `{"type":"assistant","timestamp":"%s","message":{"id":"sub-%s","model":"claude-opus-5-5","usage":{"input_tokens":1}}}`+"\n", at(hm), hm)
	}
	os.WriteFile(filepath.Join(sub, "agent-x.jsonl"), b.Bytes(), 0o644)
	if ls := ingest(t, o); ls[0].Active != 32*60 {
		t.Errorf("with the sub-agent active = %d, want 1920 (10:00 to 10:32)", ls[0].Active)
	}
}

// P3 (FR-3): a ledger written before `active` existed (offsets version 3)
// is recomputed from its transcripts on the next ingest, never left at 0.
// A session whose transcript is gone keeps its lines, tokens and all, and
// reads first to last; one read again keeps the attribution it had.
func TestP3OldLedgerRecomputed(t *testing.T) {
	o := tempOpts(t, nil)
	writeTranscript(t, o.ProjectsDir, "s", msg{at: at("10:00"), k: one}, msg{at: at("10:03"), k: one},
		msg{at: at("10:04"), k: one}, msg{at: at("10:30"), k: one}, msg{at: at("10:32"), k: one})
	writeTranscript(t, o.ProjectsDir, "gone", msg{at: at("09:00"), k: Kinds{Output: 7}}, msg{at: at("09:40"), k: one})
	ingest(t, o)

	// Today's code wrote this: no active, no stretches, version 3, and an
	// attribution the cards no longer give.
	ls := LoadLedger(o.LedgerPath)
	for i := range ls {
		ls[i].Active = 0
		ls[i].Attribution = Attribution{Initiative: "org", Role: RoleBuilder, Task: "gone-card"}
	}
	var buf bytes.Buffer
	gen := ledgerGeneration(o.LedgerPath)
	fmt.Fprintf(&buf, `{"generation":%d}`+"\n", gen)
	for _, l := range ls {
		b, _ := json.Marshal(l)
		var m map[string]any
		json.Unmarshal(b, &m)
		delete(m, "active")
		b, _ = json.Marshal(m)
		buf.Write(append(b, '\n'))
	}
	os.WriteFile(o.LedgerPath, buf.Bytes(), 0o600)
	offs := loadOffsets(o.OffsetsPath)
	offs.Version = 3
	for _, m := range offs.Sessions {
		m.Stretches = nil
	}
	writeJSON(o.OffsetsPath, offs)
	os.Remove(filepath.Join(o.ProjectsDir, "-p", "gone.jsonl"))

	got := byDay(ingest(t, o), "s")["2026-10-14"]
	if got.Active != 360 {
		t.Errorf("s after the rebuild: active %d, want 360", got.Active)
	}
	if got.Task != "gone-card" {
		t.Errorf("s lost the attribution it had: %+v", got.Attribution)
	}
	g := byDay(LoadLedger(o.LedgerPath), "gone")["2026-10-14"]
	if g.Output != 8 || g.Active != 40*60 {
		t.Errorf("gone = %+v, want kept with its 8 output tokens and 2400 s first to last", g)
	}
	// Once: the next pass reads nothing and changes nothing.
	if st, _ := Ingest(o); st.BytesRead != 0 || st.Changed {
		t.Errorf("second pass after the rebuild: %+v", st)
	}
}

func near(a, b float64) bool { return math.Abs(a-b) < 1e-9 }

func sessionRows(ls []Line) map[string]SessionRow {
	out := map[string]SessionRow{}
	for _, r := range sessions(ls, nil) {
		out[r.ID] = r
	}
	return out
}

// P5 (FR-4, FR-5): a session of opus-5-5 tokens with no cost source is
// priced from the table, cache writes by how long they were kept. By hand:
// 1M input $4 + 0.5M output $10 + 10M cache read $2 + 0.5M 5-minute writes
// $2.50 + 1.5M 1-hour writes $12 = $30.50.
func TestP5PricedFromTheTable(t *testing.T) {
	o := tempOpts(t, nil)
	writeTranscript(t, o.ProjectsDir, "s",
		msg{at: at("10:00"), k: Kinds{Input: 1_000_000, Output: 500_000, CacheWrite: 2_000_000, CacheWrite1h: 1_500_000}},
		msg{at: "2026-10-15T10:00:00.000Z", k: Kinds{CacheRead: 10_000_000}})
	ls := ingest(t, o)
	r := sessionRows(ls)["s"]
	if r.Money == nil || math.Round(*r.Money*100) != 3050 || r.CostFrom != "priced" {
		t.Fatalf("s = %v from %q, want $30.50 priced", r.Money, r.CostFrom)
	}
	v, _ := Build(ls, "2026-W42", nil, time.UTC)
	if v.ThisWeek.WithoutCost != 0 || !near(v.ThisWeek.Money, 30.5) {
		t.Errorf("week = %+v", v.ThisWeek)
	}
	// A recorded cost wins over the table for a session that is not reset.
	o2 := tempOpts(t, []CostSource{{SessionID: "s", CostUSD: 3, HasCost: true}})
	o2.ProjectsDir = o.ProjectsDir
	if r := sessionRows(ingest(t, o2))["s"]; r.Money == nil || !near(*r.Money, 3) || r.CostFrom != "record" {
		t.Errorf("with a record: %v from %q, want $3 record", r.Money, r.CostFrom)
	}
}

// P6 (FR-5): one unpriced model's tokens leave the session without cost.
func TestP6UnpricedModelKeepsNoCost(t *testing.T) {
	o := tempOpts(t, nil)
	writeTranscript(t, o.ProjectsDir, "s", msg{at: at("10:00"), k: Kinds{Output: 1000}},
		msg{at: at("10:01"), model: "claude-haiku-5-5", k: Kinds{Output: 10}})
	ls := ingest(t, o)
	if r := sessionRows(ls)["s"]; r.Money != nil || r.CostFrom != "" {
		t.Errorf("s = %v from %q, want no cost", r.Money, r.CostFrom)
	}
	if v, _ := Build(ls, "2026-W42", nil, time.UTC); v.ThisWeek.WithoutCost != 1 {
		t.Errorf("week = %+v, want 1 without cost", v.ThisWeek)
	}
}

// P8 (FR-6): $10 recorded over two days, 1M opus output on one and 1M opus
// cache reads on the other, splits 20 : 0.20, and the total stays $10.
// With an unpriced model on a day, the split falls back to tokens.
func TestP8SplitByPricedTokens(t *testing.T) {
	cases := []struct {
		name      string
		day2Model string
		want1     float64
		want2     float64
	}{
		{"every day priced", "claude-opus-5-5", 10 * 20 / 20.2, 10 * 0.2 / 20.2},
		{"an unpriced day", "claude-haiku-5-5", 5, 5},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			o := tempOpts(t, []CostSource{{SessionID: "s", CostUSD: 10, HasCost: true}})
			writeTranscript(t, o.ProjectsDir, "s", msg{at: "2026-10-13T10:00:00.000Z", k: Kinds{Output: 1_000_000}},
				msg{at: "2026-10-14T10:00:00.000Z", model: tc.day2Model, k: Kinds{CacheRead: 1_000_000}})
			days := byDay(ingest(t, o), "s")
			d1, d2 := days["2026-10-13"].Cost, days["2026-10-14"].Cost
			if d1 == nil || d2 == nil || !near(*d1, tc.want1) || !near(*d2, tc.want2) || !near(*d1+*d2, 10) {
				t.Errorf("days = %v, %v, want %.4f + %.4f = 10", d1, d2, tc.want1, tc.want2)
			}
		})
	}
}

// FR-6, the model cut: a day's cost on its models by priced tokens when
// every model is priced, by tokens when one is not; the day's total stays.
func TestModelCutSplitsByPricedTokens(t *testing.T) {
	Prices["test-cheap"] = Price{Output: 2}
	defer delete(Prices, "test-cheap")
	cost := 11.0
	l := Line{SessionID: "s", Day: "2026-10-14", Cost: &cost, Models: map[string]Kinds{
		"claude-opus-5-5": {Output: 1_000_000}, "test-cheap": {Output: 1_000_000}}}
	l.Kinds = Kinds{Output: 2_000_000}
	money := func(ls []Line) map[string]float64 {
		out := map[string]float64{}
		for _, r := range cut("model", ls, cost) {
			out[r.Key] = r.Money
		}
		return out
	}
	if m := money([]Line{l}); !near(m["claude-opus-5-5"], 10) || !near(m["test-cheap"], 1) {
		t.Errorf("priced split = %v, want 10 and 1 (20 : 2)", m)
	}
	l.Models["claude-haiku-5-5"] = Kinds{Output: 2_000_000}
	l.Kinds = Kinds{Output: 4_000_000}
	if m := money([]Line{l}); !near(m["claude-opus-5-5"], 2.75) || !near(m["claude-haiku-5-5"], 5.5) || !near(m["test-cheap"]+m["claude-opus-5-5"]+m["claude-haiku-5-5"], 11) {
		t.Errorf("token split = %v, want 2.75, 2.75, 5.50", m)
	}
}

// P10 (FR-7): a reset session whose tokens are all priced takes the larger
// of its runs and its priced tokens; one with an unpriced model keeps its
// runs and stays reset.
func TestP10ResetTakesTheLarger(t *testing.T) {
	t0 := time.Date(2026, 10, 14, 10, 0, 0, 0, time.UTC)
	runs := func(sid string) []CostSource { // 5, 10, 12, 3, 7 over three pids: $19 recorded
		var out []CostSource
		for i, r := range []struct {
			pid int
			usd float64
		}{{1, 5}, {1, 10}, {2, 12}, {2, 3}, {3, 7}} {
			out = append(out, CostSource{SessionID: sid, PID: r.pid, At: t0.Add(time.Duration(i) * time.Minute), CostUSD: r.usd, HasCost: true})
		}
		return out
	}
	var costs []CostSource
	for _, sid := range []string{"over", "under", "mixed"} {
		costs = append(costs, runs(sid)...)
	}
	o := tempOpts(t, costs)
	writeTranscript(t, o.ProjectsDir, "over", msg{at: at("10:00"), k: Kinds{Output: 1_250_000}})  // $25
	writeTranscript(t, o.ProjectsDir, "under", msg{at: at("10:00"), k: Kinds{Output: 500_000}})   // $10
	writeTranscript(t, o.ProjectsDir, "mixed", msg{at: at("10:00"), k: Kinds{Output: 1_250_000}}, // $25 and haiku
		msg{at: at("10:01"), model: "claude-haiku-5-5", k: Kinds{Output: 1}})
	rows := sessionRows(ingest(t, o))
	for sid, want := range map[string]struct {
		usd  float64
		from string
	}{"over": {25, "priced"}, "under": {19, "record"}, "mixed": {19, "record"}} {
		r := rows[sid]
		if r.Money == nil || !near(*r.Money, want.usd) || r.CostFrom != want.from || !r.Reset {
			t.Errorf("%s = %v from %q reset %v, want $%v from %q, reset", sid, r.Money, r.CostFrom, r.Reset, want.usd, want.from)
		}
	}
}
