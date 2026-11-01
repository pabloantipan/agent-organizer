---
title: "The usage post reads the record's rejected rows, stops resending them, shows them, and sends zero times as null"
status: next
repos: [organizer]
branch: lf54-usage-rejected
seat:
stage:
updated: 2026-11-01
next: "sup99 runs it (lf53 on origin/main 6531d5b; leftovers-54 Amendment 3, pin 54cf10d)"
depends_on: [lf53-usage-contract]
boundary: ["docs/specs/leftovers-54.md Boundary, lf54-usage-rejected"]
spec: "docs/specs/leftovers-54.md (FR-3 to FR-5)"
gate: "docs/specs/leftovers-54.md#Acceptance → gate"
ui_review: false
---

## Goal
Every refused usage row is visible with its reason, and none is resent until it changes.

## Gate
docs/specs/leftovers-54.md, rows G3, G4 and X0.
