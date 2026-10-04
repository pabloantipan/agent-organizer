---
title: Escape keeps what he wrote (rule box, comments, composer), and Home's fixed columns give their slack to cut cells
status: next
repos: [organizer]
branch: drafts-and-slack
updated: 2026-10-04
next: "decide: pablo - accept 0081 (leftovers-9); then the FSE starts its supervisor"
depends_on: []
boundary: ["frontend/src/lib/drafts.ts, lib/width.ts and their tests", "frontend/src/components/RuleDecisionBox.tsx, DecisionsView.tsx (its rule box's draft only), Home.tsx", "frontend/src/components/CardDrawer.tsx (the comment field's draft), Conversation.tsx (the composer's draft)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-9.md (FR-1, FR-2); Aglaea's calls d06e265"
gate: "docs/specs/leftovers-9.md Acceptance, rows S1 to S3 and S0"
ui_review: true
---

## Goal
Nothing he writes is lost to an Escape; Home's dates whole at 1512.

## Gate
- [ ] S1-S3: see `docs/specs/leftovers-9.md`, Acceptance
- [ ] S0: see `docs/specs/leftovers-9.md`, Acceptance

## Done
- 2026-10-04 cut from leftovers-9 by the FSE

## Next

## Blockers

## Notes
