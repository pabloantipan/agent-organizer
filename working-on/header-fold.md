---
title: The initiative header folds to one bar, and its chip, strip and tiles lead somewhere
status: now
repos: [organizer]
branch: main
updated: 2026-09-29
next: "decide: FR-9's \"edited, not committed\" needs a Go change: the scan reports only a dirty count per listed repo (organizer lists repos: []), never git status of working-on/initiative.yaml; widen the boundary to add a charter-modified flag in internal/scan and model (plus wails generate), or amend FR-9 and G10 to drop the mark? The rest of the card is built meanwhile"
depends_on: ["responsive-home"]
boundary: ["frontend/src/components/InitiativeHeader.tsx", "frontend/src/components/RoadmapView.tsx and Roadmap.tsx (the expanded stage row only)", "frontend/src/components/SlackView.tsx and Conversation.tsx (the title row, the timeline height, Answer focus)", "frontend/src/components/AgentsView.tsx and DecisionsView.tsx (the title row only)", "frontend/src/stores/board.store.ts (fold state; landings fold; stageFocus)", "frontend/src/styles/shell.css and header CSS", "frontend/src/lib/ and its tests", "amendment 1 (FR-9 only): internal/scan/git.go, the initiative assembly in internal/scan (one call), internal/model/model.go (Initiative.charter_modified), frontend/wailsjs (generated), a scan test"]
spec: "docs/specs/initiative-header.md (FR-1 to FR-6, FR-8, FR-9); the design: docs/ux/specs/initiative-header.md (Aglaea, 6c93a49)"
gate: "docs/specs/initiative-header.md Acceptance, rows G1, G2, G3, G4, G5, G6, G7, G8, G10, G11; the Gate section below"
stage: twenty-at-a-glance
seat: hdr-fold
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
1. sup23 runs this card

## Blockers
none

## Notes
- 2026-09-29 FSE: spec amendment 1 answers the spec gap behind the decide: above: the boundary widens by one Go fact, charter_modified, for FR-9 only (the 0064 ruling chose the mark); FR-9 and G10 unchanged
- 2026-09-29 sup23 runs this card with its sibling, spawned by the FSE after responsive-home landed (d8591aa)
- The frontend uses pnpm; add no dependency. Go only as amendment 1 allows (FR-9's charter_modified).
- 2026-09-29 hdr-fold: FR-9's modified mark has no data source in the board (no per-file git status); raised as decide: to sup23
