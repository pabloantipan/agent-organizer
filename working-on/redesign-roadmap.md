---
title: Roadmap draws stages with their gating decisions
status: next
repos: [organizer]
branch: main
updated: 2026-09-26
next: "Draw one row per stage with gate diamonds and a dashed bar for a stage with no target; switch to Cards and Calendar"
depends_on: ["redesign-shell-home"]
boundary: ["frontend/src/components/RoadmapView.tsx", "frontend/src/components/StageRoadmap.tsx (new)", "frontend/src/components/Calendar.tsx (embedding only)", "frontend/src/styles/roadmap.css (new)"]
spec: "docs/specs/redesign.md (FR-20, FR-21); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G14; the Gate section below"
---

## Goal
The redesign, wave 2 of 2: FR-20, FR-21 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [ ] G14: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE

## Next
1. Draw one row per stage with gate diamonds and a dashed bar for a stage with no target; switch to Cards and Calendar

## Blockers
- waits on Pablo accepting the spec (decision 0023)

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
