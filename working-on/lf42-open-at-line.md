---
title: "Open in editor at the symbol's line, in the checkout that holds the head"
status: next
repos: [organizer]
branch: lf42-open-at-line
seat:
stage: review-map
updated: 2026-10-18
next: "sup83 runs it as wave 2, after leftovers 41 (0150 ruled in away mode, 2026-10-18)"
risk: low
footprint: [internal/service/review_open.go, internal/service/review_open_test.go, internal/service/review.go, app.go, frontend/wailsjs/*, frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css]
depends_on: [lf41-review-words, lf41-review-go]
boundary: ["docs/specs/leftovers-42.md Boundary"]
spec: "docs/specs/leftovers-42.md (FR-1 to FR-3; docs/ux/specs/review-view.md §3.3)"
gate: "docs/specs/leftovers-42.md Acceptance, rows E1, E2, E3, E4 and X0"
ui_review: true
---

## Goal
From a symbol in the Review screen Pablo opens its code at the line, in a checkout that holds what he is reviewing.

## Gate
docs/specs/leftovers-42.md, rows E1, E2, E3, E4 and X0.

## Declared changes

## Notes
