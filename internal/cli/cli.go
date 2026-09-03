// Package cli implements the terminal subcommands. The same binary is the
// desktop app when invoked without a known subcommand.
package cli

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"
	"sort"
	"strings"
	"text/tabwriter"
	"time"

	"context"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/merge"
	"organizer/internal/model"
	"organizer/internal/scan"
	"organizer/internal/service"
	dsync "organizer/internal/sync"
)

// Subcommands the binary recognises. Anything else launches the GUI.
var Subcommands = []string{"status", "board", "sync", "prompt", "agents", "doctor", "config", "help"}

// IsSubcommand reports whether arg names a CLI subcommand.
func IsSubcommand(arg string) bool {
	for _, s := range Subcommands {
		if s == arg {
			return true
		}
	}
	return false
}

// Run executes args and returns an exit code.
func Run(args []string, stdout, stderr io.Writer) int {
	return runWith(args, stdout, stderr, time.Now)
}

func runWith(args []string, stdout, stderr io.Writer, now func() time.Time) int {
	if len(args) == 0 {
		usage(stdout)
		return 0
	}
	cfg, _, err := config.Load()
	if err != nil {
		fmt.Fprintln(stderr, "config:", err)
		return 2
	}
	switch args[0] {
	case "status":
		return status(cfg, args[1:], stdout, stderr, now)
	case "board":
		return board(cfg, args[1:], stdout, stderr, now)
	case "sync":
		return syncCmd(cfg, args[1:], stdout, stderr, now)
	case "prompt":
		return promptCmd(cfg, args[1:], stdout, stderr, now)
	case "agents":
		return agentsCmd(cfg, stdout, now)
	case "doctor":
		return doctor(cfg, args[1:], stdout, stderr, now)
	case "config":
		return configCmd(cfg, args[1:], stdout, stderr)
	case "help":
		usage(stdout)
		return 0
	}
	fmt.Fprintf(stderr, "unknown command %q\n", args[0])
	usage(stderr)
	return 2
}

func usage(w io.Writer) {
	fmt.Fprintln(w, `organizer: what am I working on, across initiatives and machines

  organizer status [--all] [--json]   open cards per initiative (now, blocked, next)
  organizer board [--json]            merged view: this machine live + last pull from others
  organizer sync [--no-push|--no-pull] scan, push this machine, pull all, refresh the cache
  organizer prompt <initiative> [--run] print the agent review prompt; --run opens a terminal running the agent with it
  organizer agents                    agent processes and sessions grouped per initiative
  organizer doctor                    roots, initiatives found, cards rejected and why
  organizer config [--init]           show the config; --init writes the defaults file
  organizer                           launch the desktop app`)
}

func scanOptions(cfg config.Config, now func() time.Time, git bool) scan.Options {
	return scan.Options{
		Roots:      cfg.ExpandedRoots(),
		MaxDepth:   cfg.MaxDepth,
		IgnoreDirs: cfg.IgnoreDirs,
		Git:        git,
		GitTimeout: time.Duration(cfg.GitTimeoutSeconds) * time.Second,
		Now:        now,
	}
}

func status(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	fs := flag.NewFlagSet("status", flag.ContinueOnError)
	fs.SetOutput(stderr)
	all := fs.Bool("all", false, "include initiatives with no open cards and archived cards")
	asJSON := fs.Bool("json", false, "print the snapshot as JSON")
	git := fs.Bool("git", true, "enrich repos through git")
	if err := fs.Parse(args); err != nil {
		return 2
	}
	st, _ := cache.Load()
	snap := service.NewWith(cfg, st, now).Status(*git)
	if *asJSON {
		enc := json.NewEncoder(stdout)
		enc.SetIndent("", "  ")
		_ = enc.Encode(snap)
		return 0
	}
	WriteStatus(stdout, snap, now(), *all)
	return 0
}

// WriteStatus renders the human status view. Initiatives with `now` cards
// come first, then by most recent update.
func WriteStatus(w io.Writer, snap model.Snapshot, now time.Time, all bool) {
	inits := append([]model.ScannedInitiative(nil), snap.Initiatives...)
	sort.SliceStable(inits, func(i, j int) bool {
		ni, _, _ := inits[i].Counts()
		nj, _, _ := inits[j].Counts()
		if (ni > 0) != (nj > 0) {
			return ni > 0
		}
		return inits[i].LastUpdated().After(inits[j].LastUpdated())
	})
	if len(inits) == 0 {
		fmt.Fprintln(w, "no initiatives found. Run `organizer doctor`.")
		return
	}
	home, _ := os.UserHomeDir()
	first := true
	for _, si := range inits {
		n, b, x := si.Counts()
		if n+b+x == 0 && !all {
			continue
		}
		if !first {
			fmt.Fprintln(w)
		}
		first = false
		client := si.Client
		if client == "" {
			client = "-"
		}
		fmt.Fprintf(w, "%s  (%s)  %s  %d now, %d blocked, %d next\n", si.ID, client, shortPath(si.Path, home), n, b, x)
		tw := tabwriter.NewWriter(w, 0, 4, 2, ' ', 0)
		for _, c := range si.Cards {
			if model.StatusOrder(c.Status) == 9 {
				continue // reported under problems
			}
			if (c.Archived || c.Status == model.StatusDone) && !all {
				continue
			}
			fmt.Fprintf(tw, "  %s\t%s\t%s\t%s\t%s\n", c.Status, c.Slug, c.Branch, age(c.UpdatedTime(), now), c.Next)
		}
		tw.Flush()
		for _, p := range si.Problems {
			fmt.Fprintf(w, "  ! %s: %s\n", shortPath(p.Path, home), p.Msg)
		}
	}
}

func doctor(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	_, exists, _ := config.Load()
	fmt.Fprintf(stdout, "config: %s", config.Path())
	if !exists {
		fmt.Fprint(stdout, " (not present, using defaults; `organizer config --init` writes it)")
	}
	fmt.Fprintln(stdout)
	fmt.Fprintf(stdout, "machine: %s\n", cfg.Machine)
	fmt.Fprintf(stdout, "roots (depth %d):\n", cfg.MaxDepth)
	for _, r := range cfg.ExpandedRoots() {
		st, err := os.Stat(r)
		mark := "ok"
		if err != nil || !st.IsDir() {
			mark = "MISSING"
		}
		fmt.Fprintf(stdout, "  %-8s %s\n", mark, r)
	}
	if cfg.GCPProject == "" {
		fmt.Fprintln(stdout, "gcp_project: not set (sync disabled)")
	} else {
		fmt.Fprintf(stdout, "gcp_project: %s  namespace: %s\n", cfg.GCPProject, cfg.Namespace)
	}

	started := now()
	snap := scan.Run(scanOptions(cfg, now, true))
	fmt.Fprintf(stdout, "\nscan: %d initiatives in %s\n", len(snap.Initiatives), time.Since(started).Round(time.Millisecond))
	home, _ := os.UserHomeDir()
	tw := tabwriter.NewWriter(stdout, 0, 4, 2, ' ', 0)
	for _, si := range snap.Initiatives {
		open, archived := 0, 0
		for _, c := range si.Cards {
			if c.Archived {
				archived++
			} else {
				open++
			}
		}
		fmt.Fprintf(tw, "  %s\t%s\t%d open, %d done\t%d repos\n", si.ID, shortPath(si.Path, home), open, archived, len(si.RepoStates))
		for _, r := range si.RepoStates {
			switch {
			case r.Missing:
				fmt.Fprintf(tw, "    repo\t%s\tnot a git repo or missing\n", r.Name)
			case r.Err != "":
				fmt.Fprintf(tw, "    repo\t%s\terror: %s\n", r.Name, r.Err)
			default:
				fmt.Fprintf(tw, "    repo\t%s\t%s\tdirty=%d\tlast=%s\n", r.Name, r.Branch, r.Dirty, r.LastCommit)
			}
		}
		for _, p := range si.Problems {
			fmt.Fprintf(tw, "    !\t%s\t%s\n", shortPath(p.Path, home), p.Msg)
		}
	}
	tw.Flush()
	return 0
}

func configCmd(cfg config.Config, args []string, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("config", flag.ContinueOnError)
	fs.SetOutput(stderr)
	init := fs.Bool("init", false, "write the defaults file if none exists")
	if err := fs.Parse(args); err != nil {
		return 2
	}
	if *init {
		if _, exists, _ := config.Load(); exists {
			fmt.Fprintln(stdout, "already exists:", config.Path())
		} else if err := config.Save(cfg); err != nil {
			fmt.Fprintln(stderr, err)
			return 1
		} else {
			fmt.Fprintln(stdout, "written:", config.Path())
		}
	}
	fmt.Fprintf(stdout, "machine: %s\nroots: %s\nmax_depth: %d\ngcp_project: %q\nnamespace: %s\neditor: %s\n",
		cfg.Machine, strings.Join(cfg.Roots, ", "), cfg.MaxDepth, cfg.GCPProject, cfg.Namespace, cfg.Editor)
	return 0
}

func shortPath(p, home string) string {
	if home != "" && strings.HasPrefix(p, home) {
		return "~" + strings.TrimPrefix(p, home)
	}
	return p
}

func age(t, now time.Time) string {
	if t.IsZero() {
		return "?"
	}
	d := now.Sub(t)
	days := int(d.Hours() / 24)
	switch {
	case days <= 0:
		return "today"
	case days == 1:
		return "1d"
	case days < 30:
		return fmt.Sprintf("%dd", days)
	default:
		return fmt.Sprintf("%dmo", days/30)
	}
}

func board(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	fs := flag.NewFlagSet("board", flag.ContinueOnError)
	fs.SetOutput(stderr)
	asJSON := fs.Bool("json", false, "print the board as JSON")
	if err := fs.Parse(args); err != nil {
		return 2
	}
	st, _ := cache.Load()
	svc := service.NewWith(cfg, st, now)
	b := svc.Board()
	if *asJSON {
		enc := json.NewEncoder(stdout)
		enc.SetIndent("", "  ")
		_ = enc.Encode(b)
		return 0
	}
	WriteBoard(stdout, b, svc.PulledAt(), now())
	return 0
}

// WriteBoard renders the three columns across machines.
func WriteBoard(w io.Writer, b merge.Board, pulledAt time.Time, now time.Time) {
	if pulledAt.IsZero() {
		fmt.Fprintf(w, "machine %s only (never pulled; run `organizer sync`)\n", b.Machine)
	} else {
		fmt.Fprintf(w, "machines: %s (remote as of %s ago)\n", strings.Join(b.Machines, ", "), now.Sub(pulledAt).Round(time.Minute))
	}
	for _, status := range []string{model.StatusNow, model.StatusBlocked, model.StatusNext} {
		col := b.Columns[status]
		fmt.Fprintf(w, "\n%s (%d)\n", strings.ToUpper(status), len(col))
		tw := tabwriter.NewWriter(w, 0, 4, 2, ' ', 0)
		for _, c := range col {
			m := c.Machine
			if c.Local {
				m = "*" + m
			}
			fmt.Fprintf(tw, "  %s\t%s/%s\t%s\t%s\t%s\n", m, c.InitiativeID, c.Slug, c.Branch, age(c.UpdatedTime(), now), c.Next)
		}
		tw.Flush()
	}
	var also []string
	for _, bi := range b.Initiatives {
		if bi.Local && len(bi.AlsoOn) > 0 {
			also = append(also, fmt.Sprintf("%s also on %s", bi.ID, strings.Join(bi.AlsoOn, ", ")))
		}
	}
	if len(also) > 0 {
		fmt.Fprintf(w, "\n%s\n", strings.Join(also, "; "))
	}
}

func syncCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	fs := flag.NewFlagSet("sync", flag.ContinueOnError)
	fs.SetOutput(stderr)
	noPush := fs.Bool("no-push", false, "pull only")
	noPull := fs.Bool("no-pull", false, "push only")
	if err := fs.Parse(args); err != nil {
		return 2
	}
	if cfg.GCPProject == "" {
		fmt.Fprintln(stderr, dsync.ErrNoProject.Error())
		fmt.Fprintln(stderr, "set gcp_project in", config.Path())
		return 2
	}
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	st, _ := cache.Load()
	svc := service.NewWith(cfg, st, now)
	res, err := svc.Sync(ctx, !*noPush, !*noPull)
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	if !*noPush {
		fmt.Fprintf(stdout, "pushed %d initiatives as %s to %s/%s (%d retired)\n", res.Pushed, cfg.Machine, cfg.GCPProject, cfg.Namespace, res.Retired)
	}
	if !*noPull {
		fmt.Fprintf(stdout, "pulled %d machines: %s\n", len(res.Machines), strings.Join(res.Machines, ", "))
	}
	return 0
}

func promptCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	fs := flag.NewFlagSet("prompt", flag.ContinueOnError)
	fs.SetOutput(stderr)
	run := fs.Bool("run", false, "open a terminal running the agent with the prompt")
	if err := fs.Parse(args); err != nil {
		return 2
	}
	if fs.NArg() != 1 {
		fmt.Fprintln(stderr, "usage: organizer prompt <initiative-id> [--run]   (ids: organizer status)")
		return 2
	}
	st, _ := cache.Load()
	svc := service.NewWith(cfg, st, now)
	if *run {
		if err := svc.RunReview(fs.Arg(0)); err != nil {
			fmt.Fprintln(stderr, err)
			return 1
		}
		fmt.Fprintln(stdout, "terminal opened")
		return 0
	}
	text, err := svc.ReviewPrompt(fs.Arg(0))
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	fmt.Fprint(stdout, text)
	return 0
}

func agentsCmd(cfg config.Config, stdout io.Writer, now func() time.Time) int {
	st, _ := cache.Load()
	svc := service.NewWith(cfg, st, now)
	svc.Scan(false)
	v := svc.RefreshAgents()
	home, _ := os.UserHomeDir()
	tw := tabwriter.NewWriter(stdout, 0, 4, 2, ' ', 0)
	total := 0
	row := func(a model.Agent) {
		pid := ""
		if a.PID > 0 {
			pid = fmt.Sprintf("pid %d", a.PID)
		}
		fmt.Fprintf(tw, "  %s\t%s\t%s\t%s\t%s\t%s\n", a.State, a.Name, a.Kind, pid, a.Uptime, shortPath(a.Dir, home))
		total++
	}
	for _, g := range v.Groups {
		if len(g.Agents) == 0 {
			continue
		}
		fmt.Fprintf(tw, "%s\t%d agents, %d live, %d working\n", g.ID, len(g.Agents), g.Live, g.Working)
		for _, a := range g.Agents {
			row(a)
		}
	}
	if len(v.Unassigned) > 0 {
		fmt.Fprintf(tw, "not in any initiative\t%d\n", len(v.Unassigned))
		for _, a := range v.Unassigned {
			row(a)
		}
	}
	tw.Flush()
	if total == 0 {
		fmt.Fprintln(stdout, "no agents found (process name:", cfg.AgentBinary+")")
	}
	fmt.Fprintln(stdout, "working = CPU time grew since the previous sample; the first sample cannot tell.")
	return 0
}
