package service

import (
	"encoding/json"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/model"
	"organizer/internal/scan"
	"organizer/internal/session"
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
	if len(got) != 1 || got[0] != "w1-a" {
		t.Errorf("retirable %v: w1-a is done; reviewer has no cards, w1-b works, w2-a has an open card, supervisor reconciles", got)
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

	// The camp seats are personas no card names, standing seats since
	// leftovers-54 FR-1, so naming them takes force.
	p, err := s.PlanRetire(RetireOptions{InitiativeID: si.ID, Seats: cell.Agents, Force: true})
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

	// The default follows leftovers-54 FR-1a: no card names a camp seat, so
	// it plans none and kills nothing.
	p, err = s.PlanRetire(RetireOptions{InitiativeID: si.ID})
	if err != nil {
		t.Fatal(err)
	}
	if len(p.Seats) != 0 || len(p.Sessions) != 0 {
		t.Errorf("default plans seats %v sessions %v, want none: no card names a seat", p.Seats, p.Sessions)
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
	si.Cell = &model.Cell{Project: "ccint-camp-monorepo-and-a-project-name-no-socket-dir-can-hold", Agents: []string{"po_andrea", "dev_bruno"}, Human: "pablo", Reconciler: "po_andrea"}
	s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}}

	p, err := s.PlanRetire(RetireOptions{InitiativeID: si.ID, Seats: []string{"dev_bruno"}, Force: true})
	if err != nil {
		t.Fatal(err)
	}
	if len(p.Sessions) != 0 {
		t.Errorf("sessions %v", p.Sessions)
	}
	if len(p.Problems) != 1 || !strings.Contains(p.Problems[0], "73 characters") {
		t.Errorf("problems %v, want the length of ccint-camp-monorepo-and-a-project-name-no-socket-dir-can-hold-probe-bruno", p.Problems)
	}
}

// lead-side-fixes G6 (FR-9): --retirable on a cell in definition, a draft
// or a roster no seat of which has run, says so as its reason.
func TestPlanRetireRetirableSaysTheCellIsInDefinition(t *testing.T) {
	defer func(prev func(string) map[string]bool) { sessionLister = prev }(sessionLister)
	sessionLister = func(string) map[string]bool { return map[string]bool{} }
	defer func(f func() []session.Run) { loadRuns = f }(loadRuns)
	loadRuns = func() []session.Run { return nil }
	t.Setenv("XDG_DATA_HOME", t.TempDir())

	for _, draft := range []bool{false, true} {
		si := model.ScannedInitiative{}
		si.ID, si.Path = "init-define", t.TempDir()
		si.Cell = &model.Cell{Project: "define", Agents: []string{"po_carla", "tech_lead_elena"}, Human: "pablo", Draft: draft}
		s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}}
		p, err := s.PlanRetire(RetireOptions{InitiativeID: si.ID, Retirable: true})
		if err != nil {
			t.Fatal(err)
		}
		if len(p.Seats) != 0 || len(p.Problems) != 2 || p.Problems[0] != "no seat is retirable: the cell is in definition" || p.Problems[1] != "nothing to retire" {
			t.Errorf("draft %v: seats %v, problems %v, want none, the cell is in definition, nothing to retire", draft, p.Seats, p.Problems)
		}
	}
}

// Retiring the last seat leaves a cell with no seats, not a malformed file:
// cell.json reads `"agents": []` and the scan still finds the cell.
func TestRetireOfTheLastSeatKeepsTheCell(t *testing.T) {
	defer func(prev func(string) map[string]bool) { sessionLister = prev }(sessionLister)
	sessionLister = func(string) map[string]bool { return map[string]bool{} }
	t.Setenv("XDG_DATA_HOME", t.TempDir())

	root := t.TempDir()
	os.MkdirAll(filepath.Join(root, "working-on"), 0o755)
	os.MkdirAll(filepath.Join(root, "agents"), 0o755)
	os.WriteFile(filepath.Join(root, "working-on", "initiative.yaml"), []byte("id: rpex\ntitle: R\n"), 0o644)
	os.WriteFile(filepath.Join(root, "agents", "cell.json"), []byte(`{"project":"rpex","workdir":"/w","agents":["w1-a"],"human":"pablo","reconciler":"supervisor","push":true}`), 0o644)
	os.MkdirAll(filepath.Join(root, "working-on", "done"), 0o755)
	os.WriteFile(filepath.Join(root, "working-on", "done", "a.md"), []byte("---\ntitle: A\nstatus: done\nseat: w1-a\nupdated: 2026-10-25\nnext: none\n---\n"), 0o644)

	si := scan.ReadInitiative(root, scan.Options{})
	if si.Cell == nil {
		t.Fatalf("fixture cell not read: %v", si.Problems)
	}
	s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}}
	p, err := s.PlanRetire(RetireOptions{InitiativeID: si.ID, Seats: []string{"w1-a"}})
	if err != nil {
		t.Fatal(err)
	}
	if len(p.Seats) != 1 || len(p.Keep) != 0 {
		t.Fatalf("seats %v keep %v, want the last seat retired", p.Seats, p.Keep)
	}
	// Retire's cell.json step.
	if err := writeCell(p.CellPath, p.Keep); err != nil {
		t.Fatal(err)
	}

	b, _ := os.ReadFile(p.CellPath)
	if !strings.Contains(string(b), `"agents": []`) {
		t.Errorf("cell.json %s, want \"agents\": []", b)
	}
	var doc map[string]any
	json.Unmarshal(b, &doc)
	if doc["push"] != true || doc["reconciler"] != "supervisor" || doc["workdir"] != "/w" {
		t.Errorf("other fields lost: %v", doc)
	}
	back := scan.ReadInitiative(root, scan.Options{})
	if back.Cell == nil || back.Cell.Project != "rpex" || len(back.Cell.Agents) != 0 {
		t.Errorf("cell %+v problems %v, want rpex with zero seats", back.Cell, back.Problems)
	}
	if len(back.Problems) != 0 {
		t.Errorf("problems %v", back.Problems)
	}
}

// G6 (discovery-in-a-cell, FR-5): a cell in definition has no retirable
// seat, so the crew block offers "Retire…", never "N retirable". Once a seat
// has run the same roster is a wave like any other; a draft stays in
// definition whatever runs.
func TestRetirableIsEmptyWhileTheCellIsInDefinition(t *testing.T) {
	defer func(f func() []session.Run) { loadRuns = f }(loadRuns)
	cellOf := func(draft bool) *model.ScannedInitiative {
		si := &model.ScannedInitiative{}
		si.ID = "init-define"
		si.Cell = &model.Cell{Project: "define-fixture", Agents: []string{"po_carla", "tech_lead_elena", "designer_diego"}, Human: "pablo", Draft: draft}
		for _, seat := range si.Cell.Agents {
			si.Cards = append(si.Cards, model.Card{Slug: seat, Seat: seat, Status: model.StatusDone, Archived: true})
		}
		return si
	}
	ran := []session.Run{{PID: 3, SessionID: "c", Persona: "po_carla", Cell: "define-fixture", Ended: true}}

	loadRuns = func() []session.Run { return nil }
	if got := Retirable(cellOf(false)); len(got) != 0 {
		t.Errorf("in definition, no seat has run: retirable %v, want none", got)
	}
	if got := Retirable(cellOf(true)); len(got) != 0 {
		t.Errorf("a draft: retirable %v, want none", got)
	}

	loadRuns = func() []session.Run { return ran }
	if got := Retirable(cellOf(false)); len(got) != 3 {
		t.Errorf("a seat has run: retirable %v, want all three", got)
	}
	if got := Retirable(cellOf(true)); len(got) != 0 {
		t.Errorf("a draft with a past run is still in definition: retirable %v", got)
	}

	loadRuns = func() []session.Run { return nil }
	live := cellOf(false)
	live.Agents = []model.Agent{{Session: "define-fixture-probe-carla", State: model.AgentRunning}}
	if got := Retirable(live); len(got) != 3 {
		t.Errorf("a seat's session is live, not working: retirable %v, want all three", got)
	}
}

// leftovers-54 G1 (FR-1): only a seat some card named in seat:, open or
// done, is retirable. The FSE and any standing role no card names is never
// picked, and naming one in --seats is refused unless force.
func TestRetirableOnlyPicksSeatsACardNamed(t *testing.T) {
	defer func(prev func(string) map[string]bool) { sessionLister = prev }(sessionLister)
	sessionLister = func(string) map[string]bool { return map[string]bool{} }
	t.Setenv("XDG_DATA_HOME", t.TempDir())

	root := t.TempDir()
	os.MkdirAll(filepath.Join(root, "working-on", "done"), 0o755)
	os.MkdirAll(filepath.Join(root, "agents"), 0o755)
	os.WriteFile(filepath.Join(root, "working-on", "initiative.yaml"), []byte("id: g1\ntitle: G1\n"), 0o644)
	os.WriteFile(filepath.Join(root, "working-on", "done", "c1.md"), []byte("---\ntitle: C1\nstatus: done\nseat: b1\nupdated: 2026-10-25\nnext: none\n---\n"), 0o644)
	os.WriteFile(filepath.Join(root, "working-on", "c2.md"), []byte("---\ntitle: C2\nstatus: now\nseat: b2\nupdated: 2026-10-25\nnext: build\n---\n"), 0o644)
	os.WriteFile(filepath.Join(root, "agents", "cell.json"), []byte(`{"project":"g1","workdir":"/w","agents":["fse","b1","b2"],"human":"pablo","reconciler":""}`), 0o644)

	si := scan.ReadInitiative(root, scan.Options{})
	if si.Cell == nil || len(si.Cards) != 2 {
		t.Fatalf("fixture not read: cell %v cards %d problems %v", si.Cell, len(si.Cards), si.Problems)
	}
	// A seat has run, so the cell is a wave, not a roster in definition.
	si.Agents = []model.Agent{{Persona: "b1", State: model.AgentRunning}}
	if got := Retirable(&si); !slices.Equal(got, []string{"b1"}) {
		t.Errorf("retirable %v, want [b1]: fse is named by no card, b2 by an open one", got)
	}

	s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}}
	p, err := s.PlanRetire(RetireOptions{InitiativeID: si.ID, Retirable: true})
	if err != nil {
		t.Fatal(err)
	}
	if !slices.Equal(p.Seats, []string{"b1"}) {
		t.Errorf("--retirable plans %v, want [b1]", p.Seats)
	}

	p, err = s.PlanRetire(RetireOptions{InitiativeID: si.ID, Seats: []string{"fse"}})
	if err != nil {
		t.Fatal(err)
	}
	if len(p.Seats) != 0 || !slices.Contains(p.Keep, "fse") {
		t.Errorf("--seats fse plans seats %v keep %v, want fse kept", p.Seats, p.Keep)
	}
	if len(p.Problems) != 2 || !strings.Contains(p.Problems[0], "fse kept: no card names it in seat:") || p.Problems[1] != "nothing to retire" {
		t.Errorf("problems %v, want why fse is kept, then nothing to retire", p.Problems)
	}

	p, err = s.PlanRetire(RetireOptions{InitiativeID: si.ID, Seats: []string{"fse"}, Force: true})
	if err != nil {
		t.Fatal(err)
	}
	if !slices.Equal(p.Seats, []string{"fse"}) || len(p.Problems) != 0 {
		t.Errorf("--seats fse --force plans %v problems %v, want fse", p.Seats, p.Problems)
	}
}

// leftovers-54 G1, Amendment 1 (FR-1a, FR-1b): the default plans only the
// seats a card named; a plan with no seat lists no thread, token or file,
// and Retire on it leaves cell.json as it was.
//
// Nothing here can reach a real probe, zellij, discuss-api, launchctl, git,
// ps or lsof, nor the real mailbox, even on a regression that retires a
// seat: probe is a stub, PATH holds only stubs, HOME and the discuss state
// dir are empty temp dirs, and the sessions come from sessionLister. Every
// stub logs its call, and any call fails the test, checked in a defer so a
// panic further down still reports it.
func TestRetireDefaultFollowsCardsAndAnEmptyPlanTouchesNothing(t *testing.T) {
	defer func(prev func(string) map[string]bool) { sessionLister = prev }(sessionLister)
	sessionLister = func(string) map[string]bool { return map[string]bool{"g1-probe-fse": true, "g1-probe-b1": true} }
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	bin, calls := t.TempDir(), filepath.Join(t.TempDir(), "calls.log")
	for _, name := range []string{"probe", "zellij", "discuss-api", "launchctl", "git", "ps", "lsof"} {
		os.WriteFile(filepath.Join(bin, name), []byte("#!/bin/sh\necho \"${0##*/} $*\" >> "+calls+"\n"), 0o755)
	}
	defer func(prev func() string) { probeBin = prev }(probeBin)
	probeBin = func() string { return filepath.Join(bin, "probe") }
	t.Setenv(probeBinEnv, filepath.Join(bin, "probe"))
	t.Setenv("HOME", t.TempDir())
	t.Setenv("DISCUSS_STATE_DIR", t.TempDir())
	defer func() {
		if b, err := os.ReadFile(calls); err == nil && len(b) > 0 {
			t.Errorf("reached a binary it must never run for real (a stub here):\n%s", b)
		}
	}()

	root := t.TempDir()
	os.MkdirAll(filepath.Join(root, "working-on", "done"), 0o755)
	os.MkdirAll(filepath.Join(root, "agents"), 0o755)
	os.WriteFile(filepath.Join(root, "working-on", "initiative.yaml"), []byte("id: g1\ntitle: G1\n"), 0o644)
	os.WriteFile(filepath.Join(root, "working-on", "done", "c1.md"), []byte("---\ntitle: C1\nstatus: done\nseat: b1\nupdated: 2026-10-25\nnext: none\n---\n"), 0o644)
	cellJSON := []byte(`{"project":"g1","workdir":"/w","agents":["fse","b1"],"human":"pablo","reconciler":""}`)
	os.WriteFile(filepath.Join(root, "agents", "cell.json"), cellJSON, 0o644)

	si := scan.ReadInitiative(root, scan.Options{})
	si.Agents = []model.Agent{{Persona: "b1", State: model.AgentRunning}}
	// From here on PATH holds only the stubs.
	t.Setenv("PATH", bin)
	cfg := config.Config{DiscussStateDir: t.TempDir(), Zellij: filepath.Join(bin, "zellij"), AgentBinary: "organizer-test-no-agent"}
	s := &Service{cfg: cfg, state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}}

	p, err := s.PlanRetire(RetireOptions{InitiativeID: si.ID})
	if err != nil {
		t.Fatal(err)
	}
	if !slices.Equal(p.Seats, []string{"b1"}) || !slices.Equal(p.Keep, []string{"fse"}) || !slices.Equal(p.Sessions, []string{"g1-probe-b1"}) {
		t.Errorf("default plans seats %v keep %v sessions %v, want b1 retired, fse kept, only b1's session", p.Seats, p.Keep, p.Sessions)
	}

	// Nothing chosen (the dialog with no box checked, or --keep b1): no seat,
	// so no thread, token, file or roster write, whatever the options say.
	empty := RetireOptions{InitiativeID: si.ID, Seats: []string{}, CloseThreads: true, RevokeTokens: true, CommitCell: true}
	p, err = s.PlanRetire(empty)
	if err != nil {
		t.Fatal(err)
	}
	if len(p.Seats) != 0 || len(p.Sessions) != 0 || len(p.Threads) != 0 || len(p.Tokens) != 0 || len(p.Files) != 0 || p.RestartAPI {
		t.Errorf("empty plan %+v, want no seat, session, thread, token or file", p)
	}
	if len(p.Problems) == 0 || p.Problems[len(p.Problems)-1] != "nothing to retire" {
		t.Errorf("problems %v, want nothing to retire last", p.Problems)
	}

	// Retire on it, every option on: one step, no call to any stub, and
	// cell.json byte for byte as it was.
	r, err := s.Retire(RetireOptions{InitiativeID: si.ID, Seats: []string{"fse"}, CloseThreads: true, RevokeTokens: true, CommitCell: true})
	if err != nil {
		t.Fatal(err)
	}
	if !slices.Equal(r.Steps, []string{"nothing to retire"}) || len(r.Errors) != 0 {
		t.Errorf("report %+v, want only nothing to retire", r)
	}
	if b, _ := os.ReadFile(filepath.Join(root, "agents", "cell.json")); string(b) != string(cellJSON) {
		t.Errorf("cell.json %s, want it untouched", b)
	}
}
