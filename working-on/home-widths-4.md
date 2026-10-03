---
title: Home widths, fourth pass - empty columns give way first, urgent signals never fold, wide measured on the row; Escape, the opener, names
status: now
repos: [organizer]
branch: home-widths-4
updated: 2026-10-03
next: "decide: 0076 (Pablo) - Aglaea recommends the cell folds last everywhere (DS Widths e9fdcf4), which amends G19; builder waits"
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
- 2026-10-03 hw4-build: 424149a never-fold signals share the column (shareRoom), each with at least 2 characters + ellipsis on its span, +N inside; clip probe from a clean checkout (.wt-notes/hw4-build/clip-clean.log): passes at 1024 strip and at 1280, 1440, 1512, 1920 expanded and strip; fails only at 1024x640 rail expanded by 6 px (32+32+48 + 27 + 12 = 151 > 145)
- 2026-10-03 hw4-build: 2941f2c (was 40ab320 before the rebase) tracks testdata/fixture-twenty/partner-payouts/agents/cell.json (git add -f, agents/ is ignored); G19 and G23 re-run from a clean detached checkout at 40ab320 (.wt-notes/hw4-build/g19-clean.log, g23-clean.log): the card row partner-payouts · Partner terms is in Needs me, and the cell lozenge on the seven-signal row is shown and cut with an ellipsis on its span at 1920
- 2026-10-03 hw4-build: code review fixes on home-widths-4, rebased on main 189680e (e02059b the cell in definition never folds, it takes its ellipsis; d570c7e one Escape closes only the topmost, Help or a card back first; 95ace22 People's hide named); G19 re-measured at 1440x900 and 1512x945 (.wt-notes/hw4-build/g19-fix.log), the Escape stack in esc-topmost.log, G22 in g22-fix.log; G8 green again
- 2026-10-03 hw4-build: FR-20 to FR-25 on home-widths-4, rebased on 9048507 (6362137, 0aca68a, 1b84824, 09f0bec, 94e31f5, 78599ee, e522b2e); G19-G23 measured before and after the rebase, G8 green (make test, npm run build, G18 grep empty, wails build); evidence and choices in .wt-notes/hw4-build/progress.md. G24 left unticked for the UI reviewer
- 2026-10-03 sup28 launched by the FSE (decisions-view and time-zoom-2 in done/)
- 2026-10-03 0074 ruled by pablo ("Ok", accept as written, 117e269)
- 2026-10-03 cut from responsive-home amendment 4 by the FSE

## Next

## Blockers

## Review
- **Verdict:** fail (code review, second re-review of 40ab320, the same tree as 2941f2c after the rebase). G19, G20, G21, G22 and G8 met; G23 unmet; G24 is the UI reviewer's.
- **Unmet:** G23. At 1024×640, `--twenty`, with the rail expanded, partner-payouts' CellStateLz is shown but its text span is 0 of 84 px wide, so there is neither the whole text nor an ellipsis, and the lozenge sits 8 px past the clipped signal column. Its "+4" sits 39 px past the column, so the four folded signals have no visible marker; only the `title` and the accessible name still list them. The same happens at 1280×800 with the rail expanded (text 0/84, "+4" 19 px past the column). It comes from e02059b: waiting, blocked and the cell never fold, and in compact their total is wider than the 145 px column. Before e02059b, at 1024 with the rail expanded, the cell folded (the builder's g23.log). With the rail as the strip (fresh storage) at 1024, and at 1439, 1440, 1512 and 1920 with the rail expanded, no signal is clipped or emptied. This also regresses G11 ("+N" at 1024×640, rail expanded). Fix: never-fold lozenges must share the column so each keeps a visible ellipsis and "+N" stays inside it. If they cannot, say so on 0076 for Pablo.
- **Rerun by the reviewer** (my own detached worktree at 40ab320, `fixture-home.sh --twenty`, my own wails dev, headless Chromium, the builder's probe scripts copied, plus a clip probe over every row): G19 at 1440×900 and 1512×945: the all-"—" next date gone, 21/21 goals shown; on partner-payouts (state "waits on you") waiting and the cell cut with their ellipsis, blocked whole, and only now, wave, live and problem in "+4". Wave counts as live by the design system's Widths and `FOLD`. G20 at 2200×1200 and 2560×1440, rail expanded and collapsed: wide each time, every goal whole or ≥ 70 characters (partner-payouts 70, 87, 95, 95). G21 on Home and Decisions at 1512×945 and 1024×640: after a click on the record's text, Escape closes the box; the opener's row is marked `--surface-selected`, and on Home it sits at z 20 over the scrim at 19. G23 at 1024×640 (strip) and 1920×1080: the text is whole, or cut 65/84 px with an ellipsis, on `.lz-t`. Needs me lists 9 rows, including "partner-payouts · Partner terms" and the partner-payouts cell row. G22 from the diff (`Reply to <from>`, `Branch from <from>'s message`, `Hide people`, `.rail-icon` 24×24, focus to the People toggle) and g22-fix.log; nothing that touches it changed after 95ace22.
- **G8** in the builder's worktree at 2941f2c: `XDG_DATA_HOME=$(mktemp -d) make test` green (148 vitest), `npm test` and `npm run build` ok, the G18 grep empty; `wails build` ok in my worktree at 40ab320.
- **Outside the gate:**
  - the gate fixes no rail state for G23 or G15, and compact with the rail expanded is where never-fold overflows. G19 to G23 should name the rail state, or check both;
  - on Decisions at 1024×640 the box still covers its own Rule (top element `DIV.rb`), as before;
  - the box's Escape yields to any other `[role="dialog"]` in the document, as before;
  - the diff stays inside `boundary`, plus SlackView.tsx (widened by sup28).
- **Reviewer:** hw4-review, 2026-10-03

## Notes
Runs in parallel with header-fold-3; boundaries disjoint.
- boundary widened by sup28: SlackView.tsx, FR-24 focus only
- The cell in definition never folds (after the code review): at 1440 and 1512 waiting and the cell show cut with their ellipses, blocked whole, and only problems, now and live are in "+N". 0076 asks Pablo whether the cell should fold; if he rules that it folds, put back `FOLD.cell` (lib/width.ts).
- On Decisions at 1024x640 the rule box is moved up to fit and covers the lower half of its own Rule (existing placement); the head stays marked.
- The empty-column track uses a CSS space toggle (`--t-next: ;`): G24 should look at it in WKWebView.
