---
title: Initiatives carry a scope, and stages a phase
status: now
repos: [organizer]
branch: glance-scope-phase
seat: wave1-scope
updated: 2026-09-27
next: "review: glance-scope-phase, gate G1–G4 met, c6d2836 49fd5b7 2216f5c 838613c e98e81b"
depends_on: []
boundary: ["internal/model/model.go (Initiative: scope; Stage: phase)", "internal/scan/scan.go (ReadInitiative)", "internal/scan/roadmap.go", "internal/scan/scan_test.go", "internal/scan/roadmap_test.go", "internal/merge/", "testdata/home/", "testdata/fixture-overlay/", "internal/cli/testdata/status.golden", "app.go (a Wails type line only, if needed)", "frontend/wailsjs/ (regenerated)", "CLAUDE.md (the Decisions / roadmap bullet)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-1, FR-2, FR-3); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G1, G2, G3, G4; the Gate section below"
stage: twenty-at-a-glance
---

## Goal
Roadmap stage twenty-at-a-glance (0032): FR-1, FR-2, FR-3 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [x] G1: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G2: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G3: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G4: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-27 cut from the spec by the FSE
- 2026-09-27 wave1-scope: scope and phase read into the board, bad phase and ungated building-after-discovery reported; branch glance-scope-phase (c6d2836 model+merge, 49fd5b7 scan, 2216f5c fixture, 838613c bindings + App.ScopeType, e98e81b CLAUDE.md), rebased on main. G1: TestReadInitiativeScope (scan), TestBuildCarriesGoalMeasureSpecsScopeAndStages (merge, no scope is `{"in":[],"out":[]}`) pass. G2: TestReadRoadmapPhase pass. G3: TestCheckStageLinksBuildingAfterDiscovery pass (gate `4` and `0004` both resolve). G4: `XDG_DATA_HOME=$(mktemp -d) make test` all ok; status.golden unchanged (G4-golden.diff empty); `npm run build` ✓; fixture `go run . status` scans with no new problem (G4-fixture-status.txt, G4-fixture-board.txt). Evidence in .wt-notes/wave1-scope/

## Next
1. review: glance-scope-phase, gate G1–G4 met

## Blockers
none

## Notes
- 2026-09-27 sup5 runs this card (organizer-probe-sup5), spawned by the FSE after 0033
- 2026-09-27 sup5: seat wave1-scope, branch glance-scope-phase in .wt/glance-scope-phase; evidence under .wt-notes/wave1-scope/
- 2026-09-27 wave1-scope: "follows a discovery stage" is read as the nearest earlier stage with a phase; a gate naming no record does not gate. Choices and "Found, not asked" in .wt-notes/wave1-scope/progress.md
- 2026-09-27 sup5: the G5 and G6 fixture material is this card's (testdata): scope on init-a and none on init-b, phases on the overlay roadmap's stages, and a gate written `4` naming a record 0004 in the overlay
