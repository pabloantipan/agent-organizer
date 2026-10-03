---
title: Home widths, fourth pass - empty columns give way first, urgent signals never fold, wide measured on the row; Escape, the opener, names
status: done
repos: [organizer]
branch: home-widths-4
updated: 2026-10-03
next: "merged c8cc059 (sup28); UI findings U2-U10 sev 2/1 and the spec gaps are the FSE's"
review: pass
depends_on: [decisions-view, time-zoom-2]
boundary: ["frontend/src/components/Home.tsx, Rail.tsx, RuleDecisionBox.tsx", "frontend/src/components/Crew.tsx (CellStateLz only), Conversation.tsx (FR-24's names and focus only)", "frontend/src/lib/width.ts, frontend/src/lib/ and its tests", "frontend/src/styles/home.css, rule-box.css, global.css (.rail-icon only), shell.css (the rail's rules only)", "testdata/fixture-twenty/ and scripts/fixture-home.sh (FR-25's rows)", "not: header-fold-3's files, DecisionsView.tsx, Go, docs/design-system.md"]
spec: "docs/specs/responsive-home.md (amendment 4, FR-20 to FR-25); the ranking docs/ux/reviews/2026-10-03-rank-leftovers-3.md (Aglaea, 2b6d608); the design system's Widths as amended there"
gate: "docs/specs/responsive-home.md Acceptance, rows G19 to G24 and G8"
ui_review: true
seat: hw4-build
---

## Goal
widths-and-focus's leftovers, ranked by Aglaea: FR-20 to FR-25 of
`docs/specs/responsive-home.md`.

## Gate
- [x] G19: see `docs/specs/responsive-home.md`, Acceptance
- [x] G20: see `docs/specs/responsive-home.md`, Acceptance
- [x] G21: see `docs/specs/responsive-home.md`, Acceptance
- [x] G22: see `docs/specs/responsive-home.md`, Acceptance
- [x] G23: see `docs/specs/responsive-home.md`, Acceptance
- [x] G24: see `docs/specs/responsive-home.md`, Acceptance
- [x] G8: see `docs/specs/responsive-home.md`, Acceptance

## Done
- 2026-10-03 sup28 wave ended: seats ended, tokens revoked, run record runs/2026-10-03-header-fold-3-home-widths-4.md
- 2026-10-03 sup28 merged c8cc059 (code review pass 7f49158, UI recheck pass ca185f3, after 0076 folds last); make test (vitest 152) and npm run build green on main
- 2026-10-03 hw4-build: 0076 (Pablo: the cell folds last) applied in 650ee48, with a1b14b2 (never-fold signals share the column with a 2-character + ellipsis floor); from a clean detached checkout: clip probe 0 bad rows at 1024x640, 1280x800, 1440x900, 1512x945, 1920x1080, rail expanded and strip ("+5" inside the 145 px column at 1024 expanded), G19 as amended and G23 (.wt-notes/hw4-build/clip-0076.log, g19-0076.log, g23-0076.log); rebased on main, make test, npm run build, G18 grep, wails build green
- 2026-10-03 hw4-build: 424149a never-fold signals share the column (shareRoom), each with at least 2 characters + ellipsis on its span, +N inside; clip probe from a clean checkout (.wt-notes/hw4-build/clip-clean.log): passes at 1024 strip and at 1280, 1440, 1512, 1920 expanded and strip; fails only at 1024x640 rail expanded by 6 px (32+32+48 + 27 + 12 = 151 > 145)
- 2026-10-03 hw4-build: 2941f2c (was 40ab320 before the rebase) tracks testdata/fixture-twenty/partner-payouts/agents/cell.json (git add -f, agents/ is ignored); G19 and G23 re-run from a clean detached checkout at 40ab320 (.wt-notes/hw4-build/g19-clean.log, g23-clean.log): the card row partner-payouts · Partner terms is in Needs me, and the cell lozenge on the seven-signal row is shown and cut with an ellipsis on its span at 1920
- 2026-10-03 hw4-build: code review fixes on home-widths-4, rebased on main 189680e (e02059b the cell in definition never folds, it takes its ellipsis; d570c7e one Escape closes only the topmost, Help or a card back first; 95ace22 People's hide named); G19 re-measured at 1440x900 and 1512x945 (.wt-notes/hw4-build/g19-fix.log), the Escape stack in esc-topmost.log, G22 in g22-fix.log; G8 green again
- 2026-10-03 hw4-build: FR-20 to FR-25 on home-widths-4, rebased on 9048507 (6362137, 0aca68a, 1b84824, 09f0bec, 94e31f5, 78599ee, e522b2e); G19-G23 measured before and after the rebase, G8 green (make test, npm run build, G18 grep empty, wails build); evidence and choices in .wt-notes/hw4-build/progress.md. G24 left unticked for the UI reviewer
- 2026-10-03 sup28 launched by the FSE (decisions-view and time-zoom-2 in done/)
- 2026-10-03 0074 ruled by pablo ("Ok", accept as written, 117e269)
- 2026-10-03 cut from responsive-home amendment 4 by the FSE

## Next

## Blockers

## Review
- **Verdict:** pass (code review, third re-review, of 650ee48). G19 (as amended by 0076, ce75486), G20, G21, G22, G23 and G8 met; G24 is the UI reviewer's.
- **Unmet:** none.
- **Rerun by the reviewer** (my own detached worktree at 650ee48, `fixture-home.sh --twenty`, my own wails dev on 34471, headless Chromium with a fresh profile per run, 40 s wait for the agents feed; logs in `.wt-notes/hw4-review/`):
  - Clip probe over every row at 1024×640, 1280×800, 1440×900, 1512×945 and 1920×1080, rail expanded and as the strip: 0 rows with a signal outside the column or a text span without text (`clip.log`). At 1024×640 expanded (145 px column): waiting 54 px and blocked 54 px, each cut with its ellipsis, and "+5" 27 px inside the column.
  - G19 at 1440×900 and 1512×945, rail expanded: the all-"—" next date gone, 21/21 goals shown; on partner-payouts waiting · you is shown (cut, ellipsis), blocked whole, and "+5" holds exactly problem, now, wave, live and the cell, which the hover and the accessible name list (`g19.log`).
  - G20 at 2200×1200 and 2560×1440, rail expanded and collapsed: wide every time, every goal whole or ≥ 70 characters (partner-payouts 70, 87, 95, 95) (`g20.log`).
  - G21 on Home and Decisions at 1512×945 and 1024×640: after a click on the record's text, Escape closes the box and focus returns to Rule; the opener's row carries `data-rb-opener` and `--surface-selected`, on Home at z 20 over the scrim at 19 (`g21.log`).
  - G23 at 1024×640 and 1920×1080, rail expanded and as the strip: every shown CellStateLz has its text on `.lz-t` with `text-overflow: ellipsis` (whole here), partner-payouts' folds into "+N" as 0076 allows; Needs me lists 9 rows including "partner-payouts · Partner terms" (`g23.log`).
  - G22 from the diff: `Reply to <from>`, `Branch from <from>'s message`, `Hide people`, `.rail-icon` 24×24, focus to the People toggle after hide. Nothing G20–G22 reads changed since my last run at 2941f2c (the only frontend changes are OneLine, `shareRoom`, `FOLD.cell`, home.css's signal rules).
- **G8** in the builder's worktree at 650ee48: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (152 vitest), `npm test` and `npm run build` ok, the G18 grep empty; `wails build` ok in my worktree.
- **Boundary:** the diff stays inside `boundary` (Crew.tsx only in `CellStateLz`, global.css only `.rail-icon`), plus SlackView.tsx, widened by sup28.
- **Outside the gate:**
  - the cell is in "+N" at every size measured, 1920 included, because the fold step compares natural widths and the waiting list alone is wider than the column; a cut waiting would leave room for the cell at 1512 and up. 0076 allows it; whether the cell should show where it could is Aglaea's call;
  - `shareRoom` can still return `fits: false` (floors wider than the room); with the cell foldable it no longer happens on the fixture, but nothing guarantees "+N" stays inside for a row with only waiting and blocked in a narrower column;
  - the gate still names no rail state for G11, G15 and G23; G19's amendment names it for 1024 only;
  - on Decisions at 1024×640 the box still covers its own Rule (top element `DIV.rb`), as before.
- **Reviewer:** hw4-review, 2026-10-03

## UI review
- **Recheck at 650ee48** (branch head: 0076 applied in 650ee48 and a1b14b2). The first pass at 2941f2c, 424149a and e522b2e failed on U1. Its shots stay under `.wt-notes/hw4-ui/<commit>/`. This pass is under `.wt-notes/hw4-ui/650ee48/`.
  - **Fixtures:** `--twenty` for G19–G21 and G23, the default fixture for G22.
  - **Engines:** Chromium is a headless viewport of the stated size (`clip-chromium.log`, `chromium-rows.log`, `g22-chromium.log`). WKWebView is the built app (`wails build` at 650ee48), its window alone, set to the stated size. Its content is about 31 px shorter, and this Mac draws classic scrollbars.
- **Verdict:** pass. No severity 4 or 3 remains. U1 is gone in both engines.
- **U1 (was 3): gone.** At 1024×640 with the rail expanded, partner-payouts reads "5 w… · 1 b… · +5" in the built app. The "+5" is whole inside the column (`webkit-1024x640-G19-G23-rail-expanded-scrolled.png`, `crop-pp-1024.png`).
  - **Chromium clip probe:** every row, at 1024×640, 1280×800, 1440×900, 1512×945 and 1920×1080, with the rail expanded and as the strip. That is 10 runs with 0 rows past the column and 0 emptied spans (`clip-chromium.log`, `BAD 0` ×10).
  - **WKWebView:** the same at 1024 and 1280 in both rail states, and at 1440, 1512 and 1920 with the rail expanded.
- **U2 (2 → 1): still there, smaller.** At 1024 with the rail expanded, waiting and blocked keep the floor 0076 ruled: "5 wait…" and "1 bloc…" in Chromium, but only "5 w…" and "1 b…" in WebKit. One letter plus the colour is all that tells them apart. The state column and the hover still say it in words.
  - **Proposal:** none needed beyond 0076. If it bothers Pablo, show an icon per signal kind.
- **U3 (2): still there.** At 1280×800 with the rail expanded, WebKit drops the goal column, which Chromium keeps at 224 px. G15 is an earlier row and names no rail state. In the strip, the scrollbar sits flush against the live dots (`webkit-1280x800-G19-G23-rail-expanded.png`, `crop-strip-1024.png`).
  - **Cause:** at least partly U8.
- **U4 (1): still there.** In wide, the opener's `--surface-selected` is transparent while the pointer is in the box. Chromium 2560 measured `bg=rgba(0,0,0,0)`, and there is no scrim in wide (`chromium-rows.log`, G21 2560).
- **U5 (1): still there.** At 2200×1200 with the rail expanded, partner-payouts' goal shows 68 characters on its line ("…with a statement "), while the 70-character run measures 423.7 of 425 px.
- **U6 (1): still there.** On Decisions at 1024×640, the box covers its own Rule in WebKit (`webkit-1024x640-G21-decisions-open.png`).
- **U7 (1): still there.** The search clear and the reply-to clear have no name (`Conversation.tsx:241`, `:490` at 650ee48).
- **U8 (2, new; also on main): in the built app, the whole page can scroll away.**
  - **What happens:** a wheel past the end of Home scrolls the document itself. The top bar leaves, and a blank band of about 330 px fills the bottom of the window. Only a wheel over that blank band brings it back. A second, outer scrollbar takes about 15 px of width all the time (in every WebKit shot it is the second bar at the right edge). That is likely why WebKit gives the goal away at 1280 (U3).
  - **Evidence:** Chromium at 1280×800 with the rail expanded: `document.scrollingElement.scrollHeight` is 1022 against `clientHeight` 800. The only out-of-flow boxes past the fold are five `span.sr-only` in `.p-stage`. They are `position: absolute` with no positioned ancestor inside `.board-wrap`, so they escape its clipping. The same span is in `Home.tsx` on main, so this card did not cause it. Spec: none (spec gap).
  - **Proposal:** `position: relative` on `.p-row` (or `.board-wrap`), or `overflow: hidden` on `html, body`. Re-measure G15 in WebKit after.
- **U9 (1, observed, outside this card):** in the built app, "live" signals and the rail's live dots dropped out for some samples and came back. One partner-payouts row read "+4" and then "+5", so shots of one row can differ by a live seat. Three instances of the app shared this Mac (mine, zdp-build's and the installed one). The cause was not traced.
- **U10 (1, WebKit only, not checked in Chromium):** on the default fixture at 1512×945, init-a's next date wraps as "2026- / 11-30" in its column (seen while setting up G22).

| Row | Chromium | WKWebView (built app) | Result |
|---|---|---|---|
| G19 | `chromium-{1440x900,1512x945}-G19-rail-expanded.png`, `-pp-row-*` at every size; `clip-chromium.log` | `webkit-{1440x900,1512x945}-G19-G23-rail-expanded.png`; 1024×640: `webkit-1024x640-G19-G23-rail-expanded-scrolled.png` | met in both. The "—" next-date column has given way and the goals show. Waiting and blocked are visible (cut), and waits on you is in the state column. Only now, the wave, live, the cell and the problem are in "+5" (the title says so). At 1024×640 with the rail expanded, "+5" is whole inside the column. WebKit cuts to one letter (U2) |
| G20 | `chromium-{2200x1200,2560x1440}-G20-rail-{expanded,strip}.png` | `webkit-2200x1200-G20-rail-{expanded,strip}.png`, `webkit-2560x1305-G20-rail-{expanded,strip}.png` (the screen cannot reach 1440 high) | wide at every size and rail state in both. U5 still applies (68 characters) |
| G21 | `chromium-{1024x640,1512x945}-G21-{home,decisions}-{open,after-escape}.png`, `chromium-2560x1440-G21-home-*` | `webkit-1024x640-G21-home-{open,after-text-click,after-escape}.png`, `webkit-1024x640-G21-decisions-{open,after-escape}.png` | met in both. The box closes after a click on the record's text and Escape. On Home the opener sits at z 20 over the scrim at 19 with `--surface-selected` (rgb 47,27,85), and on Decisions the head is marked. Focus returns to Rule. U4 and U6 still apply |
| G22 | `chromium-1512x945-G22-{conversation,after-hide}.png`, `g22-chromium.log` | `webkit-1512x945-G22-{conversation,reply-hover,after-hide,after-hide-then-return}.png` | met. The buttons read "Reply to fse" and "Branch from fse's message", and every visible `.rail-icon` is at least 24×24. After hide, focus is on "People, 3 seats…". In WebKit, Return reopens People, with its ring on the toggle |
| G23 | `chromium-{1024x640,1920x1080}-G23-home-rail-{expanded,strip}.png`, `chromium-rows.log` | `webkit-1024x640-G19-G23-*`, `webkit-1920x1080-G19-G23-rail-expanded.png` | met. CellStateLz's span has `text-overflow: ellipsis`, `overflow: hidden` and `nowrap`, and onboarding-flow shows it whole. partner-payouts' cell is in "+5" as 0076 rules. Needs me lists 9 rows, including "partner-payouts · Partner terms" |
| G24 | this table | | the differences are named: U2 (WebKit cuts to one letter), U3 and U8 (the outer scrollbar), U9 |

- **Spec gaps (FSE):**
  - Nothing says the document itself must not scroll, or that a visually hidden span must sit inside its scroll container (U8). Gate widths still say nothing about classic scrollbars, and U8 makes them cost about 15 px more.
  - G15 still names no rail state, and WebKit with the rail expanded fails it at 1280 (U3).
  - 0076's "2-character floor" counts characters, not words. In WebKit it leaves one letter of the word (U2).
  - The earlier gaps not closed by 0076 still stand: the order among problems, now and live; G20's "≥ 70" (a line or a run); FR-23 and hover; 2560×1440 is not reachable on the 3440×1440 screen; and signal gates must wait for the agents feed.
- **Not verified:**
  - G22's accessible names in WKWebView: System Events does not expose them. They come from Chromium and the code.
  - G21 in WebKit at 1512 and 2560: carried from e522b2e. The Escape code has not changed since 41ddfb2.
  - Tab in WKWebView: the Keyboard navigation setting was not checked, and the Return trick stood in.
  - G23 in WebKit at 1920×1080 with the rail as the strip; 1920 is shot with the rail expanded only, 1024 in both states.
  - U10 in Chromium.
- **Note:** WKWebView's storage is shared with the installed app and with zdp-build's instance. I toggled the rail and left it expanded, as I found it.
- **Reviewer:** hw4-ui, 2026-10-03 (recheck)

## Notes
Runs in parallel with header-fold-3; boundaries disjoint.
- boundary widened by sup28: SlackView.tsx, FR-24 focus only
- 0076 ruled (Pablo): the cell's state folds into "+N" last, after problems, now and live; waiting and blocked never fold and keep a 2-character + ellipsis floor.
- On Decisions at 1024x640 the rule box is moved up to fit and covers the lower half of its own Rule (existing placement); the head stays marked.
- The empty-column track uses a CSS space toggle (`--t-next: ;`): G24 should look at it in WKWebView.
