package review

import (
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

// checkPackages is T4 on any map: every symbol's parent is a package node
// in nodes, and a package uses edge exists only where a symbol edge crosses
// those two packages.
func checkPackages(t *testing.T, rm *RevMap) {
	t.Helper()
	level := map[string]string{}
	parent := map[string]string{}
	for _, n := range rm.Nodes {
		level[n.ID] = n.Level
		parent[n.ID] = n.Parent
	}
	seen := map[string]int{}
	for _, n := range rm.Nodes {
		if n.Level == "package" {
			seen[n.ID]++
			continue
		}
		if level[n.Parent] != "package" {
			t.Errorf("symbol %s: parent %q is not a package node", n.ID, n.Parent)
		}
	}
	for id, c := range seen {
		if c != 1 {
			t.Errorf("package %s emitted %d times", id, c)
		}
	}
	crossed := map[[2]string]bool{}
	for _, e := range rm.Edges {
		if level[e.From] == "symbol" {
			crossed[[2]string{parent[e.From], parent[e.To]}] = true
		}
	}
	for _, e := range rm.Edges {
		if level[e.From] == "package" && !crossed[[2]string{e.From, e.To}] {
			t.Errorf("package edge %s -> %s with no symbol edge", e.From, e.To)
		}
	}
}

// typescriptHere is this checkout's frontend typescript, which make test
// installs before go test runs.
func typescriptHere(t *testing.T) string {
	t.Helper()
	ts, looked := TypeScriptIn(filepath.Join("..", ".."))
	if ts == "" {
		t.Skipf("typescript not installed in %v: run pnpm install --frozen-lockfile in frontend/ (make test does)", looked)
	}
	abs, _ := filepath.Abs(ts)
	if _, err := NodeBinary(); err != nil {
		t.Skip("node not on PATH")
	}
	return abs
}

type fixture struct {
	t   *testing.T
	dir string
}

func (f fixture) git(args ...string) string {
	f.t.Helper()
	cmd := exec.Command("git", append([]string{"-C", f.dir}, args...)...)
	cmd.Env = append(os.Environ(), "GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t", "GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t", "GIT_CONFIG_GLOBAL=/dev/null")
	out, err := cmd.CombinedOutput()
	if err != nil {
		f.t.Fatalf("git %v: %v\n%s", args, err, out)
	}
	return strings.TrimSpace(string(out))
}

func (f fixture) write(rel, body string) {
	f.t.Helper()
	p := filepath.Join(f.dir, rel)
	_ = os.MkdirAll(filepath.Dir(p), 0o755)
	if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
		f.t.Fatal(err)
	}
}

// tsRepo is a Go module with a frontend: on main lib/a.ts holds f (calls
// g), g and type T, a.test.ts tests f through a helper, components/B.tsx
// renders through f, plus generated wailsjs and a .d.ts; the merged branch
// changes f's body, adds h (untested) and K (a const B now uses), changes
// the wailsjs file, the .d.ts and one Go function. It returns the repo and
// the merge.
func tsRepo(t *testing.T) (string, string) {
	f := fixture{t, t.TempDir()}
	f.git("init", "-q", "-b", "main")
	f.write(".gitignore", "node_modules/\n")
	f.write("go.mod", "module example.com/m\n\ngo 1.22\n")
	f.write("p/p.go", "package p\n\nfunc Go() int { return 1 }\n")
	f.write("frontend/package.json", `{"name":"fx","private":true}`+"\n")
	f.write("frontend/src/lib/a.ts", `import { Thing } from "../../wailsjs/go/models";

/** f calls g. */
export function f(x: number): number {
  return g(x) + 1;
}

const g = (x: number) => x * 2;

export type T = { n: number; t?: Thing };
`)
	f.write("frontend/src/lib/a.test.ts", `import { describe, expect, it } from "vitest";
import { f } from "./a";

const helper = () => f(1);

describe("f adds one", () => {
  it("to g", () => { expect(helper()).toBe(3); });
});
`)
	f.write("frontend/src/components/B.tsx", `import { f, type T } from "../lib/a";

export function B({ t }: { t: T }) {
  return <span>{f(t.n)}</span>;
}
`)
	f.write("frontend/wailsjs/go/models.ts", "export class Thing { a = 1; }\n")
	f.write("frontend/src/env.d.ts", "declare const X: number;\n")
	f.git("add", ".")
	f.git("commit", "-q", "-m", "base")
	f.git("checkout", "-q", "-b", "feat")
	f.write("frontend/src/lib/a.ts", `import { Thing } from "../../wailsjs/go/models";

/** f calls g. */
export function f(x: number): number {
  return g(x) + 2;
}

const g = (x: number) => x * 2;

export type T = { n: number; t?: Thing };

export function h(): number { return f(0); }

export const K = 3;
`)
	f.write("frontend/src/components/B.tsx", `import { f, K, type T } from "../lib/a";

export function B({ t }: { t: T }) {
  return <span>{f(t.n) + K}</span>;
}
`)
	f.write("frontend/wailsjs/go/models.ts", "export class Thing { a = 2; }\n")
	f.write("frontend/src/env.d.ts", "declare const X: string;\n")
	f.write("p/p.go", "package p\n\nfunc Go() int { return 2 }\n")
	f.git("commit", "-q", "-am", "feat")
	f.git("checkout", "-q", "main")
	f.git("merge", "-q", "--no-ff", "-m", "merge feat", "feat")
	return f.dir, f.git("rev-parse", "HEAD")
}

// T1-T4 on a fixture: TS definitions with their change and lang, 1-hop
// callers with uses edges, tests named by describe, untested, no node from
// wailsjs or a .d.ts, every symbol under a package node.
func TestTSOnMerge(t *testing.T) {
	ts := typescriptHere(t)
	dir, merge := tsRepo(t)
	if err := os.MkdirAll(filepath.Join(dir, "frontend", "node_modules"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.Symlink(ts, filepath.Join(dir, "frontend", "node_modules", "typescript")); err != nil {
		t.Fatal(err)
	}
	ranges, err := CommitRanges(merge, []Repo{{Dir: dir}})
	if err != nil {
		t.Fatal(err)
	}
	rm, err := Build("init", merge, ranges, Sources(), t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	nodes := byID(rm)
	const a = "ts:frontend/src/lib/a.ts#"
	const b = "ts:frontend/src/components/B.tsx#"
	want := map[string]string{a + "f": "modified", a + "h": "added", a + "K": "added", b + "B": "modified",
		"go:example.com/m/p.Go": "modified"}
	for id, ch := range want {
		if nodes[id].Change != ch {
			t.Errorf("%s change %q, want %q", id, nodes[id].Change, ch)
		}
	}
	for _, n := range rm.Nodes {
		if n.Level == "symbol" && n.Change != "affected" && want[n.ID] == "" {
			t.Errorf("changed node %s (%s) not expected", n.ID, n.Change)
		}
		if strings.Contains(n.File, "wailsjs") || strings.HasSuffix(n.File, ".d.ts") {
			t.Errorf("node %s from %s", n.ID, n.File)
		}
	}
	if n := nodes[a+"f"]; n.Lang != "ts" || n.Kind != "function" || n.RangeHead == nil || n.RangeHead[0] != 3 {
		t.Errorf("f node %+v", n)
	}
	if n := nodes[b+"B"]; n.Kind != "component" {
		t.Errorf("B kind %q", n.Kind)
	}
	if n := nodes[a+"g"]; n.Change != "affected" {
		t.Errorf("g (called by f) %+v", n)
	}
	if n := nodes[a+"T"]; n.Change != "affected" {
		t.Errorf("T (used by B) %+v", n)
	}
	for _, e := range [][2]string{{b + "B", a + "f"}, {b + "B", a + "K"}, {a + "f", a + "g"}, {a + "h", a + "f"}} {
		found := false
		for _, x := range rm.Edges {
			found = found || (x.From == e[0] && x.To == e[1] && x.Source == "typescript")
		}
		if !found {
			t.Errorf("no uses edge %s -> %s", e[0], e[1])
		}
	}
	if got := nodes[a+"f"].Evidence.Tests; !slices.Equal(got, []string{"frontend/src/lib/a.test.ts::f adds one"}) {
		t.Errorf("f tests %v", got)
	}
	if !slices.Contains(nodes[a+"h"].Flags, "untested") || slices.Contains(nodes[a+"f"].Flags, "untested") {
		t.Errorf("flags h %v f %v", nodes[a+"h"].Flags, nodes[a+"f"].Flags)
	}
	checkPackages(t, rm)
	if p := nodes["ts:frontend/src/lib"]; p.Level != "package" || p.Change != "modified" || p.Lang != "ts" {
		t.Errorf("lib package %+v", p)
	}
	found := false
	for _, e := range rm.Edges {
		found = found || (e.From == "ts:frontend/src/components" && e.To == "ts:frontend/src/lib")
	}
	if !found {
		t.Error("no package edge components -> lib")
	}
	if len(rm.Problems) != 0 {
		t.Errorf("problems %v", rm.Problems)
	}
}

// T6 / FR-10: no typescript in the repo, then no node on PATH: the review
// names what is missing and still writes the Go nodes.
func TestTSMissingTools(t *testing.T) {
	dir, merge := tsRepo(t)
	ranges, _ := CommitRanges(merge, []Repo{{Dir: dir}})
	rm, err := Build("init", merge, ranges, Sources(), t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	if !slices.ContainsFunc(rm.Problems, func(p string) bool {
		return strings.Contains(p, "typescript is not installed in") && strings.Contains(p, filepath.Join(dir, "frontend", "node_modules"))
	}) {
		t.Errorf("problems %v, want typescript named", rm.Problems)
	}
	if byID(rm)["go:example.com/m/p.Go"].Change != "modified" {
		t.Error("Go node missing without typescript")
	}

	bin := t.TempDir()
	for _, tool := range []string{"git", "go", "tar"} {
		p, err := exec.LookPath(tool)
		if err != nil {
			t.Skip(tool + " not on PATH")
		}
		if err := os.Symlink(p, filepath.Join(bin, tool)); err != nil {
			t.Fatal(err)
		}
	}
	t.Setenv("PATH", bin)
	rm, err = Build("init", merge, ranges, Sources(), t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	if len(rm.Problems) != 1 || !strings.Contains(rm.Problems[0], "node is not on PATH") {
		t.Errorf("problems %v, want node named once", rm.Problems)
	}
	if byID(rm)["go:example.com/m/p.Go"].Change != "modified" {
		t.Error("Go node missing without node")
	}
	for _, n := range rm.Nodes {
		if n.Lang == "ts" {
			t.Errorf("TS node %s without node", n.ID)
		}
	}
}

// T5 / FR-9: an ignored embed target gets a placeholder in the export,
// never in the repo, said once; no embed problem.
func TestEmbedPlaceholder(t *testing.T) {
	f := fixture{t, t.TempDir()}
	f.git("init", "-q", "-b", "main")
	f.write(".gitignore", "dist/\n")
	f.write("go.mod", "module example.com/e\n\ngo 1.22\n")
	main := func(n int) string {
		return "package main\n\nimport \"embed\"\n\n//go:embed all:dist\nvar assets embed.FS\n\nfunc main() { _ = assets; _ = V() }\n\nfunc V() int { return " + string(rune('0'+n)) + " }\n"
	}
	f.write("main.go", main(1))
	f.write("dist/index.html", "x")
	f.git("add", ".")
	f.git("commit", "-q", "-m", "base")
	f.write("main.go", main(2))
	f.git("commit", "-q", "-am", "head")
	head := f.git("rev-parse", "HEAD")
	ranges, _ := CommitRanges(head, []Repo{{Dir: f.dir}})
	rm, err := Build("init", head, ranges, Sources(), t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	for _, p := range rm.Problems {
		if strings.Contains(p, "pattern") {
			t.Errorf("embed problem left: %s", p)
		}
	}
	if !slices.Equal(rm.Notes, []string{"embed all:dist: placeholder"}) {
		t.Errorf("notes %v", rm.Notes)
	}
	if byID(rm)["go:example.com/e.V"].Change != "modified" {
		t.Errorf("V not read: %+v", rm.Nodes)
	}
	if out := f.git("status", "--porcelain", "--ignored"); out != "!! dist/" {
		t.Errorf("repo status %q", out)
	}
	if fi, err := os.Stat(filepath.Join(f.dir, "dist", "placeholder")); err == nil {
		t.Errorf("placeholder written in the repo: %v", fi.Name())
	}
}
