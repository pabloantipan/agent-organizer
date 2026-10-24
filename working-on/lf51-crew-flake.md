---
title: "The crew launch test keeps its property with a bound swap cannot reach"
status: next
repos: [organizer]
branch: lf51-crew-flake
seat:
stage: review-map
updated: 2026-10-24
next: "pablo: rule 0160 (leftovers 51)"
depends_on: []
boundary: ["docs/specs/leftovers-51.md Boundary, lf51-crew-flake"]
spec: "docs/specs/leftovers-51.md (FR-6)"
gate: "docs/specs/leftovers-51.md#Acceptance → gate"
ui_review: false
---

## Goal
`make test` stops failing on TestAppCreateCrewReturnsAtOnce when the Mac is swapping.

## Gate
docs/specs/leftovers-51.md, rows C4 and X0. HYGIENE: lf51-crew-flake.
