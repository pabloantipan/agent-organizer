package cli

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/config"
)

// With auth off the identity verbs say so in one line and exit 0: a machine
// that never signs in must not look broken.
func TestIdentityVerbsWithAuthOff(t *testing.T) {
	dir := t.TempDir()
	cfgPath := filepath.Join(dir, "config.yaml")
	if err := os.WriteFile(cfgPath, []byte("machine: lodestar\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("ORGANIZER_CONFIG", cfgPath)
	t.Setenv("XDG_DATA_HOME", dir)
	now := func() time.Time { return time.Date(2026, 9, 16, 10, 0, 0, 0, time.UTC) }

	for _, verb := range []string{"login", "logout", "whoami"} {
		var out, errb bytes.Buffer
		if code := runWith([]string{verb}, &out, &errb, now); code != 0 {
			t.Errorf("%s exit = %d, want 0 (stderr %q)", verb, code, errb.String())
		}
		lines := strings.Split(strings.TrimRight(out.String(), "\n"), "\n")
		if len(lines) != 1 || !strings.HasPrefix(lines[0], "auth is off") {
			t.Errorf("%s printed %q, want one line starting with \"auth is off\"", verb, out.String())
		}
	}

	// factory-key is the one identity verb that refuses: its key is signed
	// with a developer token, and there is none to sign with.
	var fout, ferr bytes.Buffer
	if code := runWith([]string{"factory-key"}, &fout, &ferr, now); code != 2 {
		t.Errorf("factory-key exit = %d, want 2", code)
	}
	if fout.Len() != 0 {
		t.Errorf("factory-key wrote to stdout: %q", fout.String())
	}
	if got := strings.TrimSpace(ferr.String()); got != "auth is off: issue factory keys with the record's CLI (see ops/README.md, `--role key`)" {
		t.Errorf("factory-key printed %q", got)
	}

	var out, errb bytes.Buffer
	if code := runWith([]string{"sync"}, &out, &errb, now); code != 0 {
		t.Errorf("sync exit = %d, want 0 (stderr %q)", code, errb.String())
	}
	if got := strings.TrimSpace(out.String()); got != "sync skipped: auth off" {
		t.Errorf("sync printed %q, want %q", got, "sync skipped: auth off")
	}
}

func mustLoad(t *testing.T) config.Config {
	t.Helper()
	cfg, _, err := config.Load()
	if err != nil {
		t.Fatal(err)
	}
	return cfg
}

// Doctor reports the mode; with auth off there is no account line to print.
func TestDoctorReportsTheAuthMode(t *testing.T) {
	dir := t.TempDir()
	cfgPath := filepath.Join(dir, "config.yaml")
	t.Setenv("ORGANIZER_CONFIG", cfgPath)
	t.Setenv("XDG_DATA_HOME", dir)
	now := func() time.Time { return time.Date(2026, 9, 16, 10, 0, 0, 0, time.UTC) }

	for _, c := range []struct{ body, want string }{
		{"machine: lodestar\nroots: []\n", "auth: off"},
		{"machine: lodestar\nroots: []\nauth: firebase\n", "auth: firebase"},
	} {
		if err := os.WriteFile(cfgPath, []byte(c.body), 0o644); err != nil {
			t.Fatal(err)
		}
		var out, errb bytes.Buffer
		if code := doctor(mustLoad(t), nil, &out, &errb, now); code != 0 {
			t.Fatalf("doctor exit %d: %s", code, errb.String())
		}
		if !strings.Contains(out.String(), c.want+"\n") {
			t.Errorf("doctor did not report %q:\n%s", c.want, out.String())
		}
		if c.want == "auth: off" && strings.Contains(out.String(), "account:") {
			t.Errorf("auth off must print no account line:\n%s", out.String())
		}
	}
}
