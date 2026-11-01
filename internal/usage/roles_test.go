package usage

import (
	"os"
	"path/filepath"
	"reflect"
	"testing"
)

// A2 (FR-2): a supervisor's task from the accept record whose supervisor:
// is its session, before the cards that name it; one card gives its slug,
// several give wave:<seat>.
func TestLF56A2SupervisorFromAcceptRecord(t *testing.T) {
	cards := []Card{
		{Slug: "lf54-retire-guard", Title: "Retire guard"},
		{Slug: "lf54-usage-rejected", Title: "Usage rejected"},
		{Slug: "lf54-ci-contracts", Title: "CI contracts", Body: "- sup90 runs this card\n"},
		{Slug: "lf54-decision-states", Title: "Decision states", Body: "- sup90 runs this card\n"},
	}
	tests := []struct {
		name    string
		records []Record
		session string
		task    string
		slugs   []string
	}{
		{"a record with one card, no card naming it", []Record{{Number: "0160", Supervisor: "organizer-probe-sup95", Cards: []string{"lf54-retire-guard"}}},
			"organizer-probe-sup95", "lf54-retire-guard", nil},
		{"a record with two cards", []Record{{Number: "0161", Supervisor: "organizer-probe-sup95", Cards: []string{"lf54-usage-rejected", "lf54-retire-guard"}}},
			"organizer-probe-sup95", "wave:sup95", []string{"lf54-retire-guard", "lf54-usage-rejected"}},
		{"the record wins over a card naming it", []Record{{Number: "0162", Supervisor: "organizer-probe-sup90", Cards: []string{"lf54-retire-guard"}}},
			"organizer-probe-sup90", "lf54-retire-guard", nil},
		{"no record: two cards naming a supervisor", nil,
			"organizer-probe-sup90", "wave:sup90", []string{"lf54-ci-contracts", "lf54-decision-states"}},
		{"a record for another supervisor", []Record{{Number: "0163", Supervisor: "organizer-probe-sup91", Cards: []string{"lf54-retire-guard"}}},
			"organizer-probe-sup95", "", nil},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			inits := []Initiative{{ID: "organizer", Root: "/r/organizer", Cards: cards, Records: tt.records}}
			a := Attribute(Seen{Name: tt.session, Cwd: "/r/organizer"}, inits)
			if a.Role != RoleSupervisor || a.Task != tt.task || !reflect.DeepEqual(a.Cards, tt.slugs) {
				t.Errorf("got role %s task %q cards %v (reason %q), want %q %v", a.Role, a.Task, a.Cards, a.Reason, tt.task, tt.slugs)
			}
			if tt.task == "lf54-retire-guard" && a.TaskTitle != "Retire guard" {
				t.Errorf("title = %q", a.TaskTitle)
			}
		})
	}
}

// A3 (FR-3): a reviewer's (and UI reviewer's) task from the card whose
// reviewer: names its seat, before seat:.
func TestLF56A3ReviewerFromReviewerField(t *testing.T) {
	cards := []Card{
		{Slug: "lf54-retire-guard", Title: "Retire guard", Seat: "l54-retire", Reviewers: []string{"l54-retire-rev"}},
		{Slug: "lf52-decisions-line", Seat: "l52-line", Reviewers: []string{"l52-line-review", "l52-line-ui"}},
		// seat: alone would send l54-retire-rev here (task base l54-retire).
		{Slug: "decoy", Seat: "l54-retire-rev"},
	}
	inits := []Initiative{{ID: "organizer", Root: "/r/organizer", Cards: cards}}
	tests := []struct{ session, role, task string }{
		{"organizer-probe-l54-retire-rev", RoleReviewer, "lf54-retire-guard"},
		{"organizer-probe-l52-line-review", RoleReviewer, "lf52-decisions-line"},
		{"organizer-probe-l52-line-ui", RoleUIReviewer, "lf52-decisions-line"},
		{"organizer-probe-l54-retire", RoleBuilder, "lf54-retire-guard"},
	}
	for _, tt := range tests {
		a := Attribute(Seen{Name: tt.session, Cwd: "/r/organizer/.wt/x"}, inits)
		if a.Role != tt.role || a.Task != tt.task {
			t.Errorf("%s: got %s/%q (reason %q), want %s/%s", tt.session, a.Role, a.Task, a.Reason, tt.role, tt.task)
		}
	}
}

// LoadRoles reads reviewer: from cards (open and done) and supervisor: from
// records under the root; a file that does not parse is skipped.
func TestLoadRolesFromRoot(t *testing.T) {
	root := t.TempDir()
	write := func(rel, body string) {
		p := filepath.Join(root, rel)
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("working-on/a.md", "---\ntitle: A\nreviewer: a-review, a-ui\n---\nbody\n")
	write("working-on/done/b.md", "---\ntitle: B\nreviewer: [b-rev]\n---\n")
	write("working-on/c.md", "---\ntitle: C\nreviewer: c-rev, 2026-10-05\n---\n")
	write("working-on/d.md", "---\ntitle: [unclosed\nreviewer: d-rev\n---\n") // does not parse
	write("working-on/e.md", "no frontmatter\n")
	write("working-on/decisions/0160-accept-x.md", "---\nstatus: ruled\nsupervisor: organizer-probe-sup95\ncards: [a, b]\n---\n")
	write("working-on/decisions/0161-no-sup.md", "---\nstatus: ruled\ncards: [c]\n---\n")
	write("working-on/decisions/0162-broken.md", "---\nsupervisor: [x\n---\n")

	in := []Initiative{{ID: "i", Root: root, Cards: []Card{{Slug: "a"}, {Slug: "b"}, {Slug: "c"}, {Slug: "d"}, {Slug: "e"}}}}
	got := LoadRoles(in)
	want := map[string][]string{"a": {"a-review", "a-ui"}, "b": {"b-rev"}, "c": {"c-rev", "2026-10-05"}}
	for _, c := range got[0].Cards {
		if !reflect.DeepEqual(c.Reviewers, want[c.Slug]) {
			t.Errorf("%s reviewers = %v, want %v", c.Slug, c.Reviewers, want[c.Slug])
		}
	}
	if len(in[0].Cards[0].Reviewers) != 0 {
		t.Error("LoadRoles changed the caller's cards")
	}
	wantRec := []Record{{Number: "0160", Supervisor: "organizer-probe-sup95", Cards: []string{"a", "b"}}}
	if !reflect.DeepEqual(got[0].Records, wantRec) {
		t.Errorf("records = %+v, want %+v", got[0].Records, wantRec)
	}
	if out := LoadRoles([]Initiative{{ID: "x", Root: filepath.Join(root, "missing")}}); len(out[0].Records) != 0 {
		t.Errorf("a missing root = %+v", out)
	}
}
