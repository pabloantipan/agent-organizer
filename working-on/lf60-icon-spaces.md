---
title: "The floating icon keeps its place on every desktop, and comes back after a display change"
status: now
repos: [organizer]
branch: lf60-icon-spaces
seat: l60-icon
reviewer: l60-icon-rev
stage:
updated: 2026-11-01
next: "review: lf60-icon-spaces, gate met (I1-I4, X0), d4d0e35"
depends_on: []
boundary: ["docs/specs/leftovers-60.md Boundary"]
spec: "docs/specs/leftovers-60.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-60.md#Acceptance → gate"
ui_review: false
---

## Goal
The icon is on whichever desktop Pablo is on, however long Deltagos has run.

## Gate
docs/specs/leftovers-60.md, rows I1-I4 and X0.

## Declared changes
- modified `floaticon_darwin.m:orderInIfDropped`: also catches a panel not on the active desktop (or the .away stand-in); sets `kIconSpaces` again and orders front, once per read; read-back only logs (FR-1)
- added `floaticon_darwin.m:kIconSpaces`: the one collection behaviour, used by `build` and the recovery
- modified `floaticon_darwin.m:readBack`: logs on-the-active-desktop and the behaviour read back
- modified `floaticon_darwin.m:FloatIconStart`: the space-change re-read drops the `was` guard; the screen-parameters observer runs the recovery after `kScreenSettle` (1 s) (FR-2); `readAway` reads `<FLOAT_LOG>.away` on SIGUSR1 and SIGWINCH, inside `if (logFile)` (FR-3)
- modified `floaticon_darwin_test.go`: TestSpaceChangeReread and TestCheckHooksOnlyWithLog extended (I3, I4)
Risky:
- `orderInIfDropped`: without the `was` guard a re-read right after a show may order front once more; no loop, the read-back only logs
Not changed, on purpose:
- `floaticon_darwin.go`, `floaticon_darwin.h`: no hook needed a Go line
- no second screen observer: main already had one (the spec's premise was wrong); the read was added to it

## Done
- I1: met. `.wt-notes/l60-icon/i1.log`: `screens settled: not-on-the-active-desktop stand-in from the .away file (0 left)`, `screens settled: icon wanted, isVisible=1 but not on the active desktop: collection behaviour set again, ordered front`, `icon read back: isVisible=1 on screen=1 ... behaviour 0x251 (all desktops 1)`.
- I2: met. Same log after SIGINFO then SIGUSR1: `screens settled: icon wanted, isVisible=1 but off screen (occlusion 8192): collection behaviour set again, ordered front again`, then read back on screen=1. Desktop-change path also shown in `w.log` (FLOAT_COMPACT, SIGWINCH).
- I3: met. TestSpaceChangeReread passes; 7 new assertions fail over origin/main's source (`.wt-notes/l60-icon/tests-on-main.txt`).
- I4: met. TestCheckHooksOnlyWithLog passes with `awayStandIn = `, `%s.away"`, `readAway(` inside the logFile branch; 2 fail on main.
- X0: met. make test (go 19 ok, vitest 1297), wails build, make review-build exit 0; `git status --porcelain` empty (`x0-*.txt`).

## Notes
- Spec premise "nothing listens for a display change" was wrong; the read went into the existing observer.
- I1/I2 trigger the read with SIGUSR1: with FLOAT_SHOW_ICON alone a SIGWINCH hides the icon (state home), so the desktop-change path needs FLOAT_COMPACT.
