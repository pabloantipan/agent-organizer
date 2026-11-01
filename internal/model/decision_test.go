package model

import "testing"

// leftovers-53 FR-2, FR-2a.
func TestDecisionCrossingStatusesAndModes(t *testing.T) {
	for s, want := range map[string][2]bool{ // open, decided
		"proposed": {true, false}, "awaiting-cells": {true, false},
		"ruled": {false, true}, "applied": {false, true}, "acknowledged": {false, true},
		"superseded": {false, false}, "withdrawn": {false, false},
	} {
		d := Decision{Status: s}
		if !ValidDecisionStatus(s) || d.Open() != want[0] || d.Decided() != want[1] {
			t.Errorf("%s: valid %v open %v decided %v, want open %v decided %v", s, ValidDecisionStatus(s), d.Open(), d.Decided(), want[0], want[1])
		}
	}
	if ValidDecisionStatus("decided") {
		t.Error("decided is not a status")
	}
	d := Decision{RuledBy: "operator away mode, recommendation taken"}
	if d.Ruler() != "" || d.RuledBy != "operator away mode, recommendation taken" {
		t.Errorf("a mode is shown as written and is no ruler: %q %q", d.RuledBy, d.Ruler())
	}
	if (Decision{RuledBy: "pablo"}).Ruler() != "pablo" {
		t.Error("a person is the ruler")
	}
}
