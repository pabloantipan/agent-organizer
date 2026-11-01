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
// That re-read looks whether or not the icon was shown before it, the
// screen-parameters observer looks too once the screens settle, and a panel
// not on the active desktop gets its collection behaviour set again from the
// one definition creation uses (leftovers-60 FR-1, FR-2).
func TestSpaceChangeReread(t *testing.T) {
	b, err := os.ReadFile("floaticon_darwin.m")
	if err != nil {
		t.Fatal(err)
	}
	src := string(b)
	for _, want := range []*regexp.Regexp{
		regexp.MustCompile(`after\(0\.5, \^\{\s*if \(k != spaceChanges\) return;`),
		regexp.MustCompile(`update\(@"space-change re-read", YES\);\s*// [^\n]*\n\s*orderInIfDropped\(@"re-read"\);`),
		regexp.MustCompile(`readBack\(\);\s*orderInIfDropped\(@"read-back"\);`),
		regexp.MustCompile(`if \(!\[panel isVisible\]\) return;\s*BOOL away = !\[panel isOnActiveSpace\];`),
		regexp.MustCompile(`else if \(onScreen\(\)\) return;`),
		regexp.MustCompile(`\[panel setCollectionBehavior:kIconSpaces\];\s*\[panel orderFrontRegardless\];\s*after\(0\.3, \^\{ readBack\(\); \}\);`),
		regexp.MustCompile(`NSApplicationDidChangeScreenParametersNotification object:nil[\s\S]{0,800}placeIcon\(\);[\s\S]{0,600}after\(kScreenSettle, \^\{\s*if \(k != screenChanges\) return;\s*orderInIfDropped\(@"screens settled"\);`),
	} {
		if !want.MatchString(src) {
			t.Errorf("floaticon_darwin.m: no %q", want)
		}
	}
	if strings.Contains(src, "if (was) orderInIfDropped") {
		t.Error("floaticon_darwin.m: the re-read still looks only when the icon was shown before it")
	}
	// One definition of the icon's collection behaviour, used at creation and
	// by the recovery, not a copy.
	if n := strings.Count(src, "NSWindowCollectionBehaviorCanJoinAllSpaces |"); n != 1 {
		t.Errorf("floaticon_darwin.m: the icon's collection behaviour is spelled %d times, want 1 (kIconSpaces)", n)
	}
	if n := strings.Count(src, "[panel setCollectionBehavior:kIconSpaces]"); n != 2 {
		t.Errorf("floaticon_darwin.m: [panel setCollectionBehavior:kIconSpaces] %d times, want 2 (creation and recovery)", n)
	}
}

// The check hooks exist only with FLOAT_LOG (leftovers-50 FR-3, S4): the
// signals, the .fs read and FLOAT_COMPACT sit inside the logFile branch, and
// so does the .away read that stands in for "not on the active desktop"
// (leftovers-60 FR-3).
func TestCheckHooksOnlyWithLog(t *testing.T) {
	b, err := os.ReadFile("floaticon_darwin.m")
	if err != nil {
		t.Fatal(err)
	}
	src := string(b)
	open := strings.LastIndex(src[:max(strings.Index(src, "signal(SIGUSR1"), 0)], "if (logFile) {")
	if open < 0 || !strings.Contains(src[open:], "signal(SIGUSR1") {
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
	for _, s := range []string{"awayStandIn = ", `%s.away"`} {
		if !strings.Contains(src, s) {
			t.Errorf("floaticon_darwin.m: no %q (the not-on-the-active-desktop stand-in)", s)
		}
	}
	for _, s := range []string{"SIGWINCH", "SIGINFO", `%s.fs"`, "fsStandIn = ", "awayStandIn = ", `%s.away"`, "readAway("} {
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
