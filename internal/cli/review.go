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

const reviewUsage = "usage: organizer review <initiative> <card-slug | sha> [--json] [--out path]   (ids: organizer status)"

// reviewCmd is review-map v0 and v1 (FR-1 to FR-10): the Go and TypeScript
// change of a card's branch or of a commit as revmap.json, written under
// the data dir (or --out) and summarised, or printed whole with --json.
func reviewCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	args, asJSON := takeFlag(args, "--json")
	args, out, _ := takeValue(args, "--out")
	if len(args) != 2 {
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
	var ranges []review.Range
	var err error
	if card := findCard(si, target); card != nil {
		ranges, err = review.CardRanges(card.Slug, card.Branch, review.ReposOf(si.Path, si.ID, card.Repos))
	} else {
		repos := review.ReposOf(si.Path, si.ID, si.Initiative.Repos)
		if len(si.Initiative.Repos) > 0 {
			repos = append(repos, review.Repo{Dir: si.Path})
		}
		ranges, err = review.CommitRanges(target, repos)
	}
	if err != nil {
		var m *review.Missing
		if errors.As(err, &m) {
			fmt.Fprintln(stderr, m.Error())
			return 2
		}
		fmt.Fprintln(stderr, err)
		return 1
	}
	work, err := os.MkdirTemp(review.DataDir(), "review-work-")
	if err != nil {
		if err = os.MkdirAll(review.DataDir(), 0o755); err == nil {
			work, err = os.MkdirTemp(review.DataDir(), "review-work-")
		}
	}
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	defer os.RemoveAll(work)
	rm, err := review.Build(id, target, ranges, review.Sources(), work)
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

func findCard(si *model.ScannedInitiative, slug string) *model.Card {
	for i := range si.Cards {
		if si.Cards[i].Slug == slug {
			return &si.Cards[i]
		}
	}
	return nil
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
