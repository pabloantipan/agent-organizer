---
title: Needs me shows its oldest five then "Show the other N"; role landings focus what they name; role names and tracks
status: now
repos: [organizer]
branch: roles-and-needs-me-five
updated: 2026-10-05
next: "rn5-build builds it in .wt/roles-and-needs-me-five (sup40)"
seat: rn5-build
depends_on: [drafts-per-chat]
boundary: ["frontend/src/components/Home.tsx, frontend/src/styles/home.css (Needs me's five, role rows' tracks)", "frontend/src/lib/queue.ts (a first-five helper only; needsMeRows unchanged) and lib/ tests", "the roles drawer and rail item components and their CSS; Rail.tsx (the role item's name)", "frontend/src/components/AgentsView.tsx and AgentList.tsx (the landed row's name only: rowName lives in AgentList.tsx, sup40), Conversation.tsx and SlackView.tsx (focus on a landing; the composer's default addressee and wake count, FR-6), InitiativeHeader.tsx (focus target only)", "testdata/ and scripts/fixture-home.sh (a 14-row Needs me fixture)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-11.md (FR-1 to FR-6); transversal-roles.md Amendment 1 (Aglaea, f3535e7)"
gate: "docs/specs/leftovers-11.md Acceptance, rows V1 to V5 and V0"
ui_review: true
---

## Goal
Roles stay in view on Home with a long Needs me; the rest of roles-ui's leftovers.

## Gate
- [ ] V1-V5: see `docs/specs/leftovers-11.md`, Acceptance
- [ ] V0: see `docs/specs/leftovers-11.md`, Acceptance

## Done
- 2026-10-05 sup40: worktree .wt/roles-and-needs-me-five from c147c6a, seat rn5-build; boundary names AgentList.tsx for FR-3 (rowName lives there), spec field says FR-6 as the boundary already did
- 2026-10-05 0085 ruled by pablo ("ok", f6e7aea); sup40 launched by the FSE
- 2026-10-04 cut from leftovers-11 by the FSE

## Next

## Blockers

## Notes
