---
title: A cell being defined reads as in definition
status: now
repos: [organizer]
branch: main
updated: 2026-09-28
next: "review: cell-in-definition, branch cell-in-definition, gate G1, G5 met, e090bc1 c2e899a bc59d2d 21ea6f1"
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
- 2026-09-28 built by cell-indef on branch cell-in-definition (e090bc1 derived state `model.Cell.State` in `buildCrew`/`cellState`, c2e899a fixture `init-define`, bc59d2d wailsjs models, 21ea6f1 Crew/Agents/Home). G1: `go test ./internal/service -run TestCellInDefinitionUntilASeatHasRun` → `--- PASS` (no sessions or runs → in definition; one seat live, an exited layout, a past run by persona or by session → not; runs.jsonl read); screenshots `/Users/pabloantipan/organizer/.wt-notes/cell-indef/g1-home.png` (init-define "cell in definition", init-a "5 live" without it), `/Users/pabloantipan/organizer/.wt-notes/cell-indef/g1-crew-in-definition.png` (Crew header and Agents tab "in definition", "no seat has run yet; waits on its first launch"), `/Users/pabloantipan/organizer/.wt-notes/cell-indef/g1-crew-live.png` (init-a's live cell, no word). G5 after rebase on main: `XDG_DATA_HOME=$(mktemp -d) make test` → `exit 0`, 0 FAIL (`/Users/pabloantipan/organizer/.wt-notes/cell-indef/g5-make-test.txt`); `npm run build` → `✓ built`, `exit 0` (`/Users/pabloantipan/organizer/.wt-notes/cell-indef/g5-npm-build.txt`); G18 grep over `main...cell-in-definition` → empty (`/Users/pabloantipan/organizer/.wt-notes/cell-indef/g5-g18-grep.txt`, 0 lines). Choices: `/Users/pabloantipan/organizer/.wt-notes/cell-indef/progress.md`.

## Next
1. review: cell-in-definition, branch cell-in-definition, gate G1, G5 met

## Blockers
none

## Notes
- 2026-09-28 sup15 runs this card (organizer-probe-sup15), spawned by the FSE after 0048
- 2026-09-28 cell-indef: `buildCrew` stamps the state on the shared `*model.Cell` (how it reaches `AgentGroup.Cell` without touching service.go); `Service.Cell` calls it outside `s.mu`, and the value reaches state.json and the sync payload until the next rescan clears it. The merged board has no Cell, so the agents feed carries it.
- 2026-09-28 cell-indef: a cell in definition still offers "N retirable" on Crew for seats that never ran; the spec did not say.
- 2026-09-28 cell-indef: the spec's Goals name "the rail", FR-1 does not; built FR-1 (Crew, Agents tab, Home).
