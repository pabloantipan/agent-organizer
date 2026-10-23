---
title: "The review panel's last loose words: no false hint, the asked seat's chat at once, unique ids, the not-here line kept"
status: next
repos: [organizer]
branch: lf46-review-words
seat: rw-build
reviewer: rw-review, rw-ui
stage: review-map
updated: 2026-10-22
next: "sup87 runs it (0154 ruled 2026-10-23)"
risk: low
footprint: [frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/components/Review.tsx, frontend/src/components/Review.test.tsx, frontend/src/styles/review.css, frontend/src/components/Conversation.tsx (landing), frontend/src/stores/board.store.ts (openSlack seat)]
depends_on: []
boundary: ["docs/specs/leftovers-46.md Boundary, lf46-review-words"]
spec: "docs/specs/leftovers-46.md (FR-4 to FR-8)"
gate: "docs/specs/leftovers-46.md Acceptance, rows W1-W4 and X0"
ui_review: true
---

## Goal
The review panel never says something untrue, and Open the thread lands where the question went.

## Gate
docs/specs/leftovers-46.md, rows W1-W4 and X0.

## Declared changes

## Notes
