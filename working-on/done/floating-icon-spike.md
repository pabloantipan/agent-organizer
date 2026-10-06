---
title: Spike - can Deltagos float as a native icon on other desktops (macOS, Wails v2)?
status: done
repos: [organizer]
branch: floating-icon-spike
updated: 2026-10-05
next: "done: reviewed pass at d8d6585; the Findings feed the build spec"
review: pass
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
- 2026-10-05 sup42: Findings on main as afe792d (from 4a708f0); branch floating-icon-spike kept, unmerged; seats ended, threads closed; run record runs/2026-10-05-floating-icon-spike.md
- 2026-10-05 fis-build: Pablo's by-hand pointer take written into the Findings (d8d6585); y1-pointer.mov is run 1's recorder, covering run 2's actions
- 2026-10-05 fis-build: review fixes: findings corrected (83e704e), real pointer paths log coordinates (e91d2a7), by-hand take script .wt-notes/fis-build/y1-pointer.sh prepared, not run
- 2026-10-05 fis-build: spike on floating-icon-spike (b0ef83a, cec8595), findings ee49014; recording .wt-notes/fis-build/y1.mov; FR-1..4 yes with conditions
- 2026-10-05 sup42: worktree .wt/floating-icon-spike from cda89ab; seat fis-build launched
- 2026-10-05 0089 ruled by pablo ("ok", a2b53a0); sup42 launched by the FSE
- 2026-10-05 cut by the FSE from 0088

## Next

## Blockers

## Review
pass at d8d6585 (findings d8d6585, after 83e704e and e91d2a7; fresh clone of that SHA).

Unmet: none.

Y1 is met. The take-4 rows still match `y1.mov` and `float.log`. The pointer rows match `y1-pointer.mov` and the log from `--- POINTER TAKE 16:41:39` to within ±0.5 s:
- t 31.7–32.7: a pointer drag that starts at 4.3 px and moves 1043 px. The frames show the icon dropped mid-right on S3.
- t 33.2: a pointer click at 0.8 px. By t 34.5 the 360×520 list is by the icon and the icon is gone.
- t 38.3–39.8: a second drag on S2, starting at 21.7 px.
- t 40.2: a click at 0.0 px. The list comes from S3 to S2 at 360×520 (frame 41.5).
- t 41.9: Deltagos goes full on S2.
- t 42.3: the icon shows on S1.

Pick nothing and Compact were driven by code, as the Findings say. Those calls are the same native functions the UI calls (`FloatIconDismiss`, `FloatIconCompact`). Y2 is met: every FR has a verdict with numbers. `go build ./...` and `wails build` pass. No `CGS*`/`SLS*` in source or binary imports.

My first-round errors are all corrected:
- The drag driver is no longer called the same code as a pointer drag.
- The 0.5 s re-check that hid the panel twice (lines 599, 614) is now build-spec risk 2.
- The notification count is 106/70.
- `wc -l` is 413/416.
- One display only is stated.

Left in the Findings, not blocking: the FR-1 bullet contradicts itself. Its lead says the drag was proven by hand. Its body still says "not exercised … Pending the by-hand take".

Not covered by the gate:
- Pick nothing and the top-bar button were never pressed by hand.
- The full-screen check can misfire on a fast switch.
- Whether a Developer ID build launched from Finder needs no new entitlement is unverified.

Boundary: d8d6585 and 83e704e touch only the spec. Nothing on main outside `working-on/` came from a seat of this card (0ab7ce7 is the FSE's bitácora).

Round 1, ee49014: fail, unmet Y1, because the pointer drag and click were never run and the drag driver is not the mouseDragged path (213f13b).

reviewer: fis-review, 2026-10-05

## Notes
Aglaea designs the icon, the floating look and the list panel in parallel.
- fis-build: FullScreenNone does not keep the panel off full-screen Spaces; a CGWindowList check does.
- fis-build: drag, click, pick nothing and Compact in Y1 were driven by a signal driver, not the pointer (synthetic mouse refused to the seat); verify by hand.
- fis-build: only MoveToActiveSpace (or a temporary CanJoinAllSpaces) brings the window; activation otherwise switches the user back.
