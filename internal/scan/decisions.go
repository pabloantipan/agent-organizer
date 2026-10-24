package scan

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"sort"
	"strings"
	"time"

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
			problems = append(problems, model.UnreadProblem(p, "decision file name is not NNNN-slug.md"))
			continue
		}
		d := model.Decision{Number: m[1], Slug: m[2], Path: p}
		b, err := os.ReadFile(p)
		if err != nil {
			problems = append(problems, model.UnreadProblem(p, err.Error()))
			continue
		}
		body, err := parseFrontmatter(string(b), &d)
		if err != nil {
			problems = append(problems, model.UnreadProblem(p, err.Error()))
			continue
		}
		d.Body = body
		if d.Forecast != "" {
			top, err := model.ForecastTopMinutes(d.Forecast)
			if err != nil {
				problems = append(problems, model.Problem{Path: p, Msg: err.Error()})
			}
			d.ForecastTop = top
		}
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
	if d.Chosen != "" && len(d.Options) > 0 {
		if qs := Questions(d.Options); qs != nil {
			if err := CheckAnswers(qs, d.Chosen); err != nil {
				add("%s", err)
			}
		} else if !slices.Contains(d.Options, d.Chosen) {
			add("chosen %q is not one of the options", d.Chosen)
		}
	}
	if t := d.TurnaroundDays(); d.Ruled != "" && d.Raised != "" && t < 0 && validDate(d.Ruled) && validDate(d.Raised) {
		add("ruled %s before it was raised %s", d.Ruled, d.Raised)
	}
	return ps
}

// Question is one item of a question record's options (leftovers-49 FR-1):
// `Q1 a | b | c` is question Q1 with the alternatives a, b and c.
type Question struct {
	Label string // "Q1"
	Alts  []string
}

// questionItem is one options item of a question record: `Q`, a number, a
// space, then the alternatives split by `|`.
var questionItem = regexp.MustCompile(`^(Q\d+) (.+)$`)

// minAlternatives is how many alternatives an item needs to read as a
// question (FR-1: two or more).
const minAlternatives = 2

// Questions reads a record's options as questions, in order, or nil when the
// record is not a question record: every item must read `Q<n> <alt> | <alt>
// ...`, with no empty alternative. Spaces around each `|` are trimmed, so
// `a|b` and `a | b` read alike. One parser for the rule and the scan; the box
// reads the same shape with `questionsOf` in frontend/src/lib/decisions.ts.
func Questions(options []string) []Question {
	if len(options) == 0 {
		return nil
	}
	qs := make([]Question, 0, len(options))
	for _, o := range options {
		m := questionItem.FindStringSubmatch(strings.TrimSpace(o))
		if m == nil {
			return nil
		}
		alts := strings.Split(m[2], "|")
		for i, a := range alts {
			alts[i] = strings.TrimSpace(a)
			if alts[i] == "" {
				return nil
			}
		}
		if len(alts) < minAlternatives {
			return nil
		}
		qs = append(qs, Question{Label: m[1], Alts: alts})
	}
	return qs
}

// Answers is how a ruling of a question record reads (FR-3): `Q1 a, Q2 x`,
// the questions in order, `, ` between them.
func Answers(qs []Question, picks []string) string {
	parts := make([]string, len(qs))
	for i, q := range qs {
		parts[i] = q.Label + " " + picks[i]
	}
	return strings.Join(parts, ", ")
}

// CheckAnswers says why chosen is not a ruling of the question record qs, or
// nil when it is: one `Q<n> <alt>` per question, in order, each alternative
// one of its question's. A record with one question also takes a plain
// `<alt>`, so older single-question rulings read as they are (FR-3).
func CheckAnswers(qs []Question, chosen string) error {
	placeholders := make([]string, len(qs))
	for i := range placeholders {
		placeholders[i] = "<alt>"
	}
	shape := Answers(qs, placeholders)
	if len(qs) == 1 && slices.Contains(qs[0].Alts, strings.TrimSpace(chosen)) {
		return nil
	}
	// An alternative may itself hold ", ": a piece that does not open with
	// a label belongs to the answer before it.
	var answers []string
	for _, p := range strings.Split(chosen, ", ") {
		if len(answers) > 0 && !questionItem.MatchString(p) {
			answers[len(answers)-1] += ", " + p
			continue
		}
		answers = append(answers, p)
	}
	for i, q := range qs {
		if i >= len(answers) {
			return fmt.Errorf("chosen %q does not answer %s; a question record is ruled as %q", chosen, q.Label, shape)
		}
		m := questionItem.FindStringSubmatch(strings.TrimSpace(answers[i]))
		if m == nil || m[1] != q.Label {
			return fmt.Errorf("chosen %q does not answer %s in its place; a question record is ruled as %q", chosen, q.Label, shape)
		}
		if alt := strings.TrimSpace(m[2]); !slices.Contains(q.Alts, alt) {
			return fmt.Errorf("chosen %q: %s %s is not one of %s's alternatives (%s)", chosen, q.Label, alt, q.Label, strings.Join(q.Alts, ", "))
		}
	}
	if len(answers) > len(qs) {
		return fmt.Errorf("chosen %q answers more than the record's %d questions; a question record is ruled as %q", chosen, len(qs), shape)
	}
	return nil
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

// rulingTimes stamps RuledAt on ruled records that carry a forecast: the
// committer time of the oldest commit that adds `status: ruled` to the file.
// Not a repo, or no such commit, leaves it empty and is no problem.
func rulingTimes(ds []model.Decision, timeout time.Duration) {
	if timeout <= 0 {
		timeout = 5 * time.Second
	}
	for i := range ds {
		d := &ds[i]
		if d.Forecast == "" || d.Status != model.DecisionRuled {
			continue
		}
		d.RuledAt = rulingCommitTime(d.Path, timeout)
	}
}

func rulingCommitTime(path string, timeout time.Duration) string {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	out, err := git(ctx, filepath.Dir(path), "log", "--reverse", "--format=%cI", "-S", "status: ruled", "--", filepath.Base(path))
	if err != nil || out == "" {
		return ""
	}
	return strings.SplitN(out, "\n", 2)[0]
}
