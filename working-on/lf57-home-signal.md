---
title: "Home's row says the last run: cards passed and time stopped"
status: now
repos: [organizer]
branch: lf57-home-signal
seat: l57-home
stage:
updated: 2026-11-01
next: "review: lf57-home-signal, W8 X0 pass, W7 for the UI reviewer (screen locked here), 57a04e9"
depends_on: [lf57-run-report, lf61-decision-states-ui]
boundary: ["docs/specs/leftovers-57.md Boundary, lf57-home-signal"]
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
Risky:
- `useRunReads`: a key that never changes would leave a live run's count stale until Home is reloaded; a key that changes every feed would run `factory report` every 10 s
- `openRunReport`: polls 3 s for the section; a slow `factory report --windows` leaves Overview unscrolled
Not changed, on purpose:
- `lib/runReport.ts`, `RunReport.tsx`, `Overview.tsx`, the store: the recent rule, the section id and `openInitiative` already served
- `styles/`: `button.lz` is already styled; the 200 px `.lz` cap is not lifted (see Notes)
- `lib/floatList.ts`: reads `FOLD` by name; the float list does not show the run signal

## Done
- 2026-11-01 l57-home: Home's row says the last run (c2c9fc9 fold order, 57a04e9 signal), rebased on origin/main e968fc1; W8 fails on base (11 rows) and passes; X0 passes from a clean clone; W7 measured offscreen (screen locked), shots are the UI reviewer's. Detail in .wt-notes/l57-home/progress.md.

## Notes
- The design system caps every `.lz` at 200 px; `last run · 4 cards · 1 h 30 min stopped` is 205 px, so where it shows it reads `… stopp…` (hover names it whole). Lifting it for `.lz.run` is one rule in `home.css`, outside the boundary: asked sup101.
