---
title: "One band at the top: no native title text, no brand word, the lights in the top bar, the version in About and Settings"
status: next
repos: [organizer]
branch: lf55-one-title
seat: l55-title
stage:
updated: 2026-10-26
next: "sup95: a fresh l55-title seat runs H3, the window shots and the Hidden-vs-HiddenInset hit-test once Pablo clears the Dock layer (.wt-notes/l55-title/progress.md); branch at f2ad73c, X0 passes"
depends_on: []
boundary: ["docs/specs/leftovers-55.md Boundary"]
spec: "docs/specs/leftovers-55.md (FR-1 to FR-8)"
gate: "docs/specs/leftovers-55.md#Acceptance → gate"
ui_review: true
---

## Goal
With the window in front Pablo reads "Deltagos" once, in the menu bar, and the window still moves, zooms and is found by its name.

## Gate
docs/specs/leftovers-55.md, rows H1-H6 and X0; the UI review checks one-title T1 to T9.

## Done
- 2026-10-26 l55-title: built on lf55-one-title (b790e9d, ad9ec33, beedf63, f2ad73c). HiddenInset with a 52 px bar: lights centre y 26.0, bar content line 25.5. About Deltagos added, Settings' foot, the gate band, drag via --wails-draggable, FR-7 toolbar fix. X0 passes at f2ad73c. Stopped at the context cap.

## Notes
- Title-bar variant HiddenInset: the only one that centres the lights on a 40-52 px bar (Hidden: centre 16). Measured in progress.md.
- AXToolbar hit-test: HiddenInset's empty NSToolbar is 66 px tall, and AX hit-test at the Initiatives tab returns AXToolbar for y 8, 25, 58 and 65, web content from y 67. It may eat clicks on the bar's controls; H3's real click decides. A TitleBarHidden variant is built in .wt-notes/l55-title/variant for comparison.
- H3 is blocked: seat-pointer exits 7 on every point (Dock window, layer 20, 3440x1440); sup95 has handed it to Pablo. Then Pablo's screen locked, so the remaining window shots wait too.
- On main, -webkit-app-region was inert (WKWebView), so the bar never dragged; the drag now uses --wails-draggable.
- CLAUDE.md's Packaging paragraph still says the version is "shown in the top bar" (outside this boundary).
