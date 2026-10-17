package cli

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// M6, the CLI half: a card with no branch exits 2 naming what is missing.
func TestReviewCardWithoutBranchExits2(t *testing.T) {
	home := t.TempDir()
	root := filepath.Join(home, "init-r")
	for rel, body := range map[string]string{
		"working-on/initiative.yaml": "id: init-r\ntitle: R\nstatus: active\n",
		"working-on/no-branch.md":    "---\ntitle: x\nstatus: next\nupdated: 2026-10-15\nnext: \"x\"\n---\n",
	} {
		p := filepath.Join(root, rel)
		_ = os.MkdirAll(filepath.Dir(p), 0o755)
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	cfg := filepath.Join(t.TempDir(), "config.yaml")
	if err := os.WriteFile(cfg, []byte("machine: test\nroots: ["+home+"]\nmax_depth: 2\nauth: off\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("ORGANIZER_CONFIG", cfg)
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	var out, errb bytes.Buffer
	code := runWith([]string{"review", "init-r", "no-branch"}, &out, &errb, time.Now)
	if code != 2 || !strings.Contains(errb.String(), "card no-branch has no branch") {
		t.Errorf("exit %d, stderr %q", code, errb.String())
	}
}

// FR-10: doctor names node, or says it is missing, beside go.
func TestReviewStatusNamesNode(t *testing.T) {
	if s := reviewStatus(); !strings.Contains(s, "go ") || !strings.Contains(s, "node ") {
		t.Errorf("reviewStatus %q", s)
	}
	t.Setenv("PATH", t.TempDir())
	if s := reviewStatus(); !strings.Contains(s, "go not on PATH") || !strings.Contains(s, "node not on PATH, so no TypeScript is read") {
		t.Errorf("reviewStatus without tools %q", s)
	}
}
