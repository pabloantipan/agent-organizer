package usage

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// leftovers-56 gate rows A1 and A4. Literal strings, no new symbols, so the
// file also compiles (and fails) on main.

// A1 (FR-1): an FSE session at the root, a persona, a pair session outside
// every root and a plain session all have an initiative and a task.
func TestLF56A1EveryRunHasInitiativeAndTask(t *testing.T) {
	inits := fixtureInitiatives()
	inits[0].Seats = []string{"fse", "po_andrea"}
	tests := []struct {
		name                   string
		seen                   Seen
		initiative, role, task string
	}{
		{"fse at the root", Seen{Name: "org-probe-fse", Cwd: "/home/p/org"}, "org", "fse", "overhead:fse"},
		{"persona", Seen{Name: "org-probe-andrea", Cwd: "/home/p/org"}, "org", "persona", "overhead:persona"},
		{"pair outside every root", Seen{Name: "probe-hephaistos", Cwd: "/home/p"}, "factory", "pair", "overhead:pair"},
		{"pair by skill in the home dir", Seen{Pair: "aglaea", Cwd: "/home/p"}, "factory", "pair", "overhead:pair"},
		{"plain named session", Seen{Name: "isolate-access", Cwd: "/home/p/org"}, "org", "session", "overhead:session"},
		{"plain session with no name", Seen{Cwd: "/home/p/org"}, "org", "session", "overhead:session"},
		{"plain session with no cwd", Seen{}, "factory", "session", "overhead:session"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			a := Attribute(tt.seen, inits)
			if a.Initiative != tt.initiative || a.Role != tt.role || a.Task != tt.task || a.Reason != "" {
				t.Errorf("got %s/%s/%s reason %q, want %s/%s/%s", a.Initiative, a.Role, a.Task, a.Reason, tt.initiative, tt.role, tt.task)
			}
		})
	}
}

// A4 (FR-4): a builder seen before its card names its seat has no card task
// on the first read and the card's slug on the next; a kept card task does
// not change when the cards do.
func TestLF56A4AttributedAgainUntilCardTask(t *testing.T) {
	projects := copyFixture(t)
	transcript := `{"type":"agent-name","agentName":"org-probe-l56-roles","sessionId":"s-l56"}
{"type":"assistant","cwd":"/home/p/org/.wt/lf56","sessionId":"s-l56","timestamp":"2026-10-05T10:00:00.000Z","message":{"id":"m-l56","model":"claude-opus-5-5","usage":{"input_tokens":1,"output_tokens":1,"cache_read_input_tokens":1,"cache_creation_input_tokens":1}}}
`
	if err := os.WriteFile(filepath.Join(projects, "-home-p-org", "s-l56.jsonl"), []byte(transcript), 0o644); err != nil {
		t.Fatal(err)
	}
	o := opts(t, projects, nil)
	task := func(sid string) string {
		t.Helper()
		if _, err := Ingest(o); err != nil {
			t.Fatal(err)
		}
		return byDay(LoadLedger(o.LedgerPath), sid)["2026-10-05"].Task
	}

	if got := task("s-l56"); got != "" && !strings.HasPrefix(got, "overhead:") {
		t.Fatalf("first read, no card names l56-roles: task %q, want no card task", got)
	}
	o.Initiatives[0].Cards = append(o.Initiatives[0].Cards, Card{Slug: "lf56-run-roles", Title: "Run roles", Seat: "l56-roles"})
	if got := task("s-l56"); got != "lf56-run-roles" {
		t.Fatalf("next read, the card names l56-roles: task %q, want lf56-run-roles", got)
	}

	// The cards move on: the seat leaves the card, rlf's card is gone.
	o.Initiatives[0].Cards = []Card{{Slug: "other", Seat: "l56-roles-2"}}
	if got := task("s-l56"); got != "lf56-run-roles" {
		t.Errorf("a kept card task changed to %q", got)
	}
	if got := task("s-main"); got != "ruled-line-floor" {
		t.Errorf("s-main's kept card task changed to %q", got)
	}
}
