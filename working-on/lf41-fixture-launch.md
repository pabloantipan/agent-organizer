---
title: "organizer run prints every seat, one spec-path helper, and a fixture that never reaches the real mailbox"
status: next
repos: [organizer]
branch: lf41-fixture-launch
seat: lf-build
stage: review-map
updated: 2026-10-18
next: "review: lf41-fixture-launch, G4 G5 G6 X0 met, c5cd548"
risk: medium
footprint: [internal/service/launch.go, internal/service/launch_test.go, internal/cli/run.go, internal/cli/run_test.go, internal/scan/scan.go, internal/service/spec.go, internal/specpath/*, internal/config/config.go, internal/service/cell.go, scripts/fixture-home.sh, their tests]
depends_on: []
boundary: ["docs/specs/leftovers-41.md Boundary, lf41-fixture-launch"]
spec: "docs/specs/leftovers-41.md (FR-11 to FR-14)"
gate: "docs/specs/leftovers-41.md Acceptance, rows G4-G6 and X0"
ui_review: false
---

## Goal
The fixture posts nowhere real, and launch lines never race.

## Gate
docs/specs/leftovers-41.md, rows G4-G6 and X0.

## Declared changes
- modified `internal/service/launch.go:settle`: returns the settled channel instead of closing it
- added `internal/service/launch.go:closeSettled`: closes it after the caller's notifies (FR-11)
- modified `internal/service/launch.go:setSeat`, `queueLaunch`, `StopStarting`, `RetrySeat`: notify, then close
- modified `internal/cli/run_test.go`: G4, `TestRunPrintsEverySeatLine` and `slowRunning`, 20 runs through the probe stub
- added `internal/specpath/specpath.go`: `Card`, `Clean`, the one spec-path reader (FR-12)
- added `internal/specpath/specpath_test.go`: the two old tests merged
- modified `internal/scan/scan.go:checkCardSpecs`: calls `specpath.Card`
- deleted `internal/scan/scan.go:cardSpecRel`: the copy
- deleted `internal/service/spec.go:specRel`, `cleanRel`: moved to specpath; `ReadSpec` calls it
- modified `internal/scan/scan_test.go`, `internal/service/spec_test.go`: their copy tests removed
- modified `internal/config/config.go:Config`: `CannedPost` (`canned_post`) (FR-14)
- modified `internal/service/cell.go:PostToCell`: canned_post writes instead of posting
- added `internal/service/cell.go:cannedPost`: one JSON line, `canned-<n>` / `canned-msg-<n>`
- modified `internal/service/cell_test.go`: `TestPostToCellCanned`, G6's `TestFixtureAskReviewCanned` (env-gated), `noMailbox`
- modified `scripts/fixture-home.sh`: `$tmp/discuss` as discuss_state_dir and the helpers' state unless --live-mailbox (FR-13); `--canned-post`
- modified `frontend/wailsjs/go/models.ts`: generated, `canned_post` (own commit c5cd548, outside the code boundary as the task allowed)
Risky:
- `setSeat`: WaitLaunch now waits on OnLaunch; a slow OnLaunch (the app's emit) delays the CLI's return by that much, never forever
- `fixture-home.sh`: the default home no longer seeds the decided thread from the real mailbox, so Solved's F5 row needs --live-mailbox
Not changed, on purpose:
- `internal/cli/crew.go:launchPrinter.waitFor`: now redundant, outside the boundary
- `internal/discuss`: `Available` still probes 127.0.0.1:9494 whatever the state dir (progress.md, Found)
- `testdata/`: nothing

## Done
- 2026-10-18 lf-build: FR-11 to FR-14 on lf41-fixture-launch (67f384d, 6967da0, d0d259c, fcdba65, c5cd548), rebased on 2e7d220; G4 (fails on main), G5, G6, X0 from a clean clone met; evidence in .wt-notes/lf-build/

## Notes
- The fixture's own python helpers (asking_thread, decided_thread) also read the real registry and could post; FR-13 points them at $tmp/discuss too.
