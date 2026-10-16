package usage

import (
	"testing"
	"time"
)

// leftovers-39 FR-2: Totals.Priced is the money the price table gave, a
// share of Money; recorded and transcript costs are not in it.
func TestTotalsPriced(t *testing.T) {
	cost := func(x float64) *float64 { return &x }
	lines := []Line{
		{SessionID: "rec", Day: "2026-10-05", Cost: cost(3), CostFrom: "record"},
		{SessionID: "pr", Day: "2026-10-05", Cost: cost(10), CostFrom: "priced"},
		{SessionID: "pr", Day: "2026-10-06", Cost: cost(2.5), CostFrom: "priced"},
		{SessionID: "none", Day: "2026-10-06"},
	}
	v, err := Build(lines, "2026-W41", nil, time.UTC)
	if err != nil {
		t.Fatal(err)
	}
	if !near(v.ThisWeek.Money, 15.5) || !near(v.ThisWeek.Priced, 12.5) || v.ThisWeek.WithoutCost != 1 {
		t.Errorf("week totals = %+v, want money 15.5, priced 12.5, 1 without cost", v.ThisWeek)
	}
}
