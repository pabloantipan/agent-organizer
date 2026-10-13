---
title: "Seats start detached; the organizer stops typing into iTerm"
status: next
repos: [organizer]
branch: lf23-detached-launch
seat:
stage: one-window
updated: 2026-10-13
next: "pablo: rule 0119 and merge claudecode feat/seat-background; then the FSE starts its supervisor"
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
