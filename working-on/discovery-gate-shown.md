---
title: Overview shows the gate into building
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "On an initiative in discovery, show the first building stage's gate record as waiting or ruled, or no gate record yet"
depends_on: []
boundary: ["frontend/src/components/Overview.tsx (StageGates)", "testdata/fixture-overlay/ (an initiative in discovery with a gated building stage)", "frontend/src/styles/ (Overview's CSS only)"]
spec: "docs/specs/discovery-in-a-cell.md (FR-4); values: docs/design-system.md"
gate: "docs/specs/discovery-in-a-cell.md Acceptance, rows G3, G5; the Gate section below"
stage: discovery-in-a-cell
---

## Goal
Roadmap stage discovery-in-a-cell: FR-4 of `docs/specs/discovery-in-a-cell.md`.

## Gate
- [ ] G3: see `docs/specs/discovery-in-a-cell.md`, Acceptance
- [ ] G5: see `docs/specs/discovery-in-a-cell.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE

## Next
1. On an initiative in discovery, show the first building stage's gate record as waiting or ruled, or no gate record yet

## Blockers
- waits on Pablo accepting the spec (decision 0048)
