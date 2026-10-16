package cli

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// FR-5: doctor says whether diagrams can draw, over a fake home (never the
// real ~/.nvm or ~/.mermaid).
func TestDoctorReportsDiagrams(t *testing.T) {
	home := t.TempDir()
	cfgPath := filepath.Join(home, "config.yaml")
	os.WriteFile(cfgPath, []byte("machine: lodestar\nroots: []\n"), 0o644)
	t.Setenv("ORGANIZER_CONFIG", cfgPath)
	t.Setenv("XDG_DATA_HOME", filepath.Join(home, "data"))
	t.Setenv("HOME", home)
	t.Setenv("MERMAID_HOME", "")
	t.Setenv("PATH", filepath.Join(home, "empty"))
	now := func() time.Time { return time.Date(2026, 10, 15, 10, 0, 0, 0, time.UTC) }
	doc := func() string {
		var out, errb bytes.Buffer
		if code := doctor(mustLoad(t), nil, &out, &errb, now); code != 0 {
			t.Fatalf("doctor exit %d: %s", code, errb.String())
		}
		return out.String()
	}

	if got := doc(); !strings.Contains(got, "diagrams: mmdc not found (npm install -g @mermaid-js/mermaid-cli); dark style missing: ~/.mermaid/classdefs-dark.mmd\n") {
		t.Errorf("doctor without mmdc or style:\n%s", got)
	}

	bin := filepath.Join(home, ".nvm", "versions", "node", "v24.0.1", "bin")
	os.MkdirAll(bin, 0o755)
	os.WriteFile(filepath.Join(bin, "mmdc"), []byte("#!/bin/sh\n"), 0o755)
	m := filepath.Join(home, ".mermaid")
	os.MkdirAll(m, 0o755)
	for _, f := range []string{"classdefs-dark.mmd", "mermaid-config-dark.json", "mermaid-styles-dark.css"} {
		os.WriteFile(filepath.Join(m, f), []byte("x"), 0o644)
	}
	if got, want := doc(), "diagrams: mmdc "+filepath.Join(bin, "mmdc")+", dark style ok\n"; !strings.Contains(got, want) {
		t.Errorf("doctor with both: want %q in\n%s", want, got)
	}
}
