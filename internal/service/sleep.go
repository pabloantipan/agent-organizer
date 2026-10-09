package service

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"organizer/internal/config"
	"organizer/internal/model"
)

// Sleep and wake go through the factory (`factory sleep|wake <id>`,
// ~/claudecode/scripts/factory/sleep.sh): it freezes or thaws the seats and
// writes and commits the status. Deltagos writes no status itself and never
// passes --force: a fifth awake initiative is refused by the factory, and
// that refusal is what the human sees (0104 A, initiatives-view FR-1 to FR-4).

// ErrSleepBusy is a Sleep or Wake asked while another one runs.
var ErrSleepBusy = errors.New("a factory sleep or wake is already running")

// factoryTimeout bounds one factory call. Sleep freezes every seat of the
// initiative one by one, so it gets far more than awake needs.
const (
	factoryTimeout      = 3 * time.Minute
	factoryAwakeTimeout = 30 * time.Second
)

// factoryFallbackDirs are where factory is looked for when it is not on PATH:
// `install.sh links` puts it in ~/bin, which an app opened from Finder does
// not have on its PATH. A var so tests can make the factory missing.
var factoryFallbackDirs = func() []string {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil
	}
	return []string{filepath.Join(home, "bin")}
}

// FactoryView is what Deltagos knows of the factory after the last rescan.
type FactoryView struct {
	// Found is factory resolved, on PATH (OnPath) or in ~/bin; Path is where.
	Found  bool   `json:"found"`
	OnPath bool   `json:"on_path"`
	Path   string `json:"path"`
	// OK is `factory awake` ran and printed its count line; when not, Reason
	// says why: not found, or the first error line verbatim.
	OK     bool   `json:"ok"`
	Reason string `json:"reason,omitempty"`
	// Limit is the factory's `(limit N)`, Awake its count of awake ones.
	Limit int `json:"limit"`
	Awake int `json:"awake"`
	// Seen is every initiative `factory awake` lists, awake or asleep.
	Seen []FactorySeen `json:"seen"`
	// Offers maps each local initiative id to the one control it gets:
	// "sleep" (active), "wake" (paused), or "" (archived, any other status,
	// factory-blind, or the factory missing or failing).
	Offers    map[string]string `json:"offers"`
	CheckedAt time.Time         `json:"checked_at"`
}

// FactorySeen is one line of `factory awake`.
type FactorySeen struct {
	ID    string `json:"id"`
	Root  string `json:"root"`
	State string `json:"state"` // awake | asleep
}

// SleepResult is one Sleep or Wake: the factory's words as it wrote them,
// and the initiative as the rescan after it found it.
type SleepResult struct {
	ID     string `json:"id"`
	Action string `json:"action"` // sleep | wake
	// OK is exit code 0. Output is stdout and stderr together, verbatim.
	OK       bool   `json:"ok"`
	ExitCode int    `json:"exit_code"`
	Output   string `json:"output"`
	// After the rescan.
	Status       string      `json:"status"`
	AsleepSince  string      `json:"asleep_since"`
	Frozen       []string    `json:"frozen"`
	FactoryBlind bool        `json:"factory_blind"`
	Factory      FactoryView `json:"factory"`
}

// frozenDir is seat-freeze's dir under the probe state dir; none without one.
func frozenDir(cfg config.Config) string {
	if strings.TrimSpace(cfg.ProbeStateDir) == "" {
		return ""
	}
	return filepath.Join(config.Expand(cfg.ProbeStateDir), "frozen")
}

// factoryBin resolves factory: PATH first, then the fallback dirs.
func factoryBin() (path string, onPath bool, err error) {
	if p, err := exec.LookPath("factory"); err == nil {
		return p, true, nil
	}
	for _, d := range factoryFallbackDirs() {
		p := filepath.Join(d, "factory")
		if st, err := os.Stat(p); err == nil && !st.IsDir() && st.Mode()&0o111 != 0 {
			return p, false, nil
		}
	}
	return "", false, errors.New("factory is not on PATH or in ~/bin")
}

// Sleep runs `factory sleep <id>`. See sleepWake.
func (s *Service) Sleep(id string) (SleepResult, error) { return s.sleepWake("sleep", id) }

// Wake runs `factory wake <id>`, never with --force. See sleepWake.
func (s *Service) Wake(id string) (SleepResult, error) { return s.sleepWake("wake", id) }

// sleepWake runs one factory sleep or wake, one at a time: a second call while
// one runs is ErrSleepBusy, not queued. An unknown or archived initiative is
// refused before the factory runs (FR-4); a factory that refuses or fails is
// not an error here but a result with OK false and its words, since those
// words are what the human reads. Either way the scan is redone and the
// result carries the state after it.
func (s *Service) sleepWake(action, id string) (SleepResult, error) {
	if !s.sleepMu.TryLock() {
		return SleepResult{}, ErrSleepBusy
	}
	defer s.sleepMu.Unlock()

	in, ok := s.localInitiative(id)
	if !ok {
		return SleepResult{}, fmt.Errorf("no initiative %s on this machine", id)
	}
	if in.Status == model.InitiativeArchived {
		return SleepResult{}, fmt.Errorf("%s is archived: the factory neither sleeps nor wakes it", id)
	}
	bin, _, err := factoryBin()
	if err != nil {
		return SleepResult{}, err
	}
	ctx, cancel := context.WithTimeout(context.Background(), factoryTimeout)
	defer cancel()
	out, code, err := runFactory(ctx, bin, action, id)
	if err != nil {
		return SleepResult{}, err
	}
	r := SleepResult{ID: id, Action: action, OK: code == 0, ExitCode: code, Output: out}

	s.Scan(true)
	r.Factory = s.refreshFactory()
	if after, ok := s.localInitiative(id); ok {
		r.Status, r.AsleepSince, r.Frozen, r.FactoryBlind = after.Status, after.AsleepSince, after.Frozen, after.FactoryBlind
	}
	return r, nil
}

// runFactory runs factory with args and returns its combined output and exit
// code. An error is only a factory that could not be started at all.
func runFactory(ctx context.Context, bin string, args ...string) (string, int, error) {
	cmd := exec.CommandContext(ctx, bin, args...)
	b, err := cmd.CombinedOutput()
	var ee *exec.ExitError
	switch {
	case err == nil:
		return string(b), 0, nil
	case errors.As(err, &ee):
		return string(b), ee.ExitCode(), nil
	default:
		return string(b), -1, err
	}
}

// localInitiative is the cached local scan's initiative with that id.
func (s *Service) localInitiative(id string) (model.Initiative, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, si := range s.state.Local.Initiatives {
		if si.ID == id {
			return si.Initiative, true
		}
	}
	return model.Initiative{}, false
}

// Factory is the factory as the last rescan found it, asking it now if no
// rescan has yet.
func (s *Service) Factory() FactoryView {
	s.mu.Lock()
	var f *FactoryView
	if s.factory != nil {
		c := *s.factory
		f = &c
	}
	s.mu.Unlock()
	if f != nil {
		return *f
	}
	return s.refreshFactory()
}

// refreshFactory runs `factory awake`, stamps FactoryBlind on the cached
// local scan and keeps the view. It runs on a rescan (Board, Sleep, Wake) and
// never on the 10 s agents tick: it walks the home directory. The factory
// runs outside the service lock.
func (s *Service) refreshFactory() FactoryView {
	v := FactoryView{CheckedAt: s.now()}
	bin, onPath, err := factoryBin()
	if err != nil {
		v.Reason = err.Error()
	} else {
		v.Found, v.OnPath, v.Path = true, onPath, bin
		ctx, cancel := context.WithTimeout(context.Background(), factoryAwakeTimeout)
		out, code, err := runFactory(ctx, bin, "awake")
		cancel()
		if err != nil {
			v.Reason = err.Error()
		} else {
			parseAwake(&v, out, code)
		}
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.factory = &v
	s.stampFactoryLocked()
	return v
}

// stampFactoryLocked sets FactoryBlind on the cached local scan from the last
// factory view and fills its Offers. A scan between two factory runs keeps
// the last answer instead of forgetting it; with no factory view yet nothing
// is stamped.
func (s *Service) stampFactoryLocked() {
	v := s.factory
	if v == nil {
		return
	}
	home, _ := os.UserHomeDir()
	seen := map[string]bool{}
	for _, x := range v.Seen {
		seen[filepath.Clean(expandHome(x.Root, home))] = true
	}
	v.Offers = map[string]string{}
	for i := range s.state.Local.Initiatives {
		in := &s.state.Local.Initiatives[i].Initiative
		in.FactoryBlind = v.OK && factoryLists(in.Status) && !seen[filepath.Clean(in.Path)]
		v.Offers[in.ID] = offer(v.OK, *in)
	}
}

// factoryLists is the statuses `factory awake` prints: active (or none) as
// awake, paused as asleep. Any other one, archived first, it never lists, so
// its absence says nothing about whether the factory can see it.
func factoryLists(status string) bool {
	return status == "" || status == model.InitiativeActive || status == model.InitiativePaused
}

// offer is the one control an initiative gets (FR-4: archived gets none).
func offer(factoryOK bool, in model.Initiative) string {
	if !factoryOK || in.FactoryBlind {
		return ""
	}
	switch in.Status {
	case "", model.InitiativeActive:
		return "sleep"
	case model.InitiativePaused:
		return "wake"
	}
	return ""
}

var (
	awakeLine = regexp.MustCompile(`^\s*(awake|asleep)\s+(\S+)\s+(\S+)`)
	limitLine = regexp.MustCompile(`^\s*(\d+) awake \(limit (\d+)\)`)
)

// parseAwake reads `factory awake`: `  awake  <id> <root> N seats`,
// `  asleep <id> <root> N frozen`, then `N awake (limit M)`. The command
// exits 1 when more than the limit are awake, with the same output, so a
// count line is success whatever the exit code; without one it failed and
// the reason is its first non-empty line verbatim.
func parseAwake(v *FactoryView, out string, code int) {
	sc := bufio.NewScanner(strings.NewReader(out))
	first := ""
	for sc.Scan() {
		line := sc.Text()
		if first == "" && strings.TrimSpace(line) != "" {
			first = line
		}
		if m := awakeLine.FindStringSubmatch(line); m != nil {
			v.Seen = append(v.Seen, FactorySeen{State: m[1], ID: m[2], Root: m[3]})
			continue
		}
		if m := limitLine.FindStringSubmatch(line); m != nil {
			v.Awake, _ = strconv.Atoi(m[1])
			v.Limit, _ = strconv.Atoi(m[2])
			v.OK = true
		}
	}
	if !v.OK {
		v.Seen = nil
		if first == "" {
			first = fmt.Sprintf("factory awake exited %d with no output", code)
		}
		v.Reason = first
	}
}

// expandHome turns the factory's ~/ back into the home directory.
func expandHome(p, home string) string {
	if p == "~" {
		return home
	}
	if strings.HasPrefix(p, "~/") {
		return filepath.Join(home, p[2:])
	}
	return p
}
