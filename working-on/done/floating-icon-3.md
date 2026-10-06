---
title: The floating list ends at its last row, the icon 8 px under the menu bar, shown beside a zoomed window, and the open list closes at once
status: done
repos: [organizer]
branch: floating-icon-3
seat: fi3-build
stage: one-window
updated: 2026-10-06
next: "merged to main as 8679b54 (sup46)"
depends_on: []
boundary: ["floaticon_darwin.m, floaticon_darwin.h, floaticon_darwin.go", "frontend/src/components/FloatList.tsx, frontend/src/styles/float.css, frontend/src/lib/floatList.ts and its test", "scripts/floating-icon-by-hand.sh", "not: docs/ux/specs/floating-icon.md, the Ruled line, scripts/fixture-home.sh"]
spec: "docs/specs/leftovers-13.md (FR-6 to FR-9); docs/ux/specs/floating-icon.md Amendment 3 (3bc5164)"
gate: "docs/specs/leftovers-13.md, card floating-icon-3, rows F13 to F16 and X0; every row by the seat (0095)"
ui_review: true
review: pass
---

## Goal
Aglaea's Amendment 3: four floating-icon details left by sup43 and sup44.

## Gate
docs/specs/leftovers-13.md, F13-F16 and X0. Every row by fi3-build with CGEvent and AppleScript, read back (window server, AX, pixels, float log); main 382cc2e vs branch (b3, 0dacae0's code), 3440x1440 @1x, menu bar 31, icon 88 pt.
- [x] F13: `pay` leaves one row: gap under it 75 px on main (window 360x160), **8 px** on the branch (360x93); `billing` 8, `pa` (two rows) 8, `zzz` shrinks to the note (101), empty caps at 480 and scrolls; the height follows each keystroke
- [x] F14: dragged to the top: tile top 63 px under the menu bar on main (at 88), **8 px** on the branch at 56, 72 and 88 (window list tile y 39, hairline pixel at y 39); Dock, left and right still 8 px at every size; 12 drags, no click
- [x] F15: zoomed TextEdit: shown on main too (a zoomed window stops under the menu bar; main hid only a window covering the whole display, shown with fi3-build's edge-to-edge test window: hidden on main, **shown** on the branch); TextEdit full screen: **hidden** on both (branch: `Dock backdrop 1, Finder desktop 0: a full-screen Space`); back from full screen: shown
- [x] F16: one click with the list open: main closes 542 ms after the mouse-up (`close waits 500 ms`); branch `list isVisible=0` **15 ms** after the click, off screen 48 ms after the posted up. Two clicks 100 ms apart: closed 8 ms after the first, then the full window grows from the icon (198 ms), no 360-wide frame after the close
- [x] Regression: F11 list front 2-9 ms; F5 `pay` + Enter, partner-payouts full (198 ms); F7 Escape twice and a click outside (on fi3-build's own window) close at once; F10 double-click on the closed icon opens full at the last view (Home, then partner-payouts)
- [x] X0: fresh clone at 453c4c6: `XDG_DATA_HOME=$(mktemp -d) make test` (go ok, vitest 276), `npm run build`, `wails build` all exit 0; 0 CGS/SLS symbols

## Done
- 2026-10-06 fi3-build: gate met on `floating-icon-3`, rebased on main a43a624 (86a85b4 list ends 8 px under its last row, 8b1235c icon 8 px under the menu bar, 1368ebe only a full-screen Space hides the icon, 0dacae0 a click on the icon closes the list at once and a second grows full from the icon, 453c4c6 by-hand script, not a gate). Numbers, tools and recipe in `.wt-notes/fi3-build/progress.md`

## Notes
- 0096 ruled 2026-10-06; supervisor sup46, spawned by the FSE.
- fi3-build: F15's "main: hidden" did not hold here: a zoomed window stops under the visible menu bar, so main's edge-to-edge test never matched it; main hid the icon only for a window that covers the whole display on a normal desktop (a zoomed window when the menu bar hides itself, any borderless one), which the branch now shows. A full-screen Space is read from the Dock's backdrop window, which also covers split view.
- fi3-build: entering full screen fires two space changes; the first, mid-slide, still shows the icon for about a second before the second hides it (T3's floor, unchanged). Leaving full screen, main left the icon hidden on the normal desktop; the branch shows it.
- fi3-build: once (run b1) the log said `icon shown` while the window server kept the panel off screen over several desktop changes; not reproduced in two more runs. The float log now reads every show back (`icon read back: … on screen=`).
- fi3-build: rlf-build's review build activates itself on desktop 2 and moved the screen under these runs; rows were re-run when it did.

## Review
- Verdict: **pass** (code review; the built-app rows are re-driven by fi3-ui).
- Commit reviewed: 453c4c6acdef734f6df4dca691d2a76f2dac42d4 (branch `floating-icon-3`).
- Unmet gate items: none.
- Checks: fresh clone at 453c4c6, `XDG_DATA_HOME=$(mktemp -d) make test` 0 (go ok, vitest 276), `npm install && npm test && npm run build` 0, `wails build` 0; `nm` of the bundle's binary: 0 CGS/SLS symbols. Boundary: 4 paths changed (`floaticon_darwin.m`, `FloatList.tsx`, `float.css`, `scripts/floating-icon-by-hand.sh`), all inside.
- Code: FR-6 `kListMinH` 160 → 64 guard, height = field + rows + 7 px padding + 1 px edge, ResizeObserver on the rows follows each keystroke; FR-7 `constrainFrameRect:` returns the frame, `clampTile` still insets the tile 8 on all four sides at every size (place, drop, clamp); FR-8 Dock backdrop test, fallback covering window without Finder desktop, public CGWindowList only; FR-9 `iconClicked` dismisses at once, `doubleClicked` after a close goes to `growFromIcon` (never `bringList`), order-out animation off while the list, `kDragAt` 4 unchanged.
- Evidence re-read: F14 hairline 8 px under the menu bar re-measured from `f14-b3-88/w1512/w2560.png` (main 63); F13 pixel column of `f13-b3-pay.png` ~8 px under the row; F15/F16 from `float-b3.log` and `watch-b3-f16b.txt` (read-backs, not targets).
- Gate note for the FSE: F15's "main: hidden both" did not hold (a zoomed window stops under the menu bar, main showed the icon too); the row's failing case on main is only the edge-to-edge window, which the builder showed. The fallback still hides the icon for a covering window on a normal desktop when Finder's desktop window is absent (`CreateDesktop` off); no row covers it.
- Reviewer: fi3-review, 2026-10-06.

## UI review
- Verdict: **pass**. Sev 4/3: none. For aglaea: U-D1.
- Commit run: 453c4c6acdef734f6df4dca691d2a76f2dac42d4, detached worktree, `make review-build`, `Deltagos Review.app` (pid 60661) on a fresh `--twenty` fixture; one 3440×1440 @1x display, menu bar 31, Dock bottom (visible 0,31 3440×1306), icon 88 pt (72 and 56 by the build's width stand-in). The branch did not move during the run.
- Driven by synthetic CGEvents from fi3-build's `fi3ev` (copied), with a guard that the topmost window at the point is pid 60661 or a window I opened. AX through `wkax`; desktops through System Events. Evidence: `.wt-notes/fi3-ui/` (`float-u1.log`, `f13-u1-*.png`, `f14-u1-*.png`, `f15-u1*.{txt,png}`, `f16-u1*.txt`, `watch-u1-*.txt`).

| Row | How checked | Result |
|---|---|---|
| F13 list ends at its last row | `pay`, `billing`, `pa`, `zzz` typed into the field; list window frame (CG) and last 36 px row (AX) read back; shots | `pay` 360×93, last row bottom 1209, window bottom 1217: **8 px**; `billing` 8 px; `pa` (2 rows plus the Not active heading) 360×161, 8 px; `zzz` 360×101 (note and Clear); the empty field is 480 tall and scrolls; height follows each keystroke (log `list height`) |
| F14 top edge 8 px | drags to top, bottom, left and right at 88, 72, 56 pt; tile from the window list; hairline pixel down the tile's centre column; shots | top: tile y 39, hairline #2b2831 at y 39, **8 px** under the menu bar at all three sizes, tile clear of the bar in the shots; bottom 1329 (Dock top 1337); left x 8; right edge 3432 = 3440−8 at every size |
| F15 zoomed shows, full screen hides | my TextEdit document zoomed by AppleScript (0,31 3440×1306, zoomed true); my borderless edge-to-edge window; the same TextEdit full screen (AXFullScreen), then back | zoomed: **shown** (`icon read back … on screen=1`, shot `f15-u1-zoomed.png`); edge-to-edge window: shown (`Dock backdrop 0, Finder desktop 1: a normal desktop`); full screen: **hidden** (`Dock backdrop 1, Finder desktop 0: a full-screen Space`, panel onscreen=0), with no brief show on entry this run; back: shown |
| F16 one click, list open | click on the tile; float log `isVisible` plus a 2 ms CG watch | compacted: `isVisible=0` **9 ms** after the click, off screen 28 ms after the mouse-up; plain state (another desktop): 11 ms and 7 ms |
| F16 two clicks within the interval | clicks 100 ms apart (interval 500) with the list open; CG watch of every frame | closed 7 ms after the first click; the second click (`clickCount 2`) grows full from the 88×88 tile (first frame {3344,648 88x88}), growth **200 ms** (201 ms when compacted), `key=1`; **0** frames 360 wide after the close; log `the list not reopened` |
| F11 (touched) | single click on the closed icon | list front 2–15 ms after the click |
| F7 (touched) | `da`, Escape, Escape; a click outside on my own window | Escape clears to 480, the second Escape closes; a click outside closes 34 ms after the mouse-up (`app active=0`) |
| F10 (touched) | double-click on the closed icon | list at the first click, full at the second, growth 190 ms, at Home (the last view) |
| F5 (touched) | click, `pay`, Enter | 360×93, then partner-payouts full, growth 202 ms, crumb partner-payouts (AX) |
| F4/F12 (touched) | edge drags at three sizes | never under the menu bar or the Dock; radius and size follow 88/72/56 (`size (place)` lines) |

- Findings: none.
- Design questions, **for aglaea**:
  - U-D1 (sev 1 if anything): on two clicks with the list open, nothing of Deltagos is on screen between the list's close and the growth's first frame. That gap is the lead's own gap between the clicks (138 ms here, 965 → 103). Amendment 3 accepts "closed, then the full window grows". The open question is whether a slow double-click (up to 500 ms) of empty reads as a blink. Not a defect against the spec.
- Spec gaps, for the FSE:
  - U-G1: Amendment 3's "8 px under the last row" has nothing to measure in the no-match and no-initiatives states. The note sits 16 px above the window bottom (Clear's bottom 1201, window 1217), and nothing says what is right.
  - U-G2: as fi3-review says, F15's "main: hidden both" did not hold. I did not run main; only the branch was checked.
- Not verified:
  - Reduce motion (no growth under it): it is a setting I may not change.
  - A real second display: sizes came from the width stand-in on one display.
  - Split view.
  - VoiceOver and keyboard F9 beyond Escape.
  - A human's click.
- Environment, so the next reviewer is not misled:
  - From about 13:13, clicks posted at the HID tap stopped being delivered system-wide, while moves still went through. My own probe window confirmed it. AX actions and permissions were fine.
  - The plain-state F16 and the F15 shot used a copy of `fi3ev` posting at the session tap, which still goes through the window server's hit-testing. Every other row ran on the HID tap before 13:13.
  - Desktop changes I did not make, from rlf-build's app and from another session, interrupted two runs (the first 72 pt edge set and the first plain-state F16). Those were re-run and are not counted.
- Reviewer: fi3-ui, 2026-10-06.
