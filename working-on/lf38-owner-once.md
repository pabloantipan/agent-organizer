---
title: "Needs me says an others' owner once, and the age column keeps one x"
status: next
repos: [organizer]
branch: lf38-owner-once
seat: oo-build
stage: decisions-owned-and-used
updated: 2026-10-15
next: "waits on 0142; on accept the FSE gives it to a supervisor"
risk: low
footprint: [frontend/src/components/Home.tsx (decisionContext, the others' row), frontend/src/styles/shell.css (.ib-row verb column, .lz.waiting.dashed), their tests]
depends_on: []
boundary: ["docs/specs/leftovers-38.md Boundary, lf38-owner-once"]
spec: "docs/specs/leftovers-38.md (FR-1 to FR-3; needs-me-waits Amendment 2, W11, W12)"
gate: "docs/specs/leftovers-38.md Acceptance, rows O1, O2, O3 and X0"
ui_review: true
---

## Goal
An others' row names its owner once, and the age column lines up across every row of Needs me and Waiting on others (needs-me-waits Amendment 2).

## Gate
docs/specs/leftovers-38.md, rows O1, O2, O3 and X0.
