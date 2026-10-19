---
title: "Every merged card resolves to its merge, and a multi-repo card is checked repo by repo"
status: now
repos: [organizer]
branch: lf45-review-resolve
seat: rr-build
reviewer: rr-review
stage: review-map
updated: 2026-10-18
next: "rr-build builds FR-1 and FR-2 on lf45-review-resolve"
risk: low
footprint: [internal/review/resolve.go, internal/review/reconcile.go, internal/review/resolve_test.go, internal/review/reconcile_test.go]
depends_on: []
boundary: ["docs/specs/leftovers-45.md Boundary"]
spec: "docs/specs/leftovers-45.md (FR-1, FR-2)"
gate: "docs/specs/leftovers-45.md Acceptance, rows M1, M2 and X0"
ui_review: false
---

## Goal
Before the odyssey trial, any merged card can be reviewed, and a card across repos is checked against each repo's own change.

## Gate
docs/specs/leftovers-45.md, rows M1, M2 and X0.

## Declared changes

## Notes
