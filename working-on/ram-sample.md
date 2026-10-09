---
title: "Read this Mac's memory pressure, free GB and each agent tree's footprint on the 10 s feed, and decide when to warn"
status: now
repos: [organizer]
branch: ram-sample
seat: rs-build
stage: one-window
updated: 2026-10-09
next: "rs-build: X0 (clean-clone make test + wails build) queued on test-lease, which waits while pressure is high; then review"
depends_on: []
boundary: ["new internal/memory and its tests", "internal/scan/agents.go (ps columns, footprint, tree sum), model.Agent (mem_bytes)", "internal/service (AgentsView.memory, level times, warn rule), internal/cli (memory command), frontend/wailsjs regenerated", "not: the top bar, the floating icon, any view, posting the notification"]
spec: "docs/specs/ram-indicator.md (FR-1 to FR-4)"
gate: "docs/specs/ram-indicator.md Acceptance (ram-sample), rows G1 to G7 and X0"
ui_review: false
---

## Goal
0101: Pablo sees memory pressure, free GB and the biggest agents on this Mac.
This card is the reading; `ram-view` draws it.

## Gate
docs/specs/ram-indicator.md, G1 to G7 and X0. Evidence in `.wt-notes/rs-build/`.
- [x] G1 `internal/memory` TestReadLevels / TestReadFails, service TestSampleMemory: 1, 2, 4 → normal, high, critical; failed reads → `memory: null` + `memory_reason`.
- [x] G2 12:28:22: kernel level 2, ours `high`, Activity Monitor's pressure graph yellow (agree); free ours 3.86 GB vs AM 24.00 − 20.25 = 3.75 GB (Δ 0.11). `g2-final-*.{json,txt,png}`.
- [x] G3 scan TestAgentMemTree over `testdata/memory/ps-tree.txt`: agent + 2 children + grandchild, one child's footprint fails → its rss; a nested agent counts only its own tree. Top order and cap 5: service TestMemorySummary.
- [x] G4 12:22:13, 12 live sessions (camp crew ×6 of ccint-camp-monorepo, organizer-probe-{fse,sup49,rs-build}, hestia-probe-fse, a resumed organizer session, one unassigned terminal): each tree vs `footprint(1)` over the same pids, max Δ 4.0 % (my own tree, changing), others ≤ 0.3 %. `g4-compare.txt`, `g4-trees.tsv`, `am-memory.png`.
- [x] G5 service TestMemoryWarnRule (spec's sequence, warn exactly twice; high throughout never) + TestMemoryWarnOpenedAtCritical.
- [x] G6 service TestMemorySinceAndCriticalEnd: since 4 min back; was_critical_until 14:32 at +29 min, empty at +31.
- [x] G7 service TestMemorySummary: two initiatives + unassigned = three rows summing to agents_bytes, biggest first.
- [ ] X0 `go vet ./... && go test ./...` green in the worktree; clean-clone `make test` + `wails build` queued on test-lease.

## Done
- 2026-10-09: FR-1..FR-4 on `ram-sample` (e4fc0c7, 3e48f60, 4c3cc5b, a24e12c, 4ff5d6b), rebased on main 9332b03; JSON shape and choices in `.wt-notes/rs-build/progress.md`.

## Notes
- 2026-10-09 rs-build: spec FR-1's free formula ("total minus app memory, wired and compressed") reads ~1 GB above Activity Monitor on macOS 26 (4.4 vs 3.35 GB): AM's Memory Used is Physical − Cached Files. Implemented free = free + speculative + file-backed pages (vm_stat), which matched AM within 0.05 GB on three shots. The spec's parenthesis wants amending.
- 2026-10-09: supervisor sup49 (window 7535), spawned by the FSE.
