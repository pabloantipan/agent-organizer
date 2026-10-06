---
title: "The Usage view: this week's tokens and money, past weeks, by initiative, role, task and model"
status: now
repos: [organizer]
branch: usage-view
seat: uv-build
stage: one-window
updated: 2026-10-06
next: "review: usage-view, gate met (U1-U9, X0), d338be6"
depends_on: [usage-ledger]
boundary: ["frontend/src/components/Usage.tsx and styles/usage.css (new)", "the top bar and board.store.ts screen (one entry), AgentsView.tsx (the week line only)", "frontend/src/lib helpers and tests, scripts/fixture-home.sh (a ledger)", "not: Go"]
spec: "docs/specs/usage.md (FR-5, FR-6; docs/ux/specs/usage.md (b104480))"
gate: "docs/specs/usage.md Acceptance, rows U1 to U9 and X0"
ui_review: true
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
- [x] U9 money only in Usage, after dropping ContextBar's cost (a2c4982):
  `grep -rnE 'cost_usd|costUSD|cost_from|\.money\b|money\(|\$\{?[0-9]|"\$"|toFixed\(2\)|dollar' src --include='*.ts' --include='*.tsx' --include='*.css' | grep -vE 'src/components/Usage[A-Za-z]*\.tsx|src/lib/usage(\.test)?\.ts|src/styles/usage\.css'` in `frontend/` →
  `src/components/Overview.tsx:16: /** … token figures, never dollars (0020). */` (a comment), nothing else. No test asserted the $.
- [x] X0 fresh clone of usage-view at 2224d63 (before the rebase onto 10064bf, which only moved cards): `XDG_DATA_HOME=$(mktemp -d) make test` 0 (Go ok, 298 vitest), `npm run build` 0, `wails build` 0. Clone removed.

## Notes
- 0099 ruled 2026-10-06; supervisor sup47, spawned by the FSE.
- 2026-10-06 sup47: usage-ledger merged as 6e4e004; wave 2 launched from a031a67. The new screen needs one line in App.tsx (the screen switch), read as part of "the store's screen (one entry)".
- 2026-10-06 sup47: boundary widened by one clause, `frontend/src/components/ContextBar.tsx:13` (the statusline cost in the context bar's hover on Agents), which U9 (FR-6, 0099) requires dropping; no other session owns it.
- 2026-10-06 uv-build: found, not asked: Go's task-cut reason reads "a session session works on no single card" for role `session` (internal/usage/report.go `reasonFor`); a past week's tiles say "includes N running" for sessions still alive that touched it (Go's Running); a `-dirty` build's longer version wraps the top bar at 1024 (clean builds fit); picking an old week shortens the chart, since `History` ends at the selected week. Choices and how to drive each state: `.wt-notes/uv-build/progress.md`.

## Done
- 2026-10-06 uv-build: Usage view (FR-5) and money only in Usage (FR-6) on usage-view, e0767d1..d338be6; fixture usage history; gate met U1-U9, X0.
