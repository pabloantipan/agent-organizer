---
title: Escape keeps what he wrote (rule box, comments, composer), and Home's fixed columns give their slack to cut cells
status: now
repos: [organizer]
branch: drafts-and-slack
seat: das-build
updated: 2026-10-04
next: "das-build builds it in .wt/drafts-and-slack (sup36)"
depends_on: []
boundary: ["frontend/src/lib/drafts.ts, lib/width.ts and their tests", "frontend/src/components/RuleDecisionBox.tsx, DecisionsView.tsx (its rule box's draft only), Home.tsx", "frontend/src/components/CardDrawer.tsx (the comment field's draft, name and updated date), Conversation.tsx (the composer's draft and field names)", "frontend/src/components/InitiativeHeader.tsx (the target's date), StageRoadmap.tsx (the row's name)", "frontend/src/styles/home.css (the three grid templates at lines 8, 15, 140 only, as --t-state/--t-phase variables with today's defaults; widened by the FSE 2026-10-04 for FR-2)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-9.md (FR-1, FR-2); Aglaea's calls d06e265"
gate: "docs/specs/leftovers-9.md Acceptance, rows S1 to S4 and S0"
ui_review: true
---

## Goal
Nothing he writes is lost to an Escape; Home's dates whole at 1512.

## Gate
- [ ] S1-S4: see `docs/specs/leftovers-9.md`, Acceptance
- [ ] S0: see `docs/specs/leftovers-9.md`, Acceptance

## Done
- 2026-10-04 sup36: worktree .wt/drafts-and-slack off 477aef6, seat das-build launched
- 2026-10-04 0081 ruled by pablo ("Accepted"); sup36 launched by the FSE
- 2026-10-04 cut from leftovers-9 by the FSE

## Next

## Blockers

## Notes
