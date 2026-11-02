package service

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"organizer/internal/model"
	"organizer/internal/scan"
	"organizer/internal/session"
	"organizer/internal/usage"
)

// launchLine is the one shape a probe is started with: the prelude the pane
// sources, the prompt sent on the first run only, and the family wrapper with
// a session name and a directory. Crew seats and card builders share it so
// there is one place to change when probe's contract moves.
func launchLine(preludePath, promptPath, wrapper, name, dir string) string {
	return fmt.Sprintf("PROBE_PRELUDE_FILE=%s PROBE_PROMPT_FILE=%s %s %s %s",
		shellQuote(preludePath), shellQuote(promptPath), shellQuote(wrapper),
		shellQuote(name), shellQuote(dir))
}

// NotLaunchable is the refusal: a card that does not carry the delegation
// contract cannot be handed to a builder. It names the fields, because the
// fix is to write them on the card and try again.
type NotLaunchable struct {
	Initiative string
	Slug       string
	Missing    []string
	Path       string
}

func (e *NotLaunchable) Error() string {
	return fmt.Sprintf("card %s/%s cannot be launched: no %s\nwrite the missing fields in %s (working-on skill, Build fields), then run again",
		e.Initiative, e.Slug, strings.Join(e.Missing, ", "), e.Path)
}

// Launch is one card ready to be handed to a builder.
type Launch struct {
	Initiative string `json:"initiative"`
	Slug       string `json:"slug"`
	Session    string `json:"session"`
	Dir        string `json:"dir"`
	Prelude    string `json:"prelude"`
	Prompt     string `json:"prompt"`
	// Spec is the reference the builder is launched against: the card's
	// first spec: entry when it names several (leftovers-53 FR-1a).
	Spec    string `json:"spec"`
	Command string `json:"command"`
	// Warnings are things that will bite at launch but are not refusals:
	// a session name probe will truncate, a prompt file nobody wrote yet.
	Warnings []string `json:"warnings"`
}

// cardPreludePath is the model prelude a builder starts with. The supervise
// skill keeps it beside the task prompts; builders run on opus by default.
func cardPreludePath() string {
	return filepath.Join(filepath.Dir(promptPath("x")), "opus.prelude.sh")
}

// cardPromptPath is where the supervisor's task prompt for a card lives:
// <initiative>-<slug>.md beside the review prompts.
func cardPromptPath(initiativeID, slug string) string {
	return promptPath(initiativeID + "-" + slug)
}

// launchDir is where the builder works. A card on a branch that has a
// worktree under the initiative root gets the worktree; otherwise the root.
// The convention is the supervise skill's: `.wt/<branch>` beside the repos.
func launchDir(root string, c model.Card) string {
	for _, cand := range worktreeCandidates(root, c) {
		if st, err := os.Stat(cand); err == nil && st.IsDir() {
			return cand
		}
	}
	return root
}

func worktreeCandidates(root string, c model.Card) []string {
	var out []string
	add := func(name string) {
		if name != "" {
			out = append(out, filepath.Join(root, ".wt", name))
		}
	}
	add(c.Branch)
	add(c.Slug)
	for _, repo := range c.Repos {
		add(repo + "-" + c.Slug)
	}
	return out
}

// PrepareLaunch resolves a card into the launch a builder is started with,
// or refuses. The refusal is the point: a card without a spec, a gate and a
// boundary is a note with a next action, and a builder handed one reports
// "done" by feel. Nothing is written and nothing is started here.
func (s *Service) PrepareLaunch(initiativeID, slug string) (Launch, error) {
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
		return Launch{}, fmt.Errorf("initiative %q not found on this machine", initiativeID)
	}
	var card *model.Card
	for i := range si.Cards {
		if si.Cards[i].Slug == slug {
			card = &si.Cards[i]
			break
		}
	}
	if card == nil {
		return Launch{}, fmt.Errorf("initiative %q has no card %q", initiativeID, slug)
	}
	if missing := card.MissingLaunchFields(); len(missing) > 0 {
		return Launch{}, &NotLaunchable{Initiative: initiativeID, Slug: slug, Missing: missing, Path: card.Path}
	}

	family := probeFamily(si)
	l := Launch{
		Initiative: initiativeID,
		Slug:       slug,
		Session:    sanitize(slug),
		Dir:        launchDir(si.Path, *card),
		Prelude:    cardPreludePath(),
		Prompt:     cardPromptPath(initiativeID, slug),
		Spec:       card.Spec,
	}
	l.Command = launchLine(l.Prelude, l.Prompt, probeWrapper(family), l.Session, l.Dir)

	// probe refuses a name over zellij's socket budget; say so rather than
	// launching something that will not come up.
	if err := sessionNameTooLong(family + "-probe-" + l.Session); err != nil {
		l.Warnings = append(l.Warnings, err.Error()+"; probe refuses it")
	}
	if _, err := os.Stat(l.Prompt); err != nil {
		l.Warnings = append(l.Warnings, "no task prompt at "+l.Prompt+" yet (supervise skill, step 2)")
	}
	if _, err := os.Stat(l.Prelude); err != nil {
		l.Warnings = append(l.Warnings, "no prelude at "+l.Prelude+" yet; the builder inherits the saved model")
	}
	return l, nil
}

// RunCard prepares the launch and runs it: the builder starts detached
// (launchProbe), no window opens. The prompt file must exist: starting a
// builder without one is the failure the gate is for. Only the CLI runs a
// card, so it waits: the start goes through the same queue as New agent, its
// states reach OnLaunch, and the error is the failed seat's.
func (s *Service) RunCard(initiativeID, slug string) (Launch, error) {
	l, err := s.PrepareLaunch(initiativeID, slug)
	if err != nil {
		return l, err
	}
	if _, err := os.Stat(l.Prompt); err != nil {
		return l, fmt.Errorf("no task prompt at %s; write it first (supervise skill, step 2) or use --print", l.Prompt)
	}
	if _, err := os.Stat(probeBin()); err != nil {
		return l, fmt.Errorf("probe not found at %s", probeBin())
	}
	// Idempotent: creates ~/bin/<family>-probe if missing, as New agent and
	// Bring crew up do; the launch line names that wrapper.
	var family string
	s.mu.Lock()
	for i := range s.state.Local.Initiatives {
		if si := &s.state.Local.Initiatives[i]; si.ID == initiativeID {
			family = probeFamily(si)
		}
	}
	s.mu.Unlock()
	if out, err := command(probeBin(), "--wrap", family).CombinedOutput(); err != nil {
		return l, fmt.Errorf("probe --wrap: %s", strings.TrimSpace(string(out)))
	}
	if err := s.queueLaunch(initiativeID, "card", []SeatLaunch{{Seat: l.Session, Session: family + "-probe-" + l.Session, Line: l.Command}}); err != nil {
		return l, err
	}
	return l, s.launchErr(initiativeID, l.Session)
}

// launchErr waits for the initiative's start and returns the named seat's
// failure as probe reported it, or nil when it runs.
func (s *Service) launchErr(initiativeID, seat string) error {
	got, ok := s.WaitLaunch(initiativeID)
	if !ok {
		return nil
	}
	for _, sl := range got.Seats {
		if sl.Seat == seat && sl.State == LaunchFailed {
			if sl.Exit > 0 {
				return &ProbeError{Exit: sl.Exit, Output: sl.Output}
			}
			return errors.New(sl.Reason)
		}
	}
	return nil
}

// ---- the productivity baseline: what each card's sessions cost ----

// runGrace matches the scan's: a record younger than this survives a pass in
// which its process was not seen, because the sample may predate it.
const runGrace = 2 * time.Minute

// cardRefs is every card on this machine, as the archiver needs to see them.
func (s *Service) cardRefs() []session.CardRef {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.cardRefsLocked()
}

// cardRefsLocked is cardRefs for a caller that already holds s.mu.
func (s *Service) cardRefsLocked() []session.CardRef {
	var out []session.CardRef
	for _, si := range s.state.Local.Initiatives {
		for _, c := range si.Cards {
			out = append(out, session.CardRef{
				Initiative: si.ID, Slug: c.Slug, Branch: c.Branch, Root: si.Path, Seat: c.Seat,
			})
		}
	}
	return out
}

// branchOf answers which branch a directory is on from the scan's repo
// states, so the archiver never has to shell out to git. The longest repo
// path that contains the directory wins.
func (s *Service) branchOf(cwd string) string {
	s.mu.Lock()
	repos := s.repoBranchesLocked()
	s.mu.Unlock()
	return branchIn(repos)(cwd)
}

// repoBranch is one scanned repo's path and branch, lifted out of the state
// so a matcher can run without the service lock.
type repoBranch struct{ Path, Branch string }

// repoBranchesLocked collects every scanned repo's path and branch; the
// caller holds s.mu.
func (s *Service) repoBranchesLocked() []repoBranch {
	var out []repoBranch
	for _, si := range s.state.Local.Initiatives {
		for _, r := range si.RepoStates {
			if p := filepath.Clean(r.Path); p != "" && r.Branch != "" {
				out = append(out, repoBranch{Path: p, Branch: r.Branch})
			}
		}
	}
	return out
}

// branchIn answers "which branch is this directory on" from a fixed list,
// longest repo path wins, HEAD read directly when no scanned repo contains
// the directory. Lock-free, so the scan can call it mid-sample.
func branchIn(repos []repoBranch) func(cwd string) string {
	return func(cwd string) string {
		cwd = filepath.Clean(cwd)
		best, branch := -1, ""
		for _, r := range repos {
			if (cwd == r.Path || strings.HasPrefix(cwd, r.Path+string(filepath.Separator))) && len(r.Path) > best {
				best, branch = len(r.Path), r.Branch
			}
		}
		if branch == "" {
			// An initiative whose root is itself the repo lists no repos, so
			// the scan has no branch for it. Read HEAD rather than shell out.
			branch = headBranch(cwd)
		}
		return branch
	}
}

// headBranch is the branch of the nearest git checkout at or above dir, read
// from .git/HEAD. Worktrees keep a `gitdir:` pointer file instead of a
// directory; both are handled. Empty for a detached HEAD or no checkout.
func headBranch(dir string) string {
	d := filepath.Clean(dir)
	for i := 0; i < 12; i++ {
		gitPath := filepath.Join(d, ".git")
		fi, err := os.Stat(gitPath)
		if err == nil {
			if !fi.IsDir() {
				b, err := os.ReadFile(gitPath)
				if err != nil {
					return ""
				}
				p := strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(string(b)), "gitdir:"))
				if !filepath.IsAbs(p) {
					p = filepath.Join(d, p)
				}
				gitPath = p
			}
			b, err := os.ReadFile(filepath.Join(gitPath, "HEAD"))
			if err != nil {
				return ""
			}
			ref := strings.TrimSpace(string(b))
			if !strings.HasPrefix(ref, "ref: refs/heads/") {
				return "" // detached: a sha names no card
			}
			return strings.TrimPrefix(ref, "ref: refs/heads/")
		}
		parent := filepath.Dir(d)
		if parent == d {
			return ""
		}
		d = parent
	}
	return ""
}

// ArchiveRuns folds the statusline records into runs.jsonl and deletes the
// ones whose process is gone. It has to run before anything prunes those
// records: they are the only place the context fill and the bill of a
// finished session exist. Returns how many runs were closed.
func (s *Service) ArchiveRuns() (int, error) { return s.archiveRuns(runGrace) }

// archiveRuns is ArchiveRuns with the grace chosen by the caller: retire
// passes zero, because it has just killed the sessions it is archiving.
func (s *Service) archiveRuns(grace time.Duration) (int, error) {
	s.mu.Lock()
	opts := *s.agentOptions()
	s.mu.Unlock()
	agents := scan.Agents(opts)
	alive := map[int]bool{}
	for _, a := range agents {
		if a.PID > 0 {
			alive[a.PID] = true
		}
	}
	return session.Retire(session.Dir(), session.RunsPath(), alive, grace, s.now(), opts.Cards, opts.BranchOf)
}

// Runs is the archive, one row per conversation (a resumed seat is one run,
// its processes' costs summed), newest last-seen first, optionally one
// initiative only. It archives first, so a session that just ended is
// already in the table.
func (s *Service) Runs(initiativeID string) []session.Run {
	if _, err := s.ArchiveRuns(); err != nil {
		// A broken archive must not hide the history already written.
		_ = err
	}
	runs := session.Conversations(session.LoadRuns(session.RunsPath()))
	all := withAttribution(runs, s.ledgerTasks(runs))
	if initiativeID == "" {
		return all
	}
	out := make([]session.Run, 0, len(all))
	for _, r := range all {
		if r.Initiative == initiativeID {
			out = append(out, r)
		}
	}
	return out
}

// ---- FR-10: what the app reads, tokens only ----

// RunInfo is one run as the app sees it: session.Run without the bill.
// Decision 0020 keeps dollars in `organizer runs`, so there is no cost field
// here and none in the generated bindings — the app cannot show one by
// accident.
type RunInfo struct {
	SessionID string `json:"session_id"`
	// Session is the probe session name (AGENT_SESSION), empty for a plain
	// terminal; Persona and Cell are set for a crew seat.
	Session string `json:"session,omitempty"`
	Persona string `json:"persona,omitempty"`
	Cell    string `json:"cell,omitempty"`
	Cwd     string `json:"cwd"`
	Model   string `json:"model"`
	// The context window as of LastSeen.
	UsedPercent float64 `json:"used_percent"`
	InputTokens int     `json:"input_tokens"`
	WindowSize  int     `json:"window_size"`
	Initiative  string  `json:"initiative,omitempty"`
	Card        string  `json:"card,omitempty"`
	Branch      string  `json:"branch,omitempty"`

	FirstSeen time.Time `json:"first_seen"`
	LastSeen  time.Time `json:"last_seen"`
	// Ended is true once the process is gone and the numbers are final; Live
	// is its complement, read from a statusline record still on disk.
	Ended bool `json:"ended"`
	Live  bool `json:"live"`
}

// runInfo drops the bill and says whether the numbers can still move.
func runInfo(r session.Run, live bool) RunInfo {
	return RunInfo{
		SessionID: r.SessionID, Session: r.Session, Persona: r.Persona, Cell: r.Cell,
		Cwd: r.Cwd, Model: r.Model, UsedPercent: r.UsedPercent,
		InputTokens: r.InputTokens, WindowSize: r.WindowSize,
		Initiative: r.Initiative, Card: r.Card, Branch: r.Branch,
		FirstSeen: r.FirstSeen, LastSeen: r.LastSeen, Ended: r.Ended, Live: live,
	}
}

// CardRuns is one card's sessions and what they consumed. Card is empty for
// the runs no card claimed, which is honest: a directory two cards answer to
// leaves its run unattributed rather than charging the wrong one.
type CardRuns struct {
	Card        string    `json:"card"`
	InputTokens int       `json:"input_tokens"`
	Live        int       `json:"live"`
	Runs        []RunInfo `json:"runs"`
}

// RunsView is FR-10's answer for one initiative: its runs grouped by card,
// with the input tokens summed over the archive and the sessions still
// running, and a total for the initiative.
type RunsView struct {
	Initiative  string     `json:"initiative"`
	InputTokens int        `json:"input_tokens"`
	Cards       []CardRuns `json:"cards"`
}

// InitiativeRuns is what the app binds: one initiative's runs, tokens summed
// per card over the archive in runs.jsonl and the statusline records of the
// sessions still running. It does not archive — a read must not depend on a
// process sample, and `organizer runs`, the agent ticker and retire already
// keep runs.jsonl current — so a live session is read from its record, whose
// numbers are the fresh ones anyway.
func (s *Service) InitiativeRuns(initiativeID string) RunsView {
	archived, live := session.LoadRuns(session.RunsPath()), s.liveRuns()
	return runsView(initiativeID, archived, live, s.ledgerTasks(append(append([]session.Run(nil), archived...), live...)))
}

// ledgerTasks is the usage ledger's attribution per session (leftovers-56
// FR-5), attributed when read with the inputs and the rule a usage pass
// uses, so a run reads the same task whether `organizer usage` ran before
// it or not (leftovers-62 FR-1). A session the ledger has not seen and the
// archive gave no card is attributed by the same reader now (leftovers-68
// FR-3): a reviewer by its card's reviewer:, a supervisor by its accept
// record's supervisor:, both run from the root where no directory or seat:
// names a card. It writes nothing.
func (s *Service) ledgerTasks(runs []session.Run) map[string]usage.Attribution {
	ledger, offs := usage.DataPaths(filepath.Dir(session.Dir()))
	in := s.usageInputs()
	return usage.RunAttributions(usage.Options{LedgerPath: ledger, OffsetsPath: offs, Costs: in.costs, Initiatives: in.inits}, cardless(runs))
}

// cardless is the conversations none of whose processes the archive matched
// to a card, as the usage reader sees a session: what MatchRun found stands.
func cardless(runs []session.Run) []usage.RunSeen {
	claimed := map[string]bool{}
	for _, r := range runs {
		if r.Card != "" {
			claimed[r.SessionID] = true
		}
	}
	var out []usage.RunSeen
	seen := map[string]bool{}
	for _, r := range runs {
		if r.SessionID == "" || claimed[r.SessionID] || seen[r.SessionID] {
			continue
		}
		seen[r.SessionID] = true
		out = append(out, usage.RunSeen{SessionID: r.SessionID, Seen: usage.Seen{Cwd: r.Cwd, Session: r.Session, Persona: r.Persona}})
	}
	return out
}

// withAttribution names each run's initiative and card from the usage
// ledger, the one attribution (FR-5): its card is the ledger's task (a card
// slug, wave:<seat> or overhead:<role>), or `task <NNNN>` for a supervisor an
// accept record names (leftovers-68 FR-2, usage.Attribution.Label). A run
// neither the ledger nor the reader names keeps what MatchRun gave it. The
// archive itself is not rewritten (FR-4).
func withAttribution(runs []session.Run, tasks map[string]usage.Attribution) []session.Run {
	for i, r := range runs {
		a, ok := tasks[r.SessionID]
		if !ok || r.SessionID == "" {
			continue
		}
		if a.Label() != r.Card {
			runs[i].Branch = "" // MatchRun's branch belonged to its card
		}
		runs[i].Initiative, runs[i].Card = a.Initiative, a.Label()
	}
	return runs
}

// liveRuns is every statusline record on disk as a run, with the card matched
// the way the archiver matches it. A record exists only while its session
// does, so these are the runs whose numbers can still move.
func (s *Service) liveRuns() []session.Run {
	s.mu.Lock()
	cards := s.cardRefsLocked()
	branchOf := branchIn(s.repoBranchesLocked())
	s.mu.Unlock()
	records := session.Load(session.Dir())
	out := make([]session.Run, 0, len(records))
	for _, rec := range records {
		r := session.Run{
			PID: rec.PID, SessionID: rec.SessionID, Session: rec.Session,
			Persona: rec.Persona, Cell: rec.Cell, Cwd: rec.Cwd, Model: rec.Model,
			UsedPercent: rec.UsedPercent, InputTokens: rec.InputTokens,
			WindowSize: rec.WindowSize, CostUSD: rec.CostUSD,
			FirstSeen: rec.UpdatedAt, LastSeen: rec.UpdatedAt,
		}
		if c, ok := session.MatchRun(rec.Cwd, branchOf(rec.Cwd), rec.Session, cards); ok {
			r.Initiative, r.Card, r.Branch = c.Initiative, c.Slug, c.Branch
		}
		out = append(out, r)
	}
	return out
}

// runsView folds the archive and the live records into one view. A session
// appears in both — the archiver writes an open line the first time it sees
// one — so they are folded by the archive's key and the live record wins: its
// numbers are the newer ones, and the token sum must not count it twice.
func runsView(initiativeID string, archived, live []session.Run, tasks map[string]usage.Attribution) RunsView {
	view := RunsView{Initiative: initiativeID}
	byCard := map[string]*CardRuns{}
	for _, cr := range runConversations(initiativeID, archived, live, tasks) {
		r := runInfo(cr.Run, cr.Live)
		c, ok := byCard[r.Card]
		if !ok {
			c = &CardRuns{Card: r.Card}
			byCard[r.Card] = c
		}
		c.Runs = append(c.Runs, r)
		c.InputTokens += r.InputTokens
		if r.Live {
			c.Live++
		}
		view.InputTokens += r.InputTokens
	}
	for _, c := range byCard {
		sort.Slice(c.Runs, func(i, j int) bool { return laterRun(c.Runs[i], c.Runs[j]) })
		view.Cards = append(view.Cards, *c)
	}
	// Busiest first, by the card's most recent session, so what is running now
	// is at the top; the unattributed runs trail, they are nobody's work.
	sort.Slice(view.Cards, func(i, j int) bool {
		a, b := view.Cards[i], view.Cards[j]
		if (a.Card == "") != (b.Card == "") {
			return b.Card == ""
		}
		if len(a.Runs) > 0 && len(b.Runs) > 0 && !a.Runs[0].LastSeen.Equal(b.Runs[0].LastSeen) {
			return a.Runs[0].LastSeen.After(b.Runs[0].LastSeen)
		}
		return a.Card < b.Card
	})
	return view
}

// runConversations is the rows runsView draws: the archive with the live
// records over it by the archive's key, then folded into one row per
// conversation the way `organizer runs` folds (session.Conversations, which
// also sets the cost the app never sees), then one initiative's. The fold
// comes before the filter: a process that matched no card does not unclaim
// its conversation. Each row says whether one of its processes is live.
func runConversations(initiativeID string, archived, live []session.Run, tasks map[string]usage.Attribution) []convRun {
	byKey := make(map[string]session.Run, len(archived)+len(live))
	for _, r := range archived {
		byKey[r.Key()] = r
	}
	isLive := map[string]bool{}
	for _, r := range live {
		if prev, ok := byKey[r.Key()]; ok && prev.FirstSeen.Before(r.FirstSeen) {
			r.FirstSeen = prev.FirstSeen // the archive remembers when it started
		}
		byKey[r.Key()] = r
		isLive[r.Key()] = true
	}
	runs := make([]session.Run, 0, len(byKey))
	liveConv := map[string]bool{}
	for k, r := range byKey {
		runs = append(runs, r)
		if isLive[k] && r.SessionID != "" {
			liveConv[r.SessionID] = true
		}
	}
	var out []convRun
	for _, r := range withAttribution(session.Conversations(runs), tasks) {
		if initiativeID != "" && r.Initiative != initiativeID {
			continue
		}
		l := isLive[r.Key()] || (r.SessionID != "" && liveConv[r.SessionID])
		out = append(out, convRun{Run: r, Live: l})
	}
	return out
}

// convRun is one conversation and whether any of its processes still runs.
type convRun struct {
	session.Run
	Live bool
}

// laterRun orders runs newest last-seen first, the session id breaking a tie
// so the table never reshuffles between reads.
func laterRun(a, b RunInfo) bool {
	if !a.LastSeen.Equal(b.LastSeen) {
		return a.LastSeen.After(b.LastSeen)
	}
	return a.SessionID < b.SessionID
}

// usageInputs is what a ledger pass attributes and costs sessions with: the
// initiatives on disk (scanned without git) and every cost record, plus the
// sessions still running. Usage passes them to Ingest and the runs readers
// to Attributions, so both apply one rule to the same inputs (leftovers-62
// FR-1).
type usageInputs struct {
	inits   []usage.Initiative
	costs   []usage.CostSource
	running map[string]bool
}

func (s *Service) usageInputs() usageInputs {
	// scanOptions reads the state for its agent options; the runs readers
	// call this from the app's goroutines, so it is built under the lock.
	s.mu.Lock()
	opts := s.scanOptions(false)
	s.mu.Unlock()
	opts.Agents = nil
	roots, _ := scan.Discover(opts)
	in := usageInputs{inits: make([]usage.Initiative, 0, len(roots)), running: map[string]bool{}}
	for _, root := range roots {
		si := scan.ReadInitiative(root, opts)
		ui := usage.Initiative{ID: si.ID, Root: root}
		for _, c := range si.Cards {
			ui.Cards = append(ui.Cards, usage.Card{Slug: c.Slug, Title: c.Title, Seat: c.Seat, Body: c.Body})
		}
		if si.Cell != nil {
			ui.Seats = si.Cell.Agents
		}
		in.inits = append(in.inits, ui)
	}

	// A record that says $0 has not seen a cost yet (the statusline's open
	// line, a session killed before its first refresh): a session with
	// tokens never costs nothing, so it is "no cost recorded", not $0.
	for _, r := range session.LoadRuns(session.RunsPath()) {
		in.costs = append(in.costs, usage.CostSource{SessionID: r.SessionID, PID: r.PID, At: r.LastSeen, Session: r.Session, Persona: r.Persona, CostUSD: r.CostUSD, HasCost: r.CostUSD > 0})
	}
	for pid, r := range session.Load(session.Dir()) {
		in.costs = append(in.costs, usage.CostSource{SessionID: r.SessionID, PID: r.PID, At: r.UpdatedAt, Session: r.Session, Persona: r.Persona, CostUSD: r.CostUSD, HasCost: r.CostUSD > 0})
		if alive(pid) {
			in.running[r.SessionID] = true
		}
	}
	return in
}
