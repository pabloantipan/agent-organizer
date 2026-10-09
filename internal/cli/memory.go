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
	m, why := service.NewWith(cfg, st, now).Memory()
	if asJSON {
		enc := json.NewEncoder(stdout)
		enc.SetIndent("", "  ")
		_ = enc.Encode(struct {
			Memory       *model.Memory `json:"memory"`
			MemoryReason string        `json:"memory_reason,omitempty"`
		}{m, why})
		if m == nil {
			return 1
		}
		return 0
	}
	if m == nil {
		fmt.Fprintln(stderr, "memory could not be read:", why)
		return 1
	}
	fmt.Fprintf(stdout, "pressure  %s\n", m.Pressure)
	fmt.Fprintf(stdout, "free      %s of %s GB\n", gb(m.FreeBytes), gb(m.TotalBytes))
	if len(m.Top) == 0 {
		fmt.Fprintln(stdout, "no agent sessions running")
		return 0
	}
	fmt.Fprintf(stdout, "agents    %s GB\n\n", gb(m.AgentsBytes))
	tw := tabwriter.NewWriter(stdout, 0, 4, 2, ' ', 0)
	fmt.Fprintln(tw, "top sessions")
	for _, s := range m.Top {
		fmt.Fprintf(tw, "  %s\t%s\t%s GB\n", s.Name, orDash(s.Initiative), gb(s.Bytes))
	}
	fmt.Fprintln(tw, "by initiative")
	for _, r := range m.ByInitiative {
		name := r.Initiative
		if r.Unassigned {
			name = "unassigned"
		}
		fmt.Fprintf(tw, "  %s\t%d agents\t%s GB\n", name, r.Agents, gb(r.Bytes))
	}
	_ = tw.Flush()
	return 0
}

// gb is bytes in GB as Activity Monitor counts them (2^30), to one decimal.
func gb(b uint64) string {
	return fmt.Sprintf("%.1f", float64(b)/(1<<30))
}

func orDash(s string) string {
	if s == "" {
		return "-"
	}
	return s
}
