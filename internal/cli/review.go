package cli

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"organizer/internal/config"
	"organizer/internal/model"
	"organizer/internal/review"
	"organizer/internal/scan"
)

const reviewUsage = "usage: organizer review <initiative> <card-slug | sha> [--card slug] [--json] [--out path] [--work dir]   (ids: organizer status)"

// reviewCmd is review-map v0 and v1 (FR-1 to FR-12): the Go and TypeScript
// change of a card's branch or of a commit as revmap.json, written under
// the data dir (or --out) and summarised, or printed whole with --json.
// With a card (the target, or --card beside a sha) change-check's flags
// land on the map; without one, or when change-check is missing or fails,
// the map is written without them and says why. A card resolves to its
// branch, else to its merge on main (FR-13). --work names the directory the
// build's temp dir goes under (the app's make removes it when stopped).
func reviewCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	args, asJSON := takeFlag(args, "--json")
	args, out, _ := takeValue(args, "--out")
	args, cardSlug, cardGiven := takeValue(args, "--card")
	args, work, workGiven := takeValue(args, "--work")
	if len(args) != 2 || (cardGiven && cardSlug == "") || (workGiven && work == "") {
		fmt.Fprintln(stderr, reviewUsage)
		return 2
	}
	id, target := args[0], args[1]
	snap := scan.Run(scanOptions(cfg, now, false))
	var si *model.ScannedInitiative
	for i := range snap.Initiatives {
		if snap.Initiatives[i].ID == id {
			si = &snap.Initiatives[i]
		}
	}
	if si == nil {
		fmt.Fprintf(stderr, "initiative %q not found on this machine\n", id)
		return 2
	}
	ranges, card, err := review.Resolve(si, target)
	if err != nil {
		var m *review.Missing
		if errors.As(err, &m) {
			fmt.Fprintln(stderr, m.Error())
			return 2
		}
		fmt.Fprintln(stderr, err)
		return 1
	}
	if cardSlug == "" {
		cardSlug = card
	}
	if work == "" {
		work = review.DataDir()
	}
	rm, err := review.Make(si, target, cardSlug, ranges, work)
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	if out == "" {
		out = review.DefaultPath(id, rm.Head)
	}
	b, _ := json.MarshalIndent(rm, "", "  ")
	b = append(b, '\n')
	if err := os.MkdirAll(filepath.Dir(out), 0o755); err == nil {
		err = os.WriteFile(out, b, 0o644)
	}
	if err != nil {
		fmt.Fprintln(stderr, "write:", err)
		return 1
	}
	if asJSON {
		_, _ = stdout.Write(b)
		return 0
	}
	review.WriteSummary(stdout, rm, out)
	return 0
}

// reviewStatus is doctor's line for organizer review's outside tools: the
// go toolchain, which the go/types source runs as go list, and node, which
// runs the typescript of the reviewed repo's own node_modules (FR-10).
func reviewStatus() string {
	var parts []string
	if p, err := review.GoBinary(); err != nil {
		parts = append(parts, "go not on PATH; organizer review needs it (https://go.dev/dl/) and the reviewed module's dependencies downloaded (go mod download in that repo)")
	} else {
		parts = append(parts, "go at "+p)
	}
	if p, err := review.NodeBinary(); err != nil {
		parts = append(parts, "node not on PATH, so no TypeScript is read; install Node (https://nodejs.org)")
	} else {
		parts = append(parts, "node at "+p+" (typescript from the reviewed repo's node_modules)")
	}
	return strings.Join(parts, "; ")
}
