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

## Notes
- Boundary widened by sup33 for P4: HelpView.tsx takes useScrollEdges on .help-doc, help.css its edge rules. Help's side edge not exercised: the real help_doc has no pre wider than its column.
- WKWebView not verified: driving the review build means synthetic clicks on the shared desktop, which was in use; the UI reviewer shoots P1-P4 and P8 there (P8's count repaint is WKWebView-only).
- lib/boxStack.ts is outside the boundary, so the "box below" for focus return is a registry in RuleDecisionBox.tsx (focusBoxBelow).
- Fixture 0010 adds one Needs me row.
- 2026-10-04 sup33 widened the boundary for P4's Help row: `HelpView.tsx` takes `useScrollEdges` on `.help-doc` (wiring only), `help.css` its scroll-edge rules and the sheet's z-index line, nothing else in either. Help's side edge is not exercised: the real help doc has no pre wider than its column.
