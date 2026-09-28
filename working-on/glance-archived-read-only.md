---
title: An archived initiative opens read-only and leaves every count
status: now
repos: [organizer]
branch: main
updated: 2026-09-28
next: "Hide Rule, drag, comments, posting and agent actions in an initiative that is not active, say read-only in its header, and drop its cells from the Agents pill and Conversations counts (0042)"
depends_on: []
boundary: ["frontend/src/components/InitiativeHeader.tsx (the read-only label)", "frontend/src/components/Board.tsx (drag)", "frontend/src/components/CardDrawer.tsx (comments)", "frontend/src/components/DecisionsView.tsx (Rule)", "frontend/src/components/Conversation.tsx (posting)", "frontend/src/components/AgentsView.tsx, AgentList.tsx, Crew.tsx (agent actions)", "frontend/src/lib/queue.ts (the pill and Conversations counts)", "frontend/src/components/TopBar.tsx and SlackView.tsx (the counts they show)", "frontend/src/styles/ (those components' CSS only)", "testdata/fixture-overlay/ (one archived initiative, if missing)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-13); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G16, G10; the Gate section below"
stage: twenty-at-a-glance
seat: readonly-build
---

## Goal
Pablo ruled 0042: an initiative that is not active opens read-only and leaves every count.

## Gate
- [ ] G16: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-28 cut by the FSE (0042)

## Next
1. The read-only initiative and its counts

## Blockers
none

## Notes
- One read-only flag derived once (the initiative's status) and passed down; not a check per component
- 2026-09-28 sup12 runs this card (organizer-probe-sup12), spawned by the FSE after 0042
- 2026-09-28 sup12: builder seat readonly-build, reviewer readonly-review; worktree .wt/glance-archived-read-only, branch glance-archived-read-only; fixture is `scripts/fixture-home.sh --twenty` (legacy-intranet is archived and has a cell)
