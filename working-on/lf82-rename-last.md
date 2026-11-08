---
title: "The last rename polish: no '….', a level head, cuts by grapheme"
status: now
repos: [organizer]
branch: lf82-rename-last
seat: l82-build
reviewer: l82-rev
review: "pass: V1-V3 and X0 met at 52bc5bea (l82-rev, 2026-11-08); AR53-AR55 to l82-ui"
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

## Review
- Verdict: **pass** for the code gate (V1, V2, V3, X0). Unmet rows: none. AR53-AR55 are l82-ui's.
- Reviewer l82-rev, 2026-11-08, commit 52bc5bea (on origin/main b87a4cd6), fresh clone of origin plus the local branch; notes and logs in `.wt-notes/l82-rev/`.
- change-check (`--base origin/main`): 4 files (Rail.lf82.test.tsx added, railGroup.test.ts, railGroup.ts, global.css modified), `0 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 0, could not read 0, boundary unreadable 0`. Nothing to explain.
- V1-V3: `npx vitest run src/lib/railGroup.test.ts src/components/Rail.lf82.test.tsx -t "leftovers-8[12]"`: branch 17 passed; b87a4cd6 with the two test files laid over: 9 failed, 8 passed (the V1 emoji, combining and 24/25 rows, V2's two cut rows, V3's chevron, name and tools rows, and lf81 V3's screen row on `….`) (`branch-V.log`, `main-V.log`).
- Changed test outside the new rows: `railGroup.test.ts` loses exactly two lines, both lf81 V3 asserts of the old `….` line.
- FR-1, my cases (`edge-cases.txt`): 24 letters whole, 25 cut to 24 + `…`; 23 letters + ZWJ family, + flag 🇨🇱, + 👋🏽, + `e`+U+0301 each kept whole at the 24th place then `…`; 23 + flag exactly (24 graphemes) whole; 24 combined `é` whole; 30 families, 25 skin-tone hands cut at 24 + `…`; 24 flags whole. Fallback without `Intl.Segmenter` is code points: never reached at the Safari 15.0 floor (Segmenter since 14.1), only a guard.
- FR-2: cut current at the end ends `…` with no period; cut label ends its sentence `… Type another…` (no period, per FR-2); whole names keep periods; `takenLines(a,b).shown === takenLine(a,b)` for whole names and equals `takenLine(cut,cut)` with `….` → `…` when both are cut; `said` is `takenLine` of the whole names with both periods.
- FR-3: global.css adds `height: var(--control-sm)` (24px) to the head's tools and 24 px boxes on `.rail-group-head > .rail-chevron`, `.rail-group-head .rail-group-name`, `.rail-group-head > .rail-counts`; the head keeps `align-items: flex-start`; nothing else in global.css changed; no oklch, color-mix, nesting or @layer.
- X0: `make test` exit 0 (go tests ok, vitest 112 files, 1797 passed), test run **fresh** `ad54f4bd76e2f1e6c5c9da3bc6f0ff57`; `wails build` 0; `make review-build` 0 (built `Deltagos Review.app`, not launched); `git status --porcelain` empty without needing the wailsjs checkout. Clones removed.
- Note: the counts rule (`.rail-group-head > .rail-counts`) goes beyond the three items FR-3 names; declared, inside the head's rules, and its geometry is AR55's to judge. Goes to: l82-ui (AR55).

