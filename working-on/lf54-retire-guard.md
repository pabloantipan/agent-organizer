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
next: "review: lf54-retire-guard, godoc fix, 7441934"
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

## Declared changes
- modified `internal/service/crew.go:Retirable`: a seat counts only when some card, open or done, names it in `seat:` (FR-1)
- modified `internal/service/retire.go:PlanRetire`: an explicit seat no card names is kept with the reason unless force; the empty `--retirable` message names "named by no card"
- added `internal/service/retire.go:namedSeats`: the seats any card of the initiative names, read by both
- modified `internal/service/retire.go:RetireOptions`: the `Force` comment says what it now overrides
- modified `internal/service/retire_test.go`: G1 (`TestRetirableOnlyPicksSeatsACardNamed`); four tests that relied on a cardless seat being retirable give it a card or force
Risky:
- `PlanRetire`: the CLI's `--keep` sends an explicit list, so an unnamed seat in its "rest" is now kept with a reason instead of retired
Not changed, on purpose:
- the default retire (no `--seats`, `--retirable` or `--keep`): FR-1 does not name it, and `--keep` computes from it; still plans every seat but the reconciler
- `internal/cli/retire.go`, `frontend/src/components/Retire.tsx`: the force help text is stale but outside the boundary

## Notes
- Found on the real-home dry run: a plan retiring no seat still closes threads (3 for `--retirable`, 44 for `--seats fse`). The default retire still includes the FSE. Both in progress.md, Found, not asked.

## Review
**Verdict: pass** at 54026246ccdb2f5fc5de2dcd46a68270177b71a8. Unmet gate items: none. Reviewer `l54-retire-rev`, 2026-10-26. X0 run fresh (test-lease `make test` started 02:00:41 at sha 5402624, rc 0, saved; not a replay). Logs: `.wt-notes/l54-retire-rev/`.

change-check (from the clean clone):
```
repo organizer: base a4e270c83 (default origin/main) ... head lf54-retire-guard (clone HEAD 54026246c, on detached) 54026246c; 3 files, 1 flags
## Changed
- organizer/internal/service/crew.go (modified): Retirable
- organizer/internal/service/retire.go (modified): RetireOptions, Service.PlanRetire, namedSeats
- organizer/internal/service/retire_test.go (modified, test)
## Flags
| untested? | organizer/internal/service/retire.go | namedSeats | no test file names it |
1 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 1, could not read 0, boundary unreadable 0
```
No undeclared, outside-boundary or declared-not-changed lines. `untested? namedSeats`: unexported helper exercised through `Retirable` and `PlanRetire` by `TestRetirableOnlyPicksSeatsACardNamed`; explained.

- **G1** met. Branch: `go test ./internal/service/ -run Retir -v` → all 7 PASS, incl. `TestRetirableOnlyPicksSeatsACardNamed` (cell `[fse,b1,b2]`, done card `seat: b1`, open card `seat: b2` → `[b1]`; `--seats fse` kept with reason, `--force` retires it). Fails on main (test copied onto e52083d): `retirable [fse b1], want [b1]`, `--retirable plans [fse b1]`, `--seats fse plans seats [fse]`, `problems [], want why fse is kept`.
- **X0** met. `pnpm install --frozen-lockfile`, then `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=…/sup95/specs/contracts test-lease run --share -- make test` exit 0 (all Go packages ok, vitest 1297 passed); `test-lease run -- wails build` exit 0; `git status --porcelain` empty (runtime unchanged).
- Real-home dry run of the branch binary (no `--run`): `--retirable` → `retire seats: none`, `keep seats: fse`; `--seats fse` → `! fse kept: no card names it in seat: …`.

Findings outside the gate (none blocks; each still needs a home):
1. Note, gate narrower than the card's Goal ("No retire plan ever ends the FSE"): the default retire still does. Dry run `organizer retire organizer` → `retire seats: fse`, `kill sessions: organizer-probe-fse`, `revoke tokens: fse`. Pre-existing, declared, outside FR-1's words. Nowhere yet.
2. Note: a plan that retires no seat still closes threads and commits cell.json: `--retirable` → `close threads: 3`, `--seats fse` → `close threads: 45`, both `cell.json: …, commit` with `retire seats: none`. Builder's Found 2. Nowhere yet.
3. Note: `--force` help is stale (`retire a seat even if an open card names it or it is working`, `internal/cli/retire.go`, `Retire.tsx`), and so are `--retirable`'s help and CLAUDE.md "Retire and clean". Builder's Found 3. Nowhere yet.
4. Note: `namedSeats` was put between `liveSessions`' doc comment and its func, so namedSeats' godoc now opens with "liveSessions is the zellij session names…" and liveSessions has none (retire.go ~215). Nowhere yet.
5. Note: building the binary in a fresh worktree needs `frontend/dist` (builder's Found 4). Nowhere yet.
