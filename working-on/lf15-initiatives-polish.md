---
title: "The Initiatives view's and Agents' polish from its reviews"
status: now
repos: [organizer]
branch: lf15-initiatives-polish
seat: lp-build
stage: one-window
updated: 2026-10-09
next: "P1 (U1): run the review build on the fixture and log the Memory cell x per Agents row (or the FSE amends P1/P3 to vitest under 0108); then P3 (U3): AX focus on the title after Initiatives ›"
review: fail
depends_on: []
boundary: ["the spec's Boundary for this card"]
spec: "docs/specs/leftovers-15.md (FR-4 to FR-10)"
gate: "docs/specs/leftovers-15.md Acceptance, rows P1 to P7 and X0"
ui_review: true
---

## Goal
Leftovers from 2026-10-09's reviews (0111).

## Gate
docs/specs/leftovers-15.md, P1 to P7 and X0. Evidence in `.wt-notes/lp-build/` (`progress.md` says how to reach each state on the fixture).
- [x] P1-P7 (FR-4 to FR-10): vitest per helper, `p-rows.log`: P1 `memoryTrack.test.tsx` (U1), P2 `rowMemoryWords`/`groupMemory`, P3 `landingOf` + `landing.test.ts` (U3), P4 since today/leaves/fold names, P5 `limitNames`, P6 `confirmLines` last awake, P7 `inactiveLabel`.
- [x] X0: `x0.txt`, clean clone at ee56253: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (440 vitest), `cd frontend && npm run build` exit 0, `wails build` exit 0.

## Done
- 2026-10-09 lp-build: f9711b7 (lib words + vitest), a20dcbb (Memory cell last on the row, a fixed 64 px right-aligned track; row name `memory unknown`), cdfdaf8 (title landing, limit links only with a Sleep, chevron names, `Asleep (n)`), ee56253 (U1/U3 tests); rebased on main at 2de137c, unmerged.

## Notes
- U1 and U3 were proved by vitest, not on the review build (sup52, 2026-10-09): the review build was built but not launched, since the launch waited for Pablo to be idle and he was not. **No AX focus read and no window x measurement were done.** U1 is the rendered row order plus the stylesheet's fixed track (fails on main's AgentList), not pixels; U3 is the store plus `applyLanding` against a stand-in `document.activeElement`. There is no jsdom: adding it means `package.json`, outside the boundary.
- The Memory cell now comes after the actions in the DOM, so a row's reading order puts the figure after the buttons; the row's accessible name carries it first.
- FloatList's fold also holds archived initiatives, so `Asleep (n)` counts them (FR-10 as written).
- The fixture writes init-asleep's since date as 7 days ago; to see `asleep since today`, edit that date in the copy and Rescan.

## UI review
lp-ui, 2026-10-09, on ee56253 (the branch did not move): **fail**, sev 3: V1.

How it was checked: `make review-build` in a detached worktree, `Deltagos Review` started on `fixture-home.sh --memory normal` (pid saved, quit by it), 1440×900 window plus 1024×640 by setting my own window's AX size. seat-pointer refused (exit 7: a Dock-layer window covers the points, and I do not bring windows to the front), so every press was an AXPress on my own process and every reading an AX dump (`AXFocused`, frames); no pointer, keys or focus on Pablo's desktop. Shots and dumps in `.wt-notes/lp-ui/` (`wk-<w>x<h>-<row>-<state>.png`, `ax-*.txt`, `u1-memory-x.log`, the reader `ax.swift`). Vitest 440/440.

| Row | FR | State, how | Result |
|---|---|---|---|
| P1 | 4 | init-a › Agents, rail open, AX x of each `.a-mem` | **fails**: see V1 |
| P2 | 5 | `echo fail` to the memory file, 15 s, AX | pass: rows `…, idle, memory unknown`, summary `Memory —` |
| P3 | 6 | AXPress on Home's `Initiatives ›` and on the rail's Asleep `Initiatives ›` | pass: `AXFocused` = heading `Initiatives` both times (nothing focused before) |
| P4 | 7 | init-asleep dated today + Rescan; Sleep init-b; rail AX | pass: `asleep since today`; `1 decision waiting on you leaves Needs me…`; chevrons `Expand Roles`, `Collapse Asleep`, `Collapse Archived` |
| P5 | 8 | factory limit 10, ten awake | pass: init-blind a plain span, the nine others `<id>: go to its Sleep` buttons |
| P6 | 9 | every other initiative paused in the fixture copy, Sleep init-c (nothing live or waiting) | pass: the confirm shows `Home will be empty until one wakes.` alone |
| P7 | 10 | not reached (the list opens from the native icon) | code and vitest only |

**V1 (3) The Memory column still breaks: on rows that wrap, the figure drops to the start of a new line, under the state word.**
- What the lead cannot do: run an eye down Memory to compare seats (U1's task) at the app's default size.
- Where: init-a › Agents, the two `build-help` rows at 1440×900 with the rail open (`wk-1440x900-P1-agents-normal.png`), the second `aglaea` row at 1024×640 (`wk-1024x640-P1-agents-normal.png`).
- Evidence: AX x of the cells (`u1-memory-x.log`): 1440, agents rows 2331 except two at 1281; 1024, 1915 except one at 1281. The cause is `.a-actions + .a-mem { margin-left: 0 }`: when the line breaks between the actions and the cell, the cell starts the new line at the left. P1's own check ("cell x equal on every row") fails; the builder's vitest proves DOM order and CSS, not layout.
- Severity 3: the one thing FR-4 asks is not true at the default window, and the stray `< 0.1 GB` on its own line reads as part of the next line.
- Proposal: keep the cell at the right on any line (drop the `margin-left: 0` override so its own auto margin holds, or wrap actions and cell in one unit that does not break), then measure x on the review build at 1440 with the rail open and at 1024.

Recorded, not a fail:
- **V2 (1)** the crew seats' track sits 11 px left of the agents list's (2320 vs 2331, the crew box's inset): two columns side by side, not one. Proposal: same right inset, or accept it as two lists.
- **V3 (2)** FloatList's `Asleep (n)` counts archived initiatives too (the builder's note; the fixture would read `Asleep (2)` beside the rail's `Asleep (1)` and `Archived (1)`). An archived one is called asleep where Wake does not apply.
- **V4 (1)** a crew seat that is off has a Memory cell named `Memory unknown, not running`: unknown says the reading failed when nothing runs. The row name already handles this right (FR-5).

Spec gaps (for the FSE): FR-10 says `Asleep (n)` but the group also holds archived ones (V3: split it, or name it for both); FR-4 named no width or rail state for "row under row" (P1's check needed 1440 rail open and 1024).

For aglaea: none new (A1-A3 of initiatives-view still open).

Not verified in WKWebView: P7 (FloatList's label, by code and `floatList.test.ts`); the visible focus ring on the title (the window was never key, so no ring shows; `:focus-visible` read from the CSS); Home's `Wake one in Initiatives ›` (none-awake state, same `openInitiatives("title")` call); keyboard Tab order.

## Review
**Fail.** The diff does what FR-4 to FR-10 ask, and X0 passes. The P1-P7 row on main also asks for the review build on the fixture for U1 (cell x equal on every row, logged) and U3 (AX focus on the title). Neither was done, and I could not do them either.

- X0: met. Fresh clone at ee56253 under `.wt-notes/lp-review/clean`: `XDG_DATA_HOME=$(mktemp -d) test-lease run -- make test` exit 0 (29 files, 440 vitest), `npm install && npm run build` exit 0, `wails build` exit 0 (logs `.wt-notes/lp-review/x0-*.log`).
- P1 (FR-4, U1): **unmet.** In the diff the cell moves last on the row (`AgentList.tsx`, `Crew.tsx`) and gets a fixed 64 px right-aligned track (`initiatives.css`). `memoryTrack.test.tsx` proves DOM order and the CSS text, not an x. No x per row was logged from the review build, which the row asks for. The card and progress.md both say so.
- P2 (FR-5): met. `rowMemoryWords` builds `memory unknown` from the cell's own words, and `groupMemory` returns `Memory —` when there is no reading. Read in the diff and tested.
- P3 (FR-6, U3): **unmet.** The diff has `openInitiatives("title")` on Home's two links and the rail's fold link, plus an `h1` with tabIndex -1 that `applyLanding` focuses. `landing.test.ts` uses a stand-in `activeElement`. The row asks for an AX focus read on the review build, and none was done.
- P4 (FR-7): met. `sinceLine` gives `today` on the same local day, `leaves` agrees with a total of 1, and `foldName` names all four rail chevrons. Read in the diff and tested.
- P5 (FR-8): met. `limitNames` makes a link only when `canAct`; the others are a plain mono span.
- P6 (FR-9): met. `confirmLines` always pushes the empty-Home line when last awake.
- P7 (FR-10): met. `inactiveLabel` gives `Asleep (n)` in FloatList (the label, aria-label and filtered head).
- Why I did not run U1/U3 myself: at ~23:10 Pablo's HID idle read 0-4 s across a minute. Launching `Deltagos Review` takes focus, which 0108 and the task rules forbid, so I used no other evidence for the screen halves and did not wait.
- Gate note for sup52/FSE: sup52 told the builder to use vitest for U1/U3, but the spec on main was not amended. Under 0108 the FSE amends a gate row, not the supervisor. Either amend P1/P3 or run both on the review build while Pablo is idle.
- Unmet: P1, P3.
- Reviewer lp-review, 2026-10-09, commit ee562539410a2a41d11b96742f273c91176a3424.
