package scan

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"organizer/internal/model"
)

// roadmapFile is the initiative's stages, beside initiative.yaml (working-on
// skill, Roadmap). Optional: an initiative without one has no stages.
const roadmapFile = "roadmap.yaml"

// readRoadmap reads working-on/roadmap.yaml into stages in file order and
// stamps the current one: the first without a done date (FR-3). A missing file
// is the normal case, not a problem. A malformed one is reported and the scan
// goes on, so one bad roadmap never costs the board (FR-5).
func readRoadmap(wo string, problems []model.Problem) ([]model.Stage, []model.Problem) {
	p := filepath.Join(wo, roadmapFile)
	b, err := os.ReadFile(p)
	if err != nil {
		return nil, problems
	}
	var doc struct {
		Stages []model.Stage `yaml:"stages"`
	}
	if err := yamlUnmarshal(b, &doc); err != nil {
		return nil, append(problems, model.Problem{Path: p, Msg: "roadmap.yaml: " + err.Error()})
	}
	stages := doc.Stages
	problems = append(problems, checkStages(p, stages)...)
	for i := range stages {
		if !validPhase(stages[i].Phase) {
			stages[i].Phase = "" // reported by checkStages; the stage is kept without one
		}
	}
	for i := range stages {
		if strings.TrimSpace(stages[i].Done) == "" {
			stages[i].Current = true // FR-3; model.CurrentStage reads the same rule
			break
		}
	}
	return stages, problems
}

// checkStages holds a roadmap to the format: a stage has an id, no two share
// one, its phase is discovery or building if it has one, and every date on it
// is a real date. A broken stage is kept, like a
// broken decision record: the board shows what is on disk and the problem says
// what to fix.
func checkStages(path string, stages []model.Stage) []model.Problem {
	var ps []model.Problem
	add := func(format string, a ...any) {
		ps = append(ps, model.Problem{Path: path, Msg: fmt.Sprintf(format, a...)})
	}
	seen := map[string]bool{}
	for i, s := range stages {
		id := strings.TrimSpace(s.ID)
		name := id
		if name == "" {
			name = fmt.Sprintf("stage %d", i+1)
			add("%s has no id", name)
		} else if seen[id] {
			add("stage id %q is used twice", id)
		}
		seen[id] = true
		if !validPhase(s.Phase) {
			add("stage %s phase %q is neither discovery nor building", name, s.Phase)
		}
		if s.Target != "" && !validDate(s.Target) {
			add("stage %s target %q is not YYYY-MM-DD", name, s.Target)
		}
		if s.Done != "" && !validDate(s.Done) {
			add("stage %s done %q is not YYYY-MM-DD", name, s.Done)
		}
		for _, e := range s.Exit {
			if e.Met != "" && !validDate(e.Met) {
				add("stage %s exit %q met %q is not YYYY-MM-DD", name, e.Text, e.Met)
			}
		}
	}
	return ps
}

// validPhase is an empty phase or one of the two the working-on skill names.
func validPhase(ph string) bool {
	return ph == "" || ph == model.PhaseDiscovery || ph == model.PhaseBuilding
}

// checkStageLinks reports the references a roadmap cannot resolve on its own:
// a stage gating on a decision record that is not there, a card or record
// joining a stage that does not exist (FR-5), and a building stage after a
// discovery stage that no record gates (twenty-at-a-glance FR-3: the skill's
// "the system is defined enough to build" is a ruling, not a feeling). It needs the decisions and
// the cards, so it runs after all three are read.
func checkStageLinks(wo string, stages []model.Stage, cards []model.Card, decisions []model.Decision) []model.Problem {
	var ps []model.Problem
	if len(stages) == 0 {
		return nil
	}
	records := map[string]bool{}
	for _, d := range decisions {
		records[d.Number] = true
	}
	ids := map[string]bool{}
	for _, s := range stages {
		if id := strings.TrimSpace(s.ID); id != "" {
			ids[id] = true
		}
	}
	rp := filepath.Join(wo, roadmapFile)
	for _, s := range stages {
		for _, g := range s.Gates {
			if n := gateNumber(g); n != "" && !records[n] {
				ps = append(ps, model.Problem{Path: rp, Msg: fmt.Sprintf("stage %s gates on decision %s, which does not exist", s.ID, g)})
			}
		}
	}
	prev := "" // the phase of the nearest earlier stage that has one
	for i, s := range stages {
		if s.Phase == model.PhaseBuilding && prev == model.PhaseDiscovery && !gatedByRecord(s, records) {
			name := strings.TrimSpace(s.ID)
			if name == "" {
				name = fmt.Sprintf("stage %d", i+1)
			}
			ps = append(ps, model.Problem{Path: rp, Msg: fmt.Sprintf("stage %s starts building after discovery with no gate naming a decision record", name)})
		}
		if s.Phase != "" {
			prev = s.Phase
		}
	}
	for _, c := range cards {
		if st := strings.TrimSpace(c.Stage); st != "" && !ids[st] {
			ps = append(ps, model.Problem{Path: c.Path, Msg: fmt.Sprintf("stage %q is not on the roadmap", st)})
		}
	}
	for _, d := range decisions {
		if st := strings.TrimSpace(d.Stage); st != "" && !ids[st] {
			ps = append(ps, model.Problem{Path: d.Path, Msg: fmt.Sprintf("stage %q is not on the roadmap", st)})
		}
	}
	return ps
}

// gatedByRecord is whether one of the stage's gates names a record that exists.
func gatedByRecord(s model.Stage, records map[string]bool) bool {
	for _, g := range s.Gates {
		if records[gateNumber(g)] {
			return true
		}
	}
	return false
}

// gateNumber is a gate as a decision record number: the file name's four
// digits. A roadmap may write 4 where the record is 0004; anything that is not
// a number is left alone, and then it names no record.
func gateNumber(g string) string {
	g = strings.TrimSpace(g)
	if g == "" {
		return ""
	}
	for _, r := range g {
		if r < '0' || r > '9' {
			return g
		}
	}
	for len(g) < 4 {
		g = "0" + g
	}
	return g
}
