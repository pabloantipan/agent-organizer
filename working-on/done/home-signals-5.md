---
title: The document never scrolls; signals fold against floors in rendered width; the scroll edge visible; names and dates
status: done
repos: [organizer]
branch: home-signals-5
updated: 2026-10-04
next: "merged to main"
depends_on: [markdown-and-labels]
boundary: ["frontend/src/components/Home.tsx, frontend/src/styles/home.css", "frontend/src/styles/global.css (html, body; the .markdown scroll edge, FR-13)", "frontend/src/lib/width.ts and frontend/src/lib/ tests", "frontend/src/styles/shell.css (the scroll edge only), frontend/src/components/InitiativeHeader.tsx (useScrollEdges only)", "frontend/src/components/Conversation.tsx and SlackView.tsx (FR-10 names only)", "testdata/fixture-twenty/, scripts/fixture-home.sh", "not: rule-box-and-stages' files, Go, docs/design-system.md"]
spec: "docs/specs/leftovers-5.md; the ranking docs/ux/reviews/2026-10-03-rank-leftovers-5.md (Aglaea, 31f7ac9); the design system as amended there"
gate: "docs/specs/leftovers-5.md Acceptance, rows M4 to M7, M9 and M0"
ui_review: true
review: pass
seat: hs5-build
---

## Goal
leftovers-5 FR-7 to FR-11: row 1 first (the document never scrolls), then re-measure before folding changes.

## Gate
- [x] M4-M7: see `docs/specs/leftovers-5.md`, Acceptance
- [x] M9: see `docs/specs/leftovers-5.md`, Acceptance (amendment 1)
- [x] M0: see `docs/specs/leftovers-5.md`, Acceptance

## Done
- 2026-10-04 sup31: wave ended 12:06 (71 min against 0077's 40-80); run record runs/2026-10-04-leftovers-5-wave.md; every seat ended and its token revoked
- 2026-10-04 sup31: code review (and recheck at a7f32e4) and UI review passed (hs5-review, hs5-ui); merged 922276f to main; U1 to aglaea, U2 and G1-G4 to the FSE; card to done/
- 2026-10-04 hs5-build: rebased on main after rule-box-and-stages (54c006a); SHAs now 5db2b84, b98c80e, 36caa66, 938eea4, 7c2a94a, fb0f102, plus a7f32e4 (the edge wired in CardDrawer, RuleDecisionBox, HelpView); npm test (173), npm run build, make test, wails build green
- 2026-10-04 hs5-build: branch home-signals-5 (0a1efb1 document never scrolls, d960285 signals fold against floors, 90f2920 scroll edge --fg-subtle and later children, 4141954 markdown code/table edge, ca746ac names, 3b52e87 30 Nov), rebased on main; gate met, measurements and shots in .wt-notes/hs5-build/progress.md
- 2026-10-04 0077 ruled by pablo ("go"); sup31 launched by the FSE
- 2026-10-03 amendment 1 of leftovers-5 adds M9 (from leftovers-6), proposed with 0077
- 2026-10-03 cut from leftovers-5 by the FSE

## Next

## Review
- Verdict: pass (M4-M7, M9, M0 met; WKWebView rows M4, M5, M7 checked on code and the builder's shots, the UI reviewer shoots them).
- Unmet gate items: none.
- Finding (boundary): `frontend/src/lib/useScrollEdges.ts` is a new non-test file outside the card's boundary as written (`lib/width.ts` and `lib/` tests) and outside sup31's recorded widening (DecisionsView's import and one call); it is the hook moved out of `InitiativeHeader.tsx` so DecisionsView can share it (FR-13 "the same useScrollEdges"). The FSE to bless it or not; every other path is inside, DecisionsView is the import and one call.
- Checked: `XDG_DATA_HOME=$(mktemp -d) make test` and `npm test` (168) pass, `npm run build` passes in the clean worktree at 3b52e87; `wails build` from the builder's M0 log, not rerun.
- Recheck after the rebase onto main 54c006a (head a7f32e4): `git range-diff` shows the six commits unchanged (`=`); a7f32e4 adds the import and one `useMarkdownEdges(body, html)` call to CardDrawer.tsx (plus its body ref), RuleDecisionBox.tsx and HelpView.tsx (ref already there), as sup31 widened. It also gives `useMarkdownEdges` an optional `content` dependency in `lib/useScrollEdges.ts`, the file already flagged above. `make test` (exit 0), `npm test` (173) and `npm run build` pass at a7f32e4. Still pass, unmet: none. The three new call sites have no gate row and no measurement.
- Reviewer: hs5-review, 2026-10-04.

## UI review
- Commit run: 3b52e87 (detached worktree, clean fixture homes, default and `--twenty`), every row below. The branch moved to a7f32e4 during the review (rebase onto main, the six commits patch-identical by `git range-diff`, plus a7f32e4); rechecked at a7f32e4 in WKWebView: M4 (1024×640, 1512×945), M7's date and M9, all classic, rail expanded, same results.
- Verdict: **pass**. No severity 4 or 3. Ranking rows 2 and 5 re-measured in the built app: both gone (goal shown at 1280×800; "5 waiting" whole at 1024×640).
- Shots, logs, drivers: `.wt-notes/hs5-ui/` (`chromium-*.log`, `webkit-M4-check.log`, `webkit-M7-ax-names.log`, `tools/`). Chromium: headless, own profile, viewport = the window size named (so Chromium's content is ~32 px taller than the app's); headless draws no bars, so "classic" there is a forced 15 px `::-webkit-scrollbar`. WKWebView: `Deltagos Review.app`, window sizes exact (System Events), classic = `-AppleShowScrollBars Always`, overlay = `-AppleShowScrollBars WhenScrolling` (the machine's setting is unset); WKWebView has no inspector, so its rows are read from pixels and the macOS accessibility tree. Rail expanded in every row.

| Row | Check | Chromium | WKWebView | Result |
|---|---|---|---|---|
| M4 | wheel well past Home's end | 1024×640, 1280×800, 1512×945, classic: `scrollTop` 0 before, after 40 wheels and after `scrollTop = 9999`; html/body `overflow: hidden`; outer bar 0 (`chromium-M4.log`, `chromium-<w>x<h>-M4-end-expanded-classic.png`) | 1024×640, 1280×800, 1512×945 (+1920×1080 on `--twenty`), classic and overlay, both fixtures: the app's top bar band identical before and after (mean diff 0.000), no bar at the window's right edge beside the top bar; the list reached its end (`webkit-<w>x<h>-M4-<fixture>-expanded-<bars>-top/-wheeled.png`) | pass |
| M5 | `--twenty`, after the first `agents` event | 1024×640, 1280×800, 1920×1080, classic: 0 violations of floor or fold order over 21 rows; goal 204 px at 1280; cell shown 2 of 2 at 1920, 1 of 2 at 1024/1280 (`chromium-M5.log`, `chromium-<w>x<h>-M5-*`) | same sizes, classic and overlay (`webkit-<w>x<h>-M5-twenty-expanded-<bars>-p1…p6.png`): every waiting reads "N waiting" whole; partner-payouts at 1024 and 1280 classic: "5 waiting · you…" +6 (blocked, now, live, cell, problems folded), at 1280 overlay "5 waiting…", "1 blocked", +5; goal column at 1280 both; at 1920 "5 waiting…", "1 blocked", "cell in definition", +4 | pass (U1) |
| M6 | header Details at compact, content past an edge | 1024×640 classic: edge colours `rgb(149,142,162)` = computed `--fg-subtle`; top/bottom only where hidden; a child appended at the end and grown: bottom edge appears (`chromium-M6.log`) | 1024×640 classic and overlay: a 1 px line (pixel 138,130,151; the screen capture shifts the background too) at the bottom when open, both mid-scroll, top only at the end; "Scope out, more" pressed at the end: the bottom edge comes back (`webkit-1024x640-M6-*`) | pass |
| M7 names | Conversation's clear and hide | 1512×945: "Clear search", "Clear reply to fse", "Hide people" by role (`chromium-M7.log`) | 1512×945 classic, AX: `AXButton "Clear search"`, `"Clear reply to fse"`, `"Hide people"` (`webkit-M7-ax-names.log`) | pass |
| M7 date | init-a's row at 1512 | "30 Nov", 16 px high, `nowrap` | 1512×945 classic and overlay: `30 Nov` one line, 44×16 (`webkit-1512x945-M7-init-a-next-date-<bars>-crop.png`) | pass (U2) |
| M9 | 0008's YAML block at start and end | 1280×800 classic: start `edge-right` only, middle both, end `edge-left` only, kept after a refresh cycle; colour = `--fg-subtle` (`chromium-M9.log`) | 1280×800 classic and overlay: start right line only (x 1230 classic, 1244 overlay), end left line only (x 287), kept 7 s later (`webkit-1280x800-M9-*`) | pass |

- **U1** (2, for aglaea). What: at a compact window with the rail expanded and classic bars (1024×640, 1280×800), the one row with the most signals (partner-payouts) shows no "1 blocked"; red reaches him only through "+6" (hover, name) and the rail's count. Where: `webkit-1024x640-M5-twenty-expanded-classic-p1.png`, `webkit-1280x800-M5-twenty-expanded-classic-p1.png`. Evidence: seen; the floors do not fit (Chromium: signals cell 130 px at 1024, 170 at 1280; "5 waiting" + "1 blocked" + "+N" ≈ 174); with overlay bars at 1280 it shows. M5 allows it; the design system's "waits on you, blocked and waiting stay in view" does not. Proposal: a design call, not a defect against the gate: blocked before waiting's names when only one fits, or "+N" marked when it hides blocked.
- **U2** (1). What: Home's next date is cut to "due · …" at 1512 and its hover says `2026-11-30`, not what is due. Where: `webkit-1512x945-M7-init-a-next-date-classic-crop.png`; `Home.tsx` `NextDate` (`title={n.date}`). Evidence: seen, AX `"due · w-later"` in 36 px. Proposal: hover "30 Nov · due · w-later", the date in the same words as the cell.
- Spec gaps (for the FSE): G1 FR-11 says Home's next date, ranking row 12 said "dates on Home": Needs me's rows on Home still read `raised 2026-09-24`. G2 M5 lets blocked fold at compact against the design system's never-fold set (U1). G3 a7f32e4's edge in the card back, the rule box and Help has no gate row and no fixture body that scrolls sideways there (Help's tables fit at 1024; 0008's rule box shows no body), so a reviewer cannot reach it. G4 the branch was rebased mid-review; a UI review should be pinned to a commit or told when it moves.
- Outside this card, noticed: the open record's "Rule" on Decisions is named "Rule" alone in WKWebView's AX tree (Names: row verbs carry their row); the builder's note on a wide `pre` widening the rule box (rule-box.css).
- Not verified: `document.scrollingElement.scrollTop` in WKWebView (no inspector in the built app; M4 there is the top bar's pixels and the absent outer bar, scrollTop is Chromium's); M5 in WKWebView read from screenshots, not the DOM; the edge's computed colour in WKWebView (pixels only); FR-13 in CardDrawer, RuleDecisionBox and HelpView (G3); the rail as a strip (no row names it); M0 (the code reviewer's).
- WebKit state: only `cl.antipan.organizer.review` was used. I copied it aside to `.wt-notes/hs5-ui/webkit-review-before/` before my first launch and did not restore it: tf6-build's Review app ran on the same store between my runs, and restoring would discard its state. `~/Library/WebKit/cl.antipan.organizer` untouched; the instances I did not start (Pablo's, hs5-build's, tf6-build's) were left running. My app, wails dev, the stand-ins and `.wt/hs5-ui` are gone.
- Reviewer: hs5-ui, 2026-10-04.

## Blockers

## Notes
Runs in parallel with its pair; boundaries disjoint.
- sup31 on hs5-review's boundary finding: `lib/useScrollEdges.ts` is within the prompt (it allowed moving the hook to a new `lib/` file) and sup31's answer; the FSE was told.
- Boundary widened by sup31 (2026-10-04): one `useMarkdownEdges(el)` call and its import in `DecisionsView.tsx` (the record body, M9). Done in a7f32e4 for `CardDrawer.tsx`, `RuleDecisionBox.tsx` and `HelpView.tsx`: import plus `useMarkdownEdges(body, html)`; CardDrawer's body had no ref, so it also got `const body = useRef…` and `ref={body}`. The hook takes the content as a second argument because those bodies mount after their component does. `useScrollEdges` moved to `frontend/src/lib/useScrollEdges.ts`.
- Re-measure after row 1 (built app, classic): rows 2 and 5 still held, so FR-8 was built for both; the fold order on main was problems first, not live first.
- At 1024 and 1280 (rail expanded) partner-payouts' blocked folds into "+N" after live, now, problems and the cell, as M5 allows; at 1280 the goal keeps priority over a whole blocked (progress.md, Choices).
- Pablo's WebKit storage was copied aside to .wt-notes/hs5-build/webkit-before/ before the first launch and not restored: his Deltagos ran throughout, and none of my runs used his bundle id (my own copy, then Deltagos Review.app).
- Found: in the rule box a wide code block is not capped by its section (a forced 3,557 px `pre` widened `.rb .markdown` instead of scrolling), so its edge cannot show there; the wiring is in, the cap is `rule-box.css`'s (not mine). Help (a narrowed diagram) and the card back (an added wide block) show the edge (`.wt-notes/hs5-build/chromium-1280x800-M9-wiring.log`).
- Found: Needs me's row context still shows ISO dates ("raised 2026-09-20"); SlackView.tsx:90 and Conversation.tsx:717 X buttons are named by title only.
