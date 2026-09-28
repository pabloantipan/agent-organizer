package cli

import (
	"encoding/json"
	"fmt"
	"io"
	"sort"
	"strings"
	"text/tabwriter"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/model"
	"organizer/internal/service"
)

const decisionsUsage = "usage: organizer decisions [initiative] [--json]"

// DecisionRow is one decision record with the initiative it belongs to, as
// the CLI and its JSON print it.
type DecisionRow struct {
	Initiative string `json:"initiative"`
	Machine    string `json:"machine"`
	model.Decision
	AgeDays        int `json:"age_days"`
	TurnaroundDays int `json:"turnaround_days"`
}

func decisionsCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	args, asJSON := takeFlag(args, "--json")
	if len(args) > 1 {
		fmt.Fprintln(stderr, decisionsUsage)
		return 2
	}
	id := ""
	if len(args) == 1 {
		id = args[0]
	}
	st, _ := cache.Load()
	svc := service.NewWith(cfg, st, now)
	svc.Scan(false)
	var rows []DecisionRow
	for _, bi := range svc.Board().Initiatives {
		if id != "" && bi.ID != id {
			continue
		}
		for _, d := range bi.Decisions {
			rows = append(rows, DecisionRow{Initiative: bi.ID, Machine: bi.Machine, Decision: d, AgeDays: d.AgeDays(now()), TurnaroundDays: d.TurnaroundDays()})
		}
	}
	if asJSON {
		if rows == nil {
			rows = []DecisionRow{}
		}
		enc := json.NewEncoder(stdout)
		enc.SetIndent("", "  ")
		if err := enc.Encode(rows); err != nil {
			fmt.Fprintln(stderr, err)
			return 1
		}
		return 0
	}
	WriteDecisions(stdout, rows)
	return 0
}

// WriteDecisions prints the open queue, oldest first, then the rulings,
// newest first, with the median turnaround.
func WriteDecisions(w io.Writer, rows []DecisionRow) {
	if len(rows) == 0 {
		fmt.Fprintln(w, "no decision records (working-on/decisions/, the working-on skill)")
		return
	}
	var open, ruled, closed []DecisionRow
	for _, r := range rows {
		switch r.Status {
		case model.DecisionProposed:
			open = append(open, r)
		case model.DecisionRuled:
			ruled = append(ruled, r)
		default:
			closed = append(closed, r)
		}
	}
	sort.SliceStable(open, func(i, j int) bool { return open[i].AgeDays > open[j].AgeDays })
	sort.SliceStable(ruled, func(i, j int) bool { return ruled[i].Ruled > ruled[j].Ruled })

	tw := tabwriter.NewWriter(w, 0, 4, 2, ' ', 0)
	fmt.Fprintf(tw, "open (%d)\n", len(open))
	for _, r := range open {
		fmt.Fprintf(tw, "  %s %s\t%s\towner %s\traised %s\t%dd waiting\n", r.Initiative, r.Number, clip(r.Title, 60), dashIfEmpty(r.Owner), r.Raised, r.AgeDays)
	}
	fmt.Fprintf(tw, "ruled (%d)%s\n", len(ruled), medianNote(ruled))
	for _, r := range ruled {
		fmt.Fprintf(tw, "  %s %s\t%s\tby %s\truled %s\t%dd\n", r.Initiative, r.Number, clip(r.Title, 60), dashIfEmpty(r.RuledBy), r.Ruled, r.TurnaroundDays)
	}
	if len(closed) > 0 {
		fmt.Fprintf(tw, "superseded or withdrawn (%d)\n", len(closed))
		for _, r := range closed {
			note := r.Status
			if r.SupersededBy != "" {
				note += " by " + r.SupersededBy
			}
			fmt.Fprintf(tw, "  %s %s\t%s\t%s\t\t\n", r.Initiative, r.Number, clip(r.Title, 60), note)
		}
	}
	tw.Flush()
}

func medianNote(rows []DecisionRow) string {
	var ts []int
	for _, r := range rows {
		if r.TurnaroundDays >= 0 {
			ts = append(ts, r.TurnaroundDays)
		}
	}
	if len(ts) == 0 {
		return ""
	}
	sort.Ints(ts)
	return fmt.Sprintf(", median turnaround %dd", ts[len(ts)/2])
}

func clip(s string, n int) string {
	if r := []rune(s); len(r) > n {
		return strings.TrimSpace(string(r[:n-1])) + "…"
	}
	return s
}
