package service

import (
	"os"
	"path/filepath"
	"slices"
	"strings"
	"time"

	"organizer/internal/config"
	"organizer/internal/discuss"
	"organizer/internal/model"
)

// A task is what an accept record set going (leftovers-28 FR-2, agent-slack
// 0014): a ruled record with a forecast whose cards are not all done. The
// feed carries its forecast, start and silence so Needs me can say when it
// ran over or went quiet; nothing here is written anywhere.

// Task states, computed by taskState only.
const (
	TaskOn      = "on"
	TaskOver    = "over"
	TaskStalled = "stalled"
)

// stallQuiet is how long the task's seats may be silent while a card is in
// now before the task reads stalled (FR-4).
const stallQuiet = 45

// Task is one task on the agents feed (AgentGroup.Tasks).
type Task struct {
	Number      string `json:"number"`
	Title       string `json:"title"`
	Forecast    string `json:"forecast"`
	ForecastTop int    `json:"forecast_top"`
	// Started is the ruling commit's time; nil when git has none, and then
	// the state is on, since nothing can be over without a start.
	Started        *time.Time `json:"started"`
	ElapsedMinutes int        `json:"elapsed_minutes"`
	Cards          []TaskCard `json:"cards"`
	// Seats are the cards' seats then their supervisors (from probe's
	// .parent files), each once; Supervisor is the first supervisor found.
	Seats      []string `json:"seats"`
	Supervisor string   `json:"supervisor"`
	// QuietMinutes is the smallest quiet time over the live threads a seat
	// posted in; nil when no live thread has a task seat.
	QuietMinutes *int      `json:"quiet_minutes"`
	LastPost     *TaskPost `json:"last_post"`
	State        string    `json:"state"`
}

// TaskCard is one card the record names, as the scan found it.
type TaskCard struct {
	Slug   string `json:"slug"`
	Title  string `json:"title"`
	Status string `json:"status"`
	Seat   string `json:"seat"`
}

// TaskPost is the last message of the supervisor's latest live thread to the
// FSE: who sent it, the thread's subject and the body's first line.
type TaskPost struct {
	ThreadID string `json:"thread_id"`
	From     string `json:"from"`
	Subject  string `json:"subject"`
	Line     string `json:"line"`
}

// taskState is FR-4: over once elapsed passes the forecast's top, stalled once
// it passes twice the top or the seats have been quiet stallQuiet minutes
// while a card is in now. Stalled wins.
func taskState(elapsed time.Duration, top int, quiet *int, anyNow bool) string {
	if top > 0 && elapsed > 2*time.Duration(top)*time.Minute {
		return TaskStalled
	}
	if quiet != nil && *quiet >= stallQuiet && anyNow {
		return TaskStalled
	}
	if top > 0 && elapsed > time.Duration(top)*time.Minute {
		return TaskOver
	}
	return TaskOn
}

// taskSupervisor reads <dir>/<family>-probe-<seat>.parent, the session that
// launched the seat, and returns it as a seat name (the family prefix off).
func taskSupervisor(dir, family, seat string) string {
	if dir == "" {
		return ""
	}
	prefix := family + "-probe-"
	b, err := os.ReadFile(filepath.Join(dir, prefix+seat+".parent"))
	if err != nil {
		return ""
	}
	return strings.TrimPrefix(strings.TrimSpace(string(b)), prefix)
}

// tasksOf builds the initiative's tasks from its records and cards, the cell's
// health snapshot and the threads' cached facts.
func tasksOf(si *model.ScannedInitiative, snap discuss.Snapshot, fs map[string]facts, probeDir string, now time.Time) []Task {
	cards := map[string]model.Card{}
	for _, c := range si.Cards {
		cards[c.Slug] = c
	}
	family := probeFamily(si)
	var out []Task
	for _, d := range si.Decisions {
		if d.Status != model.DecisionRuled || d.Forecast == "" || len(d.Cards) == 0 {
			continue
		}
		t := Task{Number: d.Number, Title: d.Title, Forecast: d.Forecast, ForecastTop: d.ForecastTop}
		open, anyNow := false, false
		var sups []string
		for _, slug := range d.Cards {
			c, ok := cards[slug]
			if !ok {
				continue
			}
			status := c.Status
			if c.Archived {
				status = model.StatusDone
			}
			t.Cards = append(t.Cards, TaskCard{Slug: slug, Title: c.Title, Status: status, Seat: c.Seat})
			open = open || status != model.StatusDone
			anyNow = anyNow || status == model.StatusNow
			if c.Seat != "" && !slices.Contains(t.Seats, c.Seat) {
				t.Seats = append(t.Seats, c.Seat)
				if sup := taskSupervisor(probeDir, family, c.Seat); sup != "" && !slices.Contains(sups, sup) {
					sups = append(sups, sup)
				}
			}
		}
		if !open {
			continue
		}
		for _, sup := range sups {
			if !slices.Contains(t.Seats, sup) {
				t.Seats = append(t.Seats, sup)
			}
		}
		if len(sups) > 0 {
			t.Supervisor = sups[0]
		}
		t.QuietMinutes = quietMinutes(snap.Threads, t.Seats)
		t.LastPost = lastPost(snap.Threads, fs, t.Supervisor)
		var elapsed time.Duration
		if at, err := time.Parse(time.RFC3339, d.RuledAt); err == nil {
			t.Started = &at
			elapsed = now.Sub(at)
			t.ElapsedMinutes = int(elapsed / time.Minute)
		}
		t.State = taskState(elapsed, t.ForecastTop, t.QuietMinutes, anyNow)
		out = append(out, t)
	}
	return out
}

// quietMinutes is the smallest quiet time, in whole minutes, over the live
// threads where a task seat is a participant.
func quietMinutes(threads []discuss.Thread, seats []string) *int {
	best := int64(-1)
	for _, th := range threads {
		if th.Status == "closed" || !slices.ContainsFunc(th.Participants, func(p string) bool { return slices.Contains(seats, p) }) {
			continue
		}
		if best < 0 || th.QuietSeconds < best {
			best = th.QuietSeconds
		}
	}
	if best < 0 {
		return nil
	}
	m := int(best / 60)
	return &m
}

// fseSeat is the seat the supervisor reports to (the fse skill).
const fseSeat = "fse"

// lastPost is the last message of the supervisor's latest live thread to the
// FSE: the supervisor posted in it, and the FSE opened it, was its first
// addressee or posted in it. Latest is the least quiet.
func lastPost(threads []discuss.Thread, fs map[string]facts, sup string) *TaskPost {
	if sup == "" {
		return nil
	}
	var pick *discuss.Thread
	for i := range threads {
		th := &threads[i]
		f := fs[th.ID]
		if !slices.Contains(th.Participants, sup) {
			continue
		}
		if !slices.Contains(th.Participants, fseSeat) && f.to != fseSeat && f.from != fseSeat {
			continue
		}
		if pick == nil || th.QuietSeconds < pick.QuietSeconds {
			pick = th
		}
	}
	if pick == nil {
		return nil
	}
	f := fs[pick.ID]
	if f.msgs == 0 {
		return nil
	}
	line, _, _ := strings.Cut(strings.TrimSpace(f.lastBody), "\n")
	return &TaskPost{ThreadID: pick.ID, From: f.lastFrom, Subject: pick.Subject, Line: strings.TrimSpace(line)}
}

// tasks is tasksOf with the service's clock, probe dir and thread cache.
func (s *Service) tasks(cfg config.Config, si *model.ScannedInitiative, snap discuss.Snapshot) []Task {
	var fs map[string]facts
	if si.Cell != nil && len(snap.Threads) > 0 && slices.ContainsFunc(si.Decisions, func(d model.Decision) bool { return d.Forecast != "" }) {
		fs = s.threadFacts(cfg, si.Cell, snap.Threads)
	}
	return tasksOf(si, snap, fs, config.Expand(cfg.ProbeStateDir), s.now())
}
