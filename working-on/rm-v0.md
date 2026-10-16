---
title: "organizer review: a Go change as revmap.json (review map v0)"
status: next
repos: [organizer]
branch: rm-v0
seat: rm-build
updated: 2026-10-15
next: "sup74 runs it (0137); builder rm-build"
depends_on: []
boundary: ["docs/specs/review-map.md Boundary, rm-v0"]
spec: "docs/specs/review-map.md (FR-1 to FR-6; agent-slack review/pipeline-starter.md §6.6)"
gate: "docs/specs/review-map.md Acceptance, rows M1, M2, M3, M4, M5, M6 and X0"
ui_review: false
---

## Goal
From a card or a merge, `organizer review` emits the Go change as revmap.json: changed symbols, their 1-hop callers and callees, the tests that reach them (review tooling, agent-slack decisions 2026-10-15; T15b).

## Gate
docs/specs/review-map.md, rows M1, M2, M3, M4, M5, M6 and X0.

## Notes
- 2026-10-15: run by sup74 (organizer-probe-sup74), spawned by the FSE.
