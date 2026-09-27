---
title: Overview shows the current stage's gates, the work summary and the FSE panel
status: next
repos: [organizer]
branch: main
updated: 2026-09-26
next: "Build Overview: the current stage's gate records and exit items, the work summary in tokens, the FSE panel (feed and hand-off; nothing from 0021 until it is ruled)"
depends_on: ["redesign-shell-home"]
boundary: ["frontend/src/components/Overview.tsx (new)", "frontend/src/components/FsePanel.tsx (new)", "frontend/src/styles/overview.css (new)"]
spec: "docs/specs/redesign.md (FR-18); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G12; the Gate section below"
---

## Goal
The redesign, wave 2 of 2: FR-18 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [ ] G12 (Overview): see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE

## Next
1. Build Overview: the current stage's gate records and exit items, the work summary in tokens, the FSE panel (feed and hand-off; nothing from 0021 until it is ruled)

## Blockers
- waits on Pablo accepting the spec (decision 0023)

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
