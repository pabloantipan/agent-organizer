---
title: "The Review screen: opened from the card, its header and the worklist"
status: now
repos: [organizer]
branch: rv-list
seat: rl-build
stage: review-map
updated: 2026-10-18
next: "review: rv-list, gate met (V-R1, V-R2, V-R3, V-R9, V-R11, V-S, V-R12, X0), 62d9133"
risk: medium
footprint: [frontend/src/components/Review.tsx, frontend/src/components/Review.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/components/CardDrawer.tsx, frontend/src/stores/board.store.ts, frontend/src/App.tsx]
depends_on: [rv-data]
boundary: ["docs/specs/review-map.md v2 Boundary, rv-list"]
spec: "docs/specs/review-map.md (v2, FR-18; docs/ux/specs/review-view.md)"
gate: "docs/specs/review-map.md v2 Acceptance, rows V-R1, V-R2, V-R3, V-R9, V-R11, V-S, V-R12 and X0"
ui_review: true
---

## Goal
Pablo opens a card's change and sees what is left to review, in the order to review it.

## Gate
docs/specs/review-map.md v2, rows V-R1, V-R2, V-R3, V-R9, V-R11, V-S, V-R12 and X0.
- [x] V-R1: `.wt-notes/rl-build/out/vr1-vr3.txt`, `out/vr1-card-back.png`
- [x] V-R2: `.wt-notes/rl-build/out/vr1-vr3.txt`, `out/vr2-map.png`
- [x] V-R3: `.wt-notes/rl-build/out/vr1-vr3.txt`; order on a bigger map in `frontend/src/lib/review.test.ts`
- [x] V-R9: `.wt-notes/rl-build/out/vr9.txt`, `out/vr9-partial.png`
- [x] V-R11: `.wt-notes/rl-build/out/vr11-1024x640.txt`, `out/vr11-1440x900.txt`
- [x] V-S: `frontend/src/components/Review.test.tsx`, `frontend/src/lib/review.test.ts`
- [x] V-R12: `.wt-notes/rl-build/vr12.txt`
- [x] X0: `.wt-notes/rl-build/x0-make-test.txt`, `x0-pnpm-build.txt`, `x0-wails-build.txt`, `x0-porcelain.txt` (clean clone of 62d9133)

## Done
- 2026-10-18 rl-build: FR-18 on branch `rv-list` (fca7bdc..62d9133, unmerged, rebased on main 1e1b750); gate met in a clean clone; progress, choices and reproduction in `.wt-notes/rl-build/progress.md`

## Notes
- The review screen is the store's `review` place over `screen: "initiative"`, not a new `Screen` member: `lib/place.ts` switches over `Screen` exhaustively and is outside the boundary. Any navigation that sets `screen` leaves it.
- The crumb's card title made the top bar (and every screen, via `.shell`'s auto column) 1158 px wide at 1024; fixed in review.css by a zero basis (be5cea9). A `min-width: 0` on `.topbar` would guard every crumb; shell.css is outside this card.
- rv-symbol mounts into `SymbolPane` (Review.tsx): `.review-diff` and `.review-facts`; what it gets from the store is in progress.md.
- The fixture has no card of another machine; `!local` is proven by `reviewable` in vitest.

## Declared changes
- added `frontend/src/lib/review.ts`: groups, order, counts, next, partial lines, §4 words
- added `frontend/src/lib/review.test.ts`: V-R2, V-R3, V-R9, V-R11, V-S logic
- added `frontend/src/components/Review.tsx`: the Review screen, its header, worklist, make, the symbol's mount
- added `frontend/src/components/Review.test.tsx`: V-S, the crumb
- added `frontend/src/styles/review.css`: the screen's layout and widths, the crumb's title
- modified `frontend/src/components/CardDrawer.tsx`: the Review section, focus back on Review the change
- modified `frontend/src/stores/board.store.ts`: the review place, openReview, closeReview, leaving it on navigation
- modified `frontend/src/App.tsx`: mounts the Review screen
- modified `frontend/src/components/TopBar.tsx`: the crumb `<initiative> › <card title> › Review` (outside the card's footprint, in the spec's Boundary as "the crumbs")
- modified `frontend/src/components/SkipLink.test.tsx`: App has a fifth main
Risky:
- `leaveReview`: wraps the store's `set`; a future navigation that sets `review` and `screen` together keeps the screen
- `ReviewSection`: one ReviewStatus call per local card back opened
Not changed, on purpose:
- `frontend/src/lib/place.ts`: the screen stays `initiative`, so marks need no new case
- `frontend/src/hooks/useWails.ts`: bindings imported directly, as TopBar and Crew do
- `frontend/wailsjs`, `app.go`, any Go: the data is rv-data's
