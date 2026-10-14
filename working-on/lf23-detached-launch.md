---
title: "Seats start detached; the organizer stops typing into iTerm"
status: now
repos: [organizer]
branch: lf23-detached-launch
seat: dl-build
stage: one-window
updated: 2026-10-14
next: "dl-build building in .wt/lf23-detached-launch: A1, A2 tests then A3 on lodestar (sup63)"
depends_on: []
boundary: ["docs/specs/leftovers-23.md Boundary, lf23-detached-launch"]
spec: "docs/specs/leftovers-23.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-23.md Acceptance, rows A1, A2, A3 and X0"
ui_review: false
---

## Goal
Bring crew up, Run and New agent start seats detached; Attach uses `probe --attach` (Hephaistos, 2026-10-13, from Pablo's ruling).

## Gate
docs/specs/leftovers-23.md, rows A1, A2, A3 and X0. A3 needs the merged probe.
