package cli

import (
	"encoding/json"
	"fmt"
	"io"
	"strings"
	"text/tabwriter"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/service"
	ledger "organizer/internal/usage"
)

const usageUsage = "usage: organizer usage [--week YYYY-Www] [--by initiative|role|task|model] [--json]"

// usageCmd is the weekly report (docs/specs/usage.md FR-4): the week's
// totals and one cut of where it went. --json is what App.Usage returns,
// every cut included.
func usageCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	args, asJSON := takeFlag(args, "--json")
	args, week, _ := takeValue(args, "--week")
	args, by, _ := takeValue(args, "--by")
	if len(args) > 0 {
		fmt.Fprintln(stderr, usageUsage)
		return 2
	}
	if by == "" {
		by = "initiative"
	}
	known := false
	for _, c := range ledger.Cuts {
		known = known || c == by
	}
	if !known {
		fmt.Fprintf(stderr, "--by %q: one of %s\n%s\n", by, strings.Join(ledger.Cuts, ", "), usageUsage)
		return 2
	}
	st, _ := cache.Load()
	v, err := service.NewWith(cfg, st, now).Usage(week)
	if err != nil {
		fmt.Fprintln(stderr, err)
		fmt.Fprintln(stderr, usageUsage)
		return 2
	}
	if asJSON {
		enc := json.NewEncoder(stdout)
		enc.SetIndent("", "  ")
		if err := enc.Encode(v); err != nil {
			fmt.Fprintln(stderr, err)
			return 1
		}
		return 0
	}
	WriteUsage(stdout, v, by)
	return 0
}

// WriteUsage renders a week: the three tiles as lines, then one cut.
func WriteUsage(w io.Writer, v ledger.View, by string) {
	t := v.ThisWeek
	machine := v.Machine
	if machine == "" {
		machine = "this Mac"
	}
	fmt.Fprintf(w, "%s · %s to %s · %s only\n", v.Week, t.Start, t.End, machine)
	if v.FirstDay == "" {
		fmt.Fprintln(w, "No sessions recorded yet. Usage fills in as Claude sessions run on this Mac.")
		return
	}
	if t.Sessions == 0 {
		fmt.Fprintln(w, "No sessions this week.")
		return
	}
	money := fmt.Sprintf("money     %s", dollars(t.Money))
	if l := v.LastWeek; l.Money > 0 {
		money += fmt.Sprintf(", %+.0f%% on last week (%s)", 100*(t.Money-l.Money)/l.Money, dollars(l.Money))
	}
	if t.WithoutCost > 0 {
		money += fmt.Sprintf("; excludes %d %s with no cost", t.WithoutCost, plural(t.WithoutCost, "session"))
	}
	fmt.Fprintln(w, money)
	fmt.Fprintf(w, "tokens    %s: %s\n", compact(t.Tokens), kindsLine(t.Input, t.Output, t.CacheRead, t.CacheWrite))
	sess := fmt.Sprintf("sessions  %d, %.1f h of work", t.Sessions, t.Hours)
	if t.Running > 0 {
		sess += fmt.Sprintf(", %d running (so far)", t.Running)
	}
	fmt.Fprintln(w, sess)
	fmt.Fprintln(w)

	fmt.Fprintf(w, "by %s\n", by)
	tw := tabwriter.NewWriter(w, 0, 4, 2, ' ', 0)
	fmt.Fprintln(tw, "name\tmoney\tshare\ttokens\tinput\toutput\tcache read\tcache write\tsessions\t")
	for _, r := range v.Cuts[by] {
		name := r.Name
		if by == "task" && r.Initiative != "" {
			name = r.Initiative + "/" + strings.Join(r.Cards, "+") + "  " + clip(r.Name, 48)
		}
		m := dollars(r.Money)
		if r.Sessions > 0 && r.WithoutCost == r.Sessions {
			m = "—"
		}
		fmt.Fprintf(tw, "%s\t%s\t%.0f%%\t%s\t%s\t%s\t%s\t%s\t%d\t\n", name, m, 100*r.Share, compact(r.Tokens),
			compact(r.Input), compact(r.Output), compact(r.CacheRead), compact(r.CacheWrite), r.Sessions)
		if by == "task" && len(r.Members) > 0 {
			var who []string
			for _, s := range r.Members {
				who = append(who, s.Role+" "+dashIfEmpty(s.Name))
			}
			fmt.Fprintf(tw, "  %s\t\t\t\t\t\t\t\t\t\n", strings.Join(who, ", "))
		}
		for _, why := range r.Reasons {
			fmt.Fprintf(tw, "  %d: %s\t\t\t\t\t\t\t\t\t\n", why.Sessions, why.Reason)
		}
	}
	tw.Flush()
}

func kindsLine(in, out, read, write int64) string {
	type kind struct {
		name string
		n    int64
	}
	ks := []kind{{"cache read", read}, {"input", in}, {"output", out}, {"cache write", write}}
	// Largest first, as the tile reads.
	for i := 1; i < len(ks); i++ {
		for j := i; j > 0 && ks[j].n > ks[j-1].n; j-- {
			ks[j], ks[j-1] = ks[j-1], ks[j]
		}
	}
	parts := make([]string, len(ks))
	for i, k := range ks {
		parts[i] = k.name + " " + compact(k.n)
	}
	return strings.Join(parts, " · ")
}

func dollars(x float64) string { return fmt.Sprintf("$%.2f", x) }

// compact is a token count the way the view prints it: 25.0M, 830k, 412.
func compact(n int64) string {
	switch {
	case n >= 1_000_000_000:
		return fmt.Sprintf("%.1fB", float64(n)/1e9)
	case n >= 1_000_000:
		return fmt.Sprintf("%.1fM", float64(n)/1e6)
	case n >= 1_000:
		return fmt.Sprintf("%.0fk", float64(n)/1e3)
	}
	return fmt.Sprintf("%d", n)
}
