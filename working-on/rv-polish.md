---
title: "The review panel's words, ring and rows, as Aglaea's Amendment 2 and the UI reviews ask"
status: now
repos: [organizer]
branch: rv-polish
seat: rp-build
stage: review-map
updated: 2026-10-18
next: "rp-build builds FR-30 to FR-37 on branch rv-polish"
risk: low
footprint: [frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/components/Review.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/styles/rule-box.css (ring), scripts/fixture-home.sh (--review only)]
depends_on: []
boundary: ["docs/specs/review-map.md v3 Boundary, rv-polish"]
spec: "docs/specs/review-map.md (v3, FR-30 to FR-37; docs/ux/specs/review-view.md §3.3 and Amendment 2)"
gate: "docs/specs/review-map.md v3 Acceptance, rows P1, P2, P3, P4, P5 and X0"
ui_review: true
---

## Goal
The panel says which way a neighbour points, never overrides a Question, shows where focus is, and the fixture's second commit is a real edit.

## Gate
docs/specs/review-map.md v3, rows P1, P2, P3, P4, P5 and X0.

## Declared changes

## Notes
