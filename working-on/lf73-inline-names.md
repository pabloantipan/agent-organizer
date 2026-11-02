---
title: "Comma lists read as text, counts read one way, your names read as you wrote them"
status: now
repos: [organizer]
branch: lf73-inline-names
seat: l73-build
reviewer: l73-rev, l73-ui
stage:
updated: 2026-11-02
next: "review: lf73-inline-names, V1-V3 and X0 pass (AR35 ring, AR38 review view left to l73-ui), ba9f59f"
depends_on: [lf72-counts-commas]
boundary: ["frontend/src/components/RunTracks.tsx", "frontend/src/components/Rail.tsx", "frontend/src/components/Review.tsx", "frontend/src/components/SecCount.tsx", "frontend/src/styles/runreport.css", "frontend/src/styles/global.css", "frontend/src/styles/review.css", "frontend/src/lib/folds.ts", "frontend/src/lib/folds.test.ts", "frontend/src/lib/floatList.ts", "frontend/src/lib/floatList.test.ts", "frontend/src/components/"]
spec: "docs/specs/leftovers-73.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-73.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No ring over a name, no "(N)", and no name of Pablo's shouted in capitals.

## Gate
docs/specs/leftovers-73.md, rows V1-V3, AR35, AR37, AR38 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #61).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); a test outside the named files may change only where it asserts the old markup (the boundary's last entry, for that only).
- Design: Aglaea's e729ecc; anything else to the FSE.
- Short-sample fallback: the existing fixtures; a named rail group and a not-cut item after a link are added to the fixture if missing; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-02 l73-build: FR-1..4 and Amendment 1 on lf73-inline-names (b74efc3, e4dd6cf, ba9f59f, on origin/main 51db34f); V1-V3 fail on 51db34f (9) and pass (12); X0 passes from a clean clone; rail and left list read by AX at 1024x640; notes in .wt-notes/l73-build/progress.md.

## Declared changes
- modified `frontend/src/components/RunTracks.tsx`: left-list links carry `rr-inline` (FR-1, FR-2)
- modified `frontend/src/styles/runreport.css`: `.rr-card.rr-inline` min-width 0 and inset focus ring (FR-1, FR-2)
- modified `frontend/src/components/Rail.tsx`: Asleep and Archived heads through SecCount (FR-3)
- modified `frontend/src/components/Review.tsx`: group count through SecCount, `<title> · N` (FR-3)
- modified `frontend/src/lib/folds.ts:foldLabel`: `<word> · n` (Amendment 1)
- modified `frontend/src/lib/floatList.ts`: doc comment's example only (Amendment 1)
- modified `frontend/src/styles/global.css`: uppercase moved from `.rail-group-name` to `.rail-group-head.fixed .rail-group-name` (FR-4)
- added `frontend/src/components/RunTracks.lf73.test.tsx`: V1
- added `frontend/src/components/SecCount.lf73.test.tsx`: V2 and the foldLabel test
- added `frontend/src/components/Rail.lf73.test.tsx`: V3 and the folded groups' count
- modified `frontend/src/components/RunTracks.test.tsx`: lf72 V1 assert of the old `class="rr-card"` markup
- modified `frontend/src/components/FloatList.test.tsx`, `frontend/src/lib/folds.test.ts`, `frontend/src/lib/floatList.test.ts`: asserts of the old `(n)` text
Risky:
- `.rv-gtitle`: its ellipsis now cuts title and count together on a long package path
Not changed, on purpose:
- `Charter.tsx`: `(2 of 5)` is a position (spec)
- `frontend/src/styles/review.css`: `.rv-gcount` already styled the count; no rule needed
- `FloatList.tsx`: its doc comment still says `Asleep (n)`; outside the amended boundary

## Notes
- l73-build: a comma before a not-cut item sits ~2 px from its glyph, after a link ~6 px (the link's padding); the text reads right, the look is uneven. For Aglaea if it matters.
