---
title: Decisions as the operator's main view - find, a summary line, sections that fold, the Timeline last and closed
status: next
repos: [organizer]
branch: decisions-view
updated: 2026-10-03
next: "fse: start a supervisor once time-zoom is in done/ (0072 ruled, accept as written)"
depends_on: [header-fold-2, time-zoom]
boundary: ["frontend/src/components/DecisionsView.tsx (page frame, summary, find, section headings, Ruled's limit, Timeline row label and position; dec-line's sticky head and its name, Amendment 1 once 0074 is ruled; not the record body, the Timeline's axis, marks or zoom)", "its CSS", "frontend/src/lib/ and its tests (find match, summary words, turnaround words)", "frontend/src/stores/board.store.ts (the three sections' remembered open state only)", "testdata/ fixtures the gate rows need", "not: Go, the rule box, InitiativeHeader.tsx, Roadmap*.tsx, docs/design-system.md, ~/agent-slack"]
spec: "docs/ux/specs/decisions-view.md (Aglaea, 9386d15, with the FSE's Technical notes); the review docs/ux/reviews/2026-10-03-decisions-view.md (D1-D7)"
gate: "docs/ux/specs/decisions-view.md Acceptance B1-B11, and B12-B14 (Amendment 1) once 0074 is ruled, plus the tests row below"
ui_review: true
---

## Goal
The Decisions sub-view fit for the operator who spends most of his time in
it: rule what waits, check what he just ruled, find an old ruling, see the pace.

## Gate
- [ ] B1-B11: see `docs/ux/specs/decisions-view.md`, Acceptance
- [ ] B12-B14: Amendment 1 of the same spec (if 0074 accepts it)
- [ ] `cd frontend && npm test` passes with tests for the find match, the summary line's cases and the turnaround words; `go test ./...` green; `wails build` succeeds

## Done
- 2026-10-03 Aglaea's Amendment 1 (2b6d608) adds the sticky record head and the line's name (B12-B14); proposed in 0074
- 2026-10-03 0072 ruled by pablo (accept as written; the four jobs stand)
- 2026-10-03 cut by the FSE from Aglaea's review and spec (9386d15)

## Next

## Blockers

## Notes
Sequenced after header-fold-2 and time-zoom: all three touch DecisionsView.tsx.
