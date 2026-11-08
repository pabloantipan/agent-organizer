---
title: "Collapsing closes the rename, the head's tools sit at the top, long names are cut in the line"
status: now
repos: [organizer]
branch: lf81-rename-edges
seat: l81-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "review: lf81-rename-edges, V1-V3 and X0 pass, AR51-AR53 to the UI reviewer (screen locked), 8cbff45c"
depends_on: [lf80-refusal-close]
boundary: ["frontend/src/components/Rail.tsx", "frontend/src/lib/railGroup.ts", "frontend/src/lib/liveRegion.ts", "frontend/src/lib/", "frontend/src/styles/global.css", "frontend/src/components/"]
spec: "docs/specs/leftovers-81.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-81.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No refusal outlives a collapsed rail, the head's tools stay at its top, and a long name never stretches the line past four lines.

## Gate
docs/specs/leftovers-81.md, rows V1-V3, AR51-AR53 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #78).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); there is no DOM test library; a test outside the named files may change only where it asserts the old behaviour.
- Design: Aglaea's 8cb87888; the cut is at 24 characters plus `…`; anything else to the FSE.
- Short-sample fallback: the existing fixtures with two groups, one renamed to a 60-character name in the row; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and output under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon; stop the fixture's stand-ins with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before removing its dir.

## Done
- 2026-11-08 l81-build: FR-1 d5e7294b, FR-3 a582fbef, FR-2 8cbff45c on c481a3a3 (origin/main, no rebase needed); V1-V3 fail on c481a3a3 and pass on the branch; X0 passes in a clean clone; AR51-AR53 not self-checked (screen locked), steps in `.wt-notes/l81-build/progress.md`.

## Declared changes
- added `frontend/src/lib/railRename.ts`: `closeRename` (Escape's close: hush, line and field emptied) and `collapseRail` (an open rename closed first, then collapse, focus to the toggle)
- added `frontend/src/lib/railRename.test.ts`: V1
- modified `frontend/src/components/Rail.tsx`: the collapse toggle calls `collapseRail` (mousedown kept from blurring the field while a rename is open), `toggleFocus` effect focuses the strip's toggle, Escape calls `closeRename`, the refusal shows `takenLines().shown` and says `.said`
- modified `frontend/src/lib/railGroup.ts`: added `LINE_NAME_MAX`, `cutName`, `takenLines`; `takenLine` unchanged
- modified `frontend/src/lib/railGroup.test.ts`: V3 appended, import extended
- modified `frontend/src/styles/global.css:.rail-group-head`: `align-items: flex-start`
- added `frontend/src/components/Rail.lf81.test.tsx`: V2
Risky:
- `.rail-group-head` flex-start applies at rest too: chevron and name sit at the top of the 24 px ⋯ box, about 4 px above its centre
- the strip-toggle `onMouseDown` preventDefault while renaming: a pointer press no longer moves focus by itself; focus is set by the effect
Not changed, on purpose:
- `liveRegion.ts`: lf80's `hush` already drops a pending set; the collapse calls it
- the plain collapse with no rename open: no hush, no focus move
- `takenLine` and its old tests: the whole sentence stays as it was

## Notes
- The cut also applies to the other group's label (the spec says "each name"); a label ≤ 24 shows whole.

