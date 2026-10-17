---
title: "organizer review reads TypeScript, adds the package level, and survives the dist embed"
status: done
repos: [organizer]
branch: rm-v1-ts
seat: rt-build
stage: review-map
updated: 2026-10-17
next: "merged; findings to the FSE (thread 01M5644TMW0YVJ34QBHHXGT9GV)"
review: pass
risk: medium
footprint: [internal/review/*, internal/cli/review.go, internal/cli/cli.go (doctor line), go.mod, go.sum, internal/review/testdata/*]
depends_on: []
boundary: ["docs/specs/review-map.md v1 Boundary, rm-v1-ts"]
spec: "docs/specs/review-map.md (v1, FR-7 to FR-10)"
gate: "docs/specs/review-map.md v1 Acceptance, rows T1 to T6 and X0"
ui_review: false
---

## Goal
A review of a Go and frontend change shows the TS symbols too, grouped by package, with no false embed problem.

## Gate
docs/specs/review-map.md v1, rows T1 to T6 and X0.
- [x] T1: internal/review/testdata/rm-v1/hand-lists.md (committed first, 9020955), internal/review/testdata/rm-v1/revmap-35671ed.json, internal/review/testdata/rm-v1/check-35671ed.txt (15 of 15, none extra, all `lang: "ts"`)
- [x] T2: internal/review/testdata/rm-v1/hand-lists.md T2 table, internal/review/testdata/rm-v1/check-35671ed.txt (6 edges present, none extra; the `api` → `CrewResult` trap absent)
- [x] T3: internal/review/testdata/rm-v1/check-35671ed.txt (`speaker` lists `liveRegion.test.ts::N2: …` and `::P4: …`; `useAnnouncer`, `useLiveRegion`, `Say`, `CrewResult`, `api` untested, no other)
- [x] T4: internal/review/testdata/rm-v1/t4.txt (35671ed and c8e1773)
- [x] T5: internal/review/testdata/rm-v1/t5-c8e1773.txt
- [x] T6: Notes table below; internal/review/testdata/rm-v1/t6-no-node.txt, internal/review/testdata/rm-v1/compare.txt, internal/review/testdata/rm-v1/timings.txt
- [x] X0: internal/review/testdata/rm-v1/x0.txt

## Notes
- 2026-10-17: run by rt-build for sup80. TS source measured on 35671ed against `internal/review/testdata/rm-v1/hand-lists.md` with `internal/review/testdata/rm-v1/check.py`, then over two larger frontend merges (7c829fe, 22ae6b5) as full-map diffs against the compiler (`internal/review/testdata/rm-v1/compare.txt`); the alternatives (`internal/review/testdata/rm-v1/compare.go.txt`) ran through the real `organizer review` behind a fake `node` on PATH:

| source | T1 / T2 / T3 misses on 35671ed | full maps (7c829fe, 22ae6b5) | TS time, 35671ed head+base | install on odyssey |
|---|---|---|---|---|
| TypeScript compiler API, `tsgraph.js` by node with the reviewed repo's typescript (**chosen**) | 0 / 0 / 0, none extra | reference | 1.6 s (full review 5.8 s; c8e1773 4.2 s, node never started) | node on PATH and the repo's own `node_modules` (any repo that builds its TS has both; odyssey does); nothing shipped but the script, embedded in the binary |
| tree-sitter (go-tree-sitter, name resolution scoped to file and relative imports) | 0 / 0 / 0, none extra | misses 3 and 6 edges (type-only refs such as `DraftStore`, `Edges`); a false edge on 35671ed (`model.Note` read as the file's own `Note`); misses 17 destructured top-level test helpers | 0.33 s | cgo grammars compiled into the organizer (265 MB of module sources to build; universal build needs both arches); no install on odyssey |
| light line parser (regex outline + identifiers) | 0 / 0 / 0, none extra | misses 4 and 14 edges (e.g. `{...busyButton(...)}` in JSX), a false edge from a JSX comment (`People` → `Conversation`), test names cut at an apostrophe (`Sleep's confirm` → `Sleep`) | 0.14 s | nothing |

  Chosen the compiler API: the only one that resolves names through imports and types, so it never misses or invents an edge on the three merges where the others do, and it needs nothing on odyssey that a repo with a TS build does not already have. Its 1.6 s is the cost. Behind `review.Source`.
- Choices where the spec left room: TS ids `ts:<file>#<name>`, package ids `ts:<the file's directory from the repo root>` (`ts:frontend/src/lib`) so two `src` trees cannot collide; a test definition is a top-level describe/it/test, evidence `file::<its name>`, reached directly or through helpers as in Go; the embed placeholder is an empty file at the pattern's path (fits string, []byte and embed.FS), never for a glob; notes (`revmap.notes`) and problems shared by base and head are said once; a source runs only when a changed file is its own; `stats.packages` added, `stats.edges` counts symbol edges. Rebased on main after the X0 run: the base gained only this card's commit, the code tree is the one X0 ran (3b0aeff).
- Found, not asked: a PATH without a C compiler disables cgo and go/types then drops the main package's cgo files (`undefined: notifyStart`, app.go), as v0 did; the recorded T6 removes only node's directory. The placeholder retry reloads the module (c8e1773 4.2 s, v0 ~3.2 s). `organizer help`'s review line in cli.go still says "the Go change" (outside the boundary). rm-v1-reconcile: a flag maps onto a node by id, and a file-level flag can key on `Node.File`.

## Declared changes
- added `internal/review/ts.go`: the TypeScript source behind Source, node from PATH, typescript from the repo
- added `internal/review/tsgraph.js`: the compiler API helper node runs, embedded in the binary
- modified `internal/review/source.go`: Source takes the repo and says which files it handles; Def carries lang and test name; the embed placeholder
- modified `internal/review/review.go`: several sources per review, package nodes and edges, notes, problems said once
- modified `internal/review/git.go`: Hunks keeps the files any source handles
- modified `internal/review/review_test.go`: Build takes sources; package level checked
- added `internal/review/ts_test.go`: TS fixture, missing tools, embed placeholder, package level
- modified `internal/cli/review.go`: runs every source; doctor's review line names node
- modified `internal/cli/review_test.go`: doctor's line with and without tools
- added `internal/review/testdata/rm-v1`: hand lists, revmaps, check script, T4 to T6 runs, timings, comparison, X0
Not changed, on purpose:
- `internal/cli/cli.go`: doctor's line already prints reviewStatus, which review.go holds

## Done
- 2026-10-17: `organizer review` reads TS through the compiler API, puts every symbol under a package node and placeholders the ignored dist embed; gate met (T1-T6, X0), branch rm-v1-ts at 35d5fda, unmerged.

## Review
**Pass**: T1, T2, T3, T4, T5, T6 and X0 met at 35d5fda93df6afa0175100d6eacd3f941e03cc2e (branch rm-v1-ts, not moved during the review). Unmet: none. Reviewer rt-review, 2026-10-17. Everything ran in a fresh clone at that SHA (`.wt-notes/rt-review/clean`), binary built there, `ORGANIZER_CONFIG` with one root (the clone) so the reviewed repo was the clone, `XDG_DATA_HOME` a temp dir; my lists and outputs are in `.wt-notes/rt-review/rm-v1-ts/`.

change-check (`change-check organizer rm-v1-ts --base 636f8cb --head 35d5fda`, base = merge base with main):

```
change-check: working-on/rm-v1-ts.md
risk: medium
repo organizer: base 636f8cb0f (--base 636f8cb0f18707a3f6be3ff48b921df72d44724a) ... head 35d5fda93df6afa0175100d6eacd3f941e03cc2e 35d5fda93; 22 files

## Changed

- organizer/internal/cli/review.go (modified): reviewCmd, reviewStatus
- organizer/internal/cli/review_test.go (modified, test)
- organizer/internal/review/git.go (modified): Hunks
- organizer/internal/review/review.go (modified): RevMap, Stats, Build, buildRepo, repoResult, Graph.merge, packageLevel, pkgFile, lastName, uniqKeep, WriteSummary
- organizer/internal/review/review_test.go (modified, test)
- organizer/internal/review/source.go (modified): Def, Def.testName, Graph, Source, Sources, GoTypes.Handles, GoTypes.Graph, Graph.loadModule, placeholders, pkgDir, Outline
- organizer/internal/review/testdata/rm-v1/check-35671ed.txt (added, test)
- organizer/internal/review/testdata/rm-v1/check.py (added, test)
- organizer/internal/review/testdata/rm-v1/compare.go.txt (added, test)
- organizer/internal/review/testdata/rm-v1/compare.txt (added, test)
- organizer/internal/review/testdata/rm-v1/hand-lists.md (added, test)
- organizer/internal/review/testdata/rm-v1/revmap-35671ed.json (added, test)
- organizer/internal/review/testdata/rm-v1/revmap-c8e1773.json (added, test)
- organizer/internal/review/testdata/rm-v1/runs-revmap.txt (added, test)
- organizer/internal/review/testdata/rm-v1/t4.txt (added, test)
- organizer/internal/review/testdata/rm-v1/t5-c8e1773.txt (added, test)
- organizer/internal/review/testdata/rm-v1/t6-no-node.txt (added, test)
- organizer/internal/review/testdata/rm-v1/timings.txt (added, test)
- organizer/internal/review/testdata/rm-v1/x0.txt (added, test)
- organizer/internal/review/ts.go (added): TSCompiler, TSCompiler.Name, TSCompiler.Handles, NodeBinary, TypeScriptIn, tsDef, TSCompiler.Graph, lastLines
- organizer/internal/review/ts_test.go (added, test)
- organizer/internal/review/tsgraph.js (added): isTestFile, own, startOf, line, bindingNames, testName, at

## Tests touched

- organizer/internal/cli/review_test.go
- organizer/internal/review/review_test.go
- organizer/internal/review/testdata/rm-v1/check-35671ed.txt
- organizer/internal/review/testdata/rm-v1/check.py
- organizer/internal/review/testdata/rm-v1/compare.go.txt
- organizer/internal/review/testdata/rm-v1/compare.txt
- organizer/internal/review/testdata/rm-v1/hand-lists.md
- organizer/internal/review/testdata/rm-v1/revmap-35671ed.json
- organizer/internal/review/testdata/rm-v1/revmap-c8e1773.json
- organizer/internal/review/testdata/rm-v1/runs-revmap.txt
- organizer/internal/review/testdata/rm-v1/t4.txt
- organizer/internal/review/testdata/rm-v1/t5-c8e1773.txt
- organizer/internal/review/testdata/rm-v1/t6-no-node.txt
- organizer/internal/review/testdata/rm-v1/timings.txt
- organizer/internal/review/testdata/rm-v1/x0.txt
- organizer/internal/review/ts_test.go

## Not changed, on purpose (declared)

- `internal/cli/cli.go`: doctor's line already prints reviewStatus, which review.go holds

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| boundary unreadable | organizer | docs/specs/review-map.md: no section 'v1 Boundary' | boundary entry |
| outside boundary | organizer/internal/cli/review.go |  | modified |
| outside boundary | organizer/internal/cli/review_test.go |  | modified |
| outside boundary | organizer/internal/review/git.go |  | modified |
| outside boundary | organizer/internal/review/review.go |  | modified |
| outside boundary | organizer/internal/review/review_test.go |  | modified |
| outside boundary | organizer/internal/review/source.go |  | modified |
| outside boundary | organizer/internal/review/testdata/rm-v1/check-35671ed.txt |  | added |
| outside boundary | organizer/internal/review/testdata/rm-v1/check.py |  | added |
| outside boundary | organizer/internal/review/testdata/rm-v1/compare.go.txt |  | added |
| outside boundary | organizer/internal/review/testdata/rm-v1/compare.txt |  | added |
| outside boundary | organizer/internal/review/testdata/rm-v1/hand-lists.md |  | added |
| outside boundary | organizer/internal/review/testdata/rm-v1/revmap-35671ed.json |  | added |
| outside boundary | organizer/internal/review/testdata/rm-v1/revmap-c8e1773.json |  | added |
| outside boundary | organizer/internal/review/testdata/rm-v1/runs-revmap.txt |  | added |
| outside boundary | organizer/internal/review/testdata/rm-v1/t4.txt |  | added |
| outside boundary | organizer/internal/review/testdata/rm-v1/t5-c8e1773.txt |  | added |
| outside boundary | organizer/internal/review/testdata/rm-v1/t6-no-node.txt |  | added |
| outside boundary | organizer/internal/review/testdata/rm-v1/timings.txt |  | added |
| outside boundary | organizer/internal/review/testdata/rm-v1/x0.txt |  | added |
| outside boundary | organizer/internal/review/ts.go |  | added |
| outside boundary | organizer/internal/review/ts_test.go |  | added |
| outside boundary | organizer/internal/review/tsgraph.js |  | added |
| outside footprint | organizer/internal/cli/review_test.go |  | modified |
| new host | organizer/internal/cli/review.go | nodejs.org | on an added line |
| new host | organizer/internal/review/ts.go | nodejs.org | on an added line |
| untested? | organizer/internal/cli/review.go | reviewCmd | no test file names it |
| untested? | organizer/internal/review/git.go | Hunks | no test file names it |
| untested? | organizer/internal/review/review.go | buildRepo | no test file names it |
| untested? | organizer/internal/review/review.go | packageLevel | no test file names it |
| untested? | organizer/internal/review/review.go | pkgFile | no test file names it |
| untested? | organizer/internal/review/review.go | lastName | no test file names it |
| untested? | organizer/internal/review/review.go | uniqKeep | no test file names it |
| untested? | organizer/internal/review/review.go | WriteSummary | no test file names it |
| untested? | organizer/internal/review/source.go | Def.testName | no test file names it |
| untested? | organizer/internal/review/source.go | GoTypes.Handles | no test file names it |
| untested? | organizer/internal/review/source.go | GoTypes.Graph | no test file names it |
| untested? | organizer/internal/review/source.go | Graph.loadModule | no test file names it |
| untested? | organizer/internal/review/source.go | placeholders | no test file names it |
| untested? | organizer/internal/review/source.go | pkgDir | no test file names it |
| untested? | organizer/internal/review/source.go | Outline | no test file names it |
| untested? | organizer/internal/review/ts.go | TSCompiler.Handles | no test file names it |
| untested? | organizer/internal/review/ts.go | TSCompiler.Graph | no test file names it |
| untested? | organizer/internal/review/ts.go | lastLines | no test file names it |
| untested? | organizer/internal/review/tsgraph.js | isTestFile | no test file names it |
| untested? | organizer/internal/review/tsgraph.js | startOf | no test file names it |
| untested? | organizer/internal/review/tsgraph.js | bindingNames | no test file names it |
| untested? | organizer/internal/review/tsgraph.js | testName | no test file names it |

48 flags: outside boundary 22, outside footprint 1, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 2, risk 0, untested? 22, could not read 0, boundary unreadable 1
```

- `boundary unreadable` and the 22 `outside boundary`: one cause, a footprint/boundary entry written with words (`docs/specs/review-map.md v1 Boundary, rm-v1-ts`; the spec's heading is `### Boundary` under `## v1`), the known false-flag class. Checked by hand instead: every changed file is under `internal/review/` or is `internal/cli/review.go`/`review_test.go`; `tsgraph.js` is the node helper the Boundary allows; no frontend file, lockfile, go.mod, app.go or main.go; no `/Users`, `/opt`, `.nvm`, `homebrew` or `claudecode` path on an added code line. Inside the Boundary.
- `outside footprint` `internal/cli/review_test.go`: the footprint lists `review.go` but not its test; the Boundary allows "their tests". Not a finding.
- `new host` nodejs.org (review.go:119, ts.go:87): the install hint in two messages; nothing fetches it. Not a finding.
- `untested?` ×22: change-check's name grep, not a gate row; `go test ./internal/review ./internal/cli` passes in X0. Not a finding.
- undeclared 0, declared-not-changed 0: the Declared changes match the diff (cli.go unchanged on purpose, said so).

Rows:
- T1: my own list from `git diff -U0 35671ed^1 35671ed -- '*.ts' '*.tsx'` (minus `.d.ts`, `frontend/wailsjs`), mapping each hunk to its top-level definition at both sides: 15 (CrewResult +, useAnnouncer, runningOf +, startCrew, Crew, SeatRow, SAY_GAP_MS +, speaker, Say +, useLiveRegion, api; tests B3, P2 +, N2, P4 +); import lines and the file comment at liveRegion.test.ts:6 (blank line before `afterEach`) touch none. Identical to `hand-lists.md` (9020955, committed before the code, 40c59e5) and to my run's revmap: 15 TS changed nodes, same `change`, all `lang: "ts"`, none extra; no frontend file under another lang.
- T2: `git grep -nw` at 35671ed over non-test `frontend/src`: startCrew ← Crew (Crew.tsx:510); speaker ← useLiveRegion (liveRegion.ts:50); useLiveRegion ← useAnnouncer (Crew.tsx:170), NewAgent (AgentsView.tsx:214, def at 202), InitiativesView (InitiativesView.tsx:80, def at 68); my fourth, SeatRow ← Crew (Crew.tsx:587, Crew at 405). The revmap's in-edges are exactly these, `uses`; NewAgent and InitiativesView `affected`, the rest changed themselves. SeatRow's 10 out-edges each found by grep in its body (595-643). `api` has no edge to Crew.tsx's `CrewResult`.
- T3: `speaker` lists `liveRegion.test.ts::N2: …` and `::P4: …` (grep: calls at 14, 30, 40, 58, 79); `useAnnouncer`, `useLiveRegion`, `Say`, `CrewResult` carry `untested`, and grep of `*.test.ts(x)` names none of them (`api` also `untested`; its only test hits are `api:` keys in `vi.mock`).
- T4: scripted (`t4.py`): 35671ed 123 symbols, 13 packages, 0 bad parents, 134 symbol edges, 12 package edges, 0 package edges without a symbol edge under, 0 crossing pairs without one, package `change` right on all; c8e1773 75 symbols, 10 packages, 0 bad parents, 91 symbol edges, 11 package edges, 0, 0, right on all; no dangling edge.
- T5: `organizer review organizer c8e1773`: `problems` empty, `embed all:frontend/dist: placeholder` once in the summary (and in `notes`), `git status --porcelain` in the clone empty after.
- T6: Notes table present, compiler API chosen with why. PATH = temp dir of symlinks: go + git alone exits 1 `exec: "tar": executable file not found` (v0's `git archive | tar`, unchanged here; see Note); go + git + tar: exit 0, problem `ts: node is not on PATH … install Node`, Go nodes written, the same 45 Go nodes and 47 Go edges as the full run; `organizer doctor` on that PATH: `node not on PATH, so no TypeScript is read`.
- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` exit 0, **fresh** run (test-lease log: start 20:41:45, end 20:42:40 rc 0 saved; run id `cfacb959ee3be4e7c8a6b8229392cd68`); `cd frontend && test-lease run -- pnpm run build` 0; `test-lease run -- wails build` 0; `git status --porcelain` empty; no package-lock.json.

Findings: none blocking. "Found, not asked" above: the rm-v1-reconcile line → card rm-v1-reconcile; the other three and both Notes below → the FSE, thread 01M5644TMW0YVJ34QBHHXGT9GV (sup80, 2026-10-17). On the cgo one: on my go+git+tar PATH it only adds problem lines; the Go nodes and edges were identical to the full run.

- Note: `organizer doctor` and the review never name `tar`, which the export needs (v0, outside this card; FR-10 reads "a tool").
- Note: the summary's source reads `go/types, typescript` on c8e1773 where node never ran (sources listed, not the ones used).
- Note: FR-8 says a TS package is "the file's directory under src"; ids are the directory from the repo root (`ts:frontend/src/lib`), a choice the card names.
- Note: change-check reads the card's `boundary:` entry as unreadable; it should say the section name it looked for matched no heading (sent to sup80).
