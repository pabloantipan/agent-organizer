package cli

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	ledger "organizer/internal/usage"
)

func TestUsageCmd(t *testing.T) {
	now := func() time.Time { return time.Date(2026, 10, 6, 12, 0, 0, 0, time.Local) }
	tests := []struct {
		name     string
		args     []string
		wantCode int
		want     string
	}{
		{"empty home says so", []string{"usage"}, 0, "No sessions recorded yet"},
		{"a named week", []string{"usage", "--week", "2026-W40"}, 0, "2026-W40 · 2026-09-28 to 2026-10-04"},
		{"json is the app's value", []string{"usage", "--json"}, 0, `"week": "2026-W41"`},
		{"unknown cut", []string{"usage", "--by", "colour"}, 2, ""},
		{"not a week", []string{"usage", "--week", "41"}, 2, ""},
		{"stray argument", []string{"usage", "organizer"}, 2, ""},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fixtureEnv(t)
			t.Setenv("CLAUDE_CONFIG_DIR", t.TempDir())
			var out, errb bytes.Buffer
			if code := runWith(tt.args, &out, &errb, now); code != tt.wantCode {
				t.Errorf("exit = %d, want %d (stderr %s)", code, tt.wantCode, errb.String())
			}
			if tt.want != "" && !strings.Contains(out.String(), tt.want) {
				t.Errorf("stdout %q missing %q", out.String(), tt.want)
			}
		})
	}
}

// The report over a transcript: the week's tokens, the cut's rows, and Not
// attributed last even when nothing is in it.
func TestUsageCmdOverATranscript(t *testing.T) {
	fixtureEnv(t)
	cfgDir := t.TempDir()
	t.Setenv("CLAUDE_CONFIG_DIR", cfgDir)
	dir := filepath.Join(cfgDir, "projects", "-x")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	line := `{"type":"assistant","cwd":"/nowhere","sessionId":"s1","timestamp":"2026-10-05T12:00:00.000Z","message":{"id":"m1","model":"claude-opus-5-5","usage":{"input_tokens":1,"output_tokens":2,"cache_read_input_tokens":3,"cache_creation_input_tokens":4}}}` + "\n"
	if err := os.WriteFile(filepath.Join(dir, "s1.jsonl"), []byte(line), 0o644); err != nil {
		t.Fatal(err)
	}
	now := func() time.Time { return time.Date(2026, 10, 6, 12, 0, 0, 0, time.Local) }
	var out, errb bytes.Buffer
	if code := runWith([]string{"usage", "--json"}, &out, &errb, now); code != 0 {
		t.Fatalf("exit %d: %s", code, errb.String())
	}
	var v ledger.View
	if err := json.Unmarshal(out.Bytes(), &v); err != nil {
		t.Fatal(err)
	}
	if v.ThisWeek.Tokens != 10 || v.ThisWeek.Sessions != 1 || v.ThisWeek.WithoutCost != 1 {
		t.Errorf("this week = %+v", v.ThisWeek)
	}
	for _, c := range ledger.Cuts {
		rows := v.Cuts[c]
		if len(rows) == 0 || !rows[len(rows)-1].NotAttributed {
			t.Errorf("cut %s: Not attributed must be last, got %+v", c, rows)
		}
	}
	out.Reset()
	if code := runWith([]string{"usage", "--by", "role"}, &out, &errb, now); code != 0 || !strings.Contains(out.String(), "no session name") {
		t.Errorf("role cut should give the reason:\n%s", out.String())
	}
}
