package main

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/service"
)

// P2 (leftovers-27 FR-2): from the app, Bring crew up returns once the seats
// are queued, before the probe stub's first sleep ends; the seats then start
// in the background and all run.
func TestAppCreateCrewReturnsAtOnce(t *testing.T) {
	stub, _ := filepath.Abs(filepath.Join("scripts", "probe-stub.sh"))
	bin := t.TempDir()
	t.Setenv("ORGANIZER_PROBE_BIN", stub)
	t.Setenv("PROBE_STUB_SLEEP", "3")
	t.Setenv("PROBE_STUB_FAIL", "")
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	if err := os.WriteFile(filepath.Join(bin, "discuss-api"), []byte("#!/bin/sh\necho 'export DISCUSS_TOKEN=x'\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", bin+string(os.PathListSeparator)+os.Getenv("PATH"))
	root := filepath.Join(t.TempDir(), "init-crew")
	write := func(rel, body string) {
		p := filepath.Join(root, rel)
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("working-on/initiative.yaml", "id: init-crew\ntitle: Crew\nstatus: active\n")
	write("agents/cell.json", `{"project":"crewfix","agents":["po_ana","dev_bruno","qa_cleo"],"human":"pablo"}`)
	for _, seat := range []string{"po_ana", "dev_bruno", "qa_cleo"} {
		write("agents/"+seat+".md", "# "+seat+"\n")
	}
	cfg := config.Config{Machine: "test", Roots: []string{filepath.Dir(root)}, MaxDepth: 2, DiscussStateDir: t.TempDir(),
		Zellij: "/usr/bin/true", AgentBinary: "organizer-test-no-agent"}
	svc := service.NewWith(cfg, cache.State{}, time.Now)
	svc.Scan(false)
	a := &App{svc: svc}

	start := time.Now()
	cmds, err := a.CreateCrew("init-crew")
	took := time.Since(start)
	if err != nil || len(cmds) != 3 {
		t.Fatalf("CreateCrew: %v, %v", cmds, err)
	}
	if took >= time.Second {
		t.Errorf("CreateCrew took %v, want < 1 s (the stub sleeps 3 s per seat)", took)
	}
	t.Logf("App.CreateCrew returned in %v", took)
	if v := svc.Launches(); len(v) != 1 || v[0].Done {
		t.Errorf("right after the call the start should be going: %+v", v)
	}
	got, _ := svc.WaitLaunch("init-crew")
	if got.Running != 3 {
		t.Errorf("the background start ended %+v", got.Seats)
	}
}
