---
title: "The Initiatives view's and Agents' polish from its reviews"
status: now
repos: [organizer]
branch: lf15-initiatives-polish
seat: lp-build
stage: one-window
updated: 2026-10-09
next: "review: lf15-initiatives-polish, gate met (P1-P7, X0; U1/U3 by vitest, no AX read), ee56253"
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
