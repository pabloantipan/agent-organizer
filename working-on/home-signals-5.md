---
title: The document never scrolls; signals fold against floors in rendered width; the scroll edge visible; names and dates
status: next
repos: [organizer]
branch: home-signals-5
updated: 2026-10-04
next: "review: home-signals-5, gate met (M4, M5, M7 in WKWebView; M6, M9 in Chromium); the edge line in CardDrawer, RuleDecisionBox and HelpView waits on rule-box-and-stages' merge"
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
- Reviewer: hs5-review, 2026-10-04.

## Blockers

## Notes
Runs in parallel with its pair; boundaries disjoint.
- Boundary widened by sup31 (2026-10-04): one `useMarkdownEdges(el)` call and its import in `DecisionsView.tsx` (the record body, M9). The same line goes into `CardDrawer.tsx`, `RuleDecisionBox.tsx` and `HelpView.tsx` after rule-box-and-stages merges and this branch rebases (sup31 will say); not done yet. `useScrollEdges` moved to `frontend/src/lib/useScrollEdges.ts`.
- Re-measure after row 1 (built app, classic): rows 2 and 5 still held, so FR-8 was built for both; the fold order on main was problems first, not live first.
- At 1024 and 1280 (rail expanded) partner-payouts' blocked folds into "+N" after live, now, problems and the cell, as M5 allows; at 1280 the goal keeps priority over a whole blocked (progress.md, Choices).
- Pablo's WebKit storage was copied aside to .wt-notes/hs5-build/webkit-before/ before the first launch and not restored: his Deltagos ran throughout, and none of my runs used his bundle id (my own copy, then Deltagos Review.app).
- Found: Needs me's row context still shows ISO dates ("raised 2026-09-20"); SlackView.tsx:90 and Conversation.tsx:717 X buttons are named by title only.
