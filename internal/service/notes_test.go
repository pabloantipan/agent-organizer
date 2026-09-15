package service

import (
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
)

func TestNotesAreACommentFeed(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	now := time.Date(2026, 9, 6, 10, 0, 0, 0, time.UTC)
	s := NewWith(config.Config{Machine: "lodestar"}, cache.State{}, func() time.Time { return now })
	n, err := s.AddNote("camp", "readiness", "  first  ")
	if err != nil || n.Text != "first" || n.By == "" || n.ID == "" { // By is the account email when the keychain holds a session, else the machine
		t.Fatalf("add %+v %v", n, err)
	}
	now = now.Add(time.Minute)
	n2, _ := s.AddNote("camp", "readiness", "second")
	if n2.ID == n.ID {
		t.Error("ids must differ")
	}
	if err := s.EditNote("camp", "readiness", n.ID, "first, edited"); err != nil {
		t.Fatal(err)
	}
	if got := s.Order().Notes["camp/readiness"]; len(got) != 2 || got[0].Text != "first, edited" {
		t.Errorf("edit %+v", got)
	}
	if err := s.EditNote("camp", "readiness", n2.ID, ""); err != nil {
		t.Fatal(err)
	}
	if got := s.Order().Notes["camp/readiness"]; len(got) != 1 {
		t.Errorf("empty text deletes: %+v", got)
	}
	if err := s.EditNote("camp", "readiness", "nope", "x"); err == nil {
		t.Error("unknown id must fail")
	}
	if _, err := s.AddNote("camp", "readiness", "   "); err == nil {
		t.Error("blank comment must fail")
	}
}
