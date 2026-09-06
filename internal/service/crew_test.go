package service

import (
	"strings"
	"testing"

	"organizer/internal/discuss"
	"organizer/internal/model"
)

func TestBuildCrewJoinsRosterProcessesAndHealth(t *testing.T) {
	si := &model.ScannedInitiative{}
	si.ID = "camp-mono"
	si.Cell = &model.Cell{Project: "camp", Agents: []string{"po_andrea", "tech_lead_nicolas", "designer_javiera"}, Human: "pablo"}
	si.Agents = []model.Agent{
		{Name: "x", Session: "camp-mono-probe-po-andrea", State: model.AgentExited},
		{Name: "y", Session: "camp-mono-probe-po-andrea", Persona: "po_andrea", Cell: "camp", State: model.AgentWorking, PID: 4},
		{Name: "z", Session: "camp-mono-probe-tech-lead-nicolas", State: model.AgentShell},
		{Name: "other", Session: "camp-mono-probe-builder", State: model.AgentRunning, PID: 5},
	}
	snap := discuss.Snapshot{Agents: map[string]discuss.AgentHealth{
		"po_andrea":         {Agent: "po_andrea", Watcher: "alive"},
		"tech_lead_nicolas": {Agent: "tech_lead_nicolas", Watcher: "never", Deaf: true, Undelivered: 3},
	}}
	crew := buildCrew(si, snap)
	if len(crew) != 3 {
		t.Fatalf("seats %d", len(crew))
	}
	if crew[0].Agent == nil || crew[0].Agent.PID != 4 || crew[0].Watcher != "alive" {
		t.Errorf("po_andrea should map to the live process: %+v", crew[0])
	}
	if crew[1].Agent == nil || crew[1].Agent.State != model.AgentShell || !crew[1].Deaf || crew[1].Undelivered != 3 {
		t.Errorf("nico should map by session name and carry health: %+v", crew[1])
	}
	if crew[2].Agent != nil || crew[2].Watcher != "" {
		t.Errorf("javiera has nothing: %+v", crew[2])
	}
	if si.Agents[1].Watcher != "alive" || !si.Agents[2].Deaf || si.Agents[3].Watcher != "" {
		t.Error("health should be stamped only onto the matching agent rows")
	}
	if crewSession("Camp Mono", "po_andrea") != "camp-mono-probe-po-andrea" {
		t.Error("crewSession")
	}
	if buildCrew(&model.ScannedInitiative{}, discuss.Snapshot{}) != nil {
		t.Error("no cell, no crew")
	}
}

// The join this whole view exists for: a card names a thread, the thread has
// no decision, and a seat in it cannot be woken. Nothing else on the machine
// puts those three facts on one screen.
func TestCardsWaitingFindsWorkHeldUpByAnUnansweredThread(t *testing.T) {
	const tid = "01M1N893SRYKX2F6H6G9WCCCMA"
	si := &model.ScannedInitiative{}
	si.Cell = &model.Cell{Project: "camp", Agents: []string{"po_andrea", "chino"}}
	si.Cards = []model.Card{
		{Slug: "readiness-endpoint", Title: "Readiness endpoint", Status: "next", Threads: []string{tid}},
		{Slug: "decided", Title: "Already decided", Status: "now", Threads: []string{"01M1N8ECN7JW4349MBF8B93VSR"}},
		{Slug: "gone", Title: "Names a closed thread", Status: "now", Threads: []string{"01ZZZZZZZZZZZZZZZZZZZZZZZZ"}},
		{Slug: "plain", Title: "No thread", Status: "now"},
		{Slug: "old", Title: "Finished", Status: "done", Threads: []string{tid}},
	}
	snap := discuss.Snapshot{
		Agents: map[string]discuss.AgentHealth{
			"po_andrea": {Agent: "po_andrea", Watcher: "alive"},
			"chino":     {Agent: "chino", Watcher: "never"},
		},
		Threads: []discuss.Thread{
			{ID: tid, Subject: "A-06", Status: "open", Messages: 2, SinceDecision: 2,
				Participants: []string{"po_andrea", "chino"}},
			{ID: "01M1N8ECN7JW4349MBF8B93VSR", Subject: "N-01", Status: "open", Messages: 1,
				SinceDecision: 0, Participants: []string{"po_andrea"}},
		},
	}

	got := cardsWaiting(si, snap)
	if len(got) != 1 {
		t.Fatalf("waiting %d, want only the undecided thread: %+v", len(got), got)
	}
	w := got[0]
	if w.Slug != "readiness-endpoint" || w.Thread.Subject != "A-06" || w.Thread.SinceDecision != 2 {
		t.Errorf("wait=%+v want readiness-endpoint on A-06", w)
	}
	if len(w.Thread.BlockedOn) != 1 || w.Thread.BlockedOn[0].Seat != "chino" ||
		w.Thread.BlockedOn[0].Reason != "never started" {
		t.Errorf("blocked_on=%+v want chino never started", w.Thread.BlockedOn)
	}

	// A card naming a thread the cell no longer lists is waiting on nothing.
	ts := threadStates([]string{"01ZZZZZZZZZZZZZZZZZZZZZZZZ"}, snap)
	if len(ts) != 1 || !ts[0].Missing {
		t.Errorf("thread_state=%+v want missing", ts)
	}
}

func TestPreludeSetsIdentityAndModel(t *testing.T) {
	cell := model.Cell{Project: "camp"}
	got := preludeFor("/x/discuss-api", cell, "po_andrea", "opus")
	for _, want := range []string{"export $('/x/discuss-api' token env 'camp' 'po_andrea' | sed 's/ claude$//')", "export ANTHROPIC_MODEL='opus'", "'/x/discuss-hook' watch --external --parent $$ >/dev/null 2>&1 &"} {
		if !strings.Contains(got, want) {
			t.Errorf("missing %q in %q", want, got)
		}
	}
	cell.Model = "claude-opus-5"
	if !strings.Contains(preludeFor("/x/discuss-api", cell, "po_andrea", "opus"), "ANTHROPIC_MODEL='claude-opus-5'") {
		t.Error("cell model should override the config")
	}
	if !strings.Contains(preludeFor("/x/discuss-api", model.Cell{}, "s", ""), "ANTHROPIC_MODEL='opus'") {
		t.Error("empty everything falls back to opus")
	}
}
