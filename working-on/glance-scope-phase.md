---
title: Initiatives carry a scope, and stages a phase
status: now
repos: [organizer]
branch: glance-scope-phase
seat: wave1-scope
updated: 2026-09-27
next: "Read scope in/out and each stage's phase into the board; report a bad phase and an ungated first building stage after discovery"
depends_on: []
boundary: ["internal/model/model.go (Initiative: scope; Stage: phase)", "internal/scan/scan.go (ReadInitiative)", "internal/scan/roadmap.go", "internal/scan/scan_test.go", "internal/scan/roadmap_test.go", "internal/merge/", "testdata/home/", "testdata/fixture-overlay/", "internal/cli/testdata/status.golden", "app.go (a Wails type line only, if needed)", "frontend/wailsjs/ (regenerated)", "CLAUDE.md (the Decisions / roadmap bullet)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-1, FR-2, FR-3); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G1, G2, G3, G4; the Gate section below"
stage: twenty-at-a-glance
---

## Goal
Roadmap stage twenty-at-a-glance (0032): FR-1, FR-2, FR-3 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [ ] G1: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G2: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G3: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G4: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-27 cut from the spec by the FSE

## Next
1. Read scope in/out and each stage's phase into the board; report a bad phase and an ungated first building stage after discovery

## Blockers
none

## Notes
- 2026-09-27 sup5 runs this card (organizer-probe-sup5), spawned by the FSE after 0033
- 2026-09-27 sup5: seat wave1-scope, branch glance-scope-phase in .wt/glance-scope-phase; evidence under .wt-notes/wave1-scope/
- 2026-09-27 sup5: the G5 and G6 fixture material is this card's (testdata): scope on init-a and none on init-b, phases on the overlay roadmap's stages, and a gate written `4` naming a record 0004 in the overlay
