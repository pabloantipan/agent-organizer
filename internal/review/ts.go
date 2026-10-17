package review

import (
	"bytes"
	_ "embed"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
)

//go:embed tsgraph.js
var tsGraphScript string

// TSCompiler is the TypeScript source (review-map v1, FR-7, chosen by
// measurement in rm-v1-ts's Notes): tsgraph.js run by node, with the
// compiler API of the reviewed repo's own typescript. Nothing is shipped
// with the app but the script: node comes from PATH, typescript from the
// repo's node_modules (FR-10); either missing is a problem that names it,
// and the Go nodes are still written.
type TSCompiler struct{}

func (TSCompiler) Name() string { return "typescript" }

// Handles is a .ts or .tsx file whose definitions are nodes: not a .d.ts,
// not the generated wailsjs bindings, not a dependency.
func (TSCompiler) Handles(p string) bool {
	if !(strings.HasSuffix(p, ".ts") || strings.HasSuffix(p, ".tsx")) || strings.HasSuffix(p, ".d.ts") {
		return false
	}
	for _, seg := range strings.Split(filepath.ToSlash(p), "/") {
		if seg == "wailsjs" || seg == "node_modules" {
			return false
		}
	}
	return true
}

// NodeBinary is how the source finds node; doctor reports it.
func NodeBinary() (string, error) { return exec.LookPath("node") }

// TypeScriptIn is the typescript package of the repo: in node_modules of
// the root or of a directory holding a package.json, one level down (the
// organizer's frontend/). It returns the directories it looked in when
// there is none.
func TypeScriptIn(repo string) (string, []string) {
	dirs := []string{repo}
	if ents, err := os.ReadDir(repo); err == nil {
		for _, e := range ents {
			if e.IsDir() && !strings.HasPrefix(e.Name(), ".") && e.Name() != "node_modules" {
				if _, err := os.Stat(filepath.Join(repo, e.Name(), "package.json")); err == nil {
					dirs = append(dirs, filepath.Join(repo, e.Name()))
				}
			}
		}
	}
	var looked []string
	for _, d := range dirs {
		ts := filepath.Join(d, "node_modules", "typescript")
		if _, err := os.Stat(filepath.Join(ts, "package.json")); err == nil {
			return ts, nil
		}
		looked = append(looked, filepath.Join(d, "node_modules"))
	}
	return "", looked
}

type tsDef struct {
	ID       string `json:"id"`
	Pkg      string `json:"pkg"`
	Kind     string `json:"kind"`
	File     string `json:"file"`
	Start    int    `json:"start"`
	End      int    `json:"end"`
	TestFile bool   `json:"test_file"`
	TestFunc bool   `json:"test_func"`
	TestName string `json:"test_name"`
}

func (TSCompiler) Graph(root, repo string) (*Graph, error) {
	g := &Graph{Defs: map[string]Def{}, ByFile: map[string][]Def{}, Uses: map[string]map[string]bool{}}
	node, err := NodeBinary()
	if err != nil {
		g.Problems = append(g.Problems, "ts: node is not on PATH, so no TypeScript symbols were read; install Node (https://nodejs.org) or put it on PATH (organizer doctor shows it)")
		return g, nil
	}
	ts, looked := TypeScriptIn(repo)
	if ts == "" {
		g.Problems = append(g.Problems, fmt.Sprintf("ts: typescript is not installed in %s, so no TypeScript symbols were read; install the repo's dependencies there (pnpm install)", strings.Join(looked, " or ")))
		return g, nil
	}
	cmd := exec.Command(node, "-", ts, root)
	cmd.Stdin = strings.NewReader(tsGraphScript)
	var out, errb bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &errb
	if err := cmd.Run(); err != nil {
		g.Problems = append(g.Problems, fmt.Sprintf("ts: tsgraph with %s: %v: %s", ts, err, lastLines(errb.String(), 3)))
		return g, nil
	}
	var res struct {
		Defs     []tsDef             `json:"defs"`
		Uses     map[string][]string `json:"uses"`
		Problems []string            `json:"problems"`
	}
	if err := json.Unmarshal(out.Bytes(), &res); err != nil {
		g.Problems = append(g.Problems, "ts: tsgraph output: "+err.Error())
		return g, nil
	}
	for _, d := range res.Defs {
		def := Def{ID: d.ID, Pkg: d.Pkg, Kind: d.Kind, Lang: "ts", File: d.File, Start: d.Start, End: d.End,
			TestFile: d.TestFile, TestFunc: d.TestFunc, TestName: d.TestName}
		g.Defs[def.ID] = def
		g.ByFile[def.File] = append(g.ByFile[def.File], def)
	}
	for from, tos := range res.Uses {
		g.Uses[from] = map[string]bool{}
		for _, to := range tos {
			g.Uses[from][to] = true
		}
	}
	for _, p := range res.Problems {
		g.Problems = append(g.Problems, "ts: "+p)
	}
	for f := range g.ByFile {
		sort.Slice(g.ByFile[f], func(i, j int) bool { return g.ByFile[f][i].Start < g.ByFile[f][j].Start })
	}
	return g, nil
}

func lastLines(s string, n int) string {
	ls := strings.Split(strings.TrimSpace(s), "\n")
	if len(ls) > n {
		ls = ls[len(ls)-n:]
	}
	return strings.Join(ls, " | ")
}
