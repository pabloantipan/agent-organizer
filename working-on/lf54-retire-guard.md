---
title: "Retire picks only seats a card named, never the FSE or a standing role"
status: next
repos: [organizer]
branch: lf54-retire-guard
seat: l54-retire
reviewer: l54-retire-rev
review: pass
stage:
updated: 2026-10-26
next: "PR with talos-lab"
depends_on: []
boundary: ["docs/specs/leftovers-54.md Boundary, lf54-retire-guard"]
spec: "docs/specs/leftovers-54.md (FR-1)"
gate: "docs/specs/leftovers-54.md#Acceptance → gate"
ui_review: false
---

## Goal
No retire plan ever ends the FSE or a standing seat.

## Gate
docs/specs/leftovers-54.md, rows G1 and X0.

## Done
- l54-retire, 2026-10-26: FR-1 in `Retirable` and `PlanRetire` (5402624, branch lf54-retire-guard rebased on main e52083d); G1 fails on main, passes on the branch; X0 passes from a clean clone. Evidence and reviewer commands: `.wt-notes/l54-retire/progress.md`.
- l54-retire, 2026-10-26: review finding 4 (godoc) fixed; Amendment 1 built: FR-1a and FR-1b (1ee3bae), FR-1c words (01e77d4), rebased on main a7d26f8; amended G1 fails at the pre-amendment head 54841cc and passes; X0 passes from a clean clone at 01e77d4; real-home dry runs of the default, `--retirable`, `--seats fse` and `--keep fse` all plan nothing and keep fse.
- l54-retire, 2026-10-26: review Note A fixed (73de0b1, test only): the empty-plan test reaches no real binary; copied onto main 3834fbd it fails on its stubs (`probe -k g1-probe-fse`, `zellij list-sessions -n`, `ps …`), not a real exec. Rebased on main 3834fbd; X0 passes from a clean clone at 73de0b1.

## Declared changes
- modified `internal/service/crew.go:Retirable`: a seat counts only when some card, open or done, names it in `seat:` (FR-1)
- added `internal/service/retire.go:namedSeats`: the seats any card of the initiative names, read by both
- modified `internal/service/retire.go:PlanRetire`: the default (`Seats == nil`, no `--retirable`) is `Retirable` (FR-1a); an explicit seat no card names is kept with the reason unless force (FR-1); a plan with no seat returns before threads, tokens and files with "nothing to retire" (FR-1b)
- modified `internal/service/retire.go:Service.Retire`: with no seat it kills only the explicit sessions and returns, so no mailbox, token, roster write, commit or run archive (FR-1b)
- modified `internal/service/retire.go:RetireOptions`: `Seats` nil is the default, empty but not nil is no seat; `Force` comment says what it overrides
- modified `internal/service/retire_test.go`: G1 (`TestRetirableOnlyPicksSeatsACardNamed`, `TestRetireDefaultFollowsCardsAndAnEmptyPlanTouchesNothing`, which stubs probe, PATH, HOME and the discuss dir so no exec or mailbox is real even on a regression, Note A); older tests that relied on a cardless seat or the old default give the seat a card, force, or expect "nothing to retire"
- modified `internal/cli/retire.go:retireCmd`: `--keep` subtracts from the default plan's seats into a non-nil list (FR-1a); help of `--seats`, `--retirable`, `--force`, `--keep` and the doc comment (FR-1c); `cell.json: …, unchanged` on a plan with no seat
- added `internal/cli/retire_test.go`: G1 CLI half (`TestRetireCmdDefaultAndEmptyPlans`, fixture `retireHome`)
- modified `frontend/src/components/Retire.tsx`: words only: doc comment, force label, done badge title, "cell.json unchanged" when the plan has no seat (FR-1c)
- modified `CLAUDE.md`: the "Retire and clean" paragraph only (FR-1c)
Risky:
- `RetireOptions.Seats`: nil vs empty is now meaningful; a caller that sends an empty list to mean "the default" gets nothing (the dialog always sends its checked seats, the CLI leaves nil)
- `PlanRetire`: an initiative in definition, or one whose cards name no seat, now retires nothing by default where it used to retire everyone but the reconciler
Not changed, on purpose:
- `Retire.tsx` preselection when nothing is retirable (everyone but the reconciler): logic, outside "words only"; PlanRetire keeps any unnamed seat with its reason
- `frontend/wailsjs`: no bound type changed

## Review
**Verdict: pass** at 73de0b16b009d7f33a7b627ddf3d98923aefae82. Unmet gate items: none. Reviewer `l54-retire-rev`, 2026-10-26. X0 run fresh (test-lease `make test` started 02:39:12 at sha 73de0b1, rc 0, saved; not a replay). Logs: `.wt-notes/l54-retire-rev/`.

Superseded: pass at 01e77d4 (and before it 5402624, whose findings 1-4 became Amendment 1 and finding 5 went to the FSE's held list).

- **Delta from 01e77d4**: `git range-diff main...01e77d4 main...73de0b1` shows the four build commits unchanged (`=`) after the rebase onto 3834fbd, plus one new commit, 73de0b1, which touches only `internal/service/retire_test.go`. That commit stubs `probe` (`probeBin` and `ORGANIZER_PROBE_BIN`), points `PATH` at logging stubs only (probe, zellij, discuss-api, launchctl, git, ps, lsof), uses a temp `HOME` and discuss state dir, sets the zellij binary to the stub, and fails on any stub call in a defer. `Retire` now runs with every option on. No absolute-path exec on Retire's paths (`grep '"/(usr|bin|sbin|opt)/'` finds only launch.go's `/bin/sh`, which is not reached).
- **No real exec on main**: the branch's test file copied onto merge base 3834fbd fails as G1 needs and reaches only stubs. The defer reports them after the panic: `probe -k g1-probe-fse`, `zellij list-sessions -n`, `ps -axEo …`. `zellij list-sessions -n` count: 15 before, 15 after.
- **G1** met: `go test ./internal/service/ ./internal/cli/ -run Retir -v` → 9 PASS on the branch; on main the three G1 tests fail (`retirable [fse b1]`, `default plans seats [fse b1]`, CLI `retire seats:  fse, b1`).
- **X0** met from a fresh clean clone at 73de0b1: `pnpm install --frozen-lockfile`; `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=…/sup95/specs/contracts test-lease run --share -- make test` exit 0 (19 Go packages ok, vitest 1297 passed); `test-lease run -- wails build` exit 0; `git status --porcelain` empty.
- **change-check** (base 068947c): 7 files, 6 flags, the same as at 01e77d4. `outside boundary` ×4 are the files Amendment 1 adds to the boundary (`internal/cli/retire.go` and its test, `Retire.tsx` words, the CLAUDE.md paragraph); `untested?` ×2 (`retireCmd`, `namedSeats`) are covered through `runWith` and through `Retirable`/`PlanRetire`. Undeclared 0, declared-not-changed 0.

Findings, each with where it went:
- 01e77d4 Note A (G1's Retire step could reach the real `probe -k`): fixed at 73de0b1, shown above.
- 01e77d4 Note B (the Retire dialog preselects fse when nothing is retirable): held on the FSE's list (3834fbd).
- 5402624 findings 1-4: Amendment 1 (c4235cd), built and met here; finding 5: FSE held list.
