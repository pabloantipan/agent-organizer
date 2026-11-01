package service

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"
)

// decisionStatusConsts are model's decision statuses: a comparison to one of
// them outside internal/model reads a record's state by hand, and the next
// status the working-on skill adds (as applied and acknowledged were) is
// silently read wrong there. Read it through model's helpers instead
// (Decision.Open, Decided, Class; DecisionOpen, DecisionDecided).
var decisionStatusConsts = map[string]bool{
	"DecisionProposed": true, "DecisionRuled": true, "DecisionSuperseded": true,
	"DecisionWithdrawn": true, "DecisionAwaitingCells": true, "DecisionApplied": true,
	"DecisionAcknowledged": true,
}

// statusLiteralAllowed are the files that must compare one exact status, and
// why. An entry that no longer compares anything is reported too, so the list
// cannot outlive its reason.
var statusLiteralAllowed = map[string]string{
	// The validator: what a record must carry depends on its exact status.
	"internal/scan/decisions.go": "validates each status's fields",
	// The writer: only a proposed record can be ruled from the organizer
	// (0019); awaiting-cells is ruled by the cells.
	"internal/service/rule.go": "rules a proposed record only",
}

// statusComparisons lists every comparison (==, != or a switch case) of a
// value to a model.Decision* status constant in the non-test Go files under
// root, outside internal/model, as "path:line: text". It skips vendored,
// generated and checkout directories.
func statusComparisons(root string) ([]string, error) {
	var out []string
	fset := token.NewFileSet()
	err := filepath.WalkDir(root, func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(root, p)
		rel = filepath.ToSlash(rel)
		if d.IsDir() {
			switch d.Name() {
			case ".git", ".wt", ".wt-notes", "node_modules", "vendor", "testdata", "frontend", "build":
				if rel != "." {
					return filepath.SkipDir
				}
			}
			if rel == "internal/model" {
				return filepath.SkipDir
			}
			return nil
		}
		if !strings.HasSuffix(p, ".go") || strings.HasSuffix(p, "_test.go") {
			return nil
		}
		f, err := parser.ParseFile(fset, p, nil, 0)
		if err != nil {
			return fmt.Errorf("%s: %w", rel, err)
		}
		model := modelImportName(f)
		if model == "" {
			return nil
		}
		isStatus := func(e ast.Expr) bool {
			sel, ok := e.(*ast.SelectorExpr)
			if !ok {
				return false
			}
			x, ok := sel.X.(*ast.Ident)
			return ok && x.Name == model && decisionStatusConsts[sel.Sel.Name]
		}
		report := func(n ast.Node, what string) {
			out = append(out, fmt.Sprintf("%s:%d: %s", rel, fset.Position(n.Pos()).Line, what))
		}
		ast.Inspect(f, func(n ast.Node) bool {
			switch n := n.(type) {
			case *ast.BinaryExpr:
				if (n.Op == token.EQL || n.Op == token.NEQ) && (isStatus(n.X) || isStatus(n.Y)) {
					report(n, "compares to a model.Decision* status")
				}
			case *ast.CaseClause:
				for _, e := range n.List {
					if isStatus(e) {
						report(e, "switches on a model.Decision* status")
					}
				}
			}
			return true
		})
		return nil
	})
	sort.Strings(out)
	return out, err
}

// modelImportName is the name organizer/internal/model is imported under in
// f, or "" when f does not import it.
func modelImportName(f *ast.File) string {
	for _, imp := range f.Imports {
		if strings.Trim(imp.Path.Value, `"`) != "organizer/internal/model" {
			continue
		}
		if imp.Name != nil {
			return imp.Name.Name
		}
		return "model"
	}
	return ""
}

// guardFindings is statusComparisons minus the allowlist, plus each
// allowlisted file that compares nothing any more.
func guardFindings(root string) ([]string, error) {
	all, err := statusComparisons(root)
	if err != nil {
		return nil, err
	}
	var out []string
	used := map[string]bool{}
	for _, c := range all {
		file := c[:strings.Index(c, ":")]
		if _, ok := statusLiteralAllowed[file]; ok {
			used[file] = true
			continue
		}
		out = append(out, c)
	}
	for file := range statusLiteralAllowed {
		if !used[file] {
			out = append(out, file+": allowlisted but compares no status; drop it from statusLiteralAllowed")
		}
	}
	sort.Strings(out)
	return out, nil
}

// G4 (leftovers-62 FR-4): no Go file outside internal/model and the
// allowlist compares a decision status to a model.Decision* constant; the
// Go side of decisionStates.test.ts.
func TestLF62G4NoDecisionStatusLiterals(t *testing.T) {
	root := filepath.Join("..", "..")
	if dir := os.Getenv("LITERALS_ROOT"); dir != "" {
		root = dir // a planted copy of the tree, for the gate's negative check
	}
	got, err := guardFindings(root)
	if err != nil {
		t.Fatal(err)
	}
	for _, g := range got {
		t.Errorf("%s: read the status through internal/model's helpers (Decided, Open, Class)", g)
	}
}

// The guard sees what it is for: a planted comparison, under an import
// alias and as a switch case, outside the allowlist; nothing inside model.
func TestLF62G4GuardFindsPlantedComparison(t *testing.T) {
	root := t.TempDir()
	write := func(rel, body string) {
		t.Helper()
		p := filepath.Join(root, rel)
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("internal/service/tasks.go", "package service\n\nimport \"organizer/internal/model\"\n\nfunc f(d model.Decision) bool {\n\treturn d.Status == model.DecisionRuled\n}\n")
	write("internal/cli/x.go", "package cli\n\nimport m \"organizer/internal/model\"\n\nfunc g(s string) int {\n\tswitch s {\n\tcase m.DecisionApplied:\n\t\treturn 1\n\t}\n\treturn 0\n}\n")
	write("internal/model/ok.go", "package model\n\nfunc h(s string) bool { return s == DecisionRuled }\n")
	write("internal/scan/decisions.go", "package scan\n\nimport \"organizer/internal/model\"\n\nfunc v(s string) bool { return s != model.DecisionProposed }\n")
	got, err := guardFindings(root)
	if err != nil {
		t.Fatal(err)
	}
	want := []string{
		"internal/cli/x.go:7: switches on a model.Decision* status",
		"internal/service/rule.go: allowlisted but compares no status; drop it from statusLiteralAllowed",
		"internal/service/tasks.go:6: compares to a model.Decision* status",
	}
	if strings.Join(got, "\n") != strings.Join(want, "\n") {
		t.Errorf("findings:\n%s\nwant:\n%s", strings.Join(got, "\n"), strings.Join(want, "\n"))
	}
}
