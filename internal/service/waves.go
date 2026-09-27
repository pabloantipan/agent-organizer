package service

import (
	"regexp"
	"sort"
	"strconv"
	"strings"

	"organizer/internal/model"
)

// A wave is the cards one supervisor launched together (FR-9 of
// docs/specs/redesign.md). It is not a field on anything: the human writes
// `seat: wave<N>-<name>` on each card, and the wave is what those seats have
// in common. Grouping by seat and not by session is deliberate — a session
// dies, gets resumed under another name, or never starts, and the wave is
// still the same set of cards.
//
// Everything here is derived from the cached snapshot the agents feed already
// holds: the cards, and the agent-card join of cardjoin.go. It reads no disk
// and takes no lock, so it can ride the 10 s feed.

// waveSeat is `wave<N>-<name>`, the seat form FR-9 groups by. The name is the
// seat's, not the wave's: wave 1 is every card seated wave1-something.
var waveSeat = regexp.MustCompile(`^[Ww][Aa][Vv][Ee](\d+)-(.+)$`)

// Wave is one wave of cards with what a wave strip shows: its cards in the
// four groups, its gate rows passed out of the total, the input tokens its
// agents have spent, and the supervisor running it.
type Wave struct {
	N     int    `json:"n"`
	Label string `json:"label"` // "wave 1"
	// The four groups of FR-9, each in card order. A card is in exactly one.
	Building []WaveCard `json:"building"`
	InReview []WaveCard `json:"in_review"`
	Queued   []WaveCard `json:"queued"`
	Done     []WaveCard `json:"done"`
	// GatePassed out of GateTotal, summed over the wave's cards. HasGate is
	// false when no card of the wave has a `## Gate` heading, which A2 shows
	// as "gate —" rather than as 0 of 0.
	GatePassed int  `json:"gate_passed"`
	GateTotal  int  `json:"gate_total"`
	HasGate    bool `json:"has_gate"`
	// InputTokens is what the wave has cost so far in context: the live
	// statusline figure of each card's agent, summed. A card nobody is on
	// contributes nothing; the archive's total is FR-10's, not this.
	InputTokens int `json:"input_tokens"`
	// Supervisor is the live session named by A1, empty when there is none.
	Supervisor string `json:"supervisor"`
}

// WaveCard is one card of a wave: enough to draw its line without walking
// back to the board, the same bargain model.CardJoin makes.
type WaveCard struct {
	Slug   string `json:"slug"`
	Title  string `json:"title"`
	Seat   string `json:"seat"`
	Status string `json:"status"`
	Next   string `json:"next"`
	// Group is the one of FR-9's four this card fell in, so a view that has
	// the card alone still knows.
	Group      string `json:"group"`
	GatePassed int    `json:"gate_passed"`
	GateTotal  int    `json:"gate_total"`
	HasGate    bool   `json:"has_gate"`
	// InputTokens is the card's agent's, zero when nobody is on it.
	InputTokens int `json:"input_tokens"`
	// Agent is the join of cardjoin.go, nil when no live agent answers to
	// this card — "nobody on it".
	Agent *model.CardJoin `json:"agent"`
}

// The four groups.
const (
	WaveBuilding = "building"
	WaveInReview = "in_review"
	WaveQueued   = "queued"
	WaveDone     = "done"
)

// waves groups one initiative's cards into its waves, lowest wave first.
// Nothing is a wave until a card says so, so an initiative whose cards carry
// no `wave<N>-` seat gets no waves and no empty strip.
func waves(si *model.ScannedInitiative) []Wave {
	byN := map[int]*Wave{}
	joins := waveJoins(si.Agents)
	for _, c := range si.Cards {
		n, ok := waveOf(c.Seat)
		if !ok {
			continue
		}
		w := byN[n]
		if w == nil {
			w = &Wave{N: n, Label: "wave " + strconv.Itoa(n), Supervisor: supervisorOf(si, n)}
			byN[n] = w
		}
		w.add(waveCard(c, joins[c.Slug]))
	}
	out := make([]Wave, 0, len(byN))
	for _, w := range byN {
		out = append(out, *w)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].N < out[j].N })
	return out
}

// waveOf reads the wave number out of a seat. Anything that is not
// `wave<N>-<name>` is not in a wave: a standing seat like `andrea` or `fse`
// belongs to the cell, not to a wave.
func waveOf(seat string) (int, bool) {
	m := waveSeat.FindStringSubmatch(strings.TrimSpace(seat))
	if m == nil {
		return 0, false
	}
	n, err := strconv.Atoi(m[1])
	if err != nil || n < 0 {
		return 0, false
	}
	return n, true
}

// waveCard is one card with its group, its gate rows and its agent.
func waveCard(c model.Card, join *model.CardJoin) WaveCard {
	wc := WaveCard{
		Slug: c.Slug, Title: c.Title, Seat: c.Seat,
		Status: c.Status, Next: c.Next, Agent: join,
	}
	wc.GatePassed, wc.GateTotal, wc.HasGate = gateRows(c.Body)
	if join != nil {
		wc.InputTokens = join.InputTokens
	}
	wc.Group = waveGroup(c, join)
	return wc
}

// waveGroup is which of FR-9's four a card is in. The FR names the four but
// not what to do when a card answers to two, so they are tried in the order
// that tells the truth about the card:
//
//   - done, because a card in done/ or with status done is over whatever else
//     is still running;
//   - in review, because `next: review: …` is the human saying the building
//     stopped — a reviewer's session joined to the card must not read as
//     "still being built";
//   - building, an agent joined;
//   - queued, nobody on it yet.
func waveGroup(c model.Card, join *model.CardJoin) string {
	switch {
	case c.Archived || c.Status == model.StatusDone:
		return WaveDone
	case inReview(c.Next):
		return WaveInReview
	case join != nil:
		return WaveBuilding
	default:
		return WaveQueued
	}
}

// inReview is FR-9's test on the next action: it starts with `review:`.
func inReview(next string) bool {
	return strings.HasPrefix(strings.ToLower(strings.TrimSpace(next)), "review:")
}

// add files the card under its group and rolls its numbers into the wave.
func (w *Wave) add(c WaveCard) {
	switch c.Group {
	case WaveDone:
		w.Done = append(w.Done, c)
	case WaveInReview:
		w.InReview = append(w.InReview, c)
	case WaveBuilding:
		w.Building = append(w.Building, c)
	default:
		w.Queued = append(w.Queued, c)
	}
	w.GatePassed += c.GatePassed
	w.GateTotal += c.GateTotal
	w.HasGate = w.HasGate || c.HasGate
	w.InputTokens += c.InputTokens
}

// gateRows counts the checkboxes under the card body's `## Gate` heading (A2):
// `- [x]` passed, `- [ ]` open. The section ends at the next heading. No such
// heading means no count at all — the view says "gate —", which is honest
// about a card whose gate is a sentence and not a list.
func gateRows(body string) (passed, total int, has bool) {
	in := false
	for _, line := range strings.Split(body, "\n") {
		t := strings.TrimSpace(line)
		if strings.HasPrefix(t, "#") {
			in = isGateHeading(t)
			has = has || in
			continue
		}
		if !in {
			continue
		}
		if box, ok := checkbox(t); ok {
			total++
			if box {
				passed++
			}
		}
	}
	return passed, total, has
}

// isGateHeading is a markdown heading whose text is "Gate", at any level: the
// card template writes `## Gate`, and a card that nests it deeper still means
// the same section.
func isGateHeading(line string) bool {
	text := strings.TrimSpace(strings.TrimLeft(line, "#"))
	return strings.EqualFold(text, "gate")
}

// checkbox reads a markdown task line, returning whether it is ticked.
func checkbox(line string) (checked, ok bool) {
	for _, bullet := range []string{"- ", "* ", "+ "} {
		if !strings.HasPrefix(line, bullet) {
			continue
		}
		rest := strings.TrimLeft(line[len(bullet):], " ")
		switch {
		case strings.HasPrefix(rest, "[ ]"):
			return false, true
		case strings.HasPrefix(rest, "[x]"), strings.HasPrefix(rest, "[X]"):
			return true, true
		}
	}
	return false, false
}

// waveJoins indexes the initiative's agent-card joins by card slug. Only live
// agents carry one (cardjoin.go), so a card here is a card somebody is on
// right now. Two agents on one card is not an error — a builder and the
// supervisor looking over its shoulder — so the working one is shown and the
// card's tokens are counted once, from it.
func waveJoins(agents []model.Agent) map[string]*model.CardJoin {
	out := map[string]*model.CardJoin{}
	for i := range agents {
		j := agents[i].Card
		if j == nil {
			continue
		}
		prev, ok := out[j.Slug]
		if !ok || (prev.State != model.AgentWorking && j.State == model.AgentWorking) {
			out[j.Slug] = j
		}
	}
	return out
}

// supervisorOf is A1: wave N's supervisor is the live session
// `<family>-probe-sup<N>`, and there is no other evidence of one. The family
// is resolved the way scan.AssignAgents resolves it — the initiative's id, or
// the cell's project, since a crew session is named after the cell.
func supervisorOf(si *model.ScannedInitiative, n int) string {
	suffix := "-probe-sup" + strconv.Itoa(n)
	names := []string{si.ID + suffix}
	if si.Cell != nil && si.Cell.Project != "" {
		names = append(names, si.Cell.Project+suffix)
	}
	for _, a := range si.Agents {
		if !a.Live() {
			continue
		}
		for _, want := range names {
			if strings.EqualFold(a.Session, want) {
				return a.Session
			}
		}
	}
	return ""
}
