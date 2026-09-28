package service

import (
	"path/filepath"
	"testing"
	"time"

	"organizer/internal/model"
)

const joinRoot = "/Users/p/organizer"

// joinFixture is one initiative root with the card shapes the join has to
// tell apart: a card with a worktree and a branch, a card with only a seat, a
// card with neither, and an archived done card that is not open.
func joinFixture() []model.ScannedInitiative {
	return []model.ScannedInitiative{{
		Initiative: model.Initiative{ID: "organizer", Path: joinRoot},
		Cards: []model.Card{
			{Slug: "redesign-agent-card", Title: "Each live agent is joined to the card it works",
				Status: model.StatusNext, Branch: "redesign-agent-card", Seat: "wave1-agentcard"},
			{Slug: "redesign-work", Title: "Board becomes Work",
				Status: model.StatusNow, Branch: "wave/work", Seat: "wave1-work"},
			{Slug: "crew-and-context", Title: "Resume the camp cell",
				Status: model.StatusNow, Seat: "andrea"},
			{Slug: "second-machine", Title: "Roll out to the second Mac", Status: model.StatusNow},
			{Slug: "longer-session-names", Title: "Session names up to 68",
				Status: model.StatusDone, Branch: "longer-session-names", Archived: true},
		},
	}}
}

// branchOfFixture is the scan's answer for the fixture: the worktree is on the
// card's branch, everything else is on main, which no card claims.
func branchOfFixture(cwd string) string {
	if cwd == filepath.Join(joinRoot, ".wt", "redesign-agent-card") {
		return "redesign-agent-card"
	}
	return "main"
}

func TestJoinAgent(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	cards := openCards(joinFixture())
	now := time.Date(2026, 9, 26, 12, 0, 0, 0, time.UTC)

	tests := []struct {
		name  string
		agent model.Agent
		want  string // the card slug, "" for no card
	}{
		{
			name: "key 1: a worktree path element names the card",
			agent: model.Agent{State: model.AgentWorking, Uptime: "38:12",
				Dir: filepath.Join(joinRoot, ".wt", "redesign-agent-card")},
			want: "redesign-agent-card",
		},
		{
			name: "key 3: the seat names the card when the place does not",
			agent: model.Agent{State: model.AgentWorking, Uptime: "09:00",
				Dir: filepath.Join(joinRoot, "organizer"), Persona: "andrea"},
			want: "crew-and-context",
		},
		{
			name: "key 3: the seat names the card for a session with no directory",
			agent: model.Agent{State: model.AgentWorking, Uptime: "09:00",
				Session: "wave1-work"},
			want: "redesign-work",
		},
		{
			name:  "a branch no card claims is no card",
			agent: model.Agent{State: model.AgentRunning, Uptime: "01:02:00", Dir: joinRoot},
			want:  "",
		},
		{
			name: "a directory outside every initiative root is no card",
			agent: model.Agent{State: model.AgentWorking, Uptime: "09:00",
				Dir: "/Users/p/elsewhere"},
			want: "",
		},
		{
			name: "an exited session works no card",
			agent: model.Agent{State: model.AgentExited, Session: "wave1-work",
				Dir: filepath.Join(joinRoot, ".wt", "redesign-agent-card")},
			want: "",
		},
		{
			name: "a shell works no card",
			agent: model.Agent{State: model.AgentShell,
				Dir: filepath.Join(joinRoot, ".wt", "redesign-agent-card")},
			want: "",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := joinAgent(tt.agent, cards, branchOfFixture, now)
			switch {
			case tt.want == "":
				if got != nil {
					t.Fatalf("joined to %q, want no card", got.Slug)
				}
			case got == nil:
				t.Fatalf("no card, want %q", tt.want)
			case got.Slug != tt.want:
				t.Fatalf("joined to %q, want %q", got.Slug, tt.want)
			}
		})
	}
}

// Key 2: the checkout's branch, which is the key MatchCard needs a branch for
// — a slash in the branch is never a path element, so the path key cannot see
// it.
func TestJoinAgentByBranch(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	cards := openCards(joinFixture())
	a := model.Agent{State: model.AgentWorking, Uptime: "12:00", Dir: filepath.Join(joinRoot, "organizer")}

	got := joinAgent(a, cards, func(string) string { return "wave/work" }, time.Now())
	if got == nil || got.Slug != "redesign-work" {
		t.Fatalf("joined to %v, want redesign-work by branch", got)
	}
	if got := joinAgent(a, cards, nil, time.Now()); got != nil {
		t.Fatalf("joined to %q with no branch known, want no card", got.Slug)
	}
}

// FR-7: two cards answering to one agent is no card, at either kind of key.
func TestJoinAgentTwoCardsAnswer(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	inits := joinFixture()
	inits[0].Cards = append(inits[0].Cards, model.Card{
		Slug: "redesign-waves", Title: "Group cards into waves",
		Status: model.StatusNow, Branch: "wave/work", Seat: "wave1-work",
	})
	cards := openCards(inits)

	t.Run("two cards on one branch", func(t *testing.T) {
		a := model.Agent{State: model.AgentWorking, Uptime: "09:00", Dir: filepath.Join(joinRoot, "organizer")}
		if got := joinAgent(a, cards, func(string) string { return "wave/work" }, time.Now()); got != nil {
			t.Fatalf("joined to %q, want no card", got.Slug)
		}
	})
	t.Run("two cards on one seat", func(t *testing.T) {
		a := model.Agent{State: model.AgentWorking, Uptime: "09:00", Session: "wave1-work"}
		if got := joinAgent(a, cards, branchOfFixture, time.Now()); got != nil {
			t.Fatalf("joined to %q, want no card", got.Slug)
		}
	})
}

// FR-8: the join carries what a card line shows, and joinAgentCards stamps it
// on every agent of every initiative.
func TestJoinAgentCardsCarriesStateContextAndStart(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	inits := joinFixture()
	now := time.Date(2026, 9, 26, 12, 0, 0, 0, time.UTC)
	inits[0].Agents = []model.Agent{
		{
			Name: "organizer-probe-sup2", State: model.AgentWorking, Uptime: "38:12",
			Dir:     filepath.Join(joinRoot, ".wt", "redesign-agent-card"),
			Context: &model.ContextStatus{UsedPercent: 41, InputTokens: 212_000},
		},
		{Name: "idle", State: model.AgentShell, Dir: joinRoot},
	}
	joinAgentCards(inits, branchOfFixture, now)

	j := inits[0].Agents[0].Card
	if j == nil {
		t.Fatal("the working agent was joined to no card")
	}
	if j.Initiative != "organizer" || j.Key != "organizer/redesign-agent-card" || j.Title == "" {
		t.Errorf("initiative %q key %q title %q", j.Initiative, j.Key, j.Title)
	}
	if j.State != model.AgentWorking {
		t.Errorf("state %q, want working", j.State)
	}
	if j.UsedPercent != 41 || j.InputTokens != 212_000 {
		t.Errorf("context %v%% %d tokens, want 41%% 212000", j.UsedPercent, j.InputTokens)
	}
	if want := now.Add(-(38*time.Minute + 12*time.Second)); !j.StartedAt.Equal(want) {
		t.Errorf("started at %v, want %v", j.StartedAt, want)
	}
	if inits[0].Agents[1].Card != nil {
		t.Error("the shell was joined to a card")
	}
}

// An agent with no statusline record still joins; the numbers are zero, which
// is honest — the hook has not fired for it.
func TestJoinAgentWithoutStatusline(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	a := model.Agent{State: model.AgentRunning, Dir: filepath.Join(joinRoot, ".wt", "redesign-agent-card")}
	got := joinAgent(a, openCards(joinFixture()), branchOfFixture, time.Now())
	if got == nil {
		t.Fatal("no card")
	}
	if got.UsedPercent != 0 || got.InputTokens != 0 || !got.StartedAt.IsZero() {
		t.Errorf("want zero numbers, got %+v", *got)
	}
}

func TestOpenCardsSkipsFinished(t *testing.T) {
	cards := openCards(joinFixture())
	if len(cards) != 4 {
		t.Fatalf("%d open cards, want 4", len(cards))
	}
	for _, c := range cards {
		if c.Slug == "longer-session-names" {
			t.Fatal("an archived done card is open")
		}
		if c.Root != joinRoot || c.Initiative != "organizer" {
			t.Fatalf("card %q carries root %q initiative %q", c.Slug, c.Root, c.Initiative)
		}
	}
}

func TestParseETime(t *testing.T) {
	tests := []struct {
		in   string
		want time.Duration
		ok   bool
	}{
		{"38:12", 38*time.Minute + 12*time.Second, true},
		{"01:02:03", time.Hour + 2*time.Minute + 3*time.Second, true},
		{"2-03:04:05", 51*time.Hour + 4*time.Minute + 5*time.Second, true},
		{"  09:00  ", 9 * time.Minute, true},
		{"", 0, false},
		{"12", 0, false},
		{"1:2:3:4", 0, false},
		{"ab:cd", 0, false},
		{"-01:00", 0, false},
	}
	for _, tt := range tests {
		got, ok := parseETime(tt.in)
		if ok != tt.ok || got != tt.want {
			t.Errorf("parseETime(%q) = %v, %v; want %v, %v", tt.in, got, ok, tt.want, tt.ok)
		}
	}
}
