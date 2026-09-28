---
title: Roster seats show why and what visibly, and the Help's sections scroll
status: now
repos: [organizer]
branch: main
updated: 2026-09-28
next: "Give roster seat rows the visible why and what-to-do line, and make the Help section list scroll the document to the section (0041)"
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
- [ ] G8: see `docs/specs/machine-explains-itself.md`, Acceptance
- [ ] G9: see `docs/specs/machine-explains-itself.md`, Acceptance
- [ ] G6: see `docs/specs/machine-explains-itself.md`, Acceptance

## Done
- 2026-09-28 cut by the FSE (0041)

## Next
1. The roster seat's visible line and the Help's scroll

## Blockers
none

## Notes
- 2026-09-28 sup11 runs this card (organizer-probe-sup11), spawned by the FSE
