---
title: "The Review screen's symbol panel: diff, facts, claim and the mark"
status: next
repos: [organizer]
branch: rv-symbol
seat: rs-build
stage: review-map
updated: 2026-10-17
next: "sup81 runs it; 0146 ruled"
risk: medium
footprint: [frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/components/Review.tsx, frontend/src/components/TopBar.tsx (crumb), frontend/src/components/TopBar.test.tsx]
depends_on: [rv-list]
boundary: ["docs/specs/review-map.md v2 Boundary, rv-symbol"]
spec: "docs/specs/review-map.md (v2, FR-19, Amendment 2 FR-20, FR-21; docs/ux/specs/review-view.md)"
gate: "docs/specs/review-map.md v2 Acceptance, rows V-R4, V-R5, V-R6, V-R7, V-R8, V-R10, V-R12 and X0; Amendment 2 rows V-F1, V-F2"
ui_review: true
---

## Goal
Pablo reads one symbol's change with its evidence, marks it, and moves to the next.

## Gate
docs/specs/review-map.md v2, rows V-R4, V-R5, V-R6, V-R7, V-R8, V-R10, V-R12 and X0; Amendment 2 rows V-F1, V-F2.
