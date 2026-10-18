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
footprint: [internal/service/review_open.go, internal/service/review_open_test.go, frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css]
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

- decide: FR-5/S5 contradicts FR-7b (e4757ef, CharterOnce.test.tsx H5): the top bar crumb already carries the screen's one `aria-current="page"` (TopBar.tsx:154) and H5 asserts the sub-tab is never `page`. Options: (a) move `page` from the crumb to the tab (TopBar.tsx, its test, H5 rewritten; outside the boundary), (b) drop FR-5 here: the crumb is the page marker, the tab and the chat row stay `"true"`, one per list. sup84 recommends (b). Put to fse 2026-10-18; FR-1 to FR-4 proceed.
- 2026-10-18 rs-build: FR-5 conflicts with leftovers-18 FR-7b (I22): TopBar's crumb carries aria-current="page" (TopBar.tsx:150,154; TopBar.test.tsx:99,102,241) and CharterOnce.test.tsx H5 forbids page on the sub-tabs. Both files are outside the boundary.
