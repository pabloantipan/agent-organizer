package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"organizer/internal/model"
	"organizer/internal/review"
)

// Open in editor at a symbol's line (leftovers-42 FR-1, FR-2): the file is
// opened in a checkout whose HEAD is the map's head, so the line the panel
// names is the line the editor shows. Nothing is checked out for it.

// ReviewCheckout is where one repo of the map's head is checked out on
// this machine. Repo is "" for a card with one repo; Dir is "" when no
// checkout here has Head as its HEAD.
type ReviewCheckout struct {
	Repo string `json:"repo"`
	Head string `json:"head"`
	Dir  string `json:"dir"`
}

// editorWait is how long OpenReviewAt waits on the editor (leftovers-43
// FR-2): an exit in that time is an answer, a process still running is an
// editor that opened.
const editorWait = 2 * time.Second

// startEditor runs the editor's argv. Tests replace it: no test launches
// a real editor.
var startEditor = func(argv []string) error { return runEditor(argv, editorWait) }

// runEditor starts argv and waits up to wait for it (FR-2): a start that
// fails, or a non-zero exit in that time, is "editor didn't open: <the first
// stderr line>"; exit 0, or still running, is opened. A process still
// running is reaped in the background.
func runEditor(argv []string, wait time.Duration) error {
	cmd := exec.Command(argv[0], argv[1:]...)
	stderr := &stderrLine{}
	cmd.Stderr = stderr
	// a launcher that exits and leaves a child holding stderr does not hold
	// Wait for the child's life
	cmd.WaitDelay = 100 * time.Millisecond
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("editor didn't open: %s", err)
	}
	done := make(chan error, 1)
	go func() { done <- cmd.Wait() }()
	select {
	case err := <-done:
		// ErrWaitDelay is a clean exit whose child kept stderr open
		if err == nil || (errors.Is(err, exec.ErrWaitDelay) && cmd.ProcessState.Success()) {
			return nil
		}
		if line := stderr.String(); line != "" {
			return fmt.Errorf("editor didn't open: %s", line)
		}
		return fmt.Errorf("editor didn't open: %s", err)
	case <-time.After(wait):
		return nil
	}
}

// stderrLine keeps the first non-blank line written to it, at most 512
// bytes of it, and drops the rest: an editor's stderr is never buffered
// whole.
type stderrLine struct {
	mu   sync.Mutex
	buf  []byte
	done bool
}

func (f *stderrLine) Write(p []byte) (int, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	for _, b := range p {
		if f.done {
			break
		}
		switch {
		case b == '\n' && strings.TrimSpace(string(f.buf)) != "":
			f.done = true
		case b == '\n':
			f.buf = f.buf[:0]
		case len(f.buf) < 512:
			f.buf = append(f.buf, b)
		}
	}
	return len(p), nil
}

func (f *stderrLine) String() string {
	f.mu.Lock()
	defer f.mu.Unlock()
	return strings.TrimSpace(string(f.buf))
}

// reviewCheckouts is, per repo of the card, the first checkout whose HEAD
// is the map's head for that repo: the card's worktree (worktreeCandidates),
// then the repo under the initiative root.
func reviewCheckouts(root string, c model.Card, rm *review.RevMap, repos []review.Repo) []ReviewCheckout {
	out := make([]ReviewCheckout, 0, len(repos))
	for _, r := range repos {
		head := rm.Head
		for _, p := range rm.Repos {
			if r.Name != "" && p.Name == r.Name {
				head = p.Head
			}
		}
		co := ReviewCheckout{Repo: r.Name, Head: head}
		for _, dir := range append(worktreeCandidates(root, c), r.Dir) {
			if headOf(dir) == head && head != "" {
				co.Dir = dir
				break
			}
		}
		out = append(out, co)
	}
	return out
}

// headOf is the commit checked out in dir, "" when dir is no checkout.
func headOf(dir string) string {
	if st, err := os.Stat(dir); err != nil || !st.IsDir() {
		return ""
	}
	out, err := exec.Command("git", "-C", dir, "rev-parse", "HEAD").Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(out))
}

// checkoutOf is the checkout holding file, as the map writes it
// (repo-prefixed when the card has several repos), and the file's path
// inside it.
func checkoutOf(cos []ReviewCheckout, file string) (ReviewCheckout, string, bool) {
	for _, co := range cos {
		if co.Repo == "" && len(cos) == 1 {
			return co, file, true
		}
		if rest, ok := strings.CutPrefix(file, co.Repo+"/"); ok && co.Repo != "" {
			return co, rest, true
		}
	}
	return ReviewCheckout{}, "", false
}

// OpenReviewAt opens file of the card's shown map at line in the editor,
// in the checkout whose HEAD is the map's head (FR-1). It refuses, opening
// nothing, a card of another machine, a path outside the checkout, and a
// head checked out nowhere here: "<short sha> is not checked out here". An
// editor that exits non-zero within editorWait is "editor didn't open: …"
// (leftovers-43 FR-2).
func (s *Service) OpenReviewAt(initiativeID, slug, file string, line int) error {
	if _, err := review.RepoPath(file); err != nil {
		return err
	}
	st, err := s.ReviewStatus(initiativeID, slug)
	if err != nil {
		return err
	}
	if st.MapHead == "" {
		return fmt.Errorf("card %s of %s has no review map", slug, initiativeID)
	}
	co, rel, ok := checkoutOf(st.Checkouts, file)
	if !ok {
		return fmt.Errorf("no repo of card %s holds %s", slug, file)
	}
	if co.Dir == "" {
		return fmt.Errorf("%s is not checked out here", shortSha(co.Head))
	}
	rel, err = review.RepoPath(rel)
	if err != nil {
		return err
	}
	path := filepath.Join(co.Dir, filepath.FromSlash(rel))
	if !inside(co.Dir, path) {
		return fmt.Errorf("path %q is outside the checkout", file)
	}
	return startEditor(editorCommand(s.Config().Editor, path, line))
}

// inside is whether path stays under dir, through symlinks where both
// resolve: a link in the checkout pointing out of it is outside.
func inside(dir, path string) bool {
	if d, err := filepath.EvalSymlinks(dir); err == nil {
		if p, err := filepath.EvalSymlinks(path); err == nil {
			dir, path = d, p
		}
	}
	rel, err := filepath.Rel(dir, path)
	return err == nil && rel != ".." && !strings.HasPrefix(rel, ".."+string(filepath.Separator))
}

// editorCommand is the argv that opens file at line (FR-2): `editor` from
// config (default code) with {file} and {line} replaced where it carries
// them, the file appended when it carries only {line}; without either, code
// and cursor take `-g <file>:<line>` and any other editor the file alone.
func editorCommand(editor, file string, line int) []string {
	if strings.TrimSpace(editor) == "" {
		editor = "code"
	}
	if line < 1 {
		line = 1
	}
	parts := strings.Fields(editor)
	if strings.Contains(editor, "{file}") || strings.Contains(editor, "{line}") {
		r := strings.NewReplacer("{file}", file, "{line}", strconv.Itoa(line))
		out := make([]string, 0, len(parts)+1)
		for _, p := range parts {
			out = append(out, r.Replace(p))
		}
		if !strings.Contains(editor, "{file}") {
			out = append(out, file)
		}
		return out
	}
	switch filepath.Base(parts[0]) {
	case "code", "cursor":
		return append(parts, "-g", file+":"+strconv.Itoa(line))
	}
	return append(parts, file)
}

// checkoutsAt is reviewCheckouts for the map at path; none when the map
// does not read.
func checkoutsAt(si *model.ScannedInitiative, slug, path string, repos []review.Repo) []ReviewCheckout {
	b, err := os.ReadFile(path)
	if err != nil {
		return []ReviewCheckout{}
	}
	var rm review.RevMap
	if json.Unmarshal(b, &rm) != nil {
		return []ReviewCheckout{}
	}
	for _, c := range si.Cards {
		if c.Slug == slug {
			return reviewCheckouts(si.Path, c, &rm, repos)
		}
	}
	return []ReviewCheckout{}
}
