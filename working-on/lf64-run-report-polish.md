---
title: "The run report reads clearly at every size, and every wave footer keeps its promise"
status: now
repos: [organizer]
branch: lf64-run-report-polish
seat: l64-build
reviewer: l64-rev, l64-ui
stage:
updated: 2026-11-01
next: "l64-build builds from phase 1 (resumed 23:55 after the usage limit and the memory outage; FR-7 edge in Amendment 1, a6db68b)"
depends_on: []
boundary: ["frontend/src/components/RunReport.tsx", "frontend/src/components/RunTracks.tsx", "frontend/src/components/SpecReader.tsx", "frontend/src/lib/runReport.ts", "frontend/src/lib/specReader.ts", "frontend/src/styles/runreport.css"]
spec: "docs/specs/leftovers-64.md (FR-1 to FR-8)"
gate: "docs/specs/leftovers-64.md#Acceptance → gate"
ui_review: true
autonomy: unattended
---

## Goal
The report Pablo reads after a run has no false alarms, no dead presses and no zeros that mean "unknown".

## Gate
docs/specs/leftovers-64.md, rows P1-P8 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #26, #29).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); P3, P5, P8 in the review build.
- Design: Aglaea's run-report Amendment 3 and progress-and-waves Amendment 2 (60ea44c); anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Work's strip predicate: read it where Work defines it; export it if needed, change nothing else there.
- Short-sample fallback: a state the fixture lacks (two-day window, a wave with no strip) is added to the fixture; never the real home.
- Data shape across states: the factory report JSON as its schema gives it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.
