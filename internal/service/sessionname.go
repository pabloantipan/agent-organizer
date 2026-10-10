package service

import (
	"regexp"

	"organizer/internal/model"
)

// A session is named one way wherever memory names it (docs/specs/leftovers-15.md
// FR-1): the memory popover, its `Agents ›` landing, `organizer memory` and
// the warning's body. Its session name, else the seat of the card it works,
// else `<initiative> session`, the pid left to the hover. Never a resume
// UUID: `claude --resume <uuid>` puts one where the scan reads a name, and it
// says nothing to the human; never a bare `pid N`.

// resumeID is a Claude Code conversation id, what `--resume` takes when the
// session was never named.
var resumeID = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)

// sessionName is the agent's real session name, empty when it has none or
// the name is a resume UUID.
func sessionName(a model.Agent) string {
	if resumeID.MatchString(a.Session) {
		return ""
	}
	return a.Session
}

// sessionLabel names one agent's session. seat is the seat of the card the
// agent works, empty when no card answers to it or the card names none.
// An agent outside every initiative with neither reads `unassigned session`.
func sessionLabel(a model.Agent, initiative, seat string) string {
	if n := sessionName(a); n != "" {
		return n
	}
	if seat != "" {
		return seat
	}
	if initiative == "" {
		return "unassigned session"
	}
	return initiative + " session"
}

// cardSeats maps each open card's key (`<initiative>/<slug>`, CardJoin.Key)
// to its seat, for the cards that name one.
func cardSeats(inits []model.ScannedInitiative) map[string]string {
	seats := map[string]string{}
	for _, c := range openCards(inits) {
		if c.Seat != "" {
			seats[c.Initiative+"/"+c.Slug] = c.Seat
		}
	}
	return seats
}

// seatOf is the seat of the card the agent works, empty without one.
func seatOf(a model.Agent, seats map[string]string) string {
	if a.Card == nil {
		return ""
	}
	return seats[a.Card.Key]
}
