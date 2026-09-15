package service

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strings"
	"time"

	"organizer/internal/config"
	"organizer/internal/discuss"
	"organizer/internal/model"
)

// The Cell tab: one initiative's mailbox as the human reads and writes it.
// Reads join the live roster, the threads, and the cards that wait on them;
// writes go through the cell's human seat and nobody else's.

// CellThread is one thread row of the Cell tab: the live head plus the
// cards that name it, by id or by subject convention.
type CellThread struct {
	discuss.Thread
	Cards []string `json:"cards"`
	// Opener and To are the first message's sender and recipient. They are
	// what tells a direct chat from a channel post before anyone replies:
	// participants lists posters only, so a thread opened to one seat that has
	// not answered yet has a single participant and no visible counterpart.
	Opener string `json:"opener"`
	To     string `json:"to"`
	// AskedOfMe counts messages addressed to the human with nothing from the
	// human after them; AskedBy is who sent the latest. This is what "needs
	// me" means: the human's queue is what was escalated or asked of them,
	// not what the reconciler has left undecided.
	AskedOfMe int    `json:"asked_of_me"`
	AskedBy   string `json:"asked_by"`
}

// CellView is one initiative's cell.
type CellView struct {
	ID      string       `json:"id"`
	Title   string       `json:"title"`
	Project string       `json:"project"`
	Human   string       `json:"human"`    // the identity the view reads and posts as
	CanPost bool         `json:"can_post"` // the human holds a token
	Cell    *model.Cell  `json:"cell"`
	Crew    []Seat       `json:"crew"`
	Threads []CellThread `json:"threads"` // live: open, stalled, escalated
	Closed  []CellThread `json:"closed"`  // the archive, newest first
	Waiting []CardWait   `json:"waiting"`
	Discuss string       `json:"discuss"`
	ReadAt  time.Time    `json:"read_at"`
}

// CellThreadView is one thread opened: head, messages, and the cards on it.
type CellThreadView struct {
	discuss.ThreadDetail
	Cards []string `json:"cards"`
	// WakesOnBroadcast is how many seats a reply to everyone would wake:
	// the roster minus the human. Shown before sending, never after.
	WakesOnBroadcast int `json:"wakes_on_broadcast"`
}

// CellPost is what the composer sends.
type CellPost struct {
	ThreadID string `json:"thread_id"`
	ParentID string `json:"parent_id"`
	To       string `json:"to"`
	Kind     string `json:"kind"`
	Subject  string `json:"subject"`
	Body     string `json:"body"`
}

var errNoCell = errors.New("this initiative has no agents/cell.json")

func (s *Service) initiative(id string) (*model.ScannedInitiative, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.state.Local.Initiatives {
		if s.state.Local.Initiatives[i].ID == id {
			cp := s.state.Local.Initiatives[i]
			return &cp, nil
		}
	}
	return nil, fmt.Errorf("initiative %q not found on this machine", id)
}

// humanClient connects as the cell's human seat.
func (s *Service) humanClient(cell *model.Cell) (*discuss.Client, error) {
	if cell.Human == "" {
		return nil, errors.New("cell.json names no human seat to post as")
	}
	return discuss.Connect(discussStateDir(s.Config()), cell.Project, cell.Human)
}

// cardsOnThreads maps thread id to the open card slugs that name it, by the
// `threads:` field or by a subject that starts with the slug.
func cardsOnThreads(si *model.ScannedInitiative, threads []discuss.Thread) map[string][]string {
	out := map[string][]string{}
	byID := map[string]bool{}
	slugs := map[string]bool{}
	for _, c := range si.Cards {
		if c.Archived || c.Status == model.StatusDone {
			continue
		}
		slugs[c.Slug] = true
		for _, tid := range c.Threads {
			out[tid] = append(out[tid], c.Slug)
			byID[tid+"/"+c.Slug] = true
		}
	}
	for _, t := range threads {
		if slug := discuss.SubjectSlug(t.Subject); slug != "" && slugs[slug] && !byID[t.ID+"/"+slug] {
			out[t.ID] = append(out[t.ID], slug)
		}
	}
	return out
}

// needsReconciler is the reconciler's backlog: frozen or answered-and-left.
func needsReconciler(t discuss.Thread) bool {
	return t.Status == "stalled" || t.Undecided
}

// facts is what the feed knows about a thread beyond its head: the opening
// message, and what in it is addressed to the human. Cached per thread and
// refreshed only when the message count moves, since the feed asks every
// ten seconds. The cache has its own lock because the feed builds its view
// with the service lock held.
type facts struct {
	from, to  string
	msgs      int
	askedOfMe int
	askedBy   string
}

func factsOf(d discuss.ThreadDetail, human string) facts {
	f := facts{msgs: len(d.Messages)}
	if len(d.Messages) > 0 {
		f.from, f.to = d.Messages[0].From, d.Messages[0].To
	}
	for _, m := range d.Messages {
		switch {
		case m.From == human:
			f.askedOfMe, f.askedBy = 0, ""
		case human != "" && m.To == human:
			f.askedOfMe++
			f.askedBy = m.From
		}
	}
	return f
}

// threadFacts resolves the facts of every thread, through the cell's human
// identity. Errors leave a thread's facts empty.
func (s *Service) threadFacts(cfg config.Config, cell *model.Cell, threads []discuss.Thread) map[string]facts {
	s.openersMu.Lock()
	if s.openers == nil {
		s.openers = map[string]facts{}
	}
	var missing []string
	for _, t := range threads {
		if f, ok := s.openers[t.ID]; !ok || f.msgs != t.Messages {
			missing = append(missing, t.ID)
		}
	}
	s.openersMu.Unlock()
	if len(missing) > 0 && cell.Human != "" {
		if c, err := discuss.Connect(discussStateDir(cfg), cell.Project, cell.Human); err == nil {
			ctx, cancel := context.WithTimeout(context.Background(), 4*time.Second)
			defer cancel()
			for _, id := range missing {
				d, err := c.Thread(ctx, id)
				if err != nil {
					continue
				}
				f := factsOf(d, cell.Human)
				s.openersMu.Lock()
				s.openers[id] = f
				s.openersMu.Unlock()
			}
		}
	}
	s.openersMu.Lock()
	defer s.openersMu.Unlock()
	out := make(map[string]facts, len(threads))
	for _, t := range threads {
		out[t.ID] = s.openers[t.ID]
	}
	return out
}

// liveThreads is the cell's live threads with their cards, the ones that
// need the human first, then by quiet time; and how many need the human.
func (s *Service) liveThreads(cfg config.Config, si *model.ScannedInitiative, snap discuss.Snapshot) ([]CellThread, int) {
	cards := cardsOnThreads(si, snap.Threads)
	fs := s.threadFacts(cfg, si.Cell, snap.Threads)
	out := make([]CellThread, 0, len(snap.Threads))
	n := 0
	for _, t := range snap.Threads {
		f := fs[t.ID]
		ct := CellThread{Thread: t, Cards: cards[t.ID], Opener: f.from, To: f.to, AskedOfMe: f.askedOfMe, AskedBy: f.askedBy}
		out = append(out, ct)
		if t.Kind != "journal" && needsHuman(ct) {
			n++
		}
	}
	sort.SliceStable(out, func(i, j int) bool {
		a, b := out[i], out[j]
		if na, nb := needsHuman(a), needsHuman(b); na != nb {
			return na
		}
		return a.QuietSeconds < b.QuietSeconds
	})
	return out, n
}

// needsHuman is the human's queue: escalated to them, or asked of them.
func needsHuman(t CellThread) bool {
	return t.Status == "escalated" || t.AskedOfMe > 0
}

// Cell reads one initiative's mailbox.
func (s *Service) Cell(initiativeID string) (CellView, error) {
	si, err := s.initiative(initiativeID)
	if err != nil {
		return CellView{}, err
	}
	if si.Cell == nil {
		return CellView{}, errNoCell
	}
	v := CellView{ID: si.ID, Title: si.Title, Project: si.Cell.Project, Human: si.Cell.Human, Cell: si.Cell, ReadAt: s.now()}
	snap, why := s.cellHealth(si.Cell)
	v.Discuss = why
	v.Crew = buildCrew(si, snap)
	v.Waiting = cardsWaiting(si, snap)
	v.Threads, _ = s.liveThreads(s.Config(), si, snap)
	if why != "" {
		return v, nil
	}
	c, err := s.humanClient(si.Cell)
	if err != nil {
		v.Discuss = err.Error()
		return v, nil
	}
	v.CanPost = true
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	heads, err := c.ThreadsByStatus(ctx, "closed")
	if err != nil {
		v.Discuss = err.Error()
		return v, nil
	}
	closed := make([]discuss.Thread, 0, len(heads))
	for _, h := range heads {
		closed = append(closed, discuss.Thread{ID: h.ID, Subject: h.Subject, Status: h.Status, Kind: "conversation", SinceDecision: h.SinceDecision, AgeSeconds: (s.now().UnixMilli() - h.CreatedAt) / 1000})
	}
	ccards := cardsOnThreads(si, closed)
	for i := len(closed) - 1; i >= 0; i-- {
		v.Closed = append(v.Closed, CellThread{Thread: closed[i], Cards: ccards[closed[i].ID]})
	}
	return v, nil
}

// CellThread opens one thread as the human.
func (s *Service) CellThread(initiativeID, threadID string) (CellThreadView, error) {
	si, err := s.initiative(initiativeID)
	if err != nil {
		return CellThreadView{}, err
	}
	if si.Cell == nil {
		return CellThreadView{}, errNoCell
	}
	c, err := s.humanClient(si.Cell)
	if err != nil {
		return CellThreadView{}, err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	t, err := c.Thread(ctx, threadID)
	if err != nil {
		return CellThreadView{}, err
	}
	head := discuss.Thread{ID: t.ID, Subject: t.Subject, Status: t.Status}
	v := CellThreadView{ThreadDetail: t, Cards: cardsOnThreads(si, []discuss.Thread{head})[t.ID]}
	for _, a := range si.Cell.Agents {
		if a != si.Cell.Human {
			v.WakesOnBroadcast++
		}
	}
	return v, nil
}

// PostToCell writes one message as the human. An empty thread id opens a
// thread; the subject is required then and ignored otherwise.
func (s *Service) PostToCell(initiativeID string, p CellPost) (discuss.PostResult, error) {
	si, err := s.initiative(initiativeID)
	if err != nil {
		return discuss.PostResult{}, err
	}
	if si.Cell == nil {
		return discuss.PostResult{}, errNoCell
	}
	if strings.TrimSpace(p.Body) == "" {
		return discuss.PostResult{}, errors.New("a message needs a body")
	}
	if p.ThreadID == "" && strings.TrimSpace(p.Subject) == "" {
		return discuss.PostResult{}, errors.New("a new thread needs a subject")
	}
	if p.Kind == "" {
		p.Kind = "msg"
	}
	c, err := s.humanClient(si.Cell)
	if err != nil {
		return discuss.PostResult{}, err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return c.Post(ctx, discuss.PostRequest{To: p.To, ThreadID: p.ThreadID, ParentID: p.ParentID, Kind: p.Kind, Subject: strings.TrimSpace(p.Subject), Body: p.Body})
}

// SetCellThreadStatus reopens, escalates or closes a thread as the human.
func (s *Service) SetCellThreadStatus(initiativeID, threadID, status string) error {
	si, err := s.initiative(initiativeID)
	if err != nil {
		return err
	}
	if si.Cell == nil {
		return errNoCell
	}
	c, err := s.humanClient(si.Cell)
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return c.SetStatus(ctx, threadID, status)
}

// SearchCell finds messages in the cell's archive, newest first.
func (s *Service) SearchCell(initiativeID, q string) ([]discuss.Message, error) {
	si, err := s.initiative(initiativeID)
	if err != nil {
		return nil, err
	}
	if si.Cell == nil {
		return nil, errNoCell
	}
	c, err := s.humanClient(si.Cell)
	if err != nil {
		return nil, err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return c.Search(ctx, q, discuss.SearchFilter{Limit: 50})
}

// PickUp records that the human read the cell's mailbox: every message
// addressed to the human seat is marked delivered, so health stops calling
// the human deaf and cards stop blaming the human for silence. Returns how
// many were picked up.
func (s *Service) PickUp(initiativeID string) (int, error) {
	si, err := s.initiative(initiativeID)
	if err != nil {
		return 0, err
	}
	if si.Cell == nil {
		return 0, errNoCell
	}
	c, err := s.humanClient(si.Cell)
	if err != nil {
		return 0, err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return c.PickUp(ctx)
}
