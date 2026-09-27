---
title: Home and the initiative header replace the eight tabs
status: next
repos: [organizer]
branch: main
updated: 2026-09-26
next: "Build Home (Needs me with decisions, initiatives by priority) and the initiative header over six sub-views; fold Calendar, Initiatives, Settings; rename Slack to Conversations"
depends_on: ["redesign-goal-stages", "redesign-agent-card", "redesign-runs-binding", "redesign-waves", "redesign-fse-activity", "redesign-rule-record"]
boundary: ["frontend/src/App.tsx", "frontend/src/components/TopBar.tsx", "frontend/src/stores/board.store.ts", "frontend/src/lib/queue.ts", "frontend/src/components/Home.tsx (new)", "frontend/src/components/InitiativeHeader.tsx (new)", "frontend/src/components/Initiatives.tsx", "frontend/src/components/Portfolio.tsx", "frontend/src/components/Rail.tsx", "frontend/src/styles/tokens.css (wait and review tokens from the mockup)", "CLAUDE.md (Layout: navigation)"]
spec: "docs/specs/redesign.md (FR-14 to FR-17 (Home and header)); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G10, G11, G12; the Gate section below"
---

## Goal
The redesign, wave 2 of 2: FR-14 to FR-17 (Home and header) of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [ ] G10: see `docs/specs/redesign.md`, Acceptance
- [ ] G11: see `docs/specs/redesign.md`, Acceptance
- [ ] G12 (Home rows, header): see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE

## Next
1. Build Home (Needs me with decisions, initiatives by priority) and the initiative header over six sub-views; fold Calendar, Initiatives, Settings; rename Slack to Conversations

## Blockers
- waits on Pablo accepting the spec (decision 0023)

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
