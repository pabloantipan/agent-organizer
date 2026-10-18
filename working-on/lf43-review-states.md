---
title: "Open in editor's refusals and definition line, Save only when it saves, one page marker"
status: next
repos: [organizer]
branch: lf43-review-states
seat:
stage: review-map
updated: 2026-10-18
next: "pablo: rule 0151 (leftovers 43)"
risk: low
footprint: [internal/service/review_open.go, internal/service/review_open_test.go, frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/components/InitiativeHeader.tsx (tab aria-current), frontend/src/components/InitiativeHeader.test.tsx]
depends_on: []
boundary: ["docs/specs/leftovers-43.md Boundary"]
spec: "docs/specs/leftovers-43.md (FR-1 to FR-5; docs/ux/specs/review-view.md Amendments 7, 8)"
gate: "docs/specs/leftovers-43.md Acceptance, rows S1-S5 and X0"
ui_review: true
---

## Goal
The review panel never offers a press that cannot work, opens code at the definition, and marks one page.

## Gate
docs/specs/leftovers-43.md, rows S1-S5 and X0.

## Declared changes

## Notes
