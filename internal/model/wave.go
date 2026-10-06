package model

// Wave is one supervised task's wave, read from the `waves:` block of a run
// record's frontmatter (`<root>/runs/YYYY-MM-DD-<slug>.md`, the run record
// template in agent-slack's docs/runs/TEMPLATE.md; organizer 0093, 0100).
// Times are ISO 8601 with their offset, kept as written ("2026-10-06T15:21-03:00");
// Merged empty means the wave is still open.
//
// A record with no block is a dot (0022: no invented dates): one Wave with
// Dot set, its Record and Date, the record's first heading as Task, and
// nothing else. Older records have only prose, so the Roadmap draws them as a
// dated dot, never as a bar.
type Wave struct {
	// Record is the run record's file name, Date the YYYY-MM-DD it starts with.
	Record string `yaml:"-" json:"record"`
	Date   string `yaml:"-" json:"date"`
	// Dot is a record with no waves block.
	Dot bool `yaml:"-" json:"dot"`

	Number     int      `yaml:"wave" json:"wave"`
	Supervisor string   `yaml:"supervisor" json:"supervisor"`
	Task       string   `yaml:"task" json:"task"`
	Cards      []string `yaml:"cards" json:"cards"`
	Launched   string   `yaml:"launched" json:"launched"`
	Merged     string   `yaml:"merged" json:"merged"`
	Rounds     []Round  `yaml:"rounds" json:"rounds"`

	// Stages are the stage ids of the wave's cards (done ones included), in
	// roadmap order then first seen, each once. Empty is "outside any stage"
	// (Aglaea O2). Stamped by the scan, never read from the record.
	Stages []string `yaml:"-" json:"stages"`
}

// Round is one build, review, UI review or take within a wave.
type Round struct {
	Card     string `yaml:"card" json:"card"`
	Kind     string `yaml:"kind" json:"kind"`
	Start    string `yaml:"start" json:"start"`
	End      string `yaml:"end" json:"end"`
	Result   string `yaml:"result" json:"result"`
	Reviewer string `yaml:"reviewer" json:"reviewer"`
	Reason   string `yaml:"reason" json:"reason"`
}

// Round kinds and results, as the run record template names them.
const (
	RoundBuild    = "build"
	RoundReview   = "review"
	RoundUIReview = "ui-review"
	RoundTake     = "take"

	ResultPass = "pass"
	ResultFail = "fail"
	ResultNA   = "n/a"
)

// ValidRoundKind and ValidRoundResult are the template's closed sets.
func ValidRoundKind(k string) bool {
	return k == RoundBuild || k == RoundReview || k == RoundUIReview || k == RoundTake
}

func ValidRoundResult(r string) bool {
	return r == ResultPass || r == ResultFail || r == ResultNA
}
