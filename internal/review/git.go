package review

import (
	"bufio"
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

// Missing is a review that cannot start because something the request names
// is not there: a card with no branch, a branch or commit no repo has. The
// CLI exits 2 on it, naming what is missing.
type Missing struct{ What string }

func (m *Missing) Error() string { return m.What }

// Range is the base and head of one repo's change.
type Range struct {
	Repo string // the repo's directory
	Name string // the repo's name as the card or initiative lists it; "" for the root
	Base string // full sha
	Head string // full sha
	// From says how base was found: "merge-base main" or "first parent".
	From string
}

func git(dir string, args ...string) (string, error) {
	cmd := exec.Command("git", append([]string{"-C", dir}, args...)...)
	var out, errb bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &errb
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("git %s: %v: %s", strings.Join(args, " "), err, strings.TrimSpace(errb.String()))
	}
	return strings.TrimSpace(out.String()), nil
}

func commitOf(dir, rev string) (string, bool) {
	sha, err := git(dir, "rev-parse", "--verify", "--quiet", rev+"^{commit}")
	return sha, err == nil && sha != ""
}

// mainline is the repo's main branch: main, else master.
func mainline(dir string) (string, bool) {
	for _, b := range []string{"main", "master"} {
		if _, ok := commitOf(dir, "refs/heads/"+b); ok {
			return b, true
		}
	}
	return "", false
}

// BranchRange is a card's branch against the merge base with main.
func BranchRange(dir, name, branch string) (Range, error) {
	head, ok := commitOf(dir, "refs/heads/"+branch)
	if !ok {
		return Range{}, &Missing{What: fmt.Sprintf("branch %s does not exist in %s", branch, dir)}
	}
	mb, ok := mainline(dir)
	if !ok {
		return Range{}, &Missing{What: fmt.Sprintf("%s has no main or master branch to diff %s against", dir, branch)}
	}
	base, err := git(dir, "merge-base", mb, head)
	if err != nil {
		return Range{}, err
	}
	return Range{Repo: dir, Name: name, Base: base, Head: head, From: "merge-base " + mb}, nil
}

// CommitRange is a commit against its first parent: for a merge, the
// mainline before it.
func CommitRange(dir, name, rev string) (Range, error) {
	head, ok := commitOf(dir, rev)
	if !ok {
		return Range{}, &Missing{What: fmt.Sprintf("no commit %s in %s", rev, dir)}
	}
	base, ok := commitOf(dir, head+"^1")
	if !ok {
		return Range{}, &Missing{What: fmt.Sprintf("commit %s has no parent to diff against", short(head))}
	}
	return Range{Repo: dir, Name: name, Base: base, Head: head, From: "first parent"}, nil
}

// HasCommit reports whether rev names a commit in dir.
func HasCommit(dir, rev string) bool {
	_, ok := commitOf(dir, rev)
	return ok
}

// Export writes the tree of rev into dst with git archive, so the reviewed
// repo gets no worktree, no index change and no file.
func Export(dir, rev, dst string) error {
	if err := os.MkdirAll(dst, 0o755); err != nil {
		return err
	}
	arch := exec.Command("git", "-C", dir, "archive", "--format=tar", rev)
	untar := exec.Command("tar", "-x", "-C", dst)
	pipe, err := arch.StdoutPipe()
	if err != nil {
		return err
	}
	untar.Stdin = pipe
	var errb bytes.Buffer
	arch.Stderr, untar.Stderr = &errb, &errb
	if err := untar.Start(); err != nil {
		return err
	}
	if err := arch.Run(); err != nil {
		return fmt.Errorf("git archive %s: %v: %s", short(rev), err, errb.String())
	}
	if err := untar.Wait(); err != nil {
		return fmt.Errorf("tar: %v: %s", err, errb.String())
	}
	return nil
}

// FileHunks is the changed lines of one file: line ranges on each side.
type FileHunks struct {
	Base, Head string // path on each side; "" when the file is added or deleted
	BaseLines  []span
	HeadLines  []span
}

type span struct{ from, to int } // inclusive; to < from means "between from-1 and from"

var hunkRe = regexp.MustCompile(`^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@`)

// Hunks is `git diff -U0 base...head` over the files keep accepts (a
// source's own files), by file. Renames are followed so a moved file is one
// file with both paths.
func Hunks(dir, base, head string, keep func(path string) bool) ([]FileHunks, error) {
	out, err := git(dir, "diff", "-U0", "--no-color", "--no-ext-diff", "-M", base+"..."+head)
	if err != nil {
		return nil, err
	}
	var files []FileHunks
	var cur *FileHunks
	sc := bufio.NewScanner(strings.NewReader(out))
	sc.Buffer(make([]byte, 1<<20), 1<<26)
	for sc.Scan() {
		l := sc.Text()
		switch {
		case strings.HasPrefix(l, "diff --git "):
			files = append(files, FileHunks{})
			cur = &files[len(files)-1]
		case cur == nil:
		case strings.HasPrefix(l, "--- "):
			cur.Base = diffPath(l[4:])
		case strings.HasPrefix(l, "+++ "):
			cur.Head = diffPath(l[4:])
		case strings.HasPrefix(l, "@@"):
			m := hunkRe.FindStringSubmatch(l)
			if m == nil {
				continue
			}
			bs, bn := atoi(m[1]), count(m[2])
			hs, hn := atoi(m[3]), count(m[4])
			if bn > 0 {
				cur.BaseLines = append(cur.BaseLines, span{bs, bs + bn - 1})
			}
			if hn > 0 {
				cur.HeadLines = append(cur.HeadLines, span{hs, hs + hn - 1})
			}
		}
	}
	var kept []FileHunks
	for _, f := range files {
		if (f.Base != "" && keep(f.Base)) || (f.Head != "" && keep(f.Head)) {
			kept = append(kept, f)
		}
	}
	return kept, sc.Err()
}

func diffPath(p string) string {
	if p == "/dev/null" {
		return ""
	}
	if i := strings.IndexByte(p, '/'); i >= 0 && (strings.HasPrefix(p, "a/") || strings.HasPrefix(p, "b/")) {
		return filepath.ToSlash(p[i+1:])
	}
	return p
}

func atoi(s string) int { n, _ := strconv.Atoi(s); return n }

func count(s string) int {
	if s == "" {
		return 1
	}
	return atoi(s)
}

func short(sha string) string {
	if len(sha) > 7 {
		return sha[:7]
	}
	return sha
}
