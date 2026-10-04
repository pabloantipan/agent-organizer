---
title: Escape keeps what he wrote (rule box, comments, composer), and Home's fixed columns give their slack to cut cells
status: now
repos: [organizer]
branch: drafts-and-slack
seat: das-build
updated: 2026-10-04
next: "review: drafts-and-slack, gate met (S0-S4, Chromium and WKWebView, classic and overlay)"
depends_on: []
boundary: ["frontend/src/lib/drafts.ts, lib/width.ts and their tests", "frontend/src/components/RuleDecisionBox.tsx, DecisionsView.tsx (its rule box's draft only), Home.tsx", "frontend/src/components/CardDrawer.tsx (the comment field's draft, name and updated date), Conversation.tsx (the composer's draft and field names)", "frontend/src/components/InitiativeHeader.tsx (the target's date), StageRoadmap.tsx (the row's name)", "frontend/src/styles/home.css (the three grid templates at lines 8, 15, 140 only, as --t-state/--t-phase variables with today's defaults; widened by the FSE 2026-10-04 for FR-2)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-9.md (FR-1, FR-2); Aglaea's calls d06e265"
gate: "docs/specs/leftovers-9.md Acceptance, rows S1 to S4 and S0"
ui_review: true
review: pass
---

## Goal
Nothing he writes is lost to an Escape; Home's dates whole at 1512.

## Gate
- [x] S1-S4: see `docs/specs/leftovers-9.md`, Acceptance
- [x] S0: see `docs/specs/leftovers-9.md`, Acceptance

## Done
- 2026-10-04 das-build: branch drafts-and-slack, 8 commits abe9b04..9453240 on main 097402a; one session draft store (lib/drafts.ts), Escape keeps rule box/comment/composer drafts with `· draft` verbs, fixed columns give slack to a cut next date (fixedColumns via shareRoom), dates in words, field and stage names; S0-S4 met, evidence in .wt-notes/das-build/progress.md
- 2026-10-04 sup36: worktree .wt/drafts-and-slack off 477aef6, seat das-build launched
- 2026-10-04 0081 ruled by pablo ("Accepted"); sup36 launched by the FSE
- 2026-10-04 cut from leftovers-9 by the FSE

## Next

## Blockers

## Review
- Verdict: pass (code and checks; the WKWebView shots are the UI reviewer's).
- Commit reviewed: 9453240 (branch drafts-and-slack).
- Unmet gate items: none. S0: make test from a clean clone and in a worktree, npm test (199) and npm run build pass; wails build taken from the builder's phase table. S2: drafts.test.ts keeps, restores and discards per decision/card/thread/new/branch key; store is an in-memory Map, no storage or sync hit. S3: width.test.ts fixedColumns via shareRoom, cause in Notes. S4: dateWords on header target and card back updated; names as FR-4.
- Boundary finding: frontend/src/stores/board.store.ts changed, outside the card's boundary (inside the spec's, which excludes stores only beyond the draft's session state); the change only moves ruleDrafts into lib/drafts. FSE to widen the card or accept.
- Reviewer: das-review, 2026-10-04.

## Notes
- FR-2 measured before the fix (Chromium 1512x945, rail strip, classic and overlay): next date needs 120 px in its 96 px track (cut 24); slack in state (144 track, widest 96: 48 px) and phase (96, widest 69: 27 px). home.css widened by the FSE for --t-state/--t-phase.
- Still at 1512 strip: init-a's signals cut 20-25 px (folds "+1") while the flexible id (63 px) and stage (61 px) columns hold slack; FR-2 named fixed columns only.
- WKWebView with classic bars: the bar is drawn but Home's rows keep the overlay width (1412 px); Chromium's lose ~17 px.
- The reply composer gained a `cancel` link (shown while a message is kept), so Cancel exists in all four places.
