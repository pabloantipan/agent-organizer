---
title: "Home's row says the last run: cards passed and time stopped"
status: now
repos: [organizer]
branch: lf57-home-signal
seat: l57-home
stage:
updated: 2026-11-01
next: "PR with talos-lab"
review: pass
reviewer: l57-home-rev
depends_on: [lf57-run-report, lf61-decision-states-ui]
boundary: ["docs/specs/leftovers-57.md Boundary, lf57-home-signal", "frontend/src/styles/home.css"]
spec: "docs/specs/leftovers-57.md (FR-14)"
gate: "docs/specs/leftovers-57.md#Acceptance → gate"
ui_review: true
autonomy: unattended
---

## Goal
Home tells Pablo a run happened and how it went, without a percent, and takes him to the report.

## Gate
docs/specs/leftovers-57.md, rows W7, W8 and X0.

## Pre-answered
- Base: origin/main at the card's start (the merge target line below names the commit it must include).
- Short-sample fallback: a fixture short of a state gets the state added to the fixture overlay or built from the contract's `make-fixture.sh`; never the real home, never skipped.
- Merge target: `main` through talos-lab's PR; base: origin/main with lf57-run-report and lf61-decision-states-ui merged.
- Tests: vitest beside `Home.tsx` and `lib/width.ts` (`cd frontend && npm test`), inside the boundary.
- Evidence: review-build shots under `.wt-notes/<seat>/`.
- Words: `last run · 12 cards · 2 h stopped`, no percent (0167 Q3); the states (no run yet, a run with no stop, a remote initiative) follow `docs/ux/specs/run-report.md` §5.
- Design questions: Aglaea's run-report spec; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Data shape across states: the report JSON as the factory-report schema gives it; the view stores nothing.
- Retention: n/a.

## Declared changes
- modified `frontend/src/lib/width.ts:FOLD`: adds `run` at 0, the others move up one in the same order, so the run signal folds first (FR-14)
- modified `frontend/src/lib/width.ts:Fold`: the type admits 0-5
- modified `frontend/src/lib/width.test.ts`: the fold-order row for the run signal
- added `frontend/src/components/Home.tsx:runSignalFor`: the row's run signal from the read, the recent rule (`runPlace`) and locality; none for remote, old, not drawn
- added `frontend/src/components/Home.tsx:runSignalWords`: `last run · <n> cards[ · <dead> stopped]`, `running now · <n> cards so far`
- added `frontend/src/components/Home.tsx:runKey`: what changes an initiative's run (its local cards by column, seats, waves building)
- added `frontend/src/components/Home.tsx:runReadsDue`: which local initiatives to read now; never a remote one
- added `frontend/src/components/Home.tsx:readRun`: `App.ReportWindows`, then `App.Report` only when the latest run heads
- added `frontend/src/components/Home.tsx:useRunReads`: one read per local initiative per Home load, again on a runKey change
- added `frontend/src/components/Home.tsx:openRunReport`: `openInitiative(id, "overview")`, then scrolls to `#while-you-were-away`
- added `frontend/src/components/Home.tsx:RunSignalLz`: the lozenge, a button with `data-fold` run
- modified `frontend/src/components/Home.tsx:Initiatives`: reads the run signal per row and passes it on
- modified `frontend/src/components/Home.tsx:signalFacts`: carries `run`; a row with only the run signal is not `none`
- modified `frontend/src/components/Home.tsx:Signals`: draws the run lozenge last; exported for the test
- added `frontend/src/components/Home.run.test.tsx`: W8 and the read rule, from the committed contract samples
- modified `frontend/src/styles/home.css`: `.home .p-sig .lz.run { max-width: none; }`, the run signal exempt from the 200 px lozenge cap (leftovers-57 Amendment 5)
Risky:
- `useRunReads`: a key that never changes would leave a live run's count stale until Home is reloaded; a key that changes every feed would run `factory report` every 10 s
- `openRunReport`: polls 3 s for the section; a slow `factory report --windows` leaves Overview unscrolled
Not changed, on purpose:
- `lib/runReport.ts`, `RunReport.tsx`, `Overview.tsx`, the store: the recent rule, the section id and `openInitiative` already served
- `styles/shell.css`: `button.lz` is already styled; the 200 px `.lz` cap stays for every other lozenge
- `lib/floatList.ts`: reads `FOLD` by name; the float list does not show the run signal

## Done
- 2026-11-01 l57-home: Home's row says the last run (c2c9fc9 fold order, 57a04e9 signal), rebased on origin/main e968fc1; W8 fails on base (11 rows) and passes; X0 passes from a clean clone; W7 measured offscreen (screen locked), shots are the UI reviewer's. Detail in .wt-notes/l57-home/progress.md.
- 2026-11-01 l57-home: round 2, Amendment 5's rule in home.css (d0d3428); the recent words show whole (205 px, not cut, hit test lands); vitest rows and X0 pass at d0d3428 from a clean clone.

## Notes
- The design system caps every `.lz` at 200 px; `last run · 4 cards · 1 h 30 min stopped` is 205 px, so where it shows it reads `… stopp…` (hover names it whole). Lifting it for `.lz.run` is one rule in `home.css`, outside the boundary: asked sup101, ruled (a), leftovers-57 Amendment 5 (3dfa4de), done in d0d3428.

## Review
Verdict: pass (W8, X0; W7 is the UI reviewer's). Unmet gate items: none. Reviewer l57-home-rev, 2026-11-01, X0 on d0d3428 from a clean clone; `make test` fresh (no reuse line; the lease queued behind 3 runs), exit 0: go ok, vitest 95 files / 1563 tests.

change-check (`change-check organizer lf57-home-signal`, default base = the root's local `main` f2ec833):
- 7 `outside boundary` + 63 `undeclared` (MapFigure.tsx, MapFigure.test.tsx, mapSvg.ts, mapSvg.test.ts, lib/testdata/README.md, harbor-containers.svg): lf58-map-render, merged on GitHub main at e968fc1 (PR #27). The local `main` lags origin/main, so the default base counted it. Re-run with `--base e968fc1` (the branch's merge-base with origin/main) gives 5 files, 8 flags:
- `outside boundary` Home.run.test.tsx: a test of Home.tsx, which is "Home.tsx and its tests" in the Boundary (the matcher reads paths only).
- `undeclared` Home.tsx `RunRead`, `RunSignal`: types the declared `runSignalFor` takes and returns.
- `declared, not changed` width.ts:FOLD: changed (`{ run: 0, live: 1, … waiting: 5 }`). change-check does not see a const object as a symbol.
- `untested?` readRun, useRunReads, openRunReport, RunSignalLz: RunSignalLz is rendered through `Signals` in W8. useRunReads' rule is `runReadsDue` and `runKey`, both tested. readRun and openRunReport call the bindings and the DOM (Note below).

Rows:
- W8: `npx vitest run src/components/Home.run.test.tsx`: 10/10 pass (recent `last run · 4 cards · 1 h 30 min stopped`, `data-fold="0"`, no `%`; no dead time `last run · 4 cards`; live `running now · 4 cards so far`; old none; seen + 25 h none; remote none and not read). Fails on base: Home.tsx and width.ts checked out at e968fc1 gives 11 failed (all 10 here plus the width fold row). Fixtures `components/runreport.fixtures/expected*.json` are byte-equal (`cmp`) to CONTRACTS_DIR factory-report at 8474386.
- X0: `make test` exit 0; `pnpm run build` exit 0; `wails build` exit 0; `git status --porcelain` empty (wailsjs/runtime unchanged).
- Code against FR-14 and FR-12: the words come from `runSignalWords` with `cardsWord`/`spanWords` from `lib/runReport.ts`, and there is no percent. The count is `progress.denominator.count`. The recent rule is `runPlace` with `latestRun`/`presetsOf`/`seenAtOf`, called with the same arguments as RunReport.tsx:315. A remote initiative is neither read nor drawn (`!i.local`, `runReadsDue`). Home reads once per load and again only on a `runKey` change (local cards by column, live seats, waves building), not per render. The press is `openInitiative(id, "overview")` and then scrolls to `#while-you-were-away` (RunReport.tsx:206). Fold: `FOLD.run = 0`, first. CSS: the only change is the one home.css rule Amendment 5 allows, plus its comment.

Note: the stopped time is the frontend's sum of the report's per-span `minutes`, because the contract has no total. W8's `1 h 30 min` requires that sum, and AR15 says "no number is computed in the frontend". The gate and AR15 disagree; it is not a defect of this diff. A `dead_minutes` total in factory report would remove the sum.
Note: a live run is not re-read every 60 s on Home (FR-12 sets that for Overview). Its count changes only when a card moves, and that changes `runKey`.
Note: the clean clone at .wt-notes/l57-home-rev/clean was not removed: the harness refused the `rm -rf`. Left for a human to delete.
Found, not asked (builder, progress.md): the 200 px cap is Amendment 5, done in d0d3428. Folded at 1440 with the rail expanded is FR-14's order, and its look is W7, the UI reviewer's. The floatList renumbering changes nothing, so no finding. Nothing left without a destination.
