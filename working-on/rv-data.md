---
title: "A merged card resolves to its merge, and the app can read, make and mark a review map"
status: next
repos: [organizer]
branch: rv-data
seat: rd-build
stage: review-map
updated: 2026-10-17
next: "sup81 runs it; 0146 ruled"
risk: medium
footprint: [internal/review/resolve.go, internal/review/marks.go, internal/review/*_test.go, internal/service/review.go, internal/service/review_test.go, app.go, frontend/wailsjs/*, internal/cli/review.go, internal/cli/review_test.go, scripts/fixture-home.sh]
depends_on: []
boundary: ["docs/specs/review-map.md v2 Boundary, rv-data"]
spec: "docs/specs/review-map.md (v2, FR-13 to FR-17; docs/ux/specs/review-view.md)"
gate: "docs/specs/review-map.md v2 Acceptance, rows D1 to D5 and X0"
ui_review: false
---

## Goal
The Review view has everything it reads and writes, and a fixture card to show it on.

## Gate
docs/specs/review-map.md v2, rows D1 to D5 and X0.
