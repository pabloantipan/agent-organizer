package cli

import (
	"bytes"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strings"
	"syscall"
	"testing"
	"time"
)

// P2 (leftovers-27 FR-2): `organizer crew <id>` with the probe stub stays
// blocking and prints one line per seat state, in order, the failed seat
// with its reason and the pane lines, then the total; it exits 1 on a
// failure.
func TestCrewCmdPrintsEachState(t *testing.T) {
	crewHome(t, "crewfix", "")

	var out, errb bytes.Buffer
	code := runWith([]string{"crew", "init-crew"}, &out, &errb, time.Now)
	if code != 1 {
		t.Errorf("exit %d, want 1 (a seat failed)\nstderr: %s", code, errb.String())
	}
	lines := strings.Split(strings.TrimSpace(out.String()), "\n")
	want := []string{
		"po_ana queued", "dev_bruno queued", "qa_cleo queued",
		"po_ana starting", "po_ana running",
		"dev_bruno starting", "dev_bruno retrying",
		"dev_bruno failed: the pane did not run claude (probe exit 3, twice)",
		"  pane bruno: claude did not start within 30 s",
		"  pane bruno: $ (probe stub) exit 3",
		"qa_cleo starting", "qa_cleo running",
		"2 of 3 seats running detached (watch: seats open, or probe --attach <session>)",
	}
	if !slices.Equal(lines, want) {
		t.Errorf("crew printed\n%s\nwant\n%s", out.String(), strings.Join(want, "\n"))
	}
}

// crewHome is a home holding init-crew, whose cell is po_ana, dev_bruno and
// qa_cleo under project, with the probe stub as probe (PROBE_STUB_FAIL bruno),
// a discuss-api that hands out a token, and agentBinary as the agent the
// process scan looks for (a name no real agent has when empty). It returns
// the initiative root, symlinks resolved, as the process scan reports cwds.
func crewHome(t *testing.T, project, agentBinary string) string {
	t.Helper()
	stub, _ := filepath.Abs(filepath.Join("..", "..", "scripts", "probe-stub.sh"))
	bin := t.TempDir()
	t.Setenv("ORGANIZER_PROBE_BIN", stub)
	t.Setenv("PROBE_STUB_SLEEP", "0")
	t.Setenv("PROBE_STUB_FAIL", "bruno")
	t.Setenv("HOME", t.TempDir())
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	if err := os.WriteFile(filepath.Join(bin, "discuss-api"), []byte("#!/bin/sh\necho 'export DISCUSS_TOKEN=x'\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", bin+string(os.PathListSeparator)+os.Getenv("PATH"))
	home, err := filepath.EvalSymlinks(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	root := filepath.Join(home, "init-crew")
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
	write("agents/cell.json", `{"project":"`+project+`","agents":["po_ana","dev_bruno","qa_cleo"],"human":"pablo"}`)
	for _, seat := range []string{"po_ana", "dev_bruno", "qa_cleo"} {
		write("agents/"+seat+".md", "# "+seat+"\n")
	}
	if agentBinary == "" {
		agentBinary = "organizer-test-no-agent"
	}
	cfgPath := filepath.Join(t.TempDir(), "config.yaml")
	if err := os.WriteFile(cfgPath, []byte("machine: test\nroots: ["+home+"]\nmax_depth: 2\nauth: off\nzellij: /usr/bin/true\nagent_binary: "+agentBinary+"\nprobe_state_dir: \"\"\ndiscuss_state_dir: "+t.TempDir()+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("ORGANIZER_CONFIG", cfgPath)
	return root
}

// TestCrewStandIn is the running seat of TestCrewCmdSkipsRunningSeat when
// started by it; run any other way it returns at once.
func TestCrewStandIn(t *testing.T) {
	if os.Getenv("ORGANIZER_CREW_STAND_IN") != "1" {
		return
	}
	time.Sleep(60 * time.Second)
}

// G1 (leftovers-30 FR-1), the CLI half: with dev_bruno already running, by
// the live check the Agents feed makes (a process of the agent binary at the
// root carrying AGENT_NAME=dev_bruno), `organizer crew` starts the other two
// only and names the seat it skipped. The cell has its own project, so no
// other seat's stand-ins join it, and the stand-in runs under a name no
// real agent has, killed by its pid.
func TestCrewCmdSkipsRunningSeat(t *testing.T) {
	const agent = "organizer-lf30-test-agent"
	root := crewHome(t, "crewlive", agent)
	t.Setenv("PROBE_STUB_FAIL", "")
	log := filepath.Join(t.TempDir(), "probe.log")
	t.Setenv("PROBE_STUB_LOG", log)
	// The stand-in is this test binary under the agent's name, sleeping in
	// TestCrewStandIn: a platform binary such as /bin/sleep would do, but
	// macOS hides its environment from ps -E, and with it the persona.
	self, err := os.Executable()
	if err != nil {
		t.Fatal(err)
	}
	standIn := filepath.Join(t.TempDir(), agent)
	if err := os.Symlink(self, standIn); err != nil {
		t.Fatal(err)
	}
	cmd := exec.Command(standIn, "-test.run=^TestCrewStandIn$")
	cmd.Dir = root
	cmd.Env = append(os.Environ(), "ORGANIZER_CREW_STAND_IN=1", "AGENT_NAME=dev_bruno", "PROJECT_ID=crewlive")
	if err := cmd.Start(); err != nil {
		t.Fatal(err)
	}
	pid := cmd.Process.Pid
	t.Cleanup(func() { _ = syscall.Kill(pid, syscall.SIGTERM); _ = cmd.Wait() })

	var out, errb bytes.Buffer
	code := runWith([]string{"crew", "init-crew"}, &out, &errb, time.Now)
	if code != 0 {
		t.Errorf("exit %d, want 0\nstderr: %s", code, errb.String())
	}
	lines := strings.Split(strings.TrimSpace(out.String()), "\n")
	want := []string{
		"po_ana queued", "qa_cleo queued",
		"po_ana starting", "po_ana running",
		"qa_cleo starting", "qa_cleo running",
		"2 of 2 seats running detached (watch: seats open, or probe --attach <session>)",
		"already running, not started: dev_bruno",
	}
	if !slices.Equal(lines, want) {
		t.Errorf("crew printed\n%s\nwant\n%s", out.String(), strings.Join(want, "\n"))
	}
	b, _ := os.ReadFile(log)
	var starts []string
	for _, l := range strings.Split(strings.TrimSpace(string(b)), "\n") {
		if f := strings.Fields(l); len(f) > 1 && !strings.HasPrefix(f[1], "-") {
			starts = append(starts, f[1])
		}
	}
	if !slices.Equal(starts, []string{"ana", "cleo"}) {
		t.Errorf("probe started %v, want [ana cleo]\n%s", starts, b)
	}
}
