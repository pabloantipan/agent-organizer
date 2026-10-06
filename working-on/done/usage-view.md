---
title: "The Usage view: this week's tokens and money, past weeks, by initiative, role, task and model"
status: done
repos: [organizer]
branch: usage-view
seat: uv-build
stage: one-window
updated: 2026-10-06
next: "merged as 58eb28c (sup47)"
depends_on: [usage-ledger]
boundary: ["frontend/src/components/Usage.tsx and styles/usage.css (new)", "the top bar and board.store.ts screen (one entry), AgentsView.tsx (the week line only)", "frontend/src/lib helpers and tests, scripts/fixture-home.sh (a ledger)", "not: Go"]
spec: "docs/specs/usage.md (FR-5, FR-6; docs/ux/specs/usage.md (b104480))"
gate: "docs/specs/usage.md Acceptance, rows U1 to U9 and X0"
ui_review: true
review: pass
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
- Verdict: **pass** (code, checks and recorded evidence; the WKWebView rows are uv-ui's).
- Commit reviewed: ad7dbf3d5d69b9b82b8d8d2d3927b430cfbf614e (branch usage-view, rework 2: 885ef92, 265b4f6, ad7dbf3; gate U1-U10 and X0).
- Unmet gate items: none.
- U10, wave row, both cuts: `forInitiative(sessions, id, data.cuts.task)` now takes each task row's `cards` from the week's task cut under the same key, so the filtered supervisor row carries `[w-nogate, w-queued]`, and `UsageTable` runs `groupWaves` on every By task. The vitest "one initiative's waves" is my case of the last round: filtered, $10 + $40 + $30 is one $80 row with both cards under it. Its second case shows the old split when no task rows are passed. The fixture's `organizer usage --json` now holds `wave:sup12` ($6.10, cards w-nogate and w-queued) beside `w-queued` $14.30 and `w-nogate` $9.20. Run through the shipped helpers in a scratch vitest (removed), it gives one `wave:sup12` row of $29.60, both in the default cut and filtered to init-a. No card row repeats at the top level, and Not attributed is last. The wave's meta now counts the cards under it (`· N cards` only when there are any), which closes my sup46 note.
- U10, the rest: unchanged from 1758248 and met (— only when money is wholly unknown, focus on the picker, the top bar folds the version at compact).
- X0, fresh clone at ad7dbf3, no prior build: `XDG_DATA_HOME=$(mktemp -d) make test` 0 (every Go package ok, 306 vitest); `npm install && npm test && npm run build` 0; `wails build` 0. The clone and fixture are removed.
- U9: my grep outside Usage*.tsx, lib/usage*.ts and usage.css finds only TopBar's comment and the Usage button's title words. No Go and no wailsjs in the diff, and every path is inside the boundary.
- Fixture: this week is now $102.45 with 10 sessions, since sup12's wave added three. The card's U1 line still quotes $72.85 and 7 sessions from before ad7dbf3; that is stale evidence, not a defect.
- Open, not blocking (from the earlier rounds): `--violet-7` in usage.css is a tier-1 primitive; a picked past week says "on last week" for the week before it; the chart drops later weeks (UI2, Go); the empty Not attributed row shows in every cut.
- Round 2, 1758248: fail, unmet U10 (eeed5cb): the filtered By task split a multi-card wave.
- Round 1, d338be6: pass, unmet none (9fa5021), before Amendment 2.
- Reviewer: uv-review, 2026-10-06.

## UI review
- Round 1, d338be6: fail on UI1 (sev 3, a multi-card wave split By task on the real home); sev 2 UI2–UI5 (f641d2f; shots `.wt-notes/uv-ui/r1/`).
- Round 2, 1758248: fail on UI10 (sev 3, the filtered By task still split multi-card waves); UI1, UI3, UI4 and UI5 fixed; U1–U3 and U5–U8 pass in both engines (b400ac1; shots and logs `.wt-notes/uv-ui/r2/`).
- Round 3, commit run: ad7dbf3d5d69b9b82b8d8d2d3927b430cfbf614e (detached worktree). WKWebView only, as sup47 asked: `make review-build PLATFORM="darwin/arm64 -debug"` (debug only for Web Inspector; version `v0.2.0-1313-gad7dbf3`), `Deltagos Review.app` on `scripts/fixture-home.sh` and on a temp copy of this Mac's runs.jsonl + sessions/ (real config and transcripts read only). DOM reads in `.wt-notes/uv-ui/measure.log`, shots in `.wt-notes/uv-ui/`.
- Verdict: **pass**. No severity 4 or 3 is left against the spec.

### Round 3 checks
| # | How (WKWebView) | Result |
|---|---|---|
| U4/U10 fixture, default | By task with every disclosure opened (AXPress), DOM: `sup12 · w-nogate, w-queued · 2 cards` $29.60 = Queued wave card $14.30 + Wave card with no gate $9.20 + sup12 $6.10, 3 sessions; the cards are nested with their builders and the supervisor sits at the wave's level; sup11's one-card wave is unchanged (`wkwebview-1512x945-U10-fixture-task-default.png`) | pass |
| U4/U10 fixture, filtered | Home › init-a › Agents › `This week · 49.6M tokens` › `init-a only`, By task: sup12 nested the same, $29.60; Not attributed drops to init-a's $14.75 (`-U10-fixture-task-filtered.png`) | pass |
| U4/U10 real, default | W41 By task: `sup47 · 2 cards` $42.54 (6 sessions), `sup46 · 2 cards` $34.25 (7), each with its cards nested and the supervisor at the wave's level; card rows not repeated at top level | pass |
| U4/U10 real, filtered | Home › organizer › Agents › week line › `organizer only`, By task: sup47 $42.54 = the Usage view $27.73 + the ledger $9.66 + sup47 $5.15; sup46 $34.25 = $16.48 + $13.78 + $3.99; sup43 shows `1 card` (`-U10-realhome-filtered-waves.png`) | pass |
| U1 | DOM: fixture $102.45, `+104% on last week ($50.15)`, `includes 1 running · excludes 1 session with no cost`, kinds largest first, 10 sessions · 17 h · 1 running; real $363.13, `−59% on last week ($895.89)`, 48 sessions | pass |
| U5 | keys on the week label: Enter, Down, Down, Enter picks 14–20 Sep and focus returns to the label; tiles follow; › by Enter to this week keeps focus on the label | pass |
| U8 | 1024×640 window: `scrollWidth === clientWidth` 1024 for document and body, main 1010/1010, table 962/962, tiles in one row; top bar one line, 45 px, during a rescan (`wkwebview-1024x640-U8-fixture-rescan.png`) | pass |

### Recorded, not failed
- UI2 (the chart ends at the picked week), UI6 (reason words) and UI7 (running on a past week) are out of this card per sup47. UI8 (resting bars at 2.2:1) and UI9 (`Show the 1 sessions`) are severity 1.
- UI11 (1, Go, the FSE's): sup43's title still names usage-ledger, a card sup47 ran. Its meta now says `1 card` and it nests that one card, so the count no longer promises missing rows.

### Spec gaps (for the FSE)
- S1 Gate the filtered view (Agents' week line) next to the default one wherever a cut is checked; it is built by its own path (`forInitiative`), which is how round 2's UI10 slipped.
- S2 A supervisor credited with cards another supervisor ran (UI11, FR-3).

### Design questions (for aglaea)
- A1 The segmented control is a tablist where every tab is a Tab stop. One stop with arrow keys instead?
- A2 A week with no sessions shows `input 0 · output 0 · cache read 0 · cache write 0`. Show `No tokens` instead?
- A3 The picker says `Last week · 28 Sep–4 Oct` but its list says `28 Sep–4 Oct`. One form?
- A4 A week with no recorded cost now draws a dashed stub for its bar. Keep it?

### Not verified
- Round 3 did not re-run Chromium, U2, U3, U6, U7 or U9 (round 2: pass; the rework touches only the task cut and the fixture), the states table or the keyboard walk.
- Both machines present; the error states (no path to drive them).
- Reviewer: uv-ui, 2026-10-06.
- 2026-10-06 sup47: merged as 58eb28c after uv-review and uv-ui passed at ad7dbf3; card to done/.
