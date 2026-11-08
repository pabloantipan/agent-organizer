---
title: "The last rename polish: no '….', a level head, cuts by grapheme"
status: now
repos: [organizer]
branch: lf82-rename-last
seat: l82-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "review: lf82-rename-last, V1-V3 and X0 pass (AR53-AR55 to the UI reviewer, screen locked), 52bc5bea"
depends_on: [lf81-rename-edges]
boundary: ["frontend/src/lib/railGroup.ts", "frontend/src/lib/", "frontend/src/styles/global.css", "frontend/src/components/Rail.tsx", "frontend/src/components/"]
spec: "docs/specs/leftovers-82.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-82.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
A cut name never reads '….' or splits a character, and a closed group head sits level.

## Gate
docs/specs/leftovers-82.md, rows V1-V3, AR53-AR55 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #80).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); there is no DOM test library; a test outside the named files may change only where it asserts the old line.
- Design: Aglaea's 6aa41021; graphemes through `Intl.Segmenter`; anything else to the FSE.
- Short-sample fallback: the existing fixtures with two groups, one renamed in the row to a 60-grapheme name with an emoji at 24; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and output under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon; stop the fixture's stand-ins with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before removing its dir.

## Done
- l82-build, 2026-11-08: FR-1 to FR-3 on `lf82-rename-last` (6db00fbf, 0539df6f, 52bc5bea; on origin/main b87a4cd6, no rebase needed). V1-V3 fail on b87a4cd6 and pass on the branch; whole vitest 1796 passed; X0 passes in a clean clone. AR53-AR55 not self-checked (screen locked); the reviewer's steps and `h82.js` in `.wt-notes/l82-build/progress.md`.

## Declared changes
- modified `frontend/src/lib/railGroup.ts:cutName`: counts graphemes through `Intl.Segmenter`, never splits one at the 24th place (FR-1)
- added `frontend/src/lib/railGroup.ts:graphemes`: a string's graphemes, code points where Segmenter is missing
- added `frontend/src/lib/railGroup.ts:cut`: the cut text and whether it was cut
- added `frontend/src/lib/railGroup.ts:line`: the refusal sentence, no period after a cut name (FR-2)
- modified `frontend/src/lib/railGroup.ts:takenLine`: same output, now through `line`
- modified `frontend/src/lib/railGroup.ts:takenLines`: `shown` drops the period after a cut name; `said` unchanged (FR-2)
- modified `frontend/src/lib/railGroup.test.ts`: V1, V2 added; lf81 V3's two asserts on the old `….` line follow
- modified `frontend/src/styles/global.css`: `.rail-group-head .rail-group-tools` height 24, new `.rail-group-head > .rail-chevron`, `.rail-group-head .rail-group-name`, `.rail-group-head > .rail-counts` 24 px line boxes (FR-3)
- added `frontend/src/components/Rail.lf82.test.tsx`: V3, reads global.css as text
Risky:
- `.rail-group-head .rail-group-name` line-height: every head (named, Roles, Asleep, Archived) grows to 24 px at rest; the rail's vertical rhythm moves by a few px per head
Not changed, on purpose:
- `frontend/src/styles/shell.css:.rail-group-title`: outside the boundary; a 24 px line on it would push a rename field down through baseline alignment (AR52)
- `frontend/src/components/Rail.tsx`: no wrapper needed

