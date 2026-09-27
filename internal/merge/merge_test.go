package merge

import (
	"encoding/json"
	"strings"
	"testing"
	"time"

	"organizer/internal/model"
)

func si(id, client string, cards ...model.Card) model.ScannedInitiative {
	s := model.ScannedInitiative{Cards: cards}
	s.ID, s.Client = id, client
	return s
}

func TestBuildLocalWinsAndAlsoOn(t *testing.T) {
	now := time.Date(2026, 9, 2, 12, 0, 0, 0, time.UTC)
	local := model.Snapshot{Machine: "here", Initiatives: []model.ScannedInitiative{
		si("shared", "acme", model.Card{Slug: "l1", Status: "now", Updated: "2026-09-01", Next: "a"}),
	}}
	staleSelf := model.Snapshot{Machine: "here", Initiatives: []model.ScannedInitiative{
		si("shared", "acme", model.Card{Slug: "old", Status: "now", Updated: "2026-01-01"}),
	}}
	other := model.Snapshot{Machine: "there", Initiatives: []model.ScannedInitiative{
		si("shared", "acme", model.Card{Slug: "r1", Status: "next", Updated: "2026-09-02", Next: "b"}),
		si("solo", "personal",
			model.Card{Slug: "r2", Status: "blocked", Updated: "2026-08-01", Next: "c"},
			model.Card{Slug: "r3", Status: "done", Updated: "2026-08-01", Archived: true},
		),
	}}
	b := Build(local, []model.Snapshot{staleSelf, other}, model.Order{}, now)

	if len(b.Machines) != 2 {
		t.Fatalf("machines=%v", b.Machines)
	}
	if got := len(b.Columns["now"]); got != 1 || b.Columns["now"][0].Slug != "l1" {
		t.Errorf("now column=%+v", b.Columns["now"])
	}
	if len(b.Columns["next"]) != 1 || len(b.Columns["blocked"]) != 1 {
		t.Errorf("columns: next=%d blocked=%d", len(b.Columns["next"]), len(b.Columns["blocked"]))
	}
	if len(b.Columns["done"]) != 1 || b.Columns["done"][0].Slug != "r3" {
		t.Errorf("done column: %+v", b.Columns["done"])
	}
	if len(b.Initiatives) != 3 {
		t.Fatalf("initiatives=%d", len(b.Initiatives))
	}
	if b.Initiatives[0].ID != "shared" || !b.Initiatives[0].Local {
		t.Errorf("first should be local shared: %+v", b.Initiatives[0])
	}
	if len(b.Initiatives[0].AlsoOn) != 1 || b.Initiatives[0].AlsoOn[0] != "there" {
		t.Errorf("alsoOn=%v", b.Initiatives[0].AlsoOn)
	}
	for _, bi := range b.Initiatives {
		if bi.ID == "solo" && bi.Done != 1 {
			t.Errorf("solo done=%d", bi.Done)
		}
	}
}

func TestBuildHonoursOrder(t *testing.T) {
	now := time.Date(2026, 9, 2, 12, 0, 0, 0, time.UTC)
	local := model.Snapshot{Machine: "here", Initiatives: []model.ScannedInitiative{
		si("a", "x", model.Card{Slug: "a1", Status: "now", Updated: "2026-09-02"}, model.Card{Slug: "a2", Status: "now", Updated: "2026-09-01"}),
		si("b", "x", model.Card{Slug: "b1", Status: "now", Updated: "2026-09-02"}),
		si("c", "x", model.Card{Slug: "c1", Status: "now", Updated: "2026-09-02"}),
	}}
	order := model.Order{Initiatives: []string{"c", "a"}, Cards: map[string][]string{"a": {"a2", "a1"}}}
	b := Build(local, nil, order, now)
	var ids []string
	for _, i := range b.Initiatives {
		ids = append(ids, i.ID)
	}
	if got := ids[0] + ids[1] + ids[2]; got != "cab" {
		t.Errorf("initiative order %v", ids)
	}
	var slugs []string
	for _, c := range b.Columns["now"] {
		slugs = append(slugs, c.Slug)
	}
	want := []string{"c1", "a2", "a1", "b1"}
	for i := range want {
		if slugs[i] != want[i] {
			t.Fatalf("card order %v want %v", slugs, want)
		}
	}
	ApplyOrder(&local, order)
	if local.Initiatives[0].ID != "c" || local.Initiatives[1].Cards[0].Slug != "a2" {
		t.Errorf("ApplyOrder: %s %s", local.Initiatives[0].ID, local.Initiatives[1].Cards[0].Slug)
	}
}

// FR-1 to FR-3: the goal, the measure, the specs and the stages of the scan
// reach the board initiative, with the current stage still marked. G1, the
// merge half.
func TestBuildCarriesGoalMeasureSpecsScopeAndStages(t *testing.T) {
	now := time.Date(2026, 9, 2, 12, 0, 0, 0, time.UTC)
	withGoal := si("goals", "acme", model.Card{Slug: "c1", Status: "now", Updated: "2026-09-01", Next: "a", Stage: "two"})
	withGoal.Goal = "acme signs off on one run"
	withGoal.Measure = "no manual step is left"
	withGoal.Specs = []string{"specs/", "docs/one.md"}
	withGoal.Scope = model.Scope{In: []string{"the scan", "the board"}, Out: []string{"identity"}}
	withGoal.Stages = []model.Stage{
		{ID: "one", Title: "First", Phase: "discovery", Done: "2026-08-01", Exit: []model.ExitItem{{Text: "done", Met: "2026-08-01"}}},
		{ID: "two", Title: "Second", Phase: "building", Current: true, Gates: []string{"0004"}, Appetite: "two waves"},
	}
	bare := si("bare", "personal", model.Card{Slug: "c2", Status: "next", Updated: "2026-09-01", Next: "b"})

	b := Build(model.Snapshot{Machine: "here", Initiatives: []model.ScannedInitiative{withGoal, bare}}, nil, model.Order{}, now)

	byID := map[string]BoardInitiative{}
	for _, bi := range b.Initiatives {
		byID[bi.ID] = bi
	}
	got := byID["goals"]
	if got.Goal != "acme signs off on one run" || got.Measure != "no manual step is left" {
		t.Errorf("goal=%q measure=%q", got.Goal, got.Measure)
	}
	if len(got.Specs) != 2 || got.Specs[1] != "docs/one.md" {
		t.Errorf("specs=%v", got.Specs)
	}
	if len(got.Stages) != 2 || got.Stages[1].Appetite != "two waves" || got.Stages[0].Exit[0].Met != "2026-08-01" {
		t.Fatalf("stages=%+v", got.Stages)
	}
	cur, ok := model.CurrentStage(got.Stages)
	if !ok || cur.ID != "two" || !got.Stages[1].Current {
		t.Errorf("current stage=%+v ok=%v", cur, ok)
	}
	if got.Stages[0].Phase != "discovery" || got.Stages[1].Phase != "building" {
		t.Errorf("phases=%q,%q", got.Stages[0].Phase, got.Stages[1].Phase)
	}
	if strings.Join(got.Scope.In, ",") != "the scan,the board" || strings.Join(got.Scope.Out, ",") != "identity" {
		t.Errorf("scope=%+v", got.Scope)
	}
	// No scope is two empty lists, never null, so the header can say
	// "no scope yet" without a nil check.
	if bare := byID["bare"]; bare.Scope.In == nil || bare.Scope.Out == nil || len(bare.Scope.In)+len(bare.Scope.Out) != 0 {
		t.Errorf("bare scope=%#v", bare.Scope)
	}
	if j, _ := json.Marshal(byID["bare"].Scope); string(j) != `{"in":[],"out":[]}` {
		t.Errorf("bare scope json=%s", j)
	}
	// An initiative with no goal and no roadmap carries neither, and that is
	// not an error anywhere on the board.
	if bare := byID["bare"]; bare.Goal != "" || len(bare.Stages) != 0 {
		t.Errorf("bare initiative=%+v", bare.Initiative)
	}
	// The card's stage rides to the board card.
	if c := b.Columns["now"]; len(c) != 1 || c[0].Stage != "two" {
		t.Errorf("now column=%+v", c)
	}
}

// FR-11, G7, the board half: the FSE's activity rides from the scan to the
// board, and an initiative without an FSE carries an empty one.
func TestBuildCarriesFSEActivity(t *testing.T) {
	now := time.Date(2026, 9, 2, 12, 0, 0, 0, time.UTC)
	withFSE := si("fse", "acme", model.Card{Slug: "c1", Status: "now", Updated: "2026-09-01", Next: "a"})
	withFSE.FSE = model.FSEActivity{
		Path:        "/tmp/init/docs/bitacora/fse_bitacora.md",
		HandOff:     "HAND-OFF — 2026-09-02, the spec is out",
		HandOffBody: "- **Waiting on Pablo:** the intake.",
		Commits: []model.FSECommit{
			{SHA: "aaa1111", At: "2026-09-02T09:02:00Z", Subject: "docs(fse): signed 2"},
			{SHA: "bbb2222", At: "2026-09-02T09:01:00Z", Subject: "docs(fse): signed 1"},
		},
	}
	bare := si("bare", "acme", model.Card{Slug: "c2", Status: "now", Updated: "2026-09-01", Next: "b"})
	b := Build(model.Snapshot{Machine: "here", Initiatives: []model.ScannedInitiative{withFSE, bare}}, nil, model.Order{}, now)

	byID := map[string]BoardInitiative{}
	for _, bi := range b.Initiatives {
		byID[bi.ID] = bi
	}
	got := byID["fse"].FSE
	if got.HandOff != withFSE.FSE.HandOff || got.HandOffBody != withFSE.FSE.HandOffBody || got.Path != withFSE.FSE.Path {
		t.Errorf("hand-off=%+v", got)
	}
	if len(got.Commits) != 2 || got.Commits[0].Subject != "docs(fse): signed 2" {
		t.Fatalf("commits=%+v", got.Commits)
	}
	if got.Empty() {
		t.Error("activity with a hand-off and commits reads as empty")
	}
	if !byID["bare"].FSE.Empty() {
		t.Errorf("initiative with no FSE: %+v", byID["bare"].FSE)
	}
}
