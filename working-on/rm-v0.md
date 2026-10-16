---
title: "organizer review: a Go change as revmap.json (review map v0)"
status: now
repos: [organizer]
branch: rm-v0
seat: rm-build
updated: 2026-10-15
next: "review: rm-v0, gate met (M4 read per review-map Amendment 1), 42ca123"
depends_on: []
boundary: ["docs/specs/review-map.md Boundary, rm-v0"]
spec: "docs/specs/review-map.md (FR-1 to FR-6; agent-slack review/pipeline-starter.md §6.6)"
gate: "docs/specs/review-map.md Acceptance, rows M1, M2, M3, M4, M5, M6 and X0"
ui_review: false
---

## Goal
From a card or a merge, `organizer review` emits the Go change as revmap.json: changed symbols, their 1-hop callers and callees, the tests that reach them (review tooling, agent-slack decisions 2026-10-15; T15b).

## Gate
docs/specs/review-map.md, rows M1, M2, M3, M4, M5, M6 and X0.

Evidence on branch rm-v0 under `docs/evidence/rm-v0/` (hand lists committed first, 09bbd7f).
- [x] M1: both merges in a clean clone's build, valid JSON, base = first parent, 0 non-Go nodes: `c8e1773.revmap.json`, `35671ed.revmap.json`, `runs.txt`, `checks.txt` (M1); fixture `TestBuildOnMerge` (internal/review).
- [x] M2: c8e1773's 8 changed definitions and 9 changed test definitions match `hand-lists.md` (M2) with their change; no other changed node: `checks.txt` (M2).
- [x] M3: StartCrew, Service.CreateCrew, runLaunches: all 5 hand callers present with `uses` edges (`source: go/types`), callers `affected` (crewCmd and RetrySeat are themselves `modified`), no other edge into them: `checks.txt` (M3) against `hand-lists.md` (M3).
- [x] M4: c8e1773: Service.StartCrew lists `internal/service/crewskip_test.go::TestCreateCrewSkipsRunningSeats` (and 2 more); Service.runLaunches and cli.crewCmd carry `untested`. 35671ed: every changed definition is reached by a test (App.CreateCrew → `app_launch_test.go::TestAppCreateCrewReturnsAtOnce`), so no `untested` exists to show there; per review-map.md Amendment 1 (d38d32a) M4 holds across the two merges and 35671ed having none is evidence of no false `untested`. `checks.txt` (M4); fixture `TestBuildOnMerge`.
- [x] M5: the table under Notes.
- [x] M6: `organizer review organizer rm-v0` resolves 294e125..head from the branch; `app-icon-composer` (branch gone) exits 2 naming it: `runs.txt` (M6). A card with no `branch:` exists on no real board; `TestReviewCardWithoutBranchExits2` (internal/cli) exits 2 with "card no-branch has no branch: field".
- [x] X0: in a clean clone of 005ebe4: `XDG_DATA_HOME=$(mktemp -d) make test` pass (Go ok, vitest 757 passed), `pnpm run build` pass, `wails build` pass, `git status --porcelain` empty. The rebase onto main after it added card/docs commits only.

## Notes
- 2026-10-15: run by sup74 (organizer-probe-sup74), spawned by the FSE.
- M5, the index source, measured on c8e1773 against `docs/evidence/rm-v0/hand-lists.md`:

| source | M2 misses | M3 misses (of 5) | wall time on c8e1773 | install on odyssey |
|---|---|---|---|---|
| codebase-memory (`index_repository` fast, `detect_changes`, `trace_path`) | 0 missed, but file-level: every symbol of each changed file (~50 untouched Go definitions) plus ~230 nodes of `models.ts`, so hunks would still have to be mapped by us | 1: App.CreateCrew → Service.CreateCrew (qualified names drop the receiver; 3 `CreateCrew` are ambiguous) | 3.9 s to index head only, plus queries; a second index for base | the `codebase-memory-mcp` binary and an index per side; it indexes a working tree, so a checkout of base and head; the organizer binary would have to run it and speak MCP over stdio. Not shipped with the app |
| scip-go v0.2 (`scip-code/scip-go`, GOBIN under .wt-notes) | 3: enclosing ranges exist only for functions, so types and vars (CrewStart, SeatLaunch, liveSeats) map to nothing without our own parse | 0 | 2.75 s head only (~5.5 s both sides) plus decoding | `scip-go` binary + go toolchain + the module cache, and a protobuf SCIP reader as a library in the organizer |
| go/packages + go/types in process (**chosen**) | 0 missed, 0 extra | 0 missed, 0 extra | 2.25-2.29 s both sides (3 runs, `runs.txt`) | the go toolchain on PATH and the module's deps in the cache (no download: GOPROXY=off); `organizer doctor` prints `review: go at …`, and review names `go mod download` when deps are missing |

  Chosen go/types: the only source with no M2 or M3 miss, the fastest for both sides, and the only one that needs nothing beyond what a Go developer's odyssey already has. Behind `review.Source` so v1 can add scip or the index.
- Choices where the spec left room: a definition's range includes its doc comment; package-level vars and consts are nodes (`liveSeats` is a func literal held in a var); changed `_test.go` definitions are nodes of kind `test`, not expanded one hop; tests are Test functions reaching a node directly or through test-file helpers; base/head are exported with `git archive` into a temp dir under the data dir, never a worktree; nodes of an affected definition carry `range_base` when base has it; `problems` lists what go list could not read (here the unbuilt `frontend/dist` embed, which leaves the main package type-checked).
- Found, not asked: the main package's `//go:embed all:frontend/dist` fails in any export of the tree (dist is ignored), reported as a problem on every organizer review; type info still resolves. 35671ed cannot show M4's untested half (asked sup74).

## Done
- 2026-10-15: `organizer review` (internal/review, internal/cli/review.go) writes revmap.json v0 from go/types; gate met on c8e1773 and 35671ed, branch rm-v0 at 42ca123, unmerged.
