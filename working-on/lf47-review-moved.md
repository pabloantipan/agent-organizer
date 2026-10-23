---
title: "The review header says the branch moved after any re-read, and a marked, unedited symbol offers no save of nothing"
status: next
repos: [organizer]
branch: lf47-review-moved
seat: m47-build
reviewer: m47-review, m47-ui
stage: review-map
updated: 2026-10-23
next: "m47-build builds it on branch lf47-review-moved (sup88)"
depends_on: []
boundary: ["docs/specs/leftovers-47.md Boundary, lf47-review-moved"]
spec: "docs/specs/leftovers-47.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-47.md Acceptance, rows M1-M4 and X0"
ui_review: true
---

## Goal
The Review screen never shows an old map as current, and never offers a press that saves nothing.

## Gate
docs/specs/leftovers-47.md, rows M1-M4 and X0; the UI review checks review-view R39 and R40.
