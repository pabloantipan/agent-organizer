---
title: "Conversations lists a chat with someone outside the roster under Others, and lands on it at once"
status: next
repos: [organizer]
branch: lf47-others
seat: o47-build
reviewer: o47-review, o47-ui
stage: review-map
updated: 2026-10-23
next: "o47-build builds it on branch lf47-others (sup88)"
depends_on: []
boundary: ["docs/specs/leftovers-47.md Boundary, lf47-others"]
spec: "docs/specs/leftovers-47.md (FR-7 to FR-9)"
gate: "docs/specs/leftovers-47.md Acceptance, rows O1-O3 and X0"
ui_review: true
---

## Goal
A chat with a supervisor or any other name outside the roster has a row, and landing on it makes that row current.

## Gate
docs/specs/leftovers-47.md, rows O1-O3 and X0; the UI review checks review-view R41.
