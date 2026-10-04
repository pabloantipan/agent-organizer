package config

import (
	"os"
	"path/filepath"
	"strings"
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

// The roles key absent is the spec's default list, in its order; `roles: []`
// is no roles; a list replaces the default whole.
func TestLoadRoles(t *testing.T) {
	for _, c := range []struct {
		name, body string
		want       []string
	}{
		{"absent", "machine: mac\n", []string{"Hephaistos", "Aglaea", "Ariadna", "Daedalus", "Talos", "Hermione"}},
		{"empty", "machine: mac\nroles: []\n", nil},
		{"own", "machine: mac\nroles:\n  - name: Solo\n    sessions: solo-*\n    bitacora: <initiative>/b.md\n    here: true\n", []string{"Solo"}},
	} {
		t.Run(c.name, func(t *testing.T) {
			p := filepath.Join(t.TempDir(), "config.yaml")
			if err := os.WriteFile(p, []byte(c.body), 0o644); err != nil {
				t.Fatal(err)
			}
			t.Setenv("ORGANIZER_CONFIG", p)
			cfg, _, err := Load()
			if err != nil {
				t.Fatal(err)
			}
			var got []string
			for _, r := range cfg.Roles {
				got = append(got, r.Name)
			}
			if strings.Join(got, ",") != strings.Join(c.want, ",") {
				t.Fatalf("roles = %v, want %v", got, c.want)
			}
		})
	}
	for _, r := range DefaultRoles() {
		if (r.Name == "Talos" || r.Name == "Hermione") != !r.Here {
			t.Errorf("%s here = %v", r.Name, r.Here)
		}
		if !r.Here && r.Description != "PLV infra, on odyssey" {
			t.Errorf("%s description = %q", r.Name, r.Description)
		}
	}
}

// Saving `roles: []` keeps it empty: a config that turned roles off must not
// get the default list back on the next save and load.
func TestSaveKeepsNoRoles(t *testing.T) {
	t.Setenv("ORGANIZER_CONFIG", filepath.Join(t.TempDir(), "config.yaml"))
	cfg := Default()
	cfg.Roles = []Role{}
	if err := Save(cfg); err != nil {
		t.Fatal(err)
	}
	got, _, err := Load()
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Roles) != 0 {
		t.Fatalf("roles after save = %v, want none", got.Roles)
	}
}
