---
title: "Read this Mac's memory pressure, free GB and each agent tree's footprint on the 10 s feed, and decide when to warn"
status: now
repos: [organizer]
branch: ram-sample
seat: rs-build
stage: one-window
updated: 2026-10-09
next: "review: ram-sample, gate met (G4 re-checked through the command after 0107 A), b0364f9"
review: fail
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
  - Re-check after review fail + 0107 A (b0364f9), 13:21:09: `organizer memory` lists every session by name under its initiative, unassigned last: camp crew ×6 under ccint-camp-monorepo, organizer ×5, hestia ×1, unassigned `pid 1636`. Each session's bytes from `--json` vs `footprint(1)` over its tree, read right after: max Δ +1.2 % (my own tree), others ≤ 0.4 %. `g4-command.txt`, `g4-command.json`, `g4-command-compare.{sh,txt}`.
- [x] G5 service TestMemoryWarnRule (spec's sequence, warn exactly twice; high throughout never) + TestMemoryWarnOpenedAtCritical.
- [x] G6 service TestMemorySinceAndCriticalEnd: since 4 min back; was_critical_until 14:32 at +29 min, empty at +31.
- [x] G7 service TestMemorySummary: two initiatives + unassigned = three rows summing to agents_bytes, biggest first.
- [x] X0 clean clone of `ram-sample`: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (go all ok, vitest 22 files / 343 tests), `wails build` exit 0. `x0-make-test.txt`, `x0-wails-build.txt`.

## Done
- 2026-10-09: FR-1..FR-4 on `ram-sample` (11e790f, dea2936, ff3d2d1, 29cd12a, 10c206e), rebased on main 8fa9e0e; JSON shape and choices in `.wt-notes/rs-build/progress.md`.

- 2026-10-09: gate met, G1-G7 and X0; branch `ram-sample` head 10c206e, unmerged, for review.

- 2026-10-09: review fix: `organizer memory` lists every session grouped by initiative (FR-3 amendment 2, 0107 A), b0364f9; X0 re-run on a clean clone: make test exit 0 (vitest 343), wails build exit 0 (`x0b-*.txt`). Branch rebased on main 9e3855b.

## Notes
- 2026-10-09 rs-build: spec FR-1's free formula ("total minus app memory, wired and compressed") reads ~1 GB above Activity Monitor on macOS 26 (4.4 vs 3.35 GB): AM's Memory Used is Physical − Cached Files. Implemented free = free + speculative + file-backed pages (vm_stat), which matched AM within 0.05 GB on three shots. The spec's parenthesis wants amending.
- 2026-10-09: supervisor sup49 (window 7535), spawned by the FSE.

## Review
Verdict: **fail**. Commit reviewed: `10c206e3f8d2a24eb8c1bf9ee49a3c22d47862f2` (branch `ram-sample`). Unmet: **G4**.

- G1, G3, G5, G6, G7: the named tests pass in a clean clone; read them: the fakes cover sysctl, vm_stat, ps and footprint, and the clock; G5's run is the spec's sequence (the middle "normal 12 min" holds a high spell; still out of critical), G6's times are the spec's.
- G2 met, 13:16: kernel 1, ours `normal`, Activity Monitor's graph green; free 3.01 GB vs AM 24.00 − 20.91 = 3.09 GB (Δ 0.08). Evidence `.wt-notes/rs-review/` (`am-memory.png`, `g2c-*`, `g4c-*`, `x0-*`); the builder's 12:28 shot agrees too.
- **G4 unmet**: with the camp crew up (6 seats), `organizer memory` lists none of them by name, only `ccint-camp-monorepo  6 agents  3.2 GB`. Same in the builder's `g2-final-memory.txt` and in both of my runs: FR-3 prints the top 5 sessions, and those are organizer's and an unassigned terminal. The builder's per-tree check went through a temporary helper over `scan.Agents`, not the command. The sizes are right: my top-5 trees vs `footprint -p` summed over the same pids were ≤0.2 %, except my own changing tree at 4.9 %, and `footprint` equals AM's Memory column (pid 1636: 339 MB both). For the FSE: G4 conflicts with FR-3's cap whenever a crew has more than five seats or isn't the biggest. Either the command lists every session (and the popover keeps 5), or G4 is rewritten.
- X0 met: clean clone, `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (go all ok, vitest 343), `wails build` exit 0.
- Code: a failed read is `memory: null` + `memory_reason`, never zeros. Memory is sampled inside `RefreshAgents`, with no new ticker or loop. Footprint (`proc_pid_rusage`, cgo) is summed over descendants, with RSS only where it fails. Only sysctl, vm_stat and ps are run; nothing is signalled. Boundary clean: no frontend source, `app.go` or `floaticon_darwin.*` change; `wailsjs/go/models.ts` only.
- Spec amendment for the FSE: FR-1's free formula. The builder uses free + speculative + file-backed pages, because "total minus app, wired and compressed" reads about 1 GB above AM on macOS 26. Confirmed against AM above. Not a fail.
- Not covered by the gate: `RefreshAgents` has seven callers, including the bound `App.RefreshAgents`. `warn` is consumed by whichever caller samples first, so `ram-view` must post from every Go-side path, or a frontend refresh can swallow the warning. A `CGO_ENABLED=0` build silently falls back to RSS, which overstates; the release build must keep cgo. Resumed sessions show as a uuid in `top`.

Reviewer: rs-review, 2026-10-09.
- 2026-10-09: G4 fail is a spec contradiction (FR-3 top five vs G4 every crew session); 0107 asks Pablo which way. rs-build waits on it for G4 only.
- 2026-10-09: 0107 ruled A; FR-3 amended (every session grouped by initiative). G4 stands as written; re-review G4 only.
- 2026-10-09: 0108, G2/G4 against commands, no screenshot (Amendment 3).
