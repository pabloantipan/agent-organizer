package scan

import (
	"os"
	"os/exec"
	"path/filepath"
	"testing"
	"time"
)

// FR-9 of initiative-header, amendment 1: the charter's modified mark is git
// status of working-on/initiative.yaml alone; not a repo is false.
func TestCharterModified(t *testing.T) {
	if _, err := exec.LookPath("git"); err != nil {
		t.Skip("git not installed")
	}
	root := t.TempDir()
	charter := filepath.Join(root, workingOnDir, initiativeFile)
	if err := os.MkdirAll(filepath.Dir(charter), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(charter, []byte("id: c\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if charterModified(root, 5*time.Second) {
		t.Error("not a repo should read as not modified")
	}
	run := func(args ...string) {
		t.Helper()
		cmd := exec.Command("git", append([]string{"-C", root}, args...)...)
		cmd.Env = append(os.Environ(), "GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t", "GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t")
		if out, err := cmd.CombinedOutput(); err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
	}
	run("init", "-q")
	run("add", ".")
	run("commit", "-q", "-m", "charter")
	// another file changed does not mark the charter
	if err := os.WriteFile(filepath.Join(root, "other.txt"), []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	if charterModified(root, 5*time.Second) {
		t.Error("a clean charter should read as not modified")
	}
	if err := os.WriteFile(charter, []byte("id: c\ngoal: new\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if !charterModified(root, 5*time.Second) {
		t.Error("an edited, uncommitted charter should read as modified")
	}
}
