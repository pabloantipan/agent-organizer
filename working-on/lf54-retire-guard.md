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
next: "file finding: G1's Retire step shells out to the real probe -k on a regression (Review note A)"
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

## Declared changes
- modified `internal/service/crew.go:Retirable`: a seat counts only when some card, open or done, names it in `seat:` (FR-1)
- added `internal/service/retire.go:namedSeats`: the seats any card of the initiative names, read by both
- modified `internal/service/retire.go:PlanRetire`: the default (`Seats == nil`, no `--retirable`) is `Retirable` (FR-1a); an explicit seat no card names is kept with the reason unless force (FR-1); a plan with no seat returns before threads, tokens and files with "nothing to retire" (FR-1b)
- modified `internal/service/retire.go:Service.Retire`: with no seat it kills only the explicit sessions and returns, so no mailbox, token, roster write, commit or run archive (FR-1b)
- modified `internal/service/retire.go:RetireOptions`: `Seats` nil is the default, empty but not nil is no seat; `Force` comment says what it overrides
- modified `internal/service/retire_test.go`: G1 (`TestRetirableOnlyPicksSeatsACardNamed`, `TestRetireDefaultFollowsCardsAndAnEmptyPlanTouchesNothing`); older tests that relied on a cardless seat or the old default give the seat a card, force, or expect "nothing to retire"
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
**Verdict: pass** at 01e77d40c8c2a880bd256541496f067b93df1966. Unmet gate items: none. Reviewer `l54-retire-rev`, 2026-10-26. X0 run fresh (test-lease `make test` started 02:23:39 at sha 01e77d4, rc 0, saved; not a replay). Logs: `.wt-notes/l54-retire-rev/`.

Superseded: pass at 5402624 (G1 and X0 before Amendment 1); its findings 1-4 became Amendment 1, finding 5 is on the FSE's held list.

change-check (from a fresh clean clone at 01e77d4):
```
repo organizer: base aa3214225 (default origin/main) ... head lf54-retire-guard (clone HEAD 01e77d40c, on detached) 01e77d40c; 7 files, 6 flags
| outside boundary | organizer/CLAUDE.md |  | modified |
| outside boundary | organizer/frontend/src/components/Retire.tsx |  | modified |
| outside boundary | organizer/internal/cli/retire.go |  | modified |
| outside boundary | organizer/internal/cli/retire_test.go |  | added |
| untested? | organizer/internal/cli/retire.go | retireCmd | no test file names it |
| untested? | organizer/internal/service/retire.go | namedSeats | no test file names it |
6 flags: outside boundary 4, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 2, could not read 0, boundary unreadable 0
```
- `outside boundary` ×4: change-check reads the original Boundary bullet. Amendment 1 adds `internal/cli/retire.go`, `Retire.tsx` (words only) and CLAUDE.md's "Retire and clean" paragraph; `internal/cli/retire_test.go` is "their tests". Checked: Retire.tsx changes only a doc comment, two labels/titles and one plan line's text (`cell.json unchanged`); CLAUDE.md changes only that paragraph. Explained.
- `untested?` ×2: `retireCmd` is driven through `runWith` by `TestRetireCmdDefaultAndEmptyPlans`; `namedSeats` through `Retirable`/`PlanRetire`. Explained.
- Undeclared 0, declared-not-changed 0.

- **G1 (as amended)** met. Branch: `go test ./internal/service/ ./internal/cli/ -run Retir -v` → 9 PASS. On main (aa32142 merge base, the three G1 tests copied in): `retirable [fse b1], want [b1]`; `--seats fse plans seats [fse]`; `default plans seats [fse b1] … sessions [g1-probe-fse g1-probe-b1]`; empty plan `Seats:[fse b1]`, no "nothing to retire"; CLI `retire seats:  fse, b1`; `Retire` panics (nil deref in `archiveRuns`). So it fails on main and passes on the branch.
- **X0** met. `pnpm install --frozen-lockfile`; `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=…/sup95/specs/contracts test-lease run --share -- make test` exit 0 (19 Go packages ok, vitest 1297 passed); `test-lease run -- wails build` exit 0; `git status --porcelain` empty before and after the runtime checkout.
- Real-home dry runs of the branch binary (never `--run`): default, `--retirable`, `--seats=fse` and `--keep=fse` all print `retire seats:  none`, `keep seats:    fse`, `kill sessions: none`, `close threads: 0`, `revoke tokens: none`, `cell.json: …, unchanged`, `! nothing to retire`.

Notes (none blocks):
- A. `TestRetireDefaultFollowsCardsAndAnEmptyPlanTouchesNothing` calls `s.Retire` with a `sessionLister` stub that says `g1-probe-fse` is live, and `KillAgent` is not stubbed. On a regression it shells out to the real `probe -k g1-probe-fse`. Shown on main: the copied test reached `Retire` and its kill loop before panicking (harmless here, since `zellij list-sessions -n` has no g1 session). Nowhere yet.
- B. The Retire dialog still preselects every seat but the reconciler when nothing is retirable, so on the organizer cell it opens with fse checked. Safe, because PlanRetire keeps fse with its reason. Declared by the builder, outside "words only". Nowhere yet, unless the FSE judges the declaration enough.
