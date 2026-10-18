---
title: "Ask <seat> on a Question or Blocked mark, and the thread it opened"
status: next
repos: [organizer]
branch: rv-ask-ui
seat: au-build
stage: review-map
updated: 2026-10-18
next: "sup82 runs it (0147 ruled by the standing rule, 2026-10-18)"
risk: medium
footprint: [frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/components/Review.tsx, frontend/src/components/Review.test.tsx, frontend/src/stores/board.store.ts (openSlack thread, review place), frontend/src/components/SlackView.tsx (← Review)]
depends_on: [rv-ask-data, rv-polish]
boundary: ["docs/specs/review-map.md v3 Boundary, rv-ask-ui"]
spec: "docs/specs/review-map.md (v3, FR-28, FR-29; docs/ux/specs/review-view.md §3.3 and Amendment 2)"
gate: "docs/specs/review-map.md v3 Acceptance, rows A4, A5 and X0; v3 Amendment 1 rows A6, A7; Amendment 2 row A8"
ui_review: true
---

## Goal
From the mark Pablo asks the card's supervisor and lands on the thread it opened.

## Gate
docs/specs/review-map.md v3, rows A4, A5 and X0.

## Declared changes

## Notes
