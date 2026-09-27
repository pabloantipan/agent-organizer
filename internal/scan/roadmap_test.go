package scan

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"organizer/internal/model"
)

// sandbox keeps a test off the real home: nothing here should read it, and a
// regression that does must fail in the fixture, not in Pablo's files.
func sandbox(t *testing.T) {
	t.Helper()
	t.Setenv("HOME", t.TempDir())
	t.Setenv("XDG_DATA_HOME", t.TempDir())
}

func initA(t *testing.T) model.ScannedInitiative {
	t.Helper()
	sandbox(t)
	home := fixtureHome(t)
	return ReadInitiative(filepath.Join(home, "init-a"), opts(home))
}

// FR-1: goal, measure and specs come off initiative.yaml. G1, the scan half.
func TestReadInitiativeGoalMeasureSpecs(t *testing.T) {
	si := initA(t)

	if si.Goal != "Initiative A ships the thing acme asked for" {
		t.Errorf("goal=%q", si.Goal)
	}
	if si.Measure != "acme signs off on one run with no manual step" {
		t.Errorf("measure=%q", si.Measure)
	}
	want := []string{"specs/", "docs/one-spec.md"}
	if len(si.Specs) != len(want) {
		t.Fatalf("specs=%v", si.Specs)
	}
	for i := range want {
		if si.Specs[i] != want[i] {
			t.Errorf("specs[%d]=%q want %q", i, si.Specs[i], want[i])
		}
	}
}

// FR-2 and FR-3: the stages in file order, both exit shapes, and the current
// stage as the first without done. G2, first half.
func TestReadRoadmapStagesAndCurrentStage(t *testing.T) {
	si := initA(t)

	var ids []string
	for _, s := range si.Stages {
		ids = append(ids, s.ID)
	}
	if len(ids) != 4 || strings.Join(ids, ",") != "foundations,joins,joins,views" {
		t.Fatalf("stage ids=%v", ids)
	}

	first := si.Stages[0]
	if first.Title != "Foundations" || first.Done != "2026-08-15" || first.Target != "2026-08-15" {
		t.Errorf("stage 1=%+v", first)
	}
	if first.Outcome != "the scanner reads every file the initiative has" {
		t.Errorf("stage 1 outcome=%q", first.Outcome)
	}
	if len(first.Gates) != 1 || first.Gates[0] != "0001" {
		t.Errorf("stage 1 gates=%v", first.Gates)
	}
	if len(first.Exit) != 2 || first.Exit[0].Text != "initiative.yaml is read" || first.Exit[0].Met != "2026-08-10" {
		t.Errorf("stage 1 exit=%+v", first.Exit)
	}

	cur := si.Stages[1]
	if cur.Appetite != "two waves" || cur.Target != "" {
		t.Errorf("current stage=%+v", cur)
	}
	// The bare-string exit shape: text set, met empty.
	if len(cur.Exit) != 2 || cur.Exit[0].Text != "an agent is joined to a card" || cur.Exit[0].Met != "" {
		t.Errorf("current stage exit=%+v", cur.Exit)
	}

	// FR-3: exactly one stage is current, and it is the first without done.
	var current []string
	for _, s := range si.Stages {
		if s.Current {
			current = append(current, s.ID)
		}
	}
	if len(current) != 1 || current[0] != "joins" {
		t.Fatalf("current stages=%v", current)
	}
	if got, ok := model.CurrentStage(si.Stages); !ok || got.Title != "The joins" {
		t.Errorf("CurrentStage()=%+v ok=%v", got, ok)
	}
}

// FR-3: an initiative with no roadmap has no stages and no problem. G2, second half.
func TestReadInitiativeWithoutRoadmap(t *testing.T) {
	sandbox(t)
	home := fixtureHome(t)
	si := ReadInitiative(filepath.Join(home, "work", "init-b"), opts(home))

	if len(si.Stages) != 0 {
		t.Errorf("stages=%+v", si.Stages)
	}
	if len(si.Problems) != 0 {
		t.Errorf("problems=%+v", si.Problems)
	}
	if _, ok := model.CurrentStage(si.Stages); ok {
		t.Error("no roadmap should have no current stage")
	}
}

// FR-4: a card and a decision record carry an optional stage.
func TestCardAndDecisionCarryStage(t *testing.T) {
	si := initA(t)

	byslug := map[string]model.Card{}
	for _, c := range si.Cards {
		byslug[c.Slug] = c
	}
	if byslug["alpha"].Stage != "joins" {
		t.Errorf("alpha stage=%q", byslug["alpha"].Stage)
	}
	if byslug["gamma"].Stage != "" {
		t.Errorf("gamma stage=%q, a card outside the roadmap carries none", byslug["gamma"].Stage)
	}
	if len(si.Decisions) != 1 || si.Decisions[0].Stage != "foundations" {
		t.Fatalf("decisions=%+v", si.Decisions)
	}
}

// FR-5: the four malformed cases are one problem each and the board scans. G3.
func TestRoadmapProblemsDoNotFailTheScan(t *testing.T) {
	si := initA(t)

	got := map[string]int{}
	for _, p := range si.Problems {
		got[filepath.Base(p.Path)+"|"+p.Msg]++
	}
	for _, want := range []string{
		`roadmap.yaml|stage id "joins" is used twice`,
		"roadmap.yaml|stage joins gates on decision 0099, which does not exist",
		`beta.md|stage "no-such-stage" is not on the roadmap`,
		`roadmap.yaml|stage joins exit "a wave is grouped" met "soon" is not YYYY-MM-DD`,
	} {
		if got[want] != 1 {
			t.Errorf("problem %q reported %d times, want 1 (all: %v)", want, got[want], got)
		}
	}
	// The rest of the board is intact: the initiative, its cards and its
	// stages are all still there.
	if si.ID != "init-a" || si.Goal == "" {
		t.Errorf("initiative lost: %+v", si.Initiative)
	}
	if n, b, x := si.Counts(); n != 1 || b != 1 || x != 2 {
		t.Errorf("counts now=%d blocked=%d next=%d", n, b, x)
	}
	if len(si.Stages) != 4 {
		t.Errorf("stages=%d, a malformed stage is kept and reported", len(si.Stages))
	}
}

// The malformed shapes the fixture cannot hold at once, each in its own
// roadmap: every one is a problem and never an error.
func TestReadRoadmapMalformed(t *testing.T) {
	cases := []struct {
		name       string
		yaml       string
		wantStages int
		wantProbs  []string
	}{
		{
			name:       "not yaml at all",
			yaml:       "stages: [\n",
			wantStages: 0,
			wantProbs:  []string{"roadmap.yaml:"},
		},
		{
			name:       "stage without an id",
			yaml:       "stages:\n  - title: Nameless\n",
			wantStages: 1,
			wantProbs:  []string{"stage 1 has no id"},
		},
		{
			name:       "target and done that are not dates",
			yaml:       "stages:\n  - id: a\n    target: Q4\n    done: soonish\n",
			wantStages: 1,
			wantProbs:  []string{`stage a target "Q4" is not YYYY-MM-DD`, `stage a done "soonish" is not YYYY-MM-DD`},
		},
		{
			name:       "empty stage list",
			yaml:       "stages: []\n",
			wantStages: 0,
		},
		{
			name:       "no stages key",
			yaml:       "# nothing yet\n",
			wantStages: 0,
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			sandbox(t)
			wo := t.TempDir()
			if err := os.WriteFile(filepath.Join(wo, roadmapFile), []byte(tc.yaml), 0o644); err != nil {
				t.Fatal(err)
			}
			stages, problems := readRoadmap(wo, nil)
			if len(stages) != tc.wantStages {
				t.Errorf("stages=%d want %d", len(stages), tc.wantStages)
			}
			if len(problems) != len(tc.wantProbs) {
				t.Fatalf("problems=%+v want %d", problems, len(tc.wantProbs))
			}
			for i, want := range tc.wantProbs {
				if !strings.Contains(problems[i].Msg, want) {
					t.Errorf("problem[%d]=%q want it to contain %q", i, problems[i].Msg, want)
				}
			}
		})
	}
}

// A gate is a decision record number; a roadmap that writes 4 for 0004 still
// resolves, and a stage id nothing names is not a problem.
func TestCheckStageLinks(t *testing.T) {
	stages := []model.Stage{{ID: "one", Gates: []string{"4", "0001", "later"}}, {ID: "two"}}
	decisions := []model.Decision{{Number: "0001", Path: "d1"}, {Number: "0004", Path: "d4"}}
	cards := []model.Card{{Slug: "a", Stage: "two", Path: "a.md"}, {Slug: "b", Path: "b.md"}}

	ps := checkStageLinks("wo", stages, cards, decisions)
	if len(ps) != 1 || !strings.Contains(ps[0].Msg, "gates on decision later") {
		t.Fatalf("problems=%+v", ps)
	}
	// No roadmap: a stage reference cannot be checked against nothing, and an
	// initiative without stages reports nothing at all.
	if ps := checkStageLinks("wo", nil, cards, decisions); len(ps) != 0 {
		t.Errorf("no stages should report nothing: %+v", ps)
	}
}

// twenty-at-a-glance FR-1: scope in and out come off initiative.yaml; an
// initiative without one has empty lists and no problem. G1, the scan half.
func TestReadInitiativeScope(t *testing.T) {
	si := initA(t)
	wantIn := "the scanner and the board acme opens every morning|one merged view across both machines"
	if got := strings.Join(si.Scope.In, "|"); got != wantIn {
		t.Errorf("scope in=%q want %q", got, wantIn)
	}
	if got := strings.Join(si.Scope.Out, "|"); got != "writing to acme's card files" {
		t.Errorf("scope out=%q", got)
	}

	home := fixtureHome(t)
	b := ReadInitiative(filepath.Join(home, "work", "init-b"), opts(home))
	if len(b.Scope.In) != 0 || len(b.Scope.Out) != 0 {
		t.Errorf("init-b scope=%+v, want none", b.Scope)
	}
	if len(b.Problems) != 0 {
		t.Errorf("no scope is not a problem: %+v", b.Problems)
	}
}

// twenty-at-a-glance FR-2: a stage carries its phase; any value but discovery
// or building is one problem, and the stage is kept with no phase. G2.
func TestReadRoadmapPhase(t *testing.T) {
	cases := []struct {
		name       string
		yaml       string
		wantPhases []string
		wantProbs  []string
	}{
		{
			name:       "both phases",
			yaml:       "stages:\n  - id: a\n    phase: discovery\n  - id: b\n    phase: building\n",
			wantPhases: []string{"discovery", "building"},
		},
		{
			name:       "no phase is not a problem",
			yaml:       "stages:\n  - id: a\n",
			wantPhases: []string{""},
		},
		{
			name:       "a phase that is neither",
			yaml:       "stages:\n  - id: a\n    phase: later\n  - id: b\n    phase: building\n",
			wantPhases: []string{"", "building"},
			wantProbs:  []string{`stage a phase "later" is neither discovery nor building`},
		},
		{
			name:       "the case counts",
			yaml:       "stages:\n  - id: a\n    phase: Building\n",
			wantPhases: []string{""},
			wantProbs:  []string{`stage a phase "Building" is neither discovery nor building`},
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			sandbox(t)
			wo := t.TempDir()
			if err := os.WriteFile(filepath.Join(wo, roadmapFile), []byte(tc.yaml), 0o644); err != nil {
				t.Fatal(err)
			}
			stages, problems := readRoadmap(wo, nil)
			if len(stages) != len(tc.wantPhases) {
				t.Fatalf("stages=%+v, a stage with a bad phase is kept", stages)
			}
			for i, want := range tc.wantPhases {
				if stages[i].Phase != want {
					t.Errorf("stage %d phase=%q want %q", i, stages[i].Phase, want)
				}
			}
			if len(problems) != len(tc.wantProbs) {
				t.Fatalf("problems=%+v want %d", problems, len(tc.wantProbs))
			}
			for i, want := range tc.wantProbs {
				if problems[i].Msg != want {
					t.Errorf("problem[%d]=%q want %q", i, problems[i].Msg, want)
				}
			}
		})
	}
}

// twenty-at-a-glance FR-3: the first building stage after discovery is gated by
// a record, matched by number with zero-padding. G3.
func TestCheckStageLinksBuildingAfterDiscovery(t *testing.T) {
	decisions := []model.Decision{{Number: "0004", Path: "d4"}}
	const ungated = "starts building after discovery with no gate naming a decision record"
	cases := []struct {
		name   string
		stages []model.Stage
		want   []string
	}{
		{
			name:   "discovery then ungated building",
			stages: []model.Stage{{ID: "find", Phase: "discovery"}, {ID: "make", Phase: "building"}},
			want:   []string{"stage make " + ungated},
		},
		{
			name:   "gated by a record written 4",
			stages: []model.Stage{{ID: "find", Phase: "discovery"}, {ID: "make", Phase: "building", Gates: []string{"4"}}},
		},
		{
			name:   "gated by a record written 0004",
			stages: []model.Stage{{ID: "find", Phase: "discovery"}, {ID: "make", Phase: "building", Gates: []string{"0004"}}},
		},
		{
			name:   "starts in building",
			stages: []model.Stage{{ID: "make", Phase: "building"}, {ID: "more", Phase: "building"}},
		},
		{
			name:   "building after building after a gated start",
			stages: []model.Stage{{ID: "find", Phase: "discovery"}, {ID: "make", Phase: "building", Gates: []string{"4"}}, {ID: "more", Phase: "building"}},
		},
		{
			name:   "a gate naming no record is its own problem and does not gate",
			stages: []model.Stage{{ID: "find", Phase: "discovery"}, {ID: "make", Phase: "building", Gates: []string{"0099"}}},
			want:   []string{"stage make gates on decision 0099, which does not exist", "stage make " + ungated},
		},
		{
			name:   "a stage without a phase in between",
			stages: []model.Stage{{ID: "find", Phase: "discovery"}, {ID: "pause"}, {ID: "make", Phase: "building"}},
			want:   []string{"stage make " + ungated},
		},
		{
			name:   "back to discovery, then building again",
			stages: []model.Stage{{ID: "make", Phase: "building"}, {ID: "rethink", Phase: "discovery"}, {ID: "remake", Phase: "building"}},
			want:   []string{"stage remake " + ungated},
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			ps := checkStageLinks("wo", tc.stages, nil, decisions)
			var got []string
			for _, p := range ps {
				got = append(got, p.Msg)
			}
			if strings.Join(got, "\n") != strings.Join(tc.want, "\n") {
				t.Errorf("problems=%q want %q", got, tc.want)
			}
		})
	}
}
