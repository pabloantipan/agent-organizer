package cli

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/session"
)

// retireHome is a home holding init-retire, whose cell is fse and b1 under
// project g1, a done card naming b1, and a past run of b1, so the cell is a
// wave and not a roster in definition. Zellij, the mailbox and the token
// registry are empty stand-ins. It returns the cell.json path.
func retireHome(t *testing.T) string {
	t.Helper()
	t.Setenv("HOME", t.TempDir())
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	home, err := filepath.EvalSymlinks(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	root := filepath.Join(home, "init-retire")
	write := func(path, body string) {
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(path, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write(filepath.Join(root, "working-on", "initiative.yaml"), "id: init-retire\ntitle: Retire\nstatus: active\n")
	write(filepath.Join(root, "working-on", "done", "c1.md"), "---\ntitle: C1\nstatus: done\nseat: b1\nupdated: 2026-10-25\nnext: none\n---\n")
	cell := filepath.Join(root, "agents", "cell.json")
	write(cell, `{"project":"g1","agents":["fse","b1"],"human":"pablo","reconciler":""}`)
	run, _ := json.Marshal(session.Run{PID: 1, SessionID: "a", Persona: "b1", Cell: "g1", Ended: true})
	write(session.RunsPath(), string(run)+"\n")
	cfgPath := filepath.Join(t.TempDir(), "config.yaml")
	write(cfgPath, "machine: test\nroots: ["+home+"]\nmax_depth: 2\nauth: off\nzellij: /usr/bin/true\nagent_binary: organizer-test-no-agent\nprobe_state_dir: \"\"\ndiscuss_state_dir: "+t.TempDir()+"\n")
	t.Setenv("ORGANIZER_CONFIG", cfgPath)
	return cell
}

// leftovers-54 G1, Amendment 1, the CLI half: `organizer retire` (dry) by
// default plans b1 only, never fse; a plan with no seat, from --keep or a
// refused --seats, lists no thread, no token and no cell.json write.
func TestRetireCmdDefaultAndEmptyPlans(t *testing.T) {
	cell := retireHome(t)
	before, _ := os.ReadFile(cell)
	retire := func(args ...string) string {
		t.Helper()
		var out, errb bytes.Buffer
		if code := runWith(append([]string{"retire", "init-retire"}, args...), &out, &errb, time.Now); code != 0 {
			t.Fatalf("retire %v: exit %d\n%s%s", args, code, out.String(), errb.String())
		}
		return out.String()
	}
	has := func(out string, want ...string) {
		t.Helper()
		for _, w := range want {
			if !strings.Contains(out, w) {
				t.Errorf("output lacks %q:\n%s", w, out)
			}
		}
	}

	has(retire(), "retire seats:  b1\n", "keep seats:    fse\n", "dry run; add --run to do it")

	nothing := []string{"retire seats:  none\n", "close threads: 0", "revoke tokens: none\n", "delete files:  0 ", ", unchanged\n", "! nothing to retire\n"}
	has(retire("--keep", "b1"), append(nothing, "keep seats:    fse, b1\n")...)
	has(retire("--seats", "fse"), append(nothing, "! fse kept: no card names it in seat:")...)

	if after, _ := os.ReadFile(cell); string(after) != string(before) {
		t.Errorf("cell.json changed by a dry run: %s", after)
	}
}
