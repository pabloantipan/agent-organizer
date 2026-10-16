---
title: "A steady crew test, honest CLI money, a missing card spec named, Escape in the Tab harness"
status: now
repos: [organizer]
branch: lf39-go-tidy
seat: gt-build
updated: 2026-10-16
next: "file finding: organizer run (internal/cli/run.go, launchLines without a wait) has the same OnLaunch-after-settle gap; root fix is notify before close in internal/service/launch.go setSeat"
review: pass
risk: low
footprint: [internal/cli/crew_test.go, internal/cli/usage.go, internal/usage/report.go (Totals), internal/scan (card spec check), testdata/home, frontend/src/lib/usage.ts (totalsNotes), frontend/wailsjs/, scripts/tab-harness/tabharness.swift]
depends_on: []
boundary: ["docs/specs/leftovers-39.md Boundary, lf39-go-tidy"]
spec: "docs/specs/leftovers-39.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-39.md Acceptance, rows L1 to L5 and X0"
ui_review: false
---

## Goal
Four small findings from last night's reviews closed: the flaky crew test, `organizer usage` saying $0.00 for an unknown week, a card's missing spec file named on the board, and Escape in the Tab harness.

## Gate
docs/specs/leftovers-39.md, rows L1 to L5 and X0.
- [x] L1: TestCrewCmdSkipsRunningSeat -count=200 ok, make test x3 pass (.wt-notes/gt-build/L1-count200.txt, .wt-notes/gt-build/X0.txt; main failed 6/200, .wt-notes/gt-build/L1-before.txt)
- [x] L2: `— (no cost recorded for 7 sessions)` and `; $12.50 priced` (.wt-notes/gt-build/L2.txt)
- [x] L3: totalsNotes with priced 12.5 contains `$12.50 priced` (.wt-notes/gt-build/L3.txt)
- [x] L4: one Problem on missing.md, `spec "docs/nope.md" names no file` (.wt-notes/gt-build/L4.txt)
- [x] L5: page saw `["Escape"]` (.wt-notes/gt-build/L5/L5-run.txt, steps .wt-notes/gt-build/L5/steps.txt)
- [x] X0: make test, pnpm run build, wails build pass, git status empty, clean clone at 75631c0 (.wt-notes/gt-build/X0.txt)

## Notes
- Flake cause (FR-1): `Service.setSeat` closes the start's `settled` channel under launchMu, unlocks, and only then tells OnLaunch; `WaitLaunch` could return in that gap, so crew printed the total before the last seat's line (6 of 200 on main). Fixed in `internal/cli/crew.go`: crew waits until every seat's settled state is printed. The root fix (notify before close in `internal/service/launch.go`) is outside this card's boundary; `organizer run` has the same gap.
- FR-3 checks open cards only; done cards are history. The scan copies `specRel` as `cardSpecRel` (scan cannot import service).
- The home fixture's alpha card names a missing `docs/alpha.md`, so the status golden gained that problem line (UPDATE_GOLDEN=1).

## Declared changes
- modified `internal/cli/crew.go:crewCmd`: waits for every seat's last state line before the total (launchPrinter replaces launchLines' body; launchLines kept for run.go)
- modified `internal/cli/usage.go:WriteUsage`: money line moved to moneyLine
- added `internal/cli/usage.go:moneyLine`: `—` for a week with no cost, `; $x priced`
- modified `internal/cli/usage_test.go`: TestWriteUsageMoney (L2)
- modified `internal/usage/report.go:Totals`: Priced field, summed in totals
- added `internal/usage/report_test.go`: TestTotalsPriced
- modified `internal/scan/scan.go`: checkCardSpecs and cardSpecRel, called after the cards are read
- modified `internal/scan/scan_test.go`: TestCardSpecNamesNoFile (L4), TestCardSpecRel
- added `testdata/card-specs/init-specs`: fixture, three cards and docs/here.md
- modified `internal/cli/testdata/status.golden`: alpha's spec problem line (UPDATE_GOLDEN=1)
- modified `frontend/src/lib/usage.ts:totalsNotes`: `$x priced`
- modified `frontend/src/lib/usage.test.ts`: priced cases (L3)
- modified `frontend/wailsjs/go/models.ts`: usage.Totals.priced, regenerated
- modified `scripts/tab-harness/tabharness.swift`: `key escape`, key code 53, header verb list
Risky:
- `crewCmd`: waitFor blocks until each seat's settled state is printed; it relies on the service always notifying a seat's final state after settling it (it does, in setSeat and StopStarting)
Not changed, on purpose:
- `internal/service/launch.go:setSeat`: the root ordering fix is outside the boundary

## Done
- 2026-10-16 gt-build: crew flake fixed at its cause, usage money honest with the priced share, missing card spec named, Escape in the harness; gate met at 75631c0.

## Review
**pass**, 75631c0 (branch not moved); unmet gate items: none. Card stays open: one finding has no home (next).

change-check (from a clean clone at 75631c0): 26 flags, outside boundary 0, declared not changed 0.
- undeclared `crew.go` launchLines, launchPrinter, newLaunchPrinter, launchPrinter.print, launchPrinter.waitFor: named inside the `crewCmd` bullet; `report.go:totals`: inside the `Totals` bullet ("summed in totals"). Explained.
- outside footprint (15): tests, fixtures, golden and `crew.go`, all inside the spec Boundary ("the crew code if the cause is there", "their tests", fixture under testdata/); the footprint was narrower than the Boundary. Explained.
- untested? (5): crewCmd by TestCrewCmdSkipsRunningSeat, moneyLine by TestWriteUsageMoney, checkCardSpecs by TestCardSpecNamesNoFile, through their callers. Explained.

Rows (logs in .wt-notes/gt-review/):
- L1: -count=200 ok (95 s); main at 86ec85a failed 1/200, last seat line `qa_cleo running` missing before the total (L1-before.txt); make test x3 pass, 801 vitest each. FR-1 met: the cause (setSeat closes `settled` inside settle, unlocks, then notifies OnLaunch, so WaitLaunch returns before the last line) is named in Notes and the diff removes it for crew: the printer waits until each seat's printed state equals its settled one. The assertion is unchanged (crew_test.go not in the diff). Every seat state change notifies (queueLaunch, setSeat, StopStarting, RetrySeat), so waitFor cannot hang on the CLI path. Fixing the consumer, not launch.go, is within the Boundary and fixes what the test observes.
- L2, L3, L4: pass; cardSpecRel is specRel+cleanRel byte for byte.
- L5: own page on 127.0.0.1:60499, pid saved and killed by pid; window visible:false; page saw `["Escape"]`. Main's harness: `Fatal error: unknown key escape`.
- X0: make test, pnpm install --frozen-lockfile, pnpm run build, wails build pass; git status --porcelain empty.

Note: `organizer run` keeps the same gap (Found, not asked); not proved by a test here, and no card, record or backlog line holds it, hence next.
Note: cardSpecRel duplicates service.specRel; the two can drift.
Gate gap: X0 and L1 say `make test` without a temp XDG_DATA_HOME; I ran L1's with one.

gt-review, 2026-10-16
