---
title: "The rail's back to Initiatives is its own button"
status: now
repos: [organizer]
branch: lf20-back-button
seat: bk-build
stage: one-window
updated: 2026-10-11
next: "review: lf20-back-button, gate met (R1, R2, X0), 4810e18"
depends_on: []
boundary: ["docs/specs/leftovers-20.md Boundary, lf20-back-button"]
spec: "docs/specs/leftovers-20.md (FR-3, FR-4; initiatives-view Amendment 5, I36)"
gate: "docs/specs/leftovers-20.md Acceptance, rows R1, R2 and X0"
ui_review: true
---

## Goal
Back is a small button of its own; the counts are not pressable (Aglaea, 9a058c0, from sup56's close).

## Gate
docs/specs/leftovers-20.md, rows R1, R2 and X0.

- [x] R1: vitest `frontend/src/components/Rail.hero.test.tsx`; AX on the review app: AXButton `Back to Initiatives` 85x24, AXPress opens Initiatives (`.wt-notes/bk-build/r1-ax.txt`, `r1-hero-crop.png`)
- [x] R2: vitest `Rail.hero.test.tsx` (counts outside any button, no handler; Home one button going Home); AXPress on the summary stays put (`.wt-notes/bk-build/r2-ax.txt`)
- [x] X0: clean clone at 4810e18: make test 532/532, pnpm run build, wails build pass, porcelain empty (`.wt-notes/bk-build/x0-summary.txt`)

## Done
- 2026-10-11 bk-build: back is its own 24 px button atop the hero; the rest of the hero is a summary on an initiative; Home unchanged (4438084, 4810e18).

## Notes
- `Places.test.tsx` (lf19 L2) pinned the old hero-back markup by source text; its one assertion now reads the new button (4810e18). Outside the named test files, inside the hero's tests.
