package scan

import (
	"bytes"
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"organizer/internal/model"
)

const gitWorkers = 8

// gitStates enriches each listed repo with branch, dirty count and last
// commit date, in parallel, each call bounded by timeout.
func gitStates(root string, repos []string, timeout time.Duration) []model.RepoState {
	if timeout <= 0 {
		timeout = 5 * time.Second
	}
	out := make([]model.RepoState, len(repos))
	sem := make(chan struct{}, gitWorkers)
	var wg sync.WaitGroup
	for i, name := range repos {
		wg.Add(1)
		go func(i int, name string) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()
			out[i] = gitState(filepath.Join(root, name), name, timeout)
		}(i, name)
	}
	wg.Wait()
	return out
}

func gitState(path, name string, timeout time.Duration) model.RepoState {
	rs := model.RepoState{Name: name, Path: path}
	if st, err := os.Stat(filepath.Join(path, ".git")); err != nil || !(st.IsDir() || st.Mode().IsRegular()) {
		rs.Missing = true
		return rs
	}
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	if b, err := git(ctx, path, "rev-parse", "--abbrev-ref", "HEAD"); err == nil {
		rs.Branch = b
	} else {
		rs.Err = err.Error()
		return rs
	}
	if b, err := git(ctx, path, "status", "--porcelain", "--untracked-files=normal"); err == nil {
		if b != "" {
			rs.Dirty = strings.Count(b, "\n") + 1
		}
	} else {
		rs.Err = err.Error()
	}
	if b, err := git(ctx, path, "log", "-1", "--format=%cs"); err == nil {
		rs.LastCommit = b
	}
	return rs
}

func git(ctx context.Context, dir string, args ...string) (string, error) {
	cmd := exec.CommandContext(ctx, "git", append([]string{"-C", dir}, args...)...)
	var stdout, stderr bytes.Buffer
	cmd.Stdout, cmd.Stderr = &stdout, &stderr
	if err := cmd.Run(); err != nil {
		msg := strings.TrimSpace(stderr.String())
		if msg == "" {
			msg = err.Error()
		}
		return "", errString(msg)
	}
	return strings.TrimSpace(stdout.String()), nil
}

type errString string

func (e errString) Error() string { return string(e) }

// branchSpans fills BranchStart and BranchLast for open cards that name a
// branch: the first and last commit dates on that branch that are not on the
// repo's main line. The first listed repo that has the branch wins.
func branchSpans(root string, cards []model.Card, timeout time.Duration) {
	if timeout <= 0 {
		timeout = 5 * time.Second
	}
	sem := make(chan struct{}, gitWorkers)
	var wg sync.WaitGroup
	for i := range cards {
		c := &cards[i]
		if c.Archived || c.Status == model.StatusDone || c.Branch == "" || c.Branch == "none" || len(c.Repos) == 0 {
			continue
		}
		wg.Add(1)
		go func(c *model.Card) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()
			for _, repo := range c.Repos {
				dir := filepath.Join(root, repo)
				first, last, ok := branchSpan(dir, c.Branch, timeout)
				if ok {
					c.BranchStart, c.BranchLast = first, last
					return
				}
			}
		}(c)
	}
	wg.Wait()
}

func branchSpan(dir, branch string, timeout time.Duration) (first, last string, ok bool) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	if branch == "main" || branch == "master" {
		return "", "", false // the main line has no span of its own
	}
	if _, err := git(ctx, dir, "rev-parse", "--verify", "--quiet", branch); err != nil {
		return "", "", false
	}
	// Exclude whatever main line exists so the span is the branch's own work.
	bases, _ := git(ctx, dir, "for-each-ref", "--format=%(refname:short)", "refs/heads/main", "refs/heads/master", "refs/remotes/origin/main", "refs/remotes/origin/master")
	args := []string{"log", "--format=%cs", "--reverse", branch}
	for _, b := range strings.Fields(bases) {
		if b != branch {
			args = append(args, "^"+b)
		}
	}
	out, err := git(ctx, dir, args...)
	if err != nil || out == "" {
		// The branch is the main line itself, or has nothing of its own.
		return "", "", false
	}
	lines := strings.Split(out, "\n")
	return lines[0], lines[len(lines)-1], true
}
