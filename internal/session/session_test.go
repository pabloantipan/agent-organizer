package session

import (
	"testing"
	"time"
)

const sample = `{"session_id":"abc","transcript_path":"/t/abc.jsonl","cwd":"/w",
"model":{"id":"claude-x","display_name":"Fable"},
"context_window":{"total_input_tokens":82000,"context_window_size":200000,"used_percentage":41},
"cost":{"total_cost_usd":1.25}}`

func env(m map[string]string) func(string) string { return func(k string) string { return m[k] } }

func TestParse(t *testing.T) {
	now := time.Date(2026, 9, 3, 12, 0, 0, 0, time.UTC)
	r, err := Parse([]byte(sample), env(map[string]string{"AGENT_NAME": "po_andrea", "PROJECT_ID": "camp", "AGENT_SESSION": "camp-probe-po-andrea"}), now)
	if err != nil {
		t.Fatal(err)
	}
	if r.SessionID != "abc" || r.Persona != "po_andrea" || r.Cell != "camp" || r.Session != "camp-probe-po-andrea" {
		t.Errorf("identity: %+v", r)
	}
	if r.UsedPercent != 41 || r.InputTokens != 82000 || r.WindowSize != 200000 || r.Model != "Fable" || r.CostUSD != 1.25 {
		t.Errorf("usage: %+v", r)
	}
	if r.UpdatedAt != now {
		t.Error("updated_at")
	}
	if got := Line(r); got != "Fable  ▓▓▓▓░░░░░░ 41% · 82k/200k  camp/po_andrea  camp-probe-po-andrea" {
		t.Errorf("line %q", got)
	}
}

func TestParseWithoutPercentage(t *testing.T) {
	r, err := Parse([]byte(`{"session_id":"x","context_window":{"total_input_tokens":50000,"context_window_size":200000,"used_percentage":null}}`), env(nil), time.Now())
	if err != nil {
		t.Fatal(err)
	}
	if r.UsedPercent != 25 {
		t.Errorf("derived percent %v", r.UsedPercent)
	}
	if _, err := Parse([]byte(`{}`), env(nil), time.Now()); err == nil {
		t.Error("no session_id should fail")
	}
}

func TestWriteLoadPrune(t *testing.T) {
	dir := t.TempDir()
	now := time.Now()
	old := Record{PID: 11, SessionID: "old", UpdatedAt: now.Add(-time.Hour)}
	fresh := Record{PID: 12, SessionID: "fresh", UpdatedAt: now}
	live := Record{PID: 13, SessionID: "live", UpdatedAt: now.Add(-time.Hour)}
	for _, r := range []Record{old, fresh, live} {
		if err := Write(dir, r); err != nil {
			t.Fatal(err)
		}
	}
	if got := Load(dir); len(got) != 3 || got[12].SessionID != "fresh" {
		t.Fatalf("load %+v", got)
	}
	n := Prune(dir, map[int]bool{13: true}, time.Minute, now)
	got := Load(dir)
	if n != 1 || len(got) != 2 || got[11].PID != 0 {
		t.Errorf("prune removed %d, left %+v", n, got)
	}
	if Write(dir, Record{}) == nil {
		t.Error("pid 0 must be rejected")
	}
}
