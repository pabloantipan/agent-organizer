package service

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/discuss"
	"organizer/internal/model"
	"organizer/internal/session"
)

func TestCrewSessionNamesTheCellAndTheSeat(t *testing.T) {
	camp := &model.Cell{Project: "camp"}
	tests := []struct {
		name string
		cell *model.Cell
		seat string
		want string
		err  string // a substring the error must carry
	}{
		{name: "role prefix drops", cell: camp, seat: "po_andrea", want: "camp-probe-andrea"},
		{name: "a role with underscores drops too", cell: camp, seat: "tech_lead_nicolas", want: "camp-probe-nicolas"},
		{name: "the longest real seat still fits", cell: camp, seat: "fullstack_dev_francisco", want: "camp-probe-francisco"},
		{name: "a seat with no role is its own name", cell: camp, seat: "reviewer", want: "camp-probe-reviewer"},
		{name: "project and seat are sanitized", cell: &model.Cell{Project: "Camp Mono"}, seat: "po_Andrea", want: "camp-mono-probe-andrea"},
		{name: "a long project fits under /tmp's budget", cell: &model.Cell{Project: "ccint-camp-monorepo"}, seat: "po_andrea",
			want: "ccint-camp-monorepo-probe-andrea"},
		{name: "the card's 40-character name fits", cell: &model.Cell{Project: "organizer"}, seat: "w_abcdefghijklmnopqrstuvwx",
			want: "organizer-probe-abcdefghijklmnopqrstuvwx"},
		{name: "over the budget is an error naming the length", cell: &model.Cell{Project: "ccint-camp-monorepo-and-a-project-name-no-socket-dir-can-hold"}, seat: "po_andrea",
			err: "is 74 characters; zellij holds at most 68"},
		{name: "and never a truncation", cell: &model.Cell{Project: "ccint-camp-monorepo-and-a-project-name-no-socket-dir-can-hold"}, seat: "po_andrea",
			err: "ccint-camp-monorepo-and-a-project-name-no-socket-dir-can-hold-probe-andrea"},
		{name: "a seat that is only a role has no name", cell: camp, seat: "po_", err: "cannot name a session"},
		{name: "no cell, no session", seat: "po_andrea", err: "no cell"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := crewSession(tt.cell, tt.seat)
			if tt.err != "" {
				if err == nil {
					t.Fatalf("crewSession(%q) = %q, want an error", tt.seat, got)
				}
				if !strings.Contains(err.Error(), tt.err) {
					t.Errorf("error %q does not carry %q", err, tt.err)
				}
				if got != "" {
					t.Errorf("a refused name must be empty, not %q", got)
				}
				return
			}
			if err != nil {
				t.Fatalf("crewSession(%q): %v", tt.seat, err)
			}
			if got != tt.want {
				t.Errorf("crewSession(%q) = %q, want %q", tt.seat, got, tt.want)
			}
			if len(got) > maxSessionName {
				t.Errorf("%q is %d characters, over the budget of %d", got, len(got), maxSessionName)
			}
		})
	}
}

// The ceiling is derived, not typed: 103 usable bytes of a macOS socket path
// minus probe's socket dir for uid 501, which zellij 0.44.3 was measured at.
func TestMaxSessionNameIsProbesSocketBudget(t *testing.T) {
	if maxSessionName != 68 {
		t.Errorf("maxSessionName = %d, want 68 (103 - len(\"/tmp/zellij-501/contract_version_1/\"))", maxSessionName)
	}
}

func TestBuildCrewJoinsRosterProcessesAndHealth(t *testing.T) {
	si := &model.ScannedInitiative{}
	si.ID = "ccint-camp-monorepo"
	si.Cell = &model.Cell{Project: "camp", Agents: []string{"po_andrea", "tech_lead_nicolas", "designer_javiera"}, Human: "pablo"}
	si.Agents = []model.Agent{
		{Name: "x", Session: "camp-probe-andrea", State: model.AgentExited},
		{Name: "y", Session: "camp-probe-andrea", Persona: "po_andrea", Cell: "camp", State: model.AgentWorking, PID: 4},
		{Name: "z", Session: "camp-probe-nicolas", State: model.AgentShell},
		{Name: "other", Session: "camp-probe-builder", State: model.AgentRunning, PID: 5},
	}
	snap := discuss.Snapshot{Agents: map[string]discuss.AgentHealth{
		"po_andrea":         {Agent: "po_andrea", Watcher: "alive"},
		"tech_lead_nicolas": {Agent: "tech_lead_nicolas", Watcher: "never", Deaf: true, Undelivered: 3},
	}}
	crew := buildCrew(si, snap)
	if len(crew) != 3 {
		t.Fatalf("seats %d", len(crew))
	}
	if crew[0].Session != "camp-probe-andrea" || crew[2].Session != "camp-probe-javiera" {
		t.Errorf("seats are named after the cell: %q %q", crew[0].Session, crew[2].Session)
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
	if buildCrew(&model.ScannedInitiative{}, discuss.Snapshot{}) != nil {
		t.Error("no cell, no crew")
	}

	// A seat whose name zellij cannot hold joins by persona and by nothing
	// else: an empty session must never match a process without one.
	long := &model.ScannedInitiative{}
	long.Cell = &model.Cell{Project: "ccint-camp-monorepo-and-a-project-name-no-socket-dir-can-hold", Agents: []string{"po_andrea"}}
	long.Agents = []model.Agent{{Name: "stray", Session: "", State: model.AgentShell}}
	seats := buildCrew(long, discuss.Snapshot{})
	if len(seats) != 1 || seats[0].Session != "" || seats[0].Agent != nil {
		t.Errorf("unnameable seat should join nothing: %+v", seats)
	}
}

// G4 (FR-6): health reaches every live agent discuss knows by name, not only
// roster seats: a seat by persona, a supervisor and a builder by their
// session's short name, capped included. A persona outside the roster keeps
// its row and its health.
func TestHealthIsStampedOnEveryAgentWithAName(t *testing.T) {
	si := &model.ScannedInitiative{}
	si.Cell = &model.Cell{Project: "organizer", Agents: []string{"fse", "po_ana"}, Human: "pablo"}
	si.Agents = []model.Agent{
		{Name: "seat", Session: "organizer-probe-ana", Short: "ana", Persona: "po_ana", State: model.AgentRunning, PID: 11},
		{Name: "sup", Session: "organizer-probe-sup10", Short: "sup10", State: model.AgentWorking, PID: 12},
		{Name: "builder", Session: "organizer-probe-stage3-agents", Short: "stage3-agents", Persona: "stage3-agents", State: model.AgentRunning, PID: 13},
		{Name: "stranger", Session: "organizer-probe-guest", Short: "guest", Persona: "guest_reviewer", State: model.AgentRunning, PID: 14},
		{Name: "plain", Session: "organizer-probe-otter", Short: "otter", State: model.AgentRunning, PID: 15},
	}
	snap := discuss.Snapshot{Agents: map[string]discuss.AgentHealth{
		"po_ana": {Agent: "po_ana", Watcher: "alive"},
		"sup10":  {Agent: "sup10", Watcher: "stale", Undelivered: 1},
		// capped: deaf, and a drain ran after the oldest message arrived.
		"stage3-agents":  {Agent: "stage3-agents", Watcher: "alive", Deaf: true, Undelivered: 2, SecondsSinceDrain: 30, OldestUndeliveredS: 900},
		"guest_reviewer": {Agent: "guest_reviewer", Watcher: "alive", Deaf: true, Undelivered: 4, SecondsSinceDrain: 1200, OldestUndeliveredS: 900},
	}}
	crew := buildCrew(si, snap)
	type want struct {
		watcher            string
		deaf, capped, noID bool
		undelivered        int
	}
	for i, w := range []want{
		{watcher: "alive"},
		{watcher: "stale", undelivered: 1},
		{watcher: "alive", deaf: true, capped: true, undelivered: 2},
		{watcher: "alive", deaf: true, undelivered: 4},
		{},
	} {
		a := si.Agents[i]
		if a.Watcher != w.watcher || a.Deaf != w.deaf || a.Capped != w.capped || a.NoIdentity != w.noID || a.Undelivered != w.undelivered {
			t.Errorf("%s: watcher=%q deaf=%v capped=%v no_identity=%v undelivered=%d, want %+v",
				a.Name, a.Watcher, a.Deaf, a.Capped, a.NoIdentity, a.Undelivered, w)
		}
	}
	if len(crew) != 2 || crew[1].Agent == nil || crew[1].Agent.Watcher != "alive" {
		t.Errorf("the roster seat's copy of its agent carries the health: %+v", crew)
	}
	// Stamped state is recomputed: a name discuss no longer has loses it.
	stampHealth(si, discuss.Snapshot{})
	if si.Agents[2].Capped || si.Agents[1].Watcher != "" {
		t.Errorf("a second sample without health must clear it: %+v %+v", si.Agents[1], si.Agents[2])
	}
}

// G5 (FR-7): sup9 has never polled and has mail, and a live session named
// <family>-probe-sup9 runs with no AGENT_NAME: that session is sup9 without
// its identity. With AGENT_NAME=sup9 it is not, and neither is a session with
// no process, nor one whose mailbox has nothing waiting.
func TestNoIdentityIsASessionUnderASeatsNameWithoutItsIdentity(t *testing.T) {
	cases := []struct {
		name  string
		agent model.Agent
		h     discuss.AgentHealth
		want  bool
	}{
		{"no AGENT_NAME", model.Agent{Session: "organizer-fixture-probe-sup9", Short: "sup9", PID: 21, State: model.AgentRunning},
			discuss.AgentHealth{Agent: "sup9", Watcher: "never", Undelivered: 3}, true},
		{"AGENT_NAME=sup9", model.Agent{Session: "organizer-fixture-probe-sup9", Short: "sup9", Persona: "sup9", PID: 21, State: model.AgentRunning},
			discuss.AgentHealth{Agent: "sup9", Watcher: "never", Undelivered: 3}, false},
		{"no process", model.Agent{Session: "organizer-fixture-probe-sup9", Short: "sup9", State: model.AgentShell},
			discuss.AgentHealth{Agent: "sup9", Watcher: "never", Undelivered: 3}, false},
		{"nothing waiting", model.Agent{Session: "organizer-fixture-probe-sup9", Short: "sup9", PID: 21, State: model.AgentRunning},
			discuss.AgentHealth{Agent: "sup9", Watcher: "never"}, false},
		{"watcher alive", model.Agent{Session: "organizer-fixture-probe-sup9", Short: "sup9", PID: 21, State: model.AgentRunning},
			discuss.AgentHealth{Agent: "sup9", Watcher: "alive", Undelivered: 3}, false},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			si := &model.ScannedInitiative{}
			si.Cell = &model.Cell{Project: "organizer-fixture", Agents: []string{"fse"}}
			si.Agents = []model.Agent{c.agent}
			buildCrew(si, discuss.Snapshot{Agents: map[string]discuss.AgentHealth{"sup9": c.h}})
			a := si.Agents[0]
			if a.NoIdentity != c.want {
				t.Errorf("no_identity=%v, want %v (%+v)", a.NoIdentity, c.want, a)
			}
			if a.Watcher != c.h.Watcher || a.Undelivered != c.h.Undelivered {
				t.Errorf("the health still shows: %+v", a)
			}
		})
	}
}

// A3: the canned source is the endpoint's shape per project, read in place of
// discuss only when canned_health is set.
func TestCannedHealthReadsOneProject(t *testing.T) {
	p := filepath.Join(t.TempDir(), "health.json")
	if err := os.WriteFile(p, []byte(`{"camp":{"agents":[{"agent":"sup9","watcher":"never","undelivered":3}],"threads":[]}}`), 0o600); err != nil {
		t.Fatal(err)
	}
	snap, why := cannedHealth(p, "camp")
	if why != "" || snap.Agents["sup9"].Undelivered != 3 || snap.Agents["sup9"].Watcher != "never" {
		t.Errorf("snap=%+v why=%q", snap, why)
	}
	if _, why := cannedHealth(p, "other"); !strings.Contains(why, `no project "other"`) {
		t.Errorf("a project the file lacks says so: %q", why)
	}
	if _, why := cannedHealth(filepath.Join(t.TempDir(), "gone.json"), "camp"); !strings.Contains(why, "canned health") {
		t.Errorf("a missing file says so: %q", why)
	}
	s := &Service{cfg: config.Config{CannedHealth: p}}
	if snap, why := s.cellHealth(&model.Cell{Project: "camp"}); why != "" || len(snap.Agents) != 1 {
		t.Errorf("canned_health set: cellHealth reads the file, got %+v %q", snap, why)
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
	got := preludeFor("/x/discuss-api", cell, "po_andrea", "camp-probe-andrea", "opus")
	for _, want := range []string{"export $('/x/discuss-api' token env 'camp' 'po_andrea' | sed 's/ claude$//')", "export AGENT_SESSION='camp-probe-andrea'", "export ANTHROPIC_MODEL='opus'", "'/x/discuss-hook' watch --external --parent $$ >/dev/null 2>&1 &"} {
		if !strings.Contains(got, want) {
			t.Errorf("missing %q in %q", want, got)
		}
	}
	cell.Model = "claude-opus-5"
	if !strings.Contains(preludeFor("/x/discuss-api", cell, "po_andrea", "camp-probe-andrea", "opus"), "ANTHROPIC_MODEL='claude-opus-5'") {
		t.Error("cell model should override the config")
	}
	if !strings.Contains(preludeFor("/x/discuss-api", model.Cell{}, "s", "x-probe-s", ""), "ANTHROPIC_MODEL='opus'") {
		t.Error("empty everything falls back to opus")
	}
}

// Gate 2, as far as a test can go without opening a pane: what CreateCrew
// hands probe — the wrapper of the cell's project and the seat's short name —
// is the session crewSession promises, and the prelude that pane sources
// exports AGENT_SESSION with that same name.
func TestCrewLaunchOpensTheSessionCrewSessionNames(t *testing.T) {
	cell := model.Cell{Project: "camp", Agents: []string{"po_andrea", "tech_lead_nicolas", "fullstack_dev_francisco"}}
	family := sanitize(cell.Project)
	wrapper := filepath.Join("/h/bin", family+"-probe")
	for _, seat := range cell.Agents {
		sess, err := crewSession(&cell, seat)
		if err != nil {
			t.Fatalf("%s: %v", seat, err)
		}
		short := sanitize(seatShort(seat))
		// probe prepends its family to the name it is given.
		if opened := family + "-probe-" + short; opened != sess {
			t.Errorf("probe would open %q, crewSession says %q", opened, sess)
		}
		line := launchLine("/p/"+seat+".sh", "/p/"+seat+".md", wrapper, short, "/h/root")
		if !strings.Contains(line, "'"+wrapper+"' '"+short+"'") {
			t.Errorf("launch line %q does not run %s with %q", line, wrapper, short)
		}
		if !strings.Contains(preludeFor("/x/discuss-api", cell, seat, sess, "opus"), "export AGENT_SESSION='"+sess+"'") {
			t.Errorf("the prelude of %s does not export AGENT_SESSION=%s", seat, sess)
		}
	}
}

// G1 (discovery-in-a-cell, FR-1): a cell whose seats have no session and no
// run is in definition (0030); one seat live, one seat with a past run (by
// persona or by crew session), or an exited layout, and it is not. The
// state rides the cell the board carries.
func TestCellInDefinitionUntilASeatHasRun(t *testing.T) {
	defer func(f func() []session.Run) { loadRuns = f }(loadRuns)
	cellOf := func() *model.ScannedInitiative {
		si := &model.ScannedInitiative{}
		si.Cell = &model.Cell{Project: "fixture-define", Agents: []string{"po_carla", "dev_diego"}, Human: "pablo"}
		return si
	}
	tests := []struct {
		name   string
		agents []model.Agent
		runs   []session.Run
		want   string
	}{
		{name: "no sessions, no runs", want: model.CellInDefinition},
		{name: "runs of other cells only", runs: []session.Run{
			{PID: 1, SessionID: "a", Persona: "po_carla", Cell: "camp"},
			{PID: 2, SessionID: "b", Session: "camp-probe-diego"},
		}, want: model.CellInDefinition},
		{name: "one seat live", agents: []model.Agent{
			{Name: "p", Persona: "po_carla", Cell: "fixture-define", State: model.AgentRunning, PID: 7},
		}, want: model.CellActive},
		{name: "one seat's layout exited", agents: []model.Agent{
			{Name: "l", Session: "fixture-define-probe-diego", State: model.AgentExited},
		}, want: model.CellActive},
		{name: "one seat with a past run by persona", runs: []session.Run{
			{PID: 3, SessionID: "c", Persona: "dev_diego", Cell: "fixture-define", Ended: true},
		}, want: model.CellActive},
		{name: "one seat with a past run by session", runs: []session.Run{
			{PID: 4, SessionID: "d", Session: "fixture-define-probe-carla", Ended: true},
		}, want: model.CellActive},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			runs := tt.runs
			loadRuns = func() []session.Run { return runs }
			si := cellOf()
			si.Agents = tt.agents
			got := crewCell(si.Cell, si.Decisions, buildCrew(si, discuss.Snapshot{}))
			if got.State != tt.want {
				t.Errorf("state %q, want %q", got.State, tt.want)
			}
			if si.Cell.State != "" || got == si.Cell {
				t.Errorf("the scanned cell must stay as read: %q", si.Cell.State)
			}
		})
	}

	t.Run("no seats is no state", func(t *testing.T) {
		loadRuns = func() []session.Run { return nil }
		si := &model.ScannedInitiative{}
		si.Cell = &model.Cell{Project: "between-waves"}
		if got := crewCell(si.Cell, si.Decisions, buildCrew(si, discuss.Snapshot{})); got.State != "" {
			t.Errorf("an empty roster is between waves, not in definition: %q", got.State)
		}
		if crewCell(nil, nil, nil) != nil {
			t.Error("no cell, no copy")
		}
	})

	t.Run("the archive is read from runs.jsonl", func(t *testing.T) {
		loadRuns = func() []session.Run { return session.LoadRuns(session.RunsPath()) }
		t.Setenv("XDG_DATA_HOME", t.TempDir())
		si := cellOf()
		if got := crewCell(si.Cell, si.Decisions, buildCrew(si, discuss.Snapshot{})); got.State != model.CellInDefinition {
			t.Fatalf("no runs.jsonl: state %q", got.State)
		}
		if err := os.MkdirAll(filepath.Dir(session.RunsPath()), 0o755); err != nil {
			t.Fatal(err)
		}
		line := `{"pid":9,"session_id":"e","session":"fixture-define-probe-diego","persona":"dev_diego","cell":"fixture-define","ended":true}` + "\n"
		if err := os.WriteFile(session.RunsPath(), []byte(line), 0o644); err != nil {
			t.Fatal(err)
		}
		if got := crewCell(si.Cell, si.Decisions, buildCrew(si, discuss.Snapshot{})); got.State != model.CellActive {
			t.Errorf("a run in runs.jsonl: state %q", got.State)
		}
	})
}

// Review finding (b): the state reaches both views on a copy, and the cached
// cell, which state.json and the sync payload carry, is never written. Run
// with -race: Service.Cell reads the cell outside the lock while the agents
// view is built under it.
func TestCellStateRidesACopyNotTheCache(t *testing.T) {
	defer func(f func() []session.Run) { loadRuns = f }(loadRuns)
	loadRuns = func() []session.Run { return nil }
	si := model.ScannedInitiative{}
	si.ID = "init-define"
	si.Cell = &model.Cell{Project: "define-fixture", Agents: []string{"po_carla", "dev_diego"}, Human: "pablo"}
	s := &Service{
		cfg:   config.Config{CannedHealth: filepath.Join(t.TempDir(), "none.json"), DiscussStateDir: t.TempDir()},
		state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}},
		now:   time.Now,
	}
	done := make(chan CellView)
	go func() {
		v, err := s.Cell("init-define")
		if err != nil {
			t.Error(err)
		}
		done <- v
	}()
	s.mu.Lock()
	av := s.agentsViewLocked()
	s.mu.Unlock()
	cv := <-done

	if len(av.Groups) != 1 || av.Groups[0].Cell.State != model.CellInDefinition {
		t.Fatalf("the agents view should carry in definition: %+v", av.Groups)
	}
	if cv.Cell == nil || cv.Cell.State != model.CellInDefinition {
		t.Fatalf("the cell view should carry in definition: %+v", cv.Cell)
	}
	cached := s.state.Local.Initiatives[0].Cell
	if cached.State != "" || av.Groups[0].Cell == cached || cv.Cell == cached {
		t.Errorf("the cached cell must stay as read, got state %q", cached.State)
	}
	b, err := json.Marshal(s.state)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(b), `"state"`) {
		t.Error("state.json would carry the derived state")
	}
}

// G2 (discovery-in-a-cell, FR-2): a seat without agents/<seat>.md refuses
// the whole crew before anything is created, naming every missing file, and
// its Crew row carries the mark.
func TestCreateCrewRefusesASeatWithoutItsPersonaFile(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, "agents"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(root, "agents", "po_carla.md"), []byte("# po_carla\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	// A directory under the seat's name is not its persona file.
	if err := os.MkdirAll(filepath.Join(root, "agents", "tech_lead_elena.md"), 0o755); err != nil {
		t.Fatal(err)
	}
	si := model.ScannedInitiative{}
	si.ID, si.Path = "init-define", root
	si.Cell = &model.Cell{Project: "define-fixture", Agents: []string{"po_carla", "designer_diego", "tech_lead_elena"}, Human: "pablo"}
	s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}, now: time.Now}

	cmds, err := s.CreateCrew("init-define", false)
	if err == nil {
		t.Fatalf("CreateCrew launched %v with two persona files missing", cmds)
	}
	for _, seat := range []string{"designer_diego", "tech_lead_elena"} {
		if want := filepath.Join(root, "agents", seat+".md"); !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal does not name %s:\n%v", want, err)
		}
	}
	if strings.Contains(err.Error(), "po_carla.md") {
		t.Errorf("the refusal names a file that exists:\n%v", err)
	}
	if !strings.Contains(err.Error(), "2 of 3 seats have no persona file") {
		t.Errorf("the refusal does not count the seats:\n%v", err)
	}
	if _, statErr := os.Stat(crewDir("init-define")); !os.IsNotExist(statErr) {
		t.Errorf("a refused crew created %s", crewDir("init-define"))
	}

	marks := map[string]bool{}
	for _, seat := range buildCrew(&si, discuss.Snapshot{}) {
		marks[seat.Name] = seat.NoPersona
	}
	want := map[string]bool{"po_carla": false, "designer_diego": true, "tech_lead_elena": true}
	for seat, w := range want {
		if marks[seat] != w {
			t.Errorf("%s: no_persona %v, want %v", seat, marks[seat], w)
		}
	}

	for _, seat := range []string{"designer_diego", "tech_lead_elena"} {
		p := filepath.Join(root, "agents", seat+".md")
		_ = os.Remove(p)
		if err := os.WriteFile(p, []byte("# "+seat+"\n"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	if err := missingPersonas(root, si.Cell); err != nil {
		t.Errorf("every file written, still refused: %v", err)
	}
}
