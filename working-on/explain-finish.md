---
title: Roster seats show why and what visibly, and the Help's sections scroll
status: now
repos: [organizer]
branch: main
updated: 2026-09-28
next: "review: explain-finish, branch explain-finish, gate G8, G9, G6 met, 53ca359 c8c430c"
depends_on: []
boundary: ["frontend/src/components/Crew.tsx", "frontend/src/components/AgentList.tsx (the roster seat's line only)", "frontend/src/components/HelpView.tsx (the section list's scroll)", "frontend/src/styles/ (those components' CSS only)"]
spec: "docs/specs/machine-explains-itself.md (FR-8, FR-9); values: docs/design-system.md"
gate: "docs/specs/machine-explains-itself.md Acceptance, rows G8, G9, G6; the Gate section below"
stage: machine-explains-itself
seat: stage3b-finish
---

## Goal
Two findings from the review of explain-health-all-agents, ruled to fix before stage 3 closes (0041).

## Gate
- [x] G8: see `docs/specs/machine-explains-itself.md`, Acceptance
- [x] G9: see `docs/specs/machine-explains-itself.md`, Acceptance
- [x] G6: see `docs/specs/machine-explains-itself.md`, Acceptance

## Done
- 2026-09-28 cut by the FSE (0041)
- 2026-09-28 stage3b-finish: roster seat rows show the HealthWhy line (53ca359); the Help's headings get their ids in the HTML string, since ids added to the DOM afterwards were gone and the list scrolled nothing (c8c430c). Rebased on main.
  - G8: `.wt-notes/stage3b-finish/g8-agents-roster-seat.png`, fixture Agents tab, dev_bruno row reads "deaf: Mail has waited past the stale window… What to do: Check the seat's session runs…" with no hover
  - G9: `.wt-notes/stage3b-finish/g9-before.png` (document at top), `g9-after.png` after choosing the fourth section, "2. The life of an initiative: discovery, then building", heading at the top of the document (scrollTop 1466, heading 16 px below the document's top)
  - G6: `.wt-notes/stage3b-finish/g6.txt`: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (13 packages ok); `npm run build` exit 0 ("built in 1.09s"); G18 grep on `main...explain-finish` empty (grep exit 1)

## Next
1. Review by someone who did not build it

## Blockers
none

## Notes
- 2026-09-28 sup11 runs this card (organizer-probe-sup11), spawned by the FSE
- 2026-09-28 found: the deaf badge omits "· N waiting" by design (WatcherBadge); Home says "2 messages waiting" for dev_bruno, the Agents row does not. Not changed.
