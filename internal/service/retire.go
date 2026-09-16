package service

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"time"

	"organizer/internal/discuss"
	"organizer/internal/model"
)

// Retiring a cell is what the end of a wave needs and what was being done
// by hand: seats leave the roster, their sessions and tokens go, the
// mailbox closes, the organizer's own files for them go. Without it every
// wave leaves its builders behind and the Agents view fills with seats that
// are off and owing mail. The plan is computed first and shown; nothing
// happens until Retire runs it, and every step reports what it did.

// RetireOptions is what the human chooses.
type RetireOptions struct {
	InitiativeID string   `json:"initiative_id"`
	Seats        []string `json:"seats"`         // seats to retire; empty = every seat but the reconciler
	Retirable    bool     `json:"retirable"`     // seats = Retirable(): done with, by the cards and the sessions
	Force        bool     `json:"force"`         // retire a seat even if an open card names it or it is working
	WaveThreads  bool     `json:"wave_threads"`  // close only threads whose participants are all retired seats (and the human)
	Sessions     []string `json:"sessions"`      // extra probe sessions to kill (e.g. the supervisor's)
	CloseThreads bool     `json:"close_threads"` // close every open thread of the project as the human
	RevokeTokens bool     `json:"revoke_tokens"` // discuss-api token rm per retired seat, then restart the API
	CommitCell   bool     `json:"commit_cell"`   // commit agents/cell.json when agents/ is a git repo
}

// RetirePlan is what Retire will do, for the human to read before it runs.
type RetirePlan struct {
	InitiativeID string   `json:"initiative_id"`
	Project      string   `json:"project"`
	Seats        []string `json:"seats"`
	Keep         []string `json:"keep"`
	Sessions     []string `json:"sessions"` // probe sessions that exist and will be killed
	Tokens       []string `json:"tokens"`   // seats whose token exists and will be revoked
	Threads      []string `json:"threads"`  // open thread ids that will be closed
	Files        []string `json:"files"`    // organizer files that will be deleted
	CellPath     string   `json:"cell_path"`
	CellIsGit    bool     `json:"cell_is_git"`
	RestartAPI   bool     `json:"restart_api"`
	Problems     []string `json:"problems"` // why parts of the plan are empty
}

// RetireReport is what happened, step by step.
type RetireReport struct {
	Steps  []string `json:"steps"`
	Errors []string `json:"errors"`
}

func (r *RetireReport) step(format string, a ...any) {
	r.Steps = append(r.Steps, fmt.Sprintf(format, a...))
}
func (r *RetireReport) fail(format string, a ...any) {
	r.Errors = append(r.Errors, fmt.Sprintf(format, a...))
}

// PlanRetire resolves the options against the roster, the sessions, the
// token registry and the mailbox. It changes nothing.
func (s *Service) PlanRetire(o RetireOptions) (RetirePlan, error) {
	si, err := s.initiative(o.InitiativeID)
	if err != nil {
		return RetirePlan{}, err
	}
	if si.Cell == nil {
		return RetirePlan{}, errNoCell
	}
	cell := si.Cell
	p := RetirePlan{InitiativeID: si.ID, Project: cell.Project, CellPath: filepath.Join(si.Path, "agents", "cell.json")}
	if _, err := os.Stat(filepath.Join(si.Path, "agents", ".git")); err == nil {
		p.CellIsGit = true
	}
	retire := map[string]bool{}
	if o.Retirable {
		o.Seats = Retirable(si)
		if len(o.Seats) == 0 {
			p.Problems = append(p.Problems, "no seat is retirable: every seat is the human, the reconciler, named by an open card, or working")
		}
	}
	busy := map[string]string{}
	for _, c := range si.Cards {
		if c.Seat != "" && !c.Archived && c.Status != model.StatusDone {
			busy[c.Seat] = "open card " + c.Slug
		}
	}
	for _, a := range si.Agents {
		if a.State == model.AgentWorking && a.Persona != "" {
			busy[a.Persona] = "working right now"
		}
	}
	if len(o.Seats) == 0 && !o.Retirable {
		for _, a := range cell.Agents {
			if a != cell.Reconciler {
				retire[a] = true
			}
		}
	} else {
		for _, a := range o.Seats {
			if !slices.Contains(cell.Agents, a) {
				p.Problems = append(p.Problems, fmt.Sprintf("%s is not a seat of %s", a, cell.Project))
				continue
			}
			if why, ok := busy[a]; ok && !o.Force {
				p.Problems = append(p.Problems, fmt.Sprintf("%s kept: %s (use force to retire it anyway)", a, why))
				continue
			}
			retire[a] = true
		}
	}
	for _, a := range cell.Agents {
		if retire[a] {
			p.Seats = append(p.Seats, a)
		} else {
			p.Keep = append(p.Keep, a)
		}
	}

	// Sessions: the crew session of each retired seat, plus what was named.
	// A seat whose name zellij cannot hold is a problem on the plan, not a
	// silent miss — that is the seat whose session is killed by hand.
	live := sessionLister(s.cfg.Zellij)
	for _, a := range p.Seats {
		sess, err := crewSession(cell, a)
		if err != nil {
			p.Problems = append(p.Problems, err.Error())
			continue
		}
		if live[sess] {
			p.Sessions = append(p.Sessions, sess)
		}
	}
	for _, sess := range o.Sessions {
		if !nameRe.MatchString(sess) {
			p.Problems = append(p.Problems, "invalid session name "+sess)
			continue
		}
		if !live[sess] {
			p.Problems = append(p.Problems, "no session "+sess)
			continue
		}
		if !slices.Contains(p.Sessions, sess) {
			p.Sessions = append(p.Sessions, sess)
		}
	}

	dir := discussStateDir(s.Config())
	if o.RevokeTokens {
		for _, a := range p.Seats {
			if _, err := discuss.Token(dir, cell.Project, a); err == nil {
				p.Tokens = append(p.Tokens, a)
			}
		}
		p.RestartAPI = len(p.Tokens) > 0
	}
	if o.CloseThreads {
		snap, why := s.cellHealth(cell)
		if why != "" {
			p.Problems = append(p.Problems, "mailbox: "+why)
		}
		for _, t := range snap.Threads {
			if o.WaveThreads {
				// Only the wave's own threads: every poster is a retired seat
				// or the human. A thread a kept seat spoke in stays open.
				ours := true
				for _, who := range t.Participants {
					if who != cell.Human && !retire[who] {
						ours = false
						break
					}
				}
				if !ours {
					continue
				}
			}
			p.Threads = append(p.Threads, t.ID)
		}
	}
	cd := crewDir(si.ID)
	for _, a := range p.Seats {
		for _, ext := range []string{".sh", ".md"} {
			f := filepath.Join(cd, a+ext)
			if _, err := os.Stat(f); err == nil {
				p.Files = append(p.Files, f)
			}
		}
	}
	return p, nil
}

// sessionLister is liveSessions, swapped in tests for a fixed list: the plan
// is about which names are looked for, and shelling out to zellij to find
// that out would make the test depend on this machine's live sessions.
var sessionLister = liveSessions

// liveSessions is the zellij session names that exist, exited included:
// probe -k deletes both.
func liveSessions(zellij string) map[string]bool {
	out := map[string]bool{}
	for _, line := range strings.Split(runZellij(zellij, "list-sessions", "-n"), "\n") {
		f := strings.Fields(line)
		if len(f) > 0 {
			out[f[0]] = true
		}
	}
	return out
}

func runZellij(bin string, args ...string) string {
	if bin == "" {
		bin = "zellij"
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	out, _ := exec.CommandContext(ctx, bin, args...).Output()
	return string(out)
}

// Retire runs a plan. Order matters: sessions first so nothing posts into
// threads being closed, mail second while tokens still work, tokens third,
// the roster last so the feed stops showing seats only once they are gone.
func (s *Service) Retire(o RetireOptions) (RetireReport, error) {
	p, err := s.PlanRetire(o)
	if err != nil {
		return RetireReport{}, err
	}
	si, _ := s.initiative(o.InitiativeID)
	cell := si.Cell
	var r RetireReport

	for _, sess := range p.Sessions {
		if err := s.KillAgent(sess); err != nil {
			r.fail("kill %s: %v", sess, err)
		} else {
			r.step("killed session %s (conversation stays resumable)", sess)
		}
	}

	if o.CloseThreads {
		c, err := s.humanClient(cell)
		if err != nil {
			r.fail("mailbox: %v", err)
		} else {
			ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
			defer cancel()
			closed := 0
			for _, id := range p.Threads {
				if err := c.SetStatus(ctx, id, "closed"); err != nil {
					r.fail("close %s: %v", id, err)
				} else {
					closed++
				}
			}
			r.step("closed %d of %d open threads as %s", closed, len(p.Threads), cell.Human)
			if n, err := c.PickUp(ctx); err == nil && n > 0 {
				r.step("picked up %d messages for %s", n, cell.Human)
			}
			// Kept seats: their inbox is drained too, so nothing from the
			// retired wave keeps them marked as owing mail.
			dir := discussStateDir(s.Config())
			for _, a := range p.Keep {
				kc, err := discuss.Connect(dir, cell.Project, a)
				if err != nil {
					continue
				}
				if n, err := kc.PickUp(ctx); err == nil && n > 0 {
					r.step("picked up %d messages for %s", n, a)
				}
			}
		}
	}

	if o.RevokeTokens && len(p.Tokens) > 0 {
		api, err := discussAPIBin()
		if err != nil {
			r.fail("%v", err)
		} else {
			revoked := 0
			for _, a := range p.Tokens {
				if out, err := exec.Command(api, "token", "rm", cell.Project, a).CombinedOutput(); err != nil {
					r.fail("token rm %s: %s", a, strings.TrimSpace(string(out)))
				} else {
					revoked++
				}
			}
			r.step("revoked %d tokens", revoked)
			if revoked > 0 {
				// The API loads the registry once at boot.
				label := "gui/" + strconv.Itoa(os.Getuid()) + "/com.pabloantipan.discuss"
				if out, err := exec.Command("launchctl", "kickstart", "-k", label).CombinedOutput(); err != nil {
					r.fail("restart discuss: %s", strings.TrimSpace(string(out)))
				} else {
					r.step("restarted the discuss API; live watchers of other cells reconnect on their own")
				}
			}
		}
	}

	for _, f := range p.Files {
		if err := os.Remove(f); err == nil {
			r.step("removed %s", f)
		}
	}

	if len(p.Seats) > 0 {
		if err := writeCell(p.CellPath, p.Keep); err != nil {
			r.fail("cell.json: %v", err)
		} else {
			r.step("cell.json now lists %s", strings.Join(p.Keep, ", "))
			if o.CommitCell && p.CellIsGit {
				dir := filepath.Dir(p.CellPath)
				msg := fmt.Sprintf("chore(cell): retire %d seats (%s)", len(p.Seats), strings.Join(p.Seats, ", "))
				if out, err := exec.Command("git", "-C", dir, "add", "cell.json").CombinedOutput(); err != nil {
					r.fail("git add: %s", strings.TrimSpace(string(out)))
				} else if out, err := exec.Command("git", "-C", dir, "commit", "-m", msg, "--", "cell.json").CombinedOutput(); err != nil {
					r.fail("git commit: %s", strings.TrimSpace(string(out)))
				} else {
					r.step("committed cell.json in %s", dir)
				}
			}
		}
	}

	// The organizer's own state: statusline records of dead pids, and a
	// fresh scan so the feed reflects the roster.
	if n, err := s.archiveRuns(0); err != nil {
		r.fail("archive runs: %v", err)
	} else if n > 0 {
		r.step("archived %d statusline records", n)
	}
	s.Scan(false)
	s.mu.Lock()
	s.openers = nil
	s.mu.Unlock()
	return r, nil
}

// writeCell rewrites agents/cell.json with a new seat list, keeping every
// other field as it was.
func writeCell(path string, agents []string) error {
	b, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	var doc map[string]any
	if err := json.Unmarshal(b, &doc); err != nil {
		return err
	}
	doc["agents"] = agents
	out, err := json.MarshalIndent(doc, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(out, '\n'), 0o644)
}

// livePids is every agent process alive now, for pruning records.
func livePids() map[int]bool {
	out := map[int]bool{}
	raw, _ := exec.Command("ps", "-axo", "pid=").Output()
	for _, f := range strings.Fields(string(raw)) {
		if n, err := strconv.Atoi(f); err == nil {
			out[n] = true
		}
	}
	return out
}

// Clean deletes exited probe sessions and their layouts (probe -c) and the
// statusline records of processes that are gone. Cheap, safe, idempotent:
// the thing to run between waves.
func (s *Service) Clean() (RetireReport, error) {
	var r RetireReport
	if _, err := os.Stat(probeBin()); err != nil {
		return r, fmt.Errorf("probe not found at %s", probeBin())
	}
	out, err := exec.Command(probeBin(), "-c").CombinedOutput()
	if err != nil {
		r.fail("probe -c: %s", strings.TrimSpace(string(out)))
	}
	for _, line := range strings.Split(strings.TrimSpace(string(out)), "\n") {
		if line != "" {
			r.step("%s", line)
		}
	}
	if n, err := s.archiveRuns(0); err != nil {
		r.fail("archive runs: %v", err)
	} else if n > 0 {
		r.step("archived %d statusline records", n)
	}
	if len(r.Steps) == 0 {
		r.step("nothing to clean")
	}
	s.Scan(false)
	return r, nil
}
