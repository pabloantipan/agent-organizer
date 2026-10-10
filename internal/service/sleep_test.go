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
	"organizer/internal/model"
)

// sleepFixture is a roots dir of initiatives and a service over it, with the
// fake factory in testdata first on PATH. a to d are active, e paused, arc
// archived, and blind active but missing from the roots the fake factory
// sees. So four are awake: the limit.
type sleepFixture struct {
	s     *Service
	roots string
	log   string
}

func newSleepFixture(t *testing.T) sleepFixture {
	t.Helper()
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	t.Setenv("HOME", t.TempDir()) // so the ~/bin fallback finds no real factory
	fake, err := filepath.Abs(filepath.Join("..", "..", "testdata", "factory"))
	if err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", fake+":/usr/bin:/bin")
	roots := t.TempDir()
	status := map[string]string{"a": "active", "b": "active", "c": "active", "d": "active", "e": "paused", "arc": "archived", "blind": "active"}
	var seen []string
	for id, st := range status {
		root := filepath.Join(roots, id)
		if err := os.MkdirAll(filepath.Join(root, "working-on"), 0o755); err != nil {
			t.Fatal(err)
		}
		y := "id: " + id + "\ntitle: " + strings.ToUpper(id) + "\nstatus: " + st + "\nrepos: []\n"
		if err := os.WriteFile(filepath.Join(root, "working-on", "initiative.yaml"), []byte(y), 0o644); err != nil {
			t.Fatal(err)
		}
		if id != "blind" {
			seen = append(seen, root)
		}
	}
	log := filepath.Join(t.TempDir(), "argv.log")
	t.Setenv("FAKE_FACTORY_ROOTS", strings.Join(seen, ":"))
	t.Setenv("FAKE_FACTORY_LOG", log)
	t.Setenv("FAKE_FACTORY_FAIL", "")
	t.Setenv("FAKE_FACTORY_HOLD", "")
	cfg := config.Config{Machine: "lodestar", Roots: []string{roots}, MaxDepth: 2, ProbeStateDir: t.TempDir()}
	s := NewWith(cfg, cache.State{}, time.Now)
	s.Board()
	return sleepFixture{s: s, roots: roots, log: log}
}

func (f sleepFixture) argv(t *testing.T) []string {
	t.Helper()
	b, err := os.ReadFile(f.log)
	if err != nil && !os.IsNotExist(err) {
		t.Fatal(err)
	}
	return strings.Split(strings.TrimSpace(string(b)), "\n")
}

func (f sleepFixture) local(t *testing.T, id string) model.Initiative {
	t.Helper()
	in, ok := f.s.localInitiative(id)
	if !ok {
		t.Fatalf("%s not scanned", id)
	}
	return in
}

// G1: the right argv and never --force, the factory's words verbatim, the
// state after the rescan, a refused fifth, a failing factory, and busy.
func TestSleepWakeThroughTheFactory(t *testing.T) {
	f := newSleepFixture(t)
	today := time.Now().Format("2006-01-02")

	// A fifth awake is refused by the factory, and its words come back.
	r, err := f.s.Wake("e")
	if err != nil {
		t.Fatal(err)
	}
	refusal := "4 initiatives are awake (limit 4): put one to sleep first (factory awake, factory sleep <id>)\n"
	if r.OK || r.ExitCode != 1 || r.Output != refusal {
		t.Fatalf("wake at the limit: %+v", r)
	}
	if r.Status != "paused" {
		t.Fatalf("refused wake changed status to %q", r.Status)
	}

	r, err = f.s.Sleep("a")
	if err != nil {
		t.Fatal(err)
	}
	if !r.OK || r.ExitCode != 0 || r.Output != "a asleep\n" || r.Action != "sleep" {
		t.Fatalf("sleep: %+v", r)
	}
	if r.Status != "paused" || r.AsleepSince != today {
		t.Fatalf("after sleep: status %q asleep_since %q, want paused %s", r.Status, r.AsleepSince, today)
	}
	if in := f.local(t, "a"); in.Status != "paused" || in.AsleepSince != today {
		t.Fatalf("rescan did not reach the cache: %+v", in)
	}
	if r.Factory.Awake != 3 || r.Factory.Offers["a"] != "wake" {
		t.Fatalf("factory after sleep: %+v", r.Factory)
	}

	r, err = f.s.Wake("e")
	if err != nil {
		t.Fatal(err)
	}
	if !r.OK || r.Output != "e awake\n" || r.Status != "active" || r.AsleepSince != "" {
		t.Fatalf("wake: %+v", r)
	}

	// A failing factory: not a Go error, its words verbatim.
	t.Setenv("FAKE_FACTORY_FAIL", "sleep.sh: python3: command not found")
	r, err = f.s.Sleep("b")
	if err != nil {
		t.Fatal(err)
	}
	if r.OK || r.ExitCode != 3 || r.Output != "sleep.sh: python3: command not found\n" || r.Status != "active" {
		t.Fatalf("failing factory: %+v", r)
	}
	t.Setenv("FAKE_FACTORY_FAIL", "")

	want := []string{"awake", "wake e", "awake", "sleep a", "awake", "wake e", "awake", "sleep b", "awake"}
	got := f.argv(t)
	if strings.Join(got, "|") != strings.Join(want, "|") {
		t.Fatalf("argv:\n got %q\nwant %q", got, want)
	}
	for _, l := range got {
		if strings.Contains(l, "--force") {
			t.Fatalf("passed --force: %q", l)
		}
	}
}

func TestSleepWhileOneRunsIsBusy(t *testing.T) {
	f := newSleepFixture(t)
	hold := filepath.Join(t.TempDir(), "go")
	t.Setenv("FAKE_FACTORY_HOLD", hold)
	done := make(chan error, 1)
	go func() {
		_, err := f.s.Sleep("a")
		done <- err
	}()
	deadline := time.Now().Add(10 * time.Second)
	for !strings.Contains(strings.Join(f.argv(t), "|"), "sleep a") {
		if time.Now().After(deadline) {
			t.Fatal("the first sleep never reached the factory")
		}
		time.Sleep(20 * time.Millisecond)
	}
	if _, err := f.s.Wake("e"); !errors.Is(err, ErrSleepBusy) {
		t.Fatalf("second call while one runs: err %v, want busy", err)
	}
	if _, err := f.s.Sleep("b"); !errors.Is(err, ErrSleepBusy) {
		t.Fatalf("second sleep while one runs: err %v, want busy", err)
	}
	if err := os.WriteFile(hold, nil, 0o644); err != nil {
		t.Fatal(err)
	}
	if err := <-done; err != nil {
		t.Fatal(err)
	}
	for _, l := range f.argv(t) {
		if l == "wake e" || l == "sleep b" {
			t.Fatalf("a busy call reached the factory: %q", l)
		}
	}
	if _, err := f.s.Wake("a"); err != nil {
		t.Fatalf("after the first finished: %v", err)
	}
}

// G3: blind, missing, failing, archived.
func TestFactoryBlindMissingFailingArchived(t *testing.T) {
	f := newSleepFixture(t)
	v := f.s.Factory()
	if !v.Found || !v.OnPath || !v.OK || v.Limit != 4 || v.Awake != 4 || len(v.Seen) != 5 { // archived is never listed
		t.Fatalf("factory: %+v", v)
	}
	if !f.local(t, "blind").FactoryBlind {
		t.Fatal("blind: the factory does not list it, want factory_blind")
	}
	for _, id := range []string{"a", "e", "arc"} {
		if f.local(t, id).FactoryBlind {
			t.Fatalf("%s is factory_blind", id)
		}
	}
	wantOffers := map[string]string{"a": "sleep", "b": "sleep", "c": "sleep", "d": "sleep", "e": "wake", "arc": "", "blind": ""}
	for id, w := range wantOffers {
		if got, ok := v.Offers[id]; !ok || got != w {
			t.Fatalf("offer %s = %q (present %v), want %q", id, got, ok, w)
		}
	}
	// The board carries it.
	for _, bi := range f.s.Board().Initiatives {
		if bi.FactoryBlind != (bi.ID == "blind") {
			t.Fatalf("board %s factory_blind %v", bi.ID, bi.FactoryBlind)
		}
	}

	// Archived offers neither, and the factory is never asked.
	for _, call := range []func(string) (SleepResult, error){f.s.Sleep, f.s.Wake} {
		if _, err := call("arc"); err == nil || !strings.Contains(err.Error(), "archived") {
			t.Fatalf("archived: err %v", err)
		}
	}
	for _, l := range f.argv(t) {
		if strings.HasSuffix(l, " arc") {
			t.Fatalf("archived reached the factory: %q", l)
		}
	}

	// Failing: the reason is its first error line, verbatim; nothing is blind
	// and nothing is offered, since nothing is known.
	t.Setenv("FAKE_FACTORY_FAIL", "find: /Users/x: Permission denied\nsecond line")
	f.s.Board()
	v = f.s.Factory()
	if v.OK || !v.Found || v.Reason != "find: /Users/x: Permission denied" {
		t.Fatalf("failing: %+v", v)
	}
	if f.local(t, "blind").FactoryBlind {
		t.Fatal("failing factory still says blind")
	}
	for id, o := range v.Offers {
		if o != "" {
			t.Fatalf("failing factory offers %s %q", id, o)
		}
	}

	// Missing.
	t.Setenv("PATH", "/usr/bin:/bin")
	f.s.Board()
	v = f.s.Factory()
	if v.Found || v.OK || v.Reason != "factory is not on PATH or in ~/bin" {
		t.Fatalf("missing: %+v", v)
	}
	if _, err := f.s.Sleep("a"); err == nil {
		t.Fatal("sleep with no factory: want an error")
	}
}

// The ~/bin fallback: an app opened from Finder has no ~/bin on its PATH.
func TestFactoryFoundInHomeBin(t *testing.T) {
	f := newSleepFixture(t)
	home := os.Getenv("HOME")
	bin := filepath.Join(home, "bin")
	if err := os.MkdirAll(bin, 0o755); err != nil {
		t.Fatal(err)
	}
	src, _ := filepath.Abs(filepath.Join("..", "..", "testdata", "factory", "factory"))
	if err := os.Symlink(src, filepath.Join(bin, "factory")); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", "/usr/bin:/bin")
	f.s.Board()
	v := f.s.Factory()
	if !v.Found || v.OnPath || !v.OK || v.Path != filepath.Join(bin, "factory") {
		t.Fatalf("fallback: %+v", v)
	}
}

func TestParseAwakeOverTheLimitIsStillAReading(t *testing.T) {
	var v FactoryView
	parseAwake(&v, "  awake  a  ~/a  0 seats\n  awake  b  ~/b  1 seats\n  asleep c  ~/c  2 frozen\n5 awake (limit 4)\n", 1)
	if !v.OK || v.Awake != 5 || v.Limit != 4 || len(v.Seen) != 3 || v.Seen[2] != (FactorySeen{ID: "c", Root: "~/c", State: "asleep"}) {
		t.Fatalf("%+v", v)
	}
	if got := expandHome("~/c", "/Users/p"); got != "/Users/p/c" {
		t.Fatal(got)
	}
}

// B3: `factory awake` runs on a rescan only. The agents tick (app.go's
// agentTicker: one Scan(false), then RefreshAgents every 10 s) never calls
// the factory; Board, the rescan, calls it once.
func TestFactoryAwakeNeverOnTheTick(t *testing.T) {
	f := newSleepFixture(t) // its Board is the one rescan so far
	if got := f.argv(t); strings.Join(got, "|") != "awake" {
		t.Fatalf("after the first rescan: %q", got)
	}
	f.s.Scan(false)
	for range 3 {
		f.s.RefreshAgents()
	}
	if got := f.argv(t); len(got) != 1 {
		t.Fatalf("the tick called the factory: %q", got)
	}
	f.s.Board()
	if got := f.argv(t); strings.Join(got, "|") != "awake|awake" {
		t.Fatalf("a rescan should call factory awake once: %q", got)
	}
}

// B3: a factory that hangs is stopped at factoryTimeout, the busy lock is
// released and the result says so. The fake sleeps 60 s in a child, so a
// timeout that killed only the shell would still wait for the pipe.
// ORGANIZER_REAL_FACTORY_TIMEOUT=1 runs it at the real 20 s.
func TestFactoryCallTimesOut(t *testing.T) {
	if factoryTimeout != 20*time.Second {
		t.Fatalf("factoryTimeout = %s, want 20s", factoryTimeout)
	}
	f := newSleepFixture(t)
	if os.Getenv("ORGANIZER_REAL_FACTORY_TIMEOUT") == "" {
		old := factoryTimeout
		factoryTimeout = time.Second
		t.Cleanup(func() { factoryTimeout = old })
	}
	hang := t.TempDir()
	script := "#!/bin/sh\necho \"$*\" >>\"$FAKE_FACTORY_LOG\"\necho \"started $*\"\nsleep 60\necho never\n"
	if err := os.WriteFile(filepath.Join(hang, "factory"), []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", hang+":/usr/bin:/bin")

	start := time.Now()
	r, err := f.s.Sleep("a")
	took := time.Since(start)
	if err != nil {
		t.Fatal(err)
	}
	if took < factoryTimeout || took > factoryTimeout+factoryWaitDelay+3*time.Second {
		t.Fatalf("sleep returned after %s, want about %s", took, factoryTimeout)
	}
	want := "started sleep a\nfactory sleep a timed out after " + factoryTimeout.String() + "; Deltagos stopped it"
	if r.OK || r.ExitCode != -1 || r.Output != want {
		t.Fatalf("timed-out sleep: %+v", r)
	}
	if r.Status != "active" {
		t.Fatalf("after the timeout: status %q", r.Status)
	}
	t.Logf("sleep a: stopped after %s: %q", took.Round(time.Millisecond), r.Output)

	// The lock is free: the next call reaches the factory instead of busy.
	if !f.s.sleepMu.TryLock() {
		t.Fatal("busy lock still held after the timeout")
	}
	f.s.sleepMu.Unlock()
	if _, err := f.s.Wake("e"); errors.Is(err, ErrSleepBusy) {
		t.Fatal("wake after a timeout: busy")
	}

	// factory awake, on a rescan, times out the same way and says so.
	f.s.Board()
	v := f.s.Factory()
	if v.OK || !v.Found || v.Reason != "factory awake timed out after "+factoryTimeout.String()+"; Deltagos stopped it" {
		t.Fatalf("timed-out awake: %+v", v)
	}
	t.Logf("awake: %q", v.Reason)
	// The rescan after the timed-out sleep did not ask the hung factory again.
	want2 := []string{"awake", "sleep a", "wake e", "awake"}
	if got := f.argv(t); strings.Join(got, "|") != strings.Join(want2, "|") {
		t.Fatalf("argv:\n got %q\nwant %q", got, want2)
	}
}
