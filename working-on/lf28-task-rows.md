---
title: "Over, stalled and unheard asks are Needs me rows"
status: now
repos: [organizer]
branch: lf28-task-rows
seat: tr-build
stage: one-window
updated: 2026-10-14
next: "review: lf28-task-rows, gate met (R1, R2, R3, X0), 7965886"
depends_on: [lf28-task-watch, lf27-launch-view]
boundary: ["docs/specs/leftovers-28.md Boundary, lf28-task-rows"]
spec: "docs/specs/leftovers-28.md (FR-5, FR-6)"
gate: "docs/specs/leftovers-28.md Acceptance, rows R1, R2, R3 and X0"
ui_review: true
---

## Goal
Over, stalled and unheard asks are Needs me rows (agent-slack 0014, ruled 2026-10-14).

## Gate
docs/specs/leftovers-28.md, rows R1, R2, R3 and X0.
- [x] R1: .wt-notes/tr-build/r1.log
- [x] R2: .wt-notes/tr-build/r2-ax-needsme.txt, r2-needsme.png, r2-ax-agents.txt, r2-agents.png
- [x] R3: .wt-notes/tr-build/r3.log
- [x] X0: .wt-notes/tr-build/x0-make-test.log, x0-pnpm.log, x0-wails.log, x0-status.txt

## Done
- tr-build: task rows (over, stalled) and asker health on asks in Needs me, 0011 ruled 10 min back in the fixture; gate met on 7965886.

## Notes
- Home.tsx gained a `task` case in InboxRow and calls `threadContext`: a new row kind cannot render without it (the anatomy had its second line already).
- "twice its forecast" is said at any elapsed ≥ 2 × top (fixture: 10 m on 1-2m). Needs me is 16 with live discuss, 15 in fixture-home's count.
