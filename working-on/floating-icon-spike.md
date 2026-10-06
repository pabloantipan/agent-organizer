---
title: Spike - can Deltagos float as a native icon on other desktops (macOS, Wails v2)?
status: next
repos: [organizer]
branch: floating-icon-spike
updated: 2026-10-05
next: "review: floating-icon-spike, Y1 pointer take in (drag, 4 px click, window to the active Space at 360x520 proven by hand; pick nothing by hand not done, driver only), findings at d8d6585"
review: fail
depends_on: []
boundary: ["a spike branch floating-icon-spike, never merged", "docs/specs/floating-icon-spike.md (its Findings section) is the only file that comes back to main", "not: any production file on main"]
spec: "docs/specs/floating-icon-spike.md (FR-1 to FR-5); scope 0088"
gate: "docs/specs/floating-icon-spike.md Acceptance, rows Y1 and Y2"
ui_review: false
seat: fis-build
---

## Goal
Know, with a recording and numbers, whether the 0088 behaviour can be built on Wails v2.

## Gate
- [x] Y1: see `docs/specs/floating-icon-spike.md`, Acceptance
- [x] Y2: see `docs/specs/floating-icon-spike.md`, Acceptance

## Done
- 2026-10-05 fis-build: Pablo's by-hand pointer take written into the Findings (d8d6585); y1-pointer.mov is run 1's recorder, covering run 2's actions
- 2026-10-05 fis-build: review fixes: findings corrected (83e704e), real pointer paths log coordinates (e91d2a7), by-hand take script .wt-notes/fis-build/y1-pointer.sh prepared, not run
- 2026-10-05 fis-build: spike on floating-icon-spike (b0ef83a, cec8595), findings ee49014; recording .wt-notes/fis-build/y1.mov; FR-1..4 yes with conditions
- 2026-10-05 sup42: worktree .wt/floating-icon-spike from cda89ab; seat fis-build launched
- 2026-10-05 0089 ruled by pablo ("ok", a2b53a0); sup42 launched by the FSE
- 2026-10-05 cut by the FSE from 0088

## Next

## Blockers

## Review
fail at ee49014 (branch floating-icon-spike, clone of that SHA).

Unmet: Y1, two points: "drag the icon" and "click it on Space 3" were never done with the pointer. The log of every run has no real `click` or `drag start` line, only `demo click` and `demo drag`. The click driver does call the same code as `mouseUp` (`bringMain` + `floatIconClicked`). The drag driver does not: it animates `setFrameOrigin` and skips `mouseDown/Dragged/Up` and the 4 px threshold. So FR-1's "draggable with a 4 px click/drag threshold" was never exercised. Y2 is met: every FR has a verdict with numbers.

Verified: the take-4 table matches the frames and `float.log` to ±0.2 s on every row: icon after the slide on S2/S3, hidden on the full-screen Space, the 360×520 list by the icon on S3, back to S1 full, Compact shows the icon on S1. Pick nothing and Compact go through the same calls as the UI (`Dismiss`, `Compact`). No `CGS*`/`SLS*` in source or binary imports. `go build ./...` and `wails build` pass. The Wails internals (`userMinSize`, `Regular` + `activateIgnoringOtherApps`) are as stated, and so is `codesign --options runtime` with no entitlements. The boundary holds: ee49014 touches only the spec, and nothing on main came from this seat.

The Findings get wrong or leave out:
- "SIGUSR1 runs the same native code ... a drag runs": false for drag.
- "the 0.5 s re-check never changed anything": false. `float.log` lines 599 and 614 (before take 4): the re-check hid the panel through the full-screen check during back-to-back switches. Mid-slide, CGWindowList lists both Spaces' windows (line 614 lists TextEdit on the way to S1). The full-screen check can misfire on a fast switch.
- "about 40" switches logged: the log has 70 notifications.
- `floaticon_darwin.m` is 413 lines, not 411.
- The full-screen check compares a window against every screen's size. It was tried on one display only, and a second, smaller display is untested.

Gate note for Pablo: Y1's "or the finding says why not" lets a spike pass a point it never ran. For pointer behaviour, the gate should name a by-hand check.

reviewer: fis-review, 2026-10-05

## Notes
Aglaea designs the icon, the floating look and the list panel in parallel.
- fis-build: FullScreenNone does not keep the panel off full-screen Spaces; a CGWindowList check does.
- fis-build: drag, click, pick nothing and Compact in Y1 were driven by a signal driver, not the pointer (synthetic mouse refused to the seat); verify by hand.
- fis-build: only MoveToActiveSpace (or a temporary CanJoinAllSpaces) brings the window; activation otherwise switches the user back.
