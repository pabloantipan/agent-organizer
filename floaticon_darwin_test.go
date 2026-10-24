package main

import (
	"os"
	"regexp"
	"strings"
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

// After a desktop change the full-screen test is read again 0.5 s later, and
// a panel AppKit calls visible but the window server does not show is ordered
// front again at the read-back and at that re-read (leftovers-50 FR-1, FR-2).
func TestSpaceChangeReread(t *testing.T) {
	b, err := os.ReadFile("floaticon_darwin.m")
	if err != nil {
		t.Fatal(err)
	}
	src := string(b)
	for _, want := range []*regexp.Regexp{
		regexp.MustCompile(`after\(0\.5, \^\{\s*if \(k != spaceChanges\) return;`),
		regexp.MustCompile(`update\(@"space-change re-read", YES\);\s*// [^\n]*\n\s*if \(was\) orderInIfDropped\(@"re-read"\);`),
		regexp.MustCompile(`readBack\(\);\s*orderInIfDropped\(@"read-back"\);`),
		regexp.MustCompile(`if \(!\[panel isVisible\] \|\| onScreen\(\)\) return;`),
	} {
		if !want.MatchString(src) {
			t.Errorf("floaticon_darwin.m: no %q", want)
		}
	}
}

// The check hooks exist only with FLOAT_LOG (leftovers-50 FR-3, S4): the
// signals, the .fs read and FLOAT_COMPACT sit inside the logFile branch.
func TestCheckHooksOnlyWithLog(t *testing.T) {
	b, err := os.ReadFile("floaticon_darwin.m")
	if err != nil {
		t.Fatal(err)
	}
	src := string(b)
	open := strings.Index(src, "if (logFile) {\n            signal(SIGUSR1")
	if open < 0 {
		t.Fatal("floaticon_darwin.m: no logFile branch around the SIGUSR1 hook")
	}
	depth, end := 0, -1
	for i := open + len("if (logFile) "); i < len(src); i++ {
		if src[i] == '{' {
			depth++
		} else if src[i] == '}' {
			if depth--; depth == 0 {
				end = i
				break
			}
		}
	}
	if end < 0 {
		t.Fatal("floaticon_darwin.m: the logFile branch does not close")
	}
	for _, s := range []string{"SIGWINCH", "SIGINFO", `%s.fs"`, "fsStandIn = "} {
		for i := 0; ; i += len(s) {
			j := strings.Index(src[i:], s)
			if j < 0 {
				break
			}
			i += j
			if i < open || i > end {
				t.Errorf("floaticon_darwin.m: %q at byte %d, outside the logFile branch (%d-%d)", s, i, open, end)
			}
		}
	}
	if !regexp.MustCompile(`if \(logFile && compact && strcmp\(compact, "1"\) == 0\)`).MatchString(src) {
		t.Error("floaticon_darwin.m: FLOAT_COMPACT not guarded by logFile")
	}
}
