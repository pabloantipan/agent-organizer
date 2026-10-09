//go:build live

package main

// G4 (initiatives-view): sleep and wake a throwaway initiative through
// App.Sleep and App.Wake with the real factory, on the real home. Run with
//   go test -tags live -run TestLiveSleepWake -v .
// It touches nothing but its throwaways, which it removes in every outcome.

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/service"
)

// throwaway makes dir a git repo with working-on/initiative.yaml at status.
func throwaway(t *testing.T, dir, id, status string) {
	t.Helper()
	t.Cleanup(func() { os.RemoveAll(dir) })
	if err := os.MkdirAll(filepath.Join(dir, "working-on"), 0o755); err != nil {
		t.Fatal(err)
	}
	y := fmt.Sprintf("id: %s\ntitle: Deltagos G4 throwaway\nstatus: %s\nrepos: []\n", id, status)
	if err := os.WriteFile(filepath.Join(dir, "working-on", "initiative.yaml"), []byte(y), 0o644); err != nil {
		t.Fatal(err)
	}
	for _, a := range [][]string{{"init", "-q"}, {"add", "--", "working-on/initiative.yaml"}, {"commit", "-q", "-m", "throwaway"}} {
		if out, err := exec.Command("git", append([]string{"-C", dir}, a...)...).CombinedOutput(); err != nil {
			t.Fatalf("git %v: %s", a, out)
		}
	}
}

func lastCommit(t *testing.T, dir string) string {
	out, _ := exec.Command("git", "-C", dir, "log", "-1", "--format=%s").CombinedOutput()
	return strings.TrimSpace(string(out))
}

func statusLine(t *testing.T, dir string) string {
	b, _ := os.ReadFile(filepath.Join(dir, "working-on", "initiative.yaml"))
	for _, l := range strings.Split(string(b), "\n") {
		if strings.HasPrefix(l, "status:") {
			return l
		}
	}
	return ""
}

func TestLiveSleepWake(t *testing.T) {
	home, _ := os.UserHomeDir()
	t.Setenv("XDG_DATA_HOME", t.TempDir()) // never the real ~/.local/share/organizer
	stamp := time.Now().Format("150405")
	idPocs, idTop := "g4-pocs-"+stamp, "g4-top-"+stamp
	pocs := filepath.Join(home, "pocs", "deltagos-"+idPocs)
	top := filepath.Join(home, "deltagos-"+idTop)
	// Created paused: the throwaway never counts as awake beyond the test's own wake.
	throwaway(t, pocs, idPocs, "paused")
	throwaway(t, top, idTop, "paused")

	roots := []string{pocs, top}
	camp := filepath.Join(home, "ccint", "ccint-camp-monorepo")
	if _, err := os.Stat(filepath.Join(camp, "working-on", "initiative.yaml")); err == nil {
		roots = append(roots, filepath.Join(home, "ccint"))
	}
	cfg := config.Config{Machine: "g4", Roots: roots, MaxDepth: 2, ProbeStateDir: filepath.Join(home, ".local", "state", "probe")}
	a := &App{svc: service.NewWith(cfg, cache.State{}, time.Now)}
	b := a.GetBoard()
	f := a.Factory()
	t.Logf("factory: found %v on_path %v path %s ok %v awake %d limit %d reason %q", f.Found, f.OnPath, f.Path, f.OK, f.Awake, f.Limit, f.Reason)
	if !f.OK {
		t.Fatalf("factory awake failed: %s", f.Reason)
	}
	blind := map[string]bool{}
	for _, bi := range b.Board.Initiatives {
		blind[bi.ID] = bi.FactoryBlind
		t.Logf("scanned %-28s status %-8s factory_blind %v offer %q", bi.ID, bi.Status, bi.FactoryBlind, f.Offers[bi.ID])
	}

	// Four deep is blind: ~/pocs/<x> and camp.
	if !blind[idPocs] {
		t.Errorf("%s under ~/pocs: want factory_blind (the factory finds initiatives at depth 3)", idPocs)
	}
	if len(roots) == 3 && !blind["ccint-camp-monorepo"] && !blind["camp"] {
		t.Logf("camp is not factory_blind: the factory now looks four deep")
	}
	if blind[idTop] {
		t.Fatalf("%s one level under ~ is factory_blind", idTop)
	}
	r, err := a.Wake(idPocs)
	t.Logf("wake %s (blind): ok %v exit %d output %q", idPocs, r.OK, r.ExitCode, r.Output)
	if err != nil || r.OK || r.Status != "paused" {
		t.Errorf("waking a blind one: err %v result %+v", err, r)
	}

	if f.Awake >= f.Limit {
		t.Skipf("the real home is at the limit (%d of %d awake): not waking, not forcing", f.Awake, f.Limit)
	}
	today := time.Now().Format("2006-01-02")

	r, err = a.Wake(idTop)
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("wake %s: ok %v exit %d output %q status %q; file %q; commit %q", idTop, r.OK, r.ExitCode, r.Output, r.Status, statusLine(t, top), lastCommit(t, top))
	if !r.OK || r.Output != idTop+" awake\n" || r.Status != "active" || r.AsleepSince != "" {
		t.Fatalf("wake: %+v", r)
	}
	if c := lastCommit(t, top); c != "chore(initiative): active (deltagos-"+idTop+")" {
		t.Errorf("wake commit %q", c)
	}

	r, err = a.Sleep(idTop)
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("sleep %s: ok %v exit %d output %q status %q asleep_since %q; file %q; commit %q", idTop, r.OK, r.ExitCode, r.Output, r.Status, r.AsleepSince, statusLine(t, top), lastCommit(t, top))
	if !r.OK || r.Output != idTop+" asleep\n" || r.Status != "paused" || r.AsleepSince != today {
		t.Fatalf("sleep: %+v", r)
	}
	if c := lastCommit(t, top); c != "chore(initiative): paused (deltagos-"+idTop+")" {
		t.Errorf("sleep commit %q", c)
	}
	if out, _ := exec.Command("git", "-C", top, "status", "--porcelain").CombinedOutput(); len(out) != 0 {
		t.Errorf("uncommitted after sleep: %s", out)
	}
	// Deltagos shows it after the rescan, on the board too.
	for _, bi := range a.GetBoard().Board.Initiatives {
		if bi.ID == idTop && (bi.Status != "paused" || bi.AsleepSince != today) {
			t.Errorf("board after the rescan: %s %q %q", bi.ID, bi.Status, bi.AsleepSince)
		}
	}
}
