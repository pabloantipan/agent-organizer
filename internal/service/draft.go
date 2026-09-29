package service

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"

	"organizer/internal/model"
	"organizer/internal/prompt"
)

// acceptSlug is the slug of the record a drafting session raises to have
// its roster accepted (persona-agents, references/drafting.md §5).
const acceptSlug = "the-cell-roster"

// acceptRecord is the initiative's proposed the-cell-roster record, the one
// a draft cell waits on; nil when there is none. The highest number wins, so
// a redraft's record is the one named.
func acceptRecord(decisions []model.Decision) *model.Decision {
	var found *model.Decision
	for i := range decisions {
		d := &decisions[i]
		if d.Slug == acceptSlug && d.Status == "proposed" {
			found = d
		}
	}
	return found
}

// draftRefusal is why a draft cell does not launch, naming its accept record.
func draftRefusal(si *model.ScannedInitiative) error {
	if d := acceptRecord(si.Decisions); d != nil {
		return fmt.Errorf("%s: the cell is a draft; nothing launches until record %s-%s is ruled (working-on/decisions/%s-%s.md)",
			si.ID, d.Number, d.Slug, d.Number, d.Slug)
	}
	return fmt.Errorf("%s: the cell is a draft; nothing launches until its accept record is ruled, and there is no accept record yet (working-on/decisions/NNNN-%s.md)", si.ID, acceptSlug)
}

// draftBlocker says why a drafting session cannot start at root, or nil:
// the roster exists (FR-3d), or the goal or agents/people.md is missing
// (FR-3c; drafting.md §1 stops there too). Both missing inputs are named.
func draftBlocker(si *model.ScannedInitiative) error {
	if _, err := os.Stat(filepath.Join(si.Path, "agents", "cell.json")); err == nil {
		return fmt.Errorf("%s: agents/cell.json exists; the roster is already there", si.ID)
	}
	var missing []string
	if strings.TrimSpace(si.Goal) == "" {
		missing = append(missing, "no goal in working-on/initiative.yaml")
	}
	if fi, err := os.Stat(filepath.Join(si.Path, "agents", "people.md")); err != nil || fi.IsDir() {
		missing = append(missing, "no agents/people.md")
	}
	if len(missing) > 0 {
		what := "it"
		if len(missing) > 1 {
			what = "them"
		}
		return fmt.Errorf("%s: %s; the FSE's intake writes %s before a cell is drafted", si.ID, strings.Join(missing, " and "), what)
	}
	return nil
}

// DraftCell starts a drafting session for an initiative without a cell
// (discovery-in-a-cell FR-3, decision 0047) and returns its prompt. With
// open, it writes the prompt to <id>-draft-cell.md beside the review
// prompts and opens a terminal at the root running the agent with it, as
// RunReview does; without, it only checks and renders, so the Agents view
// asks it why the button is disabled and --print shows the prompt. The
// session writes the draft; the organizer writes no roster itself.
func (s *Service) DraftCell(initiativeID string, open bool) (string, error) {
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
		return "", fmt.Errorf("initiative %q not found on this machine", initiativeID)
	}
	if err := draftBlocker(si); err != nil {
		return "", err
	}
	text := prompt.DraftCell(si.ID, si.Path)
	if !open {
		return text, nil
	}
	p := promptPath(initiativeID + "-draft-cell")
	if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
		return "", err
	}
	if err := os.WriteFile(p, []byte(text), 0o600); err != nil {
		return "", err
	}
	agent := s.Config().Agent
	if agent == "" {
		agent = "claude"
	}
	return text, openAgentTerminal(si.Path, agent, p)
}

// openAgentTerminal opens a terminal at dir running `<agent> "$(cat file)"`,
// the prompt going through a file so its content needs no quoting.
func openAgentTerminal(dir, agent, file string) error {
	if dir == "" {
		return errors.New("initiative has no root on this machine")
	}
	cmd := fmt.Sprintf("cd %s && %s \"$(cat %s)\"", shellQuote(dir), agent, shellQuote(file))
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
