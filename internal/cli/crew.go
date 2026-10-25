package cli

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/discuss"
	"organizer/internal/service"
	"organizer/internal/session"
)

// crewCmd brings a cell up: every seat of the initiative's agents/cell.json
// as its own probe, with its discuss identity. --print shows the launch
// lines instead of opening them.
func crewCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	print := false
	var id string
	for _, a := range args {
		switch {
		case a == "--print":
			print = true
		case strings.HasPrefix(a, "-"):
			fmt.Fprintf(stderr, "unknown flag %s\n", a)
			return 2
		default:
			id = a
		}
	}
	if id == "" {
		fmt.Fprintln(stderr, "usage: organizer crew <initiative-id> [--print]   (ids: organizer status; needs agents/cell.json at the root)")
		return 2
	}
	st, _ := cache.Load()
	svc := service.NewWith(cfg, st, now)
	svc.Scan(false)
	lines := newLaunchPrinter(stdout)
	if !print {
		svc.OnLaunch = lines.print
	}
	c, err := svc.StartCrew(id, !print)
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	// The seats already running get no line and no probe call (leftovers-30
	// FR-1); this line names them, after the starts, so it never interleaves
	// with the states printed as they change.
	skipped := ""
	if len(c.Skipped) > 0 {
		skipped = "already running, not started: " + strings.Join(c.Skipped, ", ")
	}
	if print {
		if skipped != "" {
			fmt.Fprintln(stdout, "# "+skipped)
		}
		if len(c.Lines) > 0 {
			fmt.Fprintln(stdout, "# one terminal each; an existing session reattaches, a new one gets its opening prompt")
		}
		for _, l := range c.Lines {
			fmt.Fprintln(stdout, l)
		}
		return 0
	}
	if len(c.Lines) == 0 {
		fmt.Fprintln(stdout, skipped)
		fmt.Fprintln(stdout, "nothing started")
		return 0
	}
	got, _ := svc.WaitLaunch(id)
	lines.waitFor(got.Seats)
	fmt.Fprintf(stdout, "%d of %d seats running detached (watch: seats open, or probe --attach <session>)\n", got.Running, len(got.Seats))
	if skipped != "" {
		fmt.Fprintln(stdout, skipped)
	}
	if got.Failed > 0 {
		return 1
	}
	return 0
}

// launchPrinter prints each seat's state as it changes, one line each:
// `<seat> <state>`, and for a failed seat the reason, probe's exit and its
// output's last line. The CLI waits for the start; the app shows the same
// states from the agents feed.
//
// The service settles a start before it tells OnLaunch of the last seat's
// state, so WaitLaunch can return while that line is still on its way;
// waitFor holds the total until every seat's final state is printed.
type launchPrinter struct {
	w       io.Writer
	mu      sync.Mutex
	done    *sync.Cond
	printed map[string]string
}

func newLaunchPrinter(w io.Writer) *launchPrinter {
	p := &launchPrinter{w: w, printed: map[string]string{}}
	p.done = sync.NewCond(&p.mu)
	return p
}

// launchLines is a printer's print, for a caller that does not wait.
func launchLines(w io.Writer) func(service.LaunchChange) { return newLaunchPrinter(w).print }

func (p *launchPrinter) print(c service.LaunchChange) {
	if c.Seat == nil {
		return
	}
	p.mu.Lock()
	defer p.mu.Unlock()
	if c.Seat.State != service.LaunchFailed {
		fmt.Fprintf(p.w, "%s %s\n", c.Seat.Seat, c.Seat.State)
	} else {
		fmt.Fprintf(p.w, "%s failed: %s\n", c.Seat.Seat, c.Seat.Reason)
		if c.Seat.Output != "" {
			fmt.Fprintf(p.w, "  %s\n", strings.ReplaceAll(c.Seat.Output, "\n", "\n  "))
		}
	}
	p.printed[c.Seat.Seat] = c.Seat.State
	p.done.Broadcast()
}

// waitFor blocks until each seat's printed state is the one it settled in.
func (p *launchPrinter) waitFor(seats []service.SeatLaunch) {
	p.mu.Lock()
	defer p.mu.Unlock()
	for _, s := range seats {
		for p.printed[s.Seat] != s.State {
			p.done.Wait()
		}
	}
}

// statuslineCmd is the Claude Code statusLine command. It reads the JSON the
// agent hands it on stdin, records the context fill under the agent's pid
// for the scan to pick up, and prints the one-line status. It must print
// even when recording fails: a broken statusline is what the user sees.
func statuslineCmd(cfg config.Config, stdin io.Reader, stdout, stderr io.Writer, now func() time.Time) int {
	raw, err := io.ReadAll(stdin)
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	if err := session.Capture(raw, os.Getenv); err != nil {
		fmt.Fprintln(stderr, "organizer statusline: capture:", err)
	}
	rec, err := session.Parse(raw, os.Getenv, now())
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	rec.PID = session.AgentPID(os.Getppid(), cfg.AgentBinary)
	rec = session.Counted(session.Dir(), rec)
	if err := session.Write(session.Dir(), rec); err != nil {
		fmt.Fprintln(stderr, "organizer statusline:", err)
	}
	fmt.Fprintln(stdout, session.Line(rec))
	return 0
}

// statuslineStatus reports whether ~/.claude/settings.json runs this binary
// as the statusLine, which is what feeds context fill per agent.
func statuslineStatus() string {
	home, _ := os.UserHomeDir()
	b, err := os.ReadFile(filepath.Join(home, ".claude", "settings.json"))
	if err != nil {
		return "not installed (no ~/.claude/settings.json)"
	}
	var s struct {
		StatusLine struct {
			Command string `json:"command"`
		} `json:"statusLine"`
	}
	if json.Unmarshal(b, &s) != nil || s.StatusLine.Command == "" {
		return `not installed: set "statusLine": {"type": "command", "command": "organizer statusline"} in ~/.claude/settings.json`
	}
	if strings.Contains(s.StatusLine.Command, "organizer statusline") {
		return "installed (" + s.StatusLine.Command + ")"
	}
	return "another command is configured (" + s.StatusLine.Command + "); context fill needs `organizer statusline`"
}

func discussStatus(cfg config.Config) string {
	dir := config.Expand(cfg.DiscussStateDir)
	if dir == "" {
		dir = discuss.DefaultStateDir()
	}
	if discuss.Available(dir) {
		return "running (" + dir + ")"
	}
	return "not running (" + dir + "); crew health needs it"
}
