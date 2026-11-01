---
title: "Overview's While you were away: the run's rows with their waves, the tracks, the rulings, and Copy as text"
status: now
repos: [organizer]
branch: lf57-run-report
seat: l57-ui
stage:
updated: 2026-11-01
next: "fix AR15/FR-1: RunReport.tsx:95 sums waves[].failed into \"N review rounds failed in this window.\", a number the report does not carry; drop the line (the footer already gives each wave's failed) or read it from the report"
depends_on: [lf57-report-go]
boundary: ["docs/specs/leftovers-57.md Boundary, lf57-run-report"]
spec: "docs/specs/leftovers-57.md (FR-7 to FR-13)"
gate: "docs/specs/leftovers-57.md#Acceptance → gate"
ui_review: true
autonomy: unattended
review: fail
reviewer: l57-ui-rev
cause: execution
---

## Goal
The morning after, Overview shows what moved, which wave moved it and at what cost, what stopped it, where each track is, and what was ruled while Pablo was away.

## Gate
docs/specs/leftovers-57.md, rows W1-W7 and X0.

## Pre-answered
- Base: origin/main at the card's start (the merge target line below names the commit it must include).
- Short-sample fallback: a fixture short of a state gets the state added to the fixture overlay or built from the contract's `make-fixture.sh`; never the real home, never skipped.
- Merge target: `main` through talos-lab's PR; base: origin/main with lf57-report-go merged.
- Tests: vitest beside `RunReport.tsx`, `RunTracks.tsx` and `lib/runReport.ts` (`cd frontend && npm test`), inside the boundary.
- Evidence: review-build shots and AX text under `.wt-notes/<seat>/`.
- Data: the report's JSON as the contract `contracts/factory-report/` (specs 54cf10d, 8474386 content) gives it; every state (no window, one window, waves, no waves, refused remote, factory missing) has a fixture built from `make-fixture.sh` or the contract's `expected*.json`.
- Design questions: Aglaea's `docs/ux/specs/run-report.md` with Amendments 1 and 2 (8d2141a, d9c7a54) and `docs/ux/specs/progress-and-waves.md` option B (0168) answer them; anything else goes to the FSE, which asks the judge-design subagent while Pablo is away.
- Copy as text is checked against the app's own text, never the system pasteboard.
- Overview.tsx: if lf61 has not landed, the change is the mount line only, rebased before review.
- Data shape across states: the report JSON as the factory-report schema gives it; the view stores nothing.
- Retention: n/a.

## Done
- l57-ui built FR-7 to FR-13 on lf57-run-report (2b10006, eb7a85b, 2160482, 2f7dccb), rebased on origin/main bf66580 (lf61 merged). W1-W6 pass and fail on b3905ba; X0 passes from a clean clone. W7 not shot: this seat has no Screen Recording permission (the recipe is in .wt-notes/l57-ui/progress.md).

## Declared changes
- added `frontend/src/lib/runReport.ts`: puts App.Report's JSON in words and order (presets, rows, wave column, cost, tracks, rulings, Copy as text); `runPlace` is the recent rule lf57-home-signal reads
- added `frontend/src/lib/runReport.test.ts`: W6 and the row model over expected.json
- added `frontend/src/components/RunReport.tsx`: the section (window control, caption, rows, disclosure, waves footer, rulings, states, Copy as text, placement)
- added `frontend/src/components/RunTracks.tsx`: Amendment 2's tracks
- added `frontend/src/components/RunReport.test.tsx`: W1, W2, W4, W5
- added `frontend/src/components/RunTracks.test.tsx`: W3 and the 1024 width rules
- added `frontend/src/components/runreport.fixtures/`: the contract's expected.json, expected-windows.json, expected.txt (54cf10d, 8474386), checked against CONTRACTS_DIR when set
- added `frontend/src/styles/runreport.css`: the section's layout, tier-2 tokens
- modified `frontend/src/components/Overview.tsx`: the mount line and its import
- modified `frontend/src/stores/board.store.ts:openWave`: Work with a wave's strip scrolled into view (`waveFocus`, `scrollToWave`)
Risky:
- `openWave`: Work draws a WaveStrip only for a wave with a running card, and names it `wave <n>` from seat names; a report wave that has merged has no strip, so the press lands on Work with nothing scrolled (Notes)
- `.rr-bar.hatch`: hatching is a hard-stop repeating-linear-gradient (stripes, not a colour blend), the only way to draw it without an image
Not changed, on purpose:
- `Board.tsx`, `WaveStrip.tsx`: outside the boundary; the store scrolls to the strip by its label
- `hooks/useWails.ts`: outside the boundary; the components call the generated `App.Report`, `ReportText`, `ReportWindows` directly
- `DecisionsView.tsx`: lf52's line is inline there, not a component; the rulings draw the same anatomy (diamond, number, title, ruler, time, lozenge) and open the record in Decisions with `openDecision`

## Notes
- Report waves vs Work's WaveStrip: the report keys waves `<supervisor>/<wave>` from run records, while Work builds strips from `wave<N>-` seat names and only for running waves. PW4 ("opens Work with that WaveStrip in view") cannot land on a merged wave. Asked sup101 (--kind question).
- Mode-row words come from the picked preset, not from `window.kind`: a picked window is drawn with `@since/@until`, so it always comes back as `given`.
- "Opening the record in the drawer" (§3): Deltagos has no record drawer; the line opens the record in Decisions (`openDecision`), as Overview's gate rows do.

## Review
fail: every gate row W1-W6 and X0 passes on 2f7dccb, but a proved finding outside the rows breaks FR-1/AR15 (below). Unmet gate items: none of W1-W6, X0 (W7 is the UI reviewer's). Reviewer l57-ui-rev, 2026-11-01. X0 ran on 2f7dccb in a clean clone, make test fresh (test-lease run de30aa46-78374, rc 0; l57-ui-ux reused it).
cause: execution

Found (blocking, outside the rows): `frontend/src/components/RunReport.tsx:95` sums `waves.waves[].failed` in the frontend and draws `{failed} review rounds failed in this window.` (line 107). The report carries no such total (`waves` keys: source, records, lines, waves, notes), and FR-1/AR15 says no count is computed in the frontend ("every count and percent drawn equals the --json output"); neither run-report §3 nor progress-and-waves option B draws this line. Proof, a probe test over the contract's expected.json in a scratch copy (.wt-notes/l57-ui-rev/ar15-probe.log): `drawn line: 2 review rounds failed in this window.` / `a total failed field in the JSON: false` / `AssertionError: expected [ …(2) ] to be null`. Fix: drop the line (the footer already says each wave's failed by cause), or ask the factory for a total.

Rows:
- W1-W6: `npx vitest run` of RunReport.test.tsx, RunTracks.test.tsx, lib/runReport.test.ts with CONTRACTS_DIR at 54cf10d: 46 passed, every W1-W6 test by name; the committed samples equal the contract's byte for byte (test and diff). Fails on main: the three files on b3905ba fail (`Cannot find module ./runReport`, `/src/components/RunReport`, `/src/components/RunTracks`).
- X0: make test ok (go all ok; vitest 92 files, 1478 tests), pnpm run build rc 0, wails build rc 0, git status --porcelain empty (wailsjs/runtime unchanged).
- FR-8 (Amendment 3): `openWave` sets Work and retries for 1 s to scroll to `section.wk-wave[aria-label="wave <n>"]`; W2 checks the press calls `nav.wave` with the wave, wired to `openWave(id, w.wave)`. Met on Amendment 3.

change-check (base 14bad79 = origin/main in the clone; branch rebased on bf66580; 13 files, 44 flags):
- outside boundary x4 `runreport.fixtures/{SOURCE.md,expected.json,expected-windows.json,expected.txt}`: the tests' fixtures, copies of the contract (Pre-answered: Data); explained.
- undeclared `board.store.ts` State, scrollToWave and declared-not-changed `board.store.ts:openWave`: one change; the bullet names openWave, waveFocus and scrollToWave, but openWave is a property of the State type and the store literal, which change-check does not read as a symbol; explained.
- untested? x37: helpers covered through the exported functions the tests call (rowName, rulingName, trackName, costWords, Rulings, RunTracks); LocalRunReport (fetch, 60 s re-read, markSeen, onCopy's wiring) has no test (Note).

Note: `tracksOf` numbers stages (`stage N`) and marks the `current` one from the tracks' order; the JSON carries neither. §3 draws both, so not a finding; the factory could carry them.
Note: `openWave` matches strips by `wave <n>` alone: report waves sup1/1 and sup2/1 both look for `wave 1` and land on the first strip. A finished wave lands on Work with nothing in view (Amendment 3, Aglaea's later card).
Note: W5 tests `copyReport` with a mocked writer; the component's `navigator.clipboard.writeText` path is read, not run (correct by reading).
Note: Overview's change is the import and the mount line only. Bars, hatching, `↓` and letters are `aria-hidden`; rows and tracks have names in words. Tokens only, no money.
