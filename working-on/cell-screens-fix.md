---
title: Draft the cell and Bring crew up say what they are doing and why
status: now
repos: [organizer]
branch: main
updated: 2026-09-29
next: "fix-cells: build FR-4, FR-5, FR-6, FR-8, FR-9 on branch cell-screens-fix (sup18)"
depends_on: []
boundary: ["frontend/src/components/AgentsView.tsx (Draft the cell's states)", "frontend/src/components/Crew.tsx (the visible reason, the roster link)", "frontend/src/components/DecisionsView.tsx and frontend/src/stores/board.store.ts (landing on a record expanded)", "frontend/src/styles/global.css (.tiny-btn:disabled only)", "internal/model/model.go (Cell: accept_record)", "internal/service/ (draft.go, crew.go, retire.go)", "frontend/wailsjs (generated)", "tests", "testdata/"]
spec: "docs/specs/lead-side-fixes.md (FR-4, FR-5, FR-6, FR-8, FR-9); the findings: docs/ux/reviews/2026-09-29-cell-screens.md C2 C3 C4 C5 C8; values: docs/design-system.md"
gate: "docs/specs/lead-side-fixes.md Acceptance, rows G4, G5, G6, G7; the Gate section below"
stage: discovery-in-a-cell
seat: fix-cells
ui_review: true
---

## Goal
FR-4, FR-5, FR-6, FR-8 and FR-9 of `docs/specs/lead-side-fixes.md`:
Aglaea's C2, C3, C4, C5 and C8, and sup16's two open points.

## Gate
- [ ] G4: see `docs/specs/lead-side-fixes.md`, Acceptance
- [ ] G5: see `docs/specs/lead-side-fixes.md`, Acceptance
- [ ] G6: see `docs/specs/lead-side-fixes.md`, Acceptance
- [ ] G7: see `docs/specs/lead-side-fixes.md`, Acceptance

## Done
- 2026-09-29 cut from lead-side-fixes by the FSE

## Next
1. pablo: rule 0055

## Blockers
none

## Notes
- `ui_review: true`: the wave gets a UI reviewer (aglaea skill,
  references/ui-review.md) besides the code reviewer.
- G5 never presses a real Open: it starts a real Claude session.
