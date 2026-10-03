---
title: Home widths, fourth pass - empty columns give way first, urgent signals never fold, wide measured on the row; Escape, the opener, names
status: now
repos: [organizer]
branch: home-widths-4
updated: 2026-10-03
next: "review: home-widths-4, G19 fixed (the cell never folds), G19-G23 and G8 met; G24 is the UI reviewer's"
review: fail
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
- 2026-10-03 hw4-build: code review fixes on home-widths-4, rebased on main 189680e (e02059b the cell in definition never folds, it takes its ellipsis; d570c7e one Escape closes only the topmost, Help or a card back first; 95ace22 People's hide named); G19 re-measured at 1440x900 and 1512x945 (.wt-notes/hw4-build/g19-fix.log), the Escape stack in esc-topmost.log, G22 in g22-fix.log; G8 green again
- 2026-10-03 hw4-build: FR-20 to FR-25 on home-widths-4, rebased on 9048507 (6362137, 0aca68a, 1b84824, 09f0bec, 94e31f5, 78599ee, e522b2e); G19-G23 measured before and after the rebase, G8 green (make test, npm run build, G18 grep empty, wails build); evidence and choices in .wt-notes/hw4-build/progress.md. G24 left unticked for the UI reviewer
- 2026-10-03 sup28 launched by the FSE (decisions-view and time-zoom-2 in done/)
- 2026-10-03 0074 ruled by pablo ("Ok", accept as written, 117e269)
- 2026-10-03 cut from responsive-home amendment 4 by the FSE

## Next

## Blockers

## Review
- **Verdict:** fail (code review). G20, G21, G22, G23 and G8 met; G24 is the UI reviewer's.
- **Unmet:** G19. Its Expected says "only problems/now/live are in +N" on the seven-signal row; g19-rebased.log shows "cell in definition [in +N, fold 3]" at 1440 and 1512 (Home.tsx passes `fold={FOLD.cell}`). FR-20 does not rank the cell, but the cell in definition is itself a Needs me row ("partner-payouts · payouts-fixture in definition"), so it waits on the lead and by FR-20's own reasoning should not fold. Either make it never fold (it then takes the ellipsis like waiting) or have the gate amended; that is a decision for Pablo, not a reviewer.
- **G8 rerun by the reviewer:** `XDG_DATA_HOME=$(mktemp -d) make test` green (148 vitest), `npm run build` ok, the G18 grep empty, `wails build` ok, at e522b2e.
- **Outside the gate:**
  - the Escape listener is now on `document` and the box no longer stops propagation: with Help or a card drawer open over a box (both listen on `document` too), one Escape closes both;
  - on Decisions at 1024x640 the box covers its own Rule (the element there is `DIV.rb`); FR-23 is met only because Decisions has no scrim;
  - People's hide button (`.rail-icon`) has no aria-label, only a title (the G22 log reads its name as "");
  - SlackView.tsx is outside the spec's boundary; widened by sup28 (Notes), so not a finding.
- **Reviewer:** hw4-review, 2026-10-03

## Notes
Runs in parallel with header-fold-3; boundaries disjoint.
- boundary widened by sup28: SlackView.tsx, FR-24 focus only
- The cell in definition never folds (after the code review): at 1440 and 1512 waiting and the cell show cut with their ellipses, blocked whole, and only problems, now and live are in "+N". 0076 asks Pablo whether the cell should fold; if he rules that it folds, put back `FOLD.cell` (lib/width.ts).
- On Decisions at 1024x640 the rule box is moved up to fit and covers the lower half of its own Rule (existing placement); the head stays marked.
- The empty-column track uses a CSS space toggle (`--t-next: ;`): G24 should look at it in WKWebView.
