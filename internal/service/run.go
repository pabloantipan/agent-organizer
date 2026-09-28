package service

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"organizer/internal/model"
	"organizer/internal/scan"
	"organizer/internal/session"
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
	Command    string `json:"command"`
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

	family := sanitize(initiativeID)
	l := Launch{
		Initiative: initiativeID,
		Slug:       slug,
		Session:    sanitize(slug),
		Dir:        launchDir(si.Path, *card),
		Prelude:    cardPreludePath(),
		Prompt:     cardPromptPath(initiativeID, slug),
	}
	wrapper := filepath.Join(filepath.Dir(probeBin()), family+"-probe")
	l.Command = launchLine(l.Prelude, l.Prompt, wrapper, l.Session, l.Dir)

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

// RunCard prepares the launch and opens it in a terminal tab. The prompt file
// must exist: starting a builder without one is the failure the gate is for.
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
	return l, openInTerminalTabs([]string{l.Command})
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
				Initiative: si.ID, Slug: c.Slug, Branch: c.Branch, Root: si.Path,
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

// Runs is the archive, newest last-seen first, optionally one initiative
// only. It archives first, so a session that just ended is already in the
// table.
func (s *Service) Runs(initiativeID string) []session.Run {
	if _, err := s.ArchiveRuns(); err != nil {
		// A broken archive must not hide the history already written.
		_ = err
	}
	all := session.LoadRuns(session.RunsPath())
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
	return runsView(initiativeID, session.LoadRuns(session.RunsPath()), s.liveRuns())
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
			WindowSize: rec.WindowSize,
			FirstSeen:  rec.UpdatedAt, LastSeen: rec.UpdatedAt,
		}
		if c, ok := session.MatchCard(rec.Cwd, branchOf(rec.Cwd), cards); ok {
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
func runsView(initiativeID string, archived, live []session.Run) RunsView {
	folded := make(map[string]RunInfo, len(archived)+len(live))
	keep := func(r session.Run, isLive bool) {
		if initiativeID != "" && r.Initiative != initiativeID {
			return
		}
		folded[r.Key()] = runInfo(r, isLive)
	}
	for _, r := range archived {
		keep(r, false)
	}
	for _, r := range live {
		if prev, ok := folded[r.Key()]; ok && prev.FirstSeen.Before(r.FirstSeen) {
			r.FirstSeen = prev.FirstSeen // the archive remembers when it started
		}
		keep(r, true)
	}

	view := RunsView{Initiative: initiativeID}
	byCard := map[string]*CardRuns{}
	for _, r := range folded {
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

// laterRun orders runs newest last-seen first, the session id breaking a tie
// so the table never reshuffles between reads.
func laterRun(a, b RunInfo) bool {
	if !a.LastSeen.Equal(b.LastSeen) {
		return a.LastSeen.After(b.LastSeen)
	}
	return a.SessionID < b.SessionID
}
