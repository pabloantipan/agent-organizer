---
title: The Ruled line never widens the board (no sideways swing), names and the wake count, Needs me's five landings
status: now
repos: [organizer]
branch: decisions-line-and-names
seat: dln-build
updated: 2026-10-06
next: "dln-build: fix FR-1 (the chosen option gives way in the Ruled line), then FR-2..FR-7"
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
- 2026-10-06 dln-build, X1 cause (measured before any change, Chromium, fixture init-nopeople with the organizer's 92 records copied in, Ruled open, 0082 in view): `frontend/src/styles/global.css:756` `.dec-meta { flex-shrink: 0; white-space: nowrap }` holds the chosen option in the meta span (`DecisionsView.tsx:310-315`), so 0082's meta is 1043 px and never shrinks; the line, `.dec`, `.dec-ruled` and `.decisions` overflow and `.board-wrap` (`overflow-x: auto`) scrolls: at 1512×913 rail full, overlay, board-wrap sw 1337 / cw 1262; at 1024×609 strip, sw 1337 / cw 978. A deltaX wheel scrolled board-wrap to scrollLeft 75 (1512) and 359 (1024); the document did not move. Logs `.wt-notes/dln-build/x1-before-*.log`.
