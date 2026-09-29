package cli

import (
	"fmt"
	"io"
	"strings"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/service"
)

// draftCellCmd starts a drafting session for an initiative without a cell
// (discovery-in-a-cell FR-3): a terminal at the root running the agent with
// the draft prompt. --print prints the prompt and opens nothing.
func draftCellCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
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
		fmt.Fprintln(stderr, "usage: organizer draft-cell <initiative-id> [--print]   (ids: organizer status; needs a goal and agents/people.md, and no agents/cell.json)")
		return 2
	}
	st, _ := cache.Load()
	svc := service.NewWith(cfg, st, now)
	svc.Scan(false)
	text, err := svc.DraftCell(id, !print)
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	if print {
		fmt.Fprint(stdout, text)
		return 0
	}
	fmt.Fprintln(stdout, "terminal opened: the drafting session writes the roster as a draft and raises its accept record")
	return 0
}
