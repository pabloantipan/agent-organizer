---
title: Bring crew up refuses a seat without its persona file
status: done
repos: [organizer]
branch: main
updated: 2026-09-28
next: "none: reviewed pass 2026-09-28; merge cell-persona-check (sup15)"
depends_on: ["cell-in-definition"]
boundary: ["internal/service/crew.go (CreateCrew's preflight only)", "internal/cli/crew.go", "frontend/src/components/Crew.tsx (the seat row only)", "testdata/ (a seat without its file)", "internal/service/crew_test.go"]
spec: "docs/specs/discovery-in-a-cell.md (FR-2); values: docs/design-system.md"
gate: "docs/specs/discovery-in-a-cell.md Acceptance, rows G2, G5; the Gate section below"
stage: discovery-in-a-cell
seat: cell-persona
review: pass
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

## Review
- Verdict: pass (G2, G5 met at 07f37bf).
- Unmet gate items: none.
- Not covered by the gate: (1) the Bring crew up button stays enabled on a cell with a seat marked "no persona file"; the refusal only shows after a click (FR-2 is met, but the button could say why first). (2) Nobody checked that camp's six seats each have `agents/<seat>.md`; if one lacks it, Bring crew up now refuses camp (builder's note). (3) `service.Seat.NoPersona` sits outside "CreateCrew's preflight only", a one-field boundary stretch the builder flagged.
- G2: reproduced on a fresh fixture home at 07f37bf: `organizer crew init-define --print` prints "define-fixture: 1 of 3 seats have no persona file; …/init-define/agents/designer_diego.md", exit 1; `organizer crew init-a --print` gets past the persona check and stops at the discuss token (`.wt-notes/cell-persona-review/g2-crew-print.txt`). `TestCreateCrewRefusesASeatWithoutItsPersonaFile` read and passes: both missing files named, the existing one not, nothing created under crewDir, `no_persona` per seat, a directory not counted as a file. Screenshot `.wt-notes/cell-persona/g2-crew-row-init-define.png` shows designer_diego alone with "no persona file"; control `g2-crew-rows-init-a-control.png` shows no mark. Taken before the rebase (c0c28b1); the rebase changed no file this row touches.
- G5: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0; `npm run build` "✓ built in 1.08s" exit 0; G18 grep over main...cell-persona-check empty, grep exit 1 (`.wt-notes/cell-persona-review/g5-*.txt`).
- Reviewer: cell-persona-review, 2026-09-28
