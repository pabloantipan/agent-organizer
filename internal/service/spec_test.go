package service

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
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

// runFixture is two initiatives under one parent: fix, with two run records
// the scan reads under runs/ (one with two waves), one the factory would
// read under docs/runs/ that the scan does not, and a README beside them;
// other, with a run record of its own.
func runFixture(t *testing.T) (*Service, string) {
	t.Helper()
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	t.Setenv("HOME", t.TempDir())
	parent := t.TempDir()
	write := func(rel, s string) {
		p := filepath.Join(parent, rel)
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(s), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("fix/working-on/initiative.yaml", "id: fix\ntitle: Fixture\nstatus: active\nmachine: testbox\nrepos: []\n")
	write("fix/runs/2026-10-20-sup1.md", "---\nwaves:\n  - wave: 1\n    supervisor: sup1\n    cards: [a, c]\n    launched: 2026-10-20T00:00-03:00\n    merged: 2026-10-20T02:00-03:00\n  - wave: 1\n    supervisor: sup2\n    cards: [b, e]\n    launched: 2026-10-20T00:10-03:00\n---\n# sup1 and sup2\n")
	write("fix/runs/2026-10-21-sup3.md", "# sup3, prose only\n")
	write("fix/runs/README.md", "# not a record\n")
	write("fix/docs/runs/2026-10-15-sup0.md", "# sup0, where the scan does not read\n")
	write("other/working-on/initiative.yaml", "id: other\ntitle: Other\nstatus: active\nmachine: testbox\nrepos: []\n")
	write("other/runs/2026-10-22-sup9.md", "# sup9, another initiative's\n")
	cfg := config.Config{Machine: "lodestar", Roots: []string{parent}, MaxDepth: 2}
	s := NewWith(cfg, cache.State{}, func() time.Time { return time.Date(2026, 10, 23, 0, 0, 0, 0, time.UTC) })
	s.Scan(false)
	for _, id := range []string{"fix", "other"} {
		if _, err := s.initiative(id); err != nil {
			t.Fatalf("%s not scanned: %v", id, err)
		}
	}
	return s, filepath.Join(parent, "fix")
}

// W11 (FR-18): a wave's run record reads; a path outside those files, a
// ../ path and another initiative's run record are refused, nothing read.
func TestW11ReadSpecRunRecords(t *testing.T) {
	s, root := runFixture(t)
	for path, want := range map[string]string{
		"runs/2026-10-20-sup1.md":   "# sup1 and sup2\n",
		"./runs/2026-10-21-sup3.md": "# sup3, prose only\n",
	} {
		doc, err := s.ReadSpec("fix", path)
		if err != nil || !strings.HasSuffix(doc.Text, want) || doc.Missing {
			t.Errorf("ReadSpec(%q) = %+v, %v; want text ending %q", path, doc, err, want)
		}
	}
	reads := countReads(t)
	for _, path := range []string{
		"docs/runs/2026-10-15-sup0.md",
		"runs/README.md",
		"runs",
		"working-on/initiative.yaml",
		"../other/runs/2026-10-22-sup9.md",
		"runs/../runs/../../other/runs/2026-10-22-sup9.md",
		"runs/2026-10-22-sup9.md",
		filepath.Join(root, "runs/2026-10-20-sup1.md"),
	} {
		doc, err := s.ReadSpec("fix", path)
		if !errors.Is(err, ErrSpecRefused) || doc.Text != "" {
			t.Errorf("ReadSpec(fix, %q) = %+v, %v; want refused", path, doc, err)
		}
	}
	if _, err := s.ReadSpec("other", "runs/2026-10-20-sup1.md"); !errors.Is(err, ErrSpecRefused) {
		t.Errorf("other reading fix's run record: err %v, want refused", err)
	}
	if *reads != 0 {
		t.Errorf("refused paths read the disk %d times", *reads)
	}
}
