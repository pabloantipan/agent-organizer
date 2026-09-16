// Package model holds the data shapes shared by the scanner, the sync layer,
// the CLI and the UI. Nothing here does I/O.
package model

import (
	"strings"
	"time"
)

// Card statuses. The set is closed on purpose; see the working-on skill.
const (
	StatusNow     = "now"
	StatusBlocked = "blocked"
	StatusNext    = "next"
	StatusDone    = "done"
)

// StatusOrder returns the column order used everywhere a list of cards is
// shown: now, blocked, next, done. Unknown statuses sort last.
func StatusOrder(status string) int {
	switch status {
	case StatusNow:
		return 0
	case StatusBlocked:
		return 1
	case StatusNext:
		return 2
	case StatusDone:
		return 3
	}
	return 9
}

// Initiative is the parsed working-on/initiative.yaml plus its location.
type Initiative struct {
	ID      string `yaml:"id" json:"id"`
	Title   string `yaml:"title" json:"title"`
	Client  string `yaml:"client" json:"client"`
	Status  string `yaml:"status" json:"status"`
	Started string `yaml:"started" json:"started"`
	// CreatedOn is the machine that bootstrapped the initiative, not where it is now.
	CreatedOn string   `yaml:"machine" json:"created_on"`
	Repos     []string `yaml:"repos" json:"repos"`
	PortsTo   string   `yaml:"ports_to" json:"ports_to"`
	Notes     []string `yaml:"notes" json:"notes"`
	// Target is the date the initiative is meant to land. Optional.
	Target string `yaml:"target" json:"target"`
	// Milestones are dated checkpoints. Optional, few.
	Milestones []Milestone `yaml:"milestones" json:"milestones"`

	// Path is the initiative root directory (the parent of working-on/).
	Path string `yaml:"-" json:"path"`
}

// Milestone is a dated checkpoint on an initiative roadmap.
type Milestone struct {
	Date  string `yaml:"date" json:"date"`
	Title string `yaml:"title" json:"title"`
}

// Card is one working-on/<slug>.md file.
// ThreadState is one discuss thread a card waits on, as the board shows it.
// BlockedOn is the point of the type: a card can be waiting on a thread whose
// only remaining participant is a seat nobody ever started, and no other
// surface says so.
type ThreadState struct {
	ID            string `json:"id"`
	Subject       string `json:"subject"`
	Status        string `json:"status"` // open | stalled | escalated
	Messages      int    `json:"messages"`
	SinceDecision int    `json:"since_decision"`
	QuietSeconds  int64  `json:"quiet_seconds"`
	// Missing is a thread the cell no longer lists: closed, or an id that
	// never existed. Either way there is nothing left to wait for.
	Missing bool `json:"missing"`
	// BlockedOn names the seats in this thread that cannot be woken, with the
	// reason ("never started", "watcher stale", "not picking up").
	BlockedOn []Blocker `json:"blocked_on"`
}

// Blocker is one unreachable seat in a thread a card waits on.
type Blocker struct {
	Seat   string `json:"seat"`
	Reason string `json:"reason"`
}

type Card struct {
	Slug    string   `yaml:"-" json:"slug"`
	Title   string   `yaml:"title" json:"title"`
	Status  string   `yaml:"status" json:"status"`
	Repos   []string `yaml:"repos" json:"repos"`
	Branch  string   `yaml:"branch" json:"branch"`
	Updated string   `yaml:"updated" json:"updated"`
	Next    string   `yaml:"next" json:"next"`
	// Due is optional and only present when a real date exists.
	Due string `yaml:"due" json:"due"`
	// Start is optional: a planned start when it is not the branch's first commit.
	Start string `yaml:"start" json:"start"`

	// Threads is optional: the discuss thread ids this card waits on. Only
	// meaningful in an initiative that has a cell.
	Threads []string `yaml:"threads" json:"threads"`
	// Seat is optional: the cell seat that builds this card. A seat with no
	// open card naming it is finished, which is what retiring reads.
	Seat string `yaml:"seat" json:"seat"`

	// The build fields (working-on skill, Vocabulary). A supervisor reads
	// them to launch a builder against the card and to sequence waves; a card
	// without Spec, Gate and Boundary is a note with a next action, not
	// something `organizer run` will launch. All optional on the file.
	//
	// DependsOn names cards whose done/ unblocks this one.
	DependsOn []string `yaml:"depends_on" json:"depends_on"`
	// Boundary is the paths a builder may touch. Disjoint across a wave.
	Boundary []string `yaml:"boundary" json:"boundary"`
	// Spec is where the work is specified, "<path>#<section>".
	Spec string `yaml:"spec" json:"spec"`
	// Gate is the verification that defines done.
	Gate string `yaml:"gate" json:"gate"`
	// Review is who or what checks the result before it merges.
	Review string `yaml:"review" json:"review"`
	// ThreadState is those threads resolved against the live cell. Derived,
	// like BranchStart below, and empty when discuss is unreachable.
	ThreadState []ThreadState `yaml:"-" json:"thread_state"`

	// BranchStart and BranchLast come from git: first and last commit dates on
	// the card's branch that are not on main. Empty when unknown.
	BranchStart string `yaml:"-" json:"branch_start"`
	BranchLast  string `yaml:"-" json:"branch_last"`

	Path string `yaml:"-" json:"path"`
	// Body is the markdown after the frontmatter. Kept for the card drawer.
	Body string `yaml:"-" json:"body"`
	// Archived is true for cards under working-on/done/.
	Archived bool `yaml:"-" json:"archived"`
}

// LaunchFields are the card fields a builder cannot be launched without: the
// spec it works from, the gate that says it is done, and the boundary it may
// not cross. Order is the order the refusal names them in.
var LaunchFields = []string{"spec", "gate", "boundary"}

// MissingLaunchFields lists the LaunchFields this card does not carry. Empty
// means the card is launchable. This is the whole of the delegation contract
// the organizer enforces; everything else on a card is advice.
func (c Card) MissingLaunchFields() []string {
	var missing []string
	if strings.TrimSpace(c.Spec) == "" {
		missing = append(missing, "spec")
	}
	if strings.TrimSpace(c.Gate) == "" {
		missing = append(missing, "gate")
	}
	if len(c.Boundary) == 0 {
		missing = append(missing, "boundary")
	}
	return missing
}

// UpdatedTime parses the card's updated date. Zero time when absent or malformed.
func (c Card) UpdatedTime() time.Time {
	t, err := time.Parse("2006-01-02", c.Updated)
	if err != nil {
		return time.Time{}
	}
	return t
}

// DueTime parses the card's due date. Zero time when absent or malformed.
func (c Card) DueTime() time.Time {
	t, err := time.Parse("2006-01-02", c.Due)
	if err != nil {
		return time.Time{}
	}
	return t
}

// RepoState is what git says about one repo listed in the initiative.
type RepoState struct {
	Name       string `json:"name"`
	Path       string `json:"path"`
	Branch     string `json:"branch"`
	Dirty      int    `json:"dirty"`
	LastCommit string `json:"last_commit"`
	// Missing is true when the directory is not there or is not a git repo.
	Missing bool   `json:"missing"`
	Err     string `json:"err,omitempty"`
}

// Agent is one agent process or session on this machine, grouped under the
// initiative whose root contains its working directory.
type Agent struct {
	// Name is the session name when there is one, else a label from the dir.
	Name    string `json:"name"`
	Session string `json:"session"` // zellij session name; empty for plain terminals
	Family  string `json:"family"`  // probe family, e.g. shop; empty otherwise
	Short   string `json:"short"`   // session name without the family-probe- prefix
	Kind    string `json:"kind"`    // probe | zellij | terminal
	// State: working (CPU time grew since the last sample), running (process
	// alive, idle), shell (session alive, no agent process), exited (layout
	// only, resurrectable with probe <name>).
	State      string  `json:"state"`
	PID        int     `json:"pid"`
	TTY        string  `json:"tty"`
	Uptime     string  `json:"uptime"`
	CPUSeconds float64 `json:"cpu_seconds"`
	Dir        string  `json:"dir"`
	Created    string  `json:"created"` // zellij session age when known
	// Persona and Cell come from the process environment (AGENT_NAME and
	// PROJECT_ID, the discuss launch line). Empty for a plain agent.
	Persona string `json:"persona"`
	Cell    string `json:"cell"`
	// Context is the last statusline record for this process, nil when the
	// statusline hook is not installed or has not fired yet.
	Context *ContextStatus `json:"context"`
	// Watcher is the discuss health of the persona: alive, stale, never; empty
	// when the process is not a persona or discuss is unreachable.
	Watcher     string `json:"watcher"`
	Deaf        bool   `json:"deaf"`
	Undelivered int    `json:"undelivered"`
}

const (
	AgentWorking = "working"
	AgentRunning = "running"
	AgentShell   = "shell"
	AgentExited  = "exited"
)

// ContextStatus is what the agent's own statusline reported last: how full
// its context window is. Written by `organizer statusline`, read by the scan.
type ContextStatus struct {
	SessionID   string    `json:"session_id"`
	Model       string    `json:"model"`
	UsedPercent float64   `json:"used_percent"`
	InputTokens int       `json:"input_tokens"`
	WindowSize  int       `json:"window_size"`
	CostUSD     float64   `json:"cost_usd"`
	Transcript  string    `json:"transcript"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Cell is the persona roster of an initiative, read from agents/cell.json.
// The seats are discuss agent names; the persona files sit beside the spec.
type Cell struct {
	Project    string   `json:"project"`
	Workdir    string   `json:"workdir"`
	Agents     []string `json:"agents"`
	Human      string   `json:"human"`
	Reconciler string   `json:"reconciler"`
	// Model overrides the crew_model config for this cell (alias or id).
	Model string `json:"model,omitempty"`
}

// Live reports whether an agent process exists.
func (a Agent) Live() bool { return a.State == AgentWorking || a.State == AgentRunning }

// Problem is something the scanner could not make sense of. Never fatal.
type Problem struct {
	Path string `json:"path"`
	Msg  string `json:"msg"`
}

// ScannedInitiative is an initiative with everything read from disk.
type ScannedInitiative struct {
	Initiative
	Cards      []Card      `json:"cards"`
	RepoStates []RepoState `json:"repos_state"`
	Problems   []Problem   `json:"problems"`
	Agents     []Agent     `json:"agents"`
	// Cell is the persona roster when agents/cell.json exists at the root.
	Cell      *Cell     `json:"cell"`
	ScannedAt time.Time `json:"scanned_at"`
}

// LiveAgents counts agents with a running process; Working counts those busy.
func (s ScannedInitiative) LiveAgents() (live, working int) {
	for _, x := range s.Agents {
		if x.Live() {
			live++
		}
		if x.State == AgentWorking {
			working++
		}
	}
	return
}

// Counts returns the number of open cards per status.
func (s ScannedInitiative) Counts() (now, blocked, next int) {
	for _, c := range s.Cards {
		if c.Archived {
			continue
		}
		switch c.Status {
		case StatusNow:
			now++
		case StatusBlocked:
			blocked++
		case StatusNext:
			next++
		}
	}
	return
}

// LastUpdated is the newest card updated date, or zero.
func (s ScannedInitiative) LastUpdated() time.Time {
	var t time.Time
	for _, c := range s.Cards {
		if u := c.UpdatedTime(); u.After(t) {
			t = u
		}
	}
	return t
}

// Snapshot is one machine's view at one moment. This is the unit that syncs.
type Snapshot struct {
	Machine     string              `json:"machine"`
	ScannedAt   time.Time           `json:"scanned_at"`
	Initiatives []ScannedInitiative `json:"initiatives"`
	// Unassigned are agents whose directory is not inside any initiative.
	Unassigned []Agent `json:"unassigned_agents"`
}

// Order is the manual priority: initiative ids first to last, and per
// initiative the card slugs first to last. Unlisted items keep their default
// sort after the listed ones. It is app state, never written to card files.
type Order struct {
	Initiatives []string            `json:"initiatives"`
	Cards       map[string][]string `json:"cards"`
	// Groups partition the rail visually. Priority stays Initiatives: a
	// group's members are listed in that order, and the groups' concatenation
	// is that order too, so the rank numbers stay global. Empty means a flat
	// rail. Initiatives in no group are shown after the last group.
	Groups []Group `json:"groups,omitempty"`
	// Notes are the human's own notes on a card, keyed "<initiative>/<slug>":
	// context written before discussing, kept out of the card file so the
	// app stays read-only over cards and agents keep the file. Resolved marks
	// items of the human's queue as solved, keyed "thread:<id>" or
	// "card:<initiative>/<slug>", with the date. Both ride the order document.
	Notes     map[string][]Note `json:"notes,omitempty"`
	Resolved  map[string]string `json:"resolved,omitempty"`
	UpdatedAt time.Time         `json:"updated_at"`
}

// Note is one comment on a card, Trello-style: who, when, what.
type Note struct {
	ID   string    `json:"id"`
	By   string    `json:"by"` // the machine's account email, or its name
	At   time.Time `json:"at"`
	Text string    `json:"text"`
}

// Group is one named section of the rail.
type Group struct {
	Name        string   `json:"name"`
	Initiatives []string `json:"initiatives"`
}

// Regroup rebuilds Initiatives from the groups (in group order, members in
// member order) followed by whatever was ranked before but is in no group,
// then drops duplicates and ids that appear in more than one group (first
// group wins). This is the one place group order and priority are reconciled.
func (o *Order) Regroup(groups []Group) {
	seen := map[string]bool{}
	var flat []string
	var kept []Group
	for _, g := range groups {
		ng := Group{Name: g.Name}
		for _, id := range g.Initiatives {
			if id == "" || seen[id] {
				continue
			}
			seen[id] = true
			ng.Initiatives = append(ng.Initiatives, id)
			flat = append(flat, id)
		}
		kept = append(kept, ng)
	}
	for _, id := range o.Initiatives {
		if !seen[id] {
			seen[id] = true
			flat = append(flat, id)
		}
	}
	o.Groups = kept
	o.Initiatives = flat
}

// Reprioritize replaces Initiatives and re-sorts every group's members by
// the new ranking, so a flat reorder (the Initiatives tab) never disagrees
// with the rail. Ids moved across a group boundary stay in their group.
func (o *Order) Reprioritize(ids []string) {
	o.Initiatives = ids
	for gi := range o.Groups {
		members := o.Groups[gi].Initiatives
		sortByRank(members, ids)
	}
}

func sortByRank(members, ranking []string) {
	for i := 1; i < len(members); i++ {
		for j := i; j > 0 && Rank(ranking, members[j]) < Rank(ranking, members[j-1]); j-- {
			members[j], members[j-1] = members[j-1], members[j]
		}
	}
}

// Rank returns the position of id in list, or a large number when absent.
func Rank(list []string, id string) int {
	for i, v := range list {
		if v == id {
			return i
		}
	}
	return 1 << 20
}
