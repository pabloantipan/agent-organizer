---
title: "Needs me's record rows keep 'decision', say their age once, and others' rows line up"
status: next
repos: [organizer]
branch: lf37-waits-polish
seat: wp-build
stage: decisions-owned-and-used
updated: 2026-10-15
next: "sup76 runs it first (then dg-render, dg-reader; the Tab harness one at a time); 0139 ruled"
risk: low
footprint: [frontend/src/components/Home.tsx (DecisionRow, WaitingOnOthers), frontend/src/styles/shell.css, their tests]
depends_on: []
boundary: ["docs/specs/leftovers-37.md Boundary, lf37-waits-polish"]
spec: "docs/specs/leftovers-37.md (FR-1 to FR-4; needs-me-waits Amendment 1, W7-W10)"
gate: "docs/specs/leftovers-37.md Acceptance, rows P1, P2, P3, P4 and X0"
ui_review: true
---

## Goal
Needs me's long-wait rows read cleanly: the kind of row in its column, the age once in amber, others' rows aligned with their owner up front (needs-me-waits Amendment 1).

## Gate
docs/specs/leftovers-37.md, rows P1, P2, P3, P4 and X0.
