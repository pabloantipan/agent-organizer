---
title: "organizer run prints every seat, one spec-path helper, and a fixture that never reaches the real mailbox"
status: done
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
review: pass
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
- `fixture-home.sh`: the default home no longer seeds the decided thread from the real mailbox, so Solved's F5 row needs --live-mailbox (to the FSE: F5's gate row must say --live-mailbox now)
Not changed, on purpose:
- `internal/cli/crew.go:launchPrinter.waitFor`: now redundant, outside the boundary (to the FSE)
- `internal/discuss`: `Available` still probes 127.0.0.1:9494 whatever the state dir (progress.md, Found) (to the FSE)
- `testdata/`: nothing

## Done
- 2026-10-18 lf-build: FR-11 to FR-14 on lf41-fixture-launch (67f384d, 6967da0, d0d259c, fcdba65, c5cd548), rebased on 2e7d220; G4 (fails on main), G5, G6, X0 from a clean clone met; evidence in .wt-notes/lf-build/

## Notes
- The fixture's own python helpers (asking_thread, decided_thread) also read the real registry and could post; FR-13 points them at $tmp/discuss too. (Handled on this card: verified, they fail at tokens.json in $tmp/discuss before any request.)

## Review
**Pass.** Unmet gate items: none (G4, G5, G6, X0 met). Reviewer `lf-review`, 2026-10-18, branch `lf41-fixture-launch` at c5cd5482f1ecdebd9104e1d747ee8ebbebdaad42, from a clean clone.

Test run: **fresh**, test-lease run id `d6cb8665-57515` (sha c5cd548, `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`, rc 0: go all ok, vitest 76 files / 933 tests). `test-lease run -- pnpm run build` rc 0; `test-lease run -- wails build` rc 0; `git status --porcelain` empty.

Rows, run by me:
- G4: `go test ./internal/cli/ -run TestRunPrintsEverySeatLine -count=20`: 20 of 20 PASS (each test is 20 launches through `scripts/probe-stub.sh`, so 400 launches; each asserts `alpha queued/starting/running` and `launched`, and running before launched). With main's `launch.go` (2e7d220) on the same tree it fails 3 of 3: `run 0: stdout missing "alpha running\n"`. `-race` on it and on service's launch/crew tests: ok.
- G5: `grep -rn 'cardSpecRel\|specRel\|cleanRel' --include='*.go' .` is empty; the only first-word reader is `internal/specpath/specpath.go:16-20`; `scan.go` and `service/spec.go` import it. The removed tests' cases are all in `specpath_test.go` (`../out.md` as `../agent-slack/specs/x.md`). scan, service, specpath tests ok.
- G6: `scripts/fixture-home.sh --review --canned-post` → config has `discuss_state_dir: /private/tmp/organizer-fixture.nkuMls/discuss` (empty dir, still empty after), `canned_post: …/posts.jsonl`, `canned_health`. `go run . review init-a rv-fixture`, then `FIXTURE_ASK_REVIEW=1 go test ./internal/service -run '^TestFixtureAskReviewCanned$'`: PASS; `posts.jsonl` holds 1 line (`to fse`, `question`, `rv-fixture: review at 6188b95`). The test proves no socket: `DISCUSS_BIND` points at its own counting listener (the mailbox is TCP to that bind) and it asserts 0 connections; the state dir holds no tokens.json, so `Connect` could not have posted either. The fixture's helpers stop at `tokens.json` in `$tmp/discuss` before any request.
- FR-13 others: default home writes `discuss_state_dir: $tmp/discuss`; `--review` too; `--live-mailbox` (run with an empty `DISCUSS_STATE_DIR` and `DISCUSS_BIND=127.0.0.1:1`, so nothing could post) writes neither it nor `canned_*`. `--twenty`/`--empty` already wrote it.
- Requirements FR-11 to FR-14 match the diff (FR-11 as "close the settled channel after notifyLaunch", which is what the FR's effect needs). No code path or test posts to a real mailbox or starts a real seat: G4 uses the probe stub and a temp `discuss_state_dir`; the canned tests use temp dirs and the counting listener.

change-check (from the clean clone):
```
change-check: working-on/lf41-fixture-launch.md
risk: medium
repo organizer: base ad4a3c2f1 (default main) ... head lf41-fixture-launch c5cd5482f; 13 files

## Changed

- organizer/frontend/wailsjs/go/models.ts (modified): Config
- organizer/internal/cli/run_test.go (modified, test)
- organizer/internal/config/config.go (modified): Config
- organizer/internal/scan/scan.go (modified): checkCardSpecs, cardSpecRel
- organizer/internal/scan/scan_test.go (modified, test)
- organizer/internal/service/cell.go (modified): Service.PostToCell, cannedPost
- organizer/internal/service/cell_test.go (modified, test)
- organizer/internal/service/launch.go (modified): InitiativeLaunch.settle, closeSettled, Service.queueLaunch, Service.setSeat, Service.StopStarting, Service.RetrySeat
- organizer/internal/service/spec.go (modified): Service.ReadSpec, specRel, cleanRel
- organizer/internal/service/spec_test.go (modified, test)
- organizer/internal/specpath/specpath.go (added): Card, Clean
- organizer/internal/specpath/specpath_test.go (added, test)
- organizer/scripts/fixture-home.sh (modified): asking_thread, decided_thread

## Tests touched

- organizer/internal/cli/run_test.go
- organizer/internal/scan/scan_test.go
- organizer/internal/service/cell_test.go
- organizer/internal/service/spec_test.go
- organizer/internal/specpath/specpath_test.go

## Risky (declared)

- `setSeat`: WaitLaunch now waits on OnLaunch; a slow OnLaunch (the app's emit) delays the CLI's return by that much, never forever
- `fixture-home.sh`: the default home no longer seeds the decided thread from the real mailbox, so Solved's F5 row needs --live-mailbox

## Not changed, on purpose (declared)

- `internal/cli/crew.go:launchPrinter.waitFor`: now redundant, outside the boundary
- `internal/discuss`: `Available` still probes 127.0.0.1:9494 whatever the state dir (progress.md, Found)
- `testdata/`: nothing

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| outside boundary | organizer/frontend/wailsjs/go/models.ts |  | modified |
| outside boundary | organizer/internal/specpath/specpath.go |  | added |
| outside boundary | organizer/internal/specpath/specpath_test.go |  | added |
| outside footprint | organizer/frontend/wailsjs/go/models.ts | Config | modified |
| outside footprint | organizer/internal/scan/scan_test.go |  | modified |
| outside footprint | organizer/internal/service/cell_test.go |  | modified |
| outside footprint | organizer/internal/service/spec_test.go |  | modified |
| undeclared | organizer/internal/service/launch.go | Service.queueLaunch | modified |
| undeclared | organizer/internal/service/launch.go | Service.StopStarting | modified |
| undeclared | organizer/internal/service/launch.go | Service.RetrySeat | modified |
| undeclared | organizer/internal/service/spec.go | Service.ReadSpec | modified |
| undeclared | organizer/internal/service/spec.go | cleanRel | deleted |
| undeclared | organizer/internal/service/spec_test.go |  | modified |
| untested? | organizer/internal/scan/scan.go | checkCardSpecs | no test file names it |
| untested? | organizer/internal/service/cell.go | cannedPost | no test file names it |
| untested? | organizer/internal/service/launch.go | closeSettled | no test file names it |
| untested? | organizer/scripts/fixture-home.sh | asking_thread | no test file names it |
| untested? | organizer/scripts/fixture-home.sh | decided_thread | no test file names it |

18 flags: outside boundary 3, outside footprint 4, undeclared 6, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 5, could not read 0, boundary unreadable 0
```
Explanations:
- undeclared `launch.go` `queueLaunch`, `StopStarting`, `RetrySeat`: declared in one bullet with `setSeat` (line 28); change-check reads only the first symbol. Explained.
- undeclared `spec.go` `ReadSpec`, `cleanRel` and `spec_test.go`: declared in the `specRel`, `cleanRel` bullet ("`ReadSpec` calls it") and the scan_test/spec_test bullet; same parser limit. Explained.
- outside boundary `internal/specpath/*`: the Boundary's "one new small package for the helper". Explained.
- outside boundary / footprint `frontend/wailsjs/go/models.ts`: not in the Boundary bullet, but X0 forces it: at fcdba65 (before c5cd548) `wails generate module` adds exactly the two `canned_post` lines, so X0's `git status --porcelain` would not be empty without it. Explained; the Boundary omission is a spec gap (Note below).
- outside footprint `scan_test.go`, `cell_test.go`, `spec_test.go`: "their tests" in the footprint and the Boundary. Explained.
- untested? `checkCardSpecs` (`TestCardSpecNamesNoFile`, scan_test.go:429), `cannedPost` (`TestPostToCellCanned` through `PostToCell`), `closeSettled` (G4), `asking_thread`/`decided_thread` (G6 run above). Explained.
- declared, not changed: none.

Notes (none blocking):
- Note: the spec's Boundary bullet for this card omits `wails generate module` output although X0 requires it (the review-go bullet names it). To the FSE.
- Note: change-check flags every symbol after the first in a multi-symbol bullet as undeclared. To the FSE (for Hephaistos's change-check).
- Note (builder's Found): `frontend/src/lib/specReader.ts:10` comment still names `specRel in internal/service/spec.go`. To the FSE.
- Note (builder's Found): the crew's `discuss-api token env` preflight in the fixture runs the real discuss-api. To the FSE.
- Note (builder's Found): G4 adds ~20-35 s to `make test` (6 s per 20 launches here). To the FSE.
