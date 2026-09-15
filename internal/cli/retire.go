package cli

import (
	"flag"
	"fmt"
	"io"
	"strings"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/service"
)

// retireCmd ends a wave: retires seats of a cell, kills their sessions,
// closes the mailbox, revokes tokens, rewrites the roster. Dry by default;
// --run does it.
func retireCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	fs := flag.NewFlagSet("retire", flag.ContinueOnError)
	fs.SetOutput(stderr)
	seats := fs.String("seats", "", "comma-separated seats to retire (default: every seat but the reconciler)")
	retirable := fs.Bool("retirable", false, "retire the seats a wave is done with: named by no open card, not working; closes only the wave's own threads")
	force := fs.Bool("force", false, "retire a seat even if an open card names it or it is working")
	keep := fs.String("keep", "", "comma-separated seats to keep; the rest retire")
	kill := fs.String("kill", "", "comma-separated extra probe sessions to kill, e.g. the supervisor's")
	noThreads := fs.Bool("keep-threads", false, "do not close the project's open threads")
	noTokens := fs.Bool("keep-tokens", false, "do not revoke the retired seats' tokens (no API restart then)")
	noCommit := fs.Bool("no-commit", false, "rewrite agents/cell.json without committing it")
	run := fs.Bool("run", false, "do it; without this the plan is printed and nothing changes")
	// The id may come first or last: Go's flag parser stops at the first
	// positional, so lift it out before parsing.
	var id string
	var rest []string
	for _, a := range args {
		if id == "" && !strings.HasPrefix(a, "-") && (len(rest) == 0 || !takesValue(rest[len(rest)-1])) {
			id = a
			continue
		}
		rest = append(rest, a)
	}
	if err := fs.Parse(rest); err != nil {
		return 2
	}
	if id == "" || fs.NArg() != 0 {
		fmt.Fprintln(stderr, "usage: organizer retire <initiative-id> [--retirable | --seats a,b | --keep a,b] [--kill session,...] [--force] [--keep-threads] [--keep-tokens] [--no-commit] [--run]")
		return 2
	}
	st, _ := cache.Load()
	svc := service.NewWith(cfg, st, now)
	svc.Scan(false)
	o := service.RetireOptions{InitiativeID: id, Retirable: *retirable, Force: *force, WaveThreads: *retirable, CloseThreads: !*noThreads, RevokeTokens: !*noTokens, CommitCell: !*noCommit}
	if *seats != "" {
		o.Seats = split(*seats)
	}
	if *keep != "" {
		si, err := svc.PlanRetire(service.RetireOptions{InitiativeID: id})
		if err != nil {
			fmt.Fprintln(stderr, err)
			return 1
		}
		all := append(append([]string{}, si.Seats...), si.Keep...)
		k := map[string]bool{}
		for _, a := range split(*keep) {
			k[a] = true
		}
		o.Seats = nil
		for _, a := range all {
			if !k[a] {
				o.Seats = append(o.Seats, a)
			}
		}
	}
	if *kill != "" {
		o.Sessions = split(*kill)
	}
	plan, err := svc.PlanRetire(o)
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	fmt.Fprintf(stdout, "retire %s (%s)\n", plan.InitiativeID, plan.Project)
	fmt.Fprintf(stdout, "  retire seats:  %s\n", orNone(plan.Seats))
	fmt.Fprintf(stdout, "  keep seats:    %s\n", orNone(plan.Keep))
	fmt.Fprintf(stdout, "  kill sessions: %s\n", orNone(plan.Sessions))
	fmt.Fprintf(stdout, "  close threads: %d%s\n", len(plan.Threads), map[bool]string{true: " (the wave's own)", false: ""}[o.WaveThreads])
	fmt.Fprintf(stdout, "  revoke tokens: %s%s\n", orNone(plan.Tokens), map[bool]string{true: " (then restart the discuss API)", false: ""}[plan.RestartAPI])
	fmt.Fprintf(stdout, "  delete files:  %d under ~/.local/share/organizer/crew\n", len(plan.Files))
	fmt.Fprintf(stdout, "  cell.json:     %s%s\n", plan.CellPath, map[bool]string{true: ", commit", false: ""}[o.CommitCell && plan.CellIsGit])
	for _, p := range plan.Problems {
		fmt.Fprintf(stdout, "  ! %s\n", p)
	}
	if !*run {
		fmt.Fprintln(stdout, "dry run; add --run to do it")
		return 0
	}
	rep, err := svc.Retire(o)
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	for _, s := range rep.Steps {
		fmt.Fprintln(stdout, "  ok", s)
	}
	for _, e := range rep.Errors {
		fmt.Fprintln(stdout, "  !!", e)
	}
	if len(rep.Errors) > 0 {
		return 1
	}
	return 0
}

// cleanCmd deletes exited probe sessions and stale statusline records.
func cleanCmd(cfg config.Config, stdout, stderr io.Writer, now func() time.Time) int {
	st, _ := cache.Load()
	svc := service.NewWith(cfg, st, now)
	rep, err := svc.Clean()
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	for _, s := range rep.Steps {
		fmt.Fprintln(stdout, " ", s)
	}
	for _, e := range rep.Errors {
		fmt.Fprintln(stdout, "  !!", e)
	}
	return 0
}

func split(s string) []string {
	var out []string
	for _, p := range strings.Split(s, ",") {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}

func orNone(l []string) string {
	if len(l) == 0 {
		return "none"
	}
	return strings.Join(l, ", ")
}

// takesValue reports whether a flag written as a separate word ("--keep a")
// consumes the next argument.
func takesValue(flag string) bool {
	switch strings.TrimLeft(flag, "-") {
	case "seats", "keep", "kill":
		return !strings.Contains(flag, "=")
	}
	return false
}
