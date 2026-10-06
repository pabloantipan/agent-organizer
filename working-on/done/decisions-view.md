---
title: Decisions as the operator's main view - find, a summary line, sections that fold, the Timeline last and closed
stage: one-window
status: done
repos: [organizer]
branch: decisions-view
updated: 2026-10-03
next: "none: merged 2fd42fa"
depends_on: [header-fold-2, time-zoom]
boundary: ["frontend/src/components/DecisionsView.tsx (page frame, summary, find, section headings, Ruled's limit, Timeline row label and position; dec-line's sticky head and its name, Amendment 1 (0074); not the record body, the Timeline's axis, marks or zoom)", "its CSS", "frontend/src/lib/ and its tests (find match, summary words, turnaround words)", "frontend/src/stores/board.store.ts (the three sections' remembered open state only)", "testdata/ fixtures the gate rows need", "not: Go, the rule box, InitiativeHeader.tsx, Roadmap*.tsx, docs/design-system.md, ~/agent-slack"]
spec: "docs/ux/specs/decisions-view.md (Aglaea, 9386d15, with the FSE's Technical notes); the review docs/ux/reviews/2026-10-03-decisions-view.md (D1-D7)"
gate: "docs/ux/specs/decisions-view.md Acceptance B1-B11, and B12-B14 (Amendment 1, 0074), plus the tests row below"
ui_review: true
seat: dv-build
review: pass
---

## Goal
The Decisions sub-view fit for the operator who spends most of his time in
it: rule what waits, check what he just ruled, find an old ruling, see the pace.

## Gate
- [x] B1-B11: see `docs/ux/specs/decisions-view.md`, Acceptance
- [x] B12-B14: Amendment 1 of the same spec (0074)
- [x] `cd frontend && npm test` passes with tests for the find match, the summary line's cases and the turnaround words; `go test ./...` green; `wails build` succeeds

## Done
- 2026-10-03 sup27 ended: seats killed and tokens revoked, worktree and branch removed; run record runs/2026-10-03-decisions-view-and-time-zoom-2.md (~45 min against 0074's 40-75, ~$32)
- 2026-10-03 merged to main 2fd42fa by sup27 after the code review (pass) and the UI review (pass at 7c4f1e0, after U1); make test and npm run build green on main
- 2026-10-03 dv-build: U1 fixed (7c4f1e0): the capped rule box on a stuck head scrolls inside itself, foot pinned; 1024x580 Chromium scrollHeight 348 > clientHeight 332, foot inside the box (.wt-notes/dv-build/u1-1024x580.log); branch rebased on main, make test, npm run build, wails build green
- 2026-10-03 dv-build: built on decisions-view (5907cff lib, 32941c1 store, e056cba view); B1-B14 measured in headless Chromium against the fixture and a 74-record copy, numbers and shots in .wt-notes/dv-build/progress.md; make test, npm run build, wails build green
- 2026-10-03 sup27 launched by the FSE (0072, 0074 ruled, accept as written)
- 2026-10-03 Aglaea's Amendment 1 (2b6d608) adds the sticky record head and the line's name (B12-B14); proposed in 0074
- 2026-10-03 0072 ruled by pablo (accept as written; the four jobs stand)
- 2026-10-03 cut by the FSE from Aglaea's review and spec (9386d15)

## Next

## Blockers

## Review
Verdict: pass (code review; the UI review is separate).
Unmet gate items: none. B1-B14 shown by the diff, the vitest cases (find, summary's 0/1/n/today/no-week, turnaround, line name says "waiting" once, limit, stored sections) and the shots in .wt-notes/dv-build/; make test (go + 115 vitest), npm run build and wails build re-run green on e056cba.
Findings outside the gate:
- global.css loses the old .dec-stats and h2 rules: the page's own dead CSS, but global.css is not named in the boundary.
- decisions.css places RuleDecisionBox in a stuck head with !important over its inline fixed placement; it breaks silently if the box changes. Move it into the box in a later card.
- B13's cap is not exercised: the box fit the room in the shot. The cap is in the code, but no measurement checks it.
- The line's name says "by no one named" where the visible text shows "—" (label-in-name).
- A wide code block in a body overflows beside the sticky heading at 1024 (header-fold-2's body).
- Evidence is headless Chromium only; the UI reviewer should shoot WKWebView.
- No gate row checks `/`, Escape clearing, "Show only the newest ten", or a ruled record leaving To rule while Ruled stays closed.
Reviewer: dv-review, 2026-10-03.

## UI review
Run: branch decisions-view at e056cba, detached worktree; re-review of B13 and U1 only at 7c4f1e0 (rebased on main), the other rows stand from e056cba; fixture (`scripts/fixture-home.sh`) and a copy of this repo's 74 records under a temp root (plus one tall proposed stand-in, 0075, raised today, added to the copy only for B2-one, B12 at 600 px and B13). Chromium: wails dev :34431 + private headless Chromium. WKWebView: `wails build`, the built app on the same configs, window shots with `screencapture -l`. Shots, drivers, logs: `.wt-notes/dv-ui/`.
Verdict: **pass** at 7c4f1e0 (was fail at e056cba on U1, fixed); no sev 4 or 3 open.

Findings:
- **U1 (sev 3, fixed in 7c4f1e0) the rule box on a stuck head spills its Cancel and Rule out of the box in the built app at 1024×640.** Can't: rule a tall record at the minimum window with Rule and Cancel inside the box; they sit half below its edge, over the record's text. Where: `webkit-1024x640-B13-rule-box-stuck-0075.png` (bottom edge of the box crosses the footer; the yaml line runs through Rule). Evidence: the stuck variant caps `.rb` with `max-height: var(--dec-box-max)` but `.rb` keeps `overflow-y: visible` (decisions.css `.dec-head.stuck .rb`; rule-box.css `.rb`), so a capped box overflows instead of scrolling. Chromium, same state: 1024×640 box 356 px, cap 392 (fits); 1024×609 (the built app's content height at a 640 window, 31 px title bar) cap 361 (fits by 5 px); 1024×580 cap 332, scrollH 340, footer 8 px outside the box (`cap.log`, `chromium-1024x580-B13-cap-measured.png`). WKWebView reaches the cap at 1024×640 because its scroller also loses a horizontal scrollbar to U3. Cancel still took the click (`webkit-1024x640-B13-after-cancel-click.png`). Against §8 ("capped there and scrolls inside itself") and B13. Proposal: in the stuck variant give `.rb` `overflow-y: auto` (or cap the options and words and keep the foot pinned), and add a gate measurement with the box taller than its cap (an error line, or 1024×580 in Chromium). **Outcome (7c4f1e0):** the stuck `.rb` scrolls (`overflow-y: auto`, `overscroll-behavior: contain`) and its foot is sticky at the box's bottom. Chromium 1024×580: box capped 332 of scrollH 364, wheel scrolls the box (scrollTop 0→32) and not the page (690 both), foot [511,563] inside box [231,563], Cancel and Rule hit-tested on top, head unchanged (line 161-199, Rule 199-227), Escape back to Rule (`cap-rr.log`, `chromium-1024x580-B13-rr-box-open-top.png`, `-rr-box-scrolled.png`); 1024×640 fits uncapped (`chromium-1024x640-B13-rr-box-open-top.png`). WKWebView 1024×640 on 0075 after 600 px: the box is capped with its own scrollbar, scrolls to the words, Cancel and Rule on the box's ground, Cancel closes it, the head stays (`webkit-1024x640-B13-rr-head-stuck.png`, `-rr-box-open.png`, `-rr-box-scrolled.png`, `-rr-after-cancel.png`).
- **U2 (sev 2) "no match" with no find typed.** Can't: read why Ruled is empty on an initiative with nothing ruled; it reads like a filter he forgot. Where: `webkit-1024x640-B2-2-waiting.png`, `chromium-1512x945-B2-2-waiting.png` (init-drafted, `Ruled · 0` / "no match"). Evidence: `pastHits.length === 0 ? noMatch` runs whether or not a filter is on. §2 uses "no match" only while filtering. Proposal: "Nothing ruled yet." when nothing is ruled and no find is on (spec gap G1).
- **U3 (sev 2, the record body, header-fold-2's) a wide code block widens the page.** 0032's yaml runs past the record: in WKWebView the whole Decisions scroller gets a horizontal scrollbar and text shows to the right of the sticky headings (`webkit-1024x640-B12-scrolled-600.png`); Chromium shows the leak too (`chromium-1024x640-B13-rule-box-stuck.png`, "wit" top right). It also takes room from U1. Proposal: `pre` in `.dec-text` scrolls inside itself (`overflow-x: auto; max-width: 100%`).
- **U4 (sev 2, not this card's CSS) superseded and withdrawn pills read at ~1.5:1.** `webkit-1512x945-B8-landed-0003.png`, pixel-measured on "superseded" (global.css `.dec.superseded` opacity .7 over `--done`). WCAG 1.4.3. Now inside Ruled's list, so seen more. Proposal: drop the row opacity or lift the pill's text token.
- **U5 (sev 1) Ruled and Timeline count different totals under one find.** "Ruled · 1 of 74" beside "Timeline · 1 of 71" (`chromium-1512x945-B7-find-69.png`): Ruled counts superseded and withdrawn, the Timeline hides them by default. Proposal: none needed if the FSE accepts it; else count the Timeline over all and show the hidden ones as "+3 hidden".
- **U6 (sev 1) a landing remembers the section it opened.** After B8, storage holds `ruled: true`. §6 only protects "other sections", so this is within the letter; spec gap G2.

- **U7 (sev 1, from the fix) a horizontal scrollbar inside the capped box in WKWebView.** `webkit-1024x640-B13-rr-box-open.png`: a thin horizontal bar under the foot; likely the foot's negative side margins widening the scroll area now that the box scrolls. Nothing hidden. Proposal: `overflow-x: hidden` on the stuck `.rb`.
| Row | Result | Chromium | WKWebView |
|---|---|---|---|
| B1 | pass: summary and 3 rows in view (rows end 398 of 945 / 640) | `chromium-1512x945-B1-3-waiting.png`, `chromium-1024x640-B1-3-waiting.png` | `webkit-1512x945-B1-3-waiting.png`, `webkit-1024x640-B1-3-waiting.png` |
| B2 | pass: n (`3 to rule, the oldest for 13 days (0002)`), 2, one raised today (`1 to rule, raised today (0075) · 50 ruled this week`), none (`Nothing to rule · 50 ruled this week`), none this week (fixture); no tiles, no median, no dash | `chromium-1512x945-B2-2-waiting.png`, `chromium-1512x945-B2-1-waiting-raised-today.png`, `chromium-1512x945-B6-default-top.png` | `webkit-1512x945-B2-2-waiting.png`, `webkit-1024x640-B2-1-waiting-raised-today.png`, `webkit-1512x945-B6-default-top.png` |
| B3 | pass: record expanded, line at 178 under the stuck heading (169), focus on its line | `chromium-1024x640-B3-after-summary-link.png` | `webkit-1024x640-B3-after-summary-link.png` (expanded, under heading; focus not readable) |
| B4 | pass: mouse on To rule, Enter on Ruled, Space on Timeline; aria-expanded matches; same after relaunch | `chromium-1512x945-B4-before-relaunch.png`, `chromium-1512x945-B4-after-relaunch.png` (and 1024) | `webkit-1512x945-B4-focus-ring-ruled.png`, `webkit-1512x945-B4-before-relaunch.png`, `webkit-1512x945-B4-after-relaunch.png` (keyboard by Option-Tab, see N2) |
| B5 | pass: Ruled heading at the scroller top (121) mid-Ruled | `chromium-1024x640-B5-mid-ruled.png`, `chromium-1512x945-B5-mid-ruled-show-all.png` | `webkit-1512x945-B5-mid-ruled-show-all.png` |
| B6 | pass: 74 records, default state, scrollHeight 842 / view 824 at 1512×945 (1.02) | `chromium-1512x945-B6-default-top.png`, `-end.png` | `webkit-1512x945-B6-default-top.png`, `-end.png` (thumb ~1.06 views) |
| B7 | pass: `69` and `0069` → 0069 alone; `rail group` → 0036, 0029; Escape clears; `/` focuses; no-match line and Clear | `chromium-1512x945-B7-find-69.png`, `chromium-1512x945-B7-find-rail-group.png`, `chromium-1512x945-find-no-match.png` | `webkit-1512x945-B7-find-69-ruled-open.png`, `webkit-1512x945-B7-find-rail-group-ruled-open.png`, `webkit-1512x945-B7-after-escape.png`, closed-section count `webkit-1512x945-B7-find-69.png` |
| B8 | pass: Ruled closed, Timeline label 0003 → Ruled opens, all 74 shown, line at 166 below heading 161, focus on it | `chromium-1024x640-B8-landed-0003.png`, `chromium-1512x945-B8-landed-0003.png` | `webkit-1512x945-B8-landed-0003.png` |
| B9 | pass: h2, 16px, 600, count after the words, order as description | `chromium-1512x945-B1-3-waiting.png` (computed in `fix.log`) | `webkit-1512x945-B1-3-waiting.png` (visual; computed style not readable) |
| B10 | pass: 0032 (same day) no turnaround; 0001 `after 3 days`; no "0d"/"1d" | `chromium-1512x945-B10-same-day-0032.png` | `webkit-1512x945-B1-3-waiting.png` (`after 3 days`); same-day row in `webkit-1512x945-B6-default-top.png` |
| B11 | pass: rows 28 px, one line, status in title and name | `chromium-1512x945-B11-timeline-open.png` | `webkit-1512x945-B11-timeline-open.png` (28 px pitch; name not readable) |
| B12 | pass: 0075 at 1024×640, +600 px: line 161, Rule 199-227 under heading 121-161; past the end it leaves with the record | `chromium-1024x640-B12-landed.png`, `-scrolled-600.png`, `-past-end.png` | `webkit-1024x640-B12-landed-0075.png`, `webkit-1024x640-B12-scrolled-600.png`, `webkit-1024x640-B12-past-end.png` (fixture 0002) |
| B13 | pass at 7c4f1e0 (fail at e056cba, U1): head does not move, box under Rule, capped and scrolling inside itself with Cancel and Rule in it | `chromium-1024x580-B13-rr-box-open-top.png`, `chromium-1024x580-B13-rr-box-scrolled.png`; before: `chromium-1024x580-B13-cap-measured.png` | `webkit-1024x640-B13-rr-box-open.png`, `webkit-1024x640-B13-rr-box-scrolled.png`; before: `webkit-1024x640-B13-rule-box-stuck-0075.png` |
| B14 | pass: every waiting line's name says "waiting" once | `fix.log` | not verified in WKWebView: the name is not readable from a window shot |

Spec gaps for the FSE:
- G1 Ruled with nothing ruled and no find: no words defined (U2).
- G2 §6: whether the section a landing opens stays remembered open (U6).
- G3 §8 names the cap but no gate row measures a box taller than its room; B13's check passes whenever the box happens to fit.
- G4 the gate's sizes are content sizes in Chromium; the built app at a 1024×640 window has 609 px of content (title bar) and, with U3, a horizontal scrollbar. Name window or content size in rows.
- G5 a find whose hits are all in closed sections shows only counts; §2 says so on purpose. Worth asking the operator whether typing should open them.
- G6 the Timeline's date axis scrolls away in a long Timeline (`webkit-1512x945-B5` earlier state; time-zoom's axis).

Not verified:
- All initiatives (summary over all, h1): no route reached from the expanded rail in either engine.
- WKWebView: focus position after B3/B8, accessible names (B11, B14), computed sizes (B9); shown visually only.
- The rule box with an error line at 1024×640 (needs a failed ruling; ruling is out of bounds).

Notes:
- N1 the built app shares WebKit storage with the installed Deltagos (same bundle id); the sections were left at their defaults at the end.
- N2 in WKWebView plain Tab does not reach buttons under macOS's default keyboard setting; Option-Tab does. App-wide, not this card.
Reviewer: dv-ui, 2026-10-03 (re-review of B13 and U1 at 7c4f1e0 the same day).

## Notes
- dv-build: the rule box in a stuck record head is placed by decisions.css (`.dec-head.stuck .rb`, `!important` over RuleDecisionBox's inline fixed placement), since the box's file is outside this card; a later card may move that into the box.
- dv-build: a record body with a wide code block (0032's yaml) overflows to the right, beside the sticky heading at 1024; the body is header-fold-2's.
- dv-build: measured in headless Chromium, not WKWebView.
Sequenced after header-fold-2 and time-zoom: all three touch DecisionsView.tsx.
