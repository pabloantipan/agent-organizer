package cli

import (
	"bytes"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
	"time"
)

// P2 (leftovers-27 FR-2): `organizer crew <id>` with the probe stub stays
// blocking and prints one line per seat state, in order, the failed seat
// with its reason and the pane lines, then the total; it exits 1 on a
// failure.
func TestCrewCmdPrintsEachState(t *testing.T) {
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
	home := t.TempDir()
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
	write("agents/cell.json", `{"project":"crewfix","agents":["po_ana","dev_bruno","qa_cleo"],"human":"pablo"}`)
	for _, seat := range []string{"po_ana", "dev_bruno", "qa_cleo"} {
		write("agents/"+seat+".md", "# "+seat+"\n")
	}
	cfgPath := filepath.Join(t.TempDir(), "config.yaml")
	if err := os.WriteFile(cfgPath, []byte("machine: test\nroots: ["+home+"]\nmax_depth: 2\nauth: off\nzellij: /usr/bin/true\nagent_binary: organizer-test-no-agent\nprobe_state_dir: \"\"\ndiscuss_state_dir: "+t.TempDir()+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("ORGANIZER_CONFIG", cfgPath)

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
