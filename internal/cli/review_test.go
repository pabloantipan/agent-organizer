package cli

import (
	"bytes"
	"os"
	"os/exec"
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

// reviewRepo is an initiative whose root is its one Go repo, with a commit
// changing F and a card c1; it sets the config and data dir and returns
// the commit.
func reviewRepo(t *testing.T) string {
	t.Helper()
	home := t.TempDir()
	root := filepath.Join(home, "init-r")
	git := func(args ...string) string {
		t.Helper()
		cmd := exec.Command("git", append([]string{"-C", root}, args...)...)
		cmd.Env = append(os.Environ(), "GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t", "GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t", "GIT_CONFIG_GLOBAL=/dev/null")
		out, err := cmd.CombinedOutput()
		if err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
		return strings.TrimSpace(string(out))
	}
	write := func(rel, body string) {
		t.Helper()
		p := filepath.Join(root, rel)
		_ = os.MkdirAll(filepath.Dir(p), 0o755)
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("working-on/initiative.yaml", "id: init-r\ntitle: R\nstatus: active\n")
	write("working-on/c1.md", "---\ntitle: x\nstatus: now\nupdated: 2026-10-17\nnext: \"x\"\n---\n")
	write("go.mod", "module example.com/r\n\ngo 1.22\n")
	write("p/f.go", "package p\n\nfunc F() int { return 1 }\n")
	_ = os.MkdirAll(root, 0o755)
	git("init", "-q", "-b", "main")
	git("add", ".")
	git("commit", "-q", "-m", "base")
	write("p/f.go", "package p\n\nfunc F() int { return 2 }\n")
	git("commit", "-q", "-am", "change F")
	cfg := filepath.Join(t.TempDir(), "config.yaml")
	if err := os.WriteFile(cfg, []byte("machine: test\nroots: ["+home+"]\nmax_depth: 2\nauth: off\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("ORGANIZER_CONFIG", cfg)
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	return git("rev-parse", "HEAD")
}

// R3 (FR-12): no card, change-check not on the PATH, and a change-check
// exiting 1 with no JSON each write the map, say why in one line, exit 0.
func TestReviewWithoutReconciliation(t *testing.T) {
	sha := reviewRepo(t)
	run := func(args ...string) (string, string) { // stdout, stderr
		t.Helper()
		var out, errb bytes.Buffer
		if code := runWith(append([]string{"review", "init-r"}, args...), &out, &errb, time.Now); code != 0 {
			t.Fatalf("review %v: exit %d, stderr %q", args, code, errb.String())
		}
		path := filepath.Join(os.Getenv("XDG_DATA_HOME"), "organizer", "review", "init-r", sha, "revmap.json")
		if _, err := os.Stat(path); err != nil {
			t.Errorf("review %v: no map: %v", args, err)
		}
		return out.String(), errb.String()
	}
	check := func(name, out, why string) {
		t.Helper()
		if strings.Count(out, "no reconciliation: ") != 1 || !strings.Contains(out, "no reconciliation: "+why+"\n") {
			t.Errorf("%s: summary %q, want one line %q", name, out, why)
		}
	}
	out, _ := run(sha)
	check("no card", out, "no card")

	// a PATH with what the build needs and no change-check
	bin := t.TempDir()
	for _, tool := range []string{"git", "go", "tar"} {
		p, err := exec.LookPath(tool)
		if err != nil {
			t.Skip(tool + " not on PATH")
		}
		if err := os.Symlink(p, filepath.Join(bin, tool)); err != nil {
			t.Fatal(err)
		}
	}
	orig := os.Getenv("PATH")
	t.Setenv("PATH", bin)
	out, _ = run(sha, "--card", "c1")
	check("missing", out, "change-check not on PATH")

	fake := t.TempDir()
	if err := os.WriteFile(filepath.Join(fake, "change-check"), []byte("#!/bin/sh\necho broken\nexit 1\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", fake+string(os.PathListSeparator)+orig)
	out, _ = run(sha, "--card", "c1")
	check("fails", out, "change-check failed: output is not its --json")
}
