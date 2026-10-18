package service

import (
	"os"
	"strings"
	"testing"

	"organizer/internal/review"
)

// G3 / leftovers-41 FR-10, against the httptest mailbox: ask a, the
// review's thread closes (409), ask b. Each mark keeps the thread it was
// asked in, so a reads the old thread and b the new one, while the
// review's thread moves to the new one.
func TestAskReviewKeepsEachMarksThread(t *testing.T) {
	s, root := reviewFixture(t, "build")
	mb := newFakeMailbox(t, s, "rv", "pablo", "fse", "sup81")
	withCell(t, s, root, cellWithFSE, "sup81 runs it (0149 ruled)")
	makeAndWait(t, s, "c1")
	head := gitIn(t, root, "rev-parse", "c1")
	a, b := "go:example.com/rv/p.A", "go:example.com/rv/p.B"

	r1, err := s.AskReview("rv", "c1", "", a, "question", "why 2?")
	if err != nil || r1.Error != "" || r1.Thread != "T1" {
		t.Fatalf("ask a %+v %v", r1, err)
	}
	mb.Lock()
	mb.closed["T1"] = true
	mb.Unlock()
	r2, err := s.AskReview("rv", "c1", "", b, "blocked", "B must stay 1")
	if err != nil || r2.Error != "" || r2.Thread != "T2" {
		t.Fatalf("ask b after the 409 %+v %v", r2, err)
	}

	m, err := s.ReviewMarks("rv", "c1", "")
	if err != nil {
		t.Fatal(err)
	}
	if m.Thread != "T2" {
		t.Errorf("the review's thread %q, want T2", m.Thread)
	}
	got := map[string]string{}
	for _, mk := range m.Marks {
		got[mk.Symbol] = m.ThreadOf(mk)
		if mk.AskedThread == "" {
			t.Errorf("%s has no asked_thread: %+v", mk.Symbol, mk)
		}
	}
	if got[a] != "T1" || got[b] != "T2" {
		t.Errorf("threads asked in %v, want a T1, b T2", got)
	}
	raw, _ := os.ReadFile(review.StatePath("rv", head))
	if !strings.Contains(string(raw), `"asked_thread": "T1"`) || !strings.Contains(string(raw), `"asked_thread": "T2"`) {
		t.Errorf("state.json:\n%s", raw)
	}
}
