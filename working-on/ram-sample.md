---
title: "Read this Mac's memory pressure, free GB and each agent tree's footprint on the 10 s feed, and decide when to warn"
status: next
repos: [organizer]
branch: ram-sample
seat: rs-build
stage: one-window
updated: 2026-10-09
next: "waits on 0103 (accept); then the FSE spawns the task's supervisor"
depends_on: []
boundary: ["new internal/memory and its tests", "internal/scan/agents.go (ps columns, footprint, tree sum), model.Agent (mem_bytes)", "internal/service (AgentsView.memory, level times, warn rule), internal/cli (memory command), frontend/wailsjs regenerated", "not: the top bar, the floating icon, any view, posting the notification"]
spec: "docs/specs/ram-indicator.md (FR-1 to FR-4)"
gate: "docs/specs/ram-indicator.md Acceptance (ram-sample), rows G1 to G6 and X0"
ui_review: false
---

## Goal
0101: Pablo sees memory pressure, free GB and the biggest agents on this Mac.
This card is the reading; `ram-view` draws it.

## Gate
docs/specs/ram-indicator.md, G1 to G6 and X0.
