---
title: A new thread's draft belongs to its chat (no wrong seat woken), draft marks, any column gives slack, names, IME, dates
status: next
repos: [organizer]
branch: drafts-per-chat
updated: 2026-10-04
next: "sup39: dpc-build builds it in .wt/drafts-per-chat"
depends_on: [roles-ui]
boundary: ["frontend/src/lib/drafts.ts, lib/width.ts, lib/dates.ts and their tests", "frontend/src/components/Conversation.tsx and SlackView.tsx (drafts, names, times)", "frontend/src/components/DecisionsView.tsx (the To rule line's draft mark), Home.tsx (shareRoom's columns), Overview.tsx (the ruled date)", "frontend/src/components/RuleDecisionBox.tsx and CardDrawer.tsx (the IME guard only)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-10.md (FR-1 to FR-6); Aglaea's calls feeb8d6"
gate: "docs/specs/leftovers-10.md Acceptance, rows T1 to T5 and T0"
ui_review: true
seat: dpc-build
---

## Goal
No draft wakes the wrong seat; the rest of drafts-and-slack's leftovers.

## Gate
- [ ] T1-T5: see `docs/specs/leftovers-10.md`, Acceptance
- [ ] T0: see `docs/specs/leftovers-10.md`, Acceptance

## Done
- 2026-10-04 0084 ruled by pablo ("Ok"); sup39 launched by the FSE
- 2026-10-04 cut from leftovers-10 by the FSE

## Next

## Blockers

## Notes
