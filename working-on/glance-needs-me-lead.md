---
title: Needs me holds only the lead's decisions
status: next
repos: [organizer]
branch: main
updated: 2026-09-27
next: "Needs me and its badge list only proposed records owned by the lead or nobody; others stay on their Decisions tab (0034)"
depends_on: []
boundary: ["frontend/src/lib/queue.ts (needsMeRows)", "frontend/src/components/TopBar.tsx (the badge, only if it counts separately)", "testdata/fixture-twenty/ (records owned by business or the FSE, if missing)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-8); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G11, G10; the Gate section below"
stage: twenty-at-a-glance
---

## Goal
Roadmap stage twenty-at-a-glance: FR-8 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [ ] G11: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-27 cut from the spec by the FSE

## Next
1. Needs me and its badge list only proposed records owned by the lead or nobody; others stay on their Decisions tab (0034)

## Blockers
none
