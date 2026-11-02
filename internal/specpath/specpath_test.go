package specpath

import (
	"errors"
	"os"
	"path/filepath"
	"testing"
)

func TestCard(t *testing.T) {
	for in, want := range map[string]string{
		"docs/specs/x.md (FR-1 to FR-3)":                               "docs/specs/x.md",
		"docs/specs/diagrams.md (FR-6 to FR-8; diagrams-in-app D1-D8)": "docs/specs/diagrams.md",
		"docs/x.md#shape":           "docs/x.md",
		"docs/x.md#sec,":            "docs/x.md",
		"docs/x.md, FR-2":           "docs/x.md",
		"./a/../b.md":               "b.md",
		"../agent-slack/specs/x.md": "",
		"/abs/x.md":                 "",
		"#only":                     "",
		"   ":                       "",
		"":                          "",
	} {
		got, ok := Card(in)
		if got != want || ok != (want != "") {
			t.Errorf("Card(%q) = %q, %v; want %q", in, got, ok, want)
		}
	}
}

func TestClean(t *testing.T) {
	for in, want := range map[string]string{
		"docs/x.md#sec": "docs/x.md",
		"a/./b.md":      "a/b.md",
		"..":            "",
		".":             "",
		"/abs.md":       "",
	} {
		got, ok := Clean(in)
		if got != want || ok != (want != "") {
			t.Errorf("Clean(%q) = %q, %v; want %q", in, got, ok, want)
		}
	}
}

// Within (leftovers-66 FR-3): a link held to its admitting folder, the
// root as ".", several folders where any one admits, a folder that is
// itself a link evaluated before the comparison.
func TestWithin(t *testing.T) {
	root := t.TempDir()
	out := t.TempDir()
	for _, d := range []string{"runs", "docs/architecture", "real"} {
		if err := os.MkdirAll(filepath.Join(root, d), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	for _, f := range []string{"top.md", "runs/r.json", "real/page.md", filepath.Join(out, "x.md")} {
		p := f
		if !filepath.IsAbs(p) {
			p = filepath.Join(root, f)
		}
		if err := os.WriteFile(p, []byte("x"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	link := func(target, rel string) {
		t.Helper()
		if err := os.Symlink(target, filepath.Join(root, rel)); err != nil {
			t.Fatal(err)
		}
	}
	link(filepath.Join(out, "x.md"), "runs/out.json")
	link("../top.md", "runs/top.json")
	link("r.json", "runs/in.json")
	link("../../real", "docs/architecture/pages")
	for _, c := range []struct {
		rel     string
		dirs    []string
		outside bool
	}{
		{"runs/out.json", []string{"runs"}, true},
		{"runs/out.json", []string{"."}, true},
		{"runs/top.json", []string{"runs"}, true},
		{"runs/top.json", []string{"runs", "."}, false},
		{"runs/in.json", []string{"runs"}, false},
		{"docs/architecture/pages/page.md", []string{"docs/architecture"}, true},
		{"docs/architecture/pages/page.md", []string{"docs/architecture/pages"}, false},
		{"runs/in.json", []string{"nope"}, true},
	} {
		_, err := Within(root, c.rel, c.dirs...)
		if errors.Is(err, ErrOutside) != c.outside || (!c.outside && err != nil) {
			t.Errorf("Within(%q, %v) = %v; want outside %v", c.rel, c.dirs, err, c.outside)
		}
	}
	if _, err := Within(root, "runs/gone.json", "runs"); !errors.Is(err, os.ErrNotExist) {
		t.Errorf("missing file: %v, want not exist", err)
	}
}
