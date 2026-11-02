---
title: "The header says both counts when they differ and keeps its place on resize; Usage lists rejected rows"
status: now
repos: [organizer]
branch: lf62-ui
seat: l62-ui
reviewer: l62-rev, l62-uirev
stage:
updated: 2026-11-02
next: "l62-ui builds U1-U4, X0 (sup108, launched 2026-11-02)"
depends_on: [lf62-go]
boundary: ["frontend/src/components/InitiativeHeader.tsx", "frontend/src/lib/header.ts", "frontend/src/styles/shell.css", "frontend/src/components/Usage.tsx", "frontend/src/components/UsageTable.tsx", "frontend/src/lib/decisionStates.test.ts", "frontend/wailsjs/"]
spec: "docs/specs/leftovers-62.md (FR-5 to FR-8)"
gate: "docs/specs/leftovers-62.md#Acceptance → gate"
ui_review: true
autonomy: unattended
---

## Goal
Pablo reads the header the same way at any window size, and sees which usage rows the record refused.

## Gate
docs/specs/leftovers-62.md, rows U1-U4 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); U2 in the review build.
- Short-sample fallback: a state a fixture lacks is added to the card's own fixture; never the real home, never skipped.
- Data shape across states: the existing types; FR-3 adds the rejected rows to the usage JSON as `{session_id, day, reason}`.
- Design questions: Aglaea's DS7 and R53 (Amendment 20) answer them; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Evidence: test output and shots under `.wt-notes/<seat>/`.
- Retention: n/a.
