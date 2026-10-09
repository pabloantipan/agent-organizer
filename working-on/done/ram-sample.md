---
title: "Read this Mac's memory pressure, free GB and each agent tree's footprint on the 10 s feed, and decide when to warn"
status: done
repos: [organizer]
branch: ram-sample
seat: rs-build
stage: one-window
updated: 2026-10-09
next: "review: ram-sample, gate met (round 2: OnMemoryWarn, mem_source, G2/G4 per 0108), 6ddad50"
review: pass
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
  - Per 0108 (Amendment 3), 14:32:09: `organizer memory --json` vs `sysctl kern.memorystatus_vm_pressure_level` and `vm_stat` in the same second: kernel 2, ours `high`; free ours 3.75 vs vm_stat free+speculative+file-backed 3.96 GB (Δ 0.21, limit 0.5). `g2-cmd.txt`, `g2-cmd-compare.txt`.
- [x] G3 scan TestAgentMemTree over `testdata/memory/ps-tree.txt`: agent + 2 children + grandchild, one child's footprint fails → its rss; a nested agent counts only its own tree. Top order and cap 5: service TestMemorySummary.
- [x] G4 12:22:13, 12 live sessions (camp crew ×6 of ccint-camp-monorepo, organizer-probe-{fse,sup49,rs-build}, hestia-probe-fse, a resumed organizer session, one unassigned terminal): each tree vs `footprint(1)` over the same pids, max Δ 4.0 % (my own tree, changing), others ≤ 0.3 %. `g4-compare.txt`, `g4-trees.tsv`, `am-memory.png`.
  - Re-check after review fail + 0107 A (b0364f9), 13:21:09: `organizer memory` lists every session by name under its initiative, unassigned last: camp crew ×6 under ccint-camp-monorepo, organizer ×5, hestia ×1, unassigned `pid 1636`. Each session's bytes from `--json` vs `footprint(1)` over its tree, read right after: max Δ +1.2 % (my own tree), others ≤ 0.4 %. `g4-command.txt`, `g4-command.json`, `g4-command-compare.{sh,txt}`.
  - Per 0108 (Amendment 3), 14:32:35, head with mem_source: every session by name under its initiative (camp ×6 under ccint-camp-monorepo, organizer ×4, hestia ×1, unassigned last), `agents 6.9 GB (footprint)`. Each tree vs `footprint(1)` and `top -l 1 -stats pid,mem` over the same pids: worst +1.5 % (my own tree), rest ≤ 0.4 %. `g4-cmd.{txt,json}`, `g4-cmd-compare.{sh,txt}`.
- [x] G5 service TestMemoryWarnRule (spec's sequence, warn exactly twice; high throughout never) + TestMemoryWarnOpenedAtCritical.
- [x] G6 service TestMemorySinceAndCriticalEnd: since 4 min back; was_critical_until 14:32 at +29 min, empty at +31.
- [x] G7 service TestMemorySummary: two initiatives + unassigned = three rows summing to agents_bytes, biggest first.
- [x] X0 round 2, clean clone of 717d758, 15:18: make test exit 0 (vitest 343, TestOnMemoryWarn in), wails build exit 0 (`x0c-*.txt`); 6ddad50 is that plus one bitácora line from main.
- [x] X0 clean clone of `ram-sample`: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (go all ok, vitest 22 files / 343 tests), `wails build` exit 0. `x0-make-test.txt`, `x0-wails-build.txt`.

## Done
- 2026-10-09: FR-1..FR-4 on `ram-sample` (11e790f, dea2936, ff3d2d1, 29cd12a, 10c206e), rebased on main 8fa9e0e; JSON shape and choices in `.wt-notes/rs-build/progress.md`.

- 2026-10-09: gate met, G1-G7 and X0; branch `ram-sample` head 10c206e, unmerged, for review.

- 2026-10-09: review fix: `organizer memory` lists every session grouped by initiative (FR-3 amendment 2, 0107 A), b0364f9; X0 re-run on a clean clone: make test exit 0 (vitest 343), wails build exit 0 (`x0b-*.txt`). Branch rebased on main 9e3855b.

- 2026-10-09: round 2 (sup49, Amendments 3 and 4): `Service.OnMemoryWarn` gets every sample that warns, whichever caller sampled, after the lock is released (6570497, TestOnMemoryWarn); `organizer memory` says `footprint` or `resident size` in text and `mem_source` in --json (6ddad50); G2/G4 re-recorded against commands, no screenshots; X0 green. Rebased on main 41a3cd2, head 6ddad50.

## Notes
- 2026-10-09 rs-build: spec FR-1's free formula ("total minus app memory, wired and compressed") reads ~1 GB above Activity Monitor on macOS 26 (4.4 vs 3.35 GB): AM's Memory Used is Physical − Cached Files. Implemented free = free + speculative + file-backed pages (vm_stat), which matched AM within 0.05 GB on three shots. The spec's parenthesis wants amending.
- 2026-10-09: supervisor sup49 (window 7535), spawned by the FSE.

## Review
Verdict: **pass**. Commit reviewed: `6ddad50523455a7f3559e26ff9cc6735de8f2da6` (branch `ram-sample`), round 2. Unmet: none.

- X0: clean clone, no prior build: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (go all ok, vitest 22 files / 343), `wails build` exit 0 (`.wt-notes/rs-review/x0r2-*.txt`).
- G1, G3, G5, G6, G7: TestReadLevels, TestReadFails, TestAgentMemTree, TestSampleMemory, TestMemoryWarnRule, TestMemoryWarnOpenedAtCritical, TestMemorySinceAndCriticalEnd, TestMemorySummary pass. All read: fakes for sysctl, vm_stat, ps, footprint and the clock. G5 is the spec's sequence: entries at 1, 8, 26 and 41 min, warning at 1 and 41. The second "normal 12 min" includes a high spell, which still counts as out of critical. G6 is 4 min back, 14:32 kept at +29 min, gone at +31.
- G2, 15:20:47-49: kernel level 1 both before and after, ours `normal`; free 3.82 GB vs vm_stat free + speculative + file-backed 3.93 / 3.84 GB (Δ 0.11 / 0.02).
- G4, same minute: `organizer memory` lists all 6 camp sessions by name under ccint-camp-monorepo, organizer ×5, hestia ×1, unassigned `pid 1636` last; `agents 7.2 GB (footprint)`. I compared each tree, stopping at other agents, with `footprint -p` and `top -l 1 -stats pid,mem` over the same pids. 12 of 13 trees are within ±1.8 % of both. My own tree (rs-review, changing while it ran the check) is +4.0 % vs footprint and +6.9 % vs top: within 5 % of footprint, which the row allows (`r2-compare.{py,txt}`).
- Code: `mem_source` says footprint or resident size (Amendment 4). `OnMemoryWarn` runs after the lock is released from both `RefreshAgents` and `Memory()`. A failed read gives `memory: null` + `memory_reason`. Sampling rides `RefreshAgents`, with no ticker or loop. The tree is summed by footprint, falling back to RSS. No signal or kill anywhere. The boundary is clean: no frontend source, `app.go` or `floaticon_*` changes; wailsjs `models.ts` only.
- Not covered: TestOnMemoryWarn exercises `Memory()` only, not the `RefreshAgents` path that ram-view will use. The CLI's fresh tracker makes `organizer memory/agents/roles` report `warn: true` at critical (harmless: no hook in the CLI).

Reviewer: rs-review, 2026-10-09.
