---
title: Record bodies never widen the view, dimmed by token not opacity, no cut axis label, the rule box's own placement
status: now
repos: [organizer]
branch: markdown-and-labels
updated: 2026-10-03
next: "review: markdown-and-labels, gate met (L9-L12, L0; U1, U2 and the stagger fixed)"
depends_on: [header-fold-3, home-widths-4, zoom-decisions-polish]
boundary: ["frontend/src/components/DecisionsView.tsx (the record body's render only, FR-9 as amended)", "frontend/src/styles/global.css (.markdown and .dec.* rules only)", "frontend/src/styles/rule-box.css, frontend/src/components/RuleDecisionBox.tsx, frontend/src/styles/decisions.css (the !important placement only)", "frontend/src/components/TimeZoom.tsx, frontend/src/lib/axis.ts, frontend/src/components/StageRoadmap.tsx (axis labels only)", "frontend/src/lib/ tests", "testdata/fixture-overlay/, scripts/fixture-home.sh", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-4.md (FR-9 to FR-12); the ranking docs/ux/reviews/2026-10-03-rank-leftovers-4.md (Aglaea, 94308ad); the design system as amended there"
gate: "docs/specs/leftovers-4.md Acceptance, rows L9 to L12 and L0"
ui_review: true
review: pass
seat: mal-build
---

## Goal
The second half of sup27's leftovers, the part that shares files with
sup28's cards and with zoom-decisions-polish.

## Gate
- [x] L9-L12: see `docs/specs/leftovers-4.md`, Acceptance
- [x] L0: see `docs/specs/leftovers-4.md`, Acceptance

## Done
- 2026-10-03 mal-build, after the UI review: U2 (the today label's room is now narrowed by the grid that clips it, 50dbf12), U1 (RecordBody writes the body's DOM only when its HTML changes and keeps code block and table offsets, 8e5e0b7), FR-11 as amended (colliding milestone titles stagger up a row of their text height while the axis has room; ticks under them give way, 8f38ab4). Branch rebased on main 8b91827. L10 in Chromium (rail expanded, overlay bars): all four states plus Days at its edges, cut 0, overlap 0, no title hidden; today on Decisions Fit flips (901-937 in a room ending at 973). L10 in WKWebView (classic bars): Stages, Cards Fit, Cards Days, Decisions Fit shots, today whole, "Port to canonical" on the second row. L12: Chromium scrollLeft 300 for 40 s with 0 body mutations (before the fix 4 rewrites in 25 s); WKWebView body pixels identical at 10, 20, 30, 40 s with the block scrolled right. L0 green, wails build after wails dev. Evidence: .wt-notes/mal-build/progress.md
- 2026-10-03 FSE amended FR-9 (body keeps its scroll across refreshes, L12; boundary adds DecisionsView.tsx's body render) and FR-11/L10 (titles stagger, never skip; the DS Timeline as amended 59b4dcb), from mal-ui U1-U3
- 2026-10-03 mal-build: FR-9 to FR-12 on markdown-and-labels (e16320a, 88d2384, ebf35bd, 92e766b, 058578f, on main 752630c); L9 and L10 measured in Chromium at a 1024x640 window, L9 with rail expanded and strip, L10 expanded: no scroller bar, the code block scrolls inside, superseded lozenge 6.67:1, no cut or overlapping axis label; L11 in the built app (WKWebView, classic scrollbars): capped box has no horizontal bar, no !important left in decisions.css; L0 green. Evidence and choices: .wt-notes/mal-build/progress.md
- 2026-10-03 sup30 launched by the FSE (its three dependencies in done/)
- 2026-10-03 0075 ruled by pablo (accept as written)
- 2026-10-03 cut from leftovers-4 by the FSE

## Next

## Review
- Verdict: code review pass (mal-review, 2026-10-03), on 058578f.
- Unmet gate items: none. L9: `.markdown :where(pre, table)` scrolls inside; 0006 carries 0032's yaml byte for byte; scroller 774 = 774, pre 702 of 1055 (rail expanded and strip); superseded row opacity 1, lozenge 6.67:1. L10: placement on rendered boxes (`placeAxisLabels`, `shiftInside`, `skipStep` by `seriesIndex`), JSON cut 0 and overlapping 0 in all eight states. L11: `.rb.capped` with `overflow-x: hidden`, no inline place while capped (the dropped place held only position, top/left/right, maxHeight, all of which the old `!important` overrode), WKWebView crop shows the vertical bar only, `grep important decisions.css` empty. L0 rerun by me: make test, vitest 161, npm run build, wails build pass.
- Outside the gate: (1) FR-10 contradicts L9: "the lozenge keeps its tokens" (`--done`) reads 2.05:1, so the builder dropped the lozenge's colour rule; the spec should be amended, Pablo's call. (2) That removal is a `.badge.dec-status` rule, at the edge of "`.dec.*` only". (3) A milestone title can now be hidden whole ("Port to canonical" at Fit), left to its hover title; no gate row says whether that is acceptable. (4) `.markdown table` is `display: block` everywhere, card backs and Help included. (5) `placeAxisLabels` measures the DOM after every render. (6) S4 not kept: the builder's runs wrote into Pablo's app's WebKit storage.

## UI review
- Run: mal-ui, 2026-10-03, detached worktree at 058578f (branch head), fixture from that clean checkout. Chromium: `wails dev -devserver localhost:34499`, headless, viewport 1024×609 (the 1024×640 window's content). WKWebView: `wails build` of 058578f, window set to 1024×640 by System Events (reached exactly), run once with `-AppleShowScrollBars WhenScrolling` (overlay) and once with `Always` (classic); window shots by `screencapture -o -l`. Shots: `.wt-notes/mal-ui/`.
- **Verdict: fail**, on U1 (sev 3, FR-9). L10 is also not met as written (U2, sev 2 by itself).
- **U1 (3) The tail of a wide code line cannot be read for more than a few seconds.** What: a record body's code block now scrolls inside itself (FR-9), but every 1–10 s it snaps back to its start, so a person scrolling right to read "…which wait on business and which on him" loses the place mid-line, again and again. Where: Decisions, 0006 expanded, both engines (`webkit-1024x640-L9-expanded-overlay-pre-hscrolled.png` then `…-head-hscroll.png`). Evidence: WKWebView, three runs, scrolled offset gone after 1.6, 8.0 and 1.0 s (pixel diff of the line); Chromium, a MutationObserver on `.markdown.dec-text` saw its 29 children replaced 3 times in 20 s and 5 times in 35 s with byte-identical HTML, the old `pre` disconnected and `scrollLeft` back to 0 (the body is re-set on the periodic refresh, `DecisionsView.tsx:284`). Before this card the page itself scrolled, so the remedy is what exposes it. Proposal: keep the body's DOM across refreshes (render it only when its HTML changes, or keep and restore the `pre`'s `scrollLeft`); `DecisionsView.tsx` is outside this card's boundary, so the FSE widens it or cuts a line for it.
- **U2 (2) "today" reads "toda" on Decisions at Fit.** What: the today label is clipped by the grid. Where: Decisions › Timeline at Fit, rail expanded, 1024×640 window, Chromium and WKWebView overlay and classic (`chromium-1024x640-L10-expanded-decisions-fit-today-cut.png`, `webkit-1024x640-L10-expanded-*-decisions-fit.png`). Evidence: label text box 936–966 px, `.tz-grid` (overflow hidden) ends at 958; `placeAxisLabels` checks against the frame's inner edge (982), not the grid's, so the label is neither flipped nor moved. Strip rail: fits by 4 px (918–954), so it passes there by luck. Severity: the word is guessable, but L10 names exactly this state and the code review's "cut 0" missed the clip. Proposal: measure the room as the grid's right edge (or put the today label outside the clipping grid), then flip.
- **U3 (2) At Days, today's column and its two neighbours have no date.** What: the milestone title "target 1 Oct" hides the day labels Thu 1, Fri 2, Sat 3 (it sits 11 px lower and overlaps them vertically), and no "October" context shows, so the reader cannot tell what day today is from the axis. Where: Cards at Days, rail expanded, both engines (`*-L10-expanded-*-cards-days.png`). Evidence: DOM, 28 labels hidden, shown ticks jump from Wed 30 to Sun 4. Not a cut or an overlap, so L10 holds; the design system says overlapping labels skip one in two, and here three in a row go for one title. Proposal: a mark's title on its own line above the ticks (Roadmap.tsx's rows, outside the boundary; the builder's note says the same for Fit's Sep and Oct).
- **U4 (2) A cut code line gives no sign that it scrolls.** What: with overlay scrollbars the line simply stops mid-word ("…from the ap"); the bar is at the block's foot, a screen below. Where: 0006 at 1024×640, both rail states (`chromium-1024x640-L9-expanded-pre.png`, `webkit-1024x640-L9-expanded-overlay-pre.png`). Evidence: the `pre` has no border, shadow or mask; the design system's Widths says a region that scrolls inside a view shows each edge with content past it (1 px `--fg-subtle`). Proposal: that edge line on `.markdown pre` while scrollable.
- U5 (1) the today line runs through "target 1 Oct" at Cards Fit; U6 (1) in WKWebView overlay the Decisions Fit ticks are all shown with ~5 px between them ("10 Aug17 Aug" reads as a run), Chromium skips one in two; U7 (1) Stages' appetite boxes end in an ellipsis ("two wa…"), as before this card.
- Held, measured: superseded lozenge 6.67:1 computed (Chromium), 6.14:1 from WKWebView pixels (overlay and classic); title and meta `--fg-muted` 7.89:1, row opacity 1. The scroller never scrolls sideways (Chromium 963/963 strip, 759/759 expanded; WKWebView no bar in classic, horizontal wheel moves nothing). Capped rule box: `.rb.capped`, no inline place, `overflow-x: hidden`, scrolls vertically with Cancel and Rule pinned inside when made taller than its room (textarea dragged 250 px), no horizontal bar in either scrollbar mode. Home's Needs me box at 1024×640: fixed placement unchanged, record scrolls inside, opener's Rule uncovered. Help's tables (now `display: block`) 725/725, no scroll.

| Row | State | Chromium (content 1024×609) | WKWebView (window 1024×640) | Result |
|---|---|---|---|---|
| L9 | rail strip | `chromium-1024x640-L9-strip-pre.png`, `…-strip-widestline.png`, `…-strip-superseded.png`; scroller 963/963, pre 1055/891, lozenge 6.67:1 | not shot (Pablo's remembered rail is expanded; strip not toggled in the built app) | met in Chromium; WKWebView not verified for strip |
| L9 | rail expanded | `chromium-1024x640-L9-expanded-pre.png`; scroller 759/759, pre 1055/687 | overlay `webkit-1024x640-L9-expanded-overlay-pre.png`, `…-pre-hscrolled.png`, `…-superseded.png` (6.14:1); classic `…-classic-pre.png`, `…-classic-pre-own-bar.png`, `…-classic-superseded.png` (6.14:1) | met as written; U1, U4 |
| L10 | rail expanded | `chromium-1024x640-L10-expanded-stages.png`, `…-cards-fit.png`, `…-cards-days.png`, `…-decisions-fit.png`, `…-decisions-fit-today-cut.png`; strip `…-strip-decisions-fit.png` | overlay `webkit-1024x640-L10-expanded-overlay-{stages,cards-fit,cards-days,decisions-fit}.png`; classic `webkit-1024x640-L10-expanded-classic-{stages,cards-fit,cards-days,decisions-fit}.png` | **not met**: today cut on Decisions at Fit in all three (U2); Stages, Cards Fit and Days: no cut, no overlap |
| L11 | rail expanded | `chromium-1024x640-L11-expanded-capped.png` (box 364 in 361 room) | overlay `webkit-1024x640-L11-expanded-overlay-capped-scrolled.png`, `…-hwheel.png`; classic `webkit-1024x640-L11-expanded-classic-capped.png`, `…-capped-taller.png` | met; `grep important decisions.css` has no placement |

- Spec gaps (FSE): (a) which wins on one axis line, a mark's title or the tick labels under it (U3, the builder's Sep/Oct note); the design system's "skip one in two" does not cover a title hiding three ticks; (b) FR-9 does not say a scrolled body keeps its offset across refreshes, nor names the edge line Widths asks for (U1, U4); (c) U1's fix sits in `DecisionsView.tsx`, outside this card's boundary.
- Not verified: L9 strip in WKWebView (above); a withdrawn record (the fixture has none; same rule as superseded); keyboard (no row asks); the document-level scroll seen on Home in both engines (scrollHeight 806 in 609, a page bar in classic WKWebView) is leftovers-5's top item, not this card's.
- WebKit state: copied `~/Library/WebKit/cl.antipan.organizer` and `~/Library/Caches/cl.antipan.organizer` to `.wt-notes/mal-ui/webkit-before/` before the first launch. Pablo's Deltagos (pid 51980) was running at the end, so I did not restore: the copy stays there. My runs opened init-a, Decisions sections, Roadmap Cards/Stages and record 0006/0008 in that shared storage; I did not toggle the rail.

## Blockers

## Notes
- FR-10's "the lozenge keeps its tokens" cannot meet L9: --done on the badge tint reads 2.05:1 without any opacity. The superseded and withdrawn lozenges now keep the neutral badge's tokens (--fg-muted, 6.67:1); --fg-subtle measured 4.49:1.
- Ticks under a milestone title give way (FR-11 as amended): at Fit Sep and Oct, at Days Oct 1 to Sat 3 under "target 1 Oct" (U3 stays the FSE's). The stagger needed no file outside the boundary: it is an inline bottom on the title, set by TimeZoom.tsx.
- WKWebView L10 and L12 ran with classic scrollbars only (a mouse is attached); overlay was not rerun after the fix.
- Pablo's Deltagos was running, so its WebKit storage was not restored: the copy taken before the first launch is in .wt-notes/mal-build/webkit-before/; the runs wrote rail and Decisions section state into the shared storage.
