package service

import (
	"errors"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/memory"
	"organizer/internal/model"
)

var t0 = time.Date(2026, 10, 9, 14, 0, 0, 0, time.UTC)

// G5: warn exactly twice over the flapping run, never at high or recovery.
func TestMemoryWarnRule(t *testing.T) {
	var tr memTracker
	type step struct {
		at    time.Duration
		level string
		warn  bool
	}
	run := []step{
		{0, memory.Normal, false},
		{1 * time.Minute, memory.Critical, true},  // the first entry warns
		{3 * time.Minute, memory.Normal, false},   // recovery: nothing
		{8 * time.Minute, memory.Critical, false}, // out 5 min only
		{14 * time.Minute, memory.Normal, false},
		{20 * time.Minute, memory.High, false},     // high: nothing
		{26 * time.Minute, memory.Critical, false}, // out 12 min, but the last warning is 25 min old
		{29 * time.Minute, memory.Normal, false},
		{41 * time.Minute, memory.Critical, true},  // out 12 min, last warning 40 min old
		{42 * time.Minute, memory.Critical, false}, // still critical: once per entry
		{43 * time.Minute, memory.Normal, false},
	}
	warned := 0
	for _, s := range run {
		_, _, _, warn := tr.observe(t0.Add(s.at), s.level)
		if warn != s.warn {
			t.Errorf("%v %s: warn %v, want %v", s.at, s.level, warn, s.warn)
		}
		if warn {
			warned++
		}
	}
	if warned != 2 {
		t.Errorf("warned %d times, want 2", warned)
	}

	var high memTracker
	for i := 0; i < 120; i++ {
		if _, _, _, warn := high.observe(t0.Add(time.Duration(i)*10*time.Second), memory.High); warn {
			t.Fatalf("warned at high, sample %d", i)
		}
	}
}

// G5: the app opening at critical is a first entry and warns.
func TestMemoryWarnOpenedAtCritical(t *testing.T) {
	var tr memTracker
	if _, _, _, warn := tr.observe(t0, memory.Critical); !warn {
		t.Error("first sample at critical did not warn")
	}
}

// G6: since is when the level began (or the first sample); critical's end is
// kept 30 minutes.
func TestMemorySinceAndCriticalEnd(t *testing.T) {
	var tr memTracker
	since, opened, _, _ := tr.observe(t0, memory.Normal)
	if !since.Equal(t0) || !opened {
		t.Errorf("first sample: since %v opened %v", since, opened)
	}
	tr.observe(t0.Add(time.Minute), memory.High)
	since, opened, until, _ := tr.observe(t0.Add(5*time.Minute), memory.High)
	if !since.Equal(t0.Add(time.Minute)) || opened || until != nil {
		t.Errorf("high for 4 min: since %v (want 4 min back) opened %v until %v", since, opened, until)
	}

	tr.observe(t0.Add(10*time.Minute), memory.Critical)
	end := time.Date(2026, 10, 9, 14, 32, 0, 0, time.UTC)
	_, _, until, _ = tr.observe(end, memory.Normal)
	if until == nil || !until.Equal(end) {
		t.Fatalf("at the end of critical: was_critical_until %v, want 14:32", until)
	}
	if _, _, until, _ = tr.observe(end.Add(29*time.Minute), memory.Normal); until == nil || !until.Equal(end) {
		t.Errorf("29 min after: was_critical_until %v, want 14:32", until)
	}
	if _, _, until, _ = tr.observe(end.Add(31*time.Minute), memory.Normal); until != nil {
		t.Errorf("31 min after: was_critical_until %v, want empty", until)
	}
}

// G7: two initiatives and the unassigned row sum to agents_bytes, biggest
// first; top is per session, biggest first, capped at five.
func TestMemorySummary(t *testing.T) {
	inits := []model.ScannedInitiative{
		{Initiative: model.Initiative{ID: "organizer"}, Agents: []model.Agent{
			{PID: 10, Session: "organizer-probe-rs-build", MemBytes: 300},
			{PID: 11, Session: "organizer-probe-sup49", MemBytes: 200},
			{Session: "organizer-probe-gone", State: model.AgentExited},
		}},
		{Initiative: model.Initiative{ID: "camp"}, Agents: []model.Agent{
			{PID: 20, Session: "camp-probe-andrea", MemBytes: 700},
			{PID: 21, Session: "camp-probe-andrea", MemBytes: 100}, // one session, two agents
			{PID: 22, Session: "camp-probe-luis", MemBytes: 50},
		}},
		{Initiative: model.Initiative{ID: "idle"}},
	}
	unassigned := []model.Agent{{PID: 30, MemBytes: 400}, {PID: 31, Session: "probe-hefesto", MemBytes: 60}}
	top, total, by := memorySummary(inits, unassigned)
	if total != 1810 {
		t.Errorf("agents_bytes %d, want 1810", total)
	}
	if len(by) != 3 {
		t.Fatalf("by_initiative %+v, want three rows", by)
	}
	var sum uint64
	for _, r := range by {
		sum += r.Bytes
	}
	if sum != total {
		t.Errorf("rows sum %d, agents_bytes %d", sum, total)
	}
	wantBy := []model.MemoryInitiative{
		{Initiative: "camp", Bytes: 850, Agents: 3},
		{Initiative: "organizer", Bytes: 500, Agents: 2},
		{Unassigned: true, Bytes: 460, Agents: 2},
	}
	for i, w := range wantBy {
		if by[i] != w {
			t.Errorf("by_initiative[%d] %+v, want %+v", i, by[i], w)
		}
	}
	wantTop := []model.MemorySession{
		{Name: "camp-probe-andrea", Initiative: "camp", Bytes: 800, AgentID: "camp-probe-andrea#20"},
		{Name: "pid 30", Bytes: 400, AgentID: "#30"},
		{Name: "organizer-probe-rs-build", Initiative: "organizer", Bytes: 300, AgentID: "organizer-probe-rs-build#10"},
		{Name: "organizer-probe-sup49", Initiative: "organizer", Bytes: 200, AgentID: "organizer-probe-sup49#11"},
		{Name: "probe-hefesto", Bytes: 60, AgentID: "probe-hefesto#31"},
	}
	if len(top) != 5 {
		t.Fatalf("top has %d, want 5: %+v", len(top), top)
	}
	for i, w := range wantTop {
		if top[i] != w {
			t.Errorf("top[%d] %+v, want %+v", i, top[i], w)
		}
	}
}

type fakeMem struct {
	level string
	err   error
}

func (f fakeMem) Sysctl(name string) (string, error) {
	if f.err != nil {
		return "", f.err
	}
	if name == "hw.memsize" {
		return "25769803776", nil
	}
	return f.level, nil
}

func (f fakeMem) VMStat() (string, error) {
	return "Mach Virtual Memory Statistics: (page size of 16384 bytes)\nPages free: 100.\nPages speculative: 10.\nFile-backed pages: 140.\n", nil
}

// G1 at the service: a failed read is memory null with a reason; a good one
// carries the level, the totals and the clock's times.
func TestSampleMemory(t *testing.T) {
	now := t0
	s := NewWith(config.Config{}, cache.State{}, func() time.Time { return now })
	s.memReader = fakeMem{err: errors.New("sysctl: unknown oid")}
	m, why := s.sampleMemoryLocked(nil, nil)
	if m != nil || why == "" {
		t.Fatalf("failed read: memory %+v reason %q", m, why)
	}
	s.memReader = fakeMem{level: "4"}
	m, why = s.sampleMemoryLocked(nil, nil)
	if m == nil || why != "" {
		t.Fatalf("good read: memory %+v reason %q", m, why)
	}
	if m.Pressure != "critical" || !m.Warn || m.TotalBytes != 25769803776 || m.FreeBytes != 250*16384 || !m.Since.Equal(t0) {
		t.Errorf("reading %+v", m)
	}
	if m.Top == nil || m.ByInitiative == nil {
		t.Error("top and by_initiative must be empty lists, not null")
	}
}
