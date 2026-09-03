package merge

import (
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
