---
title: Time zoom on every Gantt-style axis - Fit, Days, and Hours where a mark has a time
status: now
repos: [organizer]
branch: time-zoom
updated: 2026-10-03
next: "tz-build: build A1-A14, T1, T2 on .wt/time-zoom (sup26 wave)"
seat: tz-build
depends_on: [header-fold-2]
boundary: ["frontend/src/components/Roadmap.tsx, RoadmapView.tsx, StageRoadmap.tsx (axis and positions only, not the stage word or row), DecisionsView.tsx (the Timeline only)", "one new shared axis module in frontend/src/lib/ and one zoom-control component, with their CSS", "frontend/src/lib/dates.ts and frontend/src/lib/ tests", "internal/scan/git.go (branchSpan's format only) and internal/scan/scan_test.go", "testdata/ fixtures the gate rows need", "not: Calendar.tsx, Portfolio.tsx's mounting, the stores, Home, docs/design-system.md; no bound Go type change"]
spec: "docs/ux/specs/roadmap-time-zoom.md (Aglaea's design, 6569427, with the FSE's Technical notes T1-T5); ruling 0070"
gate: "docs/ux/specs/roadmap-time-zoom.md Acceptance A1-A14, plus T1 and T2 below"
ui_review: true
---

## Goal
One zoom on Roadmap Cards, Roadmap Stages and the Decisions Timeline: Fit,
Days, and Hours only where a mark carries a time (0070).

## Gate
- [ ] A1-A14: see `docs/ux/specs/roadmap-time-zoom.md`, Acceptance
- [ ] T1: `go test ./internal/scan/` passes with a test asserting BranchStart and BranchLast carry an RFC 3339 time
- [ ] T2: `cd frontend && npm test` passes with parseISO tests for a date-only and an RFC 3339 string, hasTime for both, and the axis module's ticks, day-end and offersHours
- [ ] `go test ./...` and `npm test` green; `wails build` succeeds

## Done
- 2026-10-03 sup26: worktree .wt/time-zoom on 0774ab2, builder tz-build launched; reviewers tz-review (code) and tz-ui (UI)
- 2026-10-03 sup26 launched by the FSE, header-fold-2 in done/ (4afddc0), per 0071
- 2026-10-03 0071 ruled by pablo ("Ok", accept as written, 1328071); launchable, waits on header-fold-2
- 2026-10-03 cut by the FSE from Aglaea's spec and ruling 0070

## Next

## Blockers

## Notes
Sequenced after header-fold-2: its boundary holds Roadmap.tsx, RoadmapView.tsx and DecisionsView.tsx.
