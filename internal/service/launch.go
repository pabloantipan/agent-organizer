package service

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// ---- seat starts the service keeps (leftovers-27 FR-1 to FR-3) ----
//
// A probe start takes 30 to 60 s and a crew is several of them one after
// another, so the app does not wait for them: CreateCrew and CreateAgent
// queue their seats here and return, one goroutine per initiative starts
// them in sequence, and every change rides the agents feed
// (AgentsView.Launches) with an `agents` emit (OnLaunch). The CLI queues the
// same way and then waits (WaitLaunch), printing each change.

// The states of one seat's start, in the order they happen.
const (
	LaunchQueued   = "queued"
	LaunchStarting = "starting"
	LaunchRetrying = "retrying" // probe exited 3 once; the one retry is running
	LaunchRunning  = "running"
	LaunchFailed   = "failed"
	LaunchSkipped  = "skipped" // Stop starting reached it while it was queued
)

// launchKeep is how long a start whose seats all run stays on the feed, so
// the view can show the finished list before it closes (launch-progress §1).
const launchKeep = 5 * time.Second

// SeatLaunch is one seat's start.
type SeatLaunch struct {
	Seat    string `json:"seat"`    // the roster seat, or the agent's name for New agent and Run
	Session string `json:"session"` // the probe session it starts as
	State   string `json:"state"`
	// StartedAt is when the current try began, set while starting or
	// retrying; the view counts the seconds up from it.
	StartedAt *time.Time `json:"started_at,omitempty"`
	// FailedAt is when the last try failed, set with State failed: after a
	// retry on exit 3, the retry's failure. The view dates the failure by it
	// (leftovers-30 FR-2).
	FailedAt *time.Time `json:"failed_at,omitempty"`
	// Reason, Exit and Output say why a failed seat did not start: the
	// reason in words, probe's exit code (0 when probe never ran) and its
	// output, the pane's last lines.
	Reason string `json:"reason,omitempty"`
	Exit   int    `json:"exit,omitempty"`
	Output string `json:"output,omitempty"`
	// Line is the launch line, for Copy the command and for Try again.
	Line string `json:"launch_line"`
	// pre runs before each try of the line, on the starting goroutine: what
	// a start needs that forks or reaches the network (probe --wrap, the
	// seat's token). Its error fails the seat with its words.
	pre func() error
}

// InitiativeLaunch is the start running, or just run, for one initiative.
type InitiativeLaunch struct {
	Initiative string `json:"initiative"`
	// Kind is crew (Bring crew up), agent (New agent) or card (organizer run).
	Kind  string       `json:"kind"`
	Seats []SeatLaunch `json:"seats"`
	// Seen is false while a failure has not been shown to the lead
	// (SeenLaunch); a new failure sets it false again. True when none failed.
	Seen bool `json:"seen"`
	// Running and Failed count the seats in those states; Done is true once
	// no seat is queued, starting or retrying.
	Running int  `json:"running"`
	Failed  int  `json:"failed"`
	Done    bool `json:"done"`
	// doneAt is when the start settled, for the 5 s drop.
	doneAt time.Time
	// active is true while a goroutine is starting this initiative's seats.
	active bool
	// settled is closed when the start settles; WaitLaunch waits on it.
	settled chan struct{}
}

// LaunchChange is what OnLaunch is told: one seat's new state, or Seat nil
// when the initiative's start was dropped from the feed.
type LaunchChange struct {
	Initiative string
	Seat       *SeatLaunch
}

func (l *InitiativeLaunch) settle(now time.Time) {
	l.Running, l.Failed, l.Done = 0, 0, true
	for _, s := range l.Seats {
		switch s.State {
		case LaunchRunning:
			l.Running++
		case LaunchFailed:
			l.Failed++
		case LaunchQueued, LaunchStarting, LaunchRetrying:
			l.Done = false
		}
	}
	if l.Failed == 0 {
		l.Seen = true
	}
	if l.Done && l.doneAt.IsZero() {
		l.doneAt = now
		if l.settled != nil {
			close(l.settled)
		}
	}
}

// droppable is a settled start with no failed seat whose 5 s are up. A start
// with a failure stays, seen or not, until a retry or a new start replaces it:
// the list stays until the lead acts (launch-progress §1).
func (l *InitiativeLaunch) droppable(now time.Time) bool {
	return l.Done && l.Failed == 0 && !now.Before(l.doneAt.Add(launchKeep))
}

func (s *Service) clock() time.Time {
	if s.now == nil {
		return time.Now()
	}
	return s.now()
}

// notifyLaunch tells OnLaunch, outside launchMu: the app's emit builds the
// view, which takes the service lock and then launchMu.
func (s *Service) notifyLaunch(c LaunchChange) {
	if f := s.OnLaunch; f != nil {
		f(c)
	}
}

// queueLaunch puts seats on the initiative's start and makes sure one
// goroutine is starting them. A crew start refuses while another start of
// the initiative is still going; a single agent joins the queue. A settled
// start is replaced.
func (s *Service) queueLaunch(initiative, kind string, seats []SeatLaunch) error {
	s.launchMu.Lock()
	if s.launches == nil {
		s.launches = map[string]*InitiativeLaunch{}
	}
	l := s.launches[initiative]
	if l != nil && !l.Done && kind == "crew" {
		s.launchMu.Unlock()
		return fmt.Errorf("%s is already starting seats; Stop starting first", initiative)
	}
	if l == nil || l.Done {
		l = &InitiativeLaunch{Initiative: initiative, Kind: kind, Seen: true, settled: make(chan struct{})}
		s.launches[initiative] = l
	}
	var queued []SeatLaunch
	for _, seat := range seats {
		seat.State = LaunchQueued
		l.Seats = append(l.Seats, seat)
		queued = append(queued, seat)
	}
	l.settle(s.clock())
	start := !l.active
	l.active = true
	s.launchMu.Unlock()
	for i := range queued {
		s.notifyLaunch(LaunchChange{Initiative: initiative, Seat: &queued[i]})
	}
	if start {
		go s.runLaunches(l)
	}
	return nil
}

// setSeat changes seat i of a start and tells OnLaunch. It works on the
// start it was handed, not the map's: the map may have dropped or replaced it.
func (s *Service) setSeat(l *InitiativeLaunch, i int, change func(*SeatLaunch)) {
	initiative := l.Initiative
	s.launchMu.Lock()
	seat := &l.Seats[i]
	change(seat)
	if seat.State == LaunchFailed {
		l.Seen = false
	}
	cp := *seat
	l.settle(s.clock())
	drop := l.Done && l.Failed == 0
	s.launchMu.Unlock()
	s.notifyLaunch(LaunchChange{Initiative: initiative, Seat: &cp})
	if drop {
		s.afterKeep(initiative)
	}
}

// afterKeep tells OnLaunch once the 5 s are up, so the view drops the list
// without waiting for the 10 s tick. The drop itself happens on read
// (launchesView), against the service clock.
func (s *Service) afterKeep(initiative string) {
	after := s.after
	if after == nil {
		after = func(d time.Duration, f func()) { time.AfterFunc(d, f) }
	}
	after(launchKeep, func() { s.notifyLaunch(LaunchChange{Initiative: initiative}) })
}

// runLaunches starts a start's queued seats one after another until none is
// queued. One goroutine per start at a time (l.active). It holds the start
// itself: a new start that replaces it in the map gets its own goroutine,
// and the drop never pulls it from under this one.
func (s *Service) runLaunches(l *InitiativeLaunch) {
	for {
		s.launchMu.Lock()
		next := -1
		for i := range l.Seats {
			if l.Seats[i].State == LaunchQueued {
				next = i
				break
			}
		}
		if next < 0 {
			l.active = false
			s.launchMu.Unlock()
			return
		}
		line, pre := l.Seats[next].Line, l.Seats[next].pre
		s.launchMu.Unlock()

		started := s.clock()
		s.setSeat(l, next, func(seat *SeatLaunch) {
			seat.State, seat.StartedAt, seat.FailedAt = LaunchStarting, &started, nil
			seat.Reason, seat.Exit, seat.Output = "", 0, ""
		})
		var err error
		if pre != nil {
			err = pre()
		}
		if err == nil {
			err = launchProbeTries(line, func() {
				again := s.clock()
				s.setSeat(l, next, func(seat *SeatLaunch) { seat.State, seat.StartedAt = LaunchRetrying, &again })
			})
		}
		ended := s.clock()
		s.setSeat(l, next, func(seat *SeatLaunch) {
			if err == nil {
				seat.State = LaunchRunning
				return
			}
			seat.State, seat.FailedAt = LaunchFailed, &ended
			seat.Reason, seat.Exit, seat.Output = launchFailure(err)
		})
	}
}

// launchFailure is a failed start in the view's terms: the reason in words,
// probe's exit and its output.
func launchFailure(err error) (string, int, string) {
	var pe *ProbeError
	if !errors.As(err, &pe) {
		return err.Error(), 0, ""
	}
	switch {
	case pe.Exit == 3:
		return "the pane did not run claude (probe exit 3, twice)", 3, pe.Output
	case pe.Exit > 0:
		return fmt.Sprintf("probe failed (exit %d)", pe.Exit), pe.Exit, pe.Output
	}
	return "probe could not run: " + pe.Err.Error(), 0, pe.Output
}

// StopStarting skips the initiative's queued seats; the one in flight
// finishes. Nothing is killed.
func (s *Service) StopStarting(initiative string) {
	s.launchMu.Lock()
	l := s.launches[initiative]
	if l == nil {
		s.launchMu.Unlock()
		return
	}
	var skipped []SeatLaunch
	for i := range l.Seats {
		if l.Seats[i].State == LaunchQueued {
			l.Seats[i].State = LaunchSkipped
			skipped = append(skipped, l.Seats[i])
		}
	}
	l.settle(s.clock())
	drop := l.Done && l.Failed == 0 && len(skipped) > 0
	s.launchMu.Unlock()
	for i := range skipped {
		s.notifyLaunch(LaunchChange{Initiative: initiative, Seat: &skipped[i]})
	}
	if drop {
		s.afterKeep(initiative)
	}
}

// RetrySeat starts one failed or skipped seat of the initiative's start
// again, with the same launch line and the same states.
func (s *Service) RetrySeat(initiative, seat string) error {
	s.launchMu.Lock()
	l := s.launches[initiative]
	if l == nil {
		s.launchMu.Unlock()
		return fmt.Errorf("%s has no seat start to retry", initiative)
	}
	i := -1
	for j := range l.Seats {
		if l.Seats[j].Seat == seat {
			i = j
		}
	}
	if i < 0 {
		s.launchMu.Unlock()
		return fmt.Errorf("%s has no seat %s in its start", initiative, seat)
	}
	if st := l.Seats[i].State; st != LaunchFailed && st != LaunchSkipped {
		s.launchMu.Unlock()
		return fmt.Errorf("seat %s is %s, not failed", seat, st)
	}
	l.Seats[i].State = LaunchQueued
	l.Seats[i].Reason, l.Seats[i].Exit, l.Seats[i].Output, l.Seats[i].StartedAt, l.Seats[i].FailedAt = "", 0, "", nil, nil
	if l.Done {
		l.doneAt, l.settled = time.Time{}, make(chan struct{})
	}
	l.settle(s.clock())
	cp := l.Seats[i]
	start := !l.active
	l.active = true
	s.launchMu.Unlock()
	s.notifyLaunch(LaunchChange{Initiative: initiative, Seat: &cp})
	if start {
		go s.runLaunches(l)
	}
	return nil
}

// SeenLaunch records that the lead has seen the initiative's start, so a
// failure leaves Needs me. The list itself stays until a retry or a new
// start.
func (s *Service) SeenLaunch(initiative string) {
	s.launchMu.Lock()
	l := s.launches[initiative]
	changed := l != nil && !l.Seen
	if changed {
		l.Seen = true
	}
	s.launchMu.Unlock()
	if changed {
		s.notifyLaunch(LaunchChange{Initiative: initiative})
	}
}

// Launches is every initiative's start as the feed carries it, by
// initiative id; starts whose 5 s are up are dropped here.
func (s *Service) Launches() []InitiativeLaunch {
	s.launchMu.Lock()
	defer s.launchMu.Unlock()
	now := s.clock()
	out := []InitiativeLaunch{}
	for id, l := range s.launches {
		if l.droppable(now) {
			delete(s.launches, id)
			continue
		}
		cp := *l
		cp.Seats = append([]SeatLaunch(nil), l.Seats...)
		cp.settled = nil
		out = append(out, cp)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Initiative < out[j].Initiative })
	return out
}

// WaitLaunch blocks until the initiative's start settles and returns it, or
// returns false when there is none. A retry that comes later is not waited
// for.
func (s *Service) WaitLaunch(initiative string) (InitiativeLaunch, bool) {
	s.launchMu.Lock()
	l := s.launches[initiative]
	if l == nil {
		s.launchMu.Unlock()
		return InitiativeLaunch{}, false
	}
	ch := l.settled
	s.launchMu.Unlock()
	<-ch
	s.launchMu.Lock()
	defer s.launchMu.Unlock()
	cp := *l
	cp.Seats = append([]SeatLaunch(nil), l.Seats...)
	cp.settled = nil
	return cp, true
}

// ---- probe ----

// probeBinEnv names a probe to use instead of ~/bin/probe: the gates and the
// fixture set it to scripts/probe-stub.sh (leftovers-27 FR-4), as
// ORGANIZER_MEMORY_FAKE forces the memory reading.
const probeBinEnv = "ORGANIZER_PROBE_BIN"

// probeBin is where probe lives: ORGANIZER_PROBE_BIN when set, else
// ~/bin/probe. A variable so tests run a fake probe (and its family
// wrappers, which sit next to it).
var probeBin = func() string {
	if p := os.Getenv(probeBinEnv); p != "" {
		if abs, err := filepath.Abs(p); err == nil {
			return abs
		}
		return p
	}
	home, _ := os.UserHomeDir()
	return filepath.Join(home, "bin", "probe")
}

// probeWrapper is the family wrapper a launch line runs, which `probe
// --wrap <family>` writes next to probe. A probe named by
// ORGANIZER_PROBE_BIN stands in for every wrapper too, so the stub writes
// nothing next to itself.
func probeWrapper(family string) string {
	if os.Getenv(probeBinEnv) != "" {
		return probeBin()
	}
	return filepath.Join(filepath.Dir(probeBin()), family+"-probe")
}

// ProbeError is a launch line that did not start its seat: probe's exit
// code (0 when the line did not run at all, with Err) and its output.
type ProbeError struct {
	Exit   int
	Output string
	Err    error
}

func (e *ProbeError) Error() string {
	if e.Exit > 0 {
		return fmt.Sprintf("probe exited %d: %s", e.Exit, e.Output)
	}
	return fmt.Sprintf("probe: %v: %s", e.Err, e.Output)
}

// launchProbe runs one launch line itself, through /bin/sh. probe starts the
// seat as a detached zellij session and checks it: no window, no tab, no
// typed text. Exit 3 means the seat did not come up within probe's 30 s; it
// is tried once more. Any other failure, or a second 3, is a *ProbeError
// carrying probe's output (the pane's last lines).
func launchProbe(line string) error { return launchProbeTries(line, nil) }

// launchProbeTries is launchProbe telling retrying when the one retry
// begins.
func launchProbeTries(line string, retrying func()) error {
	var out []byte
	var err error
	for try := 0; try < 2; try++ {
		if try == 1 && retrying != nil {
			retrying()
		}
		out, err = command("/bin/sh", "-c", line).CombinedOutput()
		if err == nil {
			return nil
		}
		var ee *exec.ExitError
		if !errors.As(err, &ee) || ee.ExitCode() != 3 {
			break
		}
	}
	pe := &ProbeError{Output: strings.TrimSpace(string(out)), Err: err}
	var ee *exec.ExitError
	if errors.As(err, &ee) {
		pe.Exit = ee.ExitCode()
	}
	return pe
}
