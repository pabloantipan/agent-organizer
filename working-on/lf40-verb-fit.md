---
title: "The verb column fits 'Rule · draft', and the map entry is one accessible name"
status: next
repos: [organizer]
branch: lf40-verb-fit
seat: vf-build
stage: decisions-owned-and-used
updated: 2026-10-17
next: "vf-build building on lf40-verb-fit (sup79, launched 2026-10-17 15:20)"
risk: low
footprint: [frontend/src/styles/shell.css (verb cell), frontend/src/components/SpecReader.tsx (map entry), their tests]
depends_on: [lf38-owner-once]
boundary: ["docs/specs/leftovers-40.md Boundary, lf40-verb-fit"]
spec: "docs/specs/leftovers-40.md (FR-1, FR-2; needs-me-waits A3, diagrams-in-app A4)"
gate: "docs/specs/leftovers-40.md Acceptance, rows V1, V2 and X0"
ui_review: true
---

## Goal
Every age in Needs me lines up even when a ruling draft is kept, and VoiceOver reads the map entry cleanly (lf38's UI review U1, U2).

## Gate
docs/specs/leftovers-40.md, rows V1, V2 and X0.
