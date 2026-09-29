---
title: Rule from Needs me with the record in view, and Home rows that keep their names
status: next
repos: [organizer]
branch: main
updated: 2026-09-29
next: "pablo: rule 0055 (accept lead-side-fixes); then the FSE starts its supervisor"
depends_on: []
boundary: ["frontend/src/components/Home.tsx (RuleAction, RuleDecisionBox, the row layout, the Launch/Open row, the subtitle)", "frontend/src/lib/queue.ts (the row's kind, verb and words)", "frontend/src/components/TopBar.tsx (the badge title only)", "frontend/src/styles/shell.css, Home and rule-box CSS", "frontend/src/lib/*.test.ts", "testdata/"]
spec: "docs/specs/lead-side-fixes.md (FR-1, FR-2, FR-3, FR-7); the findings: docs/ux/reviews/2026-09-29-first-look.md F1 F2, docs/ux/reviews/2026-09-29-cell-screens.md C1 C6 C7; values: docs/design-system.md"
gate: "docs/specs/lead-side-fixes.md Acceptance, rows G1, G2, G3, G7; the Gate section below"
stage: discovery-in-a-cell
seat:
ui_review: true
---

## Goal
FR-1, FR-2, FR-3 and FR-7 of `docs/specs/lead-side-fixes.md`: Aglaea's F1,
F2, C1, C6 and C7.

## Gate
- [ ] G1: see `docs/specs/lead-side-fixes.md`, Acceptance
- [ ] G2: see `docs/specs/lead-side-fixes.md`, Acceptance
- [ ] G3: see `docs/specs/lead-side-fixes.md`, Acceptance
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
