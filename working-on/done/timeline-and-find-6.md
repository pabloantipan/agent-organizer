---
title: Today said at Days, focus after a ruling and after Show the other N, titles that stack, finds that store nothing
status: done
repos: [organizer]
branch: timeline-and-find-6
updated: 2026-10-04
next: "done: merged 8c6749c; leftovers (U1-U3, G1-G4, review notes) for the FSE"
depends_on: [rule-box-and-stages]
boundary: ["frontend/src/components/TimeZoom.tsx, frontend/src/lib/axis.ts and its tests, frontend/src/styles/time-zoom.css", "frontend/src/components/DecisionsView.tsx, frontend/src/styles/decisions.css", "frontend/src/components/RuleDecisionBox.tsx (the after-rule focus only)", "a new many-records fixture initiative under testdata/, scripts/fixture-home.sh (to lay it out)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-6.md (FR-1 to FR-7, FR-6a); the ranking docs/ux/reviews/2026-10-03-rank-leftovers-6.md (Aglaea, b582a27); the design system's Timeline as amended there"
gate: "docs/specs/leftovers-6.md Acceptance, rows N1 to N6 and N0"
ui_review: true
seat: tf6-build
review: pass
---

## Goal
The rest of sup29's and sup30's leftovers, free of leftovers-5's files once
rule-box-and-stages lands.

## Gate
- [x] N1-N6: see `docs/specs/leftovers-6.md`, Acceptance
- [x] N0: see `docs/specs/leftovers-6.md`, Acceptance

## Done
- 2026-10-04 sup32: code review pass, UI review pass (sev 4/3 none); merged to main 8c6749c, make test and npm run build green on main; seats ended
- 2026-10-04 tf6-build: built on timeline-and-find-6 (377dfea, c9ca911, f28f167, rebased on 8e515e9), gate met; evidence and choices in .wt-notes/tf6-build/progress.md
- 2026-10-04 sup32 launched by the FSE, rule-box-and-stages in done/
- 2026-10-04 0077 ruled by pablo ("go")
- 2026-10-03 cut from leftovers-6 by the FSE

## Next

## Blockers

## Review
- Verdict: pass (code and gate review; the WKWebView N1 row and the zoom-row shots are the UI reviewer's)
- Unmet gate items: none. N0 re-run in the worktree at f28f167: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0, `npm test` 183 passed, `npm run build` exit 0; `wails build` from the builder's log. N6: 76 records, generate.py re-run reproduces the committed tree byte for byte. N1-N5 from the diff and the builder's recorded JSON and shots. Boundary: every changed path inside it; RuleDecisionBox.tsx, decisions.css, Go and docs untouched.
- Not covered by the gate: FR-4's 12 px between tick labels holds at Fit and Hours only; Days keeps 4 px (N3 checks Fit alone), a spec deviation for the FSE/Aglaea to rule. "No <noun> in this window." without Today applies at every zoomed level with today in view, not only Hours (FR-6). At Days the today label hides the next two day ticks. `timelineCount` in lib/decisionsPage.ts is dead.
- Reviewer: tf6-review, 2026-10-04

## UI review
- Run: f28f167 (detached worktree `.wt/tf6-ui`, fresh `scripts/fixture-home.sh` homes: one for Chromium, a second for WKWebView). Chromium: `wails dev -devserver localhost:34515`, chrome-devtools in an isolated context, viewport = window − 32 px (the built app's title bar, measured), scrollbars classic (15 px, measured). WKWebView: `make review-build` → `Deltagos Review.app` (`cl.antipan.organizer.review`), launched with the fixture's `ORGANIZER_CONFIG`/`XDG_DATA_HOME`, once with `-AppleShowScrollBars WhenScrolling` (overlay) and once with `Always` (classic); window sized with System Events, captured with `screencapture -o -l`; macOS Keyboard navigation off (`AppleKeyboardUIMode` unset). No DOM in WKWebView: focus read by key probes (Return/Space on the focused control, Shift+Tab), tick gaps measured from pixels, storage from a copy of the bundle's `localstorage.sqlite3`. `~/Library/WebKit/cl.antipan.organizer` untouched (mtime 2 Sep before and after). Shots, drivers and logs: `.wt-notes/tf6-ui/`.
- Verdict: **pass**. No severity 4 or 3. Three severity 2 (U1 is a WKWebView miss of N2's "in view", U3 predates the card), two severity 1 for aglaea.
- U1 (2) **"Show only the newest ten" leaves its toggle under the sticky Ruled heading in WKWebView.** What he cannot do: after collapsing the 66, he cannot see the control he pressed or tell where he is; the list he was reading is gone and nothing marks his place. Where: Decisions › Ruled, init-many, 1440×900, rail full, overlay and classic (`webkit-1440x900-N2-decisions-show-only-newest-ten-{overlay,classic}.png`). Evidence: the toggle's dashed edge shows at y≈185 under "Ruled · 76", and the heading itself is pushed 12 px up under the tabs. Space then re-expands the list, so focus is on the toggle (`…-space-probe-overlay.png`), but it is not in view. In Chromium the toggle stays at y 415 and is topmost (`elementFromPoint`) because of scroll anchoring, which Safari 15 lacks. That is why the Chromium N2 rows pass. Severity 2, as the ranking rated row 3. Proposal: after the collapse, `revealInWrap` should measure once layout settles (next frame) and use the stuck heading's bottom, so the toggle lands below the heading. Check it in WKWebView with a probe, not only in Chromium.
- U2 (2) **A section heading's count can show a stale number in WKWebView.** What he cannot do: trust "Ruled · N". After three rulings with Ruled closed it still read "Ruled · 73" (76 on reopening, `webkit-…-N2-decisions-ruled-{reclosed,opened}-count-overlay.png`). On init-a it read "Ruled · 76", init-many's number, over four rows (`webkit-…-W2-decisions-init-a-ruled-count-stale-classic.png`). After ruling 0003 it read 5 where 6 were ruled (`…-W1-…-stale-5-classic.png`). Hovering or toggling repaints the right number (`…-W2-…-ruled-{closed,reopened}-classic.png`). Chromium showed the right count at once. A paint miss, not data: To rule's count in the same render was right. Not checked against the base build. Severity 2. Proposal: force a repaint of the sticky heading when its count changes (e.g. key the count span on the number), and add a WKWebView check after a ruling and after switching initiatives.
- U3 (2, **predates this card**: same on 8e515e9 in Chromium) **Closing and reopening the Timeline while zoomed blanks its axis.** What he cannot do: read when anything happened. The frame remounts at scrollLeft 0 while the zoom keeps its old window, so there are no ticks or gridlines, the context label says "September 2026" over July, and "today" is out of view, until he scrolls sideways (`webkit-1440x900-N4-decisions-days-axis-blank-after-find-classic.png`, then `…-axis-after-user-scroll-classic.png`). Chromium measured 18 visible ticks before and 0 after the close/reopen, at the branch and at the base. It is reached naturally in N4's flow (a section toggled during a find, then a landing). Proposal: on remount, restore the frame's scrollLeft from the zoom state, or reset the zoom to the frame. For the FSE as a leftover.
- Spec gaps (for the FSE): G1 N3's "three titles, then +1" exists only on Cards. Stages and Decisions draw no axis titles, so on those S1's "every zoom row per graph" covered tick gaps and the today line only. G2 N1's "context names the first whole month" cannot show a month change on Decisions: its window ends at today + 1 (scrolled to the end, the first whole day is Wed 30, September; `chromium-…-N1-decisions-days-scrolled-end.png`). G3 FR-2/FR-3 "in view" should say "whole and topmost at its centre, not under a stuck heading, in WKWebView": U1 passes every Chromium check. G4 the zoom rows name no window size except N3. I ran N1, N2, N4 and N5 at 1440×900 only.
- For aglaea: A1 (1) at 1024×640 with the rail as a strip, Cards at Fit puts 22 Sep's "+1" right against the today label, so the axis reads "+1 today" (`webkit-1024x640-N3-cards-fit-strip-overlay.png`). Should "+N" go before the title when the next thing to its right is today? A2 (1) at Days "today · Sun 4" starts at the line, mid-day, and runs over Mon 5 and Tue 6, whose ticks give way (`webkit-…-N1-stages-days-mid-sept-overlay.png`). Should the label sit over today's own column? (Days' 4 px tick gap is ruled, f8c3743, not raised.)
- Gate rows. Chromium: 1440×900 rail full (N3 also 1024×640, rail full and strip), classic. WKWebView: 1440×900 rail full (N3 also 1024×640, both rail states), overlay and classic. Shots are in `.wt-notes/tf6-ui/`. "pass*" means focus was read by a key probe.

| Row | Graph | Check | Chromium | WKWebView overlay | WKWebView classic |
|---|---|---|---|---|---|
| N1 | Cards | Days, today in view, mid-Sept / 1 Oct first | pass: `today · Sun 4`, September 2026 / October 2026 (`chromium-1440x900-N1-cards-days-{mid-sept,oct1-first}`) | pass (`webkit-1440x900-N1-cards-days-{today,oct1-first}-overlay`) | pass (`…-classic`) |
| N1 | Stages | same | pass (`chromium-1440x900-N1-stages-days-{mid-sept,oct1-first}`) | pass (`webkit-1440x900-N1-stages-days-{mid-sept,oct1-first}-overlay`) | pass (`…-classic`) |
| N1 | Decisions | Days, today in view, mid-Sept (1 Oct first unreachable, G2) | pass (`chromium-1440x900-N1-decisions-days-{mid-sept,scrolled-end}`) | pass (`webkit-1440x900-N1-decisions-days-today-overlay`) | pass (`…-classic`) |
| N2 | Decisions | rule with Ruled closed → next waiting line | pass: 0075, in view, topmost (`chromium-1440x900-N2-decisions-after-rule-next-waiting`) | pass* Return opened 0075 (`webkit-…-N2-…-after-rule-{next-waiting,enter-probe}-overlay`) | pass* init-a, 0003 (`…-classic`) |
| N2 | Decisions | none left → To rule heading | pass: `H2#dec-rule-h` (`chromium-…-N2-…-none-left`) | pass* Shift+Tab lands in the find field (`…-none-left{,-shifttab-probe}-overlay`) | pass* (`…-classic`) |
| N2 | Decisions | Show the other 66 → first revealed | pass: 0066 (`chromium-…-N2-…-show-the-other-66`) | pass* Return opened 0066 (`…-show-the-other-66{,-enter-probe}-overlay`) | pass* (`…-classic`) |
| N2 | Decisions | Show only the newest ten → toggle in view | pass (`chromium-…-N2-…-show-only-newest-ten`) | **miss, U1**: focused, under the heading (`…-show-only-newest-ten{,-space-probe}-overlay`) | **miss, U1** (`…-show-only-newest-ten-classic`) |
| N3 | Cards | Fit: 3 titles 18 Aug, 4 titles 22 Sep | pass: three rows, "+1" named "1 more: Billing switched on", no overlap (`chromium-1440x900-N3-cards-fit-three-and-four`, `chromium-1024x640-N3-cards-fit-railfull`) | pass (`webkit-1440x900-N3-…-overlay`, `webkit-1024x640-N3-cards-fit-strip-overlay`, A1) | pass (`webkit-1440x900-N3-…-classic`) |
| N3 | Cards | today line under titles (init-a "target 1 Oct") | pass: the title is topmost on the line (`chromium-1024x640-N3-cards-fit-railfull-init-a-todayline`) | not shot | not shot |
| N3 | Stages | Fit, tick gap ≥ 12 px (no titles, G1) | pass: min 12.4 px strip, 32.3 rail full | not shot at 1024 | not shot at 1024 |
| N3 | Decisions | Fit, 1024×640, tick gap ≥ 12 px | pass: min 12.6 px strip, 32.0 rail full (`chromium-1024x640-N3-decisions-fit-{strip,railfull}`) | pass: min 15 px strip, from pixels (`webkit-1024x640-N3-decisions-fit-{strip,railfull}-overlay`) | pass: min 14 px (`…-classic`) |
| N4 | Decisions | find "nightly" / "build box" count | pass: `Timeline · 1 of 73 · 1 more among 3 hidden` / `· 3 hidden` (`chromium-…-N4-…-find-hidden-match`) | pass (`webkit-…-N4-…-find-hidden-match-overlay`) | pass (`…-classic`) |
| N4 | Decisions | toggles during the find store nothing; clear restores | pass: `decisions.sections` byte-equal; clear brings back the stored layout | pass: sqlite copy equal before, after toggles, after clear (`webkit-N4-storage-*.txt`) | pass (`webkit-N4-classic-storage-*.txt`) |
| N4 | Decisions | land on 0012 in Ruled closed during the find | pass: Ruled opens, 0012 expanded, focused, topmost (`chromium-…-N4-…-landing-in-closed-ruled`) | pass (`webkit-…-landing-in-closed-ruled-overlay`) | pass, but the Timeline axis is blank (U3) (`…-classic`) |
| N5 | Cards | Hours, Today, no card in window | pass: `No cards in this window.`, no button (`chromium-1440x900-N5-cards-hours-today-empty`) | pass (`webkit-…-N5-cards-hours-today-empty-overlay`) | pass (`…-classic`) |
| N5 | Stages | Days, Tab into the frame | pass: ring 4 px outside the scrolling frame on every side (`chromium-1440x900-N5-stages-days-tab-ring`) | pass, Tab reaches the frame with Keyboard navigation off (`webkit-…-N5-stages-days-tab-ring-overlay`) | pass (`…-classic`) |

- Around it: Roadmap Calendar renders (`chromium-1440x900-regress-calendar`). Stages bars and the done/now rows are unchanged. The rule box opens below its opener's row, takes eight options (init-a 0009) and commits in both scrollbar kinds. Decisions' Timeline at Fit and Days scrolls as before.
- Not verified: DOM-level `activeElement` in WKWebView (read by key probes instead); the today-line-under-title row in WKWebView; Stages tick gaps at 1024 in WKWebView; any row at 1024 other than N3; Chromium with overlay scrollbars; Hours on Stages and Decisions (zoom-in disabled there, no timed marks, as 0070 says); whether U2 happens on the base build.

## Notes
- Days keeps 4 px between tick labels, not 12: a day column is 40 px and "Wed 30" ~35 px, so 12 px would drop every other day against the zoom spec's A2. 12 px holds at Fit and Hours. For the UI reviewer / Aglaea.
- N1's Decisions case with 1 Oct as first whole day was seen in Chromium only on the card's graphs that scroll that far (Cards, Stages); Decisions' window ends near today. In WKWebView: Cards both cases, Decisions mid-September.
- lib/decisionsPage.ts timelineCount is unused now (outside the boundary).
- Aglaea on the Days gap: 4 px at Days is right, every day labelled; the 12 px floor is for floating labels (Fit); design system f8c3743.
- Aglaea on UI review A1, A2: "+N" rides the crowd's last shown title; at Days and Hours "today"/"now" sits on the context row over today's column, today's tick in --accent-fg; design system 106a4bd, for the next leftovers ranking.
- For the FSE: UI review U1 (newest-ten toggle under the sticky Ruled heading in WKWebView, sev 2), U2 (stale section count in WKWebView, sev 2), U3 (Timeline axis blank after close/reopen while zoomed, sev 2, predates the card), G1-G4; code review: empty line without Today at every zoomed level, today label hides two day ticks at Days, timelineCount dead in lib/decisionsPage.ts.
