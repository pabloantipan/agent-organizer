package usage

import (
	"fmt"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// Roles, as the Usage view names them. NotAttributed is the row for what no
// rule claimed; its Reason says which rule failed.
const (
	RoleSupervisor = "supervisor"
	RoleBuilder    = "builder"
	RoleReviewer   = "reviewer"
	RoleUIReviewer = "ui reviewer"
	RoleFSE        = "fse"
	RolePersona    = "persona"
	RolePair       = "pair"
	RoleSession    = "session"
	NotAttributed  = "Not attributed"
)

// Initiative is what attribution needs to know about one initiative root:
// where it is, its cards (open and done) and its cell's seats.
type Initiative struct {
	ID    string
	Root  string
	Cards []Card
	Seats []string // agents/cell.json's roster, persona seats
}

// Card is one working-on card as attribution reads it.
type Card struct {
	Slug  string
	Title string
	Seat  string // the card's seat: field
	Body  string // the card's markdown, where its supervisor is named
}

// Seen is what the transcript and the records said about a session.
type Seen struct {
	Name    string // agent-name / custom-title from the transcript
	Cwd     string
	Pair    string // a pair skill the transcript loaded
	Session string // AGENT_SESSION from a statusline record
	Persona string // AGENT_NAME from a statusline record
}

// pairNames are pair sessions recognised by name (Hephaistos is also
// Hefesto, Aglaea also Aglaya).
var pairNames = map[string]bool{"hephaistos": true, "hefesto": true, "aglaea": true, "aglaya": true, "daedalus": true, "ariadna": true}

var (
	supRe       = regexp.MustCompile(`^sup\d+$`)
	roleSegRe   = regexp.MustCompile(`^(build|review|ui|reader|x)\d*$`)
	builderRe   = regexp.MustCompile(`-build\d*$`)
	reviewerRe  = regexp.MustCompile(`(-review\d*$|-review-|-reader\d*$|-x\d+$)`)
	uiRe        = regexp.MustCompile(`-ui\d*$`)
	probeNameRe = regexp.MustCompile(`^(?:[a-z0-9-]+-)?probe-(.+)$`)
)

// seatOf is the seat inside a probe session name: organizer-probe-rlf-build
// is rlf-build, probe-hefesto is hefesto. A name that is not probe's is its
// own seat.
func seatOf(name string) string {
	name = strings.ToLower(strings.TrimSpace(name))
	if m := probeNameRe.FindStringSubmatch(name); m != nil {
		return m[1]
	}
	return name
}

// Attribute names a session's initiative, role and task. It is called once
// per session, when the ledger first sees it, and its answer is kept.
func Attribute(s Seen, inits []Initiative) Attribution {
	a := Attribution{Name: s.Name, Cwd: s.Cwd}
	if a.Name == "" {
		a.Name = s.Session
	}
	var reasons []string

	in := initiativeOf(s.Cwd, inits)
	if in != nil {
		a.Initiative = in.ID
	} else if s.Cwd == "" {
		reasons = append(reasons, "no working directory in the transcript")
	} else {
		reasons = append(reasons, "no initiative root above "+s.Cwd)
	}

	seat := seatOf(a.Name)
	if seat == "" && s.Persona != "" {
		seat = strings.ToLower(s.Persona)
	}
	a.Role = roleOf(seat, s, in)
	if a.Role == "" {
		reasons = append(reasons, "no session name")
	}

	if in != nil {
		switch a.Role {
		case RoleSupervisor:
			cards := supervisedBy(seat, in.Cards)
			switch len(cards) {
			case 0:
				reasons = append(reasons, "no card names "+seat+" as its supervisor")
			case 1:
				a.Task, a.TaskTitle = cards[0].Slug, cards[0].Title
			default:
				slugs := make([]string, len(cards))
				for i, c := range cards {
					slugs[i] = c.Slug
				}
				a.Task = "wave:" + seat
				a.TaskTitle = seat + " · " + strings.Join(slugs, ", ")
				a.Cards = slugs
			}
		case RoleBuilder, RoleReviewer, RoleUIReviewer:
			c, why := cardOfSeat(seat, in.Cards)
			if c != nil {
				a.Task, a.TaskTitle = c.Slug, c.Title
			} else {
				reasons = append(reasons, why)
			}
		}
	}
	a.Reason = strings.Join(reasons, "; ")
	return a
}

// initiativeOf is the longest initiative root that holds the directory; a
// worktree under <root>/.wt/ is inside its root, so it needs no rule.
func initiativeOf(cwd string, inits []Initiative) *Initiative {
	if cwd == "" {
		return nil
	}
	cwd = filepath.Clean(cwd)
	var best *Initiative
	for i := range inits {
		root := filepath.Clean(inits[i].Root)
		if cwd != root && !strings.HasPrefix(cwd, root+string(filepath.Separator)) {
			continue
		}
		if best == nil || len(root) > len(filepath.Clean(best.Root)) {
			best = &inits[i]
		}
	}
	return best
}

// roleOf is the role table (spec FR-3), first match wins.
func roleOf(seat string, s Seen, in *Initiative) string {
	switch {
	case seat == "" && s.Pair != "":
		return RolePair
	case seat == "":
		return ""
	case supRe.MatchString(seat):
		return RoleSupervisor
	case seat == "fse":
		return RoleFSE
	case pairNames[seat] || s.Pair != "":
		return RolePair
	case uiRe.MatchString(seat):
		return RoleUIReviewer
	case reviewerRe.MatchString(seat):
		return RoleReviewer
	case builderRe.MatchString(seat):
		return RoleBuilder
	case in != nil && isPersona(seat, in.Seats):
		return RolePersona
	case in != nil && seatHasCard(seat, in.Cards):
		return RoleBuilder
	}
	return RoleSession
}

// isPersona matches a seat against the cell's roster, whole (po_andrea) or
// by its short name after the role prefix (andrea), as crew sessions name it.
func isPersona(seat string, roster []string) bool {
	for _, r := range roster {
		r = strings.ToLower(r)
		if seat == r {
			return true
		}
		if i := strings.LastIndex(r, "_"); i >= 0 && seat == r[i+1:] {
			return true
		}
	}
	return false
}

// seatHasCard is a seat with no role suffix that a card names: the builder
// seats of the early waves (hdr-fold, wave1-header).
func seatHasCard(seat string, cards []Card) bool {
	c, _ := cardOfSeat(seat, cards)
	return c != nil
}

// taskBase is a seat with its role words dropped: rlf-build, rlf-review and
// rlf-ui are all rlf; wave1-review-header is wave1-header.
func taskBase(seat string) string {
	var keep []string
	for _, p := range strings.Split(strings.ToLower(seat), "-") {
		if p != "" && !roleSegRe.MatchString(p) {
			keep = append(keep, p)
		}
	}
	return strings.Join(keep, "-")
}

var trailingDigits = regexp.MustCompile(`\d+$`)

// cardOfSeat is the card a seat works on, by the cards' seat: field: the
// card's seat and the session's seat share a task base. A second launch of a
// seat (hdr-fold2) falls back to the base without its trailing number. Two
// cards answering is no answer: a cost under the wrong card is worse.
func cardOfSeat(seat string, cards []Card) (*Card, string) {
	match := func(base string) []*Card {
		var out []*Card
		for i := range cards {
			if cards[i].Seat != "" && taskBase(cards[i].Seat) == base {
				out = append(out, &cards[i])
			}
		}
		return out
	}
	base := taskBase(seat)
	got := match(base)
	if len(got) == 0 {
		if b := trailingDigits.ReplaceAllString(base, ""); b != base && b != "" {
			got = match(b)
		}
	}
	switch len(got) {
	case 1:
		return got[0], ""
	case 0:
		return nil, "no card's seat: matches " + seat
	}
	slugs := make([]string, len(got))
	for i, c := range got {
		slugs[i] = c.Slug
	}
	sort.Strings(slugs)
	return nil, fmt.Sprintf("seat %s matches %d cards (%s)", seat, len(got), strings.Join(slugs, ", "))
}

// supervisedBy is the cards that name the supervisor as the one running
// them, the ways the FSE and supervisors write it: "supervisor sup46",
// "sup16 runs this card", "sup43 launched fic-build", "sup44 ended", and a
// log bullet "- 2026-10-05 sup40: ...". A passing mention ("left by sup43",
// "sent to sup41") does not count.
func supervisedBy(seat string, cards []Card) []Card {
	q := regexp.QuoteMeta(seat)
	re := regexp.MustCompile(`(?im)(supervisor\s+` + q + `\b|\b` + q + `\s+(runs|launched|ended)\b|^\s*[-*]\s+(\d{4}-\d{2}-\d{2}\s+)?` + q + `:)`)
	var out []Card
	for _, c := range cards {
		if re.MatchString(c.Body) {
			out = append(out, c)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Slug < out[j].Slug })
	return out
}
