---
title: "Retire picks only seats a card named, never the FSE or a standing role"
status: next
repos: [organizer]
branch: lf54-retire-guard
seat: l54-retire
reviewer: l54-retire-rev
stage:
updated: 2026-10-26
next: "review: lf54-retire-guard, G1 and X0 pass, 5402624"
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
