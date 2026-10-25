---
title: "The usage post is tested against the record's own sample, posts every cost source, and a refused batch no longer blocks the rest"
status: next
repos: [organizer]
branch: lf53-usage-contract
seat: l53-usage
stage:
updated: 2026-10-25
next: "sup94 runs it (0163 ruled 2026-10-25; usage-batch.json landed, specs 1e36d6b)"
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
