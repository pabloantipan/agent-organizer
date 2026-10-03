---
title: Home widths, fourth pass - empty columns give way first, urgent signals never fold, wide measured on the row; Escape, the opener, names
status: now
repos: [organizer]
branch: home-widths-4
updated: 2026-10-03
next: "review: home-widths-4, partner-payouts cell.json tracked (40ab320); G19 and G23 re-run from a clean detached checkout; G19-G23 and G8 met; G24 is the UI reviewer's"
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
- 2026-10-03 hw4-build: 40ab320 tracks testdata/fixture-twenty/partner-payouts/agents/cell.json (git add -f, agents/ is ignored); G19 and G23 re-run from a clean detached checkout at 40ab320 (.wt-notes/hw4-build/g19-clean.log, g23-clean.log): the card row partner-payouts · Partner terms is in Needs me, and the cell lozenge on the seven-signal row is shown and cut with an ellipsis on its span at 1920
- 2026-10-03 hw4-build: code review fixes on home-widths-4, rebased on main 189680e (e02059b the cell in definition never folds, it takes its ellipsis; d570c7e one Escape closes only the topmost, Help or a card back first; 95ace22 People's hide named); G19 re-measured at 1440x900 and 1512x945 (.wt-notes/hw4-build/g19-fix.log), the Escape stack in esc-topmost.log, G22 in g22-fix.log; G8 green again
- 2026-10-03 hw4-build: FR-20 to FR-25 on home-widths-4, rebased on 9048507 (6362137, 0aca68a, 1b84824, 09f0bec, 94e31f5, 78599ee, e522b2e); G19-G23 measured before and after the rebase, G8 green (make test, npm run build, G18 grep empty, wails build); evidence and choices in .wt-notes/hw4-build/progress.md. G24 left unticked for the UI reviewer
- 2026-10-03 sup28 launched by the FSE (decisions-view and time-zoom-2 in done/)
- 2026-10-03 0074 ruled by pablo ("Ok", accept as written, 117e269)
- 2026-10-03 cut from responsive-home amendment 4 by the FSE

## Next

## Blockers

## Review
- **Verdict:** fail (code review, re-review of 95ace22). G19, G20, G21, G22 and G8 met; G23 unmet; G24 is the UI reviewer's.
- **Unmet:** G23. FR-25's fixture is not on the branch: `testdata/fixture-twenty/partner-payouts/agents/cell.json` exists only untracked in the builder's worktree (`git check-ignore`: `.gitignore:7: agents/`; the same trap b46d48d fixed for onboarding-flow). From a clean detached checkout of 95ace22 with `fixture-home.sh --twenty`, Needs me lists 7 rows: no "partner-payouts · Partner terms" card row (it is read through the cell) and no cell Launch row; the only card row is onboarding-flow's Step map, which main already had. The fixture does not gain the card row FR-25 asks for, and the builder's g23 logs were taken with the untracked file. Fix: `git add -f` that file, rerun G19 and G23 from a clean checkout.
- **Rerun by the reviewer** (clean checkout of 95ace22, own wails dev, headless Chromium, the builder's probe scripts copied): G19 at 1440x900 and 1512x945: next date gone (all "—"), 21/21 goals shown; waiting cut with its ellipsis, blocked whole, only now/wave/live/problem in "+N", state "waits on you". The committed row has six signals, not seven (no cell), so the cell-never-folds change (e02059b) is shown only by the builder's g19-fix.log, with the untracked file; the code (no `data-fold` on CellStateLz) agrees. G20 at 2200x1200 and 2560x1440, rail expanded and collapsed: wide each time, every goal whole or >= 70 characters (partner-payouts 70, 87, 95, 95 of 100). G21 on Home and Decisions at 1512x945 and 1024x640: click on the record's text then Escape closes the box; the opener's row marked `--surface-selected`, on Home at z 20 over the scrim at 19. G22 from g22-fix.log (after 95ace22) and the diff: "Reply to fse", "Branch from fse's message", ten `.rail-icon`s all 24x24, "Hide people" named, focus on the People toggle after hide. Escape stack from esc-topmost.log: Help or a card back closes first, the box on the second Escape.
- **G8 rerun by the reviewer** in the builder's worktree at 95ace22: `XDG_DATA_HOME=$(mktemp -d) make test` green (148 vitest), `npm run build` ok, the G18 grep empty, `wails build` ok.
- **Outside the gate:**
  - on Decisions at 1024x640 the box still covers its own Rule (top element `DIV.rb`); FR-23 holds only because Decisions has no scrim (unchanged, existing placement);
  - the box's Escape now yields to any other `[role="dialog"]` in the document (CardDrawer, Retire, Help today); a future non-modal dialog left mounted would silently disable it;
  - SlackView.tsx is outside the card's `boundary` field; widened by sup28 (Notes), so not a finding;
  - the gate cannot catch an ignored fixture file: G19 and G23 should be run from a clean checkout of the branch, not the builder's worktree.
- **Reviewer:** hw4-review, 2026-10-03

## Notes
Runs in parallel with header-fold-3; boundaries disjoint.
- boundary widened by sup28: SlackView.tsx, FR-24 focus only
- The cell in definition never folds (after the code review): at 1440 and 1512 waiting and the cell show cut with their ellipses, blocked whole, and only problems, now and live are in "+N". 0076 asks Pablo whether the cell should fold; if he rules that it folds, put back `FOLD.cell` (lib/width.ts).
- On Decisions at 1024x640 the rule box is moved up to fit and covers the lower half of its own Rule (existing placement); the head stays marked.
- The empty-column track uses a CSS space toggle (`--t-next: ;`): G24 should look at it in WKWebView.
