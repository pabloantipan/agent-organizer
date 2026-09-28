---
title: A cell being defined reads as in definition
status: now
repos: [organizer]
branch: main
updated: 2026-09-28
next: "cell-indef: G1, commit the fixture cell: git add -f testdata/fixture-overlay/init-define/agents/cell.json on branch cell-in-definition (ignored by agents/ in .gitignore, so the branch has no cell for init-define), then back to review"
review: fail
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

## Next
1. review: cell-in-definition, branch cell-in-definition, gate G1, G5 met

## Review
- Verdict: **fail**
- Unmet gate items: G1 (the fixture's cell is not on the branch)
- G1: the logic is met. `go test ./internal/service -run TestCellInDefinitionUntilASeatHasRun -v -count=1` gives 9/9 PASS (`/Users/pabloantipan/organizer/.wt-notes/cell-indef-review/g1-test.txt`): no sessions or runs, runs of other cells, a live seat, an exited layout, and past runs by persona and by session, plus the runs.jsonl read. The builder's three screenshots show what the card says: Home's init-define reads "cell in definition" and init-a does not; the Crew header and the Agents tab read "in definition" with "no seat has run yet; waits on its first launch"; init-a's live cell shows no word. The fixture, however, is not in the diff. 1cafa8e adds only `init-define/working-on/initiative.yaml`. `testdata/fixture-overlay/init-define/agents/cell.json` is untracked, because `.gitignore` ignores `agents/` (`git check-ignore -v`: `.gitignore:7:agents/`), and every other fixture cell.json was force-added. `git ls-tree -r cell-in-definition` lists no cell for init-define. On a merge or a fresh checkout, init-define has no cell, so it can never read "in definition": the screenshots cannot be reproduced from the branch.
- G5: met. `XDG_DATA_HOME=$(mktemp -d) make test` exits 0 with 0 FAIL (`/Users/pabloantipan/organizer/.wt-notes/cell-indef-review/g5-make-test.txt`). `npm run build` gives `✓ built` and exits 0 (`/Users/pabloantipan/organizer/.wt-notes/cell-indef-review/g5-npm-build.txt`). The G18 grep over `main...cell-in-definition` returns 0 lines (`/Users/pabloantipan/organizer/.wt-notes/cell-indef-review/g5-g18-grep.txt`).
- Not covered by the gate:
  - (a) A cell in definition still offers "N retirable" (visible in g1-crew-in-definition.png).
  - (b) `buildCrew` writes `Cell.State` onto the shared cached `*model.Cell` from `Service.Cell` outside `s.mu`, a data race `-race` could flag. The value also leaks into state.json and the sync payload.
  - (c) The spec's Goals name the rail, FR-1 does not, and nothing shows there. Pablo should say whether the spec's Goals or FR-1 wins.
  - (d) Home's STATE column says "quiet" beside "cell in definition".
- Reviewer: cell-indef-review, 2026-09-28

## Blockers
none

## Notes
- 2026-09-28 sup15 runs this card (organizer-probe-sup15), spawned by the FSE after 0048
- 2026-09-28 cell-indef: `buildCrew` stamps the state on the shared `*model.Cell` (how it reaches `AgentGroup.Cell` without touching service.go); `Service.Cell` calls it outside `s.mu`, and the value reaches state.json and the sync payload until the next rescan clears it. The merged board has no Cell, so the agents feed carries it.
- 2026-09-28 cell-indef: a cell in definition still offers "N retirable" on Crew for seats that never ran; the spec did not say.
- 2026-09-28 cell-indef: the spec's Goals name "the rail", FR-1 does not; built FR-1 (Crew, Agents tab, Home).
