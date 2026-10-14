package service

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strings"
	"sync"
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

// A1 for Bring crew up: one seat after another, detached; a failing seat
// is named on its entry with probe's exit and output, the seats before it
// stay started and a failure does not stop the rest (leftovers-27 FR-2).
func TestCreateCrewStartsSeatsDetached(t *testing.T) {
	cases := []struct {
		exits   []string
		runs    int
		wantErr string
	}{
		{[]string{"0"}, 2, ""},
		{[]string{"3", "0"}, 3, ""},
		{[]string{"0", "3", "3"}, 3, "dev_bruno exit 3: pane: bruno"},
		{[]string{"0", "1"}, 2, "dev_bruno exit 1: pane: bruno"},
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
			if err != nil || len(cmds) != 2 {
				t.Fatalf("CreateCrew: %v, %v", cmds, err)
			}
			got, _ := s.WaitLaunch("init-crew")
			var failed []string
			for _, seat := range got.Seats {
				if seat.State == LaunchFailed {
					failed = append(failed, fmt.Sprintf("%s exit %d: %s", seat.Seat, seat.Exit, seat.Output))
				} else if seat.State != LaunchRunning {
					t.Errorf("seat %s ended %s", seat.Seat, seat.State)
				}
			}
			if f := strings.Join(failed, "; "); (tc.wantErr == "") != (f == "") || !strings.HasPrefix(f, tc.wantErr) {
				t.Errorf("failed seats %q, want %q", f, tc.wantErr)
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
	if got, _ := s.WaitLaunch("init-a"); len(got.Seats) != 2 || got.Running != 2 {
		t.Fatalf("New agent twice: %+v", got)
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

// stubCrew lays a cell of three seats whose probe is scripts/probe-stub.sh
// (ORGANIZER_PROBE_BIN, leftovers-27 FR-4), with a fake discuss-api for the
// token preflight, a fake clock and an after that never fires on its own.
// Every change OnLaunch hears is kept, as "<seat> <state>".
type stubCrew struct {
	s      *Service
	log    string
	mu     *sync.Mutex
	at     *time.Time
	events *[]string
}

func newStubCrew(t *testing.T, fail string) stubCrew {
	t.Helper()
	stub, err := filepath.Abs(filepath.Join("..", "..", "scripts", "probe-stub.sh"))
	if err != nil {
		t.Fatal(err)
	}
	notes := t.TempDir()
	t.Setenv("ORGANIZER_PROBE_BIN", stub)
	t.Setenv("PROBE_STUB_SLEEP", "1")
	t.Setenv("PROBE_STUB_FAIL", fail)
	t.Setenv("PROBE_STUB_LOG", filepath.Join(notes, "stub.log"))
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	api := filepath.Join(notes, "discuss-api")
	if err := os.WriteFile(api, []byte("#!/bin/sh\necho 'export DISCUSS_TOKEN=x'\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", notes+string(os.PathListSeparator)+os.Getenv("PATH"))
	root := t.TempDir()
	seats := []string{"po_ana", "dev_bruno", "qa_cleo"}
	if err := os.MkdirAll(filepath.Join(root, "agents"), 0o755); err != nil {
		t.Fatal(err)
	}
	for _, seat := range seats {
		if err := os.WriteFile(filepath.Join(root, "agents", seat+".md"), []byte("# "+seat+"\n"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	if err := os.WriteFile(filepath.Join(root, "agents", "cell.json"), []byte(`{"project":"crewfix","agents":["po_ana","dev_bruno","qa_cleo"],"human":"pablo"}`), 0o644); err != nil {
		t.Fatal(err)
	}
	si := model.ScannedInitiative{}
	si.ID, si.Path = "init-crew", root
	si.Cell = &model.Cell{Project: "crewfix", Agents: seats, Human: "pablo"}
	c := stubCrew{log: filepath.Join(notes, "stub.log"), mu: &sync.Mutex{}, events: &[]string{}}
	at := time.Date(2026, 10, 14, 12, 0, 0, 0, time.UTC)
	c.at = &at
	c.s = &Service{
		cfg:   config.Config{DiscussStateDir: t.TempDir()},
		state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}},
		now:   func() time.Time { c.mu.Lock(); defer c.mu.Unlock(); return *c.at },
		after: func(time.Duration, func()) {},
	}
	c.s.OnLaunch = func(ch LaunchChange) {
		if ch.Seat == nil {
			return
		}
		c.mu.Lock()
		*c.events = append(*c.events, ch.Seat.Seat+" "+ch.Seat.State)
		c.mu.Unlock()
	}
	return c
}

func (c stubCrew) advance(d time.Duration) { c.mu.Lock(); *c.at = c.at.Add(d); c.mu.Unlock() }

// waitFor polls the heard changes until one is want.
func (c stubCrew) waitFor(t *testing.T, want string) {
	t.Helper()
	for end := time.Now().Add(10 * time.Second); time.Now().Before(end); time.Sleep(20 * time.Millisecond) {
		c.mu.Lock()
		got := slices.Contains(*c.events, want)
		c.mu.Unlock()
		if got {
			return
		}
	}
	t.Fatalf("never heard %q; heard %v", want, *c.events)
}

// seatsOf reads the initiative's entries off the feed as "<seat> <state>".
func seatsOf(s *Service, id string) []string {
	var out []string
	for _, l := range s.Launches() {
		if l.Initiative == id {
			for _, seat := range l.Seats {
				out = append(out, seat.Seat+" "+seat.State)
			}
		}
	}
	return out
}

func (c stubCrew) stubCalls(t *testing.T, name string) int {
	t.Helper()
	b, _ := os.ReadFile(c.log)
	n := 0
	for _, l := range strings.Split(string(b), "\n") {
		if f := strings.Fields(l); len(f) > 1 && f[1] == name {
			n++
		}
	}
	return n
}

// P1 (leftovers-27 FR-1 to FR-3): a crew of three through the probe stub,
// the second seat failing twice. Stop starting while it starts skips the
// third; Try again restarts that one seat; a start whose seats all run (or
// were skipped) is dropped 5 s after it settles, one with a failure is kept
// until it is retried, seen or not.
func TestLaunchStatesThroughTheStub(t *testing.T) {
	c := newStubCrew(t, "bruno")
	s := c.s
	if _, err := s.CreateCrew("init-crew", true); err != nil {
		t.Fatal(err)
	}
	if got := seatsOf(s, "init-crew"); len(got) != 3 || got[2] != "qa_cleo queued" {
		t.Fatalf("after Bring crew up: %v, want three entries, the third queued", got)
	}
	c.waitFor(t, "dev_bruno starting")
	s.StopStarting("init-crew")
	if got := seatsOf(s, "init-crew"); !slices.Equal(got, []string{"po_ana running", "dev_bruno starting", "qa_cleo skipped"}) {
		t.Errorf("after Stop starting: %v", got)
	}
	c.waitFor(t, "dev_bruno retrying")
	got, _ := s.WaitLaunch("init-crew")
	b := got.Seats[1]
	if b.State != LaunchFailed || b.Exit != 3 || b.Reason != "the pane did not run claude (probe exit 3, twice)" ||
		!strings.Contains(b.Output, "pane bruno: claude did not start") || !strings.Contains(b.Line, "'bruno'") || b.StartedAt == nil {
		t.Errorf("the failed seat reads %+v", b)
	}
	if got.Seen || got.Failed != 1 || got.Running != 1 || !got.Done {
		t.Errorf("settled start: seen %v failed %d running %d done %v", got.Seen, got.Failed, got.Running, got.Done)
	}
	want := []string{
		"po_ana queued", "dev_bruno queued", "qa_cleo queued",
		"po_ana starting", "po_ana running",
		"dev_bruno starting", "qa_cleo skipped", "dev_bruno retrying", "dev_bruno failed",
	}
	c.mu.Lock()
	if !slices.Equal(*c.events, want) {
		t.Errorf("changes heard\n %v\nwant\n %v", *c.events, want)
	}
	c.mu.Unlock()
	if n := c.stubCalls(t, "cleo"); n != 0 {
		t.Errorf("the skipped seat ran %d times", n)
	}

	// A failure is kept past the 5 s, unseen and seen.
	c.advance(10 * time.Second)
	if seatsOf(s, "init-crew") == nil {
		t.Fatal("a start with a failure was dropped before it was seen")
	}
	s.SeenLaunch("init-crew")
	c.advance(10 * time.Second)
	if l := s.Launches(); len(l) != 1 || !l[0].Seen {
		t.Fatalf("after SeenLaunch: %+v, want the start kept and seen", l)
	}

	// Try again restarts one seat: bruno, once more, not cleo.
	t.Setenv("PROBE_STUB_FAIL", "")
	if err := s.RetrySeat("init-crew", "dev_bruno"); err != nil {
		t.Fatal(err)
	}
	got, _ = s.WaitLaunch("init-crew")
	if got.Seats[1].State != LaunchRunning || got.Seats[2].State != LaunchSkipped || got.Failed != 0 {
		t.Errorf("after Try again: %+v", got.Seats)
	}
	if b, cl := c.stubCalls(t, "bruno"), c.stubCalls(t, "cleo"); b != 3 || cl != 0 {
		t.Errorf("stub ran bruno %d times and cleo %d, want 3 and 0", b, cl)
	}
	// Settled with no failure: on the feed for 5 s, then gone.
	c.advance(4 * time.Second)
	if seatsOf(s, "init-crew") == nil {
		t.Fatal("dropped before its 5 s")
	}
	c.advance(time.Second)
	if got := seatsOf(s, "init-crew"); got != nil {
		t.Fatalf("still on the feed 5 s after all ran: %v", got)
	}
}

// P1, the plain case: every seat runs, the start is dropped 5 s after the
// last one, and the drop is announced through after (the app's emit).
func TestLaunchAllRunningIsDroppedAfterFiveSeconds(t *testing.T) {
	c := newStubCrew(t, "")
	var kept []time.Duration
	c.s.after = func(d time.Duration, f func()) { kept = append(kept, d) }
	if _, err := c.s.CreateCrew("init-crew", true); err != nil {
		t.Fatal(err)
	}
	got, _ := c.s.WaitLaunch("init-crew")
	if got.Running != 3 || !got.Seen {
		t.Fatalf("all three should run: %+v", got)
	}
	if !slices.Equal(kept, []time.Duration{launchKeep}) || launchKeep != 5*time.Second {
		t.Errorf("drop scheduled %v, want once after 5s", kept)
	}
	c.advance(4999 * time.Millisecond)
	if seatsOf(c.s, "init-crew") == nil {
		t.Fatal("dropped early")
	}
	c.advance(time.Millisecond)
	if seatsOf(c.s, "init-crew") != nil {
		t.Fatal("kept past 5 s")
	}
	if err := c.s.RetrySeat("init-crew", "po_ana"); err == nil {
		t.Error("RetrySeat on a dropped start should refuse")
	}
}

// A second Bring crew up while one is starting refuses, naming Stop starting.
func TestCrewStartRefusesWhileOneIsStarting(t *testing.T) {
	c := newStubCrew(t, "")
	if _, err := c.s.CreateCrew("init-crew", true); err != nil {
		t.Fatal(err)
	}
	if _, err := c.s.CreateCrew("init-crew", true); err == nil || !strings.Contains(err.Error(), "Stop starting") {
		t.Errorf("second CreateCrew: %v", err)
	}
	c.s.StopStarting("init-crew")
	c.s.WaitLaunch("init-crew")
}
