---
title: "Every count reads the same, and a focused slug reads whole"
status: next
repos: [organizer]
branch: lf71-count-look
seat: l71-build
reviewer: l71-rev, l71-ui
stage:
updated: 2026-11-02
next: "sup115 runs it (0184 ruled 2026-11-02)"
depends_on: []
boundary: ["frontend/src/styles/runreport.css", "frontend/src/components/Home.tsx", "frontend/src/components/Overview.tsx", "frontend/src/components/UsageTable.tsx", "frontend/src/components/SecCount.tsx", "frontend/src/components/SecCount.test.tsx", "frontend/src/styles/shell.css", "frontend/src/components/RunReport.test.tsx", "frontend/src/components/Usage.rejected.test.tsx"]
spec: "docs/specs/leftovers-71.md (FR-1, FR-2)"
gate: "docs/specs/leftovers-71.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
One look for every count, and no ring over a glyph.

## Gate
docs/specs/leftovers-71.md, rows V1, V2, AR33, AR34 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); UI rows in the review build, ring rows by the offscreen Tab harness.
- Design: Aglaea's 25baf46; anything else to the FSE.
- Short-sample fallback: the existing fixtures; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.
