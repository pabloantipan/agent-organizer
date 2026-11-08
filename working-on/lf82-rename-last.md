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


## UI review
- Verdict: **fail**. Rows unmet: **AR55**. AR53 and AR54 met. cause: execution
- Reviewer l82-ui, 2026-11-08, commit **52bc5bea** (detached worktree, removed after). **Offscreen** for every row: `CGSSessionScreenIsLocked` was Yes at start. The steps ran in WKWebView at 1024x640 (l81-ui's harness copied to `.wt-notes/l82-ui/`) over `wails dev` of the worktree with the real Go backend on the default fixture (`eval "$(scripts/fixture-home.sh)"`; `ORGANIZER_CONFIG` and `XDG_DATA_HOME` under `/private/tmp/organizer-fixture.cSXzlO`). The review build was built (`make review-build` exit 0) but not launched, and no AX was read. The rename and the refusal went through the app's own field. Output: `.wt-notes/l82-ui/h-1024x640.txt`, `h2-`, `h3-`.
- X0 shared test run: **reused** `ad54f4bd-45886` of 52bc5bea8ab1 (l82-rev's run), exit 0.
- **AR53 (amended): met.** I renamed `personal` to the 60-grapheme name with the family ZWJ emoji at 24, then renamed it to ` acme `. The line shows `…to keep Initiatives of the sout👨‍👩‍👧‍👦…`. Its last graphemes are `u`, `t`, the family emoji with all 7 code points (U+1F468 200D 1F469 200D 1F467 200D 1F466), then `…`: no broken glyph and no stray joiner. The line is 4 lines and 180 px wide, 11 px, #ff4d63 on the rail #120e19 (5.89:1). The announcer says all 60 graphemes and the period. Shot: `.wt-notes/l82-ui/shots/1024x640-AR53-refused-current.png`.
- **AR54: met.** A cut name at the end of the sentence ends `…` with no period (`endsWith('….')` false). A cut label reads `A group is already called Clients waiting on renew… Type another name, …`, with no `….`. A whole name at the end keeps its period (`…to keep No client.`). The announcer holds both names whole, each with its period. The cut reads as a cut. Shots: `.wt-notes/l82-ui/shots/1024x640-AR54-refused-label.png`, `.wt-notes/l82-ui/shots/1024x640-AR54-refused-label-inview.png`, `.wt-notes/l82-ui/shots/crop-AR54-line.png`.
- **AR55: not met.** In the closed head (`Clients waiting on renewal now`), the name, `⋯` tools and counts each have a 24 px box at top 398, centre 410. The chevron's box is 28 px at top 398, centre 412, so the spread is **2 px**. Every head is the same: open, closed, Roles, Asleep, Archived, the long-name head (`REST-*` in h-1024x640.txt). With a refused field three lines high, the chevron stays by the field's first line: chevron top 330 equals the field's top 330, and its centre 344 equals the input's centre. Shots: `.wt-notes/l82-ui/shots/1024x640-AR55-rest-open.png`, `.wt-notes/l82-ui/shots/1024x640-AR55-closed.png`, `.wt-notes/l82-ui/shots/1024x640-AR55-refused-field.png`.
- **Finding 1 (severity 3): the chevron still sits 2 px below the name and ⋯ at rest.**
  1. What Pablo cannot do: see the group head level at rest, which is what FR-3 and AR55 exist for. The chevron glyph is drawn 2 px lower than the name and the ⋯ on every head.
  2. Where: the rail's group heads, all of them. See `.wt-notes/l82-ui/shots/1024x640-AR55-closed.png`.
  3. Evidence: on the chevron, `.rail-group-head > .rail-chevron { height: var(--control-sm) }` (global.css:195) computes to 28 px. The global `button { min-height: var(--control-md) }` (28 px) applies, and min-height beats height. The 12 px svg is centred in the 28 px box (top 8). The ⋯ button sets its own min-height of 24 px and comes out right. V3 passes because it reads the CSS text and never sees the cascade.
  4. Severity: 3. The defect is small on screen, but it is the one FR-3 asked to remove, and the gate row measures it.
  5. Proposal: add `min-height: 0` (or `min-height: var(--control-sm)`) to `.rail-group-head > .rail-chevron`. One declaration inside the boundary. A V3 row could assert min-height too.
- Design: tier-2 tokens only (`--control-sm`). The name is #b5afc3 on #120e19 (8.97:1). Sentence case is kept, and the uppercase labels are only the app's own. **Head height at rest is 38 px** (6 + 28 + 4). The 28 px chevron was already the tallest item, so the 24 px line boxes do not grow the head and nothing in the rail shifts. On this branch the counts (`.rail-counts`, 24 px box, centre 410) and the title (centre 410) sit level with the name. Editing keeps lf81's layout: the unrefused field has its top at 330 with a 28 px height, the same as the chevron. Nothing looks off besides the 2 px.
- Not verified: AX frames (screen locked, so the review build was not launched). The comparison against origin/main b87a4cd6 was not run because it needs a second dev server. The `….` and the 2-4 px are the spec's premises, and V1-V3 on main already show them in l82-rev's main-V.log.
- Spec gaps (for the FSE): FR-3 says "the chevron and tools stay by its first line" with a taller field. The ⋯ is not rendered while editing (`!isEditing`, Rail.tsx:329, pre-existing), so that half cannot be observed. Either drop "tools" from FR-3 or say they stay hidden.
- For aglaea: none.
- Housekeeping: the stand-ins are stopped, the fixture dir and the worktree are removed. My `wails dev` (pid 66386) and its app (pid 67594, fixture env, port 34682) are still running. They were orphaned to launchd, and `safe-kill` refuses them (the parent chain no longer reaches this session). Someone has to stop them by those pids.
