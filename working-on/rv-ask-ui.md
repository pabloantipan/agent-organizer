---
title: "Ask <seat> on a Question or Blocked mark, and the thread it opened"
status: next
repos: [organizer]
branch: rv-ask-ui
seat:
stage: review-map
updated: 2026-10-18
next: "pablo: rule 0147 (review-map v3 and the review polish)"
risk: medium
footprint: [frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/components/Review.tsx, frontend/src/stores/board.store.ts (openSlack thread, review place), frontend/src/components/SlackView.tsx (← Review)]
depends_on: [rv-ask-data, rv-polish]
boundary: ["docs/specs/review-map.md v3 Boundary, rv-ask-ui"]
spec: "docs/specs/review-map.md (v3, FR-28, FR-29; docs/ux/specs/review-view.md §3.3 and Amendment 2)"
gate: "docs/specs/review-map.md v3 Acceptance, rows A4, A5 and X0"
ui_review: true
---

## Goal
From the mark Pablo asks the card's supervisor and lands on the thread it opened.

## Gate
docs/specs/review-map.md v3, rows A4, A5 and X0.

## Declared changes

## Notes
