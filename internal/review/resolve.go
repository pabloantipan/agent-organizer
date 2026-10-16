package review

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// Repo is one repo of an initiative: its name as written and its directory.
type Repo struct{ Name, Dir string }

// ReposOf turns repo names into directories under the initiative root. A
// name with no directory of its own that is the root's own name (or the
// initiative id) is the root itself, as for an initiative whose root is its
// one repo; no names means the root.
func ReposOf(root, id string, names []string) []Repo {
	if len(names) == 0 {
		return []Repo{{Dir: root}}
	}
	var out []Repo
	for _, n := range names {
		dir := filepath.Join(root, n)
		if !isRepo(dir) && (n == filepath.Base(root) || n == id) && isRepo(root) {
			out = append(out, Repo{Dir: root})
			continue
		}
		out = append(out, Repo{Name: n, Dir: dir})
	}
	if len(out) == 1 {
		out[0].Name = "" // one repo: file paths stay relative to it
	}
	return out
}

func isRepo(dir string) bool {
	_, err := os.Stat(filepath.Join(dir, ".git"))
	return err == nil
}

// CardRanges is FR-1 for a card: its branch against main's merge base, in
// each of its repos that has the branch. A card with no branch, or a branch
// no repo has, is Missing.
func CardRanges(slug, branch string, repos []Repo) ([]Range, error) {
	if strings.TrimSpace(branch) == "" {
		return nil, &Missing{What: fmt.Sprintf("card %s has no branch: field; organizer review needs a branch or a commit", slug)}
	}
	var out []Range
	var where []string
	for _, r := range repos {
		where = append(where, r.Dir)
		if _, ok := commitOf(r.Dir, "refs/heads/"+branch); !ok {
			continue
		}
		rg, err := BranchRange(r.Dir, r.Name, branch)
		if err != nil {
			return nil, err
		}
		out = append(out, rg)
	}
	if len(out) == 0 {
		return nil, &Missing{What: fmt.Sprintf("branch %s of card %s does not exist in %s", branch, slug, strings.Join(where, ", "))}
	}
	return out, nil
}

// CommitRanges is FR-1 for a commit: against its first parent, in the
// repo that has it.
func CommitRanges(rev string, repos []Repo) ([]Range, error) {
	var where []string
	for _, r := range repos {
		where = append(where, r.Dir)
		if HasCommit(r.Dir, rev) {
			rg, err := CommitRange(r.Dir, r.Name, rev)
			if err != nil {
				return nil, err
			}
			return []Range{rg}, nil
		}
	}
	return nil, &Missing{What: fmt.Sprintf("no card or commit named %s in %s", rev, strings.Join(where, ", "))}
}
