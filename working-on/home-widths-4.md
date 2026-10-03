---
title: Home widths, fourth pass - empty columns give way first, urgent signals never fold, wide measured on the row; Escape, the opener, names
status: now
repos: [organizer]
branch: home-widths-4
updated: 2026-10-03
next: "review: home-widths-4, 0076 applied (the cell folds last, 650ee48); clip probe 0 bad rows at 1024/1280/1440/1512/1920, rail expanded and strip; G19-G23 and G8 met; G24 is the UI reviewer's"
review: fail
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
- [ ] G24: see `docs/specs/responsive-home.md`, Acceptance
- [x] G8: see `docs/specs/responsive-home.md`, Acceptance

## Done
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
- **Verdict:** fail (code review, second re-review of 40ab320, the same tree as 2941f2c after the rebase). G19, G20, G21, G22 and G8 met; G23 unmet; G24 is the UI reviewer's.
- **Unmet:** G23. At 1024×640, `--twenty`, with the rail expanded, partner-payouts' CellStateLz is shown but its text span is 0 of 84 px wide, so there is neither the whole text nor an ellipsis, and the lozenge sits 8 px past the clipped signal column. Its "+4" sits 39 px past the column, so the four folded signals have no visible marker; only the `title` and the accessible name still list them. The same happens at 1280×800 with the rail expanded (text 0/84, "+4" 19 px past the column). It comes from e02059b: waiting, blocked and the cell never fold, and in compact their total is wider than the 145 px column. Before e02059b, at 1024 with the rail expanded, the cell folded (the builder's g23.log). With the rail as the strip (fresh storage) at 1024, and at 1439, 1440, 1512 and 1920 with the rail expanded, no signal is clipped or emptied. This also regresses G11 ("+N" at 1024×640, rail expanded). Fix: never-fold lozenges must share the column so each keeps a visible ellipsis and "+N" stays inside it. If they cannot, say so on 0076 for Pablo.
- **Rerun by the reviewer** (my own detached worktree at 40ab320, `fixture-home.sh --twenty`, my own wails dev, headless Chromium, the builder's probe scripts copied, plus a clip probe over every row): G19 at 1440×900 and 1512×945: the all-"—" next date gone, 21/21 goals shown; on partner-payouts (state "waits on you") waiting and the cell cut with their ellipsis, blocked whole, and only now, wave, live and problem in "+4". Wave counts as live by the design system's Widths and `FOLD`. G20 at 2200×1200 and 2560×1440, rail expanded and collapsed: wide each time, every goal whole or ≥ 70 characters (partner-payouts 70, 87, 95, 95). G21 on Home and Decisions at 1512×945 and 1024×640: after a click on the record's text, Escape closes the box; the opener's row is marked `--surface-selected`, and on Home it sits at z 20 over the scrim at 19. G23 at 1024×640 (strip) and 1920×1080: the text is whole, or cut 65/84 px with an ellipsis, on `.lz-t`. Needs me lists 9 rows, including "partner-payouts · Partner terms" and the partner-payouts cell row. G22 from the diff (`Reply to <from>`, `Branch from <from>'s message`, `Hide people`, `.rail-icon` 24×24, focus to the People toggle) and g22-fix.log; nothing that touches it changed after 95ace22.
- **G8** in the builder's worktree at 2941f2c: `XDG_DATA_HOME=$(mktemp -d) make test` green (148 vitest), `npm test` and `npm run build` ok, the G18 grep empty; `wails build` ok in my worktree at 40ab320.
- **Outside the gate:**
  - the gate fixes no rail state for G23 or G15, and compact with the rail expanded is where never-fold overflows. G19 to G23 should name the rail state, or check both;
  - on Decisions at 1024×640 the box still covers its own Rule (top element `DIV.rb`), as before;
  - the box's Escape yields to any other `[role="dialog"]` in the document, as before;
  - the diff stays inside `boundary`, plus SlackView.tsx (widened by sup28).
- **Reviewer:** hw4-review, 2026-10-03

## UI review
- **Commits run:** 424149a (branch head when I finished; only the signal column re-checked, its diff touches nothing else), 2941f2c (every row, both engines), e522b2e (the first pass; superseded, kept for the wide shots). Shots and logs under `.wt-notes/hw4-ui/<commit>/`. Fixture `--twenty` for G19–G21 and G23, default for G22. Chromium is a viewport of the stated size; WKWebView is the built app's window at the stated size. Its content is about 31 px shorter, and this Mac draws classic scrollbars (about 15 px).
- **Verdict:** fail. Severity 3: U1.
- **U1 (3)**: the lead cannot see that an initiative has more signals than it shows.
  - **Where:** Home at 1024×640 with the rail expanded, partner-payouts, in the built app at 424149a. The row reads "5 … · 1 … · ▪ cell…" and the "+4" is cut off past the column. `424149a/webkit-1024x640-G19-G23-rail-expanded-scrolled-424.png`.
  - **Evidence:** Chromium fits the "+4" with 6 px spare. The column is 145 px, and the floors are 32 + 32 + 48 plus the "+4" (27) plus the gaps (`424149a/pp-row-424.log`, `chromium-1024x640-G19-424-pp-row-rail0.png`). WebKit's column is narrower, and `shareRoom` returns the floors with `fits: false`, so the row overflows by design. At 2941f2c it was worse in both engines: in Chromium a 14 px cell lozenge and no "+4" at 1024 and 1280; in WebKit "1 blocke" was cut mid-word with no "+4" (`2941f2c/`). The "+4" hides 1 problem, 1 now, a wave and a live seat, with nothing on screen to prompt a hover. This breaks FR-10/FR-15 (one line *with "+N"*) and the earlier row G11 at its own size and rail state.
  - **Proposal:** reserve the "+N" first. When the never-fold floors still do not fit, fold the cell in definition before clipping anything (0076 is open), and measure the floors in the built app, not in Chromium only.
- **U2 (2)**: the lead cannot tell waiting from blocked without colour.
  - **Where:** the same row at 1024 and 1280 with the rail expanded, in both engines at 424149a: "5 …" and "1 …".
  - **Evidence:** `LZ_MIN_TEXT` is 18 px, which leaves only the count. That fails WCAG 1.4.1 and the design system's "never by colour alone". The state column still says "waits on you", and the hover names each signal.
  - **Proposal:** a floor of count plus the first letters of the word ("5 wait…", "1 block…"), or an icon per signal kind.
- **U3 (2)**: the built app's classic scrollbars take room the Chromium numbers assume.
  - **Where:** the expanded rail cuts "partner-payou…", which is whole in Chromium. In the 46 px strip the scrollbar overlaps rank "14" and its cell mark. At 1280×800 with the rail expanded, WebKit gives the goal column away where Chromium keeps 31 characters (G15, an earlier row, names no rail state). `2941f2c/webkit-1440x900-G19-rail-expanded.png`, `e522b2e/webkit-1024x640-G21-home-before.png`, `424149a/webkit-1280x800-G19-rail-expanded-424.png`.
  - **Proposal:** the strip hides its scrollbar or reserves its gutter, and width gates run in the app as well.
- **U4 (1)**: in wide, the opener's `--surface-selected` goes away whenever the pointer is over the row or its box, which is where the pointer sits while ruling.
  - **Cause:** `rule-box.css:103` `.home.wide .ib-row.ruling:hover { background: transparent }`. Seen in both engines: `e522b2e/webkit-2560x1305-G21-home-open-pointer-{on-row,away}.png`, `chromium-2560x1440-G21-home-open-pointer-away.png`.
  - **Proposal:** drop that hover rule while `[data-rb-opener]` is set.
- **U5 (1)**: at 2200×1200 with the rail expanded, partner-payouts' goal shows 67 characters ("…with a statement…").
  - **Evidence:** the room is measured as 70 characters plus "…" in one run (423.7 of 425 px), but the one-line clamp breaks at a word. G20 says ≥ 70. `2941f2c/chromium-2200x1200-G20-rail-expanded.png`, `webkit-2200x1200-G20-rail-expanded.png`.
  - **Proposal:** measure up to the word after character 70.
- **U6 (1)**: on Decisions at 1024×640 the box covers its own Rule. The placement is unchanged from main, as the builder and the code review note.
- **U7 (1, from code)**: two `.rail-icon` buttons still have no name: the search clear and the reply-to clear (`Conversation.tsx` :241, :490). They are outside FR-24's list.

| Row | Chromium | WKWebView (built app) | Result |
|---|---|---|---|
| G19 | 2941f2c `chromium-{1440x900,1512x945}-G19-rail-expanded.png`; 424149a `chromium-{1440x900,1512x945}-G19-424-pp-row-rail0.png` | 424149a `webkit-{1440x900,1512x945}-G19-rail-expanded-424.png` | met in both: "—" column gone, goals shown; waiting, blocked and the cell are shown (cut, U2), and only problems, now and live are in "+4". Difference: WebKit cuts harder |
| G20 | 2941f2c `chromium-{2200x1200,2560x1440}-G20-rail-{expanded,strip}.png` | 2941f2c `webkit-2200x1200-G20-rail-{expanded,strip}.png`, `webkit-2560x1305-G20-rail-{expanded,strip}.png` (the window cannot reach 1440 high: 1305) | wide at every size and rail state in both; U5 (67 characters) |
| G21 | 2941f2c `chromium-{1024x640,1512x945,2560x1440}-G21-home-{open,after-escape}.png`, `chromium-{1024x640,1512x945}-G21-decisions-{open,after-escape}.png` | 2941f2c `webkit-1024x640-G21-{home,decisions}-{open,after-escape}.png`; e522b2e `webkit-1512x945-G21-home-*`, `webkit-2560x1305-G21-home-*` | met in both: closed after a click on the text and Escape; the opener above the scrim and marked (U4 in wide); focus back on Rule with a ring in WebKit |
| G22 | 2941f2c `chromium-1512x945-G22-{conversation,after-hide}.png`, `g22.log` | 2941f2c `webkit-1512x945-G22-{conversation,reply-hover,after-hide,after-hide-then-return}.png` | met: "Reply to fse" and "Branch from fse's message"; every `.rail-icon` 24×24 (WebKit: reply's hover box 24×24); after hide, Return reopens People, so focus is on the toggle |
| G23 | 2941f2c `chromium-{1024x640,1920x1080}-G23-*.png`; 424149a `chromium-1024x640-G19-424-pp-row-rail0.png` | 2941f2c `webkit-1920x1080-G23-home-rail-strip.png`; 424149a `webkit-1024x640-G19-G23-rail-expanded-scrolled-424.png` | the card row "partner-payouts · Partner terms" is listed. CellStateLz ends in its ellipsis at 424149a in both engines, but the row's "+4" is lost in WebKit (U1) |
| G24 | this table | | the differences are named in U1–U3 |

- **Spec gaps (FSE):**
  - FR-20 does not say what wins when the never-fold signals alone overflow the column: "+N", word floors, or folding the cell (0076).
  - FR-20 sets no order among problems, now and live. The build folds now before live, so at 2200 auth-gateway shows its wave and live but folds "1 now".
  - G20's "≥ 70 characters" does not say whether that means the first line at its word break or the measured run.
  - Gate widths do not say how classic scrollbars count. The design system dismisses overlay scrollbars, but macOS shows classic ones when a mouse is attached.
  - 2560×1440 is not a reachable window size on the 3440×1440 screen.
  - FR-23 does not cover hover.
  - G11, G15 and G23 name no rail state.
  - The fixture's live and cell signals arrive 10–40 s after load, so a signal gate must wait for the agents feed.
- **Not verified:**
  - G22's accessible names in WKWebView: System Events exposes only 130 elements, not the conversation. The names come from Chromium and the code.
  - G21 in WebKit at 1512 and 2560 at the head: shot at e522b2e. The Escape change since then (cf05457) only adds an early return while another dialog is open.
  - Escape with Help or a card back open.
  - Tab in WKWebView: the Keyboard navigation setting was not checked, and the Return trick stood in.
  - G20–G22 at 424149a (carried from 2941f2c).
- **Note:** WKWebView's storage is shared with the installed app. I toggled the rail and left it expanded, as I found it.
- **Reviewer:** hw4-ui, 2026-10-03

## Notes
Runs in parallel with header-fold-3; boundaries disjoint.
- boundary widened by sup28: SlackView.tsx, FR-24 focus only
- 0076 ruled (Pablo): the cell's state folds into "+N" last, after problems, now and live; waiting and blocked never fold and keep a 2-character + ellipsis floor.
- On Decisions at 1024x640 the rule box is moved up to fit and covers the lower half of its own Rule (existing placement); the head stays marked.
- The empty-column track uses a CSS space toggle (`--t-next: ;`): G24 should look at it in WKWebView.
