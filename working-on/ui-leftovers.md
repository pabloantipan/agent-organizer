---
title: The UI reviews' leftovers in one pass - the rule box, focus and names, one accent, blockers said once
status: next
repos: [organizer]
branch: main
updated: 2026-09-29
next: "sup20 runs this card (organizer-probe-sup20), spawned by the FSE 2026-09-29 after 0058; rows 9 and 13 wait on 0059, 0060"
depends_on: []
boundary: ["frontend/src/components/Home.tsx, RuleDecisionBox.tsx, Conversation.tsx, SlackView.tsx, AgentsView.tsx, Crew.tsx, Rail.tsx, CardDrawer.tsx", "frontend/src/components/DecisionsView.tsx (focus landing only)", "frontend/src/stores/board.store.ts (focus targets only)", "frontend/src/lib/ and its tests", "CSS", "testdata/ and scripts/fixture-home.sh (FR-12 only)"]
spec: "docs/specs/ui-leftovers.md (FR-1 to FR-12); the rows: docs/ux/reviews/2026-09-29-triage-ui-leftovers.md; the rules: docs/design-system.md, Focus and names, Disabled actions (ec3ecbb)"
gate: "docs/specs/ui-leftovers.md Acceptance, rows G1 to G5; the Gate section below"
stage: discovery-in-a-cell
seat:
ui_review: true
---

## Goal
FR-1 to FR-12 of `docs/specs/ui-leftovers.md`: Aglaea's triage rows 1–8,
10–12, 14 and fixture gaps V1–V3.

## Gate
- [ ] G1: see `docs/specs/ui-leftovers.md`, Acceptance
- [ ] G2: see `docs/specs/ui-leftovers.md`, Acceptance
- [ ] G3: see `docs/specs/ui-leftovers.md`, Acceptance
- [ ] G4: see `docs/specs/ui-leftovers.md`, Acceptance
- [ ] G5: see `docs/specs/ui-leftovers.md`, Acceptance

## Done
- 2026-09-29 cut from ui-leftovers by the FSE

## Next
1. sup20 runs this card

## Blockers
none

## Notes
- 2026-09-29 sup20 runs this card, spawned by the FSE after 0058
- No Go change is needed; the frontend uses pnpm.
- Rows 9 and 13 wait on 0059 and 0060; if ruled before launch, the FSE adds their FRs.
