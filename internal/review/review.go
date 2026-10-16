// Package review turns a Go change into revmap.json v0 (docs/specs/review-map.md,
// agent-slack review/pipeline-starter.md §6.6.3): the definitions a diff
// touches, their one-hop callers and callees, and the tests that reference
// each. Every node and edge comes from the index source; nothing is guessed
// (§6.6.5), so risk, claim and mismatches are present and empty in v0.
package review

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// RevMap is revmap.json, version 0.
type RevMap struct {
	Version    string     `json:"version"`
	Initiative string     `json:"initiative"`
	Target     string     `json:"target"` // the card slug or commit asked for
	Base       string     `json:"base"`
	Head       string     `json:"head"`
	Repos      []RepoPair `json:"repos,omitempty"` // only when more than one repo changed
	Source     string     `json:"source"`
	Nodes      []Node     `json:"nodes"`
	Edges      []Edge     `json:"edges"`
	Mismatches []any      `json:"mismatches"`
	Stats      Stats      `json:"stats"`
	Problems   []string   `json:"problems,omitempty"`
}

type RepoPair struct {
	Name string `json:"name"`
	Base string `json:"base"`
	Head string `json:"head"`
	From string `json:"from"`
}

type Node struct {
	ID        string   `json:"id"`
	Level     string   `json:"level"`
	Parent    string   `json:"parent"`
	Kind      string   `json:"kind"`
	Lang      string   `json:"lang"`
	File      string   `json:"file"`
	RangeHead *[2]int  `json:"range_head"`
	RangeBase *[2]int  `json:"range_base"`
	Change    string   `json:"change"`
	Risk      *string  `json:"risk"`
	Evidence  Evidence `json:"evidence"`
	Claim     *string  `json:"claim"`
	Flags     []string `json:"flags"`
	Review    Review   `json:"review"`
}

type Evidence struct {
	Tests []string `json:"tests"`
}

type Review struct {
	State string  `json:"state"`
	By    *string `json:"by"`
	At    *string `json:"at"`
	Note  *string `json:"note"`
}

type Edge struct {
	From   string `json:"from"`
	To     string `json:"to"`
	Kind   string `json:"kind"`
	Change string `json:"change"`
	Source string `json:"source"`
}

type Stats struct {
	Changed      int `json:"changed"`
	ChangedTests int `json:"changed_tests"`
	Affected     int `json:"affected"`
	Untested     int `json:"untested"`
	Edges        int `json:"edges"`
}

// Build exports base and head of each range under work (removed by the
// caller), reads both through src, and assembles the map.
func Build(initiative, target string, ranges []Range, src Source, work string) (*RevMap, error) {
	rm := &RevMap{Version: "0", Initiative: initiative, Target: target, Source: src.Name(),
		Nodes: []Node{}, Edges: []Edge{}, Mismatches: []any{}}
	for i, r := range ranges {
		if i == 0 {
			rm.Base, rm.Head = r.Base, r.Head
		}
		if len(ranges) > 1 {
			rm.Repos = append(rm.Repos, RepoPair{Name: r.Name, Base: r.Base, Head: r.Head, From: r.From})
		}
		nodes, edges, problems, err := buildRepo(r, src, filepath.Join(work, fmt.Sprintf("%d", i)))
		if err != nil {
			return nil, err
		}
		rm.Nodes = append(rm.Nodes, nodes...)
		rm.Edges = append(rm.Edges, edges...)
		rm.Problems = append(rm.Problems, problems...)
	}
	for _, n := range rm.Nodes {
		switch {
		case n.Change == "affected":
			rm.Stats.Affected++
		case n.Kind == "test":
			rm.Stats.ChangedTests++
		default:
			rm.Stats.Changed++
		}
		for _, f := range n.Flags {
			if f == "untested" {
				rm.Stats.Untested++
			}
		}
	}
	rm.Stats.Edges = len(rm.Edges)
	return rm, nil
}

func buildRepo(r Range, src Source, work string) ([]Node, []Edge, []string, error) {
	hunks, err := Hunks(r.Repo, r.Base, r.Head)
	if err != nil {
		return nil, nil, nil, err
	}
	if len(hunks) == 0 {
		return nil, nil, nil, nil
	}
	baseDir, headDir := filepath.Join(work, "base"), filepath.Join(work, "head")
	if err := Export(r.Repo, r.Base, baseDir); err != nil {
		return nil, nil, nil, err
	}
	if err := Export(r.Repo, r.Head, headDir); err != nil {
		return nil, nil, nil, err
	}
	head, err := src.Graph(headDir)
	if err != nil {
		return nil, nil, nil, err
	}
	base, err := src.Graph(baseDir)
	if err != nil {
		return nil, nil, nil, err
	}
	var problems []string
	for _, p := range head.Problems {
		problems = append(problems, "head: "+p)
	}
	for _, p := range base.Problems {
		problems = append(problems, "base: "+p)
	}

	// Changed: every definition a hunk overlaps, on its own side.
	changed := map[string]string{}
	touch := func(g *Graph, file string, spans []span) {
		for _, d := range g.ByFile[file] {
			for _, s := range spans {
				if s.from <= d.End && d.Start <= s.to {
					changed[d.ID] = ""
					break
				}
			}
		}
	}
	for _, f := range hunks {
		if f.Head != "" {
			touch(head, f.Head, f.HeadLines)
		}
		if f.Base != "" {
			touch(base, f.Base, f.BaseLines)
		}
	}
	for id := range changed {
		_, inHead := head.Defs[id]
		_, inBase := base.Defs[id]
		switch {
		case inHead && inBase:
			changed[id] = "modified"
		case inHead:
			changed[id] = "added"
		default:
			changed[id] = "deleted"
		}
	}

	// callers[x] is the non-test definitions of head whose body uses x;
	// tests[x] the Test functions that reach x, directly or through helpers
	// of the test files (FR-3: references from _test.go files).
	callers := map[string][]string{}
	for from, tos := range head.Uses {
		if head.Defs[from].TestFile {
			continue
		}
		for to := range tos {
			callers[to] = append(callers[to], from)
		}
	}
	tests := map[string][]string{}
	for id, d := range head.Defs {
		if !d.TestFunc {
			continue
		}
		name := d.File + "::" + lastName(id)
		seen := map[string]bool{id: true}
		queue := []string{id}
		for len(queue) > 0 {
			cur := queue[0]
			queue = queue[1:]
			for to := range head.Uses[cur] {
				if head.Defs[to].TestFile {
					if !seen[to] {
						seen[to] = true
						queue = append(queue, to)
					}
					continue
				}
				tests[to] = append(tests[to], name)
			}
		}
	}

	affected := map[string]bool{}
	edges := map[[2]string]string{}
	edge := func(from, to string) {
		_, h := head.Uses[from][to]
		_, b := base.Uses[from][to]
		switch {
		case h && b:
			edges[[2]string{from, to}] = "unchanged"
		case h:
			edges[[2]string{from, to}] = "added"
		default:
			edges[[2]string{from, to}] = "deleted"
		}
	}
	for id, ch := range changed {
		g := head
		if ch == "deleted" {
			g = base
		}
		if g.Defs[id].TestFile {
			continue // a changed test is a node; what it reaches is evidence, not a hop
		}
		if ch != "deleted" {
			for _, c := range callers[id] {
				edge(c, id)
				if _, ok := changed[c]; !ok {
					affected[c] = true
				}
			}
		}
		for to := range g.Uses[id] {
			if g.Defs[to].TestFile {
				continue
			}
			edge(id, to)
			if _, ok := changed[to]; !ok {
				affected[to] = true
			}
		}
	}

	prefix := ""
	if r.Name != "" {
		prefix = r.Name + "/"
	}
	node := func(id, change string) Node {
		d, inHead := head.Defs[id]
		bd, inBase := base.Defs[id]
		if !inHead {
			d = bd
		}
		n := Node{ID: id, Level: "symbol", Parent: d.Pkg, Kind: d.Kind, Lang: "go", File: prefix + d.File,
			Change: change, Evidence: Evidence{Tests: []string{}}, Flags: []string{}, Review: Review{State: "unreviewed"}}
		if inHead {
			n.RangeHead = &[2]int{d.Start, d.End}
			ts := uniq(tests[id])
			for i := range ts {
				ts[i] = prefix + ts[i]
			}
			n.Evidence.Tests = ts
		}
		if inBase {
			n.RangeBase = &[2]int{bd.Start, bd.End}
		}
		if (change == "added" || change == "modified") && d.Kind != "test" && len(n.Evidence.Tests) == 0 {
			n.Flags = append(n.Flags, "untested")
		}
		return n
	}
	var nodes []Node
	for id, ch := range changed {
		nodes = append(nodes, node(id, ch))
	}
	for id := range affected {
		nodes = append(nodes, node(id, "affected"))
	}
	sort.Slice(nodes, func(i, j int) bool {
		ai, aj := nodes[i].Change == "affected", nodes[j].Change == "affected"
		if ai != aj {
			return !ai
		}
		return nodes[i].ID < nodes[j].ID
	})
	var es []Edge
	for k, ch := range edges {
		es = append(es, Edge{From: k[0], To: k[1], Kind: "uses", Change: ch, Source: src.Name()})
	}
	sort.Slice(es, func(i, j int) bool {
		if es[i].From != es[j].From {
			return es[i].From < es[j].From
		}
		return es[i].To < es[j].To
	})
	return nodes, es, problems, nil
}

func lastName(id string) string { return id[strings.LastIndexByte(id, '.')+1:] }

func uniq(xs []string) []string {
	sort.Strings(xs)
	out := []string{}
	for i, x := range xs {
		if i == 0 || xs[i-1] != x {
			out = append(out, x)
		}
	}
	return out
}

// DefaultPath is <data>/organizer/review/<initiative>/<head>/revmap.json,
// the data dir being XDG_DATA_HOME or ~/.local/share as everywhere else.
func DefaultPath(initiative, head string) string {
	return filepath.Join(DataDir(), "review", initiative, head, "revmap.json")
}

// DataDir is the organizer's data dir.
func DataDir() string {
	base := os.Getenv("XDG_DATA_HOME")
	if base == "" {
		home, _ := os.UserHomeDir()
		base = filepath.Join(home, ".local", "share")
	}
	return filepath.Join(base, "organizer")
}

// WriteSummary prints what a reviewer reads first: the counts, then the
// changed symbols with the most callers.
func WriteSummary(w io.Writer, rm *RevMap, path string) {
	fmt.Fprintf(w, "%s %s: %s..%s (%s)\n", rm.Initiative, rm.Target, short(rm.Base), short(rm.Head), rm.Source)
	fmt.Fprintf(w, "changed %d (and %d tests), affected %d, untested %d, edges %d\n",
		rm.Stats.Changed, rm.Stats.ChangedTests, rm.Stats.Affected, rm.Stats.Untested, rm.Stats.Edges)
	in := map[string]int{}
	for _, e := range rm.Edges {
		in[e.To]++
	}
	var top []Node
	for _, n := range rm.Nodes {
		if n.Change != "affected" && n.Kind != "test" {
			top = append(top, n)
		}
	}
	sort.SliceStable(top, func(i, j int) bool {
		if in[top[i].ID] != in[top[j].ID] {
			return in[top[i].ID] > in[top[j].ID]
		}
		return top[i].ID < top[j].ID
	})
	if len(top) > 0 {
		fmt.Fprintln(w, "top changed by callers:")
	}
	for i, n := range top {
		if i == 10 {
			break
		}
		flag := ""
		if len(n.Flags) > 0 {
			flag = "  " + strings.Join(n.Flags, ",")
		}
		fmt.Fprintf(w, "  %-9s %2d callers %2d tests  %s%s\n", n.Change, in[n.ID], len(n.Evidence.Tests), strings.TrimPrefix(n.ID, "go:"), flag)
	}
	hint := false
	for _, p := range rm.Problems {
		fmt.Fprintln(w, "  ! "+p)
		hint = hint || strings.Contains(p, "GOPROXY=off") || strings.Contains(p, "missing go.sum entry")
	}
	if hint {
		fmt.Fprintln(w, "  dependencies are not in the module cache and review never downloads: run go mod download in the reviewed repo, then again")
	}
	if path != "" {
		fmt.Fprintln(w, "wrote", path)
	}
}
