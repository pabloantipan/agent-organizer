---
title: "organizer review reads TypeScript, adds the package level, and survives the dist embed"
status: now
repos: [organizer]
branch: rm-v1-ts
seat: rt-build
stage: review-map
updated: 2026-10-17
next: "review: rm-v1-ts, gate met (T1-T6, X0), 35d5fda"
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
