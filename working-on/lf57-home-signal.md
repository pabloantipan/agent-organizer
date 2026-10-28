---
title: "Home's row says the last run: cards passed and time stopped"
status: next
repos: [organizer]
branch: lf57-home-signal
seat:
stage:
updated: 2026-10-28
next: "pablo: rule 0169 (accept leftovers 57)"
depends_on: [lf57-run-report]
boundary: ["docs/specs/leftovers-57.md Boundary, lf57-home-signal"]
spec: "docs/specs/leftovers-57.md (FR-14)"
gate: "docs/specs/leftovers-57.md#Acceptance → gate"
ui_review: true
---

## Goal
Home tells Pablo a run happened and how it went, without a percent, and takes him to the report.

## Gate
docs/specs/leftovers-57.md, rows W7, W8 and X0.
