---
title: The header, second pass - a height budget at compact, landings stay folded, stage buttons that look it, names
status: now
repos: [organizer]
branch: header-fold-2
updated: 2026-10-03
next: "review: header-fold-2, gate met (G12-G17, G11)"
depends_on: []
boundary: ["frontend/src/components/InitiativeHeader.tsx and its CSS", "frontend/src/stores/board.store.ts (landings store folded, FR-11 only)", "frontend/src/components/AgentsView.tsx (group head and toolbar line, FR-13 only)", "frontend/src/components/RoadmapView.tsx and Roadmap.tsx (stage word and row, FR-14 only)", "frontend/src/components/DecisionsView.tsx (aria-expanded on dec-line only)", "frontend/src/styles/shell.css (header and stepper rules only)", "frontend/src/lib/ and its tests", "testdata/fixture-overlay/ and the fixture script (FR-16)", "not: Home.tsx, Rail.tsx, lib/width.ts, home.css, rule-box.css, Overview.tsx, CardDrawer.tsx, Conversation.tsx (widths-and-focus); no Go; not docs/design-system.md"]
spec: "docs/specs/initiative-header.md (FR-10 to FR-16, amendment 3); the ranking: docs/ux/reviews/2026-09-30-rank-header-fold-responsive-2.md (Aglaea, 3f3df2f); the design system as amended there"
gate: "docs/specs/initiative-header.md Acceptance, rows G12 to G17 and G11; the Gate section below"
stage: twenty-at-a-glance
ui_review: true
---

## Goal
header-fold's UI leftovers, ranked by Aglaea: FR-10 to FR-16 of
`docs/specs/initiative-header.md`.

## Gate
- [x] G12: see `docs/specs/initiative-header.md`, Acceptance
- [x] G13: see `docs/specs/initiative-header.md`, Acceptance
- [x] G14: see `docs/specs/initiative-header.md`, Acceptance
- [x] G15: see `docs/specs/initiative-header.md`, Acceptance
- [x] G16: see `docs/specs/initiative-header.md`, Acceptance
- [x] G17: see `docs/specs/initiative-header.md`, Acceptance
- [x] G11: see `docs/specs/initiative-header.md`, Acceptance

## Done
- 2026-10-03 hf2-build: FR-10 to FR-16 on header-fold-2 (7b8a025 31d2383 9c59933 1360a61 1a281a4 04b3fb4 3e7666f), rebased on main; G12-G17 measured on the fixture at 1024x640 (header 256 px, scrolls inside; folded across tab and reload; target whole, goal cut; no id on Agents; pointer, chevron, 2px offset, runs 1:3; names and aria-expanded; "2 decisions waiting on you"); G11 green. Shots and numbers in .wt-notes/hf2-build/progress.md
- 2026-10-03 sup25 launched seat hf2-build in .wt/header-fold-2
- 2026-10-03 sup25 launched by the FSE (Pablo's go-ahead, "ok")
- 2026-09-30 0069 ruled by pablo ("Ok", accept as written, 549217f); launchable, sup25 not started yet
- 2026-09-30 cut from initiative-header amendment 3 by the FSE

## Next

## Blockers

## Notes
- The Roadmap rows that said "current" are in StageRoadmap.tsx, not Roadmap.tsx/RoadmapView.tsx as the boundary says; hf2-build changed the word there only (FR-14).
- The all-initiatives Agents view is not mounted (App.tsx renders AgentsView only inside an initiative), so G15's "all view unchanged" is code-only.
- The fixture has no Needs me card row; G13 used the cell row's Open (openAgentsAt), also a landing.
