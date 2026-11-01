---
title: "A finished wave's footer opens its run record over the report"
status: now
repos: [organizer]
branch: lf57-wave-footer
seat: l57-foot
stage:
updated: 2026-11-01
next: "l57-foot builds it (sup101, launched 2026-11-01 19:52, base d4c67af)"
depends_on: [lf57-run-report]
boundary: ["frontend/src/components/RunReport.tsx", "frontend/src/lib/runReport.ts", "frontend/src/lib/specReader.ts", "frontend/src/components/SpecReader.tsx", "internal/service/spec.go", "internal/service/spec_test.go"]
spec: "docs/specs/leftovers-57.md (Amendment 4, FR-15 to FR-17)"
gate: "docs/specs/leftovers-57.md#Acceptance → gate"
ui_review: true
autonomy: unattended
---

## Goal
Every wave footer in the report leads somewhere: a finished wave to its run record, a running one to Work.

## Gate
docs/specs/leftovers-57.md Amendment 4 and its addendum: W9, W10, W11, X0.

## Pre-answered
- Base: origin/main with lf57-run-report merged (d4c67af).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); W10 in the review build.
- Design: Aglaea's progress-and-waves Amendment 1 (754615b); anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Short-sample fallback: a fixture without a finished wave's run record gets one added under the fixture's `runs/`; never the real home.
- Data shape across states: `model.Wave` as the scan gives it, with its run record's path.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.
