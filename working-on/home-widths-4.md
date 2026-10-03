---
title: Home widths, fourth pass - empty columns give way first, urgent signals never fold, wide measured on the row; Escape, the opener, names
status: now
repos: [organizer]
branch: home-widths-4
updated: 2026-10-03
next: "review: home-widths-4, G19-G23 and G8 met; G24 is the UI reviewer's"
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
- 2026-10-03 hw4-build: FR-20 to FR-25 on home-widths-4, rebased on 9048507 (6362137, 0aca68a, 1b84824, 09f0bec, 94e31f5, 78599ee, e522b2e); G19-G23 measured before and after the rebase, G8 green (make test, npm run build, G18 grep empty, wails build); evidence and choices in .wt-notes/hw4-build/progress.md. G24 left unticked for the UI reviewer
- 2026-10-03 sup28 launched by the FSE (decisions-view and time-zoom-2 in done/)
- 2026-10-03 0074 ruled by pablo ("Ok", accept as written, 117e269)
- 2026-10-03 cut from responsive-home amendment 4 by the FSE

## Next

## Blockers

## Notes
Runs in parallel with header-fold-3; boundaries disjoint.
- boundary widened by sup28: SlackView.tsx, FR-24 focus only
- The cell-in-definition signal folds into "+N" last, after problems, now and live. Only waiting and blocked never fold, since at 1440 the signal column (218 px) cannot hold waiting, blocked and the cell whole. G19 does not name the cell; at 1440 and 1512 it is in "+N".
- On Decisions at 1024x640 the rule box is moved up to fit and covers the lower half of its own Rule (existing placement); the head stays marked.
- The empty-column track uses a CSS space toggle (`--t-next: ;`): G24 should look at it in WKWebView.
