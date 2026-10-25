package session

import (
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"
)

// capture is a statusline payload captured from a live session with
// ORGANIZER_STATUSLINE_CAPTURE (FR-8, leftovers-53), every key kept; the
// session id, paths, costs and times are fixed stand-ins.
const capture = "testdata/statusline.json"

func env(m map[string]string) func(string) string { return func(k string) string { return m[k] } }

// readPaths lists the dotted JSON keys statusInput reads, from its tags, so a
// field added to statusInput is checked against the capture without a list
// to keep in step.
func readPaths(t reflect.Type, prefix string) []string {
	var out []string
	for i := 0; i < t.NumField(); i++ {
		f := t.Field(i)
		name, _, _ := strings.Cut(f.Tag.Get("json"), ",")
		path := prefix + name
		if f.Type.Kind() == reflect.Struct {
			out = append(out, readPaths(f.Type, path+".")...)
			continue
		}
		out = append(out, path)
	}
	return out
}

// missingPaths names every key statusInput reads that the payload lacks. A
// key present with null counts as present: it is what Claude Code sends
// before the first response.
func missingPaths(raw []byte) ([]string, error) {
	var doc map[string]any
	if err := json.Unmarshal(raw, &doc); err != nil {
		return nil, err
	}
	var out []string
	for _, p := range readPaths(reflect.TypeOf(statusInput{}), "") {
		var node any = doc
		for _, k := range strings.Split(p, ".") {
			m, ok := node.(map[string]any)
			if !ok {
				node = nil
				break
			}
			if node, ok = m[k]; !ok {
				out = append(out, p)
				break
			}
		}
	}
	return out, nil
}

func TestCapturedPayloadHasEveryReadField(t *testing.T) {
	raw, err := os.ReadFile(capture)
	if err != nil {
		t.Fatal(err)
	}
	missing, err := missingPaths(raw)
	if err != nil {
		t.Fatal(err)
	}
	for _, p := range missing {
		t.Errorf("%s: session.go reads %q, the captured payload has no such field (renamed upstream?)", capture, p)
	}
}

// TestMissingFieldIsNamed removes each read field from the capture in turn
// and checks the check above would name it.
func TestMissingFieldIsNamed(t *testing.T) {
	raw, err := os.ReadFile(capture)
	if err != nil {
		t.Fatal(err)
	}
	for _, p := range readPaths(reflect.TypeOf(statusInput{}), "") {
		var doc map[string]any
		if err := json.Unmarshal(raw, &doc); err != nil {
			t.Fatal(err)
		}
		keys := strings.Split(p, ".")
		m := doc
		for _, k := range keys[:len(keys)-1] {
			m = m[k].(map[string]any)
		}
		delete(m, keys[len(keys)-1])
		cut, _ := json.Marshal(doc)
		if got, _ := missingPaths(cut); len(got) != 1 || got[0] != p {
			t.Errorf("without %s: named %v", p, got)
		}
	}
}

func TestParse(t *testing.T) {
	raw, err := os.ReadFile(capture)
	if err != nil {
		t.Fatal(err)
	}
	now := time.Date(2026, 9, 3, 12, 0, 0, 0, time.UTC)
	r, err := Parse(raw, env(map[string]string{"AGENT_NAME": "po_andrea", "PROJECT_ID": "camp", "AGENT_SESSION": "camp-probe-po-andrea"}), now)
	if err != nil {
		t.Fatal(err)
	}
	if r.SessionID != "00000000-0000-4000-8000-000000000000" || r.Persona != "po_andrea" || r.Cell != "camp" || r.Session != "camp-probe-po-andrea" {
		t.Errorf("identity: %+v", r)
	}
	if r.Cwd != "/work/repo" || r.Transcript != "/home/agent/.claude/projects/-work-repo/00000000-0000-4000-8000-000000000000.jsonl" {
		t.Errorf("paths: %+v", r)
	}
	if r.UsedPercent != 12 || r.InputTokens != 118114 || r.WindowSize != 1000000 || r.Model != "Opus 5.5" || r.CostUSD != 1.25 {
		t.Errorf("usage: %+v", r)
	}
	if r.UpdatedAt != now {
		t.Error("updated_at")
	}
	if got := Line(r); got != "Opus 5.5  ▓░░░░░░░░░ 12% · 118k/1000k  camp/po_andrea  camp-probe-po-andrea" {
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

func TestCapture(t *testing.T) {
	path := filepath.Join(t.TempDir(), "capture.json")
	raw := []byte(`{"session_id":"x"}`)
	if err := Capture(raw, env(nil)); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(path); !os.IsNotExist(err) {
		t.Fatalf("unset %s wrote a file: %v", CaptureEnv, err)
	}
	if err := Capture(raw, env(map[string]string{CaptureEnv: path})); err != nil {
		t.Fatal(err)
	}
	if got, _ := os.ReadFile(path); string(got) != string(raw) {
		t.Errorf("captured %q, want stdin byte for byte", got)
	}
}
