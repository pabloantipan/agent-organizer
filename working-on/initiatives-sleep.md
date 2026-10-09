---
title: "Sleep and wake an initiative through the factory, and read asleep since, frozen sessions and what the factory sees"
status: now
repos: [organizer]
branch: initiatives-sleep
seat: is-build
stage: one-window
updated: 2026-10-09
next: "review: initiatives-sleep, G1-G4 and X0 met, 47715e0"
depends_on: []
boundary: ["new internal/service/sleep.go and tests", "internal/scan (status comment, frozen dirs), model.Initiative (asleep_since, frozen, factory_blind)", "app.go (Sleep, Wake, Factory), testdata, frontend/wailsjs regenerated", "not: the factory scripts, writing initiative.yaml"]
spec: "docs/specs/initiatives-view.md (FR-1 to FR-4)"
gate: "docs/specs/initiatives-view.md Acceptance, rows G1 to G4 and X0"
ui_review: false
---

## Goal
0104: Deltagos puts an initiative to sleep and wakes it the way `factory`
does, and knows what the factory sees.

## Gate
docs/specs/initiatives-view.md, G1 to G4 and X0.
- [x] G1 `internal/service/sleep_test.go` TestSleepWakeThroughTheFactory, TestSleepWhileOneRunsIsBusy (fake `testdata/factory/factory`)
- [x] G2 `internal/scan/sleep_test.go`
- [x] G3 `internal/service/sleep_test.go` TestFactoryBlindMissingFailingArchived
- [x] G4 `app_sleep_live_test.go` (-tags live), output `.wt-notes/is-build/g4-live.txt`
- [x] X0 clean clone, `.wt-notes/is-build/x0.txt`; cli golden unchanged

## Done
- 2026-10-09: is-build built FR-1 to FR-4 on `initiatives-sleep` (9743e21, be46912, 0a240f0, 47715e0); shapes and choices in `.wt-notes/is-build/progress.md`.

## Notes
- 2026-10-09: supervisor sup51 (window 8385), spawned by the FSE.
- 2026-10-09 is-build: `factory` finds initiatives at `find ~ -maxdepth 3`, so a G4 throwaway under `~/pocs/<x>` is factory_blind and refused ("no initiative …"); G4 records that and does the real sleep/wake on a second throwaway at `~/deltagos-g4-<hhmmss>`, created paused, removed after.
- 2026-10-09 is-build: `factory` is looked up on PATH then `~/bin` (an app from Finder lacks ~/bin); `factory awake` runs in Board and after Sleep/Wake only.
