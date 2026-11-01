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
