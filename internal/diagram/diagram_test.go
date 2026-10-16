package diagram

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A fake home: ~/.mermaid with the dark style, a data dir, and a PATH that
// holds only what a test puts there. Never the real ~/.nvm, ~/.mermaid or
// data dir (G1, G2).

const classdefs = `    classDef added   fill:#37284d,stroke:#b06cff
    classDef changed fill:#3f302a,stroke:#ffb020
    classDef removed fill:none,stroke:#958ea2,stroke-dasharray:5 3
    classDef context fill:#201b2b,stroke:#44404d
`

const block = "flowchart LR\n    a --> b\n    class a added\n"

// fakeMmdc writes an mmdc that logs one line per run, copies its -i input
// beside the log, and writes a tiny SVG to -o; with fail set it prints an
// mmdc-shaped parse error and exits 1.
func fakeMmdc(t *testing.T, dir string, fail bool) (bin, log string) {
	t.Helper()
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	log = filepath.Join(dir, "runs.log")
	body := `#!/bin/sh
src=""; dst=""
while [ $# -gt 0 ]; do
  case "$1" in -i) src="$2"; shift;; -o) dst="$2"; shift;; -b) bg="$2"; shift;; esac
  shift
done
echo run >> "` + log + `"
echo "$bg" > "` + dir + `/last-background"
/bin/cp "$src" "` + dir + `/last-input"
`
	if fail {
		body += `echo "Generating single mermaid chart"
echo ""
echo "Error: Parse error on line 2:" >&2
echo "...a -->" >&2
exit 1
`
	} else {
		body += `echo '<svg xmlns="http://www.w3.org/2000/svg"><g/></svg>' > "$dst"
`
	}
	bin = filepath.Join(dir, "mmdc")
	if err := os.WriteFile(bin, []byte(body), 0o755); err != nil {
		t.Fatal(err)
	}
	return bin, log
}

func fakeHome(t *testing.T) *Renderer {
	t.Helper()
	home := t.TempDir()
	m := filepath.Join(home, ".mermaid")
	os.MkdirAll(m, 0o755)
	os.WriteFile(filepath.Join(m, StyleFiles[0]), []byte(classdefs), 0o644)
	os.WriteFile(filepath.Join(m, StyleFiles[1]), []byte(`{"theme":"base"}`), 0o644)
	os.WriteFile(filepath.Join(m, StyleFiles[2]), []byte(`svg{}`), 0o644)
	return &Renderer{
		Home:       home,
		MermaidDir: m,
		CacheDir:   filepath.Join(home, "data", "organizer", "diagrams"),
		Path:       filepath.Join(home, "empty-bin"),
	}
}

func runs(_ *testing.T, log string) int {
	b, _ := os.ReadFile(log)
	return strings.Count(string(b), "run\n")
}

func render(t *testing.T, r *Renderer, src string) string {
	t.Helper()
	svg, err := r.Render(src)
	if err != nil {
		t.Fatalf("render: %v", err)
	}
	return svg
}

// G1: twice is one run; a changed node and a changed classdefs file each
// run again; the input ends with the four dark classDef lines.
func TestG1RenderCachesAndAppendsDarkClassdefs(t *testing.T) {
	r := fakeHome(t)
	bin := filepath.Join(r.Home, "bin")
	_, log := fakeMmdc(t, bin, false)
	r.Path = bin

	svg := render(t, r, block)
	if !strings.Contains(svg, "<svg") {
		t.Fatalf("svg = %q", svg)
	}
	render(t, r, block)
	if n := runs(t, log); n != 1 {
		t.Fatalf("mmdc ran %d times for the same block twice, want 1", n)
	}
	in, err := os.ReadFile(filepath.Join(bin, "last-input"))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(string(in), block) {
		t.Fatalf("input does not start with the block unchanged:\n%s", in)
	}
	if !strings.HasSuffix(string(in), classdefs) {
		t.Fatalf("input does not end with the four dark classDef lines:\n%s", in)
	}
	if bg, _ := os.ReadFile(filepath.Join(bin, "last-background")); string(bg) != "transparent\n" {
		t.Fatalf("mmdc ran with -b %q, want transparent: no light panel", bg)
	}
	lines := strings.Split(strings.TrimRight(string(in), "\n"), "\n")
	for _, l := range lines[len(lines)-4:] {
		if !strings.HasPrefix(strings.TrimSpace(l), "classDef ") {
			t.Fatalf("last four lines are not classDef lines: %q", lines[len(lines)-4:])
		}
	}

	render(t, r, strings.Replace(block, "a --> b", "a --> c", 1))
	if n := runs(t, log); n != 2 {
		t.Fatalf("a changed node ran mmdc %d times in all, want 2", n)
	}
	os.WriteFile(filepath.Join(r.MermaidDir, StyleFiles[0]), []byte(classdefs+"    classDef extra fill:none\n"), 0o644)
	render(t, r, block)
	if n := runs(t, log); n != 3 {
		t.Fatalf("a changed classdefs-dark.mmd ran mmdc %d times in all, want 3", n)
	}

	// Nothing but the cached SVGs is left in the cache; nothing outside it.
	ents, _ := os.ReadDir(r.CacheDir)
	for _, e := range ents {
		if !strings.HasSuffix(e.Name(), ".svg") || strings.HasPrefix(e.Name(), "in-") {
			t.Fatalf("left in the cache: %s", e.Name())
		}
	}
	if len(ents) != 3 {
		t.Fatalf("cache holds %d files, want 3", len(ents))
	}
}

// G1: with none on the PATH, nvm's newest node version is found (v24 over
// v9 and v18, by number, not by name).
func TestG1MmdcFromNewestNvm(t *testing.T) {
	r := fakeHome(t)
	for _, v := range []string{"v9.11.2", "v24.0.1", "v18.20.4"} {
		fakeMmdc(t, filepath.Join(r.Home, ".nvm", "versions", "node", v, "bin"), false)
	}
	got, err := r.Mmdc()
	if err != nil {
		t.Fatal(err)
	}
	if want := filepath.Join(r.Home, ".nvm", "versions", "node", "v24.0.1", "bin", "mmdc"); got != want {
		t.Fatalf("mmdc = %s, want %s", got, want)
	}
	render(t, r, block)
	if n := runs(t, filepath.Join(filepath.Dir(got), "runs.log")); n != 1 {
		t.Fatalf("nvm's mmdc ran %d times, want 1", n)
	}

	// The PATH wins over nvm.
	onPath := filepath.Join(r.Home, "bin")
	fakeMmdc(t, onPath, false)
	r.Path = onPath
	if got, _ := r.Mmdc(); got != filepath.Join(onPath, "mmdc") {
		t.Fatalf("mmdc = %s, want the one on the PATH", got)
	}
}

// G2: the three reasons, and nothing cached or left behind on failure.
func TestG2Reasons(t *testing.T) {
	t.Run("no mmdc", func(t *testing.T) {
		r := fakeHome(t)
		_, err := r.Render(block)
		if err == nil || !strings.HasPrefix(err.Error(), "mmdc not found") {
			t.Fatalf("err = %v, want mmdc not found", err)
		}
	})
	t.Run("dark style missing", func(t *testing.T) {
		r := fakeHome(t)
		bin := filepath.Join(r.Home, "bin")
		_, log := fakeMmdc(t, bin, false)
		r.Path = bin
		os.Remove(filepath.Join(r.MermaidDir, StyleFiles[2]))
		_, err := r.Render(block)
		if err == nil || err.Error() != "dark style missing: ~/.mermaid/mermaid-styles-dark.css" {
			t.Fatalf("err = %v", err)
		}
		if runs(t, log) != 0 {
			t.Fatal("mmdc ran without the dark style")
		}
	})
	t.Run("mmdc exits 1", func(t *testing.T) {
		r := fakeHome(t)
		bin := filepath.Join(r.Home, "bin")
		_, log := fakeMmdc(t, bin, true)
		r.Path = bin
		_, err := r.Render(block)
		if err == nil || err.Error() != "Error: Parse error on line 2:" {
			t.Fatalf("err = %v, want mmdc's first error line", err)
		}
		ents, _ := os.ReadDir(r.CacheDir)
		if len(ents) != 0 {
			t.Fatalf("a failed render left %d files in the cache", len(ents))
		}
		r.Render(block)
		if n := runs(t, log); n != 2 {
			t.Fatalf("a failure was cached: mmdc ran %d times, want 2", n)
		}
	})
}

func TestStatus(t *testing.T) {
	r := fakeHome(t)
	if got := r.Status(); got != "mmdc not found (npm install -g @mermaid-js/mermaid-cli)" {
		t.Fatalf("status = %q", got)
	}
	bin := filepath.Join(r.Home, "bin")
	fakeMmdc(t, bin, false)
	r.Path = bin
	if got, want := r.Status(), "mmdc "+filepath.Join(bin, "mmdc")+", dark style ok"; got != want {
		t.Fatalf("status = %q, want %q", got, want)
	}
	os.Remove(filepath.Join(r.MermaidDir, StyleFiles[0]))
	if got, want := r.Status(), "mmdc "+filepath.Join(bin, "mmdc")+"; dark style missing: ~/.mermaid/classdefs-dark.mmd"; got != want {
		t.Fatalf("status = %q, want %q", got, want)
	}
}

func TestNewFollowsTheDataDir(t *testing.T) {
	d := t.TempDir()
	t.Setenv("XDG_DATA_HOME", d)
	t.Setenv("MERMAID_HOME", "")
	if got := New().CacheDir; got != filepath.Join(d, "organizer", "diagrams") {
		t.Fatalf("cache = %s", got)
	}
}
