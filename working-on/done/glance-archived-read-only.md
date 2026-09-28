---
title: An archived initiative opens read-only and leaves every count
status: done
repos: [organizer]
branch: main
updated: 2026-09-28
next: "review: glance-archived-read-only, branch glance-archived-read-only, gate G16, G10 met, 88aed8c 11b523c 45e5ebe ce55dc3 5623797"
depends_on: []
boundary: ["frontend/src/components/InitiativeHeader.tsx (the read-only label)", "frontend/src/components/Board.tsx (drag)", "frontend/src/components/CardDrawer.tsx (comments)", "frontend/src/components/DecisionsView.tsx (Rule)", "frontend/src/components/Conversation.tsx (posting)", "frontend/src/components/AgentsView.tsx, AgentList.tsx, Crew.tsx (agent actions)", "frontend/src/lib/queue.ts (the pill and Conversations counts)", "frontend/src/components/TopBar.tsx and SlackView.tsx (the counts they show)", "frontend/src/styles/ (those components' CSS only)", "testdata/fixture-overlay/ (one archived initiative, if missing)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-13); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G16, G10; the Gate section below"
stage: twenty-at-a-glance
review: pass
seat: readonly-build
---

## Goal
Pablo ruled 0042: an initiative that is not active opens read-only and leaves every count.

## Gate
- [x] G16: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-28 cut by the FSE (0042)
- 2026-09-28 readonly-build: one flag, `readOnlyOf` in lib/queue.ts, derived at each view's root and passed down; `queueOf` is empty for an inactive initiative (88aed8c 11b523c 45e5ebe ce55dc3 5623797, rebased on main 07d4e1f, unmerged). G16: `wails dev` on `scripts/fixture-home.sh --twenty`, legacy-intranet opened, screenshots in `.wt-notes/readonly-build/`: g16-after-{work,cardback,decisions,conversations,agents}-archived.png (header "archived: read-only"; no drag handle; no comment box or Write; 0001 proposed by pablo shows no Rule; dock "archived: read-only. Nothing can be posted here."; no agent actions), g16-before-{home,agents,conversations}-active.png. Counts, active → archived on the $FIXTURE_HOME copy: Agents pill "1 need you" → none, Conversations "needs me 1" → "needs me", Needs me badge 5 → 3. G10: `.wt-notes/readonly-build/g10.txt`, `npm run build` "✓ built in 1.06s" exit 0; G18 grep empty (exit 1). Choices and findings: `.wt-notes/readonly-build/progress.md`

## Review
- Verdict: pass. G16 met: on legacy-intranet (fixture --twenty) the header says "archived: read-only"; no card drag, comment box, Write, Rule, post box or agent actions; flipping it active → archived on the $FIXTURE_HOME copy took the Agents pill "1 need you" → none, Conversations "needs me 1" → none, Needs me 5 → 3. G10 met: `npm run build` exit 0, G18 grep empty. Evidence `.wt-notes/readonly-review/`
- Unmet gate items: none
- Reviewer: readonly-review
- Date: 2026-09-28

## Next
1. Review

## Blockers
none

## Notes
- One read-only flag derived once (the initiative's status) and passed down; not a check per component
- 2026-09-28 sup12 runs this card (organizer-probe-sup12), spawned by the FSE after 0042
- 2026-09-28 readonly-build: the header's "N decision waiting" still counts an archived initiative's records (FR-13 names only the pill and Conversations); App.tsx could pass the flag from one place, outside this boundary
- 2026-09-28 sup12: builder seat readonly-build, reviewer readonly-review; worktree .wt/glance-archived-read-only, branch glance-archived-read-only; fixture is `scripts/fixture-home.sh --twenty` (legacy-intranet is archived and has a cell)
