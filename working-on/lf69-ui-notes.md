---
title: "The map and the report's last small looks, as Aglaea folded them"
status: next
repos: [organizer]
branch: lf69-ui-notes
seat: l69-build
reviewer: l69-rev, l69-ui
stage:
updated: 2026-11-02
next: "launch on 0182's ruling"
depends_on: []
boundary: ["frontend/src/components/MapView.tsx", "frontend/src/components/MapPanel.tsx", "frontend/src/components/MapFigure.tsx", "frontend/src/components/RunReport.tsx", "frontend/src/components/UsageTable.tsx", "frontend/src/lib/mapSvg.ts", "frontend/src/lib/runReport.ts", "frontend/src/styles/map.css", "frontend/src/styles/runreport.css", "frontend/src/styles/usage.css", "frontend/src/components/MapView.test.tsx", "frontend/src/components/MapFigure.test.tsx", "frontend/src/components/RunReport.lf64.test.tsx", "frontend/src/components/RunReport.test.tsx", "frontend/src/components/Usage.rejected.test.tsx"]
spec: "docs/specs/leftovers-69.md (FR-1 to FR-7)"
gate: "docs/specs/leftovers-69.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
Nothing on the map or the report looks pressable unless it is, and no ring is cut.

## Gate
docs/specs/leftovers-69.md, rows V1-V3, M15-M18, AR31, U9 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); UI rows in the review build.
- Design: Aglaea's 160f7fc; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Short-sample fallback: a state the fixture lacks is added to the fixture; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.
