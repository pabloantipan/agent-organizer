package scan

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"sort"
	"strings"

	"organizer/internal/model"
)

const decisionsDir = "decisions"

var decisionName = regexp.MustCompile(`^(\d{4})-([a-z0-9][a-z0-9-]*)\.md$`)

// readDecisions reads working-on/decisions/*.md in number order. A record
// that breaks the working-on skill's rules is kept and reported: the board
// shows what is on disk, and the problem says what to fix.
func readDecisions(dir string, problems []model.Problem) ([]model.Decision, []model.Problem) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, problems
	}
	var out []model.Decision
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") {
			continue
		}
		p := filepath.Join(dir, e.Name())
		m := decisionName.FindStringSubmatch(e.Name())
		if m == nil {
			problems = append(problems, model.Problem{Path: p, Msg: "decision file name is not NNNN-slug.md"})
			continue
		}
		d := model.Decision{Number: m[1], Slug: m[2], Path: p}
		b, err := os.ReadFile(p)
		if err != nil {
			problems = append(problems, model.Problem{Path: p, Msg: err.Error()})
			continue
		}
		body, err := parseFrontmatter(string(b), &d)
		if err != nil {
			problems = append(problems, model.Problem{Path: p, Msg: err.Error()})
			continue
		}
		d.Body = body
		problems = append(problems, checkDecision(d)...)
		out = append(out, d)
	}
	sort.SliceStable(out, func(i, j int) bool { return out[i].Number < out[j].Number })
	return out, append(problems, checkDecisionLinks(out)...)
}

// checkDecision holds a record to the skill: a known status, real dates, and
// a ruling only where the status says there is one.
func checkDecision(d model.Decision) []model.Problem {
	var ps []model.Problem
	add := func(format string, a ...any) {
		ps = append(ps, model.Problem{Path: d.Path, Msg: fmt.Sprintf(format, a...)})
	}
	if !model.ValidDecisionStatus(d.Status) {
		add("unknown decision status %q", d.Status)
	}
	if strings.TrimSpace(d.Title) == "" {
		add("decision without a title")
	}
	if !validDate(d.Raised) {
		add("raised %q is not YYYY-MM-DD", d.Raised)
	}
	if d.Ruled != "" && !validDate(d.Ruled) {
		add("ruled %q is not YYYY-MM-DD", d.Ruled)
	}
	switch d.Status {
	case model.DecisionRuled, model.DecisionSuperseded:
		if d.Ruled == "" || d.RuledBy == "" {
			add("%s decision without ruled and ruled_by", d.Status)
		}
	case model.DecisionProposed:
		if d.Ruled != "" || d.RuledBy != "" || d.Chosen != "" {
			add("proposed decision carries a ruling; set status: ruled, or clear it")
		}
	}
	if d.Status == model.DecisionSuperseded && d.SupersededBy == "" {
		add("superseded decision without superseded_by")
	}
	if d.Chosen != "" && len(d.Options) > 0 && !slices.Contains(d.Options, d.Chosen) {
		add("chosen %q is not one of the options", d.Chosen)
	}
	if t := d.TurnaroundDays(); d.Ruled != "" && d.Raised != "" && t < 0 && validDate(d.Ruled) && validDate(d.Raised) {
		add("ruled %s before it was raised %s", d.Ruled, d.Raised)
	}
	return ps
}

// checkDecisionLinks reports supersede references to records that do not
// exist, and duplicate numbers.
func checkDecisionLinks(ds []model.Decision) []model.Problem {
	var ps []model.Problem
	seen := map[string]string{}
	for _, d := range ds {
		if other, dup := seen[d.Number]; dup {
			ps = append(ps, model.Problem{Path: d.Path, Msg: fmt.Sprintf("decision number %s is also %s", d.Number, filepath.Base(other))})
		}
		seen[d.Number] = d.Path
	}
	for _, d := range ds {
		for _, n := range append(slices.Clone(d.Supersedes), d.SupersededBy) {
			if n != "" && seen[n] == "" {
				ps = append(ps, model.Problem{Path: d.Path, Msg: fmt.Sprintf("refers to decision %s, which does not exist", n)})
			}
		}
	}
	return ps
}
