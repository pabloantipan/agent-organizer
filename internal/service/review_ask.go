package service

import (
	"fmt"
	"regexp"
	"slices"
	"strings"

	"organizer/internal/model"
	"organizer/internal/review"
)

// Asking from a mark (review-map v3 FR-25, FR-26): a question or a block
// on a changed symbol goes to the one who can answer it, as a message in
// the review's one thread, posted as the cell's human. Nothing is posted
// without the reader's press of Ask.

// Why words of an addressee, FR-25's.
const (
	WhyRunsCard   = "runs this card"
	WhyFSE        = "the initiative's FSE"
	WhyReconciler = "the reconciler"
	WhyNoCell     = "no cell"
	WhyNoSeat     = "no FSE or reconciler in the cell"
)

// ReviewAddressee is who a mark on the card is asked of, and why; Seat is
// "" when nobody can be, and Why then says what is missing.
type ReviewAddressee struct {
	Seat string `json:"seat"`
	Why  string `json:"why"`
}

// ReviewAsk is what an ask did. Marks is the head's marks after it, saved
// whatever the post did. Thread and Asked are the review's thread and the
// message posted; Error is the post's first error line when it failed, the
// mark then saved without asked.
type ReviewAsk struct {
	Marks  ReviewMarks     `json:"marks"`
	To     ReviewAddressee `json:"to"`
	Thread string          `json:"thread"`
	Asked  string          `json:"asked"`
	Error  string          `json:"error"`
}

var supervisorRe = regexp.MustCompile(`^sup[0-9]+\b`)

// ReviewAddressee is FR-25: the supervisor the card's next action starts
// with, when discuss health lists that seat; else the cell's fse; else its
// reconciler; else nobody. Another machine's card is refused.
func (s *Service) ReviewAddressee(initiativeID, slug string) (ReviewAddressee, error) {
	si, err := s.localCard(initiativeID, slug)
	if err != nil {
		return ReviewAddressee{}, err
	}
	return s.addresseeOf(si, slug), nil
}

func (s *Service) addresseeOf(si *model.ScannedInitiative, slug string) ReviewAddressee {
	if si.Cell == nil {
		return ReviewAddressee{Why: WhyNoCell}
	}
	for _, c := range si.Cards {
		if c.Slug != slug {
			continue
		}
		if sup := supervisorRe.FindString(strings.TrimSpace(c.Next)); sup != "" {
			snap, _ := s.cellHealth(si.Cell)
			if _, ok := snap.Agents[sup]; ok {
				return ReviewAddressee{Seat: sup, Why: WhyRunsCard}
			}
		}
	}
	if slices.Contains(si.Cell.Agents, "fse") {
		return ReviewAddressee{Seat: "fse", Why: WhyFSE}
	}
	if si.Cell.Reconciler != "" {
		return ReviewAddressee{Seat: si.Cell.Reconciler, Why: WhyReconciler}
	}
	return ReviewAddressee{Why: WhyNoSeat}
}

// AskReview is FR-26: mark symbol of the card's map at head ("" the current
// head) question or blocked with note, then ask the addressee in the
// review's thread: the first ask opens `<slug>: review at <short head>`,
// every later one is a message in it, and a thread refused as closed is
// replaced once. A reviewed mark, an empty note, nobody to ask and another
// machine's card are refused before anything is written. A post that fails
// leaves the mark saved without asked and returns its first error line in
// Error, not as an error.
func (s *Service) AskReview(initiativeID, slug, head, symbol, state, note string) (ReviewAsk, error) {
	si, err := s.localCard(initiativeID, slug)
	if err != nil {
		return ReviewAsk{}, err
	}
	if state != "question" && state != "blocked" {
		return ReviewAsk{}, fmt.Errorf("only a question or a block is asked, not %q", state)
	}
	if strings.TrimSpace(note) == "" {
		return ReviewAsk{}, fmt.Errorf("a %s needs a note to ask", state)
	}
	to := s.addresseeOf(si, slug)
	if to.Seat == "" {
		return ReviewAsk{}, fmt.Errorf("no one to ask here: %s", to.Why)
	}
	rm, _, err := s.cardMap(initiativeID, slug, head)
	if err != nil {
		return ReviewAsk{}, err
	}
	marks, err := s.MarkReview(initiativeID, slug, rm.Head, symbol, state, note)
	if err != nil {
		return ReviewAsk{}, err
	}
	out := ReviewAsk{Marks: marks, To: to, Thread: marks.Thread}
	var node review.Node
	for _, n := range rm.Nodes {
		if n.ID == symbol {
			node = n
		}
	}
	post := CellPost{ThreadID: marks.Thread, To: to.Seat, Kind: "question", Body: askBody(node, state, note, to.Seat)}
	if post.ThreadID == "" {
		post.Subject = reviewSubject(slug, rm.Head)
	}
	res, err := s.PostToCell(initiativeID, post)
	if err != nil && post.ThreadID != "" && strings.Contains(err.Error(), "(status closed)") {
		post.ThreadID, post.Subject = "", reviewSubject(slug, rm.Head)
		res, err = s.PostToCell(initiativeID, post)
	}
	if err != nil {
		out.Error = firstErrorLine(err.Error(), err)
		return out, nil
	}
	marks, err = review.SetAsked(initiativeID, rm.Head, symbol, res.ThreadID, res.ID, note)
	if err != nil {
		out.Error = firstErrorLine(err.Error(), err)
		return out, nil
	}
	out.Marks, out.Thread, out.Asked = marks, res.ThreadID, res.ID
	return out, nil
}

// reviewSubject is the review's thread subject; it starts with the slug, so
// the card names the thread by the subject convention.
func reviewSubject(slug, head string) string {
	return slug + ": review at " + shortSha(head)
}

// askBody is `<symbol> · <file>:<start>-<end> · <state>`, the note, and the
// next action. A deleted symbol has no head range and names its file only.
func askBody(n review.Node, state, note, seat string) string {
	where := n.File
	if n.RangeHead != nil {
		where = fmt.Sprintf("%s:%d-%d", n.File, n.RangeHead[0], n.RangeHead[1])
	}
	return fmt.Sprintf("%s · %s · %s\n%s\nNext action: %s answers in this thread", n.ID, where, state, strings.TrimSpace(note), seat)
}
