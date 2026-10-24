---
title: "The floating icon comes back after a desktop change: a second full-screen read, and the panel ordered in again when the window server dropped it"
status: next
repos: [organizer]
branch: lf50-float-space
seat: f50-build
reviewer: f50-review
stage: review-map
updated: 2026-10-24
next: "review: lf50-float-space, gate met (S1-S4, X0), b2b291a"
depends_on: []
boundary: ["docs/specs/leftovers-50.md Boundary"]
spec: "docs/specs/leftovers-50.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-50.md#Acceptance → gate"
ui_review: false
---

## Goal
Moving between desktops never leaves Pablo without the floating icon where it should be.

## Gate
docs/specs/leftovers-50.md, rows S1-S4 and X0; no row moves between desktops.

## Done
- f50-build, 2026-10-24: FR-1 to FR-3 on `lf50-float-space` (c0ea9c4, b2b291a), rebased on main at 2cf4882; code identical to the gated baadff1; S1-S4 and X0 pass, evidence and commands in `.wt-notes/f50-build/progress.md`.

## Declared changes
- modified `floaticon_darwin.m:fullScreenSpace`: takes a stand-in reading from the hook's `.fs` queue when one is waiting (FR-3)
- added `floaticon_darwin.m:onScreen`, `floaticon_darwin.m:readBack`: the window server's word on the panel, shared by the read-backs
- added `floaticon_darwin.m:orderInIfDropped`: a wanted panel visible to AppKit but off screen is ordered front again, once per read (FR-2)
- modified `floaticon_darwin.m:showIcon`: the 0.3 s read-back also runs `orderInIfDropped` (FR-2)
- modified `floaticon_darwin.m:FloatIconStart`: the desktop-change observer re-reads 0.5 s later, latest change wins (FR-1); with FLOAT_LOG, SIGWINCH (desktop change with `.fs` stand-ins), SIGINFO (drop stand-in) and FLOAT_COMPACT=1 (compact at start) (FR-3)
- modified `floaticon_darwin_test.go`: `TestSpaceChangeReread`, `TestCheckHooksOnlyWithLog` (S4)
Risky:
- `orderInIfDropped`: a panel fully covered by another app's floating-level window reads off screen and is ordered above it, once per read
- the drop stand-in covers the panel instead of ordering it out: no public call orders a window out and leaves `isVisible` at 1 (progress.md, Choices)
Not changed, on purpose:
- `update`: its decision is unchanged; the re-read is a second call to it
- `scripts/floating-icon-by-hand.sh`: Pablo's optional look with real desktop moves; no step for a check hook belongs there

## Notes
- f50-build: FR-3's "orders the panel out behind the code's back" is done as a cover: an opaque window of the panel's level and frame above it gives isVisible=1, on screen=0, and orderFrontRegardless is what puts the panel back (S3 region shots). Tried and not usable: orderOut plus KVC visible=YES (back on screen), alpha 0 (still on screen), a level below the desktop (orderFront does not undo it).
- f50-build: with FLOAT_SHOW_ICON=1 the state stays home with the main window here, so update hides the icon whatever fs reads; the rows use FLOAT_COMPACT=1.
