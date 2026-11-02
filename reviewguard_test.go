package main

import (
	"bytes"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

// envOf is a getenv over a map; a missing key is unset.
func envOf(m map[string]string) func(string) string {
	return func(k string) string { return m[k] }
}

// guardFixture: an injected real home (with a subdirectory and a symlink
// into it from outside) and a temp dir outside it.
type guardFixture struct {
	home, outside, linkIntoHome string
}

func newGuardFixture(t *testing.T) guardFixture {
	t.Helper()
	root := t.TempDir()
	home := filepath.Join(root, "Users", "someone")
	outside := filepath.Join(root, "tmp", "fixture")
	for _, d := range []string{filepath.Join(home, ".local", "share"), filepath.Join(home, ".config", "organizer"), outside} {
		if err := os.MkdirAll(d, 0o755); err != nil {
			t.Fatal(err)
		}
	}
	link := filepath.Join(root, "tmp", "link")
	if err := os.Symlink(home, link); err != nil {
		t.Fatal(err)
	}
	return guardFixture{home: home, outside: outside, linkIntoHome: link}
}

// G1 (FR-1, FR-4): build kind × each variable unset, empty, under the
// injected home, under a temp dir, through a symlink into the home.
func TestReviewGuardDecisionTable(t *testing.T) {
	fx := newGuardFixture(t)
	good := map[string]string{
		"ORGANIZER_CONFIG": filepath.Join(fx.outside, "config.yaml"),
		"XDG_DATA_HOME":    filepath.Join(fx.outside, "data"),
	}
	cases := []struct {
		name   string
		value  func(v string) (string, bool) // value, set
		refuse bool
		reason string
	}{
		{"unset", func(string) (string, bool) { return "", false }, true, "unset or empty"},
		{"empty", func(string) (string, bool) { return "", true }, true, "unset or empty"},
		{"under-home", func(v string) (string, bool) {
			if v == "ORGANIZER_CONFIG" {
				return filepath.Join(fx.home, ".config", "organizer", "config.yaml"), true
			}
			return filepath.Join(fx.home, ".local", "share"), true
		}, true, "under the real home"},
		{"home-itself", func(string) (string, bool) { return fx.home, true }, true, "under the real home"},
		{"under-home-not-yet-created", func(string) (string, bool) { return filepath.Join(fx.home, "nope", "x"), true }, true, "under the real home"},
		{"temp-dir", func(v string) (string, bool) { return good[v], true }, false, ""},
		{"symlink-into-home", func(v string) (string, bool) { return filepath.Join(fx.linkIntoHome, "new", "x"), true }, true, "under the real home"},
		{"relative-dotdot-into-home", func(string) (string, bool) {
			return filepath.Join(fx.outside, "..", "..", "Users", "someone", "data"), true
		}, true, "under the real home"},
	}
	kinds := []buildKind{buildReview, buildDev, buildProduction}
	for _, kind := range kinds {
		for _, variable := range guardedVars {
			for _, c := range cases {
				t.Run(kind.String()+"/"+variable+"/"+c.name, func(t *testing.T) {
					env := map[string]string{}
					for k, v := range good {
						env[k] = v
					}
					if v, set := c.value(variable); set {
						env[variable] = v
					} else {
						delete(env, variable)
					}
					err := guardDecision(kind, envOf(env), fx.home)
					wantRefuse := c.refuse && kind != buildProduction
					if (err != nil) != wantRefuse {
						t.Fatalf("refused = %v (%v), want %v", err != nil, err, wantRefuse)
					}
					if err == nil {
						return
					}
					if !strings.Contains(err.Error(), variable) {
						t.Errorf("reason %q does not name %s", err, variable)
					}
					if !strings.Contains(err.Error(), c.reason) {
						t.Errorf("reason %q does not say %q", err, c.reason)
					}
				})
			}
		}
	}
}

// A guarded build whose real home cannot be read refuses; production starts.
func TestReviewGuardNoHome(t *testing.T) {
	env := envOf(map[string]string{"ORGANIZER_CONFIG": "/tmp/x/c.yaml", "XDG_DATA_HOME": "/tmp/x/d"})
	if guardDecision(buildReview, env, "") == nil {
		t.Fatal("review with no readable home started")
	}
	if guardDecision(buildProduction, env, "") != nil {
		t.Fatal("production refused")
	}
}

// G2 (FR-3): the override starts a dev build against the real home; a review
// build has none.
func TestReviewGuardDevOverride(t *testing.T) {
	fx := newGuardFixture(t)
	underHome := map[string]string{
		"ORGANIZER_CONFIG":        filepath.Join(fx.home, ".config", "organizer", "config.yaml"),
		"XDG_DATA_HOME":           filepath.Join(fx.home, ".local", "share"),
		"ORGANIZER_DEV_REAL_HOME": "1",
	}
	if err := guardDecision(buildDev, envOf(underHome), fx.home); err != nil {
		t.Fatalf("dev with the override refused: %v", err)
	}
	if err := guardDecision(buildReview, envOf(underHome), fx.home); err == nil {
		t.Fatal("review with ORGANIZER_DEV_REAL_HOME=1 started under the real home")
	}
	// The override is exactly "1".
	underHome["ORGANIZER_DEV_REAL_HOME"] = "true"
	if err := guardDecision(buildDev, envOf(underHome), fx.home); err == nil {
		t.Fatal("dev with ORGANIZER_DEV_REAL_HOME=true started under the real home")
	}
	// Unset variables with the override: dev starts (the lead's own wails dev).
	if err := guardDecision(buildDev, envOf(map[string]string{"ORGANIZER_DEV_REAL_HOME": "1"}), fx.home); err != nil {
		t.Fatalf("dev with the override and nothing exported refused: %v", err)
	}
}

func writePlist(t *testing.T, path, id string) {
	t.Helper()
	body := `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>Deltagos</string>
<key>CFBundleIdentifier</key><string>` + id + `</string>
</dict></plist>
`
	if err := os.WriteFile(path, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
}

// bundleLayout makes <root>/<name>.app/Contents/MacOS/organizer and returns
// the executable's path and the Info.plist's.
func bundleLayout(t *testing.T, name string) (exe, plist string) {
	t.Helper()
	contents := filepath.Join(t.TempDir(), name+".app", "Contents")
	if err := os.MkdirAll(filepath.Join(contents, "MacOS"), 0o755); err != nil {
		t.Fatal(err)
	}
	exe = filepath.Join(contents, "MacOS", "organizer")
	if err := os.WriteFile(exe, []byte("#!/bin/sh\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	return exe, filepath.Join(contents, "Info.plist")
}

// G3 (FR-1): the bundle id reader over temp layouts.
func TestReviewGuardBundleID(t *testing.T) {
	if runtime.GOOS != "darwin" {
		t.Skip("plutil is macOS only")
	}
	review, reviewPlist := bundleLayout(t, "Deltagos Review")
	writePlist(t, reviewPlist, reviewBundleID)
	prod, prodPlist := bundleLayout(t, "Deltagos")
	writePlist(t, prodPlist, "cl.antipan.organizer")
	noPlist, _ := bundleLayout(t, "Bare")
	bare := filepath.Join(t.TempDir(), "organizer")
	if err := os.WriteFile(bare, []byte("#!/bin/sh\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	// A plist beside a bare binary's parent is not a bundle either.
	strayDir := filepath.Join(t.TempDir(), "bin")
	if err := os.MkdirAll(strayDir, 0o755); err != nil {
		t.Fatal(err)
	}
	writePlist(t, filepath.Join(filepath.Dir(strayDir), "Info.plist"), reviewBundleID)
	stray := filepath.Join(strayDir, "organizer")

	cases := []struct {
		name string
		exe  string
		id   string
		ok   bool
		kind buildKind
	}{
		{"review plist", review, reviewBundleID, true, buildReview},
		{"production plist", prod, "cl.antipan.organizer", true, buildProduction},
		{"bundle without plist", noPlist, "", false, buildProduction},
		{"bare binary", bare, "", false, buildProduction},
		{"review plist outside Contents/MacOS", stray, "", false, buildProduction},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			id, ok := bundleID(c.exe)
			if id != c.id || ok != c.ok {
				t.Errorf("bundleID = %q, %v; want %q, %v", id, ok, c.id, c.ok)
			}
			if k := kindOf(c.exe, false); k != c.kind {
				t.Errorf("kindOf = %v, want %v", k, c.kind)
			}
			if k := kindOf(c.exe, true); k != buildDev {
				t.Errorf("kindOf with the dev tag = %v, want dev build", k)
			}
		})
	}
}

// The refusal is one stderr line naming the variable, exit 2 (FR-2).
func TestReviewGuardRefusalLine(t *testing.T) {
	if runtime.GOOS != "darwin" {
		t.Skip("plutil is macOS only")
	}
	fx := newGuardFixture(t)
	review, plist := bundleLayout(t, "Deltagos Review")
	writePlist(t, plist, reviewBundleID)
	var stderr bytes.Buffer
	code := reviewGuard(&stderr, review, envOf(map[string]string{"XDG_DATA_HOME": filepath.Join(fx.outside, "d")}), fx.home)
	if code != 2 {
		t.Fatalf("code = %d, want 2", code)
	}
	line := stderr.String()
	if strings.Count(line, "\n") != 1 || !strings.HasSuffix(line, "\n") {
		t.Errorf("stderr is not one line: %q", line)
	}
	if !strings.Contains(line, "ORGANIZER_CONFIG is unset or empty") || !strings.Contains(line, "review build") {
		t.Errorf("stderr = %q", line)
	}
	stderr.Reset()
	if code := reviewGuard(&stderr, review, envOf(map[string]string{
		"ORGANIZER_CONFIG": filepath.Join(fx.outside, "c.yaml"),
		"XDG_DATA_HOME":    filepath.Join(fx.outside, "d"),
	}), fx.home); code != 0 || stderr.Len() != 0 {
		t.Errorf("fixture env: code %d, stderr %q", code, stderr.String())
	}
	// Production with nothing exported starts, silent (FR-4).
	prod, prodPlist := bundleLayout(t, "Deltagos")
	writePlist(t, prodPlist, "cl.antipan.organizer")
	stderr.Reset()
	if code := reviewGuard(&stderr, prod, envOf(nil), fx.home); code != 0 || stderr.Len() != 0 {
		t.Errorf("production: code %d, stderr %q", code, stderr.String())
	}
}

// The real home comes from the user database, not $HOME.
func TestReviewGuardRealHomeIgnoresHOME(t *testing.T) {
	want := realHomeDir()
	if want == "" {
		t.Skip("no user database entry")
	}
	t.Setenv("HOME", t.TempDir())
	if got := realHomeDir(); got != want {
		t.Fatalf("realHomeDir followed $HOME: %q, want %q", got, want)
	}
}

// The test binary compiles without the dev tag: production's constant.
func TestReviewGuardNoDevTag(t *testing.T) {
	if devBuild {
		t.Skip("built with -tags dev")
	}
	out, err := exec.Command("go", "list", "-tags", "dev", "-f", "{{.GoFiles}}", ".").Output()
	if err != nil {
		t.Skip("go list:", err)
	}
	if !strings.Contains(string(out), "reviewguard_dev.go") || strings.Contains(string(out), "reviewguard_nodev.go") {
		t.Errorf("-tags dev files: %s", out)
	}
}

// G6 (FR-2): in main, the guard runs after the CLI dispatch and before
// appLogger and NewApp, and its refusal exits.
func TestReviewGuardRunsFirstInAppBranch(t *testing.T) {
	f, err := parser.ParseFile(token.NewFileSet(), "main.go", nil, 0)
	if err != nil {
		t.Fatal(err)
	}
	var mainFn *ast.FuncDecl
	for _, d := range f.Decls {
		if fn, ok := d.(*ast.FuncDecl); ok && fn.Name.Name == "main" {
			mainFn = fn
		}
	}
	if mainFn == nil {
		t.Fatal("no func main")
	}
	pos := map[string]token.Pos{}
	ast.Inspect(mainFn.Body, func(n ast.Node) bool {
		call, ok := n.(*ast.CallExpr)
		if !ok {
			return true
		}
		var name string
		switch fn := call.Fun.(type) {
		case *ast.Ident:
			name = fn.Name
		case *ast.SelectorExpr:
			name = fn.Sel.Name
		}
		if _, seen := pos[name]; !seen && name != "" {
			pos[name] = call.Pos()
		}
		return true
	})
	for _, name := range []string{"guardApp", "appLogger", "NewApp", "IsSubcommand", "Run"} {
		if pos[name] == token.NoPos {
			t.Fatalf("main does not call %s", name)
		}
	}
	if pos["guardApp"] < pos["IsSubcommand"] {
		t.Error("the guard runs before the CLI dispatch: CLI subcommands would be guarded")
	}
	if pos["guardApp"] > pos["appLogger"] || pos["guardApp"] > pos["NewApp"] {
		t.Error("the guard runs after appLogger or NewApp")
	}
	// The guard's statement exits on a refusal.
	var exits bool
	ast.Inspect(mainFn.Body, func(n ast.Node) bool {
		ifs, ok := n.(*ast.IfStmt)
		if !ok || ifs.Init == nil {
			return true
		}
		if !containsCall(ifs.Init, "guardApp") {
			return true
		}
		exits = containsCall(ifs.Body, "Exit")
		return false
	})
	if !exits {
		t.Error("main does not os.Exit on the guard's refusal")
	}
}

func containsCall(n ast.Node, name string) bool {
	found := false
	ast.Inspect(n, func(n ast.Node) bool {
		call, ok := n.(*ast.CallExpr)
		if !ok {
			return true
		}
		switch fn := call.Fun.(type) {
		case *ast.Ident:
			found = found || fn.Name == name
		case *ast.SelectorExpr:
			found = found || fn.Sel.Name == name
		}
		return true
	})
	return found
}
