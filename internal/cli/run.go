package cli

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"text/tabwriter"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/service"
	"organizer/internal/session"
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

const runsUsage = "usage: organizer runs [initiative] [--json]   (ids: organizer status)"

// runsCmd is the productivity baseline: one row per agent session this
// machine ever ran, against the card it ran for. Newest first, because the
// question is almost always "what did the last wave cost".
func runsCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	args, asJSON := takeFlag(args, "--json")
	if len(args) > 1 {
		fmt.Fprintln(stderr, runsUsage)
		return 2
	}
	id := ""
	if len(args) == 1 {
		id = args[0]
	}
	st, _ := cache.Load()
	svc := service.NewWith(cfg, st, now)
	svc.Scan(false)
	rows := svc.Runs(id)

	if asJSON {
		enc := json.NewEncoder(stdout)
		enc.SetIndent("", "  ")
		if rows == nil {
			rows = []session.Run{}
		}
		if err := enc.Encode(rows); err != nil {
			fmt.Fprintln(stderr, err)
			return 1
		}
		return 0
	}
	WriteRuns(stdout, rows)
	return 0
}

// WriteRuns renders the archive as the table. Exported so the golden test
// and the app render the same thing.
func WriteRuns(w io.Writer, rows []session.Run) {
	if len(rows) == 0 {
		fmt.Fprintln(w, "no agent sessions recorded yet (organizer statusline writes them; organizer doctor says if it is installed)")
		return
	}
	tw := tabwriter.NewWriter(w, 0, 4, 2, ' ', 0)
	fmt.Fprintln(tw, "card\tsession\tmodel\tstarted\tended\twall\tcontext\tcost")
	var cost float64
	for _, r := range rows {
		card := "-"
		if r.Card != "" {
			card = r.Initiative + "/" + r.Card
		}
		sess := r.Session
		if sess == "" {
			sess = r.SessionID
		}
		ended := "running"
		if r.Ended {
			ended = stamp(r.LastSeen)
		}
		fmt.Fprintf(tw, "%s\t%s\t%s\t%s\t%s\t%s\t%d%%\t$%.2f\n",
			card, sess, dashIfEmpty(r.Model), stamp(r.FirstSeen), ended,
			wall(r.Wall()), int(r.UsedPercent+0.5), r.CostUSD)
		cost += r.CostUSD
	}
	fmt.Fprintf(tw, "%d %s\t\t\t\t\t\t\t$%.2f\n", len(rows), plural(len(rows), "run"), cost)
	tw.Flush()
}

func plural(n int, word string) string {
	if n == 1 {
		return word
	}
	return word + "s"
}

func dashIfEmpty(s string) string {
	if s == "" {
		return "-"
	}
	return s
}

func stamp(t time.Time) string {
	if t.IsZero() {
		return "-"
	}
	return t.Local().Format("2006-01-02 15:04")
}

// wall is a duration a human reads at a glance: the two largest units.
func wall(d time.Duration) string {
	if d <= 0 {
		return "-"
	}
	d = d.Round(time.Minute)
	h := int(d.Hours())
	m := int(d.Minutes()) % 60
	switch {
	case h >= 24:
		return fmt.Sprintf("%dd%dh", h/24, h%24)
	case h > 0:
		return fmt.Sprintf("%dh%02dm", h, m)
	default:
		return fmt.Sprintf("%dm", m)
	}
}
