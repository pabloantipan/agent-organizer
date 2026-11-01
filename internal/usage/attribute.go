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

// Factory is the initiative of a run outside every initiative root
// (Hephaistos, a pair session in the home directory): the factory's own
// cost (leftovers-56 FR-1).
const Factory = "factory"

// OverheadPrefix starts the task of a role that works for its initiative
// and not for a card: overhead:fse, overhead:persona, overhead:pair,
// overhead:session (leftovers-56 FR-1).
const OverheadPrefix = "overhead:"

// IsCardTask is a task that names work on cards: a card slug or a
// supervisor's wave:<seat>. Empty and overhead tasks are not.
func IsCardTask(task string) bool {
	return task != "" && !strings.HasPrefix(task, OverheadPrefix)
}

// overheadRoles work for the initiative, not a card.
var overheadRoles = map[string]bool{RoleFSE: true, RolePersona: true, RolePair: true, RoleSession: true}

// Initiative is what attribution needs to know about one initiative root:
// where it is, its cards (open and done), its cell's seats and its decision
// records that name a supervisor.
type Initiative struct {
	ID    string
	Root  string
	Cards []Card
	Seats []string // agents/cell.json's roster, persona seats
	// Records are the decision records with a supervisor: (LoadRoles reads
	// them from Root).
	Records []Record
}

// Record is one decision record as attribution reads it: the supervisor
// session the FSE launched for it and the cards it accepts.
type Record struct {
	Number     string
	Supervisor string   // the record's supervisor:, a session name
	Cards      []string // the record's cards:
}

// Card is one working-on card as attribution reads it.
type Card struct {
	Slug  string
	Title string
	Seat  string // the card's seat: field
	// Reviewers are the seats the card's reviewer: names (a reviewer and a
	// UI reviewer, "a, b"); LoadRoles reads them from the card file.
	Reviewers []string
	Body      string // the card's markdown, where its supervisor is named
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

// Attribute names a session's initiative, role and task (leftovers-56 FR-1
// to FR-3). The ledger keeps an answer with a card task; one without is
// asked again at every pass until it has one (FR-4).
func Attribute(s Seen, inits []Initiative) Attribution {
	a := Attribution{Name: s.Name, Cwd: s.Cwd}
	if a.Name == "" {
		a.Name = s.Session
	}
	var reasons []string

	// Outside every initiative root is the factory's (FR-1).
	in := initiativeOf(s.Cwd, inits)
	if in != nil {
		a.Initiative = in.ID
	} else {
		a.Initiative = Factory
	}

	seat := seatOf(a.Name)
	if seat == "" && s.Persona != "" {
		seat = strings.ToLower(s.Persona)
	}
	a.Role = roleOf(seat, s, in)

	switch {
	case overheadRoles[a.Role]:
		a.Task = OverheadPrefix + a.Role
	case in == nil:
		reasons = append(reasons, "a "+a.Role+" outside every initiative root has no card")
	case a.Role == RoleSupervisor:
		cards, why := supervisorCards(seat, in)
		switch len(cards) {
		case 0:
			reasons = append(reasons, why)
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
	default: // builder, reviewer, ui reviewer
		var c *Card
		why := ""
		if a.Role == RoleReviewer || a.Role == RoleUIReviewer {
			c, why = cardOfReviewer(seat, in.Cards)
		}
		if c == nil && why == "" {
			c, why = cardOfSeat(seat, in.Cards)
		}
		if c != nil {
			a.Task, a.TaskTitle = c.Slug, c.Title
		} else {
			reasons = append(reasons, why)
		}
	}
	a.Reason = strings.Join(reasons, "; ")
	return a
}

// supervisorCards is a supervisor's cards (FR-2): the cards of the accept
// records whose supervisor: is its session, else the cards whose body names
// it (supervisedBy). A record's card no longer on disk still counts, by
// slug, since the record is what launched the supervisor.
func supervisorCards(seat string, in *Initiative) ([]Card, string) {
	seen := map[string]bool{}
	var out []Card
	for _, r := range in.Records {
		if r.Supervisor == "" || seatOf(r.Supervisor) != seat {
			continue
		}
		for _, slug := range r.Cards {
			slug = strings.TrimSpace(slug)
			if slug == "" || seen[slug] {
				continue
			}
			seen[slug] = true
			c := Card{Slug: slug}
			for _, k := range in.Cards {
				if k.Slug == slug {
					c = k
					break
				}
			}
			out = append(out, c)
		}
	}
	if len(out) == 0 {
		out = supervisedBy(seat, in.Cards)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Slug < out[j].Slug })
	if len(out) == 0 {
		return nil, "no record or card names " + seat + " as its supervisor"
	}
	return out, ""
}

// reviewedBy is the cards whose reviewer: names the seat.
func reviewedBy(seat string, cards []Card) []*Card {
	var out []*Card
	for i := range cards {
		for _, r := range cards[i].Reviewers {
			if r = seatOf(r); r != "" && r == seat {
				out = append(out, &cards[i])
				break
			}
		}
	}
	return out
}

// cardOfReviewer is the card a reviewer reviews by the cards' reviewer:
// field (FR-3). No card naming it is no answer and no reason, so the seat:
// rule runs next; two cards naming it is no answer, as cardOfSeat has it.
func cardOfReviewer(seat string, cards []Card) (*Card, string) {
	got := reviewedBy(seat, cards)
	switch len(got) {
	case 0:
		return nil, ""
	case 1:
		return got[0], ""
	}
	slugs := make([]string, len(got))
	for i, c := range got {
		slugs[i] = c.Slug
	}
	sort.Strings(slugs)
	return nil, fmt.Sprintf("reviewer %s is named by %d cards (%s)", seat, len(got), strings.Join(slugs, ", "))
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
		return RoleSession // a plain session with no name
	case supRe.MatchString(seat):
		return RoleSupervisor
	case seat == "fse":
		return RoleFSE
	case pairNames[seat] || s.Pair != "":
		return RolePair
	case uiRe.MatchString(seat):
		return RoleUIReviewer
	case in != nil && len(reviewedBy(seat, in.Cards)) > 0:
		return RoleReviewer // a card's reviewer: names it (l54-retire-rev)
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
