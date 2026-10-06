---
title: Every Claude session's tokens by kind and money, per day, attributed to initiative, role and task, and organizer usage
status: now
repos: [organizer]
branch: usage-ledger
seat: ul-build
stage: one-window
updated: 2026-10-06
next: "ul-build builds it in .wt/usage-ledger (sup47, wave 1, launched 15:21)"
depends_on: []
boundary: ["internal/usage (new) and its tests and testdata", "internal/service (one Usage method), internal/cli (the usage command), app.go (one bound method), frontend/wailsjs regenerated", "not: internal/session record format, the runs.jsonl writer"]
spec: "docs/specs/usage.md (FR-1 to FR-4)"
gate: "docs/specs/usage.md Acceptance, rows G1 to G5 and X0"
ui_review: false
---

## Goal
0098: tokens consumed and money, as clear as possible, weekly, in Deltagos.

## Gate
docs/specs/usage.md, G1 to G5 and X0.

## Notes
- 0099 ruled 2026-10-06; supervisor sup47, spawned by the FSE.
