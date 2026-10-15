package service

import (
	"encoding/json"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/model"
)

// crewService is a service holding one initiative whose cell is seats, under
// project crewfix, with persona files and a discuss-api that hands out a
// token; the fake probe f stands in for probe.
func crewService(t *testing.T, f fakeProbe, seats ...string) (*Service, string) {
	t.Helper()
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	api := filepath.Join(f.dir, "discuss-api")
	if err := os.WriteFile(api, []byte("#!/bin/sh\necho 'export DISCUSS_TOKEN=x'\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", f.dir+string(os.PathListSeparator)+os.Getenv("PATH"))
	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, "agents"), 0o755); err != nil {
		t.Fatal(err)
	}
	cell, _ := json.Marshal(model.Cell{Project: "crewfix", Agents: seats, Human: "pablo"})
	if err := os.WriteFile(filepath.Join(root, "agents", "cell.json"), cell, 0o644); err != nil {
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
	return &Service{
		cfg:   config.Config{DiscussStateDir: t.TempDir()},
		state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}},
		now:   time.Now,
	}, root
}

// fakeLive swaps liveSeats for a fixed set of running seats.
func fakeLive(t *testing.T, seats ...string) {
	t.Helper()
	old := liveSeats
	liveSeats = func(*Service, string) map[string]bool {
		m := map[string]bool{}
		for _, s := range seats {
			m[s] = true
		}
		return m
	}
	t.Cleanup(func() { liveSeats = old })
}

// G1 (leftovers-30 FR-1): a crew of three with one running starts two: two
// entries, two probe calls, nothing written for the running seat, and the
// start names the seat it skipped.
func TestCreateCrewSkipsRunningSeats(t *testing.T) {
	f := newFakeProbe(t, "crewfix", "0")
	s, root := crewService(t, f, "po_ana", "dev_bruno", "qa_cleo")
	fakeLive(t, "dev_bruno")

	c, err := s.StartCrew("init-crew", true)
	if err != nil {
		t.Fatalf("StartCrew: %v", err)
	}
	if !slices.Equal(c.Skipped, []string{"dev_bruno"}) || len(c.Lines) != 2 {
		t.Fatalf("StartCrew skipped %v with %d lines, want [dev_bruno] and 2", c.Skipped, len(c.Lines))
	}
	got, _ := s.WaitLaunch("init-crew")
	var entries []string
	for _, seat := range got.Seats {
		entries = append(entries, seat.Seat+" "+seat.State)
	}
	if want := []string{"po_ana running", "qa_cleo running"}; !slices.Equal(entries, want) {
		t.Errorf("entries %v, want %v", entries, want)
	}
	calls := f.wrapperCalls(t)
	if len(calls) != 2 || !strings.HasPrefix(calls[0], "wrapper ana "+root) || !strings.HasPrefix(calls[1], "wrapper cleo "+root) {
		t.Errorf("probe calls %v, want ana then cleo", calls)
	}
	if _, err := os.Stat(filepath.Join(crewDir("init-crew"), "dev_bruno.sh")); !os.IsNotExist(err) {
		t.Errorf("a prelude was written for the running seat (%v)", err)
	}
	f.noWindow(t)
}

// G1, every seat running: nothing is queued and probe is not called.
func TestCreateCrewAllRunningStartsNothing(t *testing.T) {
	f := newFakeProbe(t, "crewfix", "0")
	s, _ := crewService(t, f, "po_ana", "dev_bruno")
	fakeLive(t, "po_ana", "dev_bruno")

	c, err := s.StartCrew("init-crew", true)
	if err != nil || len(c.Lines) != 0 || !slices.Equal(c.Skipped, []string{"po_ana", "dev_bruno"}) {
		t.Fatalf("StartCrew: %+v, %v", c, err)
	}
	if _, ok := s.WaitLaunch("init-crew"); ok {
		t.Error("a start was queued with every seat running")
	}
	if len(*f.execs) != 0 {
		t.Errorf("ran %v with every seat running", *f.execs)
	}
}

// P1 (leftovers-33 FR-1): a crew of three with two running names the two as
// running with crewSession's names, and launches only the third.
func TestStartCrewNamesRunningSessions(t *testing.T) {
	f := newFakeProbe(t, "crewfix", "0")
	s, root := crewService(t, f, "po_ana", "dev_bruno", "qa_cleo")
	fakeLive(t, "po_ana", "qa_cleo")

	c, err := s.StartCrew("init-crew", true)
	if err != nil {
		t.Fatalf("StartCrew: %v", err)
	}
	want := []CrewRunning{{Seat: "po_ana", Session: "crewfix-probe-ana"}, {Seat: "qa_cleo", Session: "crewfix-probe-cleo"}}
	if !slices.Equal(c.Running, want) {
		t.Errorf("running %+v, want %+v", c.Running, want)
	}
	if len(c.Lines) != 1 || !strings.Contains(c.Lines[0], "dev_bruno.sh") || !strings.HasSuffix(c.Lines[0], "'bruno' '"+root+"'") {
		t.Errorf("lines %v, want the one line for bruno", c.Lines)
	}
	if _, ok := s.WaitLaunch("init-crew"); !ok {
		t.Error("nothing was queued for the seat that does not run")
	}
}
