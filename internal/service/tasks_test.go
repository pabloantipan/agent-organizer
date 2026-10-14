package service

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"slices"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/discuss"
	"organizer/internal/model"
)

var tasksNow = time.Date(2026, 10, 14, 12, 0, 0, 0, time.UTC)

func taskInitiative(cards ...model.Card) model.ScannedInitiative {
	return model.ScannedInitiative{
		Initiative: model.Initiative{ID: "organizer", Title: "Organizer"},
		Cell:       &model.Cell{Project: "organizer", Human: "pablo"},
		Cards:      cards,
		Decisions: []model.Decision{
			{Number: "0124", Title: "Accept leftovers-28", Status: model.DecisionRuled, Forecast: "40-90m", ForecastTop: 90,
				RuledAt: "2026-10-14T11:00:00Z", Cards: []string{"tw", "tr"}},
			// No forecast: no task, whatever its cards (FR-1).
			{Number: "0100", Title: "Old accept", Status: model.DecisionRuled, Cards: []string{"tw"}},
			// Proposed: not a task yet.
			{Number: "0125", Title: "Accept leftovers-29", Status: model.DecisionProposed, Forecast: "1-2h", ForecastTop: 120, Cards: []string{"tw"}},
		},
	}
}

// T2's feed half (FR-2): a record with a card open is a task started at the
// ruling; one whose cards are all done is none.
func TestTasksOpenCards(t *testing.T) {
	si := taskInitiative(
		model.Card{Slug: "tw", Title: "Watch", Status: model.StatusNow, Seat: "tw-build"},
		model.Card{Slug: "tr", Title: "Rows", Status: model.StatusDone, Archived: true},
	)
	ts := tasksOf(&si, discuss.Snapshot{}, nil, "", tasksNow)
	if len(ts) != 1 || ts[0].Number != "0124" {
		t.Fatalf("one task, 0124: %+v", ts)
	}
	if ts[0].Started == nil || !ts[0].Started.Equal(time.Date(2026, 10, 14, 11, 0, 0, 0, time.UTC)) || ts[0].ElapsedMinutes != 60 {
		t.Errorf("started at the ruling, 60 min ago: %+v", ts[0])
	}
	if len(ts[0].Cards) != 2 || ts[0].Cards[1].Status != model.StatusDone || ts[0].Cards[0].Status != model.StatusNow {
		t.Errorf("cards with status: %+v", ts[0].Cards)
	}
	si.Cards[0].Status, si.Cards[0].Archived = model.StatusDone, true
	if ts := tasksOf(&si, discuss.Snapshot{}, nil, "", tasksNow); len(ts) != 0 {
		t.Errorf("all cards done is no task: %+v", ts)
	}
	si.Decisions[0].RuledAt = ""
	si.Cards[0].Status, si.Cards[0].Archived = model.StatusNow, false
	if ts := tasksOf(&si, discuss.Snapshot{}, nil, "", tasksNow); len(ts) != 1 || ts[0].Started != nil || ts[0].State != TaskOn {
		t.Errorf("no ruling commit: a task with no start, on: %+v", ts)
	}
}

// T3 (FR-3): quiet minutes from the health snapshot, the supervisor from
// probe's .parent file, last_post through the thread cache's fetch; the task
// rides the agents feed.
func TestTasksOnTheFeed(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	probeDir := t.TempDir()
	if err := os.WriteFile(filepath.Join(probeDir, "organizer-probe-tw-build.parent"), []byte("organizer-probe-sup9\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	canned := filepath.Join(t.TempDir(), "health.json")
	if err := os.WriteFile(canned, []byte(`{"organizer":{"agents":[],"threads":[
		{"id":"t-other","subject":"unrelated","status":"open","kind":"conversation","participants":["po_ana"],"messages":1,"quiet_seconds":60},
		{"id":"t-build","subject":"lf28-task-watch: a question","status":"open","kind":"conversation","participants":["tw-build","fse"],"messages":3,"quiet_seconds":3000},
		{"id":"t-sup","subject":"leftovers-28","status":"open","kind":"conversation","participants":["sup9"],"messages":2,"quiet_seconds":600}]}}`), 0o644); err != nil {
		t.Fatal(err)
	}
	si := taskInitiative(
		model.Card{Slug: "tw", Title: "Watch", Status: model.StatusNow, Seat: "tw-build"},
		model.Card{Slug: "tr", Title: "Rows", Status: model.StatusNext},
	)
	st := cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}
	cfg := config.Config{Machine: "m", CannedHealth: canned, DiscussStateDir: t.TempDir(), ProbeStateDir: probeDir, Roles: []config.Role{}}
	s := NewWith(cfg, st, func() time.Time { return tasksNow })
	fetched := 0
	s.fetchThread = func(_ context.Context, id string) (discuss.ThreadDetail, error) {
		fetched++
		d := discuss.ThreadDetail{ID: id}
		switch id {
		case "t-sup":
			d.Messages = []discuss.Message{
				{From: "sup9", To: "fse", Body: "wave started"},
				{From: "sup9", To: "fse", Body: "band top: tw-build at 70%\nmore detail"},
			}
		case "t-build":
			d.Messages = []discuss.Message{{From: "tw-build", To: "sup9"}, {From: "fse"}, {From: "tw-build"}}
		default:
			d.Messages = []discuss.Message{{From: "po_ana"}}
		}
		return d, nil
	}
	s.mu.Lock()
	v := s.agentsViewLocked()
	s.mu.Unlock()
	if len(v.Groups) != 1 || len(v.Groups[0].Tasks) != 1 {
		t.Fatalf("one task on the feed: %+v", v.Groups)
	}
	task := v.Groups[0].Tasks[0]
	if task.QuietMinutes == nil || *task.QuietMinutes != 10 {
		t.Errorf("quiet_minutes %v, want 10 (600 s, the other thread has no task seat)", task.QuietMinutes)
	}
	if !slices.Contains(task.Seats, "sup9") || !slices.Contains(task.Seats, "tw-build") || task.Supervisor != "sup9" {
		t.Errorf("seats include the card's seat and sup9: %+v %q", task.Seats, task.Supervisor)
	}
	want := TaskPost{ThreadID: "t-sup", From: "sup9", Subject: "leftovers-28", Line: "band top: tw-build at 70%"}
	if task.LastPost == nil || *task.LastPost != want {
		t.Errorf("last_post %+v, want %+v", task.LastPost, want)
	}
	if task.State != TaskOn || task.ElapsedMinutes != 60 {
		t.Errorf("state on at 60 of 90 with 10 quiet: %+v", task)
	}
	// Cached like openers: a second sample fetches nothing new.
	before := fetched
	s.mu.Lock()
	s.agentsViewLocked()
	s.mu.Unlock()
	if fetched != before {
		t.Errorf("second sample fetched %d threads again", fetched-before)
	}
	b, _ := json.Marshal(v.Groups[0].Tasks)
	var raw []map[string]any
	if err := json.Unmarshal(b, &raw); err != nil {
		t.Fatal(err)
	}
	for _, k := range []string{"number", "title", "forecast", "forecast_top", "started", "cards", "seats", "quiet_minutes", "last_post", "state"} {
		if _, ok := raw[0][k]; !ok {
			t.Errorf("json has no %q: %s", k, b)
		}
	}
}

// T4 (FR-4): band 40-90m.
func TestTaskState(t *testing.T) {
	q := func(m int) *int { return &m }
	for _, c := range []struct {
		name    string
		elapsed int
		quiet   *int
		anyNow  bool
		want    string
	}{
		{"60 min, inside the band", 60, nil, true, TaskOn},
		{"100 min, past the top", 100, q(5), true, TaskOver},
		{"200 min, past twice the top", 200, q(5), true, TaskStalled},
		{"quiet 50 with a card now", 60, q(50), true, TaskStalled},
		{"quiet 50 with a card now, also over: stalled wins", 100, q(50), true, TaskStalled},
		{"quiet 50, all cards next, inside: on", 60, q(50), false, TaskOn},
		{"quiet 50, all cards next, past the top: over", 100, q(50), false, TaskOver},
		{"quiet 44 with a card now", 60, q(44), true, TaskOn},
		{"exactly the top is not over", 90, nil, true, TaskOn},
		{"quiet exactly 45 with a card now", 10, q(45), true, TaskStalled},
	} {
		if got := taskState(time.Duration(c.elapsed)*time.Minute, 90, c.quiet, c.anyNow); got != c.want {
			t.Errorf("%s: %s, want %s", c.name, got, c.want)
		}
	}
}
