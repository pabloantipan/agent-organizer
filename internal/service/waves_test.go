package service

import (
	"testing"
	"time"

	"organizer/internal/model"
)

// gateBody is a card body in the template's shape, with n gate rows of which
// the first passed are ticked.
func gateBody(passed, total int) string {
	body := "## Goal\nsomething\n\n## Gate\n"
	for i := 0; i < total; i++ {
		if i < passed {
			body += "- [x] G" + string(rune('1'+i)) + ": met\n"
		} else {
			body += "- [ ] G" + string(rune('1'+i)) + ": see the spec\n"
		}
	}
	return body + "\n## Done\n- 2026-09-26 cut from the spec\n"
}

// waveFixture is G5's setup: three cards of wave 1 — one with an agent on it,
// one handed to a reviewer, one nobody has started — plus a card outside any
// wave, which must not reach a wave at all.
func waveFixture() []model.ScannedInitiative {
	return []model.ScannedInitiative{{
		Initiative: model.Initiative{ID: "init-a", Path: "/Users/p/init-a"},
		Cards: []model.Card{
			{Slug: "card-a", Title: "A", Status: model.StatusNext,
				Seat: "wave1-a", Body: gateBody(1, 2)},
			{Slug: "card-b", Title: "B", Status: model.StatusNext,
				Seat: "wave1-b", Next: "review: card-b, gate G1 met, abc1234",
				Body: gateBody(3, 3)},
			{Slug: "card-c", Title: "C", Status: model.StatusNext,
				Seat: "wave1-c", Body: gateBody(0, 0)},
			{Slug: "crew-and-context", Title: "Standing work", Status: model.StatusNow,
				Seat: "andrea", Body: gateBody(2, 2)},
		},
		Agents: []model.Agent{
			{Session: "wave1-a", State: model.AgentWorking, Uptime: "12:00",
				Persona: "wave1-a", Context: &model.ContextStatus{UsedPercent: 31, InputTokens: 12_000}},
		},
	}}
}

// TestWavesG5 is G5 of docs/specs/redesign.md: cards seated wave1-a (a joined
// agent), wave1-b (next: review: …) and wave1-c (nobody) make one wave with
// 1 building, 1 in review, 1 queued, the gate rows counted and tokens summed.
func TestWavesG5(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	inits := waveFixture()
	joinAgentCards(inits, nil, time.Date(2026, 9, 26, 12, 0, 0, 0, time.UTC))

	ws := waves(&inits[0])
	if len(ws) != 1 {
		t.Fatalf("waves = %d, want 1", len(ws))
	}
	w := ws[0]
	if w.N != 1 || w.Label != "wave 1" {
		t.Errorf("wave = %d %q, want 1 \"wave 1\"", w.N, w.Label)
	}
	if len(w.Building) != 1 || w.Building[0].Slug != "card-a" {
		t.Errorf("building = %v, want [card-a]", slugs(w.Building))
	}
	if len(w.InReview) != 1 || w.InReview[0].Slug != "card-b" {
		t.Errorf("in review = %v, want [card-b]", slugs(w.InReview))
	}
	if len(w.Queued) != 1 || w.Queued[0].Slug != "card-c" {
		t.Errorf("queued = %v, want [card-c]", slugs(w.Queued))
	}
	if len(w.Done) != 0 {
		t.Errorf("done = %v, want none", slugs(w.Done))
	}
	// 1 of 2 on card-a, 3 of 3 on card-b, card-c has a `## Gate` heading with
	// no rows; the card outside the wave is not counted.
	if w.GatePassed != 4 || w.GateTotal != 5 || !w.HasGate {
		t.Errorf("gate = %d/%d has=%v, want 4/5 has=true", w.GatePassed, w.GateTotal, w.HasGate)
	}
	if w.InputTokens != 12_000 {
		t.Errorf("tokens = %d, want 12000", w.InputTokens)
	}
	if w.Building[0].Agent == nil || w.Building[0].Agent.Slug != "card-a" {
		t.Errorf("card-a has no agent joined")
	}
	if w.Queued[0].Agent != nil {
		t.Errorf("card-c has an agent, want nobody on it")
	}
	if w.Supervisor != "" {
		t.Errorf("supervisor = %q, want none", w.Supervisor)
	}
}

func slugs(cs []WaveCard) []string {
	out := make([]string, len(cs))
	for i, c := range cs {
		out[i] = c.Slug
	}
	return out
}

// TestWaveGroups is the grouping rules the FR names and the precedence it
// leaves open: a done card is done whatever else is true of it, and a card in
// review stays in review even with a session still joined to it.
func TestWaveGroups(t *testing.T) {
	join := &model.CardJoin{Slug: "x", State: model.AgentWorking}
	tests := []struct {
		name string
		card model.Card
		join *model.CardJoin
		want string
	}{
		{"an agent joined is building", model.Card{Status: model.StatusNow}, join, WaveBuilding},
		{"nobody on it is queued", model.Card{Status: model.StatusNext}, nil, WaveQueued},
		{"next: review: is in review", model.Card{Status: model.StatusNow, Next: "review: x"}, nil, WaveInReview},
		{"in review beats a joined session", model.Card{Status: model.StatusNow, Next: "Review: x"}, join, WaveInReview},
		{"status done is done", model.Card{Status: model.StatusDone}, join, WaveDone},
		{"archived is done", model.Card{Status: model.StatusNow, Archived: true}, join, WaveDone},
		{"reviewing something else is not in review", model.Card{Next: "reviewer picks it up"}, nil, WaveQueued},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := waveGroup(tt.card, tt.join); got != tt.want {
				t.Errorf("group = %q, want %q", got, tt.want)
			}
		})
	}
}

// TestWaveOf: only `wave<N>-<name>` is a wave seat.
func TestWaveOf(t *testing.T) {
	tests := []struct {
		seat string
		want int
		ok   bool
	}{
		{"wave1-a", 1, true},
		{"wave2-rule-box", 2, true},
		{"Wave10-x", 10, true},
		{" wave1-waves ", 1, true},
		{"wave1", 0, false},
		{"wave1-", 0, false},
		{"andrea", 0, false},
		{"", 0, false},
		{"waveN-x", 0, false},
	}
	for _, tt := range tests {
		n, ok := waveOf(tt.seat)
		if n != tt.want || ok != tt.ok {
			t.Errorf("waveOf(%q) = %d %v, want %d %v", tt.seat, n, ok, tt.want, tt.ok)
		}
	}
}

// TestGateRows is A2: the checkboxes under `## Gate`, and a card without the
// heading, which shows "gate —" rather than 0 of 0.
func TestGateRows(t *testing.T) {
	tests := []struct {
		name          string
		body          string
		passed, total int
		has           bool
	}{
		{"two of three", "## Gate\n- [x] G1\n- [X] G2\n- [ ] G3\n", 2, 3, true},
		{"no heading is no count", "## Goal\n- [x] not a gate row\n", 0, 0, false},
		{"the section ends at the next heading",
			"## Gate\n- [x] G1\n\n## Done\n- [x] a done bullet\n", 1, 1, true},
		{"a heading with no rows still counts as a gate", "## Gate\n\n## Done\n", 0, 0, true},
		{"prose under the heading is not a row", "## Gate\nsee the spec\n", 0, 0, true},
		{"an empty body", "", 0, 0, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p, n, has := gateRows(tt.body)
			if p != tt.passed || n != tt.total || has != tt.has {
				t.Errorf("gateRows = %d/%d has=%v, want %d/%d has=%v",
					p, n, has, tt.passed, tt.total, tt.has)
			}
		})
	}
}

// TestSupervisorOf is A1: the live session <family>-probe-sup<N>, by the
// initiative's id or, with a cell, the cell's project.
func TestSupervisorOf(t *testing.T) {
	live := func(session string) model.Agent {
		return model.Agent{Session: session, State: model.AgentRunning}
	}
	si := model.ScannedInitiative{
		Initiative: model.Initiative{ID: "init-a"},
		Agents:     []model.Agent{live("init-a-probe-sup1")},
	}
	if got := supervisorOf(&si, 1); got != "init-a-probe-sup1" {
		t.Errorf("supervisor = %q, want init-a-probe-sup1", got)
	}
	if got := supervisorOf(&si, 2); got != "" {
		t.Errorf("wave 2 supervisor = %q, want none", got)
	}

	// A crew session is named after the cell, not the initiative.
	cell := model.ScannedInitiative{
		Initiative: model.Initiative{ID: "ccint-camp-monorepo"},
		Cell:       &model.Cell{Project: "camp"},
		Agents:     []model.Agent{live("camp-probe-sup1")},
	}
	if got := supervisorOf(&cell, 1); got != "camp-probe-sup1" {
		t.Errorf("cell supervisor = %q, want camp-probe-sup1", got)
	}

	// An exited layout is not a supervisor.
	dead := model.ScannedInitiative{
		Initiative: model.Initiative{ID: "init-a"},
		Agents:     []model.Agent{{Session: "init-a-probe-sup1", State: model.AgentExited}},
	}
	if got := supervisorOf(&dead, 1); got != "" {
		t.Errorf("supervisor = %q, want none for an exited session", got)
	}
}

// TestWavesNone: an initiative whose cards name no wave gets no wave strip.
func TestWavesNone(t *testing.T) {
	si := model.ScannedInitiative{
		Initiative: model.Initiative{ID: "init-a"},
		Cards: []model.Card{
			{Slug: "one", Status: model.StatusNow, Seat: "andrea"},
			{Slug: "two", Status: model.StatusNext},
		},
	}
	if ws := waves(&si); len(ws) != 0 {
		t.Errorf("waves = %d, want none", len(ws))
	}
}

// TestWavesSorted: several waves come out lowest first, and each card lands
// in its own wave with its own tokens.
func TestWavesSorted(t *testing.T) {
	si := model.ScannedInitiative{
		Initiative: model.Initiative{ID: "init-a"},
		Cards: []model.Card{
			{Slug: "later", Status: model.StatusNext, Seat: "wave2-x", Body: gateBody(0, 1)},
			{Slug: "first", Status: model.StatusNext, Seat: "wave1-y", Body: gateBody(1, 1)},
			{Slug: "also-first", Status: model.StatusDone, Seat: "wave1-z", Archived: true},
		},
		Agents: []model.Agent{
			{Session: "wave1-y", State: model.AgentWorking, Card: &model.CardJoin{
				Slug: "first", State: model.AgentWorking, InputTokens: 20_000}},
			{Session: "wave2-x", State: model.AgentRunning, Card: &model.CardJoin{
				Slug: "later", State: model.AgentRunning, InputTokens: 5_000}},
		},
	}
	ws := waves(&si)
	if len(ws) != 2 || ws[0].N != 1 || ws[1].N != 2 {
		t.Fatalf("waves = %v, want 1 then 2", ws)
	}
	if ws[0].InputTokens != 20_000 || ws[1].InputTokens != 5_000 {
		t.Errorf("tokens = %d, %d, want 20000, 5000", ws[0].InputTokens, ws[1].InputTokens)
	}
	if len(ws[0].Building) != 1 || len(ws[0].Done) != 1 {
		t.Errorf("wave 1 = %d building %d done, want 1 and 1", len(ws[0].Building), len(ws[0].Done))
	}
	if ws[0].GatePassed != 1 || ws[0].GateTotal != 1 {
		t.Errorf("wave 1 gate = %d/%d, want 1/1", ws[0].GatePassed, ws[0].GateTotal)
	}
	if ws[1].HasGate != true || ws[1].GatePassed != 0 || ws[1].GateTotal != 1 {
		t.Errorf("wave 2 gate = %d/%d has=%v, want 0/1 has=true",
			ws[1].GatePassed, ws[1].GateTotal, ws[1].HasGate)
	}
}

// TestWaveJoinsPrefersWorking: two sessions on one card show the working one
// and its tokens are counted once.
func TestWaveJoinsPrefersWorking(t *testing.T) {
	agents := []model.Agent{
		{Card: &model.CardJoin{Slug: "card-a", State: model.AgentRunning, InputTokens: 1_000}},
		{Card: &model.CardJoin{Slug: "card-a", State: model.AgentWorking, InputTokens: 9_000}},
		{Card: nil},
	}
	joins := waveJoins(agents)
	if len(joins) != 1 || joins["card-a"].InputTokens != 9_000 {
		t.Fatalf("joins = %v, want one working join of 9000", joins)
	}
	si := model.ScannedInitiative{
		Initiative: model.Initiative{ID: "init-a"},
		Cards:      []model.Card{{Slug: "card-a", Status: model.StatusNow, Seat: "wave1-a"}},
		Agents:     agents,
	}
	if ws := waves(&si); len(ws) != 1 || ws[0].InputTokens != 9_000 {
		t.Errorf("wave tokens = %v, want 9000 counted once", ws)
	}
}
