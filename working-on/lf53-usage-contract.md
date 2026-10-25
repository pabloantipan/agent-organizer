---
title: "The usage post is tested against the record's own sample, posts every cost source, and a refused batch no longer blocks the rest"
status: next
repos: [organizer]
branch: lf53-usage-contract
seat:
stage:
updated: 2026-10-25
next: "waits on contracts/usage-batch.json (hestia; 0163 ruled 2026-10-25)"
depends_on: []
boundary: ["docs/specs/leftovers-53.md Boundary, lf53-usage-contract"]
spec: "docs/specs/leftovers-53.md (FR-5 to FR-6)"
gate: "docs/specs/leftovers-53.md#Acceptance → gate"
ui_review: false
---

## Goal
Every usage row reaches the record, and a contract change fails a test before it reaches a machine.

## Gate
docs/specs/leftovers-53.md, rows U1-U2 and X0.
