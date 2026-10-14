package service

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/model"
)

// fakeProbe puts a fake probe and the family wrapper next to it in a temp
// dir, and swaps probeBin and command for the test. The wrapper appends its
// arguments to calls.log and exits with the next code of exits (one per
// line, the last repeated), printing "pane: <args>" as probe prints the
// pane's last lines. Every process a launch builds is recorded by name.
type fakeProbe struct {
	dir   string
	calls string
	execs *[]string
}

func newFakeProbe(t *testing.T, family string, exits ...string) fakeProbe {
	t.Helper()
	dir := t.TempDir()
	f := fakeProbe{dir: dir, calls: filepath.Join(dir, "calls.log"), execs: &[]string{}}
	write := func(name, body string) {
		if err := os.WriteFile(filepath.Join(dir, name), []byte("#!/bin/sh\n"+body), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	write("probe", `echo "probe $*" >> "`+f.calls+`"; exit 0`+"\n")
	if err := os.WriteFile(filepath.Join(dir, "exits"), []byte(strings.Join(exits, "\n")+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	write(family+"-probe", `d="`+dir+`"
echo "wrapper $* prelude=$PROBE_PRELUDE_FILE prompt=$PROBE_PROMPT_FILE" >> "$d/calls.log"
code=$(head -n 1 "$d/exits")
[ "$(wc -l < "$d/exits")" -gt 1 ] && { tail -n +2 "$d/exits" > "$d/exits.n"; mv "$d/exits.n" "$d/exits"; }
echo "pane: $*"
exit "$code"
`)
	oldBin, oldCmd := probeBin, command
	probeBin = func() string { return filepath.Join(dir, "probe") }
	command = func(name string, args ...string) *exec.Cmd {
		*f.execs = append(*f.execs, name+" "+strings.Join(args, " "))
		return exec.Command(name, args...)
	}
	t.Cleanup(func() { probeBin, command = oldBin, oldCmd })
	return f
}

// wrapperCalls is what the family wrapper was started with, one per run.
func (f fakeProbe) wrapperCalls(t *testing.T) []string {
	t.Helper()
	b, err := os.ReadFile(f.calls)
	if err != nil && !os.IsNotExist(err) {
		t.Fatal(err)
	}
	var out []string
	for _, l := range strings.Split(strings.TrimSpace(string(b)), "\n") {
		if strings.HasPrefix(l, "wrapper ") {
			out = append(out, l)
		}
	}
	return out
}

// noWindow fails when a launch built anything but /bin/sh -c and probe
// itself: no osascript, no terminal, no typed text.
func (f fakeProbe) noWindow(t *testing.T) {
	t.Helper()
	for _, e := range *f.execs {
		if strings.Contains(e, "osascript") || strings.Contains(e, "x-terminal-emulator") || strings.Contains(e, "iTerm") {
			t.Errorf("a launch executed %q", e)
		}
		if !strings.HasPrefix(e, "/bin/sh -c ") && !strings.HasPrefix(e, probeBin()+" ") {
			t.Errorf("a launch executed %q, want /bin/sh -c <line> or probe", e)
		}
	}
}

func (f fakeProbe) shellRuns() int {
	n := 0
	for _, e := range *f.execs {
		if strings.HasPrefix(e, "/bin/sh -c ") {
			n++
		}
	}
	return n
}

// A1 (leftovers-23 FR-1, FR-2) for Run: the line runs through a shell, no
// osascript; 3 then 0 succeeds after one retry; 3 then 3 and 1 fail with the
// fake's output.
func TestRunCardStartsDetachedAndRetriesOnce(t *testing.T) {
	cases := []struct {
		exits   []string
		runs    int
		wantErr string
	}{
		{[]string{"0"}, 1, ""},
		{[]string{"3", "0"}, 2, ""},
		{[]string{"3", "3"}, 2, "probe exited 3: pane: run-gate"},
		{[]string{"1"}, 1, "probe exited 1: pane: run-gate"},
	}
	for _, tc := range cases {
		t.Run(strings.Join(tc.exits, "-then-"), func(t *testing.T) {
			data := t.TempDir()
			t.Setenv("XDG_DATA_HOME", data)
			f := newFakeProbe(t, "init-a", tc.exits...)
			root := t.TempDir()
			prompt := cardPromptPath("init-a", "run-gate")
			if err := os.MkdirAll(filepath.Dir(prompt), 0o755); err != nil {
				t.Fatal(err)
			}
			if err := os.WriteFile(prompt, []byte("reply ok and stop\n"), 0o644); err != nil {
				t.Fatal(err)
			}
			si := model.ScannedInitiative{}
			si.ID, si.Path = "init-a", root
			si.Cards = []model.Card{{Slug: "run-gate", Status: "next", Spec: "s", Gate: "g", Boundary: []string{"b"}}}
			s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}, now: time.Now}

			l, err := s.RunCard("init-a", "run-gate")
			if tc.wantErr == "" && err != nil {
				t.Fatalf("RunCard: %v", err)
			}
			if tc.wantErr != "" && (err == nil || !strings.Contains(err.Error(), tc.wantErr)) {
				t.Fatalf("RunCard error %v, want it to carry %q", err, tc.wantErr)
			}
			if got := f.shellRuns(); got != tc.runs {
				t.Errorf("%d runs through /bin/sh, want %d: %v", got, tc.runs, *f.execs)
			}
			if !containsExec(*f.execs, "/bin/sh -c "+l.Command) {
				t.Errorf("the launch line did not run through a shell as written: %v", *f.execs)
			}
			calls := f.wrapperCalls(t)
			if len(calls) != tc.runs || !strings.Contains(calls[0], "wrapper run-gate "+root) || !strings.Contains(calls[0], "prompt="+prompt) {
				t.Errorf("wrapper calls %v", calls)
			}
			f.noWindow(t)
		})
	}
}

// A1 for Bring crew up: one seat after another; a failing seat is named, the
// seats before it stay started and the ones after it are not run.
func TestCreateCrewStartsSeatsDetached(t *testing.T) {
	cases := []struct {
		exits   []string
		runs    int
		wantErr string
	}{
		{[]string{"0"}, 2, ""},
		{[]string{"3", "0"}, 3, ""},
		{[]string{"0", "3", "3"}, 3, "seat dev_bruno: probe exited 3: pane: bruno"},
		{[]string{"0", "1"}, 2, "seat dev_bruno: probe exited 1: pane: bruno"},
	}
	for _, tc := range cases {
		t.Run(strings.Join(tc.exits, "-then-"), func(t *testing.T) {
			t.Setenv("XDG_DATA_HOME", t.TempDir())
			f := newFakeProbe(t, "crewfix", tc.exits...)
			api := filepath.Join(f.dir, "discuss-api")
			if err := os.WriteFile(api, []byte("#!/bin/sh\necho 'export DISCUSS_TOKEN=x'\n"), 0o755); err != nil {
				t.Fatal(err)
			}
			t.Setenv("PATH", f.dir+string(os.PathListSeparator)+os.Getenv("PATH"))
			root := t.TempDir()
			if err := os.MkdirAll(filepath.Join(root, "agents"), 0o755); err != nil {
				t.Fatal(err)
			}
			seats := []string{"po_ana", "dev_bruno"}
			if err := os.WriteFile(filepath.Join(root, "agents", "cell.json"), []byte(`{"project":"crewfix","agents":["po_ana","dev_bruno"],"human":"pablo"}`), 0o644); err != nil {
				t.Fatal(err)
			}
			for _, seat := range seats {
				if err := os.WriteFile(filepath.Join(root, "agents", seat+".md"), []byte("# "+seat+"\n"), 0o644); err != nil {
					t.Fatal(err)
				}
			}
			si := model.ScannedInitiative{}
			si.ID, si.Path = "init-crew", root
			si.Cell = &model.Cell{Project: "crewfix", Agents: seats, Human: "pablo"}
			s := &Service{
				cfg:   config.Config{DiscussStateDir: t.TempDir()},
				state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}},
				now:   time.Now,
			}

			cmds, err := s.CreateCrew("init-crew", true)
			if tc.wantErr == "" && (err != nil || len(cmds) != 2) {
				t.Fatalf("CreateCrew: %v, %v", cmds, err)
			}
			if tc.wantErr != "" {
				if err == nil || !strings.Contains(err.Error(), tc.wantErr) {
					t.Fatalf("CreateCrew error %v, want it to carry %q", err, tc.wantErr)
				}
				if len(cmds) != 1 {
					t.Errorf("started %v, want the first seat only", cmds)
				}
			}
			if got := f.shellRuns(); got != tc.runs {
				t.Errorf("%d runs through /bin/sh, want %d: %v", got, tc.runs, *f.execs)
			}
			calls := f.wrapperCalls(t)
			if len(calls) == 0 || !strings.HasPrefix(calls[0], "wrapper ana "+root) {
				t.Errorf("the first seat started as %v", calls)
			}
			f.noWindow(t)
		})
	}
}

// A1 for New agent: the same detached start; no name gets an animal name,
// never probe's attaching -t.
func TestCreateAgentStartsDetached(t *testing.T) {
	f := newFakeProbe(t, "init-a", "0")
	root := t.TempDir()
	si := model.ScannedInitiative{}
	si.ID, si.Path = "init-a", root
	s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}, now: time.Now}

	if err := s.CreateAgent("init-a", "scout"); err != nil {
		t.Fatal(err)
	}
	if err := s.CreateAgent("init-a", ""); err != nil {
		t.Fatal(err)
	}
	calls := f.wrapperCalls(t)
	if len(calls) != 2 || !strings.HasPrefix(calls[0], "wrapper scout "+root) {
		t.Fatalf("wrapper calls %v", calls)
	}
	if strings.Contains(calls[1], "-t") || !strings.HasSuffix(strings.Fields(calls[1])[2], root) {
		t.Errorf("an unnamed agent started as %q, want <animal-nnnn> <dir>", calls[1])
	}
	f.noWindow(t)
}

// A2 (leftovers-23 FR-3): Attach's Terminal fallback attaches; plain
// `probe <name>` on a live seat starts nothing and attaches nothing.
func TestAttachFallbackAttaches(t *testing.T) {
	old := probeBin
	probeBin = func() string { return "/home/x/bin/probe" }
	t.Cleanup(func() { probeBin = old })
	if got, want := attachFallback("organizer-probe-dl-build"), "'/home/x/bin/probe' --attach 'organizer-probe-dl-build'"; got != want {
		t.Errorf("attachFallback = %s, want %s", got, want)
	}
}

func containsExec(execs []string, want string) bool {
	for _, e := range execs {
		if e == want {
			return true
		}
	}
	return false
}
