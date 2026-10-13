package main

import (
	"go/ast"
	"go/parser"
	"go/token"
	"testing"

	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

// The window's WKWebView takes links on plain Tab (leftovers-22 K1): the
// options main hands to wails.Run carry macOptions, and macOptions turns
// TabFocusesLinks on.
func TestMacOptionsTabFocusesLinks(t *testing.T) {
	if macOptions == nil || macOptions.Preferences == nil {
		t.Fatal("macOptions.Preferences is nil")
	}
	if macOptions.Preferences.TabFocusesLinks != mac.Enabled {
		t.Fatalf("TabFocusesLinks = %v, want mac.Enabled", macOptions.Preferences.TabFocusesLinks)
	}

	f, err := parser.ParseFile(token.NewFileSet(), "main.go", nil, 0)
	if err != nil {
		t.Fatal(err)
	}
	found := false
	ast.Inspect(f, func(n ast.Node) bool {
		lit, ok := n.(*ast.CompositeLit)
		if !ok {
			return true
		}
		sel, ok := lit.Type.(*ast.SelectorExpr)
		if !ok || sel.Sel.Name != "App" {
			return true
		}
		for _, el := range lit.Elts {
			kv, ok := el.(*ast.KeyValueExpr)
			if !ok {
				continue
			}
			k, _ := kv.Key.(*ast.Ident)
			v, _ := kv.Value.(*ast.Ident)
			if k != nil && k.Name == "Mac" && v != nil && v.Name == "macOptions" {
				found = true
			}
		}
		return true
	})
	if !found {
		t.Fatal("options.App in main.go does not set Mac: macOptions")
	}
}
