---
title: "An ask survives a Save, a note says it needs a mark, Open the thread never lands on archive"
status: next
repos: [organizer]
branch: lf44-ask-survives
seat: as-build
reviewer: as-review, as-ui
stage: review-map
updated: 2026-10-18
next: "as-build waits on sup85: may it change two test literals outside the boundary (review_test.go:566, Conversation.review.test.tsx:85); FR-1/2/4 in de2ece8, 27c6ae2, FR-3 written"
risk: low
footprint: [internal/review/marks.go, internal/review/marks_test.go, internal/service/review_ask.go, internal/service/review_ask_test.go, frontend/wailsjs/go/*, frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/components/Conversation.tsx (landing), frontend/src/components/Conversation.test.tsx]
depends_on: []
boundary: ["docs/specs/leftovers-44.md Boundary"]
spec: "docs/specs/leftovers-44.md (FR-1 to FR-4; docs/ux/specs/review-view.md Amendment 9)"
gate: "docs/specs/leftovers-44.md Acceptance, rows K1-K5 and X0"
ui_review: true
---

## Goal
A question once asked stays asked, a note that cannot save says why, and opening its thread lands somewhere real.

## Gate
docs/specs/leftovers-44.md, rows K1-K5 and X0.

## Declared changes

## Notes
