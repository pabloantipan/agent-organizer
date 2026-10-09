---
title: "Sleep and wake an initiative through the factory, and read asleep since, frozen sessions and what the factory sees"
status: done
repos: [organizer]
branch: initiatives-sleep
seat: is-build
stage: one-window
updated: 2026-10-09
next: "merge initiatives-sleep at 47715e0 (sup51); then initiatives-view"
review: pass
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

## Review
- Verdict: pass. Commit reviewed: 47715e0 (branch initiatives-sleep). Unmet: none.
- G1, G3: `go test -run 'TestSleepWakeThroughTheFactory|TestSleepWhileOneRunsIsBusy|TestFactoryBlindMissingFailingArchived|TestFactoryFoundInHomeBin|TestParseAwake' ./internal/service/` pass in a clean clone. G2: `internal/scan` AsleepSince and Frozen tests pass. X0: `XDG_DATA_HOME=$(mktemp -d) make test` (go + 362 vitest), `npm install && npm run build`, `wails build` all exit 0; the regenerated `frontend/wailsjs/go` matches the commit.
- G4 judged against the amended row (491d683, Amendment 1) from `.wt-notes/is-build/g4-live.txt`, not rerun: the `~/deltagos-g4-*` throwaway woke and slept with the status line and commit written by the factory and shown after the rescan; the `~/pocs` one is factory_blind and refused ("no initiative …"); camp factory_blind.
- Code: argv `sleep|wake <id>`, never `--force`; no initiative.yaml write; TryLock busy; `factory awake` only in Board and after Sleep/Wake, not in RefreshAgents; output combined and verbatim; archived refused before the factory with no offer; asleep_since only from a paused status's comment, otherwise empty and no problem.
- Boundary: `internal/service/service.go` also changed (sleepMu/factory fields, FrozenDir in scanOptions, refreshFactory in Board). It is the minimum wiring FR-3 needs, but the card's boundary does not name it.
- Not in the gate: `organizer board` and `organizer decisions` now run `factory awake` (a walk of ~) through Board; a hung factory holds the busy lock up to 3 min; nothing tests that the 10 s tick never runs the factory.
- Reviewer: is-review, 2026-10-09.
