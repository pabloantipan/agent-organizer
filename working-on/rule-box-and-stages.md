---
title: Escape closes the top box only, a rule box never covers its opener, stage landings show their detail, duplicate stage ids said plainly
status: next
repos: [organizer]
branch: rule-box-and-stages
updated: 2026-10-04
next: "review: rule-box-and-stages, gate met (M1-M3, M8, M0; M1 in WKWebView); branch rule-box-and-stages c4967d5..6591145, rebased on main ddbd02b"
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
