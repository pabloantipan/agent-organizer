// Package review turns a Go and TypeScript change into revmap.json v0
// (docs/specs/review-map.md v0 and v1, agent-slack
// review/pipeline-starter.md §6.6.3): the definitions a diff touches, their
// one-hop callers and callees, and the tests that reference each, every
// symbol under its package. Every node and edge comes from an index source;
// nothing is guessed (§6.6.5), so risk and claim are present and empty, and
// mismatches carry only what change-check flagged for a card (reconcile.go).
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
	Mismatches []Mismatch `json:"mismatches"`
	// Reconciled is FR-11: change-check's flags for the card are on the
	// map, and Reconciliation names it; else Reconciliation is why they
	// are not, in one line (FR-12).
	Reconciled     bool     `json:"reconciled"`
	Reconciliation string   `json:"reconciliation,omitempty"`
	Stats          Stats    `json:"stats"`
	Problems       []string `json:"problems,omitempty"`
	// Notes are what the review did to an export to read it (FR-9), once.
	Notes []string `json:"notes,omitempty"`
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
	Packages     int `json:"packages"`
	Changed      int `json:"changed"`
	ChangedTests int `json:"changed_tests"`
	Affected     int `json:"affected"`
	Untested     int `json:"untested"`
	Edges        int `json:"edges"`
}

// Build exports base and head of each range under work (removed by the
// caller), reads both through every source, and assembles the map.
func Build(initiative, target string, ranges []Range, srcs []Source, work string) (*RevMap, error) {
	rm := &RevMap{Version: "0", Initiative: initiative, Target: target,
		Nodes: []Node{}, Edges: []Edge{}, Mismatches: []Mismatch{}}
	produced := map[string]bool{}
	for i, r := range ranges {
		if i == 0 {
			rm.Base, rm.Head = r.Base, r.Head
		}
		if len(ranges) > 1 {
			rm.Repos = append(rm.Repos, RepoPair{Name: r.Name, Base: r.Base, Head: r.Head, From: r.From})
		}
		res, err := buildRepo(r, srcs, filepath.Join(work, fmt.Sprintf("%d", i)))
		if err != nil {
			return nil, err
		}
		rm.Nodes = append(rm.Nodes, res.nodes...)
		rm.Edges = append(rm.Edges, res.edges...)
		rm.Problems = append(rm.Problems, res.problems...)
		rm.Notes = append(rm.Notes, res.notes...)
		for _, name := range res.sources {
			produced[name] = true
		}
	}
	rm.Notes = uniqKeep(rm.Notes)
	// Source names only the sources that produced a node (leftovers-41
	// FR-9), in their registered order: one that ran and read nothing, or
	// never ran, is not what the map was read with.
	var names []string
	for _, s := range srcs {
		if produced[s.Name()] {
			names = append(names, s.Name())
		}
	}
	rm.Source = strings.Join(names, ", ")
	for _, n := range rm.Nodes {
		switch {
		case n.Level == "package":
			rm.Stats.Packages++
			continue
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
	pkgs := map[string]bool{}
	for _, n := range rm.Nodes {
		pkgs[n.ID] = n.Level == "package"
	}
	for _, e := range rm.Edges {
		if !pkgs[e.From] {
			rm.Stats.Edges++ // symbol edges; package edges summarise them
		}
	}
	return rm, nil
}

type repoResult struct {
	nodes           []Node
	edges           []Edge
	problems, notes []string
	// sources are the names of the sources whose definitions are nodes.
	sources []string
}

// merge adds another source's graph; ids never collide across languages.
func (g *Graph) merge(o *Graph, src string, srcOf map[string]string) {
	for id, d := range o.Defs {
		g.Defs[id] = d
		srcOf[id] = src
	}
	for f, ds := range o.ByFile {
		g.ByFile[f] = append(g.ByFile[f], ds...)
	}
	for from, tos := range o.Uses {
		g.Uses[from] = tos
	}
	g.Problems = append(g.Problems, o.Problems...)
	g.Notes = append(g.Notes, o.Notes...)
}

func buildRepo(r Range, srcs []Source, work string) (repoResult, error) {
	var res repoResult
	handles := func(p string) bool {
		for _, s := range srcs {
			if s.Handles(p) {
				return true
			}
		}
		return false
	}
	hunks, err := Hunks(r.Repo, r.Base, r.Head, handles)
	if err != nil {
		return res, err
	}
	if len(hunks) == 0 {
		return res, nil
	}
	baseDir, headDir := filepath.Join(work, "base"), filepath.Join(work, "head")
	if err := Export(r.Repo, r.Base, baseDir); err != nil {
		return res, err
	}
	if err := Export(r.Repo, r.Head, headDir); err != nil {
		return res, err
	}
	// A source runs only when a changed file is its own, so a Go-only
	// change never needs node.
	empty := func() *Graph {
		return &Graph{Defs: map[string]Def{}, ByFile: map[string][]Def{}, Uses: map[string]map[string]bool{}}
	}
	head, base := empty(), empty()
	srcOf := map[string]string{}
	for _, s := range srcs {
		used := false
		for _, f := range hunks {
			used = used || s.Handles(f.Base) || s.Handles(f.Head)
		}
		if !used {
			continue
		}
		h, err := s.Graph(headDir, r.Repo)
		if err != nil {
			return res, err
		}
		b, err := s.Graph(baseDir, r.Repo)
		if err != nil {
			return res, err
		}
		head.merge(h, s.Name(), srcOf)
		base.merge(b, s.Name(), srcOf)
	}
	// A problem both sides share is said once, unprefixed.
	inBase := map[string]bool{}
	for _, p := range base.Problems {
		inBase[p] = true
	}
	for _, p := range head.Problems {
		if inBase[p] {
			res.problems = append(res.problems, p)
			delete(inBase, p)
			continue
		}
		res.problems = append(res.problems, "head: "+p)
	}
	for _, p := range base.Problems {
		if inBase[p] {
			res.problems = append(res.problems, "base: "+p)
		}
	}
	res.problems = uniqKeep(res.problems)
	res.notes = append(append(res.notes, head.Notes...), base.Notes...)

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
		name := d.testName()
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
		n := Node{ID: id, Level: "symbol", Parent: d.Pkg, Kind: d.Kind, Lang: d.Lang, File: prefix + d.File,
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
	produced := map[string]bool{}
	for id, ch := range changed {
		nodes = append(nodes, node(id, ch))
		produced[srcOf[id]] = true
	}
	for id := range affected {
		nodes = append(nodes, node(id, "affected"))
		produced[srcOf[id]] = true
	}
	for name := range produced {
		res.sources = append(res.sources, name)
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
		es = append(es, Edge{From: k[0], To: k[1], Kind: "uses", Change: ch, Source: srcOf[k[0]]})
	}
	pkgNodes, pkgEdges := packageLevel(nodes, es, prefix)
	nodes = append(pkgNodes, nodes...)
	es = append(es, pkgEdges...)
	sort.Slice(es, func(i, j int) bool {
		if es[i].From != es[j].From {
			return es[i].From < es[j].From
		}
		return es[i].To < es[j].To
	})
	res.nodes, res.edges = nodes, es
	return res, nil
}

// packageLevel is FR-8: one package node per parent of a symbol node, modified
// when any child changed, else affected; and one package uses edge for
// each pair of packages a symbol edge crosses, with that edge's change
// read across all of them (on a side when any symbol edge is).
func packageLevel(nodes []Node, edges []Edge, prefix string) ([]Node, []Edge) {
	pkg := map[string]*Node{}
	var order []string
	parentOf := map[string]string{}
	for _, n := range nodes {
		parentOf[n.ID] = n.Parent
		p := pkg[n.Parent]
		if p == nil {
			p = &Node{ID: n.Parent, Level: "package", Kind: "package", Lang: n.Lang, File: prefix + pkgFile(n),
				Change: "affected", Evidence: Evidence{Tests: []string{}}, Flags: []string{}, Review: Review{State: "unreviewed"}}
			pkg[n.Parent] = p
			order = append(order, n.Parent)
		}
		if n.Change != "affected" {
			p.Change = "modified"
		}
	}
	sort.Strings(order)
	out := make([]Node, 0, len(order))
	for _, id := range order {
		out = append(out, *pkg[id])
	}
	type side struct{ head, base bool }
	cross := map[[2]string]*side{}
	src := map[[2]string]string{}
	for _, e := range edges {
		from, to := parentOf[e.From], parentOf[e.To]
		if from == "" || to == "" || from == to {
			continue
		}
		k := [2]string{from, to}
		if cross[k] == nil {
			cross[k] = &side{}
			src[k] = e.Source
		}
		cross[k].head = cross[k].head || e.Change != "deleted"
		cross[k].base = cross[k].base || e.Change != "added"
	}
	var es []Edge
	for k, s := range cross {
		ch := "unchanged"
		switch {
		case s.head && !s.base:
			ch = "added"
		case !s.head:
			ch = "deleted"
		}
		es = append(es, Edge{From: k[0], To: k[1], Kind: "uses", Change: ch, Source: src[k]})
	}
	return out, es
}

// pkgFile is a package node's file: the directory of its symbols' files.
func pkgFile(n Node) string {
	if i := strings.LastIndexByte(n.File, '/'); i >= 0 {
		return n.File[:i]
	}
	return "."
}

// lastName is a definition's name: after the # of a TS id, else after the
// last dot of a Go one.
func lastName(id string) string {
	if i := strings.IndexByte(id, '#'); i >= 0 && strings.HasPrefix(id, "ts:") {
		return id[i+1:]
	}
	return id[strings.LastIndexByte(id, '.')+1:]
}

// uniqKeep drops repeats, keeping the first order.
func uniqKeep(xs []string) []string {
	seen := map[string]bool{}
	var out []string
	for _, x := range xs {
		if !seen[x] {
			seen[x] = true
			out = append(out, x)
		}
	}
	return out
}

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
	src := rm.Source
	if src == "" {
		src = "no source read a node"
	}
	fmt.Fprintf(w, "%s %s: %s..%s (%s)\n", rm.Initiative, rm.Target, short(rm.Base), short(rm.Head), src)
	fmt.Fprintf(w, "changed %d (and %d tests), affected %d, untested %d, edges %d, packages %d\n",
		rm.Stats.Changed, rm.Stats.ChangedTests, rm.Stats.Affected, rm.Stats.Untested, rm.Stats.Edges, rm.Stats.Packages)
	if rm.Reconciled {
		count := map[string]int{}
		for _, m := range rm.Mismatches {
			count[m.Type]++
		}
		var parts []string
		for _, t := range MismatchTypes {
			parts = append(parts, fmt.Sprintf("%s %d", t, count[t]))
		}
		fmt.Fprintf(w, "mismatches (%s): %s\n", rm.Reconciliation, strings.Join(parts, ", "))
	} else if rm.Reconciliation != "" {
		fmt.Fprintln(w, "no reconciliation: "+rm.Reconciliation)
	}
	in := map[string]int{}
	for _, e := range rm.Edges {
		in[e.To]++
	}
	var top []Node
	for _, n := range rm.Nodes {
		if n.Level == "symbol" && n.Change != "affected" && n.Kind != "test" {
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
		fmt.Fprintf(w, "  %-9s %2d callers %2d tests  %s%s\n", n.Change, in[n.ID], len(n.Evidence.Tests), strings.TrimPrefix(strings.TrimPrefix(n.ID, "go:"), "ts:"), flag)
	}
	for _, n := range rm.Notes {
		fmt.Fprintln(w, "  "+n)
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
