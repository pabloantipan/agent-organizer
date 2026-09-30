---
title: The initiative header folds to one bar, and its chip, strip and tiles lead somewhere
status: next
repos: [organizer]
branch: main
updated: 2026-09-29
next: "fse: start its supervisor when responsive-home lands (0063 accepted) and 0064 (FR-9)"
depends_on: ["responsive-home"]
boundary: ["frontend/src/components/InitiativeHeader.tsx", "frontend/src/components/RoadmapView.tsx and Roadmap.tsx (the expanded stage row only)", "frontend/src/components/SlackView.tsx and Conversation.tsx (the title row, the timeline height, Answer focus)", "frontend/src/components/AgentsView.tsx and DecisionsView.tsx (the title row only)", "frontend/src/stores/board.store.ts (fold state; landings fold; stageFocus)", "frontend/src/styles/shell.css and header CSS", "frontend/src/lib/ and its tests"]
spec: "docs/specs/initiative-header.md (FR-1 to FR-6, FR-8, FR-9); the design: docs/ux/specs/initiative-header.md (Aglaea, 6c93a49)"
gate: "docs/specs/initiative-header.md Acceptance, rows G1, G2, G3, G4, G5, G6, G7, G8, G10, G11; the Gate section below"
stage: twenty-at-a-glance
seat:
ui_review: true
---

## Goal
FR-1 to FR-6, FR-8, FR-9 of `docs/specs/initiative-header.md`, from Aglaea's header design and Pablo's header-review-2.

## Gate
- [ ] G1: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G2: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G3: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G4: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G5: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G6: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G7: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G8: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G10: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G11: see `docs/specs/initiative-header.md`, Acceptance

## Done
- 2026-09-29 cut from initiative-header by the FSE

## Next
1. fse: start the supervisor when responsive-home lands

## Blockers
none

## Notes
- The frontend uses pnpm; add no dependency. No Go change.
