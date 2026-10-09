package service

import (
	"sort"
	"strconv"
	"time"

	"organizer/internal/memory"
	"organizer/internal/model"
	"organizer/internal/scan"
)

// The warn rule's times (docs/ux/specs/ram-indicator.md §3): a new warning
// needs the pressure out of critical this long before the entry, and the
// last warning at least warnEvery old. A critical spell's end is shown for
// criticalKept.
const (
	warnQuiet    = 10 * time.Minute
	warnEvery    = 30 * time.Minute
	criticalKept = 30 * time.Minute
	memoryTop    = 5
)

// memTracker remembers what one reading cannot say: how long the level has
// lasted, when critical last ended and when the last warning went out. It
// lives as long as the process, so `since` is anchored at the first sample
// this process took (the app's start, for the popover's "since Deltagos
// opened").
type memTracker struct {
	level       string
	since       time.Time
	sinceOpened bool
	critEnded   time.Time
	lastWarn    time.Time
}

// observe records a sample at now and returns the level's times and whether
// this sample warns: an entry into critical, the first one always, a later
// one only out of critical for warnQuiet and warnEvery after the last warning.
// Nothing warns at high or on recovery.
func (t *memTracker) observe(now time.Time, level string) (since time.Time, opened bool, wasCritUntil *time.Time, warn bool) {
	switch {
	case t.level == "":
		t.since, t.sinceOpened = now, true
	case level != t.level:
		if t.level == memory.Critical {
			t.critEnded = now
		}
		t.since, t.sinceOpened = now, false
	}
	if level == memory.Critical && t.level != memory.Critical {
		warn = t.lastWarn.IsZero() ||
			(now.Sub(t.critEnded) >= warnQuiet && now.Sub(t.lastWarn) >= warnEvery)
		if warn {
			t.lastWarn = now
		}
	}
	t.level = level
	if level != memory.Critical && !t.critEnded.IsZero() && now.Sub(t.critEnded) < criticalKept {
		end := t.critEnded
		wasCritUntil = &end
	}
	return t.since, t.sinceOpened, wasCritUntil, warn
}

// sampleMemoryLocked reads this Mac once and joins it with the agents already
// sampled. A failed read is nil and the reason, never zeros.
func (s *Service) sampleMemoryLocked(inits []model.ScannedInitiative, unassigned []model.Agent) (*model.Memory, string) {
	r, err := memory.Read(s.memReader)
	if err != nil {
		return nil, err.Error()
	}
	m := &model.Memory{Pressure: r.Pressure, TotalBytes: r.TotalBytes, FreeBytes: r.FreeBytes}
	m.Since, m.SinceOpened, m.WasCriticalUntil, m.Warn = s.mem.observe(s.now(), r.Pressure)
	m.Top, m.AgentsBytes, m.ByInitiative = memorySummary(inits, unassigned)
	return m, ""
}

// memorySummary is the feed's cut: the five biggest sessions, agents
// together, and each initiative.
func memorySummary(inits []model.ScannedInitiative, unassigned []model.Agent) ([]model.MemorySession, uint64, []model.MemoryInitiative) {
	all, total, by := memoryBySession(inits, unassigned)
	return all[:min(len(all), memoryTop)], total, by
}

// memoryBySession groups the agents' trees by session (a crew or probe
// session sums its agents) and by initiative, biggest first.
func memoryBySession(inits []model.ScannedInitiative, unassigned []model.Agent) ([]model.MemorySession, uint64, []model.MemoryInitiative) {
	sessions := map[string]*model.MemorySession{}
	var order []string
	var total uint64
	by := []model.MemoryInitiative{}
	add := func(initiative string, agents []model.Agent) {
		row := model.MemoryInitiative{Initiative: initiative, Unassigned: initiative == ""}
		for _, a := range agents {
			if a.PID <= 0 {
				continue
			}
			row.Bytes += a.MemBytes
			row.Agents++
			name := a.Session
			if name == "" {
				name = "pid " + strconv.Itoa(a.PID)
			}
			key := initiative + "\x00" + name
			ms, ok := sessions[key]
			if !ok {
				ms = &model.MemorySession{Name: name, Initiative: initiative, AgentID: a.Session + "#" + strconv.Itoa(a.PID)}
				sessions[key] = ms
				order = append(order, key)
			}
			ms.Bytes += a.MemBytes
		}
		if row.Agents > 0 {
			total += row.Bytes
			by = append(by, row)
		}
	}
	for i := range inits {
		add(inits[i].ID, inits[i].Agents)
	}
	add("", unassigned)
	top := make([]model.MemorySession, 0, len(order))
	for _, k := range order {
		top = append(top, *sessions[k])
	}
	sort.SliceStable(top, func(i, j int) bool { return top[i].Bytes > top[j].Bytes })
	sort.SliceStable(by, func(i, j int) bool { return by[i].Bytes > by[j].Bytes })
	return top, total, by
}

// MemoryReport is `organizer memory`'s reading: the feed's, plus every
// agent session biggest first, not only the five the popover shows (0107).
type MemoryReport struct {
	Memory   *model.Memory         `json:"memory"`
	Sessions []model.MemorySession `json:"sessions"`
	Reason   string                `json:"memory_reason,omitempty"`
}

// Memory reads this Mac once for `organizer memory`: processes and sessions
// only, no git, and nothing written (no cache, no statusline records).
func (s *Service) Memory() MemoryReport {
	s.mu.Lock()
	defer s.mu.Unlock()
	o := s.scanOptions(false)
	o.Agents.SessionsDir = ""
	snap := scan.Run(o)
	m, why := s.sampleMemoryLocked(snap.Initiatives, snap.Unassigned)
	r := MemoryReport{Memory: m, Reason: why, Sessions: []model.MemorySession{}}
	if m != nil {
		r.Sessions, _, _ = memoryBySession(snap.Initiatives, snap.Unassigned)
	}
	return r
}
