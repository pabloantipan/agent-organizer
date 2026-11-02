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
	"strconv"
	"strings"
	"testing"

	"organizer/internal/model"
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

// statusLiteralAllowed are the functions that must compare one exact status,
// as "path:Func" (a method is "path:Type.Method"), with how many comparisons
// each holds and why (leftovers-68 FR-4). The allowance is by function, not
// by file: a new comparison anywhere else in an allowlisted file, or a
// second one inside an allowlisted function, is a finding. An entry whose
// function compares fewer than it lists is reported too, so the list cannot
// outlive its reason.
var statusLiteralAllowed = map[string]allowance{
	// The validator: what a record must carry depends on its exact status.
	"internal/scan/decisions.go:checkDecision": {4, "validates each status's fields"},
	// The writer: only a proposed record can be ruled from the organizer
	// (0019); awaiting-cells is ruled by the cells.
	"internal/service/rule.go:Service.RuleDecision": {1, "rules a proposed record only"},
	// A draft cell waits on its proposed the-cell-roster record; an
	// awaiting-cells one is the cells' to rule, not the draft's (leftovers-66
	// FR-1).
	"internal/service/draft.go:acceptRecord": {1, "a draft waits on a proposed accept record only"},
	// Proposed alone reads "waiting"; awaiting-cells keeps its own words
	// (leftovers-61 FR-5, leftovers-66 FR-1).
	"internal/cli/decisions.go:statusWord": {1, "names proposed alone as waiting"},
}

// allowance is how many status comparisons an allowlisted function holds,
// and why it must.
type allowance struct {
	n   int
	why string
}

// decisionStatusValues are the values of model's decision statuses: a string
// literal equal to one of them, compared to anything outside internal/model,
// is a status read by hand that not even the constant names (leftovers-66
// FR-1).
var decisionStatusValues = map[string]bool{
	model.DecisionProposed: true, model.DecisionRuled: true, model.DecisionSuperseded: true,
	model.DecisionWithdrawn: true, model.DecisionAwaitingCells: true, model.DecisionApplied: true,
	model.DecisionAcknowledged: true,
}

// isStatusLiteral reports whether e is a string literal whose value is a
// decision status.
func isStatusLiteral(e ast.Expr) bool {
	lit, ok := unparen(e).(*ast.BasicLit)
	if !ok || lit.Kind != token.STRING {
		return false
	}
	v, err := strconv.Unquote(lit.Value)
	return err == nil && decisionStatusValues[v]
}

// unparen strips the parentheses around an expression: `x == ("ruled")` is
// the same comparison as `x == "ruled"` (leftovers-68 FR-4).
func unparen(e ast.Expr) ast.Expr {
	for {
		p, ok := e.(*ast.ParenExpr)
		if !ok {
			return e
		}
		e = p.X
	}
}

// statusComparison is one comparison the guard found: where, in which
// function ("" at package level), and what it compares.
type statusComparison struct {
	File, Func string
	Line       int
	What       string
}

func (c statusComparison) String() string {
	return fmt.Sprintf("%s:%d: %s", c.File, c.Line, c.What)
}

// statusComparisons lists every comparison (==, != or a switch case) of a
// value to a model.Decision* status constant, or to a string literal equal
// to a status value, in the non-test Go files under root, outside
// internal/model, as "path:line: text". It skips vendored,
// generated and checkout directories.
func statusComparisons(root string) ([]string, error) {
	cs, err := findStatusComparisons(root)
	out := make([]string, len(cs))
	for i, c := range cs {
		out[i] = c.String()
	}
	sort.Strings(out)
	return out, err
}

// findStatusComparisons is statusComparisons with each comparison's
// enclosing function, for the allowlist.
func findStatusComparisons(root string) ([]statusComparison, error) {
	var out []statusComparison
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
		isStatus := func(e ast.Expr) bool {
			if model == "" {
				return false
			}
			sel, ok := unparen(e).(*ast.SelectorExpr)
			if !ok {
				return false
			}
			x, ok := sel.X.(*ast.Ident)
			return ok && x.Name == model && decisionStatusConsts[sel.Sel.Name]
		}
		fn := ""
		report := func(n ast.Node, what string) {
			out = append(out, statusComparison{File: rel, Func: fn, Line: fset.Position(n.Pos()).Line, What: what})
		}
		inspect := func(n ast.Node) bool {
			switch n := n.(type) {
			case *ast.BinaryExpr:
				if n.Op != token.EQL && n.Op != token.NEQ {
					break
				}
				if isStatus(n.X) || isStatus(n.Y) {
					report(n, "compares to a model.Decision* status")
				} else if isStatusLiteral(n.X) || isStatusLiteral(n.Y) {
					report(n, "compares to a decision status literal")
				}
			case *ast.CaseClause:
				for _, e := range n.List {
					if isStatus(e) {
						report(e, "switches on a model.Decision* status")
					} else if isStatusLiteral(e) {
						report(e, "switches on a decision status literal")
					}
				}
			}
			return true
		}
		for _, d := range f.Decls {
			fn = funcName(d)
			ast.Inspect(d, inspect)
		}
		return nil
	})
	return out, err
}

// funcName is a declaration's function as the allowlist names it: "Func",
// or "Type.Method" for a method on Type or *Type; "" for anything that is
// not a function.
func funcName(d ast.Decl) string {
	f, ok := d.(*ast.FuncDecl)
	if !ok {
		return ""
	}
	if f.Recv == nil || len(f.Recv.List) == 0 {
		return f.Name.Name
	}
	t := f.Recv.List[0].Type
	if s, ok := t.(*ast.StarExpr); ok {
		t = s.X
	}
	switch x := t.(type) {
	case *ast.IndexExpr:
		t = x.X
	case *ast.IndexListExpr:
		t = x.X
	}
	if id, ok := t.(*ast.Ident); ok {
		return id.Name + "." + f.Name.Name
	}
	return f.Name.Name
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

// guardFindings is statusComparisons minus the allowlisted functions, plus
// each allowlisted function that compares fewer than it lists. A function
// that compares more than it lists has every comparison reported, since the
// guard cannot tell which one is new (leftovers-68 FR-4).
func guardFindings(root string) ([]string, error) {
	all, err := findStatusComparisons(root)
	if err != nil {
		return nil, err
	}
	byFunc := map[string][]statusComparison{}
	var out []string
	for _, c := range all {
		key := c.File + ":" + c.Func
		if _, ok := statusLiteralAllowed[key]; ok && c.Func != "" {
			byFunc[key] = append(byFunc[key], c)
			continue
		}
		out = append(out, c.String())
	}
	for key, a := range statusLiteralAllowed {
		got := len(byFunc[key])
		switch {
		case got > a.n:
			for _, c := range byFunc[key] {
				out = append(out, fmt.Sprintf("%s (%s compares %d, allowlisted for %d)", c, c.Func, got, a.n))
			}
		case got < a.n:
			out = append(out, fmt.Sprintf("%s: allowlisted for %d but compares %d; update statusLiteralAllowed", key, a.n, got))
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
		"internal/cli/decisions.go:statusWord: allowlisted for 1 but compares 0; update statusLiteralAllowed",
		"internal/cli/x.go:7: switches on a model.Decision* status",
		"internal/scan/decisions.go:5: compares to a model.Decision* status",
		"internal/scan/decisions.go:checkDecision: allowlisted for 4 but compares 0; update statusLiteralAllowed",
		"internal/service/draft.go:acceptRecord: allowlisted for 1 but compares 0; update statusLiteralAllowed",
		"internal/service/rule.go:Service.RuleDecision: allowlisted for 1 but compares 0; update statusLiteralAllowed",
		"internal/service/tasks.go:6: compares to a model.Decision* status",
	}
	if strings.Join(got, "\n") != strings.Join(want, "\n") {
		t.Errorf("findings:\n%s\nwant:\n%s", strings.Join(got, "\n"), strings.Join(want, "\n"))
	}
}

// G1 (leftovers-66 FR-1): the guard also finds a decision status compared to
// a string literal, with or without the model import, as == and as a switch
// case; a literal that is no status, or one inside internal/model, is not
// one.
func TestLF66G1GuardFindsStatusLiteral(t *testing.T) {
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
	write("internal/service/plant.go", "package service\n\nimport \"organizer/internal/model\"\n\nfunc f(d model.Decision) bool {\n\treturn d.Status == \"ruled\"\n}\n")
	write("internal/cli/plant.go", "package cli\n\nfunc g(s string) int {\n\tswitch s {\n\tcase \"awaiting-cells\":\n\t\treturn 1\n\tcase \"now\":\n\t\treturn 2\n\t}\n\tif \"withdrawn\" != s {\n\t\treturn 3\n\t}\n\treturn 0\n}\n")
	write("internal/model/ok.go", "package model\n\nfunc h(s string) bool { return s == \"ruled\" }\n")
	write("internal/service/plant_test.go", "package service\n\nfunc k(s string) bool { return s == \"proposed\" }\n")
	got, err := statusComparisons(root)
	if err != nil {
		t.Fatal(err)
	}
	want := []string{
		"internal/cli/plant.go:10: compares to a decision status literal",
		"internal/cli/plant.go:5: switches on a decision status literal",
		"internal/service/plant.go:6: compares to a decision status literal",
	}
	if strings.Join(got, "\n") != strings.Join(want, "\n") {
		t.Errorf("findings:\n%s\nwant:\n%s", strings.Join(got, "\n"), strings.Join(want, "\n"))
	}
}

// G4 (leftovers-68 FR-4): over temp copies of the tree's allowlisted files,
// the guard finds a parenthesised status literal and a second status
// comparison planted in draft.go outside acceptRecord, and nothing else; the
// copies unplanted pass.
func TestLF68G4GuardCatchesParensAndAllowsByFunction(t *testing.T) {
	tree := filepath.Join("..", "..")
	root := t.TempDir()
	copyIn := func(rel, extra string) {
		t.Helper()
		b, err := os.ReadFile(filepath.Join(tree, rel))
		if err != nil {
			t.Fatal(err)
		}
		p := filepath.Join(root, rel)
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, append(b, extra...), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	files := map[string]bool{}
	for key := range statusLiteralAllowed {
		files[key[:strings.Index(key, ":")]] = true
	}
	for f := range files {
		copyIn(f, "")
	}
	if got, err := guardFindings(root); err != nil || len(got) != 0 {
		t.Fatalf("unplanted copies: %v %v, want no finding", got, err)
	}

	copyIn("internal/service/draft.go", "\nfunc plantedSecond(d model.Decision) bool {\n\treturn d.Status != \"proposed\"\n}\n")
	plant := "package service\n\nimport \"organizer/internal/model\"\n\nfunc planted(d model.Decision) bool {\n\treturn d.Status == (\"ruled\")\n}\n\nfunc plantedConst(d model.Decision) bool {\n\treturn (d.Status) == (model.DecisionRuled)\n}\n"
	p := filepath.Join(root, "internal", "service", "plant.go")
	if err := os.WriteFile(p, []byte(plant), 0o644); err != nil {
		t.Fatal(err)
	}
	got, err := guardFindings(root)
	if err != nil {
		t.Fatal(err)
	}
	b, _ := os.ReadFile(filepath.Join(tree, "internal", "service", "draft.go"))
	draftLine := strings.Count(string(b), "\n") + 3
	want := []string{
		fmt.Sprintf("internal/service/draft.go:%d: compares to a decision status literal", draftLine),
		"internal/service/plant.go:10: compares to a model.Decision* status",
		"internal/service/plant.go:6: compares to a decision status literal",
	}
	if strings.Join(got, "\n") != strings.Join(want, "\n") {
		t.Errorf("findings:\n%s\nwant:\n%s", strings.Join(got, "\n"), strings.Join(want, "\n"))
	}
}
