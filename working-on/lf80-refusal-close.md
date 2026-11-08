---
title: "No stale refusal is heard, and the refusal line reads whole"
status: now
repos: [organizer]
branch: lf80-refusal-close
seat: l80-build
reviewer: l80-rev
review: "pass (code gate V1 V2 X0), l80-rev, 2026-11-08, 69ca546f; AR49 AR50 to l80-ui"
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

## Review
**Verdict: pass** (code gate V1, V2, X0). Unmet rows: none. AR49, AR50 are l80-ui's.
Reviewer l80-rev, 2026-11-08, commit 69ca546ff79157bdfbdece2559756eca6c08907c (on origin/main 06e1a95c), clean clone from origin plus a fetch of the local branch; logs in `.wt-notes/l80-rev/`.

change-check (`change-check organizer lf80-refusal-close --base origin/main`):
```
change-check: working-on/lf80-refusal-close.md
risk: medium (missing, read as medium)
repo organizer: base 06e1a95c8 (--base origin/main) ... head lf80-refusal-close (clone HEAD 69ca546ff, on detached) 69ca546ff; 5 files, 0 flags; read in /Users/pabloantipan/organizer/.wt-notes/l80-rev/clean

## Changed

- organizer/frontend/src/components/Rail.lf80.test.tsx (added, test)
- organizer/frontend/src/components/Rail.tsx (modified): Rail
- organizer/frontend/src/lib/liveRegion.test.ts (modified, test)
- organizer/frontend/src/lib/liveRegion.ts (modified): speaker, Hush, useLiveRegion
- organizer/frontend/src/styles/global.css (modified)

covered by a mention: organizer/frontend/src/lib/liveRegion.ts Hush (`Hush` in a why)

## Tests touched

- organizer/frontend/src/components/Rail.lf80.test.tsx
- organizer/frontend/src/lib/liveRegion.test.ts

## Risky (declared)

- `Rail` `editing` effect: hushes on any change of `editing`, so a pending sentence is dropped if the field moves to another group within 100 ms (intended)

## Not changed, on purpose (declared)

- `RenameField`, `rename`, `onCancel`: every close already ends in `setEditing(null)`; the effect covers them
- `.rail-group-head` `align-items: center` (the head's tools centre on a three-line field; noted for Aglaea, outside the boundary)
- the six other `useLiveRegion` callers: they destructure two elements

## Flags

none

0 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 0, could not read 0, boundary unreadable 0
```
0 flags: no undeclared, outside-boundary or declared-not-changed line to explain.

- **V1** `src/lib/liveRegion.test.ts -t leftovers-80`: 3 pass on the branch; on 06e1a95c (second clone, tests copied in) all 3 fail, `TypeError: r.s.hush is not a function`.
- **V2** `src/components/Rail.lf80.test.tsx`: 4 pass on the branch; on 06e1a95c 1 fails (`the line wraps as prose…`: no `white-space: normal` on the line), 3 pass there by nature (they guard against clipping that main never had).
- **Own cases (FR-1)**, over the branch's `speaker` with a hook-like cancel that disarms the timer as `useLiveRegion` does: close at 50 ms then all timers → region `""`, log `["", ""]`; two refusals pending, close, then a later refusal → `""` at 99 ms and the sentence at 100 ms; hush twice with nothing pending → `""`, then a say is heard. 3/3 pass.
- **FR-1 read**: Escape (`onCancel`), Enter that saves and blur that saves (`rename`) all end in `setEditing(null)`, which the `[editing, hush]` effect turns into `setRefused(null)` plus `hush()`. A refused save (Enter or blur) leaves `editing` as it is, so it is not a close and the sentence is said (lf79 FR-3). The hush runs in the passive effect after the close commit, so anything said during the close (a blur on unmount) is emptied after it. `hush` cancels `due`, whose effect cleanup clears the 100 ms timer. The `rail-said` span renders on every pass in both rail forms; its only class rule is `.sr-only` (absolute, 1 px, clip), with no `display: none` or `visibility: hidden`.
- **FR-2 read**: `.rail-rename` and `.rail-rename-line` have no `nowrap`, `overflow`, `height`, `max-height`, `line-clamp` or `position`. Their ancestors (`.rail-group-title` inline-flex with `white-space: pre`, which `.rail-rename` resets; `.rail-group-head` flex with no height; `.rail-group`) do not clip or position either, so the next group header follows in normal flow. The global.css diff touches only the line rule plus a comment: `white-space: normal` and `overflow-wrap: break-word` (Safari 15.0 has it), with no new colour, no oklch, color-mix, nesting or @layer. No old assert changed.
- **X0** (in the clean clone): `pnpm install --frozen-lockfile` 0; `make test` 0, 19 Go `ok` and vitest 109 files 1774 tests, a **fresh** run (test-lease run dcc5c265223e73f912683db8f1240068, sha 69ca546f); `wails build` 0; `make review-build` 0 (`built build/bin/Deltagos Review.app`); `git status --porcelain` empty with nothing to restore. Both clones were removed.

Note: (to l80-ui, AR49) collapsing the rail while a refused name is in the field blurs it, so the refusal is said again; `editing` stays the same and the strip's `rail-said` keeps the sentence. FR-1 lists only Escape, save and focus leaving with a name kept, so this is untested here. Worth one look in the review build.
Note: (to the FSE, docs/specs/leftovers-80.md) V2's "fails on main" rests on one assert (`white-space: normal` on the line). The no-clip asserts are guards that pass on main, as the spec's second premise expected.
Note: (to Aglaea, builder's "Found, not asked") `.rail-group-head` `align-items: center` centres the chevron and ⋯ on a three-line field.

