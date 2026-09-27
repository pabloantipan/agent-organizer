package scan

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// FR-11, G7, the bitácora half: the fixture's HAND-OFF section reaches the
// activity, heading and body, and stops at the next heading.
func TestReadFSEHandOff(t *testing.T) {
	si := initA(t)
	a := si.FSE
	if a.Empty() {
		t.Fatal("init-a has a bitácora; activity is empty")
	}
	if a.HandOff != "HAND-OFF — 2026-09-02, the fixture hand-off" {
		t.Errorf("hand-off heading=%q", a.HandOff)
	}
	if !strings.HasPrefix(a.HandOffBody, "- **Task:** initiative A's spec") {
		t.Errorf("body starts %q", firstLine(a.HandOffBody))
	}
	if !strings.Contains(a.HandOffBody, "Waiting on Pablo") {
		t.Errorf("body is missing its last bullet: %q", a.HandOffBody)
	}
	if strings.Contains(a.HandOffBody, "Open questions") || strings.Contains(a.HandOffBody, "none yet") {
		t.Errorf("body ran past the next heading: %q", a.HandOffBody)
	}
	if !strings.HasSuffix(a.Path, filepath.FromSlash(bitacoraFile)) {
		t.Errorf("path=%q", a.Path)
	}
	// The scan reads the bitácora; git is off in the fixture options, so there
	// are no commits and, either way, no problem.
	if len(a.Commits) != 0 {
		t.Errorf("commits without git: %+v", a.Commits)
	}
	for _, p := range si.Problems {
		if strings.Contains(p.Path, "bitacora") {
			t.Errorf("bitácora reported a problem: %+v", p)
		}
	}
}

// FR-11, G7, the git half: the commits the FSE signed, newest first, and
// nothing else. The root is a temp git repo; the bitácora is the fixture's.
func TestReadFSECommits(t *testing.T) {
	cases := []struct {
		name  string
		fse   int // FSE-signed commits to make
		want  int
		first string
	}{
		{name: "two commits", fse: 2, want: 2, first: "docs(fse): signed 2"},
		// The board carries ten; an FSE that committed twelve times shows the
		// last ten.
		{name: "capped at ten", fse: 12, want: fseCommitLimit, first: "docs(fse): signed 12"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			root := fseRepo(t, tc.fse, true)
			si := ReadInitiative(root, gitOpts())
			a := si.FSE
			if a.HandOff != "HAND-OFF — 2026-09-02, the fixture hand-off" {
				t.Errorf("hand-off=%q", a.HandOff)
			}
			if len(a.Commits) != tc.want {
				t.Fatalf("commits=%d, want %d: %+v", len(a.Commits), tc.want, a.Commits)
			}
			if a.Commits[0].Subject != tc.first {
				t.Errorf("newest=%q, want %q", a.Commits[0].Subject, tc.first)
			}
			for i, c := range a.Commits {
				if c.SHA == "" || c.At == "" {
					t.Errorf("commit %d has no sha or time: %+v", i, c)
				}
				if strings.Contains(c.Subject, "nobody") || strings.Contains(c.Subject, "quoted") {
					t.Errorf("commit %d is not the FSE's: %+v", i, c)
				}
				if i > 0 && a.Commits[i-1].At < c.At {
					t.Errorf("commits are not newest first: %q before %q", a.Commits[i-1].At, c.At)
				}
			}
			if len(si.Problems) != 0 {
				t.Errorf("problems: %+v", si.Problems)
			}
		})
	}
}

// FR-11: no bitácora, no activity, no problem — the normal case, since most
// initiatives have no FSE.
func TestReadFSENoBitacora(t *testing.T) {
	root := fseRepo(t, 1, false)
	si := ReadInitiative(root, gitOpts())
	if si.FSE.HandOff != "" || si.FSE.HandOffBody != "" || si.FSE.Path != "" {
		t.Errorf("hand-off without a bitácora: %+v", si.FSE)
	}
	if len(si.Problems) != 0 {
		t.Errorf("problems: %+v", si.Problems)
	}
	// Only the hand-off is missing: the commits are still the FSE's.
	if len(si.FSE.Commits) != 1 || si.FSE.Commits[0].Subject != "docs(fse): signed 1" {
		t.Errorf("commits=%+v", si.FSE.Commits)
	}
}

// An initiative root that only sits inside a git repo has no commits of its
// own: the fixture home is inside this repo, and reporting its history as the
// FSE's would be a lie.
func TestFSECommitsIgnoreTheEnclosingRepo(t *testing.T) {
	sandbox(t)
	home := fixtureHome(t)
	o := opts(home)
	o.Git = true
	si := ReadInitiative(filepath.Join(home, "init-a"), o)
	if len(si.FSE.Commits) != 0 {
		t.Errorf("commits from the enclosing repo: %+v", si.FSE.Commits)
	}
}

func gitOpts() Options {
	return Options{
		Git:        true,
		GitTimeout: 10 * time.Second,
		Now:        func() time.Time { return time.Date(2026, 9, 2, 12, 0, 0, 0, time.UTC) },
	}
}

// fseRepo writes an initiative root that is its own git repo under t.TempDir():
// n commits signed "Committed-by: FSE", newest last, over two commits that are
// not the FSE's, and the fixture bitácora when bitacora is true.
func fseRepo(t *testing.T, n int, bitacora bool) string {
	t.Helper()
	sandbox(t)
	root := filepath.Join(t.TempDir(), "init-fse")
	mkdirAll(t, filepath.Join(root, workingOnDir))
	write(t, filepath.Join(root, workingOnDir, initiativeFile), "id: init-fse\ntitle: The FSE fixture\nclient: personal\n")
	if bitacora {
		src := filepath.Join(fixtureHome(t), "init-a", filepath.FromSlash(bitacoraFile))
		b, err := os.ReadFile(src)
		if err != nil {
			t.Fatal(err)
		}
		mkdirAll(t, filepath.Dir(filepath.Join(root, filepath.FromSlash(bitacoraFile))))
		write(t, filepath.Join(root, filepath.FromSlash(bitacoraFile)), string(b))
	}

	run := func(at string, args ...string) {
		t.Helper()
		cmd := exec.Command("git", append([]string{"-C", root}, args...)...)
		// The test owns its identity and its dates, and never reads Pablo's
		// git config.
		cmd.Env = append(os.Environ(),
			"GIT_CONFIG_GLOBAL=/dev/null", "GIT_CONFIG_SYSTEM=/dev/null",
			"GIT_AUTHOR_NAME=fixture", "GIT_AUTHOR_EMAIL=fixture@example.com",
			"GIT_COMMITTER_NAME=fixture", "GIT_COMMITTER_EMAIL=fixture@example.com",
			"GIT_AUTHOR_DATE="+at, "GIT_COMMITTER_DATE="+at,
		)
		if out, err := cmd.CombinedOutput(); err != nil {
			t.Fatalf("git %s: %v\n%s", strings.Join(args, " "), err, out)
		}
	}
	run("", "init", "-q", "-b", "main")
	commit := func(i int, msg string) {
		write(t, filepath.Join(root, fmt.Sprintf("f%d", i)), msg)
		// A minute apart, so newest first is a real ordering.
		at := time.Date(2026, 9, 2, 9, i, 0, 0, time.UTC).Format(time.RFC3339)
		run(at, "add", "-A")
		run(at, "commit", "-q", "-m", msg)
	}
	commit(0, "chore: signed by nobody")
	// The trailer quoted in the middle of a message is not a trailer: git's
	// --grep matches it, the trailer field does not, and the activity must
	// follow the trailer.
	commit(1, "chore: quoted trailer\n\nCommitted-by: FSE\n\nbut this paragraph is prose, so the line above is not a trailer.")
	for i := 1; i <= n; i++ {
		commit(i+1, fmt.Sprintf("docs(fse): signed %d\n\nCommitted-by: FSE", i))
	}
	return root
}

func mkdirAll(t *testing.T, dir string) {
	t.Helper()
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
}

func write(t *testing.T, path, body string) {
	t.Helper()
	if err := os.WriteFile(path, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
}

func firstLine(s string) string {
	if i := strings.IndexByte(s, '\n'); i >= 0 {
		return s[:i]
	}
	return s
}
