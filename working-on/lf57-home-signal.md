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
prs:
  - {repo: organizer, pr: 28, target: main, state: merged, merge: 22d84cd}
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

## UI review
Verdict: pass. Commit reviewed: d0d3428. Reviewer l57-home-ux, 2026-11-01. Sev 4/3: none.
W7, Home's half: met. At 1024×640 and 1440×900, rail open and rail as strip, in every state, `documentElement.scrollWidth` equals the window width and no element on Home scrolls sideways. The signal reads as FR-14 wherever it is drawn. Shots are in `.wt-notes/l57-home-ux/`, named `<w>x<h>-<state>-<rail>-home.png` (plus `-overview.png` after the press): states `recent`, `nodead`, `live`, `real` (old).
How it was checked: the screen was locked (`IOConsoleLocked` true), so AX and `screencapture` return nothing. `make review-build` passed in my worktree (`reviewbuild.log`), but I did not launch the review app, because it could not have been read or shot. I measured the same SHA offscreen instead: `wails dev` of a clone at d0d3428 on `fixture-home.sh` plus the contract fixture's `init` as a root, with `discuss_state_dir` and `auth: off` checked in `dev-34591-config-check.txt`. l57-ui-ux's `h.swift` (an offscreen WKWebView with no system input) took the geometry, computed styles, hit tests and the WebKit's own renders. Content height was the window height − 28. The real factory sees the contract fixture only, and its run (20 Oct) is 12 days old under the app's clock, so it gives the old state only. Recent, no-dead and live come from a fake `factory` (`bin/factory`), which is l57-home's recipe plus a `nodead` state where `progress.dead` is `[]`. This differs from the brief and follows the builder's progress.md.
- (a) recent: `last run · 4 cards · 1 h 30 min stopped` is whole at 1440 with the rail as a strip: 205.3 px, not cut, inside its cell (859–1240), and a hit test at its centre lands on it. Amendment 5 holds (`max-width: none`).
- (b) no dead time: `last run · 4 cards`, 99 px, whole, hit test lands.
- (c) live: `running now · 4 cards so far`, 156 px, whole, hit test lands. The press opens Overview headed `Running now · since 19:22`.
- (d) old: the real factory gives no run lozenge on any row at either size. Remote: the fixture has no remote initiative, so this is not verified on screen and rests on vitest W8 (`a remote initiative: none, and no read is made for it`).
- (e) press: Overview of `fixture` opens with `While you were away` at the pane's top (section top 121 = pane top 121). With no dead time the section is already first (139, scrollTop 0).
- (f) folding: the run signal is `data-fold` 0 and folds before problems (3) and waiting (5): first at 1024 in both rail states (`+2`), and first at 1440 with the rail open (`+1`).
- No percent: the only `%` on Home is an agent row's `2 sessions · 42% context`, which is not FR-14's. The signal never shows one.
- Design system: the signal is `button.lz` in the neutral tone, `rgb(181,175,195)` on `rgba(255,255,255,.05)`, about 7:1, 11 px, weight 600. Its meaning is carried by words, never by colour alone. The CSS change is the one rule Amendment 5 allows.
Findings (none 4 or 3):
- U1 (2) What Pablo cannot do: see the last run on Home at the default 1440×900 with the rail open, on any row that already has two other signals. Where: `1440x900-recent-open-home.png`, `fixture` row. Evidence: the signals cell is 250 px wide (990–1240) and holds `1 waiting · you` and `12 problems`, so the run goes behind `+1`. It is drawn when the rail is a strip. Severity 2: this is FR-14's fold order and the design system's fold rule, so not a defect. Proposal: for aglaea, should the regular width give the signals cell room for the run, or is "folds first" meant at 1440 too?
- U2 (2) What Pablo cannot do: press a folded run signal. Where: `1024x640-recent-open-more.png`. Evidence: `+2` is a `span.lz.sig-more` with no action, and the run's words reach only its hover title and sr-only text. FR-14's link to the section is lost whenever the signal folds, which at 1024 is always on that row. The row's chevron still reaches Overview, where a recent run heads the page. Severity 2. Proposal: for aglaea, should the overflow be pressable, or the folded run named as a link?
Spec gaps (for the FSE): FR-14 does not say what a folded signal's link does (U2). The fixture home has no remote initiative, so AR17 on Home cannot be put on screen. The contract fixture's run is fixed at 20 Oct, so a recent or live state needs a fake; a fixture with a window relative to now would make W7 reproducible with the real factory.
For aglaea: U1, U2. Not verified: the remote state on screen (vitest W8 only); keyboard focus ring on the lozenge (not in the brief).
Shared test run: reused, test-lease run 499876c8-2594 of d0d3428 (by organizer-probe-l57-home-rev): go 19 packages ok, vitest 95 files / 1563 tests, exit 0.
