package service

import (
	"encoding/json"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"organizer/internal/cache"
	"organizer/internal/model"
)

func TestWriteCellKeepsOtherFields(t *testing.T) {
	p := filepath.Join(t.TempDir(), "cell.json")
	os.WriteFile(p, []byte(`{"project":"rpex","workdir":"/w","note":"n","agents":["supervisor","w0","reviewer"],"human":"pablo","reconciler":"supervisor","push":true}`), 0o644)
	if err := writeCell(p, []string{"supervisor", "reviewer"}); err != nil {
		t.Fatal(err)
	}
	var doc map[string]any
	b, _ := os.ReadFile(p)
	json.Unmarshal(b, &doc)
	if doc["push"] != true || doc["note"] != "n" || doc["reconciler"] != "supervisor" {
		t.Errorf("other fields lost: %v", doc)
	}
	if got := doc["agents"].([]any); len(got) != 2 || got[1] != "reviewer" {
		t.Errorf("agents %v", got)
	}
}

func TestRetirableReadsCardsAndSessions(t *testing.T) {
	si := &model.ScannedInitiative{}
	si.ID = "rpex"
	si.Cell = &model.Cell{Project: "rpex", Agents: []string{"supervisor", "w1-a", "w1-b", "w2-a", "reviewer"}, Human: "pablo", Reconciler: "supervisor"}
	si.Cards = []model.Card{
		{Slug: "done-a", Seat: "w1-a", Status: "done", Archived: true},
		{Slug: "open-b", Seat: "w2-a", Status: "now"},
	}
	si.Agents = []model.Agent{{Session: "rpex-probe-w1-b", State: model.AgentWorking}}
	got := Retirable(si)
	if len(got) != 2 || got[0] != "w1-a" || got[1] != "reviewer" {
		t.Errorf("retirable %v: w1-a is done, reviewer has no cards; w1-b works, w2-a has an open card, supervisor reconciles", got)
	}
}

// campCell is the roster as it stood for the 2026-09-16 wave: five seats,
// whose sessions that run had to kill by hand because the plan looked for
// ccint-camp-monorepo-probe-po_andrea and zellij had camp-probe-andrea.
func campCell(t *testing.T) *model.Cell {
	t.Helper()
	b, err := os.ReadFile(filepath.Join("..", "..", "testdata", "cells", "camp.json"))
	if err != nil {
		t.Fatal(err)
	}
	var c model.Cell
	if err := json.Unmarshal(b, &c); err != nil {
		t.Fatal(err)
	}
	return &c
}

func TestPlanRetireFindsEverySeatsSessionOnTheCampCell(t *testing.T) {
	cell := campCell(t)
	if len(cell.Agents) != 5 {
		t.Fatalf("the fixture is the five-seat roster, got %v", cell.Agents)
	}
	// What `zellij list-sessions -n` had that day, plus one session of
	// another cell that must not be touched.
	live := map[string]bool{
		"camp-probe-andrea": true, "camp-probe-nicolas": true, "camp-probe-francisco": true,
		"camp-probe-javiera": true, "camp-probe-mauricio": true, "rpex-probe-supervisor": true,
	}
	defer func(prev func(string) map[string]bool) { sessionLister = prev }(sessionLister)
	sessionLister = func(string) map[string]bool { return live }
	t.Setenv("XDG_DATA_HOME", t.TempDir())

	si := model.ScannedInitiative{}
	si.ID, si.Path, si.Cell = "ccint-camp-monorepo", t.TempDir(), cell
	s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}}

	p, err := s.PlanRetire(RetireOptions{InitiativeID: si.ID, Seats: cell.Agents})
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"camp-probe-andrea", "camp-probe-nicolas", "camp-probe-francisco", "camp-probe-javiera", "camp-probe-mauricio"}
	if !slices.Equal(p.Sessions, want) {
		t.Errorf("sessions %v, want the five the run killed by hand %v", p.Sessions, want)
	}
	if len(p.Seats) != 5 || len(p.Keep) != 0 {
		t.Errorf("seats %v keep %v", p.Seats, p.Keep)
	}
	if len(p.Problems) != 0 {
		t.Errorf("nothing to report: %v", p.Problems)
	}

	// The default, every seat but the reconciler: four sessions, andrea's
	// left alone because po_andrea reconciles.
	p, err = s.PlanRetire(RetireOptions{InitiativeID: si.ID})
	if err != nil {
		t.Fatal(err)
	}
	if slices.Contains(p.Sessions, "camp-probe-andrea") || len(p.Sessions) != 4 {
		t.Errorf("sessions %v, want the four that are not the reconciler's", p.Sessions)
	}
}

// A seat the budget cannot name is reported, not skipped: that is the seat
// whose session has to be killed by hand.
func TestPlanRetireReportsASeatItCannotName(t *testing.T) {
	defer func(prev func(string) map[string]bool) { sessionLister = prev }(sessionLister)
	sessionLister = func(string) map[string]bool { return map[string]bool{} }
	t.Setenv("XDG_DATA_HOME", t.TempDir())

	si := model.ScannedInitiative{}
	si.ID, si.Path = "ccint-camp-monorepo", t.TempDir()
	si.Cell = &model.Cell{Project: "ccint-camp-monorepo", Agents: []string{"po_andrea", "dev_bruno"}, Human: "pablo", Reconciler: "po_andrea"}
	s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}}

	p, err := s.PlanRetire(RetireOptions{InitiativeID: si.ID})
	if err != nil {
		t.Fatal(err)
	}
	if len(p.Sessions) != 0 {
		t.Errorf("sessions %v", p.Sessions)
	}
	if len(p.Problems) != 1 || !strings.Contains(p.Problems[0], "31 characters") {
		t.Errorf("problems %v, want the length of ccint-camp-monorepo-probe-bruno", p.Problems)
	}
}
