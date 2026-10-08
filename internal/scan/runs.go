package scan

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	"gopkg.in/yaml.v3"

	"organizer/internal/model"
)

// runsDir holds a supervisor's run records, at the initiative root beside
// working-on/ (the supervise skill's leftovers; agent-slack docs/runs/TEMPLATE.md).
const runsDir = "runs"

// runName is a run record's file name: the date it was written, then a slug.
// Anything else in runs/ (a README, a copied TEMPLATE.md) is not a record.
var runName = regexp.MustCompile(`^(\d{4}-\d{2}-\d{2})-.+\.md$`)

// runTimeLayouts are ISO 8601 with an offset, to the minute or finer. A time
// without its offset is a problem: a run record is read on more than one
// machine, and a bare clock time means a different instant on each.
var runTimeLayouts = []string{"2006-01-02T15:04Z07:00", time.RFC3339Nano}

// readRuns reads <root>/runs/*.md in file name order (date first) into waves
// (roadmap-as-a-plan FR-1). A record's `waves:` block gives one Wave per
// entry; a record with no block, or whose block cannot be parsed, is one dot:
// its file and date, so the Roadmap can still place it (0022). No runs/ is no
// waves and no problem. A malformed block is kept and reported (FR-3).
func readRuns(root string, problems []model.Problem) ([]model.Wave, []model.Problem) {
	dir := filepath.Join(root, runsDir)
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, problems
	}
	var out []model.Wave
	for _, e := range entries {
		m := runName.FindStringSubmatch(e.Name())
		if e.IsDir() || m == nil || !validDate(m[1]) {
			continue
		}
		p := filepath.Join(dir, e.Name())
		b, err := os.ReadFile(p)
		if err != nil {
			problems = append(problems, model.UnreadProblem(p, err.Error()))
			continue
		}
		waves, probs := parseRun(p, string(b))
		problems = append(problems, probs...)
		if len(waves) == 0 {
			out = append(out, model.Wave{Record: e.Name(), Date: m[1], Dot: true, Task: firstHeading(string(b))})
			continue
		}
		for i := range waves {
			waves[i].Record, waves[i].Date = e.Name(), m[1]
		}
		out = append(out, waves...)
	}
	// [] rather than null on the board, a dot's included.
	for i := range out {
		if out[i].Cards == nil {
			out[i].Cards = []string{}
		}
		if out[i].Rounds == nil {
			out[i].Rounds = []model.Round{}
		}
	}
	return out, problems
}

// parseRun decodes the frontmatter's waves list and checks it. No frontmatter
// or no waves key is no waves and no problem; YAML that does not parse is one
// problem for the file.
func parseRun(path, content string) ([]model.Wave, []model.Problem) {
	front, _, err := splitFrontmatter(content)
	if err != nil {
		return nil, nil
	}
	var doc struct {
		Waves []model.Wave `yaml:"waves"`
	}
	if err := yaml.Unmarshal([]byte(front), &doc); err != nil {
		return nil, []model.Problem{model.UnreadProblem(path, "run record waves: "+err.Error())}
	}
	return doc.Waves, checkWaves(path, doc.Waves)
}

// checkWaves holds a waves block to the run record template, one problem per
// fault: a time that is not ISO 8601 with an offset, a kind or result outside
// its set, a round naming a card its wave does not list, and an end before its
// start. Empty times are allowed (an open wave has no merge, a round in flight
// no end), and so is an empty result.
func checkWaves(path string, waves []model.Wave) []model.Problem {
	var ps []model.Problem
	add := func(format string, a ...any) {
		ps = append(ps, model.Problem{Path: path, Msg: fmt.Sprintf(format, a...)})
	}
	for _, w := range waves {
		name := fmt.Sprintf("wave %d", w.Number)
		for _, f := range []struct{ field, v string }{{"launched", w.Launched}, {"merged", w.Merged}} {
			if _, ok := runTime(f.v); !ok {
				add("%s %s %q is not ISO 8601 with an offset", name, f.field, f.v)
			}
		}
		cards := map[string]bool{}
		for _, c := range w.Cards {
			cards[c] = true
		}
		for j, r := range w.Rounds {
			rn := fmt.Sprintf("%s round %d", name, j+1)
			start, okS := runTime(r.Start)
			end, okE := runTime(r.End)
			if !okS {
				add("%s start %q is not ISO 8601 with an offset", rn, r.Start)
			}
			if !okE {
				add("%s end %q is not ISO 8601 with an offset", rn, r.End)
			}
			if okS && okE && !start.IsZero() && !end.IsZero() && end.Before(start) {
				add("%s ends %s before it starts %s", rn, r.End, r.Start)
			}
			if !model.ValidRoundKind(r.Kind) {
				add("%s kind %q is not build, review, ui-review or take", rn, r.Kind)
			}
			if r.Result != "" && !model.ValidRoundResult(r.Result) {
				add("%s result %q is not pass, fail or n/a", rn, r.Result)
			}
			if !cards[r.Card] {
				add("%s names card %q, which the wave does not list", rn, r.Card)
			}
		}
	}
	return ps
}

// runTime parses a run record time. Empty is the zero time and fine.
func runTime(s string) (time.Time, bool) {
	s = strings.TrimSpace(s)
	if s == "" {
		return time.Time{}, true
	}
	for _, l := range runTimeLayouts {
		if t, err := time.Parse(l, s); err == nil {
			return t, true
		}
	}
	return time.Time{}, false
}

// joinWaveStages stamps each wave with the stages its cards sit in (FR-2),
// done cards included: in roadmap order, then any stage the roadmap does not
// name in the order first seen (already a problem on the card). A wave whose
// cards join no stage keeps an empty list: outside any stage. Never nil, so
// the board says [] rather than null.
func joinWaveStages(waves []model.Wave, cards []model.Card, stages []model.Stage) {
	stageOf := map[string]string{}
	for _, c := range cards {
		if st := strings.TrimSpace(c.Stage); st != "" {
			stageOf[c.Slug] = st
		}
	}
	rank := map[string]int{}
	for i, s := range stages {
		if _, dup := rank[s.ID]; !dup {
			rank[s.ID] = i
		}
	}
	for i := range waves {
		seen := map[string]int{}
		got := []string{}
		for _, c := range waves[i].Cards {
			if st, ok := stageOf[c]; ok {
				if _, dup := seen[st]; !dup {
					seen[st] = len(got)
					got = append(got, st)
				}
			}
		}
		sort.SliceStable(got, func(a, b int) bool {
			ra, oka := rank[got[a]]
			rb, okb := rank[got[b]]
			switch {
			case oka && okb:
				return ra < rb
			case oka != okb:
				return oka
			default:
				return seen[got[a]] < seen[got[b]]
			}
		})
		waves[i].Stages = got
	}
}

// firstHeading is the record's first markdown heading, a dot's title.
func firstHeading(content string) string {
	_, body, err := splitFrontmatter(content)
	if err != nil {
		body = content
	}
	for _, l := range strings.Split(body, "\n") {
		if strings.HasPrefix(l, "# ") {
			return strings.TrimSpace(l[2:])
		}
	}
	return ""
}
