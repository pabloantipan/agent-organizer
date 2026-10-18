---
title: "The Review screen: opened from the card, its header and the worklist"
status: next
repos: [organizer]
branch: rv-list
seat: rl-build
stage: review-map
updated: 2026-10-17
next: "sup81 runs it; 0146 ruled"
risk: medium
footprint: [frontend/src/components/Review.tsx, frontend/src/components/Review.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/components/CardDrawer.tsx, frontend/src/stores/board.store.ts, frontend/src/App.tsx]
depends_on: [rv-data]
boundary: ["docs/specs/review-map.md v2 Boundary, rv-list"]
spec: "docs/specs/review-map.md (v2, FR-18; docs/ux/specs/review-view.md)"
gate: "docs/specs/review-map.md v2 Acceptance, rows V-R1, V-R2, V-R3, V-R9, V-R11, V-S, V-R12 and X0"
ui_review: true
---

## Goal
Pablo opens a card's change and sees what is left to review, in the order to review it.

## Gate
docs/specs/review-map.md v2, rows V-R1, V-R2, V-R3, V-R9, V-R11, V-S, V-R12 and X0.
