package model

import (
	"fmt"
	"math"
	"regexp"
	"strconv"
	"time"
)

// Decision statuses, a closed set like card statuses; the working-on skill
// owns it.
const (
	DecisionProposed   = "proposed"
	DecisionRuled      = "ruled"
	DecisionSuperseded = "superseded"
	DecisionWithdrawn  = "withdrawn"
)

// ValidDecisionStatus reports whether s is one of the four statuses.
func ValidDecisionStatus(s string) bool {
	switch s {
	case DecisionProposed, DecisionRuled, DecisionSuperseded, DecisionWithdrawn:
		return true
	}
	return false
}

// Decision is one working-on/decisions/<NNNN>-<slug>.md record: a question,
// its options, who may rule it and, once ruled, who did and when. A ruled
// record is never edited; a reversal is a new record that supersedes it.
type Decision struct {
	// Number and Slug come from the file name, not the frontmatter.
	Number   string   `yaml:"-" json:"number"`
	Slug     string   `yaml:"-" json:"slug"`
	Path     string   `yaml:"-" json:"path"`
	Title    string   `yaml:"title" json:"title"`
	Status   string   `yaml:"status" json:"status"`
	Raised   string   `yaml:"raised" json:"raised"`
	RaisedBy string   `yaml:"raised_by" json:"raised_by"`
	Owner    string   `yaml:"owner" json:"owner"`
	Ruled    string   `yaml:"ruled" json:"ruled"`
	RuledBy  string   `yaml:"ruled_by" json:"ruled_by"`
	Options  []string `yaml:"options" json:"options"`
	Chosen   string   `yaml:"chosen" json:"chosen"`
	Cards    []string `yaml:"cards" json:"cards"`
	// Stage is optional: the roadmap stage id this record belongs to.
	Stage        string   `yaml:"stage" json:"stage"`
	Threads      []string `yaml:"threads" json:"threads"`
	Supersedes   []string `yaml:"supersedes" json:"supersedes"`
	SupersededBy string   `yaml:"superseded_by" json:"superseded_by"`
	// Forecast is an accept record's band as written (`40-90m`, `1.5-3h`);
	// ForecastTop is its top in minutes, 0 when absent or unparsed.
	Forecast    string `yaml:"forecast" json:"forecast"`
	ForecastTop int    `yaml:"-" json:"forecast_top"`
	// RuledAt is the time of the commit where `status: ruled` first appears
	// on the record (RFC 3339), read from git for records with a forecast
	// only; empty without git or such a commit.
	RuledAt string `yaml:"-" json:"ruled_at"`
	Body    string `yaml:"-" json:"body"`
}

var forecastBand = regexp.MustCompile(`^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(m|min|h)$`)

// ForecastTopMinutes parses a band with its unit, `40-90m`, `1.5-3h` or
// `70-110min`, and returns its top in minutes.
func ForecastTopMinutes(s string) (int, error) {
	m := forecastBand.FindStringSubmatch(s)
	if m == nil {
		return 0, fmt.Errorf("forecast %q is not a band like 40-90m or 1.5-3h", s)
	}
	lo, _ := strconv.ParseFloat(m[1], 64)
	hi, _ := strconv.ParseFloat(m[2], 64)
	if hi <= 0 || lo > hi {
		return 0, fmt.Errorf("forecast %q: the band's top must be above zero and not below its bottom", s)
	}
	if m[3] == "h" {
		hi *= 60
	}
	return int(math.Round(hi)), nil
}

// Open reports whether the decision still waits on a ruling.
func (d Decision) Open() bool { return d.Status == DecisionProposed }

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
