package cli

import (
	"encoding/json"
	"fmt"
	"io"
	"text/tabwriter"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/model"
	"organizer/internal/service"
)

// memoryCmd prints this Mac's memory once: pressure, free of total, the
// biggest agent sessions and each initiative's agents (ram-indicator FR-3).
// It reads only: no cache save, no statusline records touched.
func memoryCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	args, asJSON := takeFlag(args, "--json")
	if len(args) > 0 {
		fmt.Fprintln(stderr, "usage: organizer memory [--json]")
		return 2
	}
	st, _ := cache.Load()
	r := service.NewWith(cfg, st, now).Memory()
	if asJSON {
		enc := json.NewEncoder(stdout)
		enc.SetIndent("", "  ")
		_ = enc.Encode(r)
		if r.Memory == nil {
			return 1
		}
		return 0
	}
	if r.Memory == nil {
		fmt.Fprintln(stderr, "memory could not be read:", r.Reason)
		return 1
	}
	printMemory(stdout, *r.Memory, r.Sessions, r.MemSource)
	return 0
}

// printMemory writes pressure, free of total, then every initiative biggest
// first with its total and each of its sessions under it, unassigned last
// (FR-3, amendment 2), and whether the agents' bytes are footprints or
// resident sizes (Amendment 4). The feed's top five is in --json only.
func printMemory(w io.Writer, m model.Memory, sessions []model.MemorySession, source string) {
	fmt.Fprintf(w, "pressure  %s\n", m.Pressure)
	fmt.Fprintf(w, "free      %s of %s GB\n", gb(m.FreeBytes), gb(m.TotalBytes))
	if len(sessions) == 0 {
		fmt.Fprintln(w, "no agent sessions running")
		return
	}
	fmt.Fprintf(w, "agents    %s GB (%s)\n\n", gb(m.AgentsBytes), source)
	tw := tabwriter.NewWriter(w, 0, 4, 2, ' ', 0)
	rows := make([]model.MemoryInitiative, 0, len(m.ByInitiative))
	for _, r := range m.ByInitiative {
		if !r.Unassigned {
			rows = append(rows, r)
		}
	}
	for _, r := range m.ByInitiative {
		if r.Unassigned {
			rows = append(rows, r)
		}
	}
	for _, r := range rows {
		name := r.Initiative
		if r.Unassigned {
			name = "unassigned"
		}
		fmt.Fprintf(tw, "%s\t%d agents\t%s GB\n", name, r.Agents, gb(r.Bytes))
		for _, s := range sessions {
			if s.Initiative == r.Initiative {
				fmt.Fprintf(tw, "  %s\t\t%s GB\n", s.Name, gb(s.Bytes))
			}
		}
	}
	_ = tw.Flush()
}

// gb is bytes in GB as Activity Monitor counts them (2^30), to one decimal.
func gb(b uint64) string {
	return fmt.Sprintf("%.1f", float64(b)/(1<<30))
}
