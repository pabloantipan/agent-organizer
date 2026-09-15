package cli

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
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
	cmds, err := svc.CreateCrew(id, !print)
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	if print {
		fmt.Fprintln(stdout, "# one terminal each; an existing session reattaches, a new one gets its opening prompt")
		for _, c := range cmds {
			fmt.Fprintln(stdout, c)
		}
		return 0
	}
	fmt.Fprintf(stdout, "opened %d seats in iTerm2\n", len(cmds))
	return 0
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
	rec, err := session.Parse(raw, os.Getenv, now())
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	rec.PID = session.AgentPID(os.Getppid(), cfg.AgentBinary)
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
