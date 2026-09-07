package cli

import (
	"bytes"
	"path/filepath"
	"strings"
	"testing"
	"time"
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
