package review

import (
	"fmt"
	"go/ast"
	"go/token"
	"go/types"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"

	"golang.org/x/mod/modfile"
	"golang.org/x/tools/go/packages"
)

// Def is one top-level Go definition: a function, a method, a type, or a
// package-level var or const (one per name). Its range includes its doc
// comment, so a hunk that only rewords the doc touches the definition.
type Def struct {
	ID    string // go:<package path>.<Receiver>.<Name>, receiver without *
	Pkg   string // go:<package path>
	Kind  string // function, method, type, var, const, test
	File  string // relative to the repo root, slash-separated
	Start int    // first line, 1-based
	End   int    // last line
	// TestFile is true for a definition in a _test.go file; TestFunc for a
	// Test, Benchmark, Fuzz or Example function in one.
	TestFile bool
	TestFunc bool
}

// Graph is what an index source produced for one tree: every definition by
// id, the definitions of each file in line order, and the uses: for each
// definition, the definitions its body references.
type Graph struct {
	Defs   map[string]Def
	ByFile map[string][]Def
	Uses   map[string]map[string]bool
	// Problems are what the source could not do completely (a package that
	// did not type-check, a module whose dependencies are not downloaded);
	// the graph holds what it could read.
	Problems []string
}

// Source builds a Graph for a checked-out tree. One source exists today
// (go/types in process, chosen by measurement in rm-v0's Notes); v1 may add
// another behind the same interface.
type Source interface {
	Name() string
	Graph(root string) (*Graph, error)
}

// GoTypes is the go/packages + go/types source. It needs the go toolchain
// on PATH (go list) and the module's dependencies in the module cache; it
// never downloads them (GOPROXY=off, GOFLAGS=-mod=mod with GOFLAGS cleared
// of anything else).
type GoTypes struct{}

func (GoTypes) Name() string { return "go/types" }

// GoBinary is how the source finds the go toolchain; doctor reports it.
func GoBinary() (string, error) { return exec.LookPath("go") }

func (GoTypes) Graph(root string) (*Graph, error) {
	if _, err := GoBinary(); err != nil {
		return nil, fmt.Errorf("the go toolchain is not on PATH: organizer review reads Go through go list; install Go from https://go.dev/dl/ (organizer doctor shows it)")
	}
	g := &Graph{Defs: map[string]Def{}, ByFile: map[string][]Def{}, Uses: map[string]map[string]bool{}}
	mods, err := modules(root)
	if err != nil {
		return nil, err
	}
	for _, m := range mods {
		if err := g.loadModule(root, m); err != nil {
			g.Problems = append(g.Problems, err.Error())
		}
	}
	for f := range g.ByFile {
		sort.Slice(g.ByFile[f], func(i, j int) bool { return g.ByFile[f][i].Start < g.ByFile[f][j].Start })
	}
	return g, nil
}

// module is one go.mod in the tree: its directory and its module path.
type module struct{ dir, path string }

func modules(root string) ([]module, error) {
	var out []module
	err := filepath.WalkDir(root, func(p string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		if d.IsDir() && p != root {
			n := d.Name()
			if n == "vendor" || n == "testdata" || n == "node_modules" || strings.HasPrefix(n, ".") || strings.HasPrefix(n, "_") {
				return filepath.SkipDir
			}
		}
		if !d.IsDir() && d.Name() == "go.mod" {
			b, err := os.ReadFile(p)
			if err != nil {
				return nil
			}
			if mp := modfile.ModulePath(b); mp != "" {
				out = append(out, module{dir: filepath.Dir(p), path: mp})
			}
		}
		return nil
	})
	return out, err
}

func (g *Graph) loadModule(root string, m module) error {
	fset := token.NewFileSet()
	cfg := &packages.Config{
		Mode: packages.NeedName | packages.NeedFiles | packages.NeedSyntax |
			packages.NeedTypes | packages.NeedTypesInfo | packages.NeedModule,
		Dir:   m.dir,
		Fset:  fset,
		Tests: true,
		Env:   append(os.Environ(), "GOPROXY=off", "GOFLAGS=-mod=mod", "GOWORK=off", "GOTOOLCHAIN=local"),
	}
	pkgs, err := packages.Load(cfg, "./...")
	if err != nil {
		return fmt.Errorf("%s: %v", rel(root, m.dir), err)
	}
	type fileDefs struct {
		file *ast.File
		info *types.Info
		defs []Def
	}
	byAbs := map[string]*fileDefs{}
	var order []string
	seenProblem := map[string]bool{}
	for _, p := range pkgs {
		for _, e := range p.Errors {
			if e.Kind != packages.TypeError && !seenProblem[e.Msg] {
				seenProblem[e.Msg] = true
				g.Problems = append(g.Problems, fmt.Sprintf("%s: %s", p.PkgPath, e.Msg))
			}
		}
		for _, f := range p.Syntax {
			abs := fset.Position(f.Pos()).Filename
			if _, seen := byAbs[abs]; seen || !strings.HasSuffix(abs, ".go") {
				continue
			}
			r := rel(root, abs)
			pkgPath := pkgPathOf(m, root, r, f.Name.Name)
			byAbs[abs] = &fileDefs{file: f, info: p.TypesInfo, defs: Outline(fset, f, pkgPath, r)}
			order = append(order, abs)
		}
	}
	for _, abs := range order {
		fd := byAbs[abs]
		for _, d := range fd.defs {
			g.Defs[d.ID] = d
			g.ByFile[d.File] = append(g.ByFile[d.File], d)
		}
	}
	// at maps a position to the definition whose range holds it.
	at := func(pos token.Pos) (Def, bool) {
		p := fset.Position(pos)
		fd := byAbs[p.Filename]
		if fd == nil {
			return Def{}, false
		}
		for _, d := range fd.defs {
			if d.Start <= p.Line && p.Line <= d.End {
				return d, true
			}
		}
		return Def{}, false
	}
	for _, abs := range order {
		fd := byAbs[abs]
		if fd.info == nil {
			continue
		}
		for _, decl := range fd.file.Decls {
			ast.Inspect(decl, func(n ast.Node) bool {
				id, ok := n.(*ast.Ident)
				if !ok {
					return true
				}
				obj := fd.info.Uses[id]
				if obj == nil || obj.Pkg() == nil || !referable(obj) {
					return true
				}
				// The use belongs to the definition whose range holds it:
				// in a var block of several specs, the spec on that line.
				src, ok := at(id.Pos())
				if !ok {
					return true
				}
				to, ok := at(obj.Pos())
				if !ok || to.ID == src.ID {
					return true
				}
				if g.Uses[src.ID] == nil {
					g.Uses[src.ID] = map[string]bool{}
				}
				g.Uses[src.ID][to.ID] = true
				return true
			})
		}
	}
	return nil
}

// referable is an object a definition can reference across definitions:
// anything at package scope, a method, or a struct field.
func referable(obj types.Object) bool {
	if obj.Parent() != nil && obj.Parent() == obj.Pkg().Scope() {
		return true
	}
	switch o := obj.(type) {
	case *types.Func:
		return true
	case *types.Var:
		return o.IsField()
	}
	return false
}

func pkgPathOf(m module, root, relFile, pkgName string) string {
	modRel := rel(root, m.dir)
	dir := filepath.ToSlash(filepath.Dir(relFile))
	sub := strings.TrimPrefix(strings.TrimPrefix(dir, modRel), "/")
	if modRel == "." {
		sub = dir
	}
	p := m.path
	if sub != "." && sub != "" {
		p += "/" + sub
	}
	if strings.HasSuffix(pkgName, "_test") {
		p += "_test"
	}
	return p
}

// Outline lists the top-level definitions of one parsed file. It is the
// whole of what a definition is, for every tree this package reads.
func Outline(fset *token.FileSet, f *ast.File, pkgPath, relFile string) []Def {
	test := strings.HasSuffix(relFile, "_test.go")
	pkg := "go:" + pkgPath
	mk := func(name, kind string, from, to token.Pos) Def {
		d := Def{ID: pkg + "." + name, Pkg: pkg, Kind: kind, File: relFile,
			Start: fset.Position(from).Line, End: fset.Position(to).Line, TestFile: test}
		return d
	}
	var out []Def
	for _, decl := range f.Decls {
		switch d := decl.(type) {
		case *ast.FuncDecl:
			from := d.Pos()
			if d.Doc != nil {
				from = d.Doc.Pos()
			}
			name, kind := d.Name.Name, "function"
			if d.Recv != nil && len(d.Recv.List) > 0 {
				name, kind = recvName(d.Recv.List[0].Type)+"."+name, "method"
			}
			def := mk(name, kind, from, d.End())
			if test {
				def.Kind = "test"
				def.TestFunc = d.Recv == nil && isTestName(d.Name.Name)
			}
			out = append(out, def)
		case *ast.GenDecl:
			if d.Tok == token.IMPORT {
				continue
			}
			for _, s := range d.Specs {
				from, to := s.Pos(), s.End()
				if len(d.Specs) == 1 {
					from, to = d.Pos(), d.End()
				}
				if d.Doc != nil && len(d.Specs) == 1 {
					from = d.Doc.Pos()
				}
				switch sp := s.(type) {
				case *ast.TypeSpec:
					if sp.Doc != nil {
						from = sp.Doc.Pos()
					}
					def := mk(sp.Name.Name, "type", from, to)
					if test {
						def.Kind = "test"
					}
					out = append(out, def)
				case *ast.ValueSpec:
					if sp.Doc != nil {
						from = sp.Doc.Pos()
					}
					kind := "var"
					if d.Tok == token.CONST {
						kind = "const"
					}
					if test {
						kind = "test"
					}
					for _, n := range sp.Names {
						if n.Name == "_" {
							continue
						}
						out = append(out, mk(n.Name, kind, from, to))
					}
				}
			}
		}
	}
	return out
}

func recvName(e ast.Expr) string {
	switch t := e.(type) {
	case *ast.StarExpr:
		return recvName(t.X)
	case *ast.IndexExpr:
		return recvName(t.X)
	case *ast.IndexListExpr:
		return recvName(t.X)
	case *ast.Ident:
		return t.Name
	}
	return "?"
}

func isTestName(n string) bool {
	for _, p := range []string{"Test", "Benchmark", "Fuzz", "Example"} {
		if n == p || (strings.HasPrefix(n, p) && len(n) > len(p) && !isLower(n[len(p)])) {
			return true
		}
	}
	return false
}

func isLower(b byte) bool { return b >= 'a' && b <= 'z' }

func rel(root, p string) string {
	r, err := filepath.Rel(root, p)
	if err != nil {
		return p
	}
	return filepath.ToSlash(r)
}
