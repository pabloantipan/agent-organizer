package service

import (
	"errors"
	"os"
	"path/filepath"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
)

// specFixture is an initiative root with a specs: folder, a card whose
// spec: names a file outside it with a #section and prose after, and a
// file nothing names, scanned.
func specFixture(t *testing.T) (*Service, string) {
	t.Helper()
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	t.Setenv("HOME", t.TempDir())
	root := t.TempDir()
	write := func(rel, s string) {
		p := filepath.Join(root, rel)
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(s), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("working-on/initiative.yaml", "id: fix\ntitle: Fixture\nstatus: active\nmachine: testbox\nrepos: []\nspecs: [docs/specs]\n")
	write("working-on/reader.md", "---\ntitle: Reader\nstatus: next\nupdated: 2026-10-16\nnext: build it\nspec: \"docs/other/card.md#change-on-the-map (FR-6)\"\n---\n")
	write("docs/specs/a.md", "# A\n")
	write("docs/specs/with space.md", "# Spaced\n")
	write("docs/other/card.md", "# Card spec\n")
	write("docs/secret.md", "not a spec\n")
	cfg := config.Config{Machine: "lodestar", Roots: []string{root}, MaxDepth: 2}
	s := NewWith(cfg, cache.State{}, func() time.Time { return time.Date(2026, 10, 16, 0, 0, 0, 0, time.UTC) })
	s.Scan(false)
	if _, err := s.initiative("fix"); err != nil {
		t.Fatalf("fixture not scanned: %v", err)
	}
	return s, root
}

// countReads swaps the spec reader for one that counts its calls.
func countReads(t *testing.T) *int {
	t.Helper()
	n := 0
	prev := readSpecFile
	readSpecFile = func(p string) ([]byte, error) { n++; return os.ReadFile(p) }
	t.Cleanup(func() { readSpecFile = prev })
	return &n
}

func TestReadSpecResolved(t *testing.T) {
	s, _ := specFixture(t)
	for path, want := range map[string]string{
		"docs/specs/a.md":                      "# A\n",
		"docs/other/card.md":                   "# Card spec\n",
		"docs/other/card.md#change-on-the-map": "# Card spec\n",
		"./docs/specs/a.md":                    "# A\n",
		"docs/specs/with space.md":             "# Spaced\n",
	} {
		doc, err := s.ReadSpec("fix", path)
		if err != nil || doc.Text != want || doc.Missing {
			t.Errorf("ReadSpec(%q) = %+v, %v; want %q", path, doc, err, want)
		}
	}
}

// G3: a path outside the resolved specs is refused, nothing read.
func TestG3ReadSpecRefusesUnresolved(t *testing.T) {
	s, root := specFixture(t)
	reads := countReads(t)
	for _, path := range []string{
		"docs/secret.md",
		"working-on/initiative.yaml",
		"working-on/reader.md",
		"../" + filepath.Base(root) + "/docs/secret.md",
		"docs/specs/../secret.md",
		filepath.Join(root, "docs/specs/a.md"),
		"/etc/passwd",
		"",
	} {
		doc, err := s.ReadSpec("fix", path)
		if !errors.Is(err, ErrSpecRefused) {
			t.Errorf("ReadSpec(%q) err = %v, want refused", path, err)
		}
		if doc.Text != "" {
			t.Errorf("ReadSpec(%q) returned text %q", path, doc.Text)
		}
	}
	if *reads != 0 {
		t.Errorf("refused paths read the disk %d times", *reads)
	}
	if _, err := s.ReadSpec("nope", "docs/specs/a.md"); err == nil || *reads != 0 {
		t.Errorf("unknown initiative: err %v, reads %d", err, *reads)
	}
}

// A resolved path whose file went away after the scan reads missing.
func TestReadSpecMissing(t *testing.T) {
	s, root := specFixture(t)
	if err := os.Remove(filepath.Join(root, "docs/other/card.md")); err != nil {
		t.Fatal(err)
	}
	doc, err := s.ReadSpec("fix", "docs/other/card.md")
	if err != nil || !doc.Missing || doc.Text != "" {
		t.Fatalf("ReadSpec = %+v, %v; want missing", doc, err)
	}
}

func TestSpecRel(t *testing.T) {
	for in, want := range map[string]string{
		"docs/specs/diagrams.md (FR-6 to FR-8; diagrams-in-app D1-D8)": "docs/specs/diagrams.md",
		"docs/x.md#sec":  "docs/x.md",
		"docs/x.md#sec,": "docs/x.md",
		"./a/../b.md":    "b.md",
		"../out.md":      "",
		"/abs.md":        "",
		"#only":          "",
		"   ":            "",
	} {
		got, ok := specRel(in)
		if got != want || ok != (want != "") {
			t.Errorf("specRel(%q) = %q, %v; want %q", in, got, ok, want)
		}
	}
}
