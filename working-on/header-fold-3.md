---
title: The header, third pass - the stage stays in the bar at compact, tiles open their own stage, the fold tested
status: next
repos: [organizer]
branch: header-fold-3
updated: 2026-10-03
next: "sup28 builds it with its pair (organizer-probe-sup28, launched 2026-10-03; 0074 ruled)"
depends_on: [decisions-view, time-zoom-2]
boundary: ["frontend/src/components/InitiativeHeader.tsx and its CSS", "frontend/src/styles/shell.css (the header's rules only)", "frontend/src/components/StageRoadmap.tsx and frontend/src/stores/board.store.ts (open a stage by position, FR-18; the fold's storage behind a lib function, FR-19)", "frontend/src/lib/ and its tests", "not: home-widths-4's files, DecisionsView.tsx, Go, docs/design-system.md"]
spec: "docs/specs/initiative-header.md (amendment 4, FR-17 to FR-19); the ranking docs/ux/reviews/2026-10-03-rank-leftovers-3.md (Aglaea, 2b6d608)"
gate: "docs/specs/initiative-header.md Acceptance, rows G18 to G21 and G11"
ui_review: true
---

## Goal
header-fold-2's leftovers, ranked by Aglaea: FR-17 to FR-19 of
`docs/specs/initiative-header.md`.

## Gate
- [ ] G18: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G19: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G20: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G21: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G11: see `docs/specs/initiative-header.md`, Acceptance

## Done
- 2026-10-03 sup28 launched by the FSE (decisions-view and time-zoom-2 in done/)
- 2026-10-03 0074 ruled by pablo ("Ok", accept as written, 117e269)
- 2026-10-03 cut from initiative-header amendment 4 by the FSE

## Next

## Blockers

## Notes
Runs in parallel with home-widths-4; boundaries disjoint.
