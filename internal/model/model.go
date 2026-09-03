// Package model holds the data shapes shared by the scanner, the sync layer,
// the CLI and the UI. Nothing here does I/O.
package model

import "time"

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
}

const (
	AgentWorking = "working"
	AgentRunning = "running"
	AgentShell   = "shell"
	AgentExited  = "exited"
)

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
	ScannedAt  time.Time   `json:"scanned_at"`
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
	UpdatedAt   time.Time           `json:"updated_at"`
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
