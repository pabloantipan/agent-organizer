---
title: Initiatives carry a goal, a measure and stages
status: next
repos: [organizer]
branch: redesign-goal-stages
updated: 2026-09-26
next: "review: redesign-goal-stages, gate G1, G2, G3, G9, G17 met, eea9e86 a9d5f9f 73082f6 4c25d48 e796dd1"
seat: wave1-goals
depends_on: []
boundary: ["internal/model/model.go (Initiative, Card, BoardInitiative: goal, measure, specs, stages, stage)", "internal/model/decision.go (stage)", "internal/scan/scan.go (ReadInitiative)", "internal/scan/roadmap.go (new)", "internal/scan/roadmap_test.go (new)", "internal/scan/decisions.go (the stage check)", "internal/merge/", "testdata/home/init-a/", "internal/cli/testdata/status.golden", "CLAUDE.md (Layout: one bullet)"]
spec: "docs/specs/redesign.md (FR-1 to FR-5); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G1, G2, G3, G9, G17; the Gate section below"
---

## Goal
The redesign, wave 1 of 2: FR-1 to FR-5 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [x] G1: see `docs/specs/redesign.md`, Acceptance
- [x] G2: see `docs/specs/redesign.md`, Acceptance
- [x] G3: see `docs/specs/redesign.md`, Acceptance
- [x] G9: see `docs/specs/redesign.md`, Acceptance
- [x] G17: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE
- 2026-09-26 FR-1 to FR-5 built on `redesign-goal-stages` (eea9e86 model, a9d5f9f scan, 73082f6 fixtures and golden, 4c25d48 tests, e796dd1 CLAUDE.md), rebased onto main, unmerged. `initiative.yaml` goal, measure and specs sit on `model.Initiative` and reach `BoardInitiative` through the embedding; `working-on/roadmap.yaml` is read by `scan.readRoadmap` into `model.Stage` (`exit` as a string or `{text, met}` through `ExitItem.UnmarshalYAML`), the first stage without `done` is stamped `current` (`model.CurrentStage` is the same rule); cards and records carry `stage:`. Gate, each with its evidence:
  - G1 `XDG_DATA_HOME=$(mktemp -d) go test ./internal/scan/ ./internal/merge/ -run 'GoalMeasureSpecs|CarriesGoalMeasureSpecsAndStages' -v` → `--- PASS: TestReadInitiativeGoalMeasureSpecs (0.00s)`, `--- PASS: TestBuildCarriesGoalMeasureSpecsAndStages (0.00s)`
  - G2 same command, `-run 'StagesAndCurrentStage|WithoutRoadmap'` → `--- PASS: TestReadRoadmapStagesAndCurrentStage (0.00s)` (4 stages, current is `joins`, the second), `--- PASS: TestReadInitiativeWithoutRoadmap (0.00s)` (init-b: 0 stages, 0 problems)
  - G3 same command, `-run 'ProblemsDoNotFail|ReadRoadmapMalformed|CheckStageLinks|CarryStage'` → `--- PASS: TestRoadmapProblemsDoNotFailTheScan (0.00s)`: the four FR-5 problems once each, `init-a` still 1 now / 1 blocked / 2 next and 4 stages
  - G9 `cd /Users/pabloantipan/organizer/.wt/redesign-goal-stages && XDG_DATA_HOME=$(mktemp -d) make test` → `ok` for all 12 packages with tests (`ok organizer/internal/scan 2.336s`, `ok organizer/internal/cli 5.307s`), `go vet ./...` silent
  - G17 `git -C .wt/redesign-goal-stages diff --name-only main...redesign-goal-stages -- '*.css'` → empty
- 2026-09-26 `status.golden` regenerated for the new fixture only; the whole diff is four added problem lines, no card or count changed:
  ```
  +  ! ~/init-a/working-on/roadmap.yaml: stage joins exit "a wave is grouped" met "soon" is not YYYY-MM-DD
  +  ! ~/init-a/working-on/roadmap.yaml: stage id "joins" is used twice
  +  ! ~/init-a/working-on/roadmap.yaml: stage joins gates on decision 0099, which does not exist
  +  ! ~/init-a/working-on/beta.md: stage "no-such-stage" is not on the roadmap
  ```

## Next
1. review: gate G1, G2, G3, G9, G17 met on `redesign-goal-stages`, unmerged; a reviewer that is not the builder passes the card and the supervisor merges

## Blockers
none

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- 2026-09-26 the four FR-5 faults live in `testdata/home/init-a/working-on/roadmap.yaml` because the boundary is `testdata/home/init-a/` only, so there is no second fixture initiative to hold them: `init-a` is already the kitchen-sink fixture. Cost: four permanent `!` lines in `status.golden`. A wave-2 fixture that wants a clean roadmap needs its own initiative root.
- 2026-09-26 not asked, not done: nothing resolves a `specs` entry (a folder to its `*.md`, an entry that climbs out of the root is refused — the working-on skill, Conventions). No FR covers it and G3 counts exactly four problems, so `specs` is read verbatim.
- 2026-09-26 `frontend/wailsjs` is generated and committed, and `Initiative` gaining goal/measure/specs/stages plus `Card` and `Decision` gaining `stage` makes those TypeScript models stale. Regenerating is outside this card's boundary and would collide with the other wave-1 branches: run `wails generate module` once after wave 1 merges.
- 2026-09-26 sup2 runs this card (organizer-probe-sup2), spawned by the FSE after 0023; seat wave1-goals, worktree .wt/redesign-goal-stages, branch redesign-goal-stages
