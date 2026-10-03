---
title: Decisions as the operator's main view - find, a summary line, sections that fold, the Timeline last and closed
status: now
repos: [organizer]
branch: decisions-view
updated: 2026-10-03
next: "review: decisions-view, gate met (B1-B14 measured, tests green; branch decisions-view e056cba)"
depends_on: [header-fold-2, time-zoom]
boundary: ["frontend/src/components/DecisionsView.tsx (page frame, summary, find, section headings, Ruled's limit, Timeline row label and position; dec-line's sticky head and its name, Amendment 1 (0074); not the record body, the Timeline's axis, marks or zoom)", "its CSS", "frontend/src/lib/ and its tests (find match, summary words, turnaround words)", "frontend/src/stores/board.store.ts (the three sections' remembered open state only)", "testdata/ fixtures the gate rows need", "not: Go, the rule box, InitiativeHeader.tsx, Roadmap*.tsx, docs/design-system.md, ~/agent-slack"]
spec: "docs/ux/specs/decisions-view.md (Aglaea, 9386d15, with the FSE's Technical notes); the review docs/ux/reviews/2026-10-03-decisions-view.md (D1-D7)"
gate: "docs/ux/specs/decisions-view.md Acceptance B1-B11, and B12-B14 (Amendment 1, 0074), plus the tests row below"
ui_review: true
seat: dv-build
---

## Goal
The Decisions sub-view fit for the operator who spends most of his time in
it: rule what waits, check what he just ruled, find an old ruling, see the pace.

## Gate
- [x] B1-B11: see `docs/ux/specs/decisions-view.md`, Acceptance
- [x] B12-B14: Amendment 1 of the same spec (0074)
- [x] `cd frontend && npm test` passes with tests for the find match, the summary line's cases and the turnaround words; `go test ./...` green; `wails build` succeeds

## Done
- 2026-10-03 dv-build: built on decisions-view (5907cff lib, 32941c1 store, e056cba view); B1-B14 measured in headless Chromium against the fixture and a 74-record copy, numbers and shots in .wt-notes/dv-build/progress.md; make test, npm run build, wails build green
- 2026-10-03 sup27 launched by the FSE (0072, 0074 ruled, accept as written)
- 2026-10-03 Aglaea's Amendment 1 (2b6d608) adds the sticky record head and the line's name (B12-B14); proposed in 0074
- 2026-10-03 0072 ruled by pablo (accept as written; the four jobs stand)
- 2026-10-03 cut by the FSE from Aglaea's review and spec (9386d15)

## Next

## Blockers

## Notes
- dv-build: the rule box in a stuck record head is placed by decisions.css (`.dec-head.stuck .rb`, `!important` over RuleDecisionBox's inline fixed placement), since the box's file is outside this card; a later card may move that into the box.
- dv-build: a record body with a wide code block (0032's yaml) overflows to the right, beside the sticky heading at 1024; the body is header-fold-2's.
- dv-build: measured in headless Chromium, not WKWebView.
Sequenced after header-fold-2 and time-zoom: all three touch DecisionsView.tsx.
