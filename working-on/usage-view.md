---
title: "The Usage view: this week's tokens and money, past weeks, by initiative, role, task and model"
status: now
repos: [organizer]
branch: usage-view
seat: uv-build
stage: one-window
updated: 2026-10-06
next: "review: usage-view, rework 2 (filtered waves, wave meta, fixture two-card wave) done, gate met (U1-U10, X0), ad7dbf3"
depends_on: [usage-ledger]
boundary: ["frontend/src/components/Usage.tsx and styles/usage.css (new)", "the top bar and board.store.ts screen (one entry), AgentsView.tsx (the week line only)", "frontend/src/lib helpers and tests, scripts/fixture-home.sh (a ledger)", "not: Go"]
spec: "docs/specs/usage.md (FR-5, FR-6; docs/ux/specs/usage.md (b104480))"
gate: "docs/specs/usage.md Acceptance, rows U1 to U9 and X0"
ui_review: true
review: fail
---

## Goal
0098: tokens consumed and money, as clear as possible, weekly, in Deltagos.

## Gate
docs/specs/usage.md, U1 to U9 and X0. Shots in `.wt-notes/uv-build/` (named below); WKWebView is the review build (`make review-build`), on `eval "$(scripts/fixture-home.sh)"` unless it says real home; window sizes.

- [x] U1 this week at a glance: $72.85, "+45% on last week ($50.15)", tokens with the four kinds largest first, 7 sessions, 11 h, 1 running. `wkwebview-1512x945-U1-this-week.png`; real home `wkwebview-1512x945-realhome-this-week.png` ($341.03, 46 sessions, 8 running).
- [x] U2 trend: 6 bars (8 on the real home) in one hue, this week the accent with the only direct label, hover per bar, Show as table. `wkwebview-1512x945-U2-bar-hover.png`.
- [x] U3 four cuts by money, Not attributed last and muted, reasons in its hover. `wkwebview-1512x945-U3-not-attributed-hover.png`; real home By role `wkwebview-1512x945-realhome-W40.png`.
- [x] U4 By task, "Wave card in review" opens to sup11, wave1-build, wave1-review with their money and tokens. `wkwebview-1512x945-U4-by-task-wave-open.png`.
- [x] U5 ‹ › and the week list; keys Down, Down, Enter picked 14–20 Sep, Escape returns focus to the label; every section follows; one-session and no-session weeks; partial first week "from 3 Sep". `wkwebview-1512x945-U5-week-list.png`, `-U5-picked-by-keys.png`, `-U5-one-session-week.png`, `-U5-no-sessions-week.png`; real home W40 `wkwebview-1512x945-realhome-W40.png`.
- [x] U6 running: Sessions row `running`, `4.8M so far`, `$9.80 so far`; tiles "1 running", "includes 1 running". `wkwebview-1512x945-U6-sessions-running.png`.
- [x] U7 `This Mac only` at the right of the picker (hover names the other Mac), and "excludes 1 session with no cost" on the money tile, `—` and `*` on its rows. `wkwebview-1512x945-U1-this-week.png`, `-U6-sessions-running.png`. The hover was checked in the DOM, not screenshotted.
- [x] U8 1024×640 window (609 content): tiles in one row, kind columns fold into the row's hover, the Sessions model column folds before names; Chromium 1024×609 measured scrollWidth 1024 = viewport, table 961 = its wrap. `wkwebview-1024x640-U8-this-week.png`, `-U8-sessions.png`, `-U8-session-row-hover.png`, `chromium-1024x640-U8-fold.png`.
- [x] U9 money only in Usage, after dropping ContextBar's cost (936ddc0 after the rebases):
  `grep -rnE 'cost_usd|costUSD|cost_from|\.money\b|money\(|\$\{?[0-9]|"\$"|toFixed\(2\)|dollar' src --include='*.ts' --include='*.tsx' --include='*.css' | grep -vE 'src/components/Usage[A-Za-z]*\.tsx|src/lib/usage(\.test)?\.ts|src/styles/usage\.css'` in `frontend/` →
  `src/components/Overview.tsx:16: /** … token figures, never dollars (0020). */` (a comment), nothing else. No test asserted the $.
- [x] U10 (FR-5a, rework after uv-ui's UI1, UI3-UI5; WKWebView review build, real home = a temp copy of runs.jsonl and sessions/, real config and transcripts read only):
  - waves By task, real home W41, 1512×945: sup47 is one row $35.52 (6 sessions) = "The Usage view" $21.36 (uv-build, uv-review, uv-ui) + "Every Claude session's tokens" $9.66 + organizer-probe-sup47 $4.50; sup46 $34.25 = $16.48 + $13.78 + $3.99; sup43 one row; no card row repeated at top level. `wkwebview-1512x945-U10-realhome-W41-waves-open.png`. Fixture single-card wave unchanged (sup11 + wave1-build + wave1-review). `wkwebview-1512x945-U10-fixture-single-card-wave.png`. vitest `groupWaves` (3 cases).
  - unknown cost: real home "from 19 Aug" (7 sessions, none with cost): tile `—` "no cost recorded for 7 sessions", its bar an outlined stub, Not attributed `—`; 24–30 Aug says "no cost recorded the week before". `wkwebview-1512x945-U10-first-week-focus-and-unknown.png`, `-U10-focus-on-back-arrow.png`.
  - ‹ to the first week by keyboard (Option-Shift-Tab to ‹, Enter): ‹ disables and the focus ring is on the week label. Same shot.
  - 1024×640 during a rescan (real home): `scanning…` shown, the top bar on one line; the version folds into the brand's hover at compact. `wkwebview-1024x640-U10-rescan-topbar.png`.
  - rework 2 (uv-review's fail at 1758248): Usage filtered to one initiative (Agents' week line → `init-a only`, By task) groups a wave too: `forInitiative` keeps the cards the week's task cut gives each key (885ef92; vitest "one initiative's waves", uv-review's sup47 $10 + $40 + $30 = one $80 row). The fixture gains a two-card wave, sup12 over w-queued and w-nogate with a builder each (ad7dbf3): default By task `sup12 · w-nogate, w-queued` $29.60 = $14.30 + $9.20 + $6.10, `wkwebview-1512x945-U10-fixture-two-card-wave.png`; filtered, the same row, `-U10-fixture-two-card-wave-filtered.png`. A wave's `· N cards` now counts the card rows under it and is gone at none (265b4f6; unit-checked, not reshot on the real home). Fixture totals this week are now $102.45, 10 sessions.
- [x] X0 fresh clone of usage-view at ad7dbf3 (rebased on main): `XDG_DATA_HOME=$(mktemp -d) make test` 0 (Go ok, 306 vitest), `npm run build` 0, `wails build` 0. Clones removed, the earlier one included.

## Notes
- 0099 ruled 2026-10-06; supervisor sup47, spawned by the FSE.
- 2026-10-06 sup47: usage-ledger merged as 6e4e004; wave 2 launched from a031a67. The new screen needs one line in App.tsx (the screen switch), read as part of "the store's screen (one entry)".
- 2026-10-06 sup47: boundary widened by one clause, `frontend/src/components/ContextBar.tsx:13` (the statusline cost in the context bar's hover on Agents), which U9 (FR-6, 0099) requires dropping; no other session owns it.
- 2026-10-06 uv-build: found, not asked: Go's task-cut reason reads "a session session works on no single card" for role `session` (internal/usage/report.go `reasonFor`); a past week's tiles say "includes N running" for sessions still alive that touched it (Go's Running); a `-dirty` build's longer version wraps the top bar at 1024 (clean builds fit); picking an old week shortens the chart, since `History` ends at the selected week. Choices and how to drive each state: `.wt-notes/uv-build/progress.md`.

## Done
- 2026-10-06 uv-build: Usage view (FR-5) and money only in Usage (FR-6) on usage-view, e0767d1..d338be6; fixture usage history; gate met U1-U9, X0.

## Review
- Verdict: **fail** (code, checks and recorded evidence; the WKWebView rows are uv-ui's).
- Commit reviewed: 175824828d292c1930da96e3e4715dabcc0a184f (branch usage-view, rebased on main e67dfda; spec with Amendment 2, gate U1-U10 and X0).
- Unmet gate items: U10 (the wave row, FR-5a, in the filtered By task view).
- U10, wave row: the unfiltered By task meets it. `groupWaves` takes a supervisor row with two or more `cards`, sums money, share, tokens, the four kinds, sessions and without_cost from its card rows, takes them off the top level, and keeps Not attributed last. The vitest covers 3 cases, and uv-build's real-home W41 shot shows sup47 at $35.52 = $21.36 + $9.66 + $4.50. **But** Usage filtered to one initiative recomputes its cuts in `forInitiative`, which sets a task row's `cards` to `[s.task]`. A multi-card supervisor's task is `wave:supN` (Go `attribute.go`), and SessionRow carries no cards, so that row has one card and `groupWaves` skips it. That is the view the Agents week line opens, and it opens on By task (`usageFilter ? "task"`). A scratch vitest at 1758248 (removed): sessions sup (`wave:sup47`, $10), b1 (`usage-ledger`, $40), b2 (`usage-view`, $30) through `groupWaves(forInitiative(…).cuts.task)` gives three top-level rows, `usage-ledger` $40, `usage-view` $30, `wave:sup47` $10, where FR-5a wants one $80 row. The fixture cannot show this: its only wave (sup11) has one card.
- U10, the rest: met. `moneyOf`/`unknownMoney` reads `—` only when sessions ran and none has a cost (tile, bar as an outlined stub, week list, table, rows), the partial rows keep `$x*`, and the vitest covers it. ‹ and › hand focus to the week label when they disable themselves (`step`). At compact the top bar folds the version into the brand's hover. TopBar.tsx is in the boundary.
- X0, fresh clone at 1758248, no prior build: `XDG_DATA_HOME=$(mktemp -d) make test` 0 (every Go package ok, 304 vitest); `npm install && npm test && npm run build` 0; `wails build` 0. The clone and fixtures are removed.
- U9: my grep (`$` amounts, `"$`, `cost_usd`, `cost_from`, `money`, `dollar`, `cost`) outside Usage*.tsx, lib/usage*.ts and usage.css finds only comments and `CSS.escape` selectors. Met.
- Fixture from the clone at 1758248: `organizer usage --json` unchanged from d338be6 ($72.85, 7 sessions, 1 running, 1 without cost; Not attributed last in every cut). Diff: no Go, no wailsjs, every path inside the boundary.
- Findings still open from the first round: `--violet-7` in usage.css is a tier-1 primitive; a picked past week says "on last week" for the week before it; the chart drops later weeks (UI2, Go); the empty Not attributed row in every cut. New: a wave whose cards a later wave claimed keeps `· 2 cards` in its meta with nothing under it (groupWaves sup46 test case).
- Gate gap: no gate row checks the filtered view. U10 should name it, or the fixture should gain a multi-card wave so the default and filtered By task can both be checked without the real home.
- First round, d338be6: pass, unmet none (9fa5021), before Amendment 2 and U10.
- Reviewer: uv-review, 2026-10-06.

## UI review
- Round 1, d338be6: fail on UI1 (sev 3, a multi-card wave split By task on the real home); sev 2 UI2–UI5; shots in `.wt-notes/uv-ui/r1/` (commit f641d2f).
- Round 2, commit run: 175824828d292c1930da96e3e4715dabcc0a184f (detached worktree). WKWebView: `make review-build PLATFORM="darwin/arm64 -debug"` (debug only for Web Inspector; version `v0.2.0-1308-g1758248`), `Deltagos Review.app` on `scripts/fixture-home.sh` and on a temp copy of this Mac's runs.jsonl + sessions/ (real config and transcripts read only). Chromium: `wails dev -devserver localhost:34605` on the fixture, headless Chrome (`chromium.mjs`, `chromium.log`). DOM reads in `measure.log`, shots in `.wt-notes/uv-ui/`.
- Verdict: **fail**, on UI10 (sev 3, U4/U10 in the filtered view). This is the defect uv-review found; I confirm it in WKWebView. Every other U10 clause and UI1, UI3, UI4 and UI5 are fixed.

### Findings
- **UI10 (3) In the filtered view, a multi-card wave still splits.** What: from organizer's Agents week line (`organizer only`), By task, the lead cannot read sup47's wave in one row. Where: real home, W41, `wkwebview-1512x945-U10-realhome-filtered-split.png`; `measure.log` `real-filtered-organizer-task`. Evidence: `sup43 ·`, `sup46 ·` and `sup47 ·` open to the supervisor alone, and their cards are top-level rows again. The unfiltered view nests them (`real-W41-task`), so the filtered cut (`forInitiative`) misses FR-5a. Proposal: build the filtered task cut with the same wave nesting as the default one, and add a multi-card wave to the fixture (sup47 says uv-build is on it).
- UI1 fixed (unfiltered): sup47 is one row, $37.65 = the Usage view $23.33 + the ledger $9.66 + sup47 $4.66, 6 sessions. Its cards are nested with their sessions, the supervisor sits at the wave's level, and card rows are not repeated at top level. sup46 ($34.25) and sup43 ($29.86) work the same way (`wkwebview-1512x945-U10-realhome-wave-rows.png`).
- UI3 fixed: the first real week (from 19 Aug, 7 sessions, no cost) reads `—` with `no cost recorded for 7 sessions` on the tile, the cut rows, the bar's name and the week list. The bar is a dashed stub. In the fixture, `session —` and `init-b —`, and `*` with its footnote stay only where some money is known (`$72.11*`, `$17.40*`) (`wkwebview-1512x945-U10-realhome-first-week-unknown.png`).
- UI4 fixed: › onto this week and ‹ onto the first week keep focus on the week label, in both engines (WK `real-first-week-focus`, Chromium `U5 focus after › disables`).
- UI5 fixed: at 1024×640 during a rescan (`scanning…` on screen) the top bar is one line, 45 px. The version folds into the brand's hover (`Deltagos v0.2.0-1308-g1758248`), and the crumb reads `Home / Usage` whole, fixture and real (`wkwebview-1024x640-U10-topbar-during-rescan.png`, `-U10-fixture-topbar-during-rescan.png`).
- UI11 (1) `sup43 · floating-icon, usage-ledger, usage-view · 3 cards` nests only one card: the ledger also gives sup43 the two cards sup47 ran (Go attribution, FR-3), so the count and the title promise rows that are not there. For the FSE.
- Out of this card per sup47, not failed: UI2 (chart ends at the picked week), UI6 (reason words), UI7 (running on a past week). Still recorded: UI8 (resting bars 2.2:1), UI9 (`Show the 1 sessions`).

### U1–U10 (round 2)
| # | WKWebView (review build) | Chromium (wails dev) | Result |
|---|---|---|---|
| U1 | DOM + screenshot: fixture $72.85, `+45% on last week ($50.15)` neutral ink, kinds largest first, 7 sessions · 11 h · 1 running; real $357.94, 48 sessions, 10 running | DOM | pass |
| U2 | DOM: 6 bars (8 real), one hue, selected labelled, bar names, a dashed stub for an unknown week | DOM, hover tip, table | pass |
| U3 | DOM per cut, fixture and real: by money, Not attributed last with reasons | DOM per cut | pass |
| U4 | fixture wave (sup11, build, review) and real unfiltered waves one row each; real **filtered** splits | fixture DOM | **fail (UI10)** |
| U5 | keys: Enter, Down, Down, Enter picks 14–20 Sep, focus back on the label; Tab order unchanged | same; Escape returns focus | pass |
| U6 | DOM: `running`, `so far`, tile counts | DOM | pass |
| U7 | DOM: `This Mac only` name and hover; no-cost note where money is partly known | DOM | pass |
| U8 | 1024×640: `scrollWidth === clientWidth` 1024 for the document and body, wraps 962/962, kinds in the row hover, tiles in one row | 1024×608: 1024/1024, 976/976 | pass |
| U9 | not re-run: the diff d338be6..1758248 adds no money outside Usage* (TopBar.tsx changes only the version fold) | — | pass (round 1 grep) |
| U10 | real: unfiltered waves one row (pass), filtered split (fail); unknown week `—` (pass); ‹ to first week keeps focus (pass); 1024 rescan one line (pass) | focus clause pass | **fail (filtered wave)** |

States, round 2: a week with one session, a week with no sessions, partial first week, unattributed, running, cost unknown (now `—`) and narrow all pass in WK; no data yet was not re-run because its branch is unchanged in the diff (round 1 pass).

### Spec gaps (for the FSE)
- S1 U10 names "By task on the real home" but not the filtered view (Agents' week line) the lead reaches by the same table; gate both.
- S2 A supervisor credited with cards another supervisor ran (UI11, FR-3).

### Design questions (for aglaea)
- A1–A4 from round 1 stand (tablist stops, a zero-token tile line, `Last week ·` vs the list, the unknown-week stub, now built as a dashed outline).

### Not verified
- Both machines present; the error states; the Agents line in Chromium; no data yet at 1758248 (unchanged code, see States).
- Reviewer: uv-ui, 2026-10-06.
- 2026-10-06 uv-build: rework 2 for uv-review: filtered waves (885ef92), wave meta (265b4f6), fixture two-card wave (ad7dbf3); head ad7dbf3. Other stand-ins in organizer-fixture.TWrSl4 are not this seat's and were left running.
