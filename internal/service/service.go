// Package service is the one place that sequences scan, cache, sync and merge.
// The CLI and the desktop app both call it, so they cannot drift.
package service

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"organizer/internal/auth"
	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/discuss"
	"organizer/internal/keychain"
	"organizer/internal/lock"
	"organizer/internal/merge"
	"organizer/internal/model"
	"organizer/internal/prompt"
	"organizer/internal/scan"
	"organizer/internal/session"
	dsync "organizer/internal/sync"
)

type Service struct {
	mu        sync.Mutex
	cfg       config.Config
	state     cache.State
	now       func() time.Time
	prevCPU   map[int]float64
	prevAt    time.Time
	openersMu sync.Mutex
	openers   map[string]facts

	Auth *auth.Manager
	Lock *lock.Lock
	// unlocked is per process: true once the passcode was verified, or when
	// no passcode is set.
	unlocked bool
}

type SyncResult struct {
	Pushed   int       `json:"pushed"`
	Retired  int       `json:"retired"`
	Machines []string  `json:"machines"`
	PulledAt time.Time `json:"pulled_at"`
	Skipped  string    `json:"skipped,omitempty"`
}

// New loads config and cache. A missing config file is not an error.
func New() (*Service, error) {
	cfg, _, err := config.Load()
	if err != nil {
		return nil, err
	}
	st, err := cache.Load()
	if err != nil {
		// A corrupt cache is discarded, not fatal.
		st = cache.State{}
	}
	return NewWith(cfg, st, time.Now), nil
}

// NewWith is for tests and the CLI's injected clock.
func NewWith(cfg config.Config, st cache.State, now func() time.Time) *Service {
	kc := keychain.Default()
	s := &Service{cfg: cfg, state: st, now: now, Auth: auth.NewManager(cfg.FirebaseAPIKey, kc), Lock: lock.New(kc)}
	s.unlocked = !s.Lock.Enabled()
	return s
}

func (s *Service) Config() config.Config {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.cfg
}

func (s *Service) SaveConfig(cfg config.Config) error {
	if cfg.MaxDepth <= 0 {
		cfg.MaxDepth = 3
	}
	if strings.TrimSpace(cfg.Machine) == "" {
		return errors.New("machine name cannot be empty")
	}
	if err := config.Save(cfg); err != nil {
		return err
	}
	s.mu.Lock()
	s.cfg = cfg
	s.mu.Unlock()
	s.Auth.SetAPIKey(cfg.FirebaseAPIKey)
	return nil
}

// ---- session and lock ----

// LockState is what the gate renders.
type LockState struct {
	Enabled      bool `json:"enabled"`
	Unlocked     bool `json:"unlocked"`
	CooldownSecs int  `json:"cooldown_secs"`
	FailuresLeft int  `json:"failures_left"`
}

func (s *Service) LockState() LockState {
	st := s.Lock.Status()
	s.mu.Lock()
	defer s.mu.Unlock()
	if !st.Enabled {
		s.unlocked = true
	}
	return LockState{Enabled: st.Enabled, Unlocked: s.unlocked, CooldownSecs: st.CooldownSecs, FailuresLeft: st.FailuresLeft}
}

// Unlock verifies the passcode for this process.
func (s *Service) Unlock(passcode string) (LockState, error) {
	ok, err := s.Lock.Verify(passcode)
	if err != nil {
		return s.LockState(), err
	}
	if ok {
		s.mu.Lock()
		s.unlocked = true
		s.mu.Unlock()
	}
	return s.LockState(), nil
}

// RelockNow locks the running app without touching the passcode.
func (s *Service) RelockNow() LockState {
	s.mu.Lock()
	if s.Lock.Enabled() {
		s.unlocked = false
	}
	s.mu.Unlock()
	return s.LockState()
}

// SetPasscode sets or changes the passcode. Changing requires the current one
// unless the caller is a fresh cloud sign-in (force).
func (s *Service) SetPasscode(current, next string, force bool) (LockState, error) {
	if s.Lock.Enabled() && !force {
		ok, err := s.Lock.Verify(current)
		if err != nil {
			return s.LockState(), err
		}
		if !ok {
			return s.LockState(), errors.New("current passcode is wrong")
		}
	}
	if err := s.Lock.Set(next); err != nil {
		return s.LockState(), err
	}
	s.mu.Lock()
	s.unlocked = true
	s.mu.Unlock()
	return s.LockState(), nil
}

// ClearPasscode removes the lock; needs the current passcode.
func (s *Service) ClearPasscode(current string) (LockState, error) {
	if s.Lock.Enabled() {
		ok, err := s.Lock.Verify(current)
		if err != nil {
			return s.LockState(), err
		}
		if !ok {
			return s.LockState(), errors.New("current passcode is wrong")
		}
	}
	if err := s.Lock.Clear(); err != nil {
		return s.LockState(), err
	}
	s.mu.Lock()
	s.unlocked = true
	s.mu.Unlock()
	return s.LockState(), nil
}

// SignIn to the cloud; a successful sign-in also unlocks this process, which
// is the recovery path for a forgotten passcode.
func (s *Service) SignIn(ctx context.Context, email, password string) (auth.Account, error) {
	acc, err := s.Auth.SignIn(ctx, email, password)
	if err == nil {
		s.mu.Lock()
		s.unlocked = true
		s.mu.Unlock()
	}
	return acc, err
}

func (s *Service) SignUp(ctx context.Context, email, password string) (auth.Account, error) {
	acc, err := s.Auth.SignUp(ctx, email, password)
	if err == nil {
		s.mu.Lock()
		s.unlocked = true
		s.mu.Unlock()
	}
	return acc, err
}

func (s *Service) scanOptions(git bool) scan.Options {
	return scan.Options{
		Roots:      s.cfg.ExpandedRoots(),
		MaxDepth:   s.cfg.MaxDepth,
		IgnoreDirs: s.cfg.IgnoreDirs,
		Git:        git,
		GitTimeout: time.Duration(s.cfg.GitTimeoutSeconds) * time.Second,
		Now:        s.now,
		Agents:     s.agentOptions(),
	}
}

func (s *Service) agentOptions() *scan.AgentOptions {
	return &scan.AgentOptions{
		ProbeStateDir: config.Expand(s.cfg.ProbeStateDir),
		Zellij:        s.cfg.Zellij,
		AgentBinary:   s.cfg.AgentBinary,
		SessionsDir:   session.Dir(),
		Timeout:       time.Duration(s.cfg.GitTimeoutSeconds) * time.Second,
		PrevCPU:       s.prevCPU,
		PrevAt:        s.prevAt,
	}
}

// rememberCPU stores this sample's CPU seconds so the next one can tell
// working from idle.
func (s *Service) rememberCPU(snap model.Snapshot) {
	m := map[int]float64{}
	for _, si := range snap.Initiatives {
		for _, a := range si.Agents {
			if a.PID > 0 {
				m[a.PID] = a.CPUSeconds
			}
		}
	}
	for _, a := range snap.Unassigned {
		if a.PID > 0 {
			m[a.PID] = a.CPUSeconds
		}
	}
	s.prevCPU = m
	s.prevAt = time.Now()
}

// ---- agent lifecycle: through probe, so layouts, markers and iTerm profiles stay in step ----

var nameRe = regexp.MustCompile(`^[a-z0-9][a-z0-9-]{0,40}$`)

func probeBin() string {
	home, _ := os.UserHomeDir()
	return filepath.Join(home, "bin", "probe")
}

func sanitize(s string) string {
	s = strings.ToLower(s)
	s = regexp.MustCompile(`[^a-z0-9]+`).ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}

// CreateAgent starts a new probe in the initiative directory, in the family
// named after the initiative. An empty name lets probe pick an animal name.
// Opens iTerm2 (Terminal as fallback) so the session is visible immediately.
func (s *Service) CreateAgent(initiativeID, name string) error {
	var dir string
	s.mu.Lock()
	for _, si := range s.state.Local.Initiatives {
		if si.ID == initiativeID {
			dir = si.Path
		}
	}
	s.mu.Unlock()
	if dir == "" {
		return fmt.Errorf("initiative %q not found on this machine", initiativeID)
	}
	if _, err := os.Stat(probeBin()); err != nil {
		return fmt.Errorf("probe not found at %s", probeBin())
	}
	family := sanitize(initiativeID)
	name = sanitize(name)
	if name != "" && !nameRe.MatchString(name) {
		return errors.New("name must be lowercase letters, digits and dashes")
	}
	// Idempotent: creates ~/bin/<family>-probe if missing.
	if out, err := exec.Command(probeBin(), "--wrap", family).CombinedOutput(); err != nil {
		return fmt.Errorf("probe --wrap: %s", strings.TrimSpace(string(out)))
	}
	wrapper := filepath.Join(filepath.Dir(probeBin()), family+"-probe")
	var cmd string
	if name == "" {
		cmd = fmt.Sprintf("cd %s && %s -t", shellQuote(dir), shellQuote(wrapper))
	} else {
		cmd = fmt.Sprintf("%s %s %s", shellQuote(wrapper), shellQuote(name), shellQuote(dir))
	}
	return openInTerminal(cmd)
}

// KillAgent removes a probe session: zellij session, layout, marker, iTerm
// profile. The claude conversation itself survives and can be resumed by name.
func (s *Service) KillAgent(session string) error {
	if !nameRe.MatchString(session) {
		return errors.New("invalid session name")
	}
	out, err := exec.Command(probeBin(), "-k", session).CombinedOutput()
	if err != nil {
		return fmt.Errorf("probe -k: %s", strings.TrimSpace(string(out)))
	}
	return nil
}

// StopAgent sends SIGTERM to a plain-terminal agent process, after checking
// the pid still runs the agent binary.
func (s *Service) StopAgent(pid int) error {
	if pid <= 1 {
		return errors.New("invalid pid")
	}
	out, err := exec.Command("ps", "-o", "command=", "-p", strconv.Itoa(pid)).Output()
	if err != nil {
		return fmt.Errorf("pid %d is not running", pid)
	}
	bin := s.Config().AgentBinary
	if bin == "" {
		bin = "claude"
	}
	first := strings.Fields(string(out))
	if len(first) == 0 || filepath.Base(first[0]) != bin {
		return fmt.Errorf("pid %d is not a %s process anymore", pid, bin)
	}
	return syscall.Kill(pid, syscall.SIGTERM)
}

// openInTerminal runs a shell command in a new iTerm2 window, or Terminal.
func openInTerminal(cmd string) error {
	if runtime.GOOS != "darwin" {
		return exec.Command("x-terminal-emulator", "-e", "bash", "-lc", cmd+"; exec bash").Start()
	}
	script := fmt.Sprintf(`tell application "iTerm2"
	activate
	set w to (create window with default profile)
	tell current session of w to write text %s
end tell`, appleScriptString(cmd))
	if err := exec.Command("osascript", "-e", script).Run(); err == nil {
		return nil
	}
	script = fmt.Sprintf(`tell application "Terminal"
	activate
	do script %s
end tell`, appleScriptString(cmd))
	return exec.Command("osascript", "-e", script).Start()
}

// AgentGroup is the agents of one initiative, for the Agents view.
type AgentGroup struct {
	ID      string        `json:"id"`
	Title   string        `json:"title"`
	Client  string        `json:"client"`
	Path    string        `json:"path"`
	Agents  []model.Agent `json:"agents"`
	Live    int           `json:"live"`
	Working int           `json:"working"`
	// Cell and Crew exist when the initiative has an agents/cell.json:
	// one Seat per roster entry. Discuss says why health is missing, if it is.
	Cell    *model.Cell `json:"cell"`
	Crew    []Seat      `json:"crew"`
	Discuss string      `json:"discuss"`
	// Waiting is the open cards held up by an undecided thread. Read it with
	// Crew: a card waiting on a thread whose seats are not running is work
	// nobody is going to unblock.
	Waiting []CardWait `json:"waiting"`
	// The mailbox, on the same feed as the processes: an agent is something
	// that runs and something that talks, and the view shows both in one
	// place. Threads is the live list; Human is the seat the app reads and
	// posts as; CanPost says it holds a token. NeedsMe counts threads that
	// are escalated, stalled or undecided.
	Project string       `json:"project"`
	Human   string       `json:"human"`
	CanPost bool         `json:"can_post"`
	Threads []CellThread `json:"threads"`
	NeedsMe int          `json:"needs_me"`
	// NeedsReconciler counts stalled or undecided threads: the reconciler's
	// backlog, shown so the human can see it without owning it.
	NeedsReconciler int `json:"needs_reconciler"`
	// Retirable is the seats a wave is done with; see Retirable().
	Retirable []string `json:"retirable"`
}

type AgentsView struct {
	Groups     []AgentGroup  `json:"groups"`
	Unassigned []model.Agent `json:"unassigned"`
	SampledAt  time.Time     `json:"sampled_at"`
}

// RefreshAgents re-samples processes and sessions only (no git, no card
// parsing), regroups them onto the cached local snapshot, and returns the view.
func (s *Service) RefreshAgents() AgentsView {
	s.mu.Lock()
	defer s.mu.Unlock()
	agents := scan.Agents(*s.agentOptions())
	s.state.Local.Unassigned = scan.AssignAgents(s.state.Local.Initiatives, agents)
	s.rememberCPU(s.state.Local)
	_ = cache.Save(s.state)
	return s.agentsViewLocked()
}

func (s *Service) agentsViewLocked() AgentsView {
	v := AgentsView{SampledAt: s.now(), Unassigned: s.state.Local.Unassigned}
	for i := range s.state.Local.Initiatives {
		si := &s.state.Local.Initiatives[i]
		g := AgentGroup{ID: si.ID, Title: si.Title, Client: si.Client, Path: si.Path}
		if si.Cell != nil {
			snap, why := s.cellHealth(si.Cell)
			g.Cell, g.Crew, g.Discuss = si.Cell, buildCrew(si, snap), why
			g.Waiting = cardsWaiting(si, snap)
			g.Project, g.Human = si.Cell.Project, si.Cell.Human
			g.Threads, g.NeedsMe = s.liveThreads(s.cfg, si, snap)
			g.Retirable = Retirable(si)
			for _, t := range snap.Threads {
				if t.Kind != "journal" && needsReconciler(t) {
					g.NeedsReconciler++
				}
			}
			if si.Cell.Human != "" {
				_, err := discuss.Token(discussStateDir(s.cfg), si.Cell.Project, si.Cell.Human)
				g.CanPost = err == nil
			}
		}
		g.Agents = si.Agents
		g.Live, g.Working = si.LiveAgents()
		v.Groups = append(v.Groups, g)
	}
	return v
}

// AttachSession opens the session in iTerm2 through the dynamic profile that
// probe generates (profile name == session name). Falls back to Terminal
// running `probe <name>`.
func (s *Service) AttachSession(name string) error {
	if strings.ContainsAny(name, "\"'\\\n") {
		return errors.New("invalid session name")
	}
	if runtime.GOOS == "darwin" {
		script := fmt.Sprintf(`tell application "iTerm2"
	activate
	create window with profile "%s"
end tell`, name)
		if err := exec.Command("osascript", "-e", script).Run(); err == nil {
			return nil
		}
		home, _ := os.UserHomeDir()
		cmd := fmt.Sprintf("%s %s", shellQuote(filepath.Join(home, "bin", "probe")), shellQuote(name))
		script = fmt.Sprintf(`tell application "Terminal"
	activate
	do script %s
end tell`, appleScriptString(cmd))
		return exec.Command("osascript", "-e", script).Start()
	}
	return exec.Command("x-terminal-emulator", "-e", "bash", "-lc", "probe "+shellQuote(name)).Start()
}

// Scan reads the local disk and refreshes the cached local snapshot.
func (s *Service) Scan(git bool) model.Snapshot {
	s.mu.Lock()
	defer s.mu.Unlock()
	snap := scan.Run(s.scanOptions(git))
	snap.Machine = s.cfg.Machine
	s.state.Local = snap
	s.rememberCPU(snap)
	_ = cache.Save(s.state)
	return snap
}

// Board rescans locally and merges with the last remote pull.
func (s *Service) Board() merge.Board {
	local := s.Scan(true)
	s.mu.Lock()
	defer s.mu.Unlock()
	b := merge.Build(local, s.state.Remote, s.state.Order, s.now())
	s.stampThreadsLocked(&b)
	return b
}

// stampThreadsLocked resolves each local card's named discuss threads against
// the live cell.
//
// It runs on the merged board and never on the scanned snapshot on purpose:
// cell liveness comes from a discuss instance on this machine and is stale the
// moment it is written, so it must not reach the cache or the Firestore sync,
// where another machine would read it as fact.
func (s *Service) stampThreadsLocked(b *merge.Board) {
	snaps := make(map[string]discuss.Snapshot)
	for i := range s.state.Local.Initiatives {
		si := &s.state.Local.Initiatives[i]
		if si.Cell == nil {
			continue
		}
		if snap, why := s.cellHealth(si.Cell); why == "" {
			snaps[si.ID] = snap
		}
	}
	if len(snaps) == 0 {
		return
	}
	for _, cards := range b.Columns {
		for i := range cards {
			c := &cards[i]
			if !c.Local || len(c.Threads) == 0 {
				continue
			}
			if snap, ok := snaps[c.InitiativeID]; ok {
				c.ThreadState = threadStates(c.Threads, snap)
			}
		}
	}
}

// Status is the CLI view: the local scan sorted by the manual order.
func (s *Service) Status(git bool) model.Snapshot {
	snap := s.Scan(git)
	s.mu.Lock()
	defer s.mu.Unlock()
	merge.ApplyOrder(&snap, s.state.Order)
	return snap
}

// Order returns the current manual order.
func (s *Service) Order() model.Order {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.state.Order
}

// SetInitiativeOrder replaces the initiative ranking; groups follow it.
func (s *Service) SetInitiativeOrder(ids []string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.state.Order.Reprioritize(ids)
	s.state.Order.UpdatedAt = s.now()
	return cache.Save(s.state)
}

// noteAuthor is who a comment is signed by: the account email when signed
// in, else the machine name.
func (s *Service) noteAuthor() string {
	if acc := s.Auth.Account(); acc.SignedIn && acc.Email != "" {
		return acc.Email
	}
	return s.cfg.Machine
}

// AddNote appends a comment to a card. Returns the note as stored.
func (s *Service) AddNote(initiativeID, slug, text string) (model.Note, error) {
	text = strings.TrimSpace(text)
	if text == "" {
		return model.Note{}, errors.New("a comment needs text")
	}
	by := s.noteAuthor()
	s.mu.Lock()
	defer s.mu.Unlock()
	key := initiativeID + "/" + slug
	if s.state.Order.Notes == nil {
		s.state.Order.Notes = map[string][]model.Note{}
	}
	now := s.now()
	n := model.Note{ID: now.UTC().Format("20060102T150405.000000000Z"), By: by, At: now, Text: text}
	s.state.Order.Notes[key] = append(s.state.Order.Notes[key], n)
	s.state.Order.UpdatedAt = now
	return n, cache.Save(s.state)
}

// EditNote rewrites one comment's text; empty text deletes it.
func (s *Service) EditNote(initiativeID, slug, id, text string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	key := initiativeID + "/" + slug
	list := s.state.Order.Notes[key]
	out := list[:0]
	found := false
	for _, n := range list {
		if n.ID == id {
			found = true
			if strings.TrimSpace(text) == "" {
				continue
			}
			n.Text = strings.TrimSpace(text)
		}
		out = append(out, n)
	}
	if !found {
		return errors.New("no such comment")
	}
	if len(out) == 0 {
		delete(s.state.Order.Notes, key)
	} else {
		s.state.Order.Notes[key] = out
	}
	s.state.Order.UpdatedAt = s.now()
	return cache.Save(s.state)
}

// SetResolved marks or unmarks an item of the human's queue as solved.
func (s *Service) SetResolved(key string, resolved bool) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.state.Order.Resolved == nil {
		s.state.Order.Resolved = map[string]string{}
	}
	if resolved {
		s.state.Order.Resolved[key] = s.now().Format("2006-01-02")
	} else {
		delete(s.state.Order.Resolved, key)
	}
	s.state.Order.UpdatedAt = s.now()
	return cache.Save(s.state)
}

// SetGroups replaces the rail groups and derives the ranking from them. An
// empty list returns the rail to a flat priority list.
func (s *Service) SetGroups(groups []model.Group) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.state.Order.Regroup(groups)
	s.state.Order.UpdatedAt = s.now()
	return cache.Save(s.state)
}

// SetCardOrder replaces the card ranking of one initiative.
func (s *Service) SetCardOrder(initiativeID string, slugs []string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.state.Order.Cards == nil {
		s.state.Order.Cards = map[string][]string{}
	}
	s.state.Order.Cards[initiativeID] = slugs
	s.state.Order.UpdatedAt = s.now()
	return cache.Save(s.state)
}

// PulledAt is when remote snapshots were last fetched; zero if never.
func (s *Service) PulledAt() time.Time {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.state.PulledAt
}

// ErrNotSignedIn: sync was skipped because there is no cloud session.
var ErrNotSignedIn = errors.New("not signed in")

// Sync scans, pushes this machine, pulls all machines, saves the cache.
// Signed out is a skip, not a failure: the cached remote stays visible.
func (s *Service) Sync(ctx context.Context, push, pull bool) (SyncResult, error) {
	cfg := s.Config()
	if cfg.GCPProject == "" {
		return SyncResult{Skipped: "gcp_project is not set in the config"}, nil
	}
	if !s.Auth.Account().SignedIn {
		return SyncResult{Skipped: "not signed in"}, ErrNotSignedIn
	}
	store, err := dsync.Open(cfg.GCPProject, cfg.FirestoreDatabase, s.Auth)
	if err != nil {
		return SyncResult{}, err
	}
	defer store.Close()

	local := s.Scan(true)
	var res SyncResult
	if push {
		res.Pushed, res.Retired, err = store.Push(ctx, local)
		if errors.Is(err, auth.ErrSignedOut) {
			return SyncResult{Skipped: "session expired, sign in again"}, ErrNotSignedIn
		}
		if err != nil {
			return res, fmt.Errorf("push: %w", err)
		}
		if err := store.PushOrder(ctx, s.Order()); err != nil {
			return res, fmt.Errorf("push order: %w", err)
		}
		s.mu.Lock()
		s.state.PushedAt = s.now()
		s.mu.Unlock()
	}
	if pull {
		remote, err := store.Pull(ctx)
		if err != nil {
			return res, fmt.Errorf("pull: %w", err)
		}
		remoteOrder, err := store.PullOrder(ctx)
		if err != nil {
			return res, fmt.Errorf("pull order: %w", err)
		}
		s.mu.Lock()
		if remoteOrder.UpdatedAt.After(s.state.Order.UpdatedAt) {
			s.state.Order = remoteOrder
		}
		s.state.Remote = remote
		s.state.PulledAt = s.now()
		res.PulledAt = s.state.PulledAt
		s.mu.Unlock()
		for _, r := range remote {
			res.Machines = append(res.Machines, r.Machine)
		}
	}
	s.mu.Lock()
	err = cache.Save(s.state)
	s.mu.Unlock()
	return res, err
}

// OpenInEditor launches the configured editor on a path.
func (s *Service) OpenInEditor(path string) error {
	editor := s.Config().Editor
	if editor == "" {
		editor = "code"
	}
	parts := strings.Fields(editor)
	return exec.Command(parts[0], append(parts[1:], path)...).Start()
}

// OpenTerminal opens a terminal at a directory.
func (s *Service) OpenTerminal(dir string) error {
	switch runtime.GOOS {
	case "darwin":
		return exec.Command("open", "-a", "Terminal", dir).Start()
	default:
		return exec.Command("x-terminal-emulator", "--working-directory="+dir).Start()
	}
}

// Reveal shows a path in the file manager.
func (s *Service) Reveal(path string) error {
	switch runtime.GOOS {
	case "darwin":
		return exec.Command("open", "-R", path).Start()
	default:
		return exec.Command("xdg-open", path).Start()
	}
}

// ReviewPrompt renders the agent prompt for one initiative from a fresh scan.
func (s *Service) ReviewPrompt(initiativeID string) (string, error) {
	snap := s.Scan(true)
	for _, si := range snap.Initiatives {
		if si.ID == initiativeID {
			return prompt.Review(si, s.now()), nil
		}
	}
	return "", fmt.Errorf("initiative %q not found on this machine", initiativeID)
}

// promptPath is where a generated prompt is kept for the terminal to read.
func promptPath(initiativeID string) string {
	base := os.Getenv("XDG_DATA_HOME")
	if base == "" {
		home, _ := os.UserHomeDir()
		base = filepath.Join(home, ".local", "share")
	}
	return filepath.Join(base, "organizer", "prompts", initiativeID+".md")
}

// RunReview writes the prompt to a file and opens a terminal in the
// initiative directory running the agent with it. The agent command is
// configurable; the default is claude.
func (s *Service) RunReview(initiativeID string) error {
	text, err := s.ReviewPrompt(initiativeID)
	if err != nil {
		return err
	}
	var dir string
	for _, si := range s.state.Local.Initiatives {
		if si.ID == initiativeID {
			dir = si.Path
		}
	}
	p := promptPath(initiativeID)
	if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(p, []byte(text), 0o600); err != nil {
		return err
	}
	agent := s.Config().Agent
	if agent == "" {
		agent = "claude"
	}
	// The prompt goes through a file so no quoting of its content is needed.
	cmd := fmt.Sprintf("cd %s && %s \"$(cat %s)\"", shellQuote(dir), agent, shellQuote(p))
	switch runtime.GOOS {
	case "darwin":
		script := fmt.Sprintf(`tell application "Terminal"
	activate
	do script %s
end tell`, appleScriptString(cmd))
		return exec.Command("osascript", "-e", script).Start()
	default:
		return exec.Command("x-terminal-emulator", "-e", "bash", "-lc", cmd+"; exec bash").Start()
	}
}

func shellQuote(s string) string { return "'" + strings.ReplaceAll(s, "'", `'\''`) + "'" }

func appleScriptString(s string) string {
	s = strings.ReplaceAll(s, `\`, `\\`)
	s = strings.ReplaceAll(s, `"`, `\"`)
	return `"` + s + `"`
}
