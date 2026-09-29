package service

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/discuss"
	"organizer/internal/model"
	"organizer/internal/scan"
	"organizer/internal/session"
)

func serviceWith(sis ...model.ScannedInitiative) *Service {
	return &Service{state: cache.State{Local: model.Snapshot{Initiatives: sis}}, now: time.Now}
}

// G4 (iii) (discovery-in-a-cell, FR-3e, FR-3f): the fixture's drafted cell
// is read with draft and drafted, is in definition although a seat has run,
// waits on its proposed the-cell-roster record, and CreateCrew refuses it
// naming that record before anything is created. Without the record, the
// refusal says there is no accept record yet.
func TestDraftCellIsInDefinitionAndRefusedNamingItsAcceptRecord(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	defer func(f func() []session.Run) { loadRuns = f }(loadRuns)
	root, err := filepath.Abs("../../testdata/fixture-overlay/init-drafted")
	if err != nil {
		t.Fatal(err)
	}
	si := scan.ReadInitiative(root, scan.Options{})
	if si.Cell == nil || !si.Cell.Draft || si.Cell.Drafted != "2026-09-28" {
		t.Fatalf("readCell: %+v, want draft true, drafted 2026-09-28", si.Cell)
	}
	for _, p := range si.Problems {
		t.Errorf("unexpected problem: %s %s", p.Path, p.Msg)
	}
	rec := acceptRecord(si.Decisions)
	if rec == nil || rec.Number != "0001" || rec.Slug != "the-cell-roster" {
		t.Fatalf("accept record %+v, want 0001 the-cell-roster", rec)
	}

	// A seat that has run leaves an accepted cell's definition, not a draft's.
	loadRuns = func() []session.Run {
		return []session.Run{{PID: 1, SessionID: "a", Persona: "po_rosa", Cell: "drafted-fixture", Ended: true}}
	}
	seats := buildCrew(&si, discuss.Snapshot{})
	if got := crewCell(si.Cell, seats).State; got != model.CellInDefinition {
		t.Errorf("draft with a past run: state %q, want %q", got, model.CellInDefinition)
	}
	accepted := *si.Cell
	accepted.Draft = false
	if got := crewCell(&accepted, seats).State; got != model.CellActive {
		t.Errorf("accepted with a past run: state %q, want %q", got, model.CellActive)
	}

	cmds, err := serviceWith(si).CreateCrew("init-drafted", false)
	if err == nil {
		t.Fatalf("CreateCrew launched a draft: %v", cmds)
	}
	if !strings.Contains(err.Error(), "0001-the-cell-roster") || !strings.Contains(err.Error(), "draft") {
		t.Errorf("the refusal does not name the accept record:\n%v", err)
	}
	if _, statErr := os.Stat(crewDir("init-drafted")); !os.IsNotExist(statErr) {
		t.Errorf("a refused draft created %s", crewDir("init-drafted"))
	}

	// A ruled record is no longer the one waited on; nor is another slug.
	none := si
	none.Decisions = []model.Decision{
		{Number: "0001", Slug: "the-cell-roster", Status: "ruled"},
		{Number: "0002", Slug: "another-question", Status: "proposed"},
	}
	_, err = serviceWith(none).CreateCrew("init-drafted", false)
	if err == nil || !strings.Contains(err.Error(), "no accept record yet") {
		t.Errorf("draft without a proposed record: %v, want \"no accept record yet\"", err)
	}
}

// G4 (i), (ii) (FR-3a–d): draft-cell renders the prompt only for an
// initiative with a goal, agents/people.md and no cell, and otherwise
// refuses naming what is missing; without open it writes nothing.
func TestDraftCellRefusesWithoutGoalOrPeopleOrWithACell(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	mk := func(people, cell bool) string {
		root := t.TempDir()
		if err := os.MkdirAll(filepath.Join(root, "agents"), 0o755); err != nil {
			t.Fatal(err)
		}
		if people {
			if err := os.WriteFile(filepath.Join(root, "agents", "people.md"), []byte("# People\n"), 0o644); err != nil {
				t.Fatal(err)
			}
		}
		if cell {
			if err := os.WriteFile(filepath.Join(root, "agents", "cell.json"), []byte(`{"project":"x"}`), 0o644); err != nil {
				t.Fatal(err)
			}
		}
		return root
	}
	tests := []struct {
		name         string
		goal         string
		people, cell bool
		want         []string // substrings of the refusal; none means it runs
	}{
		{name: "goal and people, no cell", goal: "a goal", people: true},
		{name: "no people.md", goal: "a goal", want: []string{"no agents/people.md"}},
		{name: "no goal", people: true, want: []string{"no goal"}},
		{name: "neither", want: []string{"no goal", "no agents/people.md"}},
		{name: "a cell", goal: "a goal", people: true, cell: true, want: []string{"agents/cell.json exists"}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			si := model.ScannedInitiative{}
			si.ID, si.Path, si.Goal = "init-x", mk(tt.people, tt.cell), tt.goal
			text, err := serviceWith(si).DraftCell("init-x", false)
			if len(tt.want) == 0 {
				if err != nil {
					t.Fatalf("refused: %v", err)
				}
				for _, w := range []string{`"init-x"`, si.Path, "load the persona-agents skill and follow references/drafting.md at this root", "Write only under agents/ and working-on/decisions/"} {
					if !strings.Contains(strings.ToLower(text), strings.ToLower(w)) {
						t.Errorf("the prompt lacks %q:\n%s", w, text)
					}
				}
			} else {
				if err == nil {
					t.Fatalf("ran, want a refusal naming %v", tt.want)
				}
				for _, w := range tt.want {
					if !strings.Contains(err.Error(), w) {
						t.Errorf("the refusal does not say %q: %v", w, err)
					}
				}
			}
			if _, statErr := os.Stat(promptPath("init-x-draft-cell")); !os.IsNotExist(statErr) {
				t.Errorf("DraftCell without open wrote %s", promptPath("init-x-draft-cell"))
			}
		})
	}
}
