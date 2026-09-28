package service

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
)

func helpService(doc string) *Service {
	cfg := config.Default()
	cfg.HelpDoc = doc
	return NewWith(cfg, cache.State{}, time.Now)
}

func TestHelpReadsTheFileAtCallTime(t *testing.T) {
	path := filepath.Join(t.TempDir(), "how-we-build.md")
	if err := os.WriteFile(path, []byte("# One\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	s := helpService(path)
	if got := s.Help(); got.Text != "# One\n" || got.Problem != "" || got.Path != path {
		t.Fatalf("first read = %+v", got)
	}
	// An edit shows on the next open: nothing is cached.
	if err := os.WriteFile(path, []byte("# Two\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if got := s.Help(); got.Text != "# Two\n" {
		t.Fatalf("second read = %q, want the edited file", got.Text)
	}
}

func TestHelpMissingFileNamesPathAndKey(t *testing.T) {
	path := filepath.Join(t.TempDir(), "nope", "how-we-build.md")
	got := helpService(path).Help()
	if got.Text != "" {
		t.Fatalf("text = %q, want none", got.Text)
	}
	for _, want := range []string{path, "help_doc", "does not exist"} {
		if !strings.Contains(got.Problem, want) {
			t.Errorf("problem %q does not name %q", got.Problem, want)
		}
	}
	if got.Path != path || got.Key != "help_doc" {
		t.Errorf("path, key = %q, %q", got.Path, got.Key)
	}
}

func TestHelpUnreadableFileNamesPathAndKey(t *testing.T) {
	dir := t.TempDir() // a directory cannot be read as a file
	got := helpService(dir).Help()
	if got.Text != "" || !strings.Contains(got.Problem, dir) || !strings.Contains(got.Problem, "help_doc") {
		t.Fatalf("help = %+v", got)
	}
}

func TestHelpDocDefaultsAndExpands(t *testing.T) {
	home, _ := os.UserHomeDir()
	want := filepath.Join(home, "agent-slack", "docs", "how-we-build.md")
	if got := config.Default().HelpDocPath(); got != want {
		t.Errorf("default = %q, want %q", got, want)
	}
	if got := (config.Config{}).HelpDocPath(); got != want {
		t.Errorf("empty = %q, want %q", got, want)
	}
}
