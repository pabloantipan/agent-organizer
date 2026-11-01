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

## UI review
pass, commit 2f7dccb. Reviewer l57-ui-ux, 2026-11-01. No severity 4 or 3. Shared test run: reused, test-lease run de30aa46-78374 of 2f7dccb (l57-ui-rev's), make test rc 0 (Go ok, vitest 1478/1478). The `N review rounds failed in this window.` line (code review, AR15) is being dropped by the builder; it shows in the shots below and is not filed again here.

**How it was seen.** `make review-build` built and launched (pid saved, auth off, `discuss_state_dir` under the temp home), but the screen was locked (`CGSSessionScreenIsLocked=Yes`, `.wt-notes/l57-ui-ux/ax-locked.txt`): AX returned only AXApplication and `screencapture -l` said "could not create image from window". So every row below rests on `wails dev` of the same SHA (clean clone in my notes dir) on the same fixture env, read by an offscreen WKWebView (never ordered in, no system input): DOM geometry, computed styles, and WebKit's own snapshots (`takeSnapshot`, not screen shots). Recipe change from l57-ui's: `fixture-home.sh` puts a sleep/wake stub `factory` first on PATH, which shadows `factory report`; with it the section reads only `Report not drawn: usage: factory awake | sleep …`. I dropped that dir from PATH (state g keeps it on purpose). TZ in the web view is the machine's (−03), so the fixture's 00:00–06:00 UTC window reads 19 Oct 21:00 – 03:00.

**W7 for Overview: met.** Nothing in the section lies past its edges or scrolls sideways: every element's frame is inside the section at 1440×900 (section 1150 wide), 1024×640 rail collapsed (938) and 1024×640 rail open (734), with disclosures open; the document's scrollWidth equals the window's. `waits on`: at 1440 beside its row (top 709, row top 706, x 928); at 1024 rail open under it (743–759, under the fraction line 727–743, x 286). At 1024 with the rail collapsed (the compact default, `railCollapsedFor`) the section is 938 px ≥ `RR_NARROW_BELOW` 820, so `waits on` stays beside its row and fits (x 609–988); see the spec gap. Shots: `.wt-notes/l57-ui-ux/1440x900-a-drawn.png`, `1024x640-w7-rail-open-tracks.png`, `1024x640-w7-rail-open-top.png`, `1024x640-a-top.png`, `1024x640-c-tracks.png`.

**States.**
- (a) drawn, fx (contract fixture): caption `3 cards passed review between 19 Oct 21:00 and 20 Oct 03:00. Share is of those 3.`, mode rows, line rows with bars from `pct`, two dead rows hatched in `--fg-subtle` stripes on `--surface` with words in `--fg-muted` (neutral, no blocked hue). `progress.notes` is empty in the fixture, so no note line. `stopped now` while live: not reachable on the fixture (no open window); vitest W1 only. `1440x900-a-drawn.png`.
- (b) option B: wave column `sup1/1 sup2/1`, `·` on mode and dead rows; disclosure open with its rounds (`✕` on the failed ones, causes in words), build time and tokens; `Waves in this window` with each wave's failures by cause. The footer was not pressed (Amendment 3: a finished wave opens Work; not a finding). `1440x900-b-disclosure.png`, `1440x900-b-footer.png`.
- (c) tracks: `Board as of …`, `1 track done · Show` (aria-expanded, Hide when open, `A The base · done 1 Oct`), `waits on` with owner. fx has no chain and no unstaged card, so a copy (fx2: stage `ship`, card h on it, unstaged g, one commit at 08:30 in the window) gives `↓` (C under B, same indent, `after B` in its name) and `No stage` last. `1440x900-c-tracks-fx2.png`.
- (d) rulings: 0003 (mode autonomous) `ruled by pablo 23:30 while away`; 0004 (present) no lozenge. A refused `ruled_by`: no fixture gives one; vitest W4 only.
- (e) window control: options `19 Oct 21:00 – 03:00`, `Last 24 hours`, `Custom…` (a native popup cannot open offscreen, so the options are read from the DOM); Custom with From 05:00 after To 01:00 reads `From must come before To.` (role status) and the caption keeps the last good window. `1440x900-e-custom-error.png`.
- (f) Copy as text with `navigator.clipboard` replaced in the page (the real pasteboard never written): the captured text is byte-equal to `factory report <root> --since @… --until @… --text` (sha1 80873baf…), the polite region reads `Copied the report as text.`, the label stays.
- (g) not drawn: `Report not drawn: usage: factory awake | sleep <initiative> | wake [--force] <initiative>` (the stub's first stderr line), no chart, no Copy. The exact `factory report not found` cannot be reached by PATH on this Mac: `factoryFallbackDirs` finds `~/bin/factory` off PATH by design; R3 and vitest cover the words. `1440x900-g-not-drawn.png`.
- Contrast on `--surface` (32,27,43): `--fg` 14.2, `--fg-muted` 7.9, `--fg-subtle` 5.3, `--accent-fg` links 8.4; bar fill on its track 3.1. Status by words everywhere (`while away`, `now`, `✕` plus cause). Tier-2 tokens only in runreport.css.

**Findings.**
- U1 (2) Pablo reads a day-change row's time and wave as one word. Where: the progress rows at 1440 and 1024 (`1440x900-a-drawn.png`, `Tue 01:00sup1/1`). Evidence: the time cell is 6.5ch; `Tue 01:00` ends 12 px past it, 0 px from the wave text (`s2-1440.out`, `s3-1024.out`). Severity 2. Proposal: size the time column for `Ddd HH:MM` when `spansDays`, or put the day on its own line above the time.
- U2 (2) Card links, disclosures and the done fold are small to hit. Where: `.rr-card` 7×14 for one-letter slugs (14 high for any), `.rr-more` 16 high, `.rt-fold` 20 high, card and record links in `waits on` 14 high. Evidence: rects in `s2-1440.out`; design-system Space, radius, size: every control's target at least 24×24 (WCAG 2.5.8). Severity 2. Proposal: min-height 24 (padding, not font) on those three classes.
- U3 (2) Several waits in one `waits on` cell cannot be told apart. Where: `1440x900-a-drawn.png`, `0002 · pablo · d: pablo: rule 0002 · pablo · d · pablo`. Evidence: the same `·` separates a wait from its owner and one wait from the next, as §3 writes both. Severity 2. Proposal, for aglaea: owner in parentheses as the text form does (`0002 (pablo)`), or one wait per line.
- U4 (1) A failed report wears the blocked hue. Where: `1440x900-g-not-drawn.png`. Evidence: `.rr-not-drawn` left rule `--status-blocked` (255,77,99) on `sm` `--fg-muted` text; the design system keeps red for blocked and says a blocked reason is `sm` `--fg-muted` text. Severity 1. Proposal, for aglaea: drop the red rule, or name it as the not-drawn treatment.
- U5 (1) `0 tokens` reads as measured zero when the usage ledger has no run for those cards. Where: each disclosure on the fixture. Severity 1. Proposal: `no tokens recorded` when the ledger has nothing for the line.

**Spec gaps (for the FSE).**
- W7 says `waits on` moves under its row at 1024×640; FR-13 and the code key it on the section's width (820), and at 1024 the rail is collapsed by default, so the section is 938 and the wide layout stays (it fits). Under the row happens with the rail open. The gate row should name the section width or the rail state.
- `fixture-home.sh`'s stub `factory` shadows `factory report`, so the W7 recipe draws only the not-drawn state; the recipe or the stub needs `report`.
- Zero tokens against no tokens recorded is not defined (U5).
- `factory report not found` is unreachable by PATH while `~/bin/factory` exists (`factoryFallbackDirs`).

**Design questions, for aglaea:** U3, U4; and the `↓` connector in `--border-strong` at `sm` is faint between chained rows (`1440x900-c-tracks-fx2.png`), as §3 asks.

**Not verified:** `stopped now` live (no live window in the fixture; vitest W1), a refused `ruled_by` (vitest W4), the exact `factory report not found` (R3, vitest), anything on the real review window (screen locked), keyboard focus order (harness clicks are DOM clicks, not presses).
