---
title: "An open card holds Tab; the drawer's list has no commas"
status: now
repos: [organizer]
branch: lf25-dialogs
seat: dg-build
stage: one-window
updated: 2026-10-13
next: "review: lf25-dialogs, gate met (D1, D2, X0), d5c8246"
depends_on: []
boundary: ["docs/specs/leftovers-25.md Boundary, lf25-dialogs"]
spec: "docs/specs/leftovers-25.md (FR-10, FR-11; tab-reaches-links Amendment 2, T18, T20)"
gate: "docs/specs/leftovers-25.md Acceptance, rows D1, D2 and X0"
ui_review: true
---

## Goal
An open card holds Tab; the drawer's list has no commas (Aglaea, a5c30ed, from sup60's close).

## Gate
docs/specs/leftovers-25.md, rows D1, D2 and X0.

- [x] D1: harness Tab loop of the card back, links on and off (`.wt-notes/dg-build/d1-on.jsonl`, `d1-off.jsonl`, steps `d1.txt`); one definition (`.wt-notes/dg-build/d1-grep.txt`)
- [x] D2: vitest `frontend/src/components/RoleDrawer.inits.test.tsx`; harness ring 6 px from the next item (`.wt-notes/dg-build/d2-on.jsonl`, `d2-off.jsonl`, steps `d2.txt`), snapshot `.wt-notes/dg-build/d2-link2.png`
- [x] X0: clean clone at d5c8246, make test, pnpm run build, wails build, porcelain empty (`.wt-notes/dg-build/x0-summary.txt`)

## Done
- 2026-10-13 dg-build: `loopTab` moved to `lib/tabTrap.ts` and shared by the rule box, the role drawer (its edge-only copy gone) and the card back; the drawer's initiatives are an inline `ul`, 8 px gap, no commas (58d4cfd, 100afd4, d5c8246; progress `.wt-notes/dg-build/progress.md`).
