// Package scan finds initiatives under configured roots and reads their
// working-on/ folders. It never writes.
package scan

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"organizer/internal/model"
)

const (
	workingOnDir   = "working-on"
	initiativeFile = "initiative.yaml"
	doneDir        = "done"
)

// Options controls one scan.
type Options struct {
	Roots      []string
	MaxDepth   int
	IgnoreDirs []string
	// Git enables repo enrichment through the git CLI.
	Git        bool
	GitTimeout time.Duration
	Now        func() time.Time
	// Agent discovery; nil disables it.
	Agents *AgentOptions
}

func (o Options) now() time.Time {
	if o.Now != nil {
		return o.Now()
	}
	return time.Now()
}

// Discover returns the initiative root directories under the roots, depth
// limited, deduplicated, sorted. A directory is a root when it contains
// working-on/initiative.yaml. Descent stops there.
func Discover(opts Options) ([]string, []model.Problem) {
	ignore := map[string]bool{}
	for _, d := range opts.IgnoreDirs {
		ignore[d] = true
	}
	seen := map[string]bool{}
	var found []string
	var problems []model.Problem

	for _, root := range opts.Roots {
		root = filepath.Clean(root)
		if st, err := os.Stat(root); err != nil || !st.IsDir() {
			problems = append(problems, model.Problem{Path: root, Msg: "root is not a directory"})
			continue
		}
		rootDepth := strings.Count(root, string(filepath.Separator))
		_ = filepath.WalkDir(root, func(p string, d fs.DirEntry, err error) error {
			if err != nil {
				return nil
			}
			if !d.IsDir() {
				return nil
			}
			name := d.Name()
			if p != root && (ignore[name] || strings.HasPrefix(name, ".")) {
				return fs.SkipDir
			}
			if isInitiativeRoot(p) {
				if !seen[p] {
					seen[p] = true
					found = append(found, p)
				}
				return fs.SkipDir
			}
			if strings.Count(p, string(filepath.Separator))-rootDepth >= opts.MaxDepth {
				return fs.SkipDir
			}
			return nil
		})
	}
	sort.Strings(found)
	return found, problems
}

func isInitiativeRoot(dir string) bool {
	st, err := os.Stat(filepath.Join(dir, workingOnDir, initiativeFile))
	return err == nil && !st.IsDir()
}

// Run discovers and reads every initiative.
func Run(opts Options) model.Snapshot {
	roots, problems := Discover(opts)
	snap := model.Snapshot{ScannedAt: opts.now()}
	for _, r := range roots {
		snap.Initiatives = append(snap.Initiatives, ReadInitiative(r, opts))
	}
	if len(problems) > 0 && len(snap.Initiatives) > 0 {
		snap.Initiatives[0].Problems = append(problems, snap.Initiatives[0].Problems...)
	}
	if opts.Agents != nil {
		snap.Unassigned = AssignAgents(snap.Initiatives, Agents(*opts.Agents))
	}
	return snap
}

// ReadInitiative reads one initiative root: initiative.yaml, open cards,
// done cards, and (optionally) git state of the listed repos.
func ReadInitiative(root string, opts Options) model.ScannedInitiative {
	si := model.ScannedInitiative{ScannedAt: opts.now()}
	si.Path = root
	wo := filepath.Join(root, workingOnDir)

	b, err := os.ReadFile(filepath.Join(wo, initiativeFile))
	if err != nil {
		si.Problems = append(si.Problems, model.Problem{Path: wo, Msg: err.Error()})
		return si
	}
	if err := yamlUnmarshal(b, &si.Initiative); err != nil {
		si.Problems = append(si.Problems, model.Problem{Path: filepath.Join(wo, initiativeFile), Msg: "initiative.yaml: " + err.Error()})
	}
	si.Path = root
	if si.ID == "" {
		si.ID = filepath.Base(root)
	}
	initPath := filepath.Join(wo, initiativeFile)
	if si.Target != "" && !validDate(si.Target) {
		si.Problems = append(si.Problems, model.Problem{Path: initPath, Msg: fmt.Sprintf("target %q is not YYYY-MM-DD", si.Target)})
	}
	for _, m := range si.Milestones {
		if !validDate(m.Date) {
			si.Problems = append(si.Problems, model.Problem{Path: initPath, Msg: fmt.Sprintf("milestone %q has date %q, not YYYY-MM-DD", m.Title, m.Date)})
		}
	}

	si.Cards, si.Problems = readCards(wo, false, si.Cards, si.Problems)
	si.Cards, si.Problems = readCards(filepath.Join(wo, doneDir), true, si.Cards, si.Problems)
	sortCards(si.Cards)
	si.Cell, si.Problems = readCell(root, si.Problems)

	if opts.Git {
		si.RepoStates = gitStates(root, si.Initiative.Repos, opts.GitTimeout)
		branchSpans(root, si.Cards, opts.GitTimeout)
	}
	return si
}

func readCards(dir string, archived bool, cards []model.Card, problems []model.Problem) ([]model.Card, []model.Problem) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return cards, problems
	}
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") {
			continue
		}
		p := filepath.Join(dir, e.Name())
		c, probs := readCard(p, archived)
		cards = append(cards, c)
		problems = append(problems, probs...)
	}
	return cards, problems
}

func readCard(path string, archived bool) (model.Card, []model.Problem) {
	c := model.Card{
		Slug:     strings.TrimSuffix(filepath.Base(path), ".md"),
		Path:     path,
		Archived: archived,
	}
	var problems []model.Problem
	b, err := os.ReadFile(path)
	if err != nil {
		return c, []model.Problem{{Path: path, Msg: err.Error()}}
	}
	body, err := parseFrontmatter(string(b), &c)
	if err != nil {
		return c, []model.Problem{{Path: path, Msg: err.Error()}}
	}
	c.Body = body
	if archived && c.Status == "" {
		c.Status = model.StatusDone
	}
	if model.StatusOrder(c.Status) == 9 {
		problems = append(problems, model.Problem{Path: path, Msg: fmt.Sprintf("unknown status %q", c.Status)})
	}
	if c.Title == "" {
		problems = append(problems, model.Problem{Path: path, Msg: "missing title"})
	}
	if !archived && c.Status != model.StatusDone && strings.TrimSpace(c.Next) == "" {
		problems = append(problems, model.Problem{Path: path, Msg: "open card without next action"})
	}
	if c.Updated != "" && c.UpdatedTime().IsZero() {
		problems = append(problems, model.Problem{Path: path, Msg: fmt.Sprintf("updated %q is not YYYY-MM-DD", c.Updated)})
	}
	if c.Start != "" && !validDate(c.Start) {
		problems = append(problems, model.Problem{Path: path, Msg: fmt.Sprintf("start %q is not YYYY-MM-DD", c.Start)})
	}
	if c.Due != "" && c.DueTime().IsZero() {
		problems = append(problems, model.Problem{Path: path, Msg: fmt.Sprintf("due %q is not YYYY-MM-DD", c.Due)})
	}
	for _, t := range c.Threads {
		if !validULID(t) {
			problems = append(problems, model.Problem{Path: path, Msg: fmt.Sprintf("thread %q is not a discuss thread id", t)})
		}
	}
	return c, problems
}

// validULID reports whether s is a 26-character Crockford base32 ULID, the id
// shape discuss stamps on a thread. Reported as a problem rather than dropped:
// a card naming a thread that cannot exist is waiting on nothing, and that is
// worth seeing.
func validULID(s string) bool {
	if len(s) != 26 {
		return false
	}
	for _, r := range s {
		switch {
		case r >= '0' && r <= '9':
		case r >= 'A' && r <= 'Z' && r != 'I' && r != 'L' && r != 'O' && r != 'U':
		default:
			return false
		}
	}
	return true
}

func sortCards(cards []model.Card) {
	sort.SliceStable(cards, func(i, j int) bool {
		a, b := cards[i], cards[j]
		if a.Archived != b.Archived {
			return !a.Archived
		}
		if oa, ob := model.StatusOrder(a.Status), model.StatusOrder(b.Status); oa != ob {
			return oa < ob
		}
		if ua, ub := a.UpdatedTime(), b.UpdatedTime(); !ua.Equal(ub) {
			return ua.After(ub)
		}
		return a.Slug < b.Slug
	})
}

func validDate(s string) bool {
	_, err := time.Parse("2006-01-02", s)
	return err == nil
}

// cellFile is the persona roster spec, beside the seat files (persona-agents skill).
const cellFile = "agents/cell.json"

// readCell reads agents/cell.json when present. A missing file is the normal
// case; a malformed one is a problem, not a fatal error.
func readCell(root string, problems []model.Problem) (*model.Cell, []model.Problem) {
	p := filepath.Join(root, filepath.FromSlash(cellFile))
	b, err := os.ReadFile(p)
	if err != nil {
		return nil, problems
	}
	var c model.Cell
	if err := json.Unmarshal(b, &c); err != nil {
		return nil, append(problems, model.Problem{Path: p, Msg: "cell.json: " + err.Error()})
	}
	if c.Project == "" || len(c.Agents) == 0 {
		return nil, append(problems, model.Problem{Path: p, Msg: "cell.json: project and agents are required"})
	}
	return &c, problems
}
