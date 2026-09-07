package cli

import (
	"errors"
	"fmt"
	"io"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/service"
)

// takeFlag pulls a boolean flag out of args wherever it sits, so the verb
// reads the same whether the flag comes before or after the positionals.
func takeFlag(args []string, name string) ([]string, bool) {
	var rest []string
	found := false
	for _, a := range args {
		if a == name {
			found = true
			continue
		}
		rest = append(rest, a)
	}
	return rest, found
}

const runUsage = "usage: organizer run <initiative> <card> [--print]   (ids: organizer status)"

// runCmd is the gate. A card without a spec, a gate and a boundary is not
// launchable and the exit code says so; a card that carries all three prints
// or opens the launch line the supervise skill's step 4 defines.
func runCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	args, print := takeFlag(args, "--print")
	if len(args) != 2 {
		fmt.Fprintln(stderr, runUsage)
		return 2
	}
	st, _ := cache.Load()
	svc := service.NewWith(cfg, st, now)
	svc.Scan(false)

	l, err := svc.PrepareLaunch(args[0], args[1])
	if err != nil {
		var nl *service.NotLaunchable
		if errors.As(err, &nl) {
			fmt.Fprintln(stderr, nl.Error())
			return 2
		}
		fmt.Fprintln(stderr, err)
		return 1
	}
	for _, w := range l.Warnings {
		fmt.Fprintln(stderr, "warning:", w)
	}
	if print {
		fmt.Fprintln(stdout, l.Command)
		return 0
	}
	if _, err := svc.RunCard(args[0], args[1]); err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	fmt.Fprintf(stdout, "launched %s/%s as %s in %s\n", l.Initiative, l.Slug, l.Session, l.Dir)
	return 0
}
