---
title: Bring crew up refuses a seat without its persona file
status: now
repos: [organizer]
branch: main
updated: 2026-09-28
next: "review: cell-persona-check, branch cell-persona-check, gate G2, G5 met, 376ee4a 2ec1b83 07f37bf"
depends_on: ["cell-in-definition"]
boundary: ["internal/service/crew.go (CreateCrew's preflight only)", "internal/cli/crew.go", "frontend/src/components/Crew.tsx (the seat row only)", "testdata/ (a seat without its file)", "internal/service/crew_test.go"]
spec: "docs/specs/discovery-in-a-cell.md (FR-2); values: docs/design-system.md"
gate: "docs/specs/discovery-in-a-cell.md Acceptance, rows G2, G5; the Gate section below"
stage: discovery-in-a-cell
seat: cell-persona
---

## Goal
Roadmap stage discovery-in-a-cell: FR-2 of `docs/specs/discovery-in-a-cell.md`.

## Gate
- [x] G2: see `docs/specs/discovery-in-a-cell.md`, Acceptance
- [x] G5: see `docs/specs/discovery-in-a-cell.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE
- 2026-09-28 cell-persona: FR-2 built on branch cell-persona-check (376ee4a preflight + no_persona on service.Seat, 2ec1b83 seat row, 07f37bf fixture: init-define's designer_diego has no file), rebased on main 8707ff5.
  G2: `organizer crew init-define --print` on the fixture home, `.wt-notes/cell-persona/g2-crew-print.txt`: "define-fixture: 1 of 3 seats have no persona file; …/init-define/agents/designer_diego.md", "exit code: 1"; test `TestCreateCrewRefusesASeatWithoutItsPersonaFile` (internal/service/crew_test.go, two missing files named, nothing created); screenshot `.wt-notes/cell-persona/g2-crew-row-init-define.png` (designer_diego row "no persona file"), control `.wt-notes/cell-persona/g2-crew-rows-init-a-control.png` (no mark).
  G5 at 07f37bf: `XDG_DATA_HOME=$(mktemp -d) make test` "exit code: 0" (`.wt-notes/cell-persona/g5-make-test.txt`); `cd frontend && npm run build` "✓ built in 1.04s", "exit code: 0" (`.wt-notes/cell-persona/g5-npm-build.txt`); G18 grep main...cell-persona-check empty, "grep exit code: 1" (`.wt-notes/cell-persona/g5-g18-grep.txt`).

## Next
1. review: cell-persona-check, branch cell-persona-check, gate G2, G5 met, 376ee4a 2ec1b83 07f37bf

## Blockers
none

## Notes
- 2026-09-28 sup15 runs this card (organizer-probe-sup15), spawned by the FSE after 0048
- 2026-09-28 cell-persona: boundary stretch, flagged: the row needs the fact from Go, so `service.Seat` (a bound type in crew.go, not model.go) gained `no_persona`, stamped in `buildCrew` by the preflight's own `hasPersonaFile`; one line outside "CreateCrew's preflight only". No other file. `internal/cli/crew.go` needed no change (it already exits 1 on the error).
- 2026-09-28 cell-persona: not checked whether real cells (camp) have agents/<seat>.md for every seat; if one lacks it, Bring crew up now refuses it. fixture-twenty's seats all read "no persona file" (they have none). Choices and details: .wt-notes/cell-persona/progress.md
