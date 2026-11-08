---
title: "The map reader draws each level's own diagram from a shared page"
status: now
repos: [organizer]
branch: lf84-map-region
seat: l84-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "l84-build builds it in .wt/lf84-map-region from origin/main 513db0c6 (sup126)"
depends_on: []
boundary: ["internal/service/map.go", "internal/service/map_test.go", "testdata/fixture-map/", "CLAUDE.md"]
spec: "docs/specs/leftovers-84.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-84.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
Every map level draws its own diagram, even when several levels share a page.

## Gate
docs/specs/leftovers-84.md, rows R1-R4 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: go test beside map.go (`go test ./internal/service/ -run TestMap`); X0 is `make test` with CONTRACTS_DIR.
- Design: n/a, no screen change; the refusal words are FR-2's.
- Short-sample fallback: a new two-container variant under `testdata/fixture-map/`; the harbor fixtures stay as they are.
- Data shape across states: c4-map/1.
- Evidence: test output in the card's Done line.
- Retention: n/a.
