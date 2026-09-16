package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestAuthModeDefaultsToOff(t *testing.T) {
	if got := Default().AuthMode(); got != AuthOff {
		t.Fatalf("default auth mode = %q, want %q", got, AuthOff)
	}
}

func TestAuthMode(t *testing.T) {
	cases := []struct {
		in, want string
	}{
		{"", AuthOff},
		{"off", AuthOff},
		{"firebase", AuthFirebase},
		{" Firebase ", AuthFirebase},
		{"entra", AuthOff}, // not a mode yet: unknown is off, never a sign-in
	}
	for _, c := range cases {
		if got := (Config{Auth: c.in}).AuthMode(); got != c.want {
			t.Errorf("AuthMode(%q) = %q, want %q", c.in, got, c.want)
		}
	}
}

// A config file without an auth key is off, and one that names firebase is
// read back as firebase.
func TestLoadReadsAuth(t *testing.T) {
	for _, c := range []struct{ body, want string }{
		{"machine: mac\n", AuthOff},
		{"machine: mac\nauth: firebase\n", AuthFirebase},
	} {
		p := filepath.Join(t.TempDir(), "config.yaml")
		if err := os.WriteFile(p, []byte(c.body), 0o644); err != nil {
			t.Fatal(err)
		}
		t.Setenv("ORGANIZER_CONFIG", p)
		cfg, exists, err := Load()
		if err != nil || !exists {
			t.Fatalf("Load: %v exists=%v", err, exists)
		}
		if got := cfg.AuthMode(); got != c.want {
			t.Errorf("%q -> %q, want %q", c.body, got, c.want)
		}
	}
}
