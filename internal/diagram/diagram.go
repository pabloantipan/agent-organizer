// Package diagram draws one mermaid block as a dark SVG the way
// `mermaid2svg --style dark` does (docs/specs/diagrams.md FR-1): the four
// classDef lines of ~/.mermaid/classdefs-dark.mmd are appended to the block
// (a later classDef of the same class wins; no stylesheet outranks mermaid's
// scoped classDef rules), then mmdc runs with the dark config and CSS. The
// SVG is cached under <data>/organizer/diagrams/<sha256>.svg, the hash over
// the block and the three style files, so an edited block or a changed style
// is a new key and a cached one returns without running mmdc. Rendered when
// a body is shown, never by the scan; the source is never changed, and
// nothing is written outside the cache directory.
package diagram

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
)

// StyleFiles are the dark style's three files in the mermaid home, in the
// order they enter the cache key.
var StyleFiles = []string{"classdefs-dark.mmd", "mermaid-config-dark.json", "mermaid-styles-dark.css"}

// Timeout bounds one mmdc run: it starts a headless browser, so a first
// render takes seconds, and a hung one is killed with its process group.
const Timeout = 90 * time.Second

// Renderer finds mmdc and the dark style and keeps the cache. The zero
// value is not usable; New reads the environment once.
type Renderer struct {
	Home       string // the user's home: ~/.nvm lives here
	MermaidDir string // the style files (MERMAID_HOME, else ~/.mermaid)
	CacheDir   string // <data>/organizer/diagrams
	Path       string // the PATH searched for mmdc
	Timeout    time.Duration

	mu sync.Mutex // one mmdc at a time: each starts a browser
}

// New is the renderer over the real environment: HOME, MERMAID_HOME, PATH
// and the organizer's data dir (XDG_DATA_HOME or ~/.local/share).
func New() *Renderer {
	home, _ := os.UserHomeDir()
	mdir := os.Getenv("MERMAID_HOME")
	if mdir == "" {
		mdir = filepath.Join(home, ".mermaid")
	}
	base := os.Getenv("XDG_DATA_HOME")
	if base == "" {
		base = filepath.Join(home, ".local", "share")
	}
	return &Renderer{
		Home:       home,
		MermaidDir: mdir,
		CacheDir:   filepath.Join(base, "organizer", "diagrams"),
		Path:       os.Getenv("PATH"),
		Timeout:    Timeout,
	}
}

// ErrNoMmdc is the reason a figure reads when mmdc is nowhere to be found.
var ErrNoMmdc = errors.New("mmdc not found (npm install -g @mermaid-js/mermaid-cli)")

// Mmdc is mmdc on the PATH, else the newest ~/.nvm/versions/node/*/bin/mmdc.
func (r *Renderer) Mmdc() (string, error) {
	for _, dir := range filepath.SplitList(r.Path) {
		if dir == "" {
			continue
		}
		if p := filepath.Join(dir, "mmdc"); executable(p) {
			return p, nil
		}
	}
	found, _ := filepath.Glob(filepath.Join(r.Home, ".nvm", "versions", "node", "*", "bin", "mmdc"))
	sort.SliceStable(found, func(i, j int) bool {
		return newer(nodeVersion(found[i]), nodeVersion(found[j]))
	})
	for _, p := range found {
		if executable(p) {
			return p, nil
		}
	}
	return "", ErrNoMmdc
}

func executable(p string) bool {
	st, err := os.Stat(p)
	return err == nil && !st.IsDir() && st.Mode()&0o111 != 0
}

// nodeVersion reads v24.0.1 out of …/node/v24.0.1/bin/mmdc as numbers.
func nodeVersion(p string) []int {
	v := strings.TrimPrefix(filepath.Base(filepath.Dir(filepath.Dir(p))), "v")
	var out []int
	for _, s := range strings.Split(v, ".") {
		n, err := strconv.Atoi(s)
		if err != nil {
			break
		}
		out = append(out, n)
	}
	return out
}

func newer(a, b []int) bool {
	for i := 0; i < len(a) && i < len(b); i++ {
		if a[i] != b[i] {
			return a[i] > b[i]
		}
	}
	return len(a) > len(b)
}

// style reads the three style files; a missing one is the reason.
func (r *Renderer) style() ([][]byte, error) {
	var out [][]byte
	for _, f := range StyleFiles {
		b, err := os.ReadFile(filepath.Join(r.MermaidDir, f))
		if err != nil {
			return nil, fmt.Errorf("dark style missing: %s", filepath.Join(r.shortDir(), f))
		}
		out = append(out, b)
	}
	return out, nil
}

func (r *Renderer) shortDir() string {
	if r.Home != "" && strings.HasPrefix(r.MermaidDir, r.Home+string(filepath.Separator)) {
		return "~" + strings.TrimPrefix(r.MermaidDir, r.Home)
	}
	return r.MermaidDir
}

// Background is mmdc's -b. mmdc paints the SVG's root white unless told
// otherwise, whatever the config's theme says, and mermaid2svg passes no -b:
// a figure drawn that way is a light panel on the dark ground (No-gos;
// diagrams-in-app §1, "the figure's background is transparent").
const Background = "transparent"

// Key is the cache key of a block under the given style files' contents
// and the flags it is drawn with.
func Key(source string, style [][]byte) string {
	h := sha256.New()
	fmt.Fprintf(h, "-b %s\n%d\n%s", Background, len(source), source)
	for _, b := range style {
		fmt.Fprintf(h, "\n%d\n", len(b))
		h.Write(b)
	}
	return hex.EncodeToString(h.Sum(nil))
}

// Input is what mmdc reads: the block, then the dark classDef lines.
func Input(source string, classdefs []byte) string {
	return strings.TrimRight(source, "\n") + "\n" + strings.TrimRight(string(classdefs), "\n") + "\n"
}

// Render returns the block's dark SVG, from the cache when it is there.
// The error is the reason the figure reads: mmdc not found, the dark style
// missing, or mmdc's first error line.
func (r *Renderer) Render(source string) (string, error) {
	if strings.TrimSpace(source) == "" {
		return "", errors.New("empty diagram")
	}
	style, err := r.style()
	if err != nil {
		return "", err
	}
	cached := filepath.Join(r.CacheDir, Key(source, style)+".svg")
	if b, err := os.ReadFile(cached); err == nil {
		return string(b), nil
	}
	mmdc, err := r.Mmdc()
	if err != nil {
		return "", err
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	if b, err := os.ReadFile(cached); err == nil { // drawn while this one waited
		return string(b), nil
	}
	if err := os.MkdirAll(r.CacheDir, 0o755); err != nil {
		return "", err
	}
	in, err := os.CreateTemp(r.CacheDir, "in-*.mmd")
	if err != nil {
		return "", err
	}
	defer os.Remove(in.Name())
	if _, err := in.WriteString(Input(source, style[0])); err != nil {
		in.Close()
		return "", err
	}
	in.Close()
	out := strings.TrimSuffix(in.Name(), ".mmd") + ".svg"
	defer os.Remove(out)

	said, err := r.run(mmdc, "-i", in.Name(), "-o", out, "-b", Background,
		"-c", filepath.Join(r.MermaidDir, StyleFiles[1]),
		"-C", filepath.Join(r.MermaidDir, StyleFiles[2]))
	if err != nil {
		return "", err
	}
	b, err := os.ReadFile(out)
	if err != nil || len(bytes.TrimSpace(b)) == 0 {
		if line := FirstError(said); line != "" {
			return "", errors.New(line)
		}
		return "", errors.New("mmdc wrote no SVG")
	}
	if err := os.Rename(out, cached); err != nil {
		return "", err
	}
	return string(b), nil
}

// run starts mmdc in its own process group, with its directory first on
// PATH (mmdc is a node script, and an app started from Finder has no nvm on
// its PATH), and kills the group when it outlives the timeout.
func (r *Renderer) run(mmdc string, args ...string) (string, error) {
	timeout := r.Timeout
	if timeout == 0 {
		timeout = Timeout
	}
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	cmd := exec.CommandContext(ctx, mmdc, args...)
	cmd.Dir = r.CacheDir
	cmd.Env = append(os.Environ(), "PATH="+filepath.Dir(mmdc)+string(filepath.ListSeparator)+r.Path)
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	cmd.Cancel = func() error { return syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL) }
	var outb bytes.Buffer
	cmd.Stdout, cmd.Stderr = &outb, &outb
	err := cmd.Run()
	if ctx.Err() == context.DeadlineExceeded {
		return "", fmt.Errorf("mmdc took longer than %s", timeout)
	}
	if err != nil {
		if line := FirstError(outb.String()); line != "" {
			return "", errors.New(line)
		}
		return "", fmt.Errorf("mmdc failed: %v", err)
	}
	return outb.String(), nil
}

// FirstError is mmdc's first error line: the first line that says Error,
// else the first line with text.
func FirstError(out string) string {
	first := ""
	for _, l := range strings.Split(out, "\n") {
		l = strings.TrimSpace(l)
		if l == "" {
			continue
		}
		if strings.Contains(l, "Error") {
			return l
		}
		if first == "" {
			first = l
		}
	}
	return first
}

// Status is organizer doctor's diagrams line: `mmdc <path>, dark style ok`,
// or what is missing.
func (r *Renderer) Status() string {
	var missing []string
	mmdc, err := r.Mmdc()
	if err != nil {
		missing = append(missing, err.Error())
	}
	if _, err := r.style(); err != nil {
		missing = append(missing, err.Error())
	}
	if len(missing) > 0 {
		if mmdc != "" {
			missing = append([]string{"mmdc " + mmdc}, missing...)
		}
		return strings.Join(missing, "; ")
	}
	return "mmdc " + mmdc + ", dark style ok"
}
