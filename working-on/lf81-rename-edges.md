---
title: "Collapsing closes the rename, the head's tools sit at the top, long names are cut in the line"
status: now
repos: [organizer]
branch: lf81-rename-edges
seat: l81-build
reviewer: l81-rev
review: "code gate pass (V1-V3, X0) at 8cbff45c, l81-rev 2026-11-08; AR51-AR53 to l81-ui"
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


## Review
**Verdict: pass (code gate).** Unmet rows: none of V1, V2, V3, X0. AR51-AR53 are l81-ui's. Reviewer l81-rev, 2026-11-08, commit 8cbff45c (on origin/main c481a3a3; the branch did not move).

change-check organizer lf81-rename-edges --base origin/main (clean clone):
```
7 files, 1 flags
| undeclared | organizer/frontend/src/styles/global.css |  | modified |
| declared, not changed |  | frontend/src/styles/global.css:.rail-group-head | no matching change |
2 flags: outside boundary 0, outside footprint 0, undeclared 1, declared, not changed 1, new env var 0, new dependency 0, new host 0, risk 0, untested? 0, could not read 0, boundary unreadable 0
```
Both flags are one change: the declaration names a CSS selector, which change-check does not match as a symbol; the diff of global.css is exactly `.rail-group-head` `align-items: center` → `flex-start` plus a comment above it. Not a finding.

- V1, V2, V3: `npx vitest run src/lib/railRename.test.ts src/components/Rail.lf81.test.tsx src/lib/railGroup.test.ts -t leftovers-81`. On c481a3a3 with the three files copied in: 3 files failed, 5 tests failed, 1 passed (the sample-length row); V1 `Cannot find module './railRename'`, V2 `expected ' display: flex; align-items: center; …' to match /align-items\s*:\s*flex-start\s*;/`, V3 `takenLines`/`cutName is not a function`. On the branch: 10 passed.
- Cases the builder's tests lack (a scratch test, removed): collapse at 99 ms of the 100 ms gap, timers run: region log ends `""` and never holds the refusal, field closed, focus to the toggle; collapse at 1 ms, then reopen and refuse again: the refusal is said after 100 ms; Escape's `closeRename` then a new refusal: said. FR-3 `cutName`: 24 `a` → whole; 25 → 24 + `…`; 30 `é` → 24 + `…`; 25 `😀` → 24 `😀` + `…`; `takenLines` of 30/40-char names: shown cuts both at 24 + `…` with the sentence whole, said has both whole.
- FR-1 in Rail.tsx: the only collapse path is the strip-toggle; it calls `collapseRail` (hush, line and editing emptied, collapse, focus effect on the strip's `.strip-toggle`); the lf80 `[editing]` effect and the Escape, save and blur paths are as before (Escape now through `closeRename`, same three calls).
- FR-2: global.css changes only that one property of `.rail-group-head`; nothing the Safari 15.0 floor lacks. The only changed test outside the new files, railGroup.test.ts, appends V3 and extends its import; no old assert changed.
- X0: `pnpm install --frozen-lockfile` ok; `make test` exit 0 (Go ok, vitest 111 files, 1785 passed), test run fresh, test-lease run e08753b6; `wails build` exit 0; `make review-build` exit 0 (`built build/bin/Deltagos Review.app`); `git status --porcelain` empty. Logs in `.wt-notes/l81-rev/`.

Notes (do not fail the card):
- Note → l81-ui (AR51): the field unmounts while it has focus (the toggle's mousedown keeps focus there). If WKWebView fires blur on that removal, `onBlur` → `rename` would save or refuse after the collapse. Not provable without the app; the builder's AR51 steps (`zzz`, then collapse, expand: still `misc`) check it.
- Note → l81-ui (AR52): flex-start also applies at rest; chevron and name sit ~4 px above the ⋯'s centre (builder's Found, not asked).
- Note → FSE: `cutName` counts code points, not graphemes: 13 × `e\u0301` (13 visible, 26 code points) → 12 visible + `…`; 8 × `👩‍👩‍👧` → the last family split mid-sequence with a dangling ZWJ. The spec says "24 characters" without defining it; an `Intl.Segmenter` cut would be a spec amendment.
- Note → sup123: `research.md` was not written before the global.css edit (build-seat); the builder says so and lists the rule's readers in progress.md.
- Note → FSE: the spec's Boundary names Rail.tsx, railGroup.ts and liveRegion.ts, not the new `lib/railRename.ts`; the card's boundary (`frontend/src/lib/`) covers it.

## Notes
- The cut also applies to the other group's label (the spec says "each name"); a label ≤ 24 shows whole.

