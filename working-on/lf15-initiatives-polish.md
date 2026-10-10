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
