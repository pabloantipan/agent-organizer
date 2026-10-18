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

const reviewUsage = "usage: organizer review <initiative> <card-slug | sha> [--card slug] [--json] [--out path] [--work dir]\n       organizer review <initiative> <card-slug> --marks   (ids: organizer status)"

// reviewCmd is review-map v0 and v1 (FR-1 to FR-12): the Go and TypeScript
// change of a card's branch or of a commit as revmap.json, written under
// the data dir (or --out) and summarised, or printed whole with --json.
// With a card (the target, or --card beside a sha) change-check's flags
// land on the map; without one, or when change-check is missing or fails,
// the map is written without them and says why. A card resolves to its
// branch, else to its merge on main (FR-13). --work names the directory the
// build's temp dir goes under (the app's make removes it when stopped).
// --marks prints the marks' coverage of the card's map instead (v3 FR-27).
func reviewCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	args, marks := takeFlag(args, "--marks")
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
	if marks {
		return reviewMarks(si, cardSlug, ranges[0].Head, stdout, stderr)
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

// reviewMarks is FR-27: the coverage of the marks on the card's map at its
// current head, the count line and one line per question or block with
// the review's thread or `not asked`. A card with no map there exits 2.
func reviewMarks(si *model.ScannedInitiative, card, head string, stdout, stderr io.Writer) int {
	if card == "" {
		fmt.Fprintln(stderr, "--marks needs a card, not a sha")
		return 2
	}
	b, err := os.ReadFile(review.DefaultPath(si.ID, head))
	if err != nil {
		fmt.Fprintf(stderr, "no review map for %s at %s; make it with organizer review %s %s\n", card, head[:min(7, len(head))], si.ID, card)
		return 2
	}
	var rm review.RevMap
	if err := json.Unmarshal(b, &rm); err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	var repos []review.Repo
	for _, c := range si.Cards {
		if c.Slug == card {
			repos = review.ReposOf(si.Path, si.ID, c.Repos)
		}
	}
	m, err := review.ReadMarks(si.ID, card, &rm, func(n review.Node) (string, error) { return review.SymbolText(&rm, repos, n) })
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	symbols := 0
	for _, n := range rm.Nodes {
		if review.Markable(n) {
			symbols++
		}
	}
	count := map[string]int{}
	var lines []string
	for _, mk := range m.Marks {
		count[mk.State]++
		if mk.State == "reviewed" {
			continue
		}
		where := "not asked"
		if mk.Asked != "" {
			where = m.Thread
		}
		lines = append(lines, mk.Symbol+"  "+mk.State+"  "+where)
	}
	fmt.Fprintf(stdout, "Reviewed %d of %d · %d questions · %d blocked\n", count["reviewed"], symbols, count["question"], count["blocked"])
	for _, l := range lines {
		fmt.Fprintln(stdout, l)
	}
	return 0
}

// reviewStatus is doctor's line for organizer review's outside tools: the
// go toolchain, which the go/types source runs as go list, node, which
// runs the typescript of the reviewed repo's own node_modules (FR-10), and
// tar, which unpacks each side's git archive (leftovers-41 FR-8).
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
	if p, err := review.TarBinary(); err != nil {
		parts = append(parts, "tar missing from PATH; organizer review unpacks each side's git archive with it")
	} else {
		parts = append(parts, "tar at "+p)
	}
	return strings.Join(parts, "; ")
}
