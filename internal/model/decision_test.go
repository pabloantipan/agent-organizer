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
	if d.Ruler() != "pablo" || d.RuledBy != "operator away mode, recommendation taken" {
		t.Errorf("an old mode wording is shown as written and its ruler is pablo: %q %q", d.RuledBy, d.Ruler())
	}
	if (Decision{RuledBy: "pablo"}).Ruler() != "pablo" {
		t.Error("a person is the ruler")
	}
}

// leftovers-54 FR-7 at specs 54cf10d: ruled_by is a person plus a mode; an
// unknown reading is refused, never guessed.
func TestReadRuledBy(t *testing.T) {
	for _, c := range []struct{ in, person, mode string }{
		{"", "", ""},
		{"pablo", "pablo", "present"},
		{"  pablo ", "pablo", "present"},
		{"operator", "pablo", "present"},
		{"ana", "ana", "present"},
		{"pablo (autonomous mode)", "pablo", "autonomous"},
		{"pablo (away mode)", "pablo", "autonomous"},
		{"ana (autonomous mode)", "ana", "autonomous"},
		{"pablo (standing rule)", "pablo", "standing rule"},
		{"pablo by away mode", "pablo", "autonomous"},
		{"pablo by standing rule", "pablo", "standing rule"},
		{"(autonomous mode)", "pablo", "autonomous"},
		{"(away mode)", "pablo", "autonomous"},
		{"operator away mode, recommendation taken", "pablo", "autonomous"},
		{"themis (FR-4 b)", "themis", "standing rule"},
	} {
		p, m, ok := ReadRuledBy(c.in)
		if !ok || p != c.person || m != c.mode {
			t.Errorf("ReadRuledBy(%q) = %q, %q, %v; want %q, %q", c.in, p, m, ok, c.person, c.mode)
		}
	}
	for _, in := range []string{
		"pablo (vacation)", "pablo (autonomous mode", "pablo away mode, recommendation taken",
		"(standing rule)", "pablo by vacation", "pablo and ana", "pablo (FR-4)", "pablo )",
	} {
		if p, m, ok := ReadRuledBy(in); ok || p != "" || m != "" {
			t.Errorf("ReadRuledBy(%q) = %q, %q, %v; want refused", in, p, m, ok)
		}
	}
}

func TestReadRulingWrittenMode(t *testing.T) {
	for _, c := range []struct {
		by, written, person, mode string
		refused                   bool
	}{
		{"pablo (away mode)", "away", "pablo", "autonomous", false},
		{"pablo (autonomous mode)", "away", "pablo", "autonomous", false},
		{"pablo (away mode)", "present", "", "", true},
		{"pablo", "autonomous", "pablo", "autonomous", false},
		{"pablo", "", "pablo", "present", false},
		{"pablo", "holiday", "", "", true},
		{"pablo (vacation)", "", "", "", true},
	} {
		d := Decision{RuledBy: c.by, RuledMode: c.written}
		note := d.ReadRuling()
		if (note != "") != c.refused || d.Person != c.person || d.Mode != c.mode {
			t.Errorf("%q + ruled_mode %q: %q, %q, note %q; want %q, %q, refused %v", c.by, c.written, d.Person, d.Mode, note, c.person, c.mode, c.refused)
		}
	}
}

// leftovers-54 FR-8: a band followed by text reads as the facts read it.
func TestForecastBand(t *testing.T) {
	for _, c := range []struct {
		in     string
		lo, hi int
	}{
		{"60-100m", 60, 100}, {"1.5-3h", 90, 180}, {"70-110min", 70, 110},
		{"40-90 min of wave time over 1 wave, plus this decision", 40, 90},
		{"1.5-3 h over 2 waves", 90, 180}, {"25-50 min", 25, 50}, {"20–40m", 20, 40},
		{"30-60m, basis: 8 tasks", 30, 60},
		{"30 min-1 h over 1 wave (five builders)", 30, 60},
		{"45 min-1.5 h over 1 wave", 45, 90}, {"2-4 hours", 120, 240},
	} {
		lo, hi, err := ForecastBand(c.in)
		if err != nil || lo != c.lo || hi != c.hi {
			t.Errorf("ForecastBand(%q) = %d, %d, %v; want %d, %d", c.in, lo, hi, err, c.lo, c.hi)
		}
	}
	for _, in := range []string{"", "soon", "about 40-90m", "90-40m", "40-90 mice", "40-90"} {
		if _, _, err := ForecastBand(in); err == nil {
			t.Errorf("ForecastBand(%q) read a band", in)
		}
	}
}
