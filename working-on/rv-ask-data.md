---
title: "Who to ask about a review mark, and asking them in a thread"
status: next
repos: [organizer]
branch: rv-ask-data
seat:
stage: review-map
updated: 2026-10-18
next: "pablo: rule 0147 (review-map v3 and the review polish)"
risk: medium
footprint: [internal/review/marks.go, internal/review/marks_test.go, internal/service/review.go, internal/service/review_test.go, app.go, frontend/wailsjs/*, internal/cli/review.go, internal/cli/review_test.go]
depends_on: []
boundary: ["docs/specs/review-map.md v3 Boundary, rv-ask-data"]
spec: "docs/specs/review-map.md (v3, FR-25 to FR-27; docs/ux/specs/review-view.md §3.3 and Amendment 2)"
gate: "docs/specs/review-map.md v3 Acceptance, rows A1, A2, A3 and X0"
ui_review: false
---

## Goal
A question or block on a symbol reaches the card's supervisor, or the FSE, as a thread, and the mark keeps the thread.

## Gate
docs/specs/review-map.md v3, rows A1, A2, A3 and X0.

## Declared changes

## Notes
