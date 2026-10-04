---
title: Escape closes the top box only, a rule box never covers its opener, stage landings show their detail, duplicate stage ids said plainly
status: done
repos: [organizer]
branch: rule-box-and-stages
updated: 2026-10-04
next: "merged to main"
depends_on: [markdown-and-labels]
boundary: ["frontend/src/components/RuleDecisionBox.tsx, frontend/src/styles/rule-box.css", "frontend/src/components/HelpView.tsx and CardDrawer.tsx (their Escape only)", "frontend/src/styles/decisions.css (the box placement only)", "frontend/src/components/StageRoadmap.tsx", "frontend/src/lib/ and its tests", "testdata/fixture-overlay/", "not: home-signals-5's files, DecisionsView.tsx, Go, docs/design-system.md"]
spec: "docs/specs/leftovers-5.md; the ranking docs/ux/reviews/2026-10-03-rank-leftovers-5.md (Aglaea, 31f7ac9); the design system as amended there"
gate: "docs/specs/leftovers-5.md Acceptance, rows M1 to M3, M8 and M0"
ui_review: true
review: pass
seat: rbs-build
---

## Goal
leftovers-5 FR-1 to FR-6: the rule box's and the stages' rows.

## Gate
- [x] M1-M3: see `docs/specs/leftovers-5.md`, Acceptance
- [x] M8: see `docs/specs/leftovers-5.md`, Acceptance (amendment 1)
- [x] M0: see `docs/specs/leftovers-5.md`, Acceptance

## Done
- 2026-10-04 sup31: wave ended 12:06 (71 min against 0077's 40-80); run record runs/2026-10-04-leftovers-5-wave.md; every seat ended and its token revoked
- 2026-10-04 sup31: code review and UI review passed (rbs-review, rbs-ui); merged 54c006a to main; Q1 to aglaea, U1-U4 and the spec gaps to the FSE; card to done/
- 2026-10-04 rbs-build: FR-1 to FR-6 and FR-12 on branch rule-box-and-stages (c4967d5 Escape stack, lib/boxStack; 9680ac6 box below its opener's row, hover keeps the mark; 83a4f5b fixture 0009; 6591145 stage landing, duplicate ids, appetite after short bars). Gate met: Chromium on the clean-checkout fixture, rail expanded, overlay scrollbars (`.wt-notes/rbs-build/chromium-rows.log`); WKWebView in `Deltagos Review.app`, classic scrollbars: M1 Help over a box at a 2560x1305 window and a card back over a box on Decisions at 1512x945, M2 at 1024x640 (hw4-U6 state, stuck head) and wide Home's mark with the pointer in the box, M3 tile 4 and the duplicate rows, M8 box and bars (`webkit-*.png`); M0 green (make test, npm test and build, wails build). Choices and evidence: `.wt-notes/rbs-build/progress.md`
- 2026-10-04 0077 ruled by pablo ("go"); sup31 launched by the FSE
- 2026-10-03 amendment 1 of leftovers-5 adds M8 (from leftovers-6), proposed with 0077
- 2026-10-03 cut from leftovers-5 by the FSE

## Review
- Verdict: pass. Every changed path is inside the boundary (CardDrawer and HelpView touch only Escape; decisions.css only the box under a stuck head). M0 rerun in the worktree at 6591145: `XDG_DATA_HOME=$(mktemp -d) make test` green (go, vitest 166/166), `npm run build` green; wails build from the builder's log (m0-wails-build-2.log, review-build.log). M1-M3, M8 from the code and the builder's Chromium log and WebKit shots.
- Unmet: none.
- Not covered by the gate: on Decisions a card back opened over a rule box paints under the box and the sticky "To rule" heading (webkit-1512x945-M1-dec-card-over-box.png), so the box Escape skips is the one on top to the eye; on compact Home, Help cannot open over a rule box by pointer. The chromium-rows.log "head near the foot (hw4-U6)" block equals the landing block; the WebKit 1024x640 shot carries that state.
- Reviewer: rbs-review, 2026-10-04

## Next

## Blockers

## Notes
Runs in parallel with its pair; boundaries disjoint.
- Found, not asked (progress.md has the shots): on compact Home the scrim covers the top bar, so Help cannot open over a rule box by pointer (the click closes the box, words kept); M1 ran at a wide window. On Decisions a card back opened over a rule box paints under the box and the sticky "To rule" heading (the modal's stacking, global.css; Escape order is right). The WebKit document scroll (ranking row 1) showed once on compact Home; it is home-signals-5's FR-7.
- The WebKit copy-aside in `.wt-notes/rbs-build/webkit-before/` was not restored: Pablo's Deltagos was running at the end. Built-app rows used `Deltagos Review.app` (own bundle id); only `wails dev` ran under cl.antipan.organizer.

## UI review
2026-10-04, rbs-ui. Commit run: 6591145 (branch rule-box-and-stages, already holds main's review-build), from a detached worktree with a fresh fixture (`scripts/fixture-home.sh`). Chromium: `wails dev -devserver localhost:34505` and headless Chromium 1234 (viewport = content). WKWebView: `make review-build`, `Deltagos Review.app` started with the fixture's ORGANIZER_CONFIG and XDG_DATA_HOME, once with `-AppleShowScrollBars Always` (classic) and once with `WhenScrolling` (overlay); window shots with `screencapture -o -l`. Shots, drivers and logs: `.wt-notes/rbs-ui/`.

**Verdict: pass.** No severity 4 or 3 against FR-1 to FR-6 or FR-12. One severity 3 found (U1) is outside what this spec covers and predates the branch.

### Gate rows
Rail expanded in every row. Chromium ran with overlay scrollbars (headless default). Window 2560×1380 cannot be reached on this 3440×1440 screen: the built app reached 2560×1305 (still wide).

| Row | Check | Chromium | WKWebView | Result |
|---|---|---|---|---|
| M1 Help | Rule open on Home 0002, words typed, Help, Escape, Escape | 2560×1380 viewport: Esc 1 closes Help, box stays with "kept words"; Esc 2 closes box (`chromium-2560x1380-M1-home-*`) | 2560×1305 window, classic and overlay: same (`webkit-2560x1380-M1-{classic,overlay}-home-*`, classic run 2 has the words) | pass |
| M1 card | Decisions 0002 Rule, words typed, card `w-queued` from the record, Escape, Escape | 1512×945 and 2560×1380: card back closes first, box stays with its words; then the box closes (`chromium-*-M1-dec-*`) | 1512×945 window, classic and overlay: same (`webkit-1512x945-M1-{classic,overlay}-dec-*`) | pass (U1 on how it looks) |
| M2 Decisions | 1024×640, stuck head, Rule | 0008, 0009, 0002: `elementFromPoint` at the opener's Rule is that Rule; box top 240 below head bottom 236; head bg `#2f1b55` (`chromium-1024x640-M2-dec-*-stuck`) | 1024×640 window, classic and overlay: head whole, its Rule visible, box below the action row (`webkit-1024x640-M2-{classic,overlay}-dec-0002-stuck-open`). DOM check not available in the built app: by eye only | pass |
| M2 wide Home | pointer in the box | opener `rgb(47,27,85)` = `--surface-selected` with the pointer in the box, on the row and away; same at 1512 regular | 2560×1305, classic and overlay: opener pixel identical with and without the pointer in the box | pass |
| M3 landing | stage tile landing at 1024×640 | tiles 1–4: toggle below the axis, detail bottom within the view, focus on the toggle, no ring (`chromium-1024x640-M3-landing-tile*`) | tile 4, classic and overlay: detail whole below its toggle (`webkit-1024x640-M3-*-landing-tile4`) | pass |
| M3 duplicate | init-a's two `joins` rows | both read `Cards can't be joined: two stages are named "joins".`, no card links; console: no React warning (one 404 for a resource) | 1024×640 classic: both rows show the sentence (`webkit-1024x640-M3-classic-duplicate-row-{2,3}`) | pass |
| M8 box | 0009's rule box at 1024×640 | Decisions: box scrolls inside, Cancel and Rule pinned at its foot; Home (compact sheet): record scrolls, Rule and Cancel inside (`chromium-1024x640-M8-*`) | Decisions, classic and overlay: box scrolls, all eight options and the words reachable, Cancel and Rule stay inside (`webkit-1024x640-M8-*`) | pass (U3) |
| M8 bars | short Stages bars | 1024: "two waves" and "no appetite" after their bars, whole, inside the frame; "a week" fits inside; 1512: all three inside | 1024 classic and overlay: same | pass |

### Findings
- **U1 (3, pre-existing, outside this spec).** He cannot read or use a card back opened from the record he is ruling. Where: Decisions, a rule box open, the record's card link (`chromium-1512x945-M1-dec-card-over-box.png`, `webkit-1512x945-M1-classic-dec-card-over-box.png`). Evidence: the card back paints under the rule box and under the sticky "To rule · 5" heading, which cuts across its Next action; the box's Rule stays clickable over the card back. `.modal-backdrop` has no z-index (`global.css:232`), the box is z 20 and the headings z 5–6; none of these lines changed on the branch. Proposal: the modal layer above every in-view layer (a z-index token for overlays), or a card link inside a ruling hidden while the box is open. Not in FR-1 (its expected is the Escape order only) nor in this card's boundary: for the FSE.
- **U2 (2).** After Escape closes Help over a rule box, focus lands on the body, not on Help's opener nor in the box (Chromium, `A Esc1 ... BODY`). Design system, Focus and names: closing returns focus to the opener; an open box keeps the keyboard. Proposal: Help hands focus back to the control that opened it, or into the box below it.
- **U3 (2).** With overlay scrollbars, 0009's box shows six options and nothing says two more and the words field are below the foot (`webkit-1024x640-M8-overlay-dec-box-top.png`). Design system, Widths: a region that scrolls inside a view carries the `--fg-subtle` edge; overlay bars do not count. Proposal: the scroll edge on the box, as FR-9/FR-13 give the header and code blocks.
- **U4 (2, pre-existing).** A stage landing at 1024×640 scrolls the Stages axis away: the bars show without dates (`webkit-1024x640-M3-overlay-landing-tile4.png`). Design system, Timeline: the axis sticks while the rows scroll. Proposal: the axis sticky in the Stages view; the landing's floor already handles a sticky axis.

### Design questions (for aglaea)
- **Q1 (for aglaea).** At regular and compact the rule box's scrim covers the top bar, so Help cannot open over a rule box (a click on Help closes the box, words kept): FR-1's Help case exists only at wide. Is the top bar meant to be under the scrim, or should Help stay reachable while ruling?

### Spec gaps (for the FSE)
- M1 says what Escape closes, not that the box under a card back or Help is visually beneath it (U1), nor where focus goes after the top box closes (U2).
- M8 names Rule and Cancel inside the box, not a cue that the box scrolls (U3).

### Not verified
- M2's `elementFromPoint` in WKWebView: the built app has no inspector; verified by eye from the shots.
- M3 tiles 1–3 and the duplicate rows in WKWebView overlay; tile 4 and both duplicate rows in classic.
- React warnings in WKWebView (no console in the built app); Chromium only.
- 2560×1380 in WKWebView: reached 2560×1305 (screen height).
- Keyboard rows under macOS Keyboard navigation: not run (Escape only, sent as a key event).

### WebKit state
Built-app rows ran in `Deltagos Review.app` (bundle id `cl.antipan.organizer.review`); its storage under `~/Library/WebKit/cl.antipan.organizer.review` was left as is. `~/Library/WebKit/cl.antipan.organizer` was not touched. Chromium used its own profile, deleted after. wails dev, the app I started, the fixture stand-ins and the worktree are gone.
