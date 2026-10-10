package main

import (
	"os"
	"regexp"
	"testing"
)

// The icon's ring at critical breathes 3 to 6 pt (leftovers-16 FR-1). The
// drawing is Objective-C, so the test reads the constants from the source:
// a revert to 4.5 or a changed rest width fails here before a screen does.
func TestRingBreathWidths(t *testing.T) {
	b, err := os.ReadFile("floaticon_darwin.m")
	if err != nil {
		t.Fatal(err)
	}
	src := string(b)
	for _, want := range []*regexp.Regexp{
		regexp.MustCompile(`static const CGFloat kBreathPeak = 6;`),
		regexp.MustCompile(`CGFloat w = critical \? 3 : 2;`),
		regexp.MustCompile(`if \(critical && !reduceMotion\(\)\)`),
	} {
		if !want.MatchString(src) {
			t.Errorf("floaticon_darwin.m: no %q", want)
		}
	}
}
