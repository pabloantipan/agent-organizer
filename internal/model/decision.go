package model

import (
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// Decision statuses, a closed set like card statuses; the working-on skill
// owns it. awaiting-cells, applied and acknowledged are the crossing statuses
// (working-on templates/crossing.md), valid in any decisions/ folder
// (leftovers-53 FR-2): awaiting-cells is open like proposed, applied and
// acknowledged come after the ruling, so they are decided like ruled.
const (
	DecisionProposed      = "proposed"
	DecisionRuled         = "ruled"
	DecisionSuperseded    = "superseded"
	DecisionWithdrawn     = "withdrawn"
	DecisionAwaitingCells = "awaiting-cells"
	DecisionApplied       = "applied"
	DecisionAcknowledged  = "acknowledged"
)

// ValidDecisionStatus reports whether s is one of the seven statuses.
func ValidDecisionStatus(s string) bool {
	return DecisionOpen(s) || DecisionDecided(s) || s == DecisionSuperseded || s == DecisionWithdrawn
}

// DecisionOpen reports whether a record with status s waits on a ruling:
// proposed or awaiting-cells.
func DecisionOpen(s string) bool { return s == DecisionProposed || s == DecisionAwaitingCells }

// DecisionDecided reports whether a record with status s has been ruled and
// stands: ruled, applied or acknowledged. Never waiting.
func DecisionDecided(s string) bool {
	return s == DecisionRuled || s == DecisionApplied || s == DecisionAcknowledged
}

// Ruling modes (contracts working-on/expected.json, facts.enums.ruled_mode):
// how a ruling was given. Away is the old name of autonomous and is read as
// autonomous wherever a mode is read.
const (
	ModePresent      = "present"
	ModeAutonomous   = "autonomous"
	ModeStandingRule = "standing rule"
)

// ruledByListed are the old wordings expected.json's ruled_by_reading lists
// that the general forms below do not read.
var ruledByListed = map[string][2]string{
	"operator away mode, recommendation taken": {"pablo", ModeAutonomous},
	"(autonomous mode)":                        {"pablo", ModeAutonomous},
	"(away mode)":                              {"pablo", ModeAutonomous},
}

var (
	ruledByParen = regexp.MustCompile(`^([^\s()]+)\s+\(([^()]+)\)$`)
	ruledByWord  = regexp.MustCompile(`^[^\s()]+$`)
	themisNote   = regexp.MustCompile(`^FR-4\s+\S.*$`)
)

// PersonOf names the person a ruled_by or owner word stands for: operator is
// pablo (expected.json ruled_by_note), anyone else as written.
func PersonOf(word string) string {
	if word == "operator" {
		return "pablo"
	}
	return word
}

// ReadRuledBy reads a ruled_by value as a person and a mode, per
// expected.json accepted_reading.ruled_by_reading: `<person>` (mode
// present), `<person> (autonomous mode|away mode|standing rule)`, `<person>
// by away mode|standing rule`, a Themis `themis (FR-4 <x>)` (standing rule),
// a bare `(autonomous mode)` or `(away mode)` (pablo) and the old wordings it
// lists. Anything else is refused (ruled_by_refused): ok false, no person and
// no mode, never a guess. An empty value reads as nobody, ok true.
func ReadRuledBy(ruledBy string) (person, mode string, ok bool) {
	s := strings.TrimSpace(ruledBy)
	if s == "" {
		return "", "", true
	}
	if r, listed := ruledByListed[s]; listed {
		return r[0], r[1], true
	}
	if ruledByWord.MatchString(s) {
		return PersonOf(s), ModePresent, true
	}
	if m := ruledByParen.FindStringSubmatch(s); m != nil {
		switch note := strings.TrimSpace(m[2]); {
		case note == "autonomous mode" || note == "away mode":
			return PersonOf(m[1]), ModeAutonomous, true
		case note == "standing rule" || themisNote.MatchString(note):
			return PersonOf(m[1]), ModeStandingRule, true
		}
		return "", "", false
	}
	if f := strings.Fields(s); len(f) == 4 && f[1] == "by" && ruledByWord.MatchString(f[0]) {
		switch strings.Join(f[2:], " ") {
		case "away mode":
			return PersonOf(f[0]), ModeAutonomous, true
		case "standing rule":
			return PersonOf(f[0]), ModeStandingRule, true
		}
	}
	return "", "", false
}

// ReadMode reads a written ruled_mode: away is autonomous; ok false for a
// value outside the enum.
func ReadMode(m string) (string, bool) {
	switch m = strings.TrimSpace(m); m {
	case "away":
		return ModeAutonomous, true
	case ModePresent, ModeAutonomous, ModeStandingRule:
		return m, true
	}
	return "", false
}

// ReadRuling fills Person and Mode from ruled_by and a written ruled_mode.
// It returns a note when the record's ruling cannot be read: ruled_by is
// refused, ruled_mode is unknown, or ruled_mode disagrees with a mode
// ruled_by names. Then Person and Mode stay empty (expected.json
// facts.reader_refuses). A one-word ruled_by names no mode, so a written
// ruled_mode beside it is the mode.
func (d *Decision) ReadRuling() string {
	d.Person, d.Mode = "", ""
	person, mode, ok := ReadRuledBy(d.RuledBy)
	if !ok {
		return fmt.Sprintf("ruled_by %q is no reading the working-on skill knows; no ruler read", d.RuledBy)
	}
	if strings.TrimSpace(d.RuledMode) != "" {
		written, valid := ReadMode(d.RuledMode)
		if !valid {
			return fmt.Sprintf("ruled_mode %q is not present, autonomous or standing rule; no ruler read", d.RuledMode)
		}
		if person != "" && written != mode && !ruledByWord.MatchString(strings.TrimSpace(d.RuledBy)) {
			return fmt.Sprintf("ruled_mode %q disagrees with ruled_by %q; no ruler read", d.RuledMode, d.RuledBy)
		}
		if person != "" {
			mode = written
		}
	}
	d.Person, d.Mode = person, mode
	return ""
}

// Decision is one working-on/decisions/<NNNN>-<slug>.md record: a question,
// its options, who may rule it and, once ruled, who did and when. A ruled
// record is never edited; a reversal is a new record that supersedes it.
type Decision struct {
	// Number and Slug come from the file name, not the frontmatter.
	Number   string `yaml:"-" json:"number"`
	Slug     string `yaml:"-" json:"slug"`
	Path     string `yaml:"-" json:"path"`
	Title    string `yaml:"title" json:"title"`
	Status   string `yaml:"status" json:"status"`
	Raised   string `yaml:"raised" json:"raised"`
	RaisedBy string `yaml:"raised_by" json:"raised_by"`
	Owner    string `yaml:"owner" json:"owner"`
	Ruled    string `yaml:"ruled" json:"ruled"`
	RuledBy  string `yaml:"ruled_by" json:"ruled_by"`
	// RuledMode is the frontmatter's ruled_mode as written, if any.
	RuledMode string `yaml:"ruled_mode" json:"-"`
	// Person and Mode are ruled_by read (ReadRuling): who ruled and how
	// (present, autonomous, standing rule). Both empty when nobody ruled or
	// the reading was refused; RuledBy keeps the words as written.
	Person  string   `yaml:"-" json:"ruler"`
	Mode    string   `yaml:"-" json:"ruler_mode"`
	Options []string `yaml:"options" json:"options"`
	Chosen  string   `yaml:"chosen" json:"chosen"`
	Cards   []string `yaml:"cards" json:"cards"`
	// Stage is optional: the roadmap stage id this record belongs to.
	Stage        string   `yaml:"stage" json:"stage"`
	Threads      []string `yaml:"threads" json:"threads"`
	Supersedes   []string `yaml:"supersedes" json:"supersedes"`
	SupersededBy string   `yaml:"superseded_by" json:"superseded_by"`
	// Forecast is an accept record's band as written (`40-90m`, `1.5-3h`,
	// `40-90 min of …`); ForecastLow and ForecastTop are its ends in minutes,
	// 0 when absent or unparsed.
	Forecast    string `yaml:"forecast" json:"forecast"`
	ForecastLow int    `yaml:"-" json:"forecast_low"`
	ForecastTop int    `yaml:"-" json:"forecast_top"`
	// RuledAt is the time of the commit where `status: ruled` first appears
	// on the record (RFC 3339), read from git for records with a forecast
	// only; empty without git or such a commit.
	RuledAt string `yaml:"-" json:"ruled_at"`
	Body    string `yaml:"-" json:"body"`
}

// forecastBand is a band at the start of the value; text may follow it
// (`40-90 min of wave time …`), as expected.json's facts read it. The low end
// may carry its own unit (`30 min-1 h`); without one it takes the top's.
var forecastBand = regexp.MustCompile(`^(\d+(?:\.\d+)?)\s*(` + forecastUnit + `)?\s*[-–]\s*(\d+(?:\.\d+)?)\s*(` + forecastUnit + `)(?:$|[^A-Za-z0-9])`)

const forecastUnit = `minutes?|mins?|m|hours?|hrs?|h`

// ForecastBand parses a band with its unit at the start of s, `40-90m`,
// `1.5-3h`, `70-110min`, `30 min-1 h` or `40-90 min of …`, and returns its
// ends in minutes.
func ForecastBand(s string) (lo, hi int, err error) {
	m := forecastBand.FindStringSubmatch(strings.TrimSpace(s))
	if m == nil {
		return 0, 0, fmt.Errorf("forecast %q does not start with a band like 40-90m or 1.5-3h", s)
	}
	minutes := func(n, unit string) float64 {
		v, _ := strconv.ParseFloat(n, 64)
		if strings.HasPrefix(unit, "h") {
			return v * 60
		}
		return v
	}
	lowUnit := m[2]
	if lowUnit == "" {
		lowUnit = m[4]
	}
	l, h := minutes(m[1], lowUnit), minutes(m[3], m[4])
	if h <= 0 || l > h {
		return 0, 0, fmt.Errorf("forecast %q: the band's top must be above zero and not below its bottom", s)
	}
	return int(math.Round(l)), int(math.Round(h)), nil
}

// ForecastTopMinutes is ForecastBand's top.
func ForecastTopMinutes(s string) (int, error) {
	_, hi, err := ForecastBand(s)
	return hi, err
}

// Open reports whether the decision still waits on a ruling.
func (d Decision) Open() bool { return DecisionOpen(d.Status) }

// Decided reports whether the decision was ruled and stands.
func (d Decision) Decided() bool { return DecisionDecided(d.Status) }

// Ruler is the person who ruled the record (ruled_by read as ReadRuling
// reads it), empty when nobody did or the reading was refused. Counts by
// ruler use it.
func (d Decision) Ruler() string {
	d.ReadRuling()
	return d.Person
}

// Class is the decision's state as one word: open, decided or closed
// (expected.json accepted_reading.decision_statuses). An unknown status is
// closed: it waits on nothing and counts as no ruling.
func (d Decision) Class() string {
	switch {
	case d.Open():
		return "open"
	case d.Decided():
		return "decided"
	}
	return "closed"
}

// TurnaroundDays is ruled minus raised, in whole days, or -1 when the record
// was never ruled or a date is missing.
func (d Decision) TurnaroundDays() int {
	raised, err1 := time.Parse("2006-01-02", d.Raised)
	ruled, err2 := time.Parse("2006-01-02", d.Ruled)
	if err1 != nil || err2 != nil || d.Ruled == "" {
		return -1
	}
	return int(ruled.Sub(raised).Hours() / 24)
}

// AgeDays is how long an open decision has waited, as of now.
func (d Decision) AgeDays(now time.Time) int {
	raised, err := time.Parse("2006-01-02", d.Raised)
	if err != nil {
		return -1
	}
	day := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	return int(day.Sub(raised).Hours() / 24)
}
