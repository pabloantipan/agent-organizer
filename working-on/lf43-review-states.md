---
title: "Open in editor's refusals and definition line, Save only when it saves, one page marker"
status: now
repos: [organizer]
branch: lf43-review-states
seat: rs-build
stage: review-map
updated: 2026-10-18
next: "decide: FR-5 premise false: the top bar crumb (TopBar.tsx:154) already holds the screen's one aria-current=page on Conversations, and CharterOnce.test.tsx H5 asserts the sub-tab is never page; the tab going page gives two pages per screen and fails make test. Options: (a) let me edit TopBar.tsx crumb (drop page) + TopBar.test.tsx + CharterOnce.test.tsx H5, (b) drop FR-5 from this card. FR-1..4 proceed meanwhile (rs-build)"
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
- 2026-10-18 rs-build: FR-5 conflicts with leftovers-18 FR-7b (I22): TopBar's crumb carries aria-current="page" (TopBar.tsx:150,154; TopBar.test.tsx:99,102,241) and CharterOnce.test.tsx H5 forbids page on the sub-tabs. Both files are outside the boundary.
