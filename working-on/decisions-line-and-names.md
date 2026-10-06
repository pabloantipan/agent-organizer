---
title: The Ruled line never widens the board (no sideways swing), names and the wake count, Needs me's five landings
status: next
repos: [organizer]
branch: decisions-line-and-names
seat: dln-build
updated: 2026-10-06
next: "dln-build builds it in .wt/decisions-line-and-names (sup45)"
depends_on: [decisions-still]
boundary: ["frontend/src/components/DecisionsView.tsx, frontend/src/styles/global.css (.dec-meta and the Ruled line only), decisions.css", "frontend/src/components/Conversation.tsx and SlackView.tsx (divider name, wake count)", "the roles drawer component (session state word)", "frontend/src/components/Home.tsx, frontend/src/styles/home.css (Needs me's focus and landing; stage and id tracks)", "frontend/src/lib/width.ts, lib/queue.ts (first-five helper only) and lib/ tests", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-12.md (FR-1 to FR-7); Aglaea cb20fcf, 2203d7d"
gate: "docs/specs/leftovers-12.md Acceptance, rows X1 to X5 and X0"
ui_review: true
---

## Goal
The Decisions board never swings sideways; the rest of the last two waves' leftovers.

## Gate
- [ ] X1-X5: see `docs/specs/leftovers-12.md`, Acceptance
- [ ] X0: see `docs/specs/leftovers-12.md`, Acceptance

## Done
- 2026-10-06 sup45: seat dln-build, worktree .wt/decisions-line-and-names from main ce1675d
- 2026-10-06 sup45 launched by the FSE
- 2026-10-05 0087 ruled by pablo ("ok", 821b13d)
- 2026-10-05 cut from leftovers-12 by the FSE

## Next

## Blockers

## Notes
