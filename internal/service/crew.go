package service

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"slices"
	"strings"
	"time"

	"organizer/internal/config"
	"organizer/internal/discuss"
	"organizer/internal/model"
	"organizer/internal/prompt"
	"organizer/internal/record"
)

// Seat is one persona of a cell as the Agents view shows it: the roster
// entry joined to whatever runs for it and to its discuss health.
type Seat struct {
	Name    string       `json:"name"`
	Session string       `json:"session"` // the probe session a crew launch uses
	Agent   *model.Agent `json:"agent"`   // nil when nothing runs for this seat
	// Watcher is alive, stale or never; empty when discuss is unreachable.
	Watcher     string `json:"watcher"`
	Deaf        bool   `json:"deaf"`
	Undelivered int    `json:"undelivered"`
	// Owes is the live threads this seat has spoken in that are still open
	// with no decision. What the cell is waiting on this seat for.
	Owes []model.ThreadState `json:"owes"`
}

// crewSession is the probe session name of a seat: family after the
// initiative, name after the seat, so it sorts with the initiative's other
// probes and resumes by the same name on every launch.
func crewSession(initiativeID, seat string) string {
	return sanitize(initiativeID) + "-probe-" + sanitize(seat)
}

func agentRank(a *model.Agent) int {
	switch a.State {
	case model.AgentWorking:
		return 0
	case model.AgentRunning:
		return 1
	case model.AgentShell:
		return 2
	}
	return 3
}

// buildCrew joins the roster to the initiative's agents and the discuss
// health. A seat matches an agent by persona (from the process environment)
// or, for a session without a live process, by the crew session name. The
// health is also stamped onto the matching agent rows.
func buildCrew(si *model.ScannedInitiative, snap discuss.Snapshot) []Seat {
	if si.Cell == nil {
		return nil
	}
	seats := make([]Seat, 0, len(si.Cell.Agents))
	for _, name := range si.Cell.Agents {
		s := Seat{Name: name, Session: crewSession(si.ID, name)}
		if h, ok := snap.Agents[name]; ok {
			s.Watcher, s.Deaf, s.Undelivered = h.Watcher, h.Deaf, h.Undelivered
		}
		for _, t := range snap.Threads {
			if t.Status == "open" && t.SinceDecision > 0 && slices.Contains(t.Participants, name) {
				s.Owes = append(s.Owes, threadState(t, snap))
			}
		}
		var best *model.Agent
		for i := range si.Agents {
			a := &si.Agents[i]
			if a.Persona != name && !(a.Persona == "" && a.Session == s.Session) {
				continue
			}
			a.Watcher, a.Deaf, a.Undelivered = s.Watcher, s.Deaf, s.Undelivered
			if best == nil || agentRank(a) < agentRank(best) {
				best = a
			}
		}
		if best != nil {
			cp := *best
			s.Agent = &cp
		}
		seats = append(seats, s)
	}
	return seats
}

// threadState resolves one live thread into what the board needs, including
// which of its participants cannot be reached.
func threadState(t discuss.Thread, snap discuss.Snapshot) model.ThreadState {
	ts := model.ThreadState{
		ID:            t.ID,
		Subject:       t.Subject,
		Status:        t.Status,
		Messages:      t.Messages,
		SinceDecision: t.SinceDecision,
		QuietSeconds:  t.QuietSeconds,
	}
	for _, p := range t.Participants {
		h, ok := snap.Agents[p]
		if !ok {
			continue
		}
		switch {
		case h.Deaf:
			ts.BlockedOn = append(ts.BlockedOn, model.Blocker{Seat: p, Reason: "not picking up"})
		case h.Watcher == "never":
			ts.BlockedOn = append(ts.BlockedOn, model.Blocker{Seat: p, Reason: "never started"})
		case h.Watcher == "stale":
			ts.BlockedOn = append(ts.BlockedOn, model.Blocker{Seat: p, Reason: "watcher stale"})
		}
	}
	return ts
}

// threadStates resolves the thread ids a card names against the live cell.
func threadStates(ids []string, snap discuss.Snapshot) []model.ThreadState {
	out := make([]model.ThreadState, 0, len(ids))
	for _, id := range ids {
		t, ok := snap.Thread(id)
		if !ok {
			out = append(out, model.ThreadState{ID: id, Missing: true})
			continue
		}
		out = append(out, threadState(t, snap))
	}
	return out
}

// CardWait is one card held up by a conversation: it names a thread that is
// still open with no decision. This is the join the whole view exists for —
// a card, the thread it waits on, and (through the group's Crew) whether
// anyone is left who can answer it.
type CardWait struct {
	Slug   string            `json:"slug"`
	Title  string            `json:"title"`
	Status string            `json:"status"`
	Thread model.ThreadState `json:"thread"`
}

// cardsWaiting lists the initiative's open cards whose named threads have not
// been decided.
//
// It deliberately does not guess which seat owes the reply. A seat that has
// never spoken is not a participant, so the one who owes it is usually the one
// absent from the thread — unprovable from here, and the card's prose is not
// evidence. What is provable is reported: the thread is undecided, and the
// group's Crew says which seats cannot be woken.
func cardsWaiting(si *model.ScannedInitiative, snap discuss.Snapshot) []CardWait {
	var out []CardWait
	for i := range si.Cards {
		c := &si.Cards[i]
		if c.Archived || c.Status == "done" || len(c.Threads) == 0 {
			continue
		}
		for _, ts := range threadStates(c.Threads, snap) {
			if ts.Missing || ts.SinceDecision == 0 {
				continue
			}
			out = append(out, CardWait{Slug: c.Slug, Title: c.Title, Status: c.Status, Thread: ts})
		}
	}
	return out
}

// cellHealth asks discuss for the roster health, as the human first and the
// reconciler second. The second return is why it is missing, for the UI.
func (s *Service) cellHealth(cell *model.Cell) (discuss.Snapshot, string) {
	dir := config.Expand(s.cfg.DiscussStateDir)
	if dir == "" {
		dir = discuss.DefaultStateDir()
	}
	if !discuss.Available(dir) {
		return discuss.Snapshot{}, "discuss is not running"
	}
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	why := "no identity with a discuss token"
	for _, id := range []string{cell.Human, cell.Reconciler} {
		if id == "" {
			continue
		}
		snap, err := discuss.Health(ctx, dir, cell.Project, id)
		if err == nil {
			return snap, ""
		}
		why = err.Error()
	}
	return discuss.Snapshot{}, why
}

// discussAPIBin finds discuss-api: PATH first, then ~/.local/bin where
// `make install` puts it.
func discussAPIBin() (string, error) {
	if p, err := exec.LookPath("discuss-api"); err == nil {
		return p, nil
	}
	home, _ := os.UserHomeDir()
	p := filepath.Join(home, ".local", "bin", "discuss-api")
	if _, err := os.Stat(p); err != nil {
		return "", errors.New("discuss-api not found on PATH or in ~/.local/bin; run make install in ~/agent-slack/api")
	}
	return p, nil
}

// crewDir holds the per-seat prelude and opening prompt files.
func crewDir(initiativeID string) string {
	base := os.Getenv("XDG_DATA_HOME")
	if base == "" {
		home, _ := os.UserHomeDir()
		base = filepath.Join(home, ".local", "share")
	}
	return filepath.Join(base, "organizer", "crew", initiativeID)
}

// CreateCrew brings every seat of the initiative's cell up: one probe
// session per seat, its discuss identity exported by a prelude the pane
// sources at launch, and an opening prompt on the first run only. The token
// itself is fetched at launch through `discuss-api token env`, so it lives in
// the discuss registry and the process environment, nowhere else. Returns the
// launch line of each seat; with open, runs them in one iTerm2 window, one
// tab per seat. Seats that already have a session simply reattach.
func (s *Service) CreateCrew(initiativeID string, open bool) ([]string, error) {
	var si *model.ScannedInitiative
	s.mu.Lock()
	for i := range s.state.Local.Initiatives {
		if s.state.Local.Initiatives[i].ID == initiativeID {
			cp := s.state.Local.Initiatives[i]
			si = &cp
		}
	}
	s.mu.Unlock()
	if si == nil {
		return nil, fmt.Errorf("initiative %q not found on this machine", initiativeID)
	}
	if si.Cell == nil {
		return nil, fmt.Errorf("initiative %q has no agents/cell.json", initiativeID)
	}
	if _, err := os.Stat(probeBin()); err != nil {
		return nil, fmt.Errorf("probe not found at %s", probeBin())
	}
	api, err := discussAPIBin()
	if err != nil {
		return nil, err
	}
	family := sanitize(initiativeID)
	if out, err := exec.Command(probeBin(), "--wrap", family).CombinedOutput(); err != nil {
		return nil, fmt.Errorf("probe --wrap: %s", strings.TrimSpace(string(out)))
	}
	wrapper := filepath.Join(filepath.Dir(probeBin()), family+"-probe")
	dir := crewDir(initiativeID)
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return nil, err
	}

	var cmds []string
	for _, seat := range si.Cell.Agents {
		// Preflight: the identity must already hold a token, or the pane would
		// open on an error. The bootstrap issues tokens; this never does.
		if out, err := exec.Command(api, "token", "env", si.Cell.Project, seat).CombinedOutput(); err != nil {
			return nil, fmt.Errorf("%s/%s has no discuss token (%s); run ~/agent-slack/ops/bootstrap.sh %s first",
				si.Cell.Project, seat, strings.TrimSpace(string(out)), si.Cell.Project)
		}
		prelude := preludeFor(api, *si.Cell, seat, s.Config().CrewModel)
		preludePath := filepath.Join(dir, seat+".sh")
		promptPath := filepath.Join(dir, seat+".md")
		if err := os.WriteFile(preludePath, []byte(prelude), 0o600); err != nil {
			return nil, err
		}
		if err := os.WriteFile(promptPath, []byte(prompt.Persona(*si.Cell, seat, si.Path)), 0o600); err != nil {
			return nil, err
		}
		cmds = append(cmds, launchLine(preludePath, promptPath, wrapper, sanitize(seat), si.Path))
	}
	// The record side: push flag into projects.json, cell registered when
	// this laptop is a factory. See registerCrew for what is a skip and what
	// is a stop.
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	if err := registerCell(ctx, s.Config(), si.Path, record.Cell{
		Cell: si.Cell.Project, Initiative: si.ID, Title: si.Title, Client: si.Client,
	}); err != nil {
		return nil, err
	}
	if !open {
		return cmds, nil
	}
	return cmds, openInTerminalTabs(cmds)
}

// openInTerminalTabs runs each command in its own tab of one new iTerm2
// window; Terminal (one window per command) is the fallback.
func openInTerminalTabs(cmds []string) error {
	if len(cmds) == 0 {
		return nil
	}
	if runtime.GOOS != "darwin" {
		for _, c := range cmds {
			if err := exec.Command("x-terminal-emulator", "-e", "bash", "-lc", c+"; exec bash").Start(); err != nil {
				return err
			}
		}
		return nil
	}
	var b strings.Builder
	b.WriteString("tell application \"iTerm2\"\n\tactivate\n\tset w to (create window with default profile)\n")
	fmt.Fprintf(&b, "\ttell current session of w to write text %s\n", appleScriptString(cmds[0]))
	for _, c := range cmds[1:] {
		fmt.Fprintf(&b, "\ttell w\n\t\tset t to (create tab with default profile)\n\t\ttell current session of t to write text %s\n\tend tell\n", appleScriptString(c))
	}
	b.WriteString("end tell")
	if err := exec.Command("osascript", "-e", b.String()).Run(); err == nil {
		return nil
	}
	for _, c := range cmds {
		script := fmt.Sprintf("tell application \"Terminal\"\n\tactivate\n\tdo script %s\nend tell", appleScriptString(c))
		if err := exec.Command("osascript", "-e", script).Run(); err != nil {
			return err
		}
	}
	return nil
}

// preludeFor is the shell snippet a seat's pane sources before the agent
// starts: the discuss identity, fetched at launch so no token is stored, and
// the model. ANTHROPIC_MODEL outranks the settings file, so a crew runs on
// the crew model whatever the machine's default is.
func preludeFor(api string, cell model.Cell, seat, crewModel string) string {
	m := cell.Model
	if m == "" {
		m = crewModel
	}
	if m == "" {
		m = "opus"
	}
	hook := filepath.Join(filepath.Dir(api), "discuss-hook")
	return fmt.Sprintf("# discuss identity of %s/%s, sourced by the probe pane before the agent starts\nexport $(%s token env %s %s | sed 's/ claude$//')\nexport ANTHROPIC_MODEL=%s\n"+
		"# the external watcher: lives as long as this pane, wakes the seat by typing into it when mail\n"+
		"# arrives, and takes the lock first so the Stop hook's watcher yields. Nothing to re-arm.\n"+
		"%s watch --external --parent $$ >/dev/null 2>&1 &\n",
		cell.Project, seat, shellQuote(api), shellQuote(cell.Project), shellQuote(seat), shellQuote(m), shellQuote(hook))
}
