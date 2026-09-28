---
title: A cell being defined reads as in definition
status: done
repos: [organizer]
branch: main
updated: 2026-09-28
next: "review: cell-in-definition, branch cell-in-definition, gate G1, G5 met, a87292e 94350ec eb49c81 efe4d97 e32d539 48ff00a"
review: pass
depends_on: []
boundary: ["internal/service/crew.go (the derived state; not CreateCrew)", "internal/model/model.go (Cell: state)", "frontend/src/components/Crew.tsx", "frontend/src/components/AgentsView.tsx", "frontend/src/components/Home.tsx (the signal only)", "testdata/ (a cell with no sessions)", "internal/service/crew_test.go", "frontend/src/styles/ (those components' CSS only)"]
spec: "docs/specs/discovery-in-a-cell.md (FR-1); values: docs/design-system.md"
gate: "docs/specs/discovery-in-a-cell.md Acceptance, rows G1, G5; the Gate section below"
stage: discovery-in-a-cell
seat: cell-indef
---

## Goal
Roadmap stage discovery-in-a-cell: FR-1 of `docs/specs/discovery-in-a-cell.md`.

## Gate
- [x] G1: see `docs/specs/discovery-in-a-cell.md`, Acceptance
- [x] G5: see `docs/specs/discovery-in-a-cell.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE
- 2026-09-28 built by cell-indef on branch cell-in-definition (22e2169 derived state `model.Cell.State` in `buildCrew`/`cellState`, 1cafa8e fixture `init-define`, 1babda2 wailsjs models, 977dc03 Crew/Agents/Home). G1: `go test ./internal/service -run TestCellInDefinitionUntilASeatHasRun` → `--- PASS` (no sessions or runs → in definition; one seat live, an exited layout, a past run by persona or by session → not; runs.jsonl read); screenshots `/Users/pabloantipan/organizer/.wt-notes/cell-indef/g1-home.png` (init-define "cell in definition", init-a "5 live" without it), `/Users/pabloantipan/organizer/.wt-notes/cell-indef/g1-crew-in-definition.png` (Crew header and Agents tab "in definition", "no seat has run yet; waits on its first launch"), `/Users/pabloantipan/organizer/.wt-notes/cell-indef/g1-crew-live.png` (init-a's live cell, no word). G5 after rebase on main: `XDG_DATA_HOME=$(mktemp -d) make test` → `exit 0`, 0 FAIL (`/Users/pabloantipan/organizer/.wt-notes/cell-indef/g5-make-test.txt`); `npm run build` → `✓ built`, `exit 0` (`/Users/pabloantipan/organizer/.wt-notes/cell-indef/g5-npm-build.txt`); G18 grep over `main...cell-in-definition` → empty (`/Users/pabloantipan/organizer/.wt-notes/cell-indef/g5-g18-grep.txt`, 0 lines). Rebased again onto da7f395 (discovery-gate-shown; README: both bullets kept): G5 rerun, same three outputs; screenshots retaken with init-b and init-c beside, same claims hold. Choices: `/Users/pabloantipan/organizer/.wt-notes/cell-indef/progress.md`.
- 2026-09-28 cell-indef, after the failed review: G1's fixture is on the branch (e32d539, `init-define/agents/cell.json` force-added; `git ls-tree -r cell-in-definition` lists it). Finding (b) is fixed in 48ff00a: `crewCell` in crew.go returns a copy of the cell with `State`, `buildCrew` no longer writes, and the two approved call sites take the copy. `TestCellStateRidesACopyNotTheCache` runs `Service.Cell` against `agentsViewLocked` and checks that the cached cell and the marshalled state stay without `state`. `go test -race -count=1 ./internal/service` → `ok` (`/Users/pabloantipan/organizer/.wt-notes/cell-indef/race-service.txt`). With the old in-place write put back, that test and the G1 test fail on their assertions; the race detector did not report a race in that run. In the fixture dev app's state.json neither cell has a `state` key (`/Users/pabloantipan/organizer/.wt-notes/cell-indef/statejson-check.txt`). Rebased on main. G5: `XDG_DATA_HOME=$(mktemp -d) make test` → `exit 0`, 0 FAIL; `npm run build` → `✓ built`, `exit 0`; G18 grep → 0 lines (same files). Screenshots retaken from the tracked fixture; the same claims hold (`/Users/pabloantipan/organizer/.wt-notes/cell-indef/g1-home.png`, `/Users/pabloantipan/organizer/.wt-notes/cell-indef/g1-crew-in-definition.png`, `/Users/pabloantipan/organizer/.wt-notes/cell-indef/g1-crew-live.png`).

## Next
1. review: cell-in-definition, branch cell-in-definition, gate G1, G5 met

## Review
- Verdict: **pass** (second review; the first failed on G1 because the fixture was missing)
- Unmet gate items: none
- G1: met.
  - `go test -race -count=1 -v ./internal/service -run 'TestCellInDefinitionUntilASeatHasRun|TestCellStateRidesACopyNotTheCache'` passes, exit 0 (`/Users/pabloantipan/organizer/.wt-notes/cell-indef-review/r2/g1-test-race.txt`). The cases: no sessions or runs gives in definition; runs of other cells don't count; a live seat, an exited layout, and past runs by persona and by session each end it; runs.jsonl is read. The views get the state on a copy, and the cached cell and state.json stay without it.
  - The fixture is now on the branch: e32d539 force-adds `testdata/fixture-overlay/init-define/agents/cell.json` (`git ls-tree` lists it).
  - The screenshots were retaken at 18:58, after 48ff00a, on a fresh fixture (`/Users/pabloantipan/organizer/.wt-notes/cell-indef/g1-home.png`, `g1-crew-in-definition.png`, `g1-crew-live.png`). init-define reads "cell in definition" on Home, and "in definition" plus "no seat has run yet; waits on its first launch" on the Crew header and the Agents tab. init-a's live cell shows no word.
- G5: met.
  - `XDG_DATA_HOME=$(mktemp -d) make test` exits 0 with 0 FAIL (`.../cell-indef-review/r2/g5-make-test.txt`).
  - `npm run build` gives `✓ built` and exits 0 (`.../r2/g5-npm-build.txt`).
  - The G18 grep over `main...cell-in-definition` returns 0 lines (`.../r2/g5-g18-grep.txt`).
  - main's only commit not on the branch is ba68906 (this card).
- Not covered by the gate:
  - Finding (b), the write outside the lock, is fixed in 48ff00a. The `service.go` and `cell.go` diffs are the two call-site lines sup15 approved, nothing more.
  - The card Notes cite 2cbf83b for the fixture; after the rebase it is e32d539.
  - Still open for Pablo:
    - (a) a cell in definition offers "N retirable";
    - (c) the spec's Goals name the rail, FR-1 does not;
    - (d) Home's STATE column says "quiet" beside "cell in definition".
- Reviewer: cell-indef-review, 2026-09-28

## Blockers
none

## Notes
- 2026-09-28 sup15 runs this card (organizer-probe-sup15), spawned by the FSE after 0048
- 2026-09-28 cell-indef: `buildCrew` stamps the state on the shared `*model.Cell` (how it reaches `AgentGroup.Cell` without touching service.go); `Service.Cell` calls it outside `s.mu`, and the value reaches state.json and the sync payload until the next rescan clears it. The merged board has no Cell, so the agents feed carries it.
- 2026-09-28 cell-indef: a cell in definition still offers "N retirable" on Crew for seats that never ran; the spec did not say.
- 2026-09-28 cell-indef: the spec's Goals name "the rail", FR-1 does not; built FR-1 (Crew, Agents tab, Home).
- 2026-09-28 cell-indef, after the review: G1's missing fixture is fixed (2cbf83b, `git add -f` of `init-define/agents/cell.json`; branch rebased on main). Finding (b) cannot be fixed in crew.go alone. The two views take the cell pointer before or beside `buildCrew`: `cell.go:232` builds `CellView{Cell: si.Cell}` and only then calls `buildCrew`, and `service.go:468` is `g.Cell, g.Crew, g.Discuss = si.Cell, buildCrew(si, snap), why`, where Go leaves the order of reading `si.Cell` and making the call unspecified. A copy made inside `buildCrew` cannot reach either view, and replacing `si.Cell` in place puts the copy into the cache. Proposed fix: `buildCrew` stops writing, and crew.go gets `crewCell(cell, seats) *model.Cell`, a copy with `State`. The two call sites become `g.Cell = crewCell(si.Cell, g.Crew)` and `v.Cell = crewCell(si.Cell, v.Crew)`, one line each. Add a `-race` test that runs `Service.Cell` against `agentsViewLocked`, and check that state.json has no `state`. Waiting on sup15 before touching `service.go` and `cell.go`.
- 2026-09-28 cell-indef: sup15 extended the boundary for finding (b) by exactly two call sites: `internal/service/service.go` (agentsViewLocked: `g.Cell = crewCell(si.Cell, g.Crew)`) and `internal/service/cell.go` (CellView's Cell: `v.Cell = crewCell(si.Cell, v.Crew)`, dropped from the literal). Nothing else in those files changed. Findings (a), (c) and (d) are left as the review wrote them.
