package cli

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"
)

// leftovers-54 G4 (FR-4): `organizer usage` and `organizer doctor` list the
// rows the record rejected, from the post state in the data dir: the count,
// then per row the session, the day and the record's reason. The state is
// written as JSON so this compiles against any version.
func TestG4UsageAndDoctorListRejectedRows(t *testing.T) {
	fixtureEnv(t)
	t.Setenv("CLAUDE_CONFIG_DIR", t.TempDir())
	data := filepath.Join(os.Getenv("XDG_DATA_HOME"), "organizer")
	if err := os.MkdirAll(data, 0o700); err != nil {
		t.Fatal(err)
	}
	state := `{"accepted":{"s-ok|2026-10-05":"h0"},"rejected":{` +
		`"s-neg|2026-10-05":{"session_id":"s-neg","day":"2026-10-05","reason":"token counts and messages cannot be negative","hash":"h1","at":"2026-10-06T09:00:00Z"},` +
		`"s-typed|2026-10-04":{"session_id":"s-typed","day":"2026-10-04","reason":"input is a JSON string","hash":"h2","at":"2026-10-06T09:00:00Z"}}}`
	if err := os.WriteFile(filepath.Join(data, "usage-post.json"), []byte(state), 0o600); err != nil {
		t.Fatal(err)
	}
	// The rejected rows are still in the ledger; a rejected row whose ledger
	// row is gone leaves the state (leftovers-62 FR-3, TestLF62G3…).
	writeLedgerRows(t, data, "s-ok|2026-10-05", "s-neg|2026-10-05", "s-typed|2026-10-04")
	now := func() time.Time { return time.Date(2026, 10, 6, 12, 0, 0, 0, time.Local) }
	rows := [][3]string{
		{"s-neg", "2026-10-05", "token counts and messages cannot be negative"},
		{"s-typed", "2026-10-04", "input is a JSON string"},
	}
	for _, cmd := range []string{"usage", "doctor"} {
		t.Run(cmd, func(t *testing.T) {
			var out, errb bytes.Buffer
			if code := runWith([]string{cmd}, &out, &errb, now); code != 0 {
				t.Fatalf("exit %d: %s", code, errb.String())
			}
			got := out.String()
			if !strings.Contains(got, "rejected by the record: 2 rows") {
				t.Errorf("no count of rejected rows in:\n%s", got)
			}
			for _, r := range rows {
				found := false
				for _, line := range strings.Split(got, "\n") {
					if strings.Contains(line, r[0]) && strings.Contains(line, r[1]) && strings.Contains(line, r[2]) {
						found = true
					}
				}
				if !found {
					t.Errorf("no line with %s, %s and %q in:\n%s", r[0], r[1], r[2], got)
				}
			}
			if strings.Contains(got, "s-ok") {
				t.Errorf("an accepted row is listed:\n%s", got)
			}
		})
	}
}

// No rejected rows, no section: the report and doctor stay as they were.
func TestUsageNoRejectedRowsNoSection(t *testing.T) {
	fixtureEnv(t)
	t.Setenv("CLAUDE_CONFIG_DIR", t.TempDir())
	now := func() time.Time { return time.Date(2026, 10, 6, 12, 0, 0, 0, time.Local) }
	var out, errb bytes.Buffer
	if code := runWith([]string{"usage"}, &out, &errb, now); code != 0 {
		t.Fatalf("exit %d: %s", code, errb.String())
	}
	if strings.Contains(out.String(), "rejected") {
		t.Errorf("a rejected section with nothing rejected:\n%s", out.String())
	}
}

// writeLedgerRows writes a ledger holding one line per "session|day" key.
func writeLedgerRows(t *testing.T, data string, keys ...string) {
	t.Helper()
	var b strings.Builder
	b.WriteString(`{"generation":1}` + "\n")
	for _, k := range keys {
		sid, day, _ := strings.Cut(k, "|")
		fmt.Fprintf(&b, `{"session_id":%q,"day":%q,"initiative":"init-a","messages":1,"input":1}`+"\n", sid, day)
	}
	if err := os.WriteFile(filepath.Join(data, "usage.jsonl"), []byte(b.String()), 0o600); err != nil {
		t.Fatal(err)
	}
}

// G3 (leftovers-62 FR-3): over a post state with two rejected rows, one of
// them gone from the ledger, `organizer usage --json` carries the other as
// {session_id, day, reason}, the gone one leaves the state, and doctor
// prints the rejected rows with no blank line before them.
func TestLF62G3RejectedRowsInJSONPrunedNoBlankLine(t *testing.T) {
	fixtureEnv(t)
	t.Setenv("CLAUDE_CONFIG_DIR", t.TempDir())
	data := filepath.Join(os.Getenv("XDG_DATA_HOME"), "organizer")
	if err := os.MkdirAll(data, 0o700); err != nil {
		t.Fatal(err)
	}
	state := `{"accepted":{},"rejected":{` +
		`"s-neg|2026-10-05":{"session_id":"s-neg","day":"2026-10-05","reason":"token counts and messages cannot be negative","hash":"h1","at":"2026-10-06T09:00:00Z"},` +
		`"s-gone|2026-10-04":{"session_id":"s-gone","day":"2026-10-04","reason":"input is a JSON string","hash":"h2","at":"2026-10-06T09:00:00Z"}}}`
	statePath := filepath.Join(data, "usage-post.json")
	if err := os.WriteFile(statePath, []byte(state), 0o600); err != nil {
		t.Fatal(err)
	}
	writeLedgerRows(t, data, "s-neg|2026-10-05")
	now := func() time.Time { return time.Date(2026, 10, 6, 12, 0, 0, 0, time.Local) }

	var out, errb bytes.Buffer
	if code := runWith([]string{"usage", "--json"}, &out, &errb, now); code != 0 {
		t.Fatalf("exit %d: %s", code, errb.String())
	}
	var v struct {
		Rejected []map[string]any `json:"rejected"`
	}
	if err := json.Unmarshal(out.Bytes(), &v); err != nil {
		t.Fatal(err)
	}
	want := map[string]any{"session_id": "s-neg", "day": "2026-10-05", "reason": "token counts and messages cannot be negative"}
	if len(v.Rejected) != 1 || !reflect.DeepEqual(v.Rejected[0], want) {
		t.Errorf("rejected = %v, want [%v]", v.Rejected, want)
	}
	b, _ := os.ReadFile(statePath)
	if strings.Contains(string(b), "s-gone") || !strings.Contains(string(b), "s-neg") {
		t.Errorf("post state after the pass: %s; want s-neg kept and s-gone pruned", b)
	}

	out.Reset()
	if code := runWith([]string{"doctor"}, &out, &errb, now); code != 0 {
		t.Fatalf("doctor exit %d: %s", code, errb.String())
	}
	got := out.String()
	if !strings.Contains(got, "usage post: off: no record_url\nrejected by the record: 1 row") {
		t.Errorf("doctor: want the rejected rows right under the usage post line, no blank line:\n%s", got)
	}
}
