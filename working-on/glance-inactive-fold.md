---
title: Initiatives that are not active fold into one rail group
status: next
repos: [organizer]
branch: main
updated: 2026-09-27
next: "Paused and archived initiatives leave Home, the rail groups and Needs me, and sit in a collapsed Not active (n) rail group that opens read-only (0036)"
depends_on: ["glance-needs-me-lead"]
boundary: ["frontend/src/components/Home.tsx (the initiative list)", "frontend/src/components/Rail.tsx", "frontend/src/lib/queue.ts (skip initiatives that are not active)", "frontend/src/styles/ (the rail's and Home's CSS only)", "testdata/fixture-twenty/ (one archived initiative)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-9); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G12, G10; the Gate section below"
stage: twenty-at-a-glance
seat: wave1-fold
---

## Goal
Roadmap stage twenty-at-a-glance: FR-9 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [ ] G12: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-27 cut from the spec by the FSE

## Next
1. Paused and archived initiatives leave Home, the rail groups and Needs me, and sit in a collapsed Not active (n) rail group that opens read-only (0036)

## Blockers
none

## Notes
- 2026-09-27 sup6 runs this card (organizer-probe-sup6), spawned by the FSE after 0034 and 0036
