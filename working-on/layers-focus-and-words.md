---
title: One layer order (the card back above the rule box), focus back to the box below, the scrim under the top bar, blocked never folds, edges and words
status: next
repos: [organizer]
branch: layers-focus-and-words
updated: 2026-10-04
next: "review: layers-focus-and-words, P0 pass, P1-P8 pass in Chromium; WKWebView rows (P1-P4, P8) not verified, left to the UI reviewer"
seat: lf7-build
depends_on: [timeline-and-find-6]
boundary: ["frontend/src/styles/tokens.css (z-index tokens), global.css (.modal-backdrop and layer z-index), decisions.css, rule-box.css, home.css, time-zoom.css", "frontend/src/components/RuleDecisionBox.tsx, HelpView.tsx and CardDrawer.tsx (focus return and layer only), DecisionsView.tsx (Rule's name, FR-11), Home.tsx, TimeZoom.tsx, StageRoadmap.tsx (the sticky axis only)", "frontend/src/lib/width.ts, lib/axis.ts, lib/decisionsPage.ts, lib/useScrollEdges.ts and lib/ tests", "testdata/fixture-overlay/", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-7.md (FR-1 to FR-9); the ranking docs/ux/reviews/2026-10-04-rank-leftovers-7.md (Aglaea, adfce1e); the design system as amended there"
gate: "docs/specs/leftovers-7.md Acceptance, rows P1 to P8 and P0"
ui_review: true
review: pass
---

## Goal
sup31's leftovers, the severity-3 layer bug first.

## Gate
- [ ] P1-P8: see `docs/specs/leftovers-7.md`, Acceptance (all pass in Chromium; P1-P4 and P8 not verified in WKWebView)
- [x] P0: see `docs/specs/leftovers-7.md`, Acceptance

## Done
- 2026-10-04 lf7-build: review's FR-2 defect fixed (Help closed with no box returns focus to the top bar's Help button; Chromium 1512x945 and 1024x640, Escape and Close); no lib test, since the opener is read off the live DOM in HelpView and no new lib file is in the boundary
- 2026-10-04 lf7-build: FR-1 to FR-11 on branch layers-focus-and-words (12 commits, rebased on main 4242d2c, cfa6937 tip); P0 and P1-P8 pass in Chromium, WKWebView not driven; rows in .wt-notes/lf7-build/gate.md
- 2026-10-04 0078 ruled by pablo ("Ok", accept as written, 045ff78); sup33 launched by the FSE
- 2026-10-04 cut from leftovers-7 by the FSE

## Next

## Blockers

## Review
- Verdict: pass (code review; the WKWebView shots of P1-P4 and P8 are the UI reviewer's)
- Commit reviewed: cfa6937 (branch layers-focus-and-words)
- Unmet gate items: none
- Checked: every changed path inside the boundary plus sup33's Help allowance; no raw z-index in the changed files (grep); vitest 185 pass, `npm run build` pass, Go tests pass in a clean worktree once `frontend/dist` exists; P1-P8 against the builder's Chromium measurements (.wt-notes/lf7-build/gate.md) and the diff.
- Not gated, should be: Help closed with no rule box open loses focus. HelpView's opener effect runs after the mount effect focused Help's own Close, so it captures Close as the opener and the top-bar fallback never applies (FR-2's "else to the opener"; P2 only tests with a box). From a clean checkout `make test` fails at `go vet` (main.go embeds frontend/dist, which is not built yet). The Makefile is unchanged on this branch, but P0's "clean checkout" depends on build order.
- Reviewer: lf7-review, 2026-10-04
- Delta 41f1b77: pass. HelpView.tsx only, inside the boundary. The opener is read before Close takes focus, and `.help` is excluded, so a StrictMode re-run falls back to the top-bar Help button. The box case is unchanged because focusBoxBelow runs first. npm test 185 pass, npm run build pass.

## UI review
- Verdict: **fail**, on U1 (sev 3, P7). Everything else in the gate holds in both engines.
- Commits: P1, P3-P8 shot on cfa6937; P2 and Help-with-no-box shot on cfa6937 and again on 41f1b77 (sup33's move). Chromium = `wails dev` :34525 + headless Playwright; WKWebView = `make review-build` (`Deltagos Review.app`, cl.antipan.organizer.review) over fresh fixture homes, driven by AX and real pointer events, window captured with `screencapture -o -l`. Window sizes are window sizes (content = window − 31/32 px). Shots, JSON and drivers: `.wt-notes/lf7-ui/`.
- Reviewer: lf7-ui, 2026-10-04

**Findings**
- **U1 (sev 3) The fourth milestone of a crowd is invisible at Fit.** (1) The lead cannot tell that 22 Sep holds four milestones: "Support trained · +1" shows as "Support trained", and the "+1" with its "1 more: Billing switched on" hover can't be seen or pointed at. Before a6d8d21 the "+N" was a visible label of its own, so this is a regression. (2) init-many › Roadmap › Cards › Fit; `chromium-1024x640-P7-init-many-cards-fit.png`, `webkit-1024x640-P7-init-many-cards-fit-overlay.png` / `-classic.png`; the builder's own `lf7-build/chromium-1024x640-P7-fit-axis.png` shows it missing too. (3) `.tz-more` rect y=178 against the frame's clip top 190 (Chromium, at 1024 strip, 1024 expanded, 1512 and 1920; `elementFromPoint` hits `gantt-body`), and AX y=250 against frame top 262 (WK). Cause: the span is now appended inside the title, and global.css:354 `.g-mark span { position:absolute; bottom: calc(12px …) }` matches it, lifting it 12 px above and right of its title, out of the frame. The builder's P7 passed on DOM text, not on visibility. (4) 3: a dated milestone disappears with no sign, against FR-10/P7 ("+N" after the crowd's last title). (5) Make `.tz-axis .g-mark .tz-more` `position: static` (or scope the global rule to `.g-mark > span`), and check P7 by hit test at the "+N"'s centre.
- **U2 (sev 2) The Home rule box crushes a wide table instead of scrolling it.** (1) Ruling 0010 from Needs me, the lead reads "cli ent", "ph ase", "lodest ar.local", "scanne r proble ms". (2) Home › Rule init-a 0010 › more; `chromium-1024x640-P4-home-box-0010-more-table.png`, `webkit-1024x640-P4-home-box-0010-table-overlay.png` / `-classic.png`. (3) The table is 528 px (514 px with classic bars) with scrollWidth = clientWidth, so it neither scrolls nor shows an edge. `td` computes `overflow-wrap: anywhere`, inherited from rule-box.css:62 `.rb .rb-body`. The same table scrolls with its edges in the card back (540/750 px) and in the Decisions body. Nothing widens. (4) 2. (5) `.rb .rb-body table { overflow-wrap: normal }`, so the table scrolls sideways with its edge as the pre already does.
- **U3 (sev 2) While ruling at 1024×640, the box covers the record's card link** (for aglaea, A1). (1) With Rule open on a stuck record, the record's `w-wide` link sits under the box: about 6 px shows with overlay bars and none with classic bars, so opening the card back "from the record" (P1's own path) means Cancel first (the draft survives) or the keyboard. (2) `webkit-1024x640-P1-box-open.png`, `webkit-1024x640-P1-link-covered-classic.png`. (3) Box x 590-1020 against link x 584-624 (Chromium); with classic bars the box starts at 576. (4) 2. (5) Design call: anchor the box below the record's meta line, or leave the meta line's links outside its footprint.
- **U4 (sev 2, pre-existing, WK only) The words field takes macOS autocorrect.** (1) The ruling words the lead types can change silently: "words" became "Words" on blur. The first Escape after a correction is consumed by the system's correction bubble, so one P2 run needed three Escapes. (2) `webkit-1024x640-P2-home-esc-retry.png`; `p2-webkit-1024-home-cfa6937.txt` (rerun with uncorrected text passes). (3) AX value "words" before Help, "Words" after; the box stays open after Escape until a second one. (4) 2: the words are committed under `## Ruling`. (5) `autocorrect="off" autocapitalize="off"` on the words field (spec gap, G1).
- **U5 (sev 1) Dates still in ISO beside FR-8's words.** The Decisions record meta reads "raised 2026-10-04 by fse", Timeline row names read "raised 2026-09-26, ruled 2026-09-30", and Stages reads "done 2026-08-15". FR-8 covered Needs me only (G2).
- **U6 (sev 1) The card back scrolls on its backdrop with no edge at its foot** (for aglaea, A2). The backdrop's scrollHeight is 829 against 609 at 1024×640. Its pre and table carry edges; the drawer itself only runs off the window.

**Gate rows** (result per engine; rail and bars as shot)

| # | Chromium | WKWebView | Window, rail, bars | Commit | Result |
|---|---|---|---|---|---|
| P1 | `chromium-1024x640-P1-card-over-box.png`, `-after-escape`; `p1-chromium.json` | `webkit-1024x640-P1-card-over-box.png`, `-after-click.png`; `-card-over-box-classic.png`, `-after-click-classic.png` | 1024×640, strip, overlay (Cr, WK) + classic (WK) | cfa6937 | pass: the backdrop (z 40) is topmost over the box's Rule, the sticky heading and the top bar. The click closes only the card back; the box keeps its words; 0010 stays waiting; focus returns to the words field. No raw z-index in the touched files. Classic WK: the link was fully covered (U3), so the card back was opened by AXPress |
| P2 | `chromium-{1024x640,1512x945}-P2-{decisions,home}-help-over-box-{cfa6937,41f1b77}.png`; `p2-chromium-*.json` | `webkit-{1024x640,1512x945}-P2-{decisions,home}-{overlay,classic}-{cfa6937,41f1b77}-*.png`; `p2-webkit-*.txt` | 1024×640 strip (41f1b77 WK: expanded) and 1512×945 (Cr expanded, WK strip); overlay; classic WK at 1024 | both | pass: Help opens over the box with focus on Close; Escape → the words field; Escape → Rule's opener. With no box: body at cfa6937, the top bar's Help at 41f1b77, by Escape and by clicking Close (`help-nobox-chromium-41f1b77.json`, `webkit-1024x640-help-nobox-*-41f1b77.png`) |
| P3 | `chromium-{1024x640,1280x800}-P3-partner-payouts-classic.png` | `webkit-{1024x640,1280x800}-P3-partner-payouts-{classic,overlay}.png` | both sizes, expanded, classic (+ overlay WK) | cfa6937 | pass: "1 blocked" whole; waiting in "+3"/"+6" |
| P4 | `chromium-1024x640-P4-*`; `p4-chromium-1024x640-overlay.json`, `p4-home-more.json` | `webkit-1024x640-P4-{home-box-0010-*,card-back-w-wide-*,help-*}-{overlay,classic}.png` | 1024×640, strip, overlay (Cr, WK) + classic (WK) | cfa6937 | pass with U2, U6: every hidden side carries a #958ea2 edge (box record top/bottom, pre left/right in box, card back and Decisions, card back table, Help top/bottom); the box stays 400/560 px; the document never scrolls. Help's side edge not exercised |
| P5 | `chromium-1024x640-P5-{landing,scrolled-*}.png`; `p5-chromium.json` | `webkit-1024x640-P5-{landing,scrolled}-{overlay,classic}.png` | 1024×640, strip, overlay (Cr, WK) + classic (WK) | cfa6937 | pass: axis ticks at y=123 (Cr) / 196 (WK), topmost, through the scroller's end |
| P6 | `chromium-1024x640-P6-*`; `p6-chromium.json` | `webkit-1512x945-P6-next-date-tooltip-overlay.png`, `-home-overlay.png` | 1024×640 strip and 1512×945; overlay | cfa6937 | pass: "Rule 0009 Which machine…" / "Rule 0010 How wide…" in both trees; the cut "30 Nov due · …" shows "30 Nov · due · w-later" as a native tooltip (WK); Needs me reads "raised 4 Oct" |
| P7 | `chromium-1024x640-P7-init-many-cards-fit.png`, `-init-many-fit-*.png`, `-init-a-cards-{days,hours}.png`; `p7*-chromium.json` | `webkit-1024x640-P7-init-many-cards-fit-{overlay,classic}.png`, `-init-a-cards-{days,hours}-overlay.png` | 1024×640 strip/expanded, 1512, 1920; overlay (+ classic Fit WK) | cfa6937 | **fail (U1)** at Fit. Days and Hours pass: "Sun 4" / "13:00" in --accent-fg, with "today" / "now 13:45" above that column |
| P8 | `chromium-1024x640-P8-*`; `p8-chromium.json` | `webkit-1024x640-P8-{show-other,newest-ten,timeline-days,timeline-reopened,after-rule-ruled-closed}-overlay.png`, `-newest-ten-classic.png` | 1024×640, strip, overlay (+ classic toggle WK) | cfa6937 | pass: the toggle is whole at y 237 under the stuck "Ruled · 73" and focused. Days: 15 ticks kept, same first tick, after close and reopen. Ruling 0074 with Ruled closed repaints "To rule · 2", "Ruled · 74", the header and Needs me with no hover; focus lands on 0075 |

**Spec gaps (for the FSE)**
- G1: the words field's autocorrect (U4). The spec never says the lead's words are kept verbatim.
- G2: FR-8 put dates in words on Needs me only; the record meta, the Timeline names and Stages still read ISO (U5).
- G3: P7 is measured by text; a gate row about something visual should hit-test it (U1 passed the builder's check).
- G4: P1's "open a card back from the record" assumes the record's link is reachable with the box open; at 1024×640 it barely is (U3).

**Design questions (for aglaea)**
- A1 (U3): should the rule box keep the record's meta line (its card links) uncovered at compact?
- A2 (U6): does the card back, a drawer that scrolls on its backdrop, carry the scroll edge at its foot?
- A3 (pre-existing, seen in passing): at 1512×945 with the rail as a strip, WK Home's list stops about 200 px short of the window's right edge, while goals and "30 Nov due · …" are cut.

**Not verified**
- Keyboard Tab order in WKWebView: the macOS Keyboard navigation setting was not changed. Focus was read from the AX focused element after mouse actions and Escape.
- The first Help open right after a cold app launch reported no focused element once in each of two launches; later opens focused Close. Likely window activation, not the app.
- P6, and P7 at Days and Hours, with classic bars in WK; widths 1920 and 3440 in WK.
- Help's sideways edge: no wide pre in the real help doc.
- Note for sup33: one synthetic click meant for an off-screen button (y=1017) landed in another app's window (WhatsApp, not mine). Nothing was typed into it. The driver now refuses points outside its own window's content.

## Notes
- Boundary widened by sup33 for P4: HelpView.tsx takes useScrollEdges on .help-doc, help.css its edge rules. Help's side edge not exercised: the real help_doc has no pre wider than its column.
- WKWebView not verified: driving the review build means synthetic clicks on the shared desktop, which was in use; the UI reviewer shoots P1-P4 and P8 there (P8's count repaint is WKWebView-only).
- lib/boxStack.ts is outside the boundary, so the "box below" for focus return is a registry in RuleDecisionBox.tsx (focusBoxBelow).
- Fixture 0010 adds one Needs me row.
- 2026-10-04 sup33 widened the boundary for P4's Help row: `HelpView.tsx` takes `useScrollEdges` on `.help-doc` (wiring only), `help.css` its scroll-edge rules and the sheet's z-index line, nothing else in either. Help's side edge is not exercised: the real help doc has no pre wider than its column.
