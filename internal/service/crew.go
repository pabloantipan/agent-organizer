package service

import (
	"context"
	"encoding/json"
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
	"organizer/internal/session"
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
	Capped      bool   `json:"capped"` // deaf because of the drain ceiling: alive, posting; its next prompt delivers the mail
	Undelivered int    `json:"undelivered"`
	// Owes is the live threads this seat has spoken in that are still open
	// with no decision. What the cell is waiting on this seat for.
	Owes []model.ThreadState `json:"owes"`
	// NoPersona is true when agents/<seat>.md is missing at the initiative
	// root: CreateCrew refuses the cell until it is written (FR-2).
	NoPersona bool `json:"no_persona"`
}

// maxSessionName is the longest probe session name zellij will hold. zellij
// puts a session's socket at $TMPDIR/zellij-<uid>/contract_version_1/<name>
// and macOS caps a unix socket path at 103 characters (sun_path is 104 bytes
// with the NUL). probe exports TMPDIR=/tmp, so with uid 501 the prefix is 35
// characters and a name may be 68: measured on zellij 0.44.3, 68 starts and
// 69 is refused (~/claudecode bin/probe, which refuses over the same budget).
// Under the per-user default TMPDIR the prefix was 79 and the ceiling 22;
// the ceiling moves again only if probe's socket dir does.
const maxSessionName = 103 - len("/tmp/zellij-501/contract_version_1/")

// sessionNameTooLong names the length and the ceiling of a session name
// zellij would refuse, or is nil. Launch, join and retire read one ceiling.
func sessionNameTooLong(name string) error {
	if len(name) > maxSessionName {
		return fmt.Errorf("session name %q is %d characters; zellij holds at most %d", name, len(name), maxSessionName)
	}
	return nil
}

// seatShort is the seat name after its role prefix. The roster convention is
// <role>_<name>, and the role itself may hold underscores, so the name is the
// last token: po_andrea -> andrea, tech_lead_nicolas -> nicolas,
// fullstack_dev_francisco -> francisco. A seat with no underscore is already
// its short name.
func seatShort(seat string) string {
	if i := strings.LastIndex(seat, "_"); i >= 0 {
		return seat[i+1:]
	}
	return seat
}

// crewSession is the probe session name of a seat: the cell's project as the
// probe family, the seat's short name after it — camp-probe-andrea, which is
// what the sessions that actually ran were called.
//
// Named after the cell and not after the initiative because the cell's
// project is the short name the seats already answer to (the rule dates from
// a ceiling of 22, when <initiative>-probe-<seat> was refused). Over the budget this is an error naming the length,
// never a truncation: a truncated name is a session that the launch, the
// join and the retire each guess differently.
func crewSession(cell *model.Cell, seat string) (string, error) {
	if cell == nil {
		return "", errors.New("no cell: a crew session is named after the cell's project")
	}
	family, short := sanitize(cell.Project), sanitize(seatShort(seat))
	if family == "" || short == "" {
		return "", fmt.Errorf("cannot name a session for seat %q of project %q", seat, cell.Project)
	}
	name := family + "-probe-" + short
	if err := sessionNameTooLong(name); err != nil {
		return "", fmt.Errorf("%w (shorten the cell's project or the seat's name)", err)
	}
	return name, nil
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
// health is stamped onto every agent row that has it first (stampHealth), so
// a seat's copy of its agent carries it too.
func buildCrew(si *model.ScannedInitiative, snap discuss.Snapshot) []Seat {
	if si.Cell == nil {
		return nil
	}
	stampHealth(si, snap)
	seats := make([]Seat, 0, len(si.Cell.Agents))
	for _, name := range si.Cell.Agents {
		s := Seat{Name: name, NoPersona: si.Path != "" && !hasPersonaFile(si.Path, name)}
		// A seat whose name does not fit zellij's budget has no session to
		// join by; it still shows, and still matches a process by persona.
		if sess, err := crewSession(si.Cell, name); err == nil {
			s.Session = sess
		}
		if h, ok := snap.Agents[name]; ok {
			s.Watcher, s.Deaf, s.Capped, s.Undelivered = h.Watcher, h.Deaf, h.Capped(), h.Undelivered
		}
		for _, t := range snap.Threads {
			if t.Status == "open" && t.SinceDecision > 0 && slices.Contains(t.Participants, name) {
				s.Owes = append(s.Owes, threadState(t, snap))
			}
		}
		var best *model.Agent
		for i := range si.Agents {
			a := &si.Agents[i]
			if a.Persona != name && !(a.Persona == "" && s.Session != "" && a.Session == s.Session) {
				continue
			}
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

// crewCell is the cell a view shows: a copy of the roster with its derived
// State. The copy is the point: the scanned cell is shared with the cache,
// state.json and the sync payload, and read by Service.Cell outside the
// lock, so the derived state is never written onto it.
func crewCell(cell *model.Cell, seats []Seat) *model.Cell {
	if cell == nil {
		return nil
	}
	c := *cell
	c.State = cellState(cell, seats, loadRuns)
	return &c
}

// loadRuns is the run archive the cell state reads; a variable so a test
// can hand it runs without a runs.jsonl.
var loadRuns = func() []session.Run { return session.LoadRuns(session.RunsPath()) }

// cellState derives what decision 0030 calls a cell in definition: seats in
// the roster and not one of them has run. A seat has run when a session is
// joined to it (buildCrew's Agent, in any state: an exited layout was a
// launch) or when runs.jsonl holds a run of it, by persona within the cell's
// project or by its crew session name (the spec's assumption A1). The
// archive is read only when no seat has a session, so a live cell costs no
// disk. A roster with no seats is between waves, not being defined: "".
// A draft is in definition whatever its seats' runs: it waits on its accept
// record, not on a launch (discovery-in-a-cell FR-3e).
func cellState(cell *model.Cell, seats []Seat, runs func() []session.Run) string {
	if cell != nil && cell.Draft {
		return model.CellInDefinition
	}
	if cell == nil || len(seats) == 0 {
		return ""
	}
	for _, s := range seats {
		if s.Agent != nil {
			return model.CellActive
		}
	}
	for _, r := range runs() {
		for _, s := range seats {
			byPersona := r.Persona == s.Name && (r.Cell == "" || strings.EqualFold(r.Cell, cell.Project))
			if byPersona || (r.Session != "" && r.Session == s.Session) {
				return model.CellActive
			}
		}
	}
	return model.CellInDefinition
}

// stampHealth puts the discuss health on every agent of the initiative whose
// name discuss knows, roster seat or not: supervisors and builders have
// health too (FR-6). The name is the persona from the process environment,
// else the roster seat whose crew session this is, else the session's short
// name (organizer-probe-sup10 is sup10).
//
// NoIdentity is FR-7 and only FR-7: a live process whose session's short
// name is an agent discuss has never seen poll, with mail waiting, while the
// process carries no AGENT_NAME. Nothing else is inferred about "never".
func stampHealth(si *model.ScannedInitiative, snap discuss.Snapshot) {
	seatOf := map[string]string{}
	for _, seat := range si.Cell.Agents {
		if sess, err := crewSession(si.Cell, seat); err == nil {
			seatOf[sess] = seat
		}
	}
	for i := range si.Agents {
		a := &si.Agents[i]
		a.Watcher, a.Deaf, a.Capped, a.Undelivered, a.NoIdentity = "", false, false, 0, false
		name := a.Persona
		if name == "" {
			name = seatOf[a.Session]
		}
		if name == "" {
			name = a.Short
		}
		h, ok := snap.Agents[name]
		if name == "" || !ok {
			continue
		}
		a.Watcher, a.Deaf, a.Capped, a.Undelivered = h.Watcher, h.Deaf, h.Capped(), h.Undelivered
		a.NoIdentity = a.Persona == "" && a.PID > 0 && name == a.Short && h.Watcher == "never" && h.Undelivered > 0
	}
}

// threadState resolves one live thread into what the board needs, including
// which of its participants cannot be reached. The reasons are the
// `blocker` words of frontend/src/lib/health.ts; change both together.
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
		case h.Capped():
			ts.BlockedOn = append(ts.BlockedOn, model.Blocker{Seat: p, Reason: "capped, mail waits for its next prompt"})
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
	if p := config.Expand(s.cfg.CannedHealth); p != "" {
		return cannedHealth(p, cell.Project)
	}
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

// cannedHealth reads one project's health from the canned file the config's
// canned_health names, in place of the discuss API (spec A3: deaf and capped
// cannot be made on demand, so the fixture carries them). Read on every call,
// like the API, so an edit to the file shows on the next sample.
func cannedHealth(path, project string) (discuss.Snapshot, string) {
	b, err := os.ReadFile(path)
	if err != nil {
		return discuss.Snapshot{}, "canned health: " + err.Error()
	}
	var doc map[string]struct {
		Agents  []discuss.AgentHealth `json:"agents"`
		Threads []discuss.Thread      `json:"threads"`
	}
	if err := json.Unmarshal(b, &doc); err != nil {
		return discuss.Snapshot{}, "canned health: " + err.Error()
	}
	p, ok := doc[project]
	if !ok {
		return discuss.Snapshot{}, fmt.Sprintf("canned health: no project %q in %s", project, path)
	}
	snap := discuss.Snapshot{Agents: make(map[string]discuss.AgentHealth, len(p.Agents)), Threads: p.Threads}
	for _, h := range p.Agents {
		snap.Agents[h.Agent] = h
	}
	return snap, ""
}

// personaFile is where a seat's persona lives: agents/<seat>.md at the
// initiative root, the file the opening prompt tells the seat to read.
func personaFile(root, seat string) string {
	return filepath.Join(root, "agents", seat+".md")
}

func hasPersonaFile(root, seat string) bool {
	fi, err := os.Stat(personaFile(root, seat))
	return err == nil && !fi.IsDir()
}

// missingPersonas refuses a cell with a seat that has no persona file, naming
// every missing file, not the first: a seat launched without one opens empty
// (discovery-in-a-cell FR-2).
func missingPersonas(root string, cell *model.Cell) error {
	var missing []string
	for _, seat := range cell.Agents {
		if !hasPersonaFile(root, seat) {
			missing = append(missing, personaFile(root, seat))
		}
	}
	if len(missing) == 0 {
		return nil
	}
	return fmt.Errorf("%s: %d of %d seats have no persona file; write each before bringing the crew up:\n  %s",
		cell.Project, len(missing), len(cell.Agents), strings.Join(missing, "\n  "))
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
	// Nothing launches from a draft: the roster waits on its accept record
	// (discovery-in-a-cell FR-3f).
	if si.Cell.Draft {
		return nil, draftRefusal(si)
	}
	// Every seat's persona file, before anything else is looked up or
	// created: a seat without one would open on an empty role.
	if err := missingPersonas(si.Path, si.Cell); err != nil {
		return nil, err
	}
	if _, err := os.Stat(probeBin()); err != nil {
		return nil, fmt.Errorf("probe not found at %s", probeBin())
	}
	api, err := discussAPIBin()
	if err != nil {
		return nil, err
	}
	// Every seat's session name is resolved before anything is created: a
	// name zellij will refuse is a refusal here, not a pane that never comes
	// up. The family is the cell's project, so the wrapper probe builds is
	// the one the names belong to.
	sessions := make([]string, len(si.Cell.Agents))
	for i, seat := range si.Cell.Agents {
		sess, err := crewSession(si.Cell, seat)
		if err != nil {
			return nil, err
		}
		sessions[i] = sess
	}
	family := sanitize(si.Cell.Project)
	if out, err := exec.Command(probeBin(), "--wrap", family).CombinedOutput(); err != nil {
		return nil, fmt.Errorf("probe --wrap: %s", strings.TrimSpace(string(out)))
	}
	wrapper := filepath.Join(filepath.Dir(probeBin()), family+"-probe")
	dir := crewDir(initiativeID)
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return nil, err
	}

	var cmds []string
	for i, seat := range si.Cell.Agents {
		// Preflight: the identity must already hold a token, or the pane would
		// open on an error. The bootstrap issues tokens; this never does.
		if out, err := exec.Command(api, "token", "env", si.Cell.Project, seat).CombinedOutput(); err != nil {
			return nil, fmt.Errorf("%s/%s has no discuss token (%s); run ~/agent-slack/ops/bootstrap.sh %s first",
				si.Cell.Project, seat, strings.TrimSpace(string(out)), si.Cell.Project)
		}
		prelude := preludeFor(api, *si.Cell, seat, sessions[i], s.Config().CrewModel)
		preludePath := filepath.Join(dir, seat+".sh")
		promptPath := filepath.Join(dir, seat+".md")
		if err := os.WriteFile(preludePath, []byte(prelude), 0o600); err != nil {
			return nil, err
		}
		if err := os.WriteFile(promptPath, []byte(prompt.Persona(*si.Cell, seat, si.Path)), 0o600); err != nil {
			return nil, err
		}
		// probe prepends the family, so it is handed the short name: the
		// session it opens is exactly sessions[i].
		cmds = append(cmds, launchLine(preludePath, promptPath, wrapper, sanitize(seatShort(seat)), si.Path))
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
// starts: the discuss identity, fetched at launch so no token is stored, the
// session name, and the model. ANTHROPIC_MODEL outranks the settings file, so
// a crew runs on the crew model whatever the machine's default is.
//
// AGENT_SESSION is exported here as well as by probe, and with the same name
// the pane was launched under: it is what the process scan reads to join a
// seat to what runs for it, so the launch and the join cannot drift.
func preludeFor(api string, cell model.Cell, seat, session, crewModel string) string {
	m := cell.Model
	if m == "" {
		m = crewModel
	}
	if m == "" {
		m = "opus"
	}
	hook := filepath.Join(filepath.Dir(api), "discuss-hook")
	return fmt.Sprintf("# discuss identity of %s/%s, sourced by the probe pane before the agent starts\nexport $(%s token env %s %s | sed 's/ claude$//')\nexport AGENT_SESSION=%s\nexport ANTHROPIC_MODEL=%s\n"+
		"# the external watcher: lives as long as this pane, wakes the seat by typing into it when mail\n"+
		"# arrives, and takes the lock first so the Stop hook's watcher yields. Nothing to re-arm.\n"+
		"%s watch --external --parent $$ >/dev/null 2>&1 &\n",
		cell.Project, seat, shellQuote(api), shellQuote(cell.Project), shellQuote(seat), shellQuote(session), shellQuote(m), shellQuote(hook))
}

// Retirable is the seats of a cell that a wave is done with: not the human
// or the reconciler, named by no open card, and with no working session.
// Idle and off both count as done; a seat mid-task is never retirable.
func Retirable(si *model.ScannedInitiative) []string {
	if si.Cell == nil {
		return nil
	}
	busy := map[string]bool{}
	for _, c := range si.Cards {
		if c.Seat != "" && !c.Archived && c.Status != model.StatusDone {
			busy[c.Seat] = true
		}
	}
	for _, a := range si.Agents {
		if a.State == model.AgentWorking {
			if a.Persona != "" {
				busy[a.Persona] = true
			}
			for _, seat := range si.Cell.Agents {
				if sess, err := crewSession(si.Cell, seat); err == nil && a.Session == sess {
					busy[seat] = true
				}
			}
		}
	}
	var out []string
	for _, seat := range si.Cell.Agents {
		if seat == si.Cell.Human || seat == si.Cell.Reconciler || busy[seat] {
			continue
		}
		out = append(out, seat)
	}
	return out
}
