package service

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"organizer/internal/model"
)

// launchLine is the one shape a probe is started with: the prelude the pane
// sources, the prompt sent on the first run only, and the family wrapper with
// a session name and a directory. Crew seats and card builders share it so
// there is one place to change when probe's contract moves.
func launchLine(preludePath, promptPath, wrapper, session, dir string) string {
	return fmt.Sprintf("PROBE_PRELUDE_FILE=%s PROBE_PROMPT_FILE=%s %s %s %s",
		shellQuote(preludePath), shellQuote(promptPath), shellQuote(wrapper),
		shellQuote(session), shellQuote(dir))
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

	// probe cannot hold a long session name until it sets ZELLIJ_SOCK_DIR;
	// say so rather than launching something that will not come up.
	if full := family + "-probe-" + l.Session; len(full) > 22 {
		l.Warnings = append(l.Warnings, fmt.Sprintf("session name %q is %d characters; probe truncates over 22", full, len(full)))
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
