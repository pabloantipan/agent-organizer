package usage

import "testing"

// leftovers-68 FR-1, FR-2 at the reader: a reviewer by the one card whose
// reviewer: names it; a supervisor by the one record whose supervisor: is its
// session, labelled `task <NNNN>`; two records, or two cards, are no answer.
func TestLF68AttributeReviewerAndRecord(t *testing.T) {
	in := func(records ...Record) []Initiative {
		return []Initiative{{ID: "org", Root: "/r/org", Records: records, Cards: []Card{
			{Slug: "lf9", Seat: "l9-go", Reviewers: []string{"l9-rev", "l9-ui"}},
			{Slug: "lf10", Seat: "l10-go", Reviewers: []string{"l10-rev", "l10-ui"}},
			{Slug: "lf11", Seat: "l11-go", Reviewers: []string{"l10-rev", "l11-ui"}},
		}}}
	}
	one := Record{Number: "0009", Supervisor: "org-probe-sup9", Cards: []string{"lf9", "lf10"}}
	tests := []struct {
		name      string
		seen      Seen
		inits     []Initiative
		task, lbl string
	}{
		{"reviewer of one card", Seen{Session: "org-probe-l9-rev", Cwd: "/r/org"}, in(), "lf9", "lf9"},
		{"reviewer two cards name", Seen{Session: "org-probe-l10-rev", Cwd: "/r/org"}, in(), "", ""},
		{"supervisor of one record", Seen{Session: "org-probe-sup9", Cwd: "/r/org"}, in(one), "wave:sup9", "task 0009"},
		{"supervisor of a one-card record", Seen{Session: "org-probe-sup9", Cwd: "/r/org"},
			in(Record{Number: "0012", Supervisor: "org-probe-sup9", Cards: []string{"lf11"}}), "lf11", "task 0012"},
		{"supervisor two records name", Seen{Session: "org-probe-sup9", Cwd: "/r/org"},
			in(one, Record{Number: "0010", Supervisor: "org-probe-sup9", Cards: []string{"lf11", "lf9"}}), "wave:sup9", "wave:sup9"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			a := Attribute(tt.seen, tt.inits)
			if a.Task != tt.task || a.Label() != tt.lbl {
				t.Errorf("task %q label %q, want %q %q (%+v)", a.Task, a.Label(), tt.task, tt.lbl, a)
			}
		})
	}
}

// A supervisor the ledger kept from before records named tasks keeps its
// task and gains its record: the label moves, the usage view's task does not.
func TestLF68KeptSupervisorGainsItsRecord(t *testing.T) {
	inits := []Initiative{{ID: "org", Root: "/r/org", Records: []Record{{Number: "0009", Supervisor: "org-probe-sup9", Cards: []string{"lf9", "lf10"}}, {Number: "0011", Supervisor: "org-probe-sup11", Cards: []string{"lf11", "lf12"}}}}}
	kept := &Line{SessionID: "s", Day: "2026-11-01", Attribution: Attribution{Name: "org-probe-sup9", Initiative: "org", Role: RoleSupervisor, Task: "wave:sup9", Cards: []string{"lf10", "lf9"}}}
	a := sessionAttribution([]*Line{kept}, nil, CostSource{}, inits)
	if a.Task != "wave:sup9" || a.Record != "0009" || a.Label() != "task 0009" {
		t.Errorf("kept supervisor: %+v, want task wave:sup9, record 0009", a)
	}
	b := Attribution{Task: "lf9"}
	if b.Label() != "lf9" {
		t.Errorf("a card's label %q, want its task", b.Label())
	}
}
