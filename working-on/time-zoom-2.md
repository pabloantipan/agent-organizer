---
title: Time zoom, second pass - focus kept at the ends, Today only where it moves, readable day bands, whole marks after a pointer
status: next
repos: [organizer]
branch: time-zoom-2
updated: 2026-10-03
next: "decide: pablo - accept 0074; then it runs beside decisions-view under one supervisor"
depends_on: []
boundary: ["frontend/src/components/TimeZoom.tsx, frontend/src/lib/axis.ts and axis.test.ts, frontend/src/styles/time-zoom.css", "frontend/src/components/Roadmap.tsx (A19's minutes label only), StageRoadmap.tsx (A22's row highlight only)", "scripts/fixture-home.sh (A23's card only)", "not: DecisionsView.tsx, RoadmapView.tsx, Home, the stores, Go, docs/design-system.md"]
spec: "docs/ux/specs/roadmap-time-zoom.md, Amendment 1 (Aglaea, 726cbe8) and its Technical notes"
gate: "docs/ux/specs/roadmap-time-zoom.md Acceptance A15-A23, plus the build row below"
ui_review: true
---

## Goal
time-zoom's UI leftovers, ranked by Aglaea: Amendment 1 of
`docs/ux/specs/roadmap-time-zoom.md`.

## Gate
- [ ] A15-A23: see `docs/ux/specs/roadmap-time-zoom.md`, Acceptance
- [ ] `go test ./...` and `cd frontend && npm test` green (axis tests for A15's focus target and A20's cut-label rule where pure); `wails build` succeeds

## Done
- 2026-10-03 cut by the FSE from Aglaea's Amendment 1 (726cbe8)

## Next

## Blockers

## Notes
Parallel with decisions-view: disjoint files (decisions-view does not touch the zoom control or the axis).
