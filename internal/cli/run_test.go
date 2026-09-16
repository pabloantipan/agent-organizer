package cli

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/session"
)

// fixtureEnv points config, cache and prompt lookups at the testdata home so
// the verb can be exercised without touching the machine's own state.
func fixtureEnv(t *testing.T) string {
	t.Helper()
	home, err := filepath.Abs(filepath.Join("..", "..", "testdata", "home"))
	if err != nil {
		t.Fatal(err)
	}
	t.Setenv("HOME", home)
	t.Setenv("XDG_CONFIG_HOME", t.TempDir())
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	t.Setenv("ORGANIZER_CONFIG", filepath.Join(t.TempDir(), "config.yaml"))
	return home
}

func TestRunCmd(t *testing.T) {
	tests := []struct {
		name       string
		args       []string
		wantCode   int
		wantStdout []string
		wantStderr []string
	}{
		{
			name:     "launchable card prints the launch line",
			args:     []string{"run", "init-a", "alpha", "--print"},
			wantCode: 0,
			wantStdout: []string{
				"PROBE_PRELUDE_FILE=",
				"opus.prelude.sh",
				"PROBE_PROMPT_FILE=",
				"init-a-alpha.md",
				"init-a-probe",
				"'alpha'",
			},
		},
		{
			name:       "flag before the positionals reads the same",
			args:       []string{"run", "--print", "init-a", "alpha"},
			wantCode:   0,
			wantStdout: []string{"init-a-probe", "'alpha'"},
		},
		{
			name:       "card without the contract is refused",
			args:       []string{"run", "init-a", "gamma", "--print"},
			wantCode:   2,
			wantStderr: []string{"cannot be launched", "spec, gate, boundary", "gamma.md"},
		},
		{
			name:       "unknown card is an error, not a refusal",
			args:       []string{"run", "init-a", "nosuch", "--print"},
			wantCode:   1,
			wantStderr: []string{`has no card "nosuch"`},
		},
		{
			name:       "unknown initiative",
			args:       []string{"run", "nope", "alpha", "--print"},
			wantCode:   1,
			wantStderr: []string{"not found on this machine"},
		},
		{
			name:       "wrong arity",
			args:       []string{"run", "init-a"},
			wantCode:   2,
			wantStderr: []string{"usage: organizer run"},
		},
	}
	now := func() time.Time { return time.Date(2026, 9, 2, 12, 0, 0, 0, time.UTC) }
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fixtureEnv(t)
			var out, errb bytes.Buffer
			code := runWith(tt.args, &out, &errb, now)
			if code != tt.wantCode {
				t.Errorf("exit = %d, want %d\nstdout: %s\nstderr: %s", code, tt.wantCode, out.String(), errb.String())
			}
			for _, want := range tt.wantStdout {
				if !strings.Contains(out.String(), want) {
					t.Errorf("stdout missing %q; got:\n%s", want, out.String())
				}
			}
			for _, want := range tt.wantStderr {
				if !strings.Contains(errb.String(), want) {
					t.Errorf("stderr missing %q; got:\n%s", want, errb.String())
				}
			}
		})
	}
}

func TestWriteRunsGolden(t *testing.T) {
	// Times are built in the local zone so the rendered table is the same
	// wherever the test runs.
	at := func(day, hour, min int) time.Time {
		return time.Date(2026, 9, day, hour, min, 0, 0, time.Local)
	}
	rows := []session.Run{
		{PID: 100, SessionID: "b319f3da", Session: "organizer-probe-run-gate", Model: "Opus 5",
			Initiative: "organizer", Card: "run-gate", Branch: "run-gate",
			UsedPercent: 58.4, InputTokens: 584000, WindowSize: 1000000, CostUSD: 41.253,
			FirstSeen: at(6, 10, 0), LastSeen: at(6, 11, 30), Ended: true},
		{PID: 101, SessionID: "4cc271cd", Session: "slack-probe-builder3", Model: "Fable 5.1",
			Initiative: "agent-slack", Card: "factory-alignment",
			UsedPercent: 18, CostUSD: 7.57,
			FirstSeen: at(5, 21, 5), LastSeen: at(6, 9, 40)},
		{PID: 102, SessionID: "a9e8c6c0", Model: "",
			UsedPercent: 10, CostUSD: 2.22,
			FirstSeen: at(3, 14, 0), LastSeen: at(3, 14, 0), Ended: true},
	}
	var buf bytes.Buffer
	WriteRuns(&buf, rows)
	got := buf.String()

	golden := filepath.Join("testdata", "runs.golden")
	if os.Getenv("UPDATE_GOLDEN") == "1" {
		_ = os.MkdirAll("testdata", 0o755)
		_ = os.WriteFile(golden, []byte(got), 0o644)
	}
	want, err := os.ReadFile(golden)
	if err != nil {
		t.Fatalf("no golden file; run with UPDATE_GOLDEN=1. Output was:\n%s", got)
	}
	if got != string(want) {
		t.Errorf("runs table drifted.\n--- got ---\n%s\n--- want ---\n%s", got, want)
	}
}

func TestWriteRunsEmpty(t *testing.T) {
	var buf bytes.Buffer
	WriteRuns(&buf, nil)
	if !strings.Contains(buf.String(), "no agent sessions recorded yet") {
		t.Errorf("empty archive should say so, got %q", buf.String())
	}
}

func TestRunsCmd(t *testing.T) {
	tests := []struct {
		name     string
		args     []string
		wantCode int
		want     string
	}{
		{"table", []string{"runs"}, 0, "no agent sessions recorded yet"},
		{"json is a list", []string{"runs", "--json"}, 0, "[]"},
		{"filtered by initiative", []string{"runs", "init-a", "--json"}, 0, "[]"},
		{"too many arguments", []string{"runs", "a", "b"}, 2, ""},
	}
	now := func() time.Time { return time.Date(2026, 9, 2, 12, 0, 0, 0, time.UTC) }
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fixtureEnv(t)
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

func TestWallFormats(t *testing.T) {
	cases := map[time.Duration]string{
		0:                "-",
		30 * time.Second: "1m",
		45 * time.Minute: "45m",
		90 * time.Minute: "1h30m",
		26 * time.Hour:   "1d2h",
	}
	for d, want := range cases {
		if got := wall(d); got != want {
			t.Errorf("wall(%s) = %q, want %q", d, got, want)
		}
	}
}
