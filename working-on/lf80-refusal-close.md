---
title: "No stale refusal is heard, and the refusal line reads whole"
status: now
repos: [organizer]
branch: lf80-refusal-close
seat: l80-build
reviewer: l80-rev
review:
stage:
updated: 2026-11-08
next: "review: lf80-refusal-close, V1 V2 X0 pass, AR49 AR50 for the UI reviewer (screen locked), 69ca546f"
depends_on: [lf79-refused-field]
boundary: ["frontend/src/components/Rail.tsx", "frontend/src/lib/liveRegion.ts", "frontend/src/lib/", "frontend/src/styles/global.css", "frontend/src/components/"]
spec: "docs/specs/leftovers-80.md (FR-1, FR-2)"
gate: "docs/specs/leftovers-80.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
Closing the rename field leaves nothing to be heard, and its refusal line reads whole without covering a row.

## Gate
docs/specs/leftovers-80.md, rows V1, V2, AR49, AR50 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #76).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`), fake timers for V1; there is no DOM test library; a test outside the named files may change only where it asserts the old behaviour.
- Design: Aglaea's 66315c51; anything else to the FSE.
- Short-sample fallback: the existing fixtures with two groups; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and output under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon; stop the fixture's stand-ins with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before removing its dir.

## Done
- l80-build, 2026-11-08: FR-1 2203be40 (`hush` on the speaker, the rail hushes when the field closes), FR-2 69ca546f (the line wraps as prose, a long name too). V1, V2 fail on 06e1a95c and pass on the branch; X0 passes in a clean clone; AR49, AR50 not self-checked (screen locked), the reviewer's steps in `.wt-notes/l80-build/progress.md`. Branch on origin/main 06e1a95c, not pushed.

## Declared changes
- modified `frontend/src/lib/liveRegion.ts:speaker`: adds `hush` (empty now, drop a pending set and its `then`s)
- modified `frontend/src/lib/liveRegion.ts:useLiveRegion`: returns `hush` as a third element; type `Hush` added
- modified `frontend/src/components/Rail.tsx:Rail`: the `editing` effect also calls `hush`, so every close of the rename field empties the announcer
- modified `frontend/src/styles/global.css`: `.rail-rename-line` sets `white-space: normal; overflow-wrap: break-word`
- modified `frontend/src/lib/liveRegion.test.ts`: V1
- added `frontend/src/components/Rail.lf80.test.tsx`: V2
Risky:
- `Rail` `editing` effect: hushes on any change of `editing`, so a pending sentence is dropped if the field moves to another group within 100 ms (intended)
Not changed, on purpose:
- `RenameField`, `rename`, `onCancel`: every close already ends in `setEditing(null)`; the effect covers them
- `.rail-group-head` `align-items: center` (the head's tools centre on a three-line field; noted for Aglaea, outside the boundary)
- the six other `useLiveRegion` callers: they destructure two elements
