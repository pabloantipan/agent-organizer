package cli

import (
	"bytes"
	"strings"
	"testing"

	"organizer/internal/model"
)

// leftovers-54 FR-6, FR-7: the buckets read the decision's class, and a
// ruler is a person with the mode beside it.
func TestWriteDecisionsBucketsByClass(t *testing.T) {
	row := func(n, status, by string) DecisionRow {
		return DecisionRow{Initiative: "i", Decision: model.Decision{Number: n, Title: "t" + n, Status: status, RuledBy: by, Raised: "2026-10-01", Ruled: "2026-10-02"}, TurnaroundDays: 1}
	}
	var b bytes.Buffer
	WriteDecisions(&b, []DecisionRow{
		row("0001", "proposed", ""), row("0002", "awaiting-cells", ""),
		row("0003", "ruled", "pablo"), row("0004", "applied", "pablo by away mode"),
		row("0005", "acknowledged", "operator"), row("0006", "ruled", "pablo (standing rule)"),
		row("0007", "ruled", "pablo (vacation)"),
		row("0008", "superseded", "pablo"), row("0009", "withdrawn", ""),
	})
	out := b.String()
	for _, want := range []string{
		"open (2)", "ruled (5)", "superseded or withdrawn (2)",
		"by pablo  ", "by pablo, autonomous mode", "by pablo, standing rule", `by "pablo (vacation)"`,
	} {
		if !strings.Contains(out, want) {
			t.Errorf("missing %q in\n%s", want, out)
		}
	}
	open := out[:strings.Index(out, "ruled (")]
	if !strings.Contains(open, "i 0002") {
		t.Errorf("awaiting-cells is not open:\n%s", out)
	}
	if strings.Contains(out, "by operator") {
		t.Errorf("operator is pablo:\n%s", out)
	}
}

// leftovers-61 D5 (FR-5, DS5) and FR-6: every line names its record's own
// status ("awaiting cells", "applied", "acknowledged"), never its bucket's,
// and owner operator reads as pablo.
func TestWriteDecisionsNamesEachStatus(t *testing.T) {
	var b bytes.Buffer
	WriteDecisions(&b, []DecisionRow{
		{Initiative: "init-a", Decision: model.Decision{Number: "0002", Title: "where", Status: "proposed", Owner: "pablo", Raised: "2026-09-20"}, AgeDays: 42},
		{Initiative: "init-a", Decision: model.Decision{Number: "0013", Title: "which cells", Status: "awaiting-cells", Owner: "operator", Raised: "2026-10-20"}, AgeDays: 12},
		{Initiative: "init-a", Decision: model.Decision{Number: "0014", Title: "apply", Status: "applied", RuledBy: "pablo (autonomous mode)", Raised: "2026-10-18", Ruled: "2026-10-21"}, TurnaroundDays: 3},
		{Initiative: "init-a", Decision: model.Decision{Number: "0015", Title: "acknowledge", Status: "acknowledged", RuledBy: "pablo by standing rule", Raised: "2026-10-19", Ruled: "2026-10-20"}, TurnaroundDays: 1},
		{Initiative: "init-a", Decision: model.Decision{Number: "0006", Title: "roadmap", Status: "ruled", RuledBy: "pablo", Raised: "2026-09-27", Ruled: "2026-09-28"}, TurnaroundDays: 1},
	})
	lines := map[string]string{}
	for _, l := range strings.Split(b.String(), "\n") {
		if f := strings.Fields(l); len(f) > 1 && f[0] == "init-a" {
			lines[f[1]] = l
		}
	}
	for n, want := range map[string]string{"0002": "42d waiting", "0013": "12d awaiting cells", "0014": "applied 2026-10-21", "0015": "acknowledged 2026-10-20", "0006": "ruled 2026-09-28"} {
		if !strings.Contains(lines[n], want) {
			t.Errorf("%s: want %q on its line, got %q", n, want, lines[n])
		}
	}
	if strings.Contains(lines["0013"], " waiting") || strings.Contains(lines["0014"], " ruled ") || strings.Contains(lines["0015"], " ruled ") {
		t.Errorf("a line renames its status by its bucket:\n%s", b.String())
	}
	if !strings.Contains(lines["0013"], "owner pablo") || strings.Contains(b.String(), "operator") {
		t.Errorf("owner operator reads as pablo:\n%s", b.String())
	}
}
