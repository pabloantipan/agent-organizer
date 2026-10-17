---
title: "organizer review reads TypeScript, adds the package level, and survives the dist embed"
status: next
repos: [organizer]
branch: rm-v1-ts
seat: rt-build
stage: review-map
updated: 2026-10-17
next: "sup80 runs it; 0145 ruled"
risk: medium
footprint: [internal/review/*, internal/cli/review.go, internal/cli/cli.go (doctor line), go.mod, go.sum, internal/review/testdata/*]
depends_on: []
boundary: ["docs/specs/review-map.md v1 Boundary, rm-v1-ts"]
spec: "docs/specs/review-map.md (v1, FR-7 to FR-10)"
gate: "docs/specs/review-map.md v1 Acceptance, rows T1 to T6 and X0"
ui_review: false
---

## Goal
A review of a Go and frontend change shows the TS symbols too, grouped by package, with no false embed problem.

## Gate
docs/specs/review-map.md v1, rows T1 to T6 and X0.
