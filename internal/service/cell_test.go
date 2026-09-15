package service

import (
	"testing"

	"organizer/internal/discuss"
	"organizer/internal/model"
)

func TestCardsOnThreadsByIdAndSubject(t *testing.T) {
	si := &model.ScannedInitiative{}
	si.Cards = []model.Card{
		{Slug: "readiness-endpoint", Status: "next", Threads: []string{"t1"}},
		{Slug: "paper-form", Status: "now"},
		{Slug: "old", Status: "done", Archived: true, Threads: []string{"t2"}},
	}
	threads := []discuss.Thread{
		{ID: "t1", Subject: "readiness-endpoint: frozen?"},
		{ID: "t2", Subject: "old: gone"},
		{ID: "t3", Subject: "paper-form — five open calls"},
		{ID: "t4", Subject: "nothing"},
	}
	got := cardsOnThreads(si, threads)
	if len(got["t1"]) != 1 || got["t1"][0] != "readiness-endpoint" {
		t.Errorf("t1 named once, not twice: %v", got["t1"])
	}
	if len(got["t2"]) != 0 {
		t.Errorf("done cards do not link: %v", got["t2"])
	}
	if len(got["t3"]) != 1 || got["t3"][0] != "paper-form" {
		t.Errorf("subject convention: %v", got["t3"])
	}
	if _, ok := got["t4"]; ok {
		t.Error("t4 links nothing")
	}
}

func TestFactsOfCountsWhatIsAskedOfTheHuman(t *testing.T) {
	d := discuss.ThreadDetail{Messages: []discuss.Message{
		{From: "po_andrea", To: "tech_lead_nicolas", Kind: "question"},
		{From: "tech_lead_nicolas", To: "pablo", Kind: "question"},
		{From: "po_andrea", To: "pablo", Kind: "msg"},
	}}
	f := factsOf(d, "pablo")
	if f.from != "po_andrea" || f.to != "tech_lead_nicolas" || f.msgs != 3 {
		t.Errorf("opening %+v", f)
	}
	if f.askedOfMe != 2 || f.askedBy != "po_andrea" {
		t.Errorf("asked %+v", f)
	}
	d.Messages = append(d.Messages, discuss.Message{From: "pablo", To: "po_andrea", Kind: "answer"})
	if f := factsOf(d, "pablo"); f.askedOfMe != 0 {
		t.Errorf("the human's reply clears the queue: %+v", f)
	}
	if f := factsOf(d, ""); f.askedOfMe != 0 {
		t.Error("no human seat, nothing asked")
	}
}
