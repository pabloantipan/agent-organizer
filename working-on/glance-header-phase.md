---
title: The header shows scope, and every stage shows its phase
status: now
repos: [organizer]
branch: glance-header-phase
seat: wave1-header
updated: 2026-09-27
next: "Show scope in and out under the goal, the phase on the stepper and Roadmap rows, and match gate numbers with zero-padding"
depends_on: ["glance-scope-phase"]
boundary: ["frontend/src/components/InitiativeHeader.tsx", "frontend/src/components/StageRoadmap.tsx", "frontend/src/components/Overview.tsx", "frontend/src/styles/ (the CSS files of those three only)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-4, FR-5); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G5, G6, G10; the Gate section below"
stage: twenty-at-a-glance
---

## Goal
Roadmap stage twenty-at-a-glance (0032): FR-4, FR-5 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [ ] G5: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G6: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-27 cut from the spec by the FSE

## Next
1. Show scope in and out under the goal, the phase on the stepper and Roadmap rows, and match gate numbers with zero-padding

## Blockers
none

## Notes
- 2026-09-27 sup5 runs this card (organizer-probe-sup5), spawned by the FSE after 0033
- 2026-09-27 sup5: seat wave1-header, branch glance-header-phase in .wt/glance-header-phase; evidence under .wt-notes/wave1-header/
- 2026-09-27 sup5: header and Home both draw from shell.css; neither card edits it. New rules go in a new file per card (styles/header.css here), so the two branches merge clean
