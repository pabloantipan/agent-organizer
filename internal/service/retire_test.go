package service

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"organizer/internal/model"
)

func TestWriteCellKeepsOtherFields(t *testing.T) {
	p := filepath.Join(t.TempDir(), "cell.json")
	os.WriteFile(p, []byte(`{"project":"rpex","workdir":"/w","note":"n","agents":["supervisor","w0","reviewer"],"human":"pablo","reconciler":"supervisor","push":true}`), 0o644)
	if err := writeCell(p, []string{"supervisor", "reviewer"}); err != nil {
		t.Fatal(err)
	}
	var doc map[string]any
	b, _ := os.ReadFile(p)
	json.Unmarshal(b, &doc)
	if doc["push"] != true || doc["note"] != "n" || doc["reconciler"] != "supervisor" {
		t.Errorf("other fields lost: %v", doc)
	}
	if got := doc["agents"].([]any); len(got) != 2 || got[1] != "reviewer" {
		t.Errorf("agents %v", got)
	}
}

func TestRetirableReadsCardsAndSessions(t *testing.T) {
	si := &model.ScannedInitiative{}
	si.ID = "rpex"
	si.Cell = &model.Cell{Project: "rpex", Agents: []string{"supervisor", "w1-a", "w1-b", "w2-a", "reviewer"}, Human: "pablo", Reconciler: "supervisor"}
	si.Cards = []model.Card{
		{Slug: "done-a", Seat: "w1-a", Status: "done", Archived: true},
		{Slug: "open-b", Seat: "w2-a", Status: "now"},
	}
	si.Agents = []model.Agent{{Session: "rpex-probe-w1-b", State: model.AgentWorking}}
	got := Retirable(si)
	if len(got) != 2 || got[0] != "w1-a" || got[1] != "reviewer" {
		t.Errorf("retirable %v: w1-a is done, reviewer has no cards; w1-b works, w2-a has an open card, supervisor reconciles", got)
	}
}
