package service

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/session"
	"organizer/internal/usage"
)

// lf62Home is a home for G1: one initiative root `org` with two cards whose
// seats are two builders, the builders' transcripts under CLAUDE_CONFIG_DIR,
// and their ended runs in runs.jsonl. It returns the service and the data dir.
func lf62Home(t *testing.T) (*Service, string) {
	t.Helper()
	data := t.TempDir()
	t.Setenv("XDG_DATA_HOME", data)
	claude := t.TempDir()
	t.Setenv("CLAUDE_CONFIG_DIR", claude)
	roots := t.TempDir()
	root := filepath.Join(roots, "org")
	write := func(p, body string) {
		t.Helper()
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write(filepath.Join(root, "working-on", "initiative.yaml"), "id: org\ntitle: Org\nstatus: active\n")
	for _, c := range [][2]string{{"rlf", "rlf-build"}, {"xyz", "xyz-build"}} {
		write(filepath.Join(root, "working-on", c[0]+".md"),
			"---\ntitle: "+c[0]+"\nstatus: now\nseat: "+c[1]+"\nupdated: 2026-10-05\nnext: build it\n---\n\nbody\n")
	}
	transcript := func(sid, slug, seat string) string {
		cwd := filepath.Join(root, ".wt", slug)
		return `{"type":"user","cwd":"` + cwd + `","sessionId":"` + sid + `","timestamp":"2026-10-05T09:00:00.000Z","message":{"role":"user","content":"go"}}` + "\n" +
			`{"type":"agent-name","agentName":"org-probe-` + seat + `","sessionId":"` + sid + `"}` + "\n" +
			`{"type":"assistant","cwd":"` + cwd + `","sessionId":"` + sid + `","timestamp":"2026-10-05T09:00:05.000Z","message":{"id":"msg_` + sid + `","model":"claude-opus-5-5","usage":{"input_tokens":10,"output_tokens":10,"cache_read_input_tokens":10,"cache_creation_input_tokens":10}}}` + "\n"
	}
	write(filepath.Join(claude, "projects", "-org", "s-a.jsonl"), transcript("s-a", "rlf", "rlf-build"))
	write(filepath.Join(claude, "projects", "-org", "s-b.jsonl"), transcript("s-b", "xyz", "xyz-build"))

	at := time.Date(2026, 10, 5, 9, 0, 0, 0, time.UTC)
	runs := []session.Run{
		{PID: 999991, SessionID: "s-a", Cwd: filepath.Join(root, ".wt", "rlf"), InputTokens: 10, FirstSeen: at, LastSeen: at.Add(time.Minute), Ended: true},
		{PID: 999992, SessionID: "s-b", Cwd: filepath.Join(root, ".wt", "xyz"), InputTokens: 20, FirstSeen: at, LastSeen: at.Add(2 * time.Minute), Ended: true},
	}
	if err := session.AppendRuns(session.RunsPath(), runs); err != nil {
		t.Fatal(err)
	}
	cfg := config.Config{Machine: "lodestar", Roots: []string{roots}, MaxDepth: 2}
	now := func() time.Time { return time.Date(2026, 10, 6, 12, 0, 0, 0, time.Local) }
	return NewWith(cfg, cache.State{}, now), filepath.Join(data, "organizer")
}

// stampOldAttribution rewrites every ledger line's attribution as an older
// rule left it (no task, an old reason), keeping the header's generation so
// the next pass reads the ledger as its own.
func stampOldAttribution(t *testing.T, ledger string) {
	t.Helper()
	b, err := os.ReadFile(ledger)
	if err != nil {
		t.Fatal(err)
	}
	var out []string
	for _, raw := range strings.Split(strings.TrimRight(string(b), "\n"), "\n") {
		var m map[string]any
		if err := json.Unmarshal([]byte(raw), &m); err != nil {
			t.Fatal(err)
		}
		if _, ok := m["session_id"]; ok {
			for _, k := range []string{"task", "task_title", "cards"} {
				delete(m, k)
			}
			m["role"] = "session"
			m["reason"] = "an older rule"
			nb, _ := json.Marshal(m)
			raw = string(nb)
		}
		out = append(out, raw)
	}
	if err := os.WriteFile(ledger, []byte(strings.Join(out, "\n")+"\n"), 0o600); err != nil {
		t.Fatal(err)
	}
}

func runTasks(v RunsView) map[string]string {
	got := map[string]string{}
	for _, c := range v.Cards {
		for _, r := range c.Runs {
			got[r.SessionID] = r.Card
		}
	}
	return got
}

// G1 (leftovers-62 FR-1): over a ledger last written by an older attribution,
// InitiativeRuns names each run's task the same before a usage pass and after
// it, and the read writes nothing.
func TestLF62G1RunsAttributeOnRead(t *testing.T) {
	s, dataDir := lf62Home(t)
	if _, err := s.Usage(""); err != nil {
		t.Fatal(err)
	}
	ledger := filepath.Join(dataDir, "usage.jsonl")
	stampOldAttribution(t, ledger)
	stamped, _ := os.ReadFile(ledger)

	want := map[string]string{"s-a": "rlf", "s-b": "xyz"}
	before := runTasks(s.InitiativeRuns("org"))
	if after, _ := os.ReadFile(ledger); string(after) != string(stamped) {
		t.Errorf("InitiativeRuns wrote the ledger")
	}
	if _, err := s.Usage(""); err != nil {
		t.Fatal(err)
	}
	after := runTasks(s.InitiativeRuns("org"))
	for sid, w := range want {
		if before[sid] != w || after[sid] != w {
			t.Errorf("%s: task %q before the usage pass, %q after; want %q both times", sid, before[sid], after[sid], w)
		}
	}
	if got := usage.BySession(usage.LoadLedger(ledger)); got["s-a"].Task != "rlf" {
		t.Errorf("the usage pass did not attribute s-a: %+v", got["s-a"])
	}
}
