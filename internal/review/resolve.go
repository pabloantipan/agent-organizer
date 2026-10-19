package review

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"organizer/internal/model"
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

// CardRanges is FR-1 and FR-13 for a card: its branch against main's merge
// base, in each of its repos that has the branch; else, in each repo, the
// newest commit on main's first parent whose subject is the card's merge
// (`merge: <slug>` then the end or a character no slug has), against its
// first parent. A card with neither is
// Missing, naming both.
func CardRanges(slug, branch string, repos []Repo) ([]Range, error) {
	var out []Range
	var where []string
	for _, r := range repos {
		where = append(where, r.Dir)
		if branch == "" {
			continue
		}
		if _, ok := commitOf(r.Dir, "refs/heads/"+branch); !ok {
			continue
		}
		rg, err := BranchRange(r.Dir, r.Name, branch)
		if err != nil {
			return nil, err
		}
		out = append(out, rg)
	}
	if len(out) > 0 {
		return out, nil
	}
	for _, r := range repos {
		sha, ok := mergeOf(r.Dir, slug)
		if !ok {
			continue
		}
		rg, err := CommitRange(r.Dir, r.Name, sha)
		if err != nil {
			return nil, err
		}
		rg.From = "merge on " + rg.From
		out = append(out, rg)
	}
	if len(out) > 0 {
		return out, nil
	}
	in := strings.Join(where, ", ")
	branchWhy := fmt.Sprintf("card %s has no branch: field", slug)
	if branch != "" {
		branchWhy = fmt.Sprintf("branch %s of card %s does not exist in %s", branch, slug, in)
	}
	return nil, &Missing{What: fmt.Sprintf("%s, and no commit on main's first parent in %s has the subject \"merge: %s\" followed by the end of the subject or any character that cannot be in a slug (not a-z, 0-9, -), such as \"merge: %s \" or \"merge: %s,\"", branchWhy, in, slug, slug, slug)}
}

// mergeOf is the newest commit on the main line's first parent whose
// subject is the card's merge (FR-13, leftovers-45 FR-1): the merge a
// supervisor makes before deleting the card's branch.
func mergeOf(dir, slug string) (string, bool) {
	mb, ok := mainline(dir)
	if !ok || strings.TrimSpace(slug) == "" {
		return "", false
	}
	out, err := git(dir, "log", "--first-parent", "--format=%H %s", "refs/heads/"+mb)
	if err != nil {
		return "", false
	}
	for _, l := range strings.Split(out, "\n") {
		sha, subject, _ := strings.Cut(l, " ")
		if isMergeOf(subject, slug) {
			return sha, true
		}
	}
	return "", false
}

// isMergeOf is leftovers-45 FR-1: the subject is `merge: <slug>` followed
// by its end or a character that cannot be in a slug (not a-z, 0-9, -),
// so `merge: x, y` and `merge: x/y` are x's and `merge: x-2 y` is not.
func isMergeOf(subject, slug string) bool {
	rest, ok := strings.CutPrefix(subject, "merge: "+slug)
	if !ok || rest == "" {
		return ok
	}
	c := rest[0]
	return !(c >= 'a' && c <= 'z' || c >= '0' && c <= '9' || c == '-')
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

// Resolve is the target of `organizer review <initiative> <target>` for
// both the CLI and the app (FR-1, FR-13): a card slug of the initiative
// resolves through CardRanges, anything else is a commit in the
// initiative's repos or its root. card is the slug the target names, or "".
func Resolve(si *model.ScannedInitiative, target string) (ranges []Range, card string, err error) {
	for i := range si.Cards {
		if c := si.Cards[i]; c.Slug == target {
			ranges, err = CardRanges(c.Slug, strings.TrimSpace(c.Branch), ReposOf(si.Path, si.ID, c.Repos))
			return ranges, c.Slug, err
		}
	}
	repos := ReposOf(si.Path, si.ID, si.Initiative.Repos)
	if len(si.Initiative.Repos) > 0 {
		repos = append(repos, Repo{Dir: si.Path})
	}
	ranges, err = CommitRanges(target, repos)
	return ranges, "", err
}

// Make is the whole of `organizer review` past resolution: the map of
// ranges built under a fresh work dir in parent (removed after), and
// change-check's flags on it when card is set (FR-11, FR-12). The CLI and
// the app's make (service/review.go, which runs the CLI) share it.
func Make(si *model.ScannedInitiative, target, card string, ranges []Range, parent string) (*RevMap, error) {
	if err := os.MkdirAll(parent, 0o755); err != nil {
		return nil, err
	}
	work, err := os.MkdirTemp(parent, "review-work-")
	if err != nil {
		return nil, err
	}
	defer os.RemoveAll(work)
	rm, err := Build(si.ID, target, ranges, Sources(), work)
	if err != nil {
		return nil, err
	}
	if card == "" {
		rm.Reconciliation = "no card"
		return rm, nil
	}
	// change-check takes the root or the id; an id it looks up under ~,
	// which finds no fixture or clone and may find another root with the
	// same id, so it gets the root the scan read.
	if len(ranges) <= 1 {
		if flags, err := ChangeCheck(si.Path, si.Path, card, rm.Base, rm.Head); err != nil {
			rm.Reconciliation = err.Error()
		} else {
			Reconcile(rm, flags)
			rm.Reconciled, rm.Reconciliation = true, "change-check "+card
		}
		return rm, nil
	}
	// Several ranges (leftovers-45 FR-2): one run per repo with its own
	// base and head, each run's flags on that repo's nodes only; a repo
	// that fails is named and leaves the others' flags in place.
	var failed []string
	for _, r := range ranges {
		flags, err := ChangeCheckRepo(si.Path, si.Path, card, r.Name, r.Base, r.Head)
		if err != nil {
			failed = append(failed, repoLabel(r)+": "+err.Error())
			continue
		}
		ReconcileRepo(rm, flags, r.Name)
	}
	if len(failed) > 0 {
		rm.Reconciliation = strings.Join(failed, "; ")
	} else {
		rm.Reconciled, rm.Reconciliation = true, "change-check "+card
	}
	return rm, nil
}

// repoLabel names a range's repo for a reconciliation: its name, or its
// directory for the root.
func repoLabel(r Range) string {
	if r.Name != "" {
		return r.Name
	}
	return r.Repo
}
