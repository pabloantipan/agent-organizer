---
title: "One name per session everywhere, notifications only from the installed app, the memory popover's reading state reachable"
status: now
repos: [organizer]
branch: lf15-names-and-notices
seat: ln-build
stage: one-window
updated: 2026-10-09
next: "review: lf15-names-and-notices, N1 N3 X0 met, N2 met on the log (notification db not readable here), db874e1"
depends_on: []
boundary: ["the spec's Boundary for this card"]
spec: "docs/specs/leftovers-15.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-15.md Acceptance, rows N1 to N3 and X0"
ui_review: false
---

## Goal
Leftovers from 2026-10-09's reviews (0111).

## Gate
docs/specs/leftovers-15.md, N1 to N3 and X0.
- [x] N1: .wt-notes/ln-build/go-tests.txt, vitest-memory.txt, n1-memory.txt, n1-memory-json.txt, n2-organizer.log
- [x] N2: .wt-notes/ln-build/n2-organizer.log, go-tests.txt (TestNotifyRefusal); the notification centre db was not read (TCC: authorization denied), see progress.md
- [x] N3: .wt-notes/ln-build/vitest-memory.txt, go-tests.txt
- [x] X0: .wt-notes/ln-build/x0-make-test.log, x0-npm-build.log, x0-wails-build.log (clean clone at db874e1)

## Done
- FR-1 and FR-2 built on lf15-names-and-notices (30ed83b, c5c881e, 47625ec), unit-tested; X0 passed pre-rebase. Progress and repro: .wt-notes/ln-build/progress.md.

- Gate met but for N2's notification db read; FR-3 and the Agents landing done under sup52's grants (memfake.go; AgentList.tsx :44, :112 and its import). Head db874e1.

## Notes
- The usernoted database is TCC-protected and could not be read from ln-build's session; N2 rests on the app's log and the code path that never calls the centre.
- `model.MemorySession.Name`'s comment still says `else "pid <n>"` (internal/model, outside the boundary).
