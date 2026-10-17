---
title: "organizer review carries change-check's declared-change flags onto the map"
status: next
repos: [organizer]
branch: rm-v1-reconcile
seat: rr-build
stage: review-map
updated: 2026-10-17
next: "waits on 0145 and rm-v1-ts; on accept the FSE gives it to a supervisor"
risk: low
footprint: [internal/review/*, internal/cli/review.go, internal/review/testdata/*]
depends_on: [rm-v1-ts]
boundary: ["docs/specs/review-map.md v1 Boundary, rm-v1-reconcile"]
spec: "docs/specs/review-map.md (v1, FR-11, FR-12)"
gate: "docs/specs/review-map.md v1 Acceptance, rows R1 to R3 and X0"
ui_review: false
---

## Goal
With a card, the map flags what was changed but not declared, declared but not changed, and outside the footprint, exactly as change-check says.

## Gate
docs/specs/review-map.md v1, rows R1 to R3 and X0.
