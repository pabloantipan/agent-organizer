package review

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os/exec"
	"strings"
	"time"
)

// Mismatch is one entry of revmap.json's mismatches (§6.6.3): its type and
// the node it lands on, or null with the file and symbol change-check named
// when no node matches.
type Mismatch struct {
	Type   string  `json:"type"`
	Node   *string `json:"node"`
	File   string  `json:"file,omitempty"`
	Symbol string  `json:"symbol,omitempty"`
}

// CheckFlag is one of change-check's flags[], as it prints them.
type CheckFlag struct {
	Flag   string `json:"flag"`
	Repo   string `json:"repo"`
	Path   string `json:"path"`
	Symbol string `json:"symbol"`
	Detail string `json:"detail"`
}

// checkWords is FR-11, word for word: change-check's flag to the node flag
// and the mismatch type. Any other word of change-check's has no place on
// the map and is left out.
var checkWords = map[string][2]string{
	"undeclared":            {"undeclared", "changed_not_declared"},
	"declared, not changed": {"declared_not_changed", "declared_not_changed"},
	"outside footprint":     {"outside_footprint", "outside_footprint"},
}

// MismatchTypes are the summary's counts, in this order.
var MismatchTypes = []string{"changed_not_declared", "declared_not_changed", "outside_footprint"}

// ChangeCheck runs change-check from the PATH over base..head for a card
// and returns its flags. Exit 0 (nothing flagged) and 1 (flags) both carry
// the JSON; anything else, or output that is not it, is an error that
// says why in one line (FR-12).
func ChangeCheck(dir, initiative, card, base, head string) ([]CheckFlag, error) {
	bin, err := exec.LookPath("change-check")
	if err != nil {
		return nil, errors.New("change-check not on PATH")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()
	cmd := exec.CommandContext(ctx, bin, initiative, card, "--base", base, "--head", head, "--json")
	cmd.Dir = dir
	var stdout, stderr bytes.Buffer
	cmd.Stdout, cmd.Stderr = &stdout, &stderr
	err = cmd.Run()
	var ee *exec.ExitError
	if err != nil && !(errors.As(err, &ee) && ee.ExitCode() == 1) {
		return nil, fmt.Errorf("change-check failed: %v%s", err, firstLine(stderr.String()))
	}
	var out struct {
		Flags *[]CheckFlag `json:"flags"`
	}
	if json.Unmarshal(stdout.Bytes(), &out) != nil || out.Flags == nil {
		return nil, fmt.Errorf("change-check failed: output is not its --json%s", firstLine(stderr.String()))
	}
	return *out.Flags, nil
}

func firstLine(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return ""
	}
	return ": " + strings.SplitN(s, "\n", 2)[0]
}

// Reconcile is FR-11: each flag onto the symbol nodes it names, and one
// mismatch per flag, so the map counts what change-check counts. The
// mismatch names the node when the flag lands on exactly one; otherwise it
// carries the file and symbol change-check gave, with no node. A flag with
// a path and no symbol names every changed node of that file; a declared
// name is change-check's `file`, `Symbol` or `file:Symbol`.
func Reconcile(rm *RevMap, flags []CheckFlag) {
	for _, f := range flags {
		w, ok := checkWords[f.Flag]
		if !ok {
			continue
		}
		file, sym := f.Path, f.Symbol
		if file == "" {
			if i := strings.IndexByte(sym, ':'); i >= 0 {
				file, sym = sym[:i], sym[i+1:]
			} else if strings.Contains(sym, "/") {
				file, sym = sym, ""
			}
		}
		if file != "" && len(rm.Repos) > 0 && f.Repo != "" {
			file = f.Repo + "/" + file // node files carry the repo when several changed
		}
		var hit []string
		for i := range rm.Nodes {
			n := &rm.Nodes[i]
			if n.Level != "symbol" || (file != "" && n.File != file) {
				continue
			}
			if sym == "" && (file == "" || n.Change == "affected") {
				continue
			}
			if sym != "" && symName(*n) != sym && n.ID != sym {
				continue
			}
			hit = append(hit, n.ID)
			if !contains(n.Flags, w[0]) {
				n.Flags = append(n.Flags, w[0])
			}
		}
		m := Mismatch{Type: w[1], File: file, Symbol: f.Symbol}
		if len(hit) == 1 && sym != "" {
			m = Mismatch{Type: w[1], Node: &hit[0]}
		}
		rm.Mismatches = append(rm.Mismatches, m)
	}
	if rm.Mismatches == nil {
		rm.Mismatches = []Mismatch{}
	}
}

// symName is a symbol node's name as change-check writes it: `Name`, or
// `Recv.Method` for a Go method.
func symName(n Node) string {
	if strings.HasPrefix(n.ID, "ts:") {
		return lastName(n.ID)
	}
	return strings.TrimPrefix(n.ID, n.Parent+".")
}

func contains(xs []string, x string) bool {
	for _, y := range xs {
		if y == x {
			return true
		}
	}
	return false
}
