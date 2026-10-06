---
title: "The Usage view: this week's tokens and money, past weeks, by initiative, role, task and model"
status: now
repos: [organizer]
branch: usage-view
seat: uv-build
stage: one-window
updated: 2026-10-06
next: "U10 (FR-5a): in Usage filtered to one initiative (the Agents week line, which lands By task), a multi-card wave is still three rows: forInitiative gives the supervisor row cards [wave:supN], so groupWaves skips it; make it one row there too"
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
- [x] X0 fresh clone of usage-view at 1758248 (rebased on main 2026-10-06 after e67dfda): `XDG_DATA_HOME=$(mktemp -d) make test` 0 (Go ok, 304 vitest), `npm run build` 0, `wails build` 0. The clone `.wt-notes/uv-build/x0-clone` is left: its removal was refused (the shell sat in it).

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
- Commit run: d338be61eee6bf8504e07bade8eea37db380312e (detached worktree, branch did not move). WKWebView: `make review-build PLATFORM="darwin/arm64 -debug"` (the debug flag only, for Web Inspector; version string clean `v0.2.0-1299-gd338be6`), `Deltagos Review.app`, on `scripts/fixture-home.sh`, `--empty`, and a temp copy of this Mac's runs.jsonl + sessions/ (real config and transcripts, read only). Chromium: `wails dev -devserver localhost:34605` on the fixture, headless Chrome via playwright-core (`chromium.mjs`, `chromium.log`). Evidence under `.wt-notes/uv-ui/` (`measure.log` = DOM reads through the guarded inspector tool, clipboard saved and restored).
- Verdict: **fail**, on UI1 (severity 3, U4 on the real home).

### Findings
- **UI1 (3) A multi-card wave's cost never reads in one place.** What: on the real home, By task, the lead cannot see what sup47's wave cost: it is three rows. Where: real home, 2026-W41, By task (`wkwebview-1024x640-U8-realhome-by-task.png`; `measure.log` `real-W41-task-sup47`, `real-W41-task-all-members`). Evidence: `sup47 · usage-ledger, usage-view` ($3.90) opens to the supervisor alone; its builders and reviewers sit under "The Usage view…" ($13.15: uv-build, uv-review, uv-ui) and "Every Claude session's tokens…" ($9.66: ul-build, ul-review). Same for sup43 and sup46 (2 cards each). Only single-card waves (sup41's "Decisions holds still", the fixture's sup11) open to builder, reviewer and supervisor together, which is why the fixture passes. Proposal: a supervisor's row is the wave: it opens to its cards' rows (each with its sessions) plus the supervisor session, and its money is the sum; card rows of a wave are not repeated at top level (the `cards` the ledger already gives the sup row are the join).
- **UI2 (2) Picking a past week cuts the chart to that week.** What: the lead looking up a past week loses the weeks after it, and the scale changes under him; from the first week the chart is one bar (fixture) or empty (real). Where: `wkwebview-1512x945-U5-picked-by-keys.png` (3 bars, $40 scale), `-States-partial-first-week.png`, `-realhome-first-week-no-cost.png`. Evidence: design §3 "the last 12 weeks… the selected week's bar is the full step"; States "the chart still shows the other weeks". A bar after the selected week cannot be clicked because it is not drawn (› still works). Proposal: draw the 12 weeks ending at this week whatever is selected (or at the selected week only when it is older than that window); keep the axis scale fixed for the window. Needs `History` from Go (out of this card's boundary): for the FSE.
- **UI3 (2) Unknown money reads as $0.00.** What: a week, a bar or a cut row whose sessions have no recorded cost says the lead spent nothing. Where: real home, week from 19 Aug: tile `$0.00 · nothing spent the week before either · excludes 7 sessions with no cost`, bar and week list `$0.00`, rows `session $0.00*`, `Not attributed $0.00*` (`wkwebview-1512x945-realhome-first-week-no-cost.png`); fixture this week `session $0.00*`, `init-b $0.00*`. Evidence: States, cost unknown: `—` with `no cost recorded`. Only Sessions rows do it. Proposal: a row, bar or week whose money is entirely unknown reads `—` (hover `no cost recorded for N sessions`); the bar is drawn as an outlined stub, not a missing bar; "nothing spent" only when sessions with cost summed to 0.
- **UI4 (2) › and ‹ drop focus when they disable themselves.** What: a keyboard user pressing › onto this week (or ‹ onto the first week) lands on nothing and must Tab from the top. Where: both engines; WK `measure.log` `fx-after-disabled-focus` = BODY, Chromium `chromium.log` `U5 focus after › disables` = BODY. Evidence: design system, disable-on-press moves focus first. Proposal: when the arrow disables, focus the week label.
- **UI5 (2) The top bar wraps at 1024 while a scan runs.** What: at the minimum window, every rescan rewraps the top bar: the version breaks onto two lines, the crumb reads `Home / Usa…`, the machine line wraps. Where: `wkwebview-1024x640-U8-this-week.png`, `-U8-realhome-by-task.png` (fixture and real home, clean version string). Evidence: `measure.log` `fx-1024-topbar`: idle it fits with a 17 px spacer; the Usage button takes 61 px + 12 px gap, and `scanning…` is wider than `Rescan`. Proposal: the version folds first at compact (into the brand's hover), or the scan state keeps Rescan's width.
- UI6 (1) Not attributed's hover gives absolute paths (`no initiative root above /Users/pabloantipan`), and the task cut says `a session session works on no single card`, `a fse session…` (Go `reasonFor`). Design words: `no card or wave matched its folder or branch`. Proposal: the design's words, the folder's last element at most.
- UI7 (1) A past week's tiles say `includes 10 running` (real W40): its share of a live session is final. Proposal: `so far`/running only on the week that holds today.
- UI8 (1) The resting bars (`--violet-7`, rgb 97 55 171) are 2.2:1 on the ground, under 3:1 for graphics (1.4.11); the direct label, hover and table carry the values, so recorded only.
- UI9 (1) `Show the 1 sessions of …` (disclosure's accessible name); the fixture wave's name lacks the design's `supNN ·`; at 1024 Sessions names truncate to the same prefix (`organizer-fixture-prob…`), the role column tells them apart.

### U1–U9
| # | WKWebView (review build) | Chromium (wails dev) | Result |
|---|---|---|---|
| U1 | screenshot + DOM: $72.85, `+45% on last week ($50.15)` in `--fg-muted` ink (rgb 181 175 195), kinds largest first, 7 sessions · 11 h · 1 running; real home $345.09, `−61% on last week ($894.51)`, 48 sessions, 10 running | DOM, same values | pass |
| U2 | screenshot of the hover tip (pointer), DOM: 6 bars (8 real), one hue (rest violet-7, selected accent), only the selected labelled, bars are buttons with the hover words as name, click selects; Show as table by Space | DOM + hover tip + table | pass (UI2, UI8 recorded) |
| U3 | DOM per cut, native hover screenshot: sorted by money, Not attributed last and muted with reasons, fixture and real | DOM per cut | pass (UI3, UI6 recorded) |
| U4 | fixture: AXPress the disclosure, sup11 + wave1-build + wave1-review with money and tokens; real home: multi-card waves split | fixture DOM, same | **fail on the real home (UI1)** |
| U5 | keys on the label: Enter opens, focus on the current week, Down Down Enter picks 14–20 Sep, focus back on the label; ‹ › step; tiles, chart, cut, Sessions follow; real W40 checked | same keys; Escape returns focus | pass (UI2, UI4 recorded) |
| U6 | screenshot: `running` (mint), `4.8M so far`, `$9.80 so far`, tile `1 running`, money `includes 1 running` | DOM | pass |
| U7 | AX/DOM: `This Mac only` focusable, name and title `The other Mac's usage is not here yet.` (one machine on the board); `excludes 1 session with no cost`, `—` and `no cost recorded` on the session row, `*` on its cut rows | DOM | pass (UI3 recorded) |
| U8 | window 1024×640 (608 content): measured `scrollWidth === clientWidth` (1024) for document and body, main 1010/1010, table wraps 962/962 fixture and real; kinds folded into the row's hover (screenshot of the native tooltip); tiles one row (3 × 313 px); Sessions folds model | viewport 1024×608: 1024/1024, wraps 976/976 | pass (UI5 recorded) |
| U9 | grep over `frontend/src` (the card's command) | — | pass: only `Overview.tsx:16`, a comment |

States: no data yet (`--empty`, WK screenshot: title and the one line, nothing else) pass; a week with one session (14–20 Sep: tiles, chart, one row 100%, Sessions · 1; the table also shows an empty Not attributed row, as uv-review noted) pass; a week with no sessions (21–27 Sep: $0.00, `No sessions this week.`, chart with earlier weeks only) pass with UI2; unattributed pass; running pass; other machine absent pass (hover names no machine: the board knows one); partial first week (`from 3 Sep`, real `from 19 Aug`, ‹ disabled) pass; cost unknown: session cells pass, aggregates fail softly (UI3); narrow 1024×640 pass. Keyboard (WK with Option-Tab, since this Mac's Keyboard navigation setting is off and was not changed; Chromium Tab): Usage → Help → Settings → ‹ → week label → This Mac only → Show as table → 6 bars → 4 tabs → disclosures → Sessions, in order, 2 px accent ring on each (`wkwebview-1512x945-keyboard-focus-rings.png`, `-keyboard-week-label-focus.png`); Enter on Usage from Home opens it; Enter/Space work on the week picker, the tabs, Show as table and Sessions.

### Spec gaps (for the FSE)
- S1 A supervisor spans several cards (FR-3), but the design and U4 speak of "a wave's row": define the wave row as the supervisor plus its cards (UI1), and gate U4 on the real home's multi-card waves.
- S2 `History` ends at the selected week (Go); the design wants the 12 weeks (UI2).
- S3 Money unknown for a whole row, bar or week is not defined; only the session cell and the totals are (UI3).
- S4 "Running" on a past week (UI7).

### Design questions (for aglaea)
- A1 The segmented control is a tablist with every tab a Tab stop and no arrow keys; one stop with arrows (roving) or as built?
- A2 A no-session week's tokens tile reads `input 0 · output 0 · cache read 0 · cache write 0`; one line `No tokens` instead?
- A3 The picker says `Last week · 28 Sep–4 Oct`, its list `28 Sep–4 Oct`; one form?
- A4 A week whose money is wholly unknown: an outlined stub bar or no bar (UI3)?

### Not verified
- Both machines present (`By machine` cut): one machine on this board; no fixture for it.
- The error states (`Usage could not be read`, `That week could not be read`): no path to drive them.
- No data yet and the Agents week line in Chromium (WKWebView only).
- Loading (`Reading this Mac's sessions…`): read once by accessibility on the real home, no screenshot.
- Reviewer: uv-ui, 2026-10-06.
- 2026-10-06 uv-build: rework for uv-ui's review: UI1 (ba3a94f), UI3 (1625757, 1758248), UI4 (8f2d022), UI5 (14450d5, TopBar's version folds at compact); U10 met; head 1758248. Found, not asked: the ledger matches sup43 to usage-ledger because that card quotes "sup43 launched fic-build" in a note (Go `supervisedBy`); the view gives a card two waves claim to the later supervisor. UI2, UI6, UI7 not built (FSE's next batch).
