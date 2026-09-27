package service

import (
	"strconv"
	"strings"
	"time"

	"organizer/internal/model"
	"organizer/internal/session"
)

// Which card is this agent on? The agents feed answers it once, here, so the
// rail, Work, the wave strip and the Agents tab all read the same join
// (FR-6 to FR-8 of docs/specs/redesign.md).
//
// The keys, in order:
//  1. a cwd path element equal to the card's branch or slug — the .wt/
//     convention the supervise skill launches builders with;
//  2. the checkout's branch equal to the card's branch;
//  3. the card's seat equal to the agent's persona or session.
//
// Keys 1 and 2 are session.MatchCard's, called as it stands so the archive in
// runs.jsonl and the live feed can never disagree about a card. Key 3 is the
// one the archive has no use for: a crew seat's session may hold no directory
// of its own, and the seat on the card is the human saying who builds it.
//
// Two cards answering is no card, at every key (FR-7): a cost or an agent
// under the wrong card is worse than a card with nobody on it. Give the card
// a branch or a worktree and the ambiguity goes away.

// openCardRef is one open card as the join sees it: what MatchCard needs, plus
// the seat key and the title the card line shows.
type openCardRef struct {
	session.CardRef
	Seat  string
	Title string
}

// openCards collects every open card of every initiative. Archived and done
// cards are left out: an agent is joined to work in flight, and a finished
// card keeps its slug forever.
func openCards(inits []model.ScannedInitiative) []openCardRef {
	var out []openCardRef
	for _, si := range inits {
		for _, c := range si.Cards {
			if c.Archived || c.Status == model.StatusDone {
				continue
			}
			out = append(out, openCardRef{
				CardRef: session.CardRef{
					Initiative: si.ID, Slug: c.Slug, Branch: c.Branch, Root: si.Path,
				},
				Seat:  c.Seat,
				Title: c.Title,
			})
		}
	}
	return out
}

// joinAgentCards stamps each live agent of each initiative with the one open
// card it works, or leaves it nil. It runs on the regrouped snapshot, after
// scan.AssignAgents, and rewrites the join every sample: the agents are built
// fresh each time, so there is no stale card to clear.
//
// branchOf answers "which branch is this directory on" without the service
// lock (branchIn); nil means keys 1 and 3 only. now is the sample time, from
// which an agent's start time is read back.
func joinAgentCards(inits []model.ScannedInitiative, branchOf func(string) string, now time.Time) {
	cards := openCards(inits)
	if len(cards) == 0 {
		return
	}
	for i := range inits {
		for j := range inits[i].Agents {
			inits[i].Agents[j].Card = joinAgent(inits[i].Agents[j], cards, branchOf, now)
		}
	}
}

// joinAgent is the join for one agent. Only a live agent is joined: an exited
// layout or a shell holds no conversation, so it works no card.
func joinAgent(a model.Agent, cards []openCardRef, branchOf func(string) string, now time.Time) *model.CardJoin {
	if !a.Live() {
		return nil
	}
	c, ok := matchByPlace(a, cards, branchOf)
	if !ok {
		c, ok = matchBySeat(a, cards)
	}
	if !ok {
		return nil
	}
	j := &model.CardJoin{
		Initiative: c.Initiative,
		Slug:       c.Slug,
		Title:      c.Title,
		Key:        c.Initiative + "/" + c.Slug,
		State:      a.State,
		StartedAt:  agentStart(a.Uptime, now),
	}
	if a.Context != nil {
		j.UsedPercent, j.InputTokens = a.Context.UsedPercent, a.Context.InputTokens
	}
	return j
}

// matchByPlace is keys 1 and 2: where the agent is working. session.MatchCard
// picks the initiative by longest root, then the worktree path element, then
// the branch, and refuses an ambiguous answer — all three are its rules, not
// ours. An agent with no directory (a session placed by its probe family)
// answers to nothing here and falls through to the seat.
func matchByPlace(a model.Agent, cards []openCardRef, branchOf func(string) string) (openCardRef, bool) {
	if a.Dir == "" {
		return openCardRef{}, false
	}
	branch := ""
	if branchOf != nil {
		branch = branchOf(a.Dir)
	}
	refs := make([]session.CardRef, len(cards))
	for i, c := range cards {
		refs[i] = c.CardRef
	}
	ref, ok := session.MatchCard(a.Dir, branch, refs)
	if !ok {
		return openCardRef{}, false
	}
	for _, c := range cards {
		if c.Initiative == ref.Initiative && c.Slug == ref.Slug {
			return c, true
		}
	}
	return openCardRef{}, false
}

// matchBySeat is key 3: the card's seat against the agent's persona or its
// session name — the two names the process table gives (FR-6). Two cards on one seat is no card, the same rule as the place
// keys — a seat that builds two cards at once is a card file to fix, not a
// guess to make.
func matchBySeat(a model.Agent, cards []openCardRef) (openCardRef, bool) {
	var hit openCardRef
	n := 0
	for _, c := range cards {
		if c.Seat == "" {
			continue
		}
		if strings.EqualFold(c.Seat, a.Persona) || strings.EqualFold(c.Seat, a.Session) {
			hit, n = c, n+1
		}
	}
	if n != 1 {
		return openCardRef{}, false
	}
	return hit, true
}

// agentStart is when the agent's process started: the sample time less ps's
// elapsed time, which is the only start the feed has — the statusline writes
// none. Zero when there is no elapsed time to read, which is what a session
// with no process of its own looks like.
func agentStart(uptime string, now time.Time) time.Time {
	d, ok := parseETime(uptime)
	if !ok {
		return time.Time{}
	}
	return now.Add(-d)
}

// parseETime reads ps's etime column: [[dd-]hh:]mm:ss.
func parseETime(s string) (time.Duration, bool) {
	s = strings.TrimSpace(s)
	if s == "" {
		return 0, false
	}
	days := 0
	if i := strings.IndexByte(s, '-'); i >= 0 {
		d, err := strconv.Atoi(s[:i])
		if err != nil || d < 0 {
			return 0, false
		}
		days, s = d, s[i+1:]
	}
	parts := strings.Split(s, ":")
	if len(parts) < 2 || len(parts) > 3 {
		return 0, false
	}
	units := []time.Duration{time.Hour, time.Minute, time.Second}
	units = units[len(units)-len(parts):]
	total := time.Duration(days) * 24 * time.Hour
	for i, p := range parts {
		n, err := strconv.Atoi(p)
		if err != nil || n < 0 {
			return 0, false
		}
		total += time.Duration(n) * units[i]
	}
	return total, true
}
