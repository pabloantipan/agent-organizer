---
title: Decisions and zoom polish - focus kept at the zoom's ends, a sticky axis, finds open their sections, honest empty and hidden counts
status: now
repos: [organizer]
branch: zoom-decisions-polish
updated: 2026-10-03
next: "review: zoom-decisions-polish, U1 fixed at b7e8671 (Stages zooms its frame, not the page; Chromium and WKWebView), gate L1-L8 and L0 still met"
depends_on: []
boundary: ["frontend/src/components/TimeZoom.tsx, frontend/src/styles/time-zoom.css, frontend/src/lib/axis.ts and its tests", "frontend/src/components/DecisionsView.tsx, frontend/src/styles/decisions.css (FR-2 to FR-8 only)", "frontend/src/lib/ and its tests", "testdata/fixture-overlay/", "not: scripts/fixture-home.sh, testdata/fixture-twenty/, global.css, rule-box.css, RuleDecisionBox.tsx, StageRoadmap.tsx, header-fold-3's and home-widths-4's files, Go, docs/design-system.md"]
spec: "docs/specs/leftovers-4.md (FR-1 to FR-8); the ranking docs/ux/reviews/2026-10-03-rank-leftovers-4.md (Aglaea, 94308ad); the design system as amended there"
gate: "docs/specs/leftovers-4.md Acceptance, rows L1 to L8 and L0"
ui_review: true
review: pass
seat: zdp-build
---

## Goal
The first half of sup27's leftovers, the part free of sup28's files.

## Gate
- [x] L1-L8: see `docs/specs/leftovers-4.md`, Acceptance
- [x] L0: see `docs/specs/leftovers-4.md`, Acceptance

## Done
- 2026-10-03 zdp-build: U1 fixed (b7e8671, `.tz-wrap { min-width: 0 }`), rebased on adb2969 (branch now 5394ed9..b7e8671). Stages at Days, 1512x945, rail expanded: Chromium page scrollWidth 1262 = clientWidth, frame 1206 wide scrolls 3632, Today moves it 0 -> 2239; WKWebView no page-wide scrollbar, Today moves the frame. Cards (Days, Hours) and Decisions (Days) unchanged, no page overflow. Stages offers no Hours in the fixture (no timed mark), so Hours on Stages is not measured. L0 green. Shots `*-U1-*` in .wt-notes/zdp-build
- 2026-10-03 zdp-build: FR-1 to FR-8 on zoom-decisions-polish (68dfc40, bf224db, a011b9d, 73f7b57, 5d5abfa, 28f581a), rebased on 7f49158; L1-L8 and L0 measured, rows and shots in .wt-notes/zdp-build/progress.md
- 2026-10-03 sup29 launched by the FSE
- 2026-10-03 0075 ruled by pablo (accept as written)
- 2026-10-03 cut from leftovers-4 by the FSE

## Next

## Blockers

## Notes
Runs beside sup28's header-fold-3 and home-widths-4: disjoint files.
- L8 in WKWebView failed first: macOS's autocorrect bubble over the find took the first Escape. Fixed in DecisionsView (28f581a, spelling off on the field); none of rule-box.css, RuleDecisionBox.tsx or global.css was needed, so nothing went to sup29.
- Keyboard rows ran with Keyboard navigation and classic scrollbars passed to the built app as arguments (`-AppleKeyboardUIMode 2 -AppleShowScrollBars Always`, the argument domain), so the machine's settings were not changed; a UI reviewer can do the same.
- L2 needs ~74 records and the fixture has 8 at most: it ran on a run-time copy of this repo's 76 records inside the fixture home, not committed. A large-decisions fixture would make L2 repeatable.
- Found, not asked: ruling a record while Ruled is closed leaves focus on the page body (afterRule focuses the record's line, no longer rendered); Focus and names says never the body.
- FR-2 makes only the Decisions Timeline's axis stick to the page at Fit; Roadmap's Cards and Stages keep their axis in the frame.

## Review
- Verdict: code review pass at b7e8671 (rebased on adb2969). L0 rerun here: make test (go ok, vitest 158), npm run build, wails build all pass. L1-L8 still met. The rebase brought in no new files and the commits are the same.
- U1 fix: one line, `.tz-wrap { min-width: 0 }` in time-zoom.css, inside the boundary. Cards and Decisions are not hit because there the wrapper is a block, not a grid item.
- Unmet gate items: none.
- Boundary: 8 files, all inside; decisions.css only adds the Fit axis rule, no `!important` touched.
- Outside the gate: (1) on the L7 shots the stuck Ruled heading cuts a band through the capped rule box (z-order), so it is not this diff; it belongs to markdown-and-labels FR-12. (2) Ruling while Ruled is closed drops focus to the body (the builder found this too). (3) A landing during a find, into a section hand-closed during that find, keeps the section closed (findHand outranks visit). (4) L2 is not repeatable: no 74-record fixture. (5) `.tz-labelcol` hard-codes 240 px twice in CSS beside `LABEL_W`. (6) No gate row zooms Stages, which is how U1 got through both reviews.
- Reviewer: zdp-review, 2026-10-03

## UI review
- Run: 28f581a (detached worktree `.wt/zdp-ui`, removed after), default fixture plus a run-time, uncommitted initiative `init-many` holding this repo's 76 records (73 on the Timeline, 3 superseded or withdrawn hidden). Chromium: `wails dev -devserver localhost:34495`, headless, viewport = window less 32 px (1512×945 → 1512×913). WKWebView: `wails build`, the built app started with `-AppleKeyboardUIMode 2 -AppleShowScrollBars Always` (argument domain; the machine's settings untouched), window shot with `screencapture -l`. Rail expanded (250 px) in every row. Shots in `.wt-notes/zdp-ui/`.
- Recheck at b7e8671 (rebased on main; the fix is `min-width: 0` on `.tz-wrap`), fresh detached worktree, same port and method, fresh fixture (no `init-many`: L2 was not rerun), rail expanded, 1512×945.
- Verdict at b7e8671: **pass**. U1 fixed in both engines; L1 and L5 still hold. No severity 4 or 3 open. U2-U4 stand (sev 2 and 1, recorded, not a fail); R2 below is new, sev 1.
- Verdict at 28f581a (first round): fail, on U1 (sev 3). Every gate row L1-L8 held as written (L8's ruling clause not verified); the fail was a regression FR-7 brought into the Stages graph.

### Findings
- **U1 (sev 3, fixed in b7e8671) Stages can no longer be zoomed.** Recheck: Chromium, init-a Stages at Days: frame 1,206 px, its scrollWidth 3,632, page scrollWidth 1,262 = clientWidth; with the frame scrolled to 0 (today at x = 3,079), Today moves the frame to 2,239 (today at x = 840); stage names stay pinned at x = 286. WKWebView: the frame carries its own classic scrollbar, no page scrollbar; scrolled back to 1 Aug, Today brings it to the week of 3 Oct. Stages has no Hours (its marks have no time of day; + disables at Days), so Hours on Stages does not exist to check. Shots: `chromium-1512x945-U1-recheck-stages-days-today.png`, `webkit-1512x945-U1-recheck-stages-days.png`, `…-days-scrolled-left.png`, `…-days-today.png`. First round: What he cannot do: on Roadmap › Stages, at Days or Hours the frame stops scrolling itself; the page scrolls sideways instead, Today and the arrows move nothing, and the stage names scroll away with the lane. Where: `webkit-1512x945-R1-stages-days.png`, `…-today-pressed.png`, `chromium-1512x945-R1-stages-days-today-pressed.png`. Evidence: Chromium, init-a Stages at Days: `.tz-frame` 54,732 px wide, then 88,663; `.board-wrap` scrollWidth 54,768 vs clientWidth 1,262; after Today the frame's scrollLeft stays 0 and today sits at x = 3,079. Same in WKWebView (a page-wide classic scrollbar, Today changes nothing). Cause: FR-7's new `.tz-wrap` is a grid item of `.srm` (`display: grid`) with the default `min-width: auto`, so it grows to the lane; the frame used to be the grid item, and its `overflow: auto` gave it a zero minimum. Setting `min-width: 0` on `.tz-wrap` in the page brought the frame back to 1,206 px and the page's scrollWidth to 1,262 (no overflow). Cards and Decisions are not hit (their host is a block): Decisions at Days 1,193 px, no page overflow. Against: time-zoom's behaviour (`specs/roadmap-time-zoom.md`, Stages is one of its three graphs), DS Timeline and "a body never widens its view". Proposal: `.tz-wrap { min-width: 0; }` in `time-zoom.css` (this card's file), and an L-row that zooms Stages.
- **U2 (sev 2) After "Show the other 66" the focused control is out of view.** What he cannot do: a keyboard user presses Enter on "Show the other 66"; focus stays on the toggle, now "Show only the newest ten" under 76 rows, ~3,000 px below, and WKWebView does not scroll to it, so nothing on screen shows focus. Where: `webkit-1512x945-L8-show-all.png`. Evidence: no ring in view after the press; the next Enter collapsed the list, so focus was on the toggle. Against: Focus and names (focus visible, 2.4.7). Proposal: keep the toggle's place on screen (scroll it into view with `block: "nearest"` after the list grows), or move focus to the eleventh record.
- **U3 (sev 1) The hidden count does not say whether the hidden match.** Under the find "supersede", Ruled reads `2 of 76` (one is superseded 0001) and Timeline `1 of 73 · 3 hidden`; the reader cannot tell that one of the 3 hidden matched. `webkit-1512x945-L3-many-find-hidden-count.png`. As ranked (row 9 asked the control's count), so a spec gap, not a defect: while a find is on, `· 1 of 3 hidden matches` would add up.
- **U4 (sev 1, from code, not measured) A hand toggle during a find is stored.** `handToggle` calls `setDecSection` while filtering too, so closing a section that a find opened writes it to storage; FR-4 says a find stores nothing, FR-5 that storage holds hand toggles. Spec gap for the FSE: which wins.
- **R2 (sev 1, new at b7e8671) On Stages the frame's ring stops 12 px short of the lane.** The ring (`.tz-wrap::after`, −4 px) ends at x = 1,480 while the frame, through the existing `.srm .tz-frame` right margin of −16 px, runs to 1,492: the ring cuts across the lane's last 12 px, and the frame's scrollbar runs past it. `chromium-1512x945-U1-recheck-stages-days-frame-focused.png`. Cards is whole (L5). Proposal: move that negative margin onto `.tz-wrap` in Stages, or drop it.
- Seen, not this card's: Cards at Fit, "QA sign-off", "Port to canonical" and "target 1 Oct" overlap on the axis (row 10, markdown-and-labels); the stuck rule box at 1024×640 shows a classic horizontal scrollbar in WKWebView (row 14, markdown-and-labels); at Hours on Cards, "Nothing in this window. Today" shows while today's line is in the window (time-zoom's empty-window rule counts marks, not today).

### Gate rows
| Row | Window, rail | Chromium | WKWebView | Result |
|---|---|---|---|---|
| L1 | 1512×945, expanded; Keyboard navigation on (argument) | `chromium-1512x945-L1-days-focus-out.png` (Stages, Days is its deepest), `…-L1-hours-focus-out.png`, `…-L1-fit-focus-in.png` (Cards): activeElement Zoom out at Hours, Zoom in at Fit, `:focus-visible` and `tz-moved`, 2 px #8a3ffc ring | `webkit-1512x945-L1-fit-focus-in-start.png`, `…-L1-days.png`, `…-L1-hours-focus-out.png`, `…-L1-back-days.png`, `…-L1-fit-focus-in.png`: Tab to +, Return twice: ring on − at Hours; Return twice: ring on + at Fit | pass |
| L2 | 1512×945, expanded | `chromium-1512x945-L2-timeline-scrolled-600.png`: init-many, 76 records; after +600 px heading 121-161, axis 161-214, first row under it 0024 | `webkit-1512x945-L2-timeline-top.png`, `…-L2-timeline-scrolled-600.png`: axis under the heading, rows pass under | pass |
| L3 | 1512×945, expanded | `chromium-1512x945-L3-drafted-nothing-ruled.png`, `…-find-opens.png` (To rule and Timeline hand-closed, find "cell": both open, `2 of 2`), Escape: back to closed, storage `{"rule":false,"ruled":true,"timeline":false}` before and after; `…-L3-many-find-hidden-count.png`: `Timeline · 1 of 73 · 3 hidden` | `webkit-1512x945-L3-drafted-nothing-ruled.png`, `…-closed-by-hand.png`, `…-find-opens.png`, `…-cleared-layout-back.png`, `…-L3-many-find-hidden-count.png` | pass |
| L4 | 1512×945, expanded | `chromium-1512x945-L4-landed-ruled-open.png` (init-a Overview gate 0001, Ruled hand-closed: opens, focus on 0001's line), `…-L4-back-ruled-closed.png` (Work, back: closed); storage unchanged throughout | `webkit-1512x945-L4-ruled-closed-by-hand.png`, `…-landed-ruled-open.png`, `…-back-ruled-closed.png` | pass (storage read in Chromium only) |
| L5 | 1512×945, expanded; classic scrollbars (argument) | `chromium-1512x945-L5-hours-frame-focused.png`, `…-lane-end.png`: labels no outline, label column one `--surface` band 403 px, ring on `.tz-wrap::after` at −4 px, whole | `webkit-1512x945-L5-hours-frame-focused.png`, `…-lane-end.png`: ring whole, horizontal scrollbar below "now" and the last tick; no vertical scrollbar arose at this height, so the right padding was not tested against one | pass |
| L6 | 1512×945, expanded | `chromium-1512x945-L6-no-ruler.png`: text `… · no ruler recorded · Sep 22 …`, name `0001 A ruling nobody signed, ruled, “leave it”, no ruler recorded, …` | `webkit-1512x945-L6-no-ruler.png`: text; the name not read in WebKit | pass |
| L7 | Chromium 1024×580 content and 1024×480 content, expanded; WK 1024×640 (the window minimum, content ≈609) | `chromium-1024x580c-L7-box-stuck-fits.png`: box 316 px under a 332 px cap, fits once stuck, Rule and Cancel inside; `chromium-1024x480c-L7-box-scrolls.png`: cap 232, scrollHeight 316, Rule and Cancel inside, no horizontal overflow | `webkit-1024x640-L7-box-open.png`, `…-box-stuck.png`: fits, Rule and Cancel inside; taller than its room not reachable (window minimum), error line not reachable without ruling | pass at 1024×480 content; the row's own size does not make the box taller than its room with this fixture |
| L8 | 1512×945, expanded; Keyboard navigation on (argument) | `chromium-1512x945-L8-slash-find.png` (`/` from a heading focuses the field, no `/` typed), Escape clears, focus stays in the field; `…-L8-newest-ten.png`: Enter on "Show the other 66" → 76 rows, Enter on "Show only the newest ten" → 10, focus on the toggle | `webkit-1512x945-L3-drafted-find-opens.png` (`/` then "cell"), `…-L8-escape-cleared.png`, `…-L8-show-all.png`, `…-L8-newest-ten.png` | pass; clause 4 not verified (U2 seen here) |

Recheck at b7e8671 (1512×945, rail expanded; Keyboard navigation and classic scrollbars passed as arguments):
| Row | Chromium | WKWebView | Result |
|---|---|---|---|
| L1 | `chromium-1512x945-L1-recheck-hours-focus-out.png`, `…-L1-recheck-fit-focus-in.png`: Zoom out focused at Hours, Zoom in at Fit, `:focus-visible`, `tz-moved`, 2 px #8a3ffc | `webkit-1512x945-L1-recheck-fit-start.png`, `…-hours-focus-out.png`, `…-fit-focus-in.png` (crops `crop-webkit-…`): ring on − at Hours, on + back at Fit | pass |
| L5 | `chromium-1512x945-L5-recheck-hours-frame-focused.png`: frame focused, ring on the wrapper whole, 0 labels outlined, label column one band 403 px, foot 32 px, page not widened | `webkit-1512x945-L5-recheck-hours-frame-focused.png`, `…-lane-end.png`: ring whole, classic scrollbar under the "now" label, no mark under it | pass |

### Spec gaps (for the FSE)
- L7 at 1024×580 content does not produce a box taller than its room with this fixture (316 ≤ 332), and the built app cannot go below 640; an error line needs a refused ruling. A record with more options, or a fixture error, would make the row reachable in both engines.
- No gate row zooms Stages, which is how U1 passed the gate.
- U3 and U4 as above: the hidden count under a find, and whether a hand toggle during a find is stored.
- L2 still rests on a run-time copy (76 records), as the builder noted.

### Not verified
- L8 clause 4 (a record ruled while Ruled is closed leaves To rule): needs a ruling, which this seat may not make, even in the fixture.
- L6's accessible name and L4's storage in WKWebView (no DOM access in the built app; both read in Chromium).
- S4: Pablo's WebKit and Caches storage for `cl.antipan.organizer` was copied aside to `.wt-notes/zdp-ui/webkit-before/` at 19:31 before the first launch and is **left there unrestored on sup29's instruction** (sup29 owns the restore). Both rounds wrote `rail.collapsed.strip`, `decisions.sections` and `initiative.header.open` into that shared store; his Deltagos (pid 51980) ran throughout and was not touched.
- Reviewer: zdp-ui, 2026-10-03 (recheck at b7e8671 the same day)
