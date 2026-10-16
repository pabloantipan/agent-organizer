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
	// No cost source, every token opus-5-5: priced from the table (usage-audit FR-5).
	if v.ThisWeek.Tokens != 10 || v.ThisWeek.Sessions != 1 || v.ThisWeek.WithoutCost != 0 || v.ThisWeek.Money <= 0 {
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

// L2 (leftovers-39 FR-2): a week whose sessions carry no cost prints `—`
// and the count, never $0.00; a priced share is named.
func TestWriteUsageMoney(t *testing.T) {
	tests := []struct {
		name    string
		t       ledger.Totals
		want    string
		wantNot string
	}{
		{"no cost at all", ledger.Totals{Sessions: 7, WithoutCost: 7}, "money     — (no cost recorded for 7 sessions)\n", "$0.00"},
		{"one session, no cost", ledger.Totals{Sessions: 1, WithoutCost: 1}, "money     — (no cost recorded for 1 session)\n", "$0.00"},
		{"a priced session", ledger.Totals{Sessions: 3, WithoutCost: 1, Money: 42.5, Priced: 12.5}, "money     $42.50; excludes 1 session with no cost; $12.50 priced\n", "—"},
		{"nothing priced", ledger.Totals{Sessions: 2, Money: 5}, "money     $5.00\n", "priced"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.t.Week, tt.t.Start, tt.t.End = "2026-W34", "2026-08-17", "2026-08-23"
			var out bytes.Buffer
			WriteUsage(&out, ledger.View{Week: "2026-W34", FirstDay: "2026-08-17", ThisWeek: tt.t}, "initiative")
			if !strings.Contains(out.String(), tt.want) {
				t.Errorf("printed\n%s\nwant a line %q", out.String(), tt.want)
			}
			if strings.Contains(out.String(), tt.wantNot) {
				t.Errorf("printed\n%s\nwant no %q", out.String(), tt.wantNot)
			}
		})
	}
}
