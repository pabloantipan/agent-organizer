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
	// The pass posts its changed rows in the background; wait for it, at
	// most 10 s, once the output is printed (usage-post Amendment 1). The
	// rows the record rejected are listed after the wait, so they include
	// what this pass's post was answered (leftovers-54 FR-4).
	if asJSON {
		defer service.WaitUsagePost()
		enc := json.NewEncoder(stdout)
		enc.SetIndent("", "  ")
		if err := enc.Encode(v); err != nil {
			fmt.Fprintln(stderr, err)
			return 1
		}
		return 0
	}
	WriteUsage(stdout, v, by)
	service.WaitUsagePost()
	if rows := service.UsageRejected(); len(rows) > 0 {
		fmt.Fprintln(stdout) // a blank line after the table; doctor prints none
		writeUsageRejected(stdout, rows)
	}
	return 0
}

// writeUsageRejected lists the rows the record rejected, for `organizer
// usage` and doctor (leftovers-54 FR-4): the count, then one line per row
// with its session, day and the record's reason. Nothing when none is.
func writeUsageRejected(w io.Writer, rows []service.RejectedUsageRow) {
	if len(rows) == 0 {
		return
	}
	fmt.Fprintf(w, "rejected by the record: %d %s, not resent until %s\n", len(rows), plural(len(rows), "row"),
		map[bool]string{true: "it changes", false: "they change"}[len(rows) == 1])
	tw := tabwriter.NewWriter(w, 0, 4, 2, ' ', 0)
	for _, r := range rows {
		fmt.Fprintf(tw, "  %s\t%s\t%s\n", r.SessionID, r.Day, r.Reason)
	}
	tw.Flush()
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
	fmt.Fprintln(w, moneyLine(t, v.LastWeek))
	fmt.Fprintf(w, "tokens    %s: %s\n", compact(t.Tokens), kindsLine(t.Input, t.Output, t.CacheRead, t.CacheWrite))
	sess := fmt.Sprintf("sessions  %d, %.1f h of work", t.Sessions, t.Hours)
	if t.Running > 0 {
		sess += fmt.Sprintf(", %d running (so far)", t.Running)
	}
	fmt.Fprintln(w, sess)
	fmt.Fprintln(w, sharesLine(ledger.SessionShares(v.Sessions)))
	var causes []string
	var costs []float64
	var total float64
	for _, s := range v.Sessions {
		m := 0.0
		if s.Money != nil {
			m = *s.Money
		}
		total += m
		if s.Task == "" {
			causes, costs = append(causes, ledger.CauseOf(s.Reason)), append(costs, m)
		}
	}
	writeCauses(w, ledger.ByCause(causes, costs, total))
	fmt.Fprintln(w)

	fmt.Fprintf(w, "by %s\n", by)
	tw := tabwriter.NewWriter(w, 0, 4, 2, ' ', 0)
	fmt.Fprintln(tw, "name\tmoney\tshare\ttokens\tinput\toutput\tcache read\tcache write\tsessions\t")
	for _, r := range v.Cuts[by] {
		name := r.Name
		if by == "task" && r.Initiative != "" {
			what := strings.Join(r.Cards, "+")
			if what == "" {
				what = strings.TrimPrefix(r.Key, r.Initiative+"/") // overhead:<role>
			}
			name = r.Initiative + "/" + what + "  " + clip(r.Name, 48)
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

// moneyLine is the money tile as a line. A week whose sessions all lack a
// cost is unknown, `—`, never $0.00 (leftovers-39 FR-2); the priced share
// is named when there is one.
func moneyLine(t, last ledger.Totals) string {
	if t.WithoutCost >= t.Sessions && !(t.Money > 0) {
		return fmt.Sprintf("money     — (no cost recorded for %d %s)", t.Sessions, plural(t.Sessions, "session"))
	}
	money := fmt.Sprintf("money     %s", dollars(t.Money))
	if last.Money > 0 {
		money += fmt.Sprintf(", %+.0f%% on last week (%s)", 100*(t.Money-last.Money)/last.Money, dollars(last.Money))
	}
	if t.WithoutCost > 0 {
		money += fmt.Sprintf("; excludes %d %s with no cost", t.WithoutCost, plural(t.WithoutCost, "session"))
	}
	if t.Priced > 0 {
		money += fmt.Sprintf("; %s priced", dollars(t.Priced))
	}
	return money
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

// writeCauses is the share with no task by cause, one line each under the
// shares line (leftovers-56 Amendment 2).
func writeCauses(w io.Writer, cs []ledger.CauseShare) {
	for _, c := range cs {
		fmt.Fprintf(w, "          %.1f%% %s\n", 100*c.Share, c.Cause)
	}
}

// sharesLine is leftovers-56 FR-6: the share of the cost spent on overhead
// (a task overhead:<role>) and the share no task claims.
func sharesLine(overhead, none float64) string {
	return fmt.Sprintf("cost      %.1f%% overhead · %.1f%% with no task", 100*overhead, 100*none)
}
