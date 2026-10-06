---
title: The floating list ends at its last row, the icon 8 px under the menu bar, shown beside a zoomed window, and the open list closes at once
status: now
repos: [organizer]
branch: floating-icon-3
seat: fi3-build
stage: one-window
updated: 2026-10-06
next: "review: floating-icon-3, gate met, 453c4c6"
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
