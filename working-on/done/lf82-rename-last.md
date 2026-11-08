---
title: "The last rename polish: no '….', a level head, cuts by grapheme"
status: done
repos: [organizer]
branch: lf82-rename-last
seat: l82-build
reviewer: l82-rev
review: "pass: V1-V3 and X0 (l82-rev) and AR53-AR55 (l82-ui) met at c23a3952, round 2"
stage:
updated: 2026-11-08
next: "merged in organizer #82, 03f7d9b3"
depends_on: [lf81-rename-edges]
boundary: ["frontend/src/lib/railGroup.ts", "frontend/src/lib/", "frontend/src/styles/global.css", "frontend/src/components/Rail.tsx", "frontend/src/components/"]
spec: "docs/specs/leftovers-82.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-82.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
prs:
  - {repo: organizer, pr: 82, target: main, state: merged, merge: 03f7d9b3}
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
- l82-build, 2026-11-08: UI review F1 (AR55) fixed in c23a3952: the chevron's min-height 24 beats the global button's 28; V3 checks the computed box (Amendment 1), fails on 52bc5bea (28), passes; X0 passes again in a clean clone; origin/main still b87a4cd6, no rebase.

## Declared changes
- modified `frontend/src/lib/railGroup.ts:cutName`: counts graphemes through `Intl.Segmenter`, never splits one at the 24th place (FR-1)
- added `frontend/src/lib/railGroup.ts:graphemes`: a string's graphemes, code points where Segmenter is missing
- added `frontend/src/lib/railGroup.ts:cut`: the cut text and whether it was cut
- added `frontend/src/lib/railGroup.ts:line`: the refusal sentence, no period after a cut name (FR-2)
- modified `frontend/src/lib/railGroup.ts:takenLine`: same output, now through `line`
- modified `frontend/src/lib/railGroup.ts:takenLines`: `shown` drops the period after a cut name; `said` unchanged (FR-2)
- modified `frontend/src/lib/railGroup.test.ts`: V1, V2 added; lf81 V3's two asserts on the old `….` line follow
- modified `frontend/src/styles/global.css`: `.rail-group-head .rail-group-tools` height 24, new `.rail-group-head > .rail-chevron` (height and min-height 24, against the global button's --control-md), `.rail-group-head .rail-group-name`, `.rail-group-head > .rail-counts` 24 px line boxes (FR-3)
- added `frontend/src/components/Rail.lf82.test.tsx`: V3, reads global.css as text and resolves the chevron's height and min-height through the cascade (Amendment 1)
Risky:
- `.rail-group-head > .rail-chevron` min-height 24: every head's chevron was 28 px from the global button rule; the head at rest goes from 38 to 34 px (6 + 24 + 4), so the rail's heads sit 4 px tighter
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


### Round 2
- Verdict: **pass** for the code gate (V1, V2, V3 with Amendment 1, X0). Unmet rows: none. AR55 is l82-ui's again.
- Reviewer l82-rev, 2026-11-08, commit c23a3952 (one commit on 52bc5bea), fresh clone of origin plus the local branch.
- change-check (`--base origin/main`): 4 files, `0 flags` in every category; the new Risky line (chevron min-height, heads 4 px tighter) is declared.
- Diff 52bc5bea..c23a3952: only `global.css` (`.rail-group-head > .rail-chevron` gains `min-height: var(--control-sm)` and its comment) and `Rail.lf82.test.tsx` (one new V3 row). The global `button` rule (global.css:21, `min-height: var(--control-md)`) is the 28 px; the head rule (0,2,0) outranks it. No Safari 15.0 floor issue.
- V3: the new row fails at 52bc5bea (`expected 28 to be 24`, 1 failed, 17 passed) and passes at c23a3952; V1, V2, V3 all pass, 18 passed (`r2-prev-V.log`, `r2-branch-V.log`).
- X0: `make test` exit 0 (vitest 112 files, 1798 passed; go ok), test run **fresh** `d8bf7b2c411446e33bbd9b1d0f046e42`; `wails build` 0; `make review-build` 0 (not launched); `git status --porcelain` empty after the wailsjs checkout. Clones removed.

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

### Round 2 (l82-ui, 2026-11-08, commit reviewed c23a3952)
- Verdict: **pass**. Rows unmet: none. AR53, AR54 and AR55 met (AR55 as Amendment 1, fd29d368, reads it). Sev 4/3: none.
- How: **offscreen**, because `CGSSessionScreenIsLocked` was still Yes. There was no `wails dev` this time. WKWebView at 1024x640 loaded the worktree's built `frontend/dist` (from `make review-build`, exit 0), served by `http.server` for the length of one call and stopped with `safe-kill`. The bindings were mocked from the default fixture's real outputs: a `-tags l82ui` dump test applied by `-overlay`, run once under `eval "$(scripts/fixture-home.sh)"` with both paths under its temp dir, after which the stand-ins were stopped and the dir removed. `SetGroups` is stateful in the mock, so renames stick. The review build was not launched and no AX was read. The worktree was `.wt/l82-ui-r2`, not `.wt/l82-ui`: round 1's orphaned vite had recreated `.wt/l82-ui/frontend/.vite` there. Output: `.wt-notes/l82-ui/r2-h-1024x640.txt`, `r2-h3-1024x640.txt`; mock and steps in `.wt-notes/l82-ui/off/`.
- X0 shared test run: **reused** `d8bf7b2c-8721` of c23a39528763 (l82-rev's run), exit 0.
- **AR55: met.** Every head at rest (acme, personal, the long name, No client, other, Other, ccint, Asleep, Archived; open and closed) has spread **0**. The closed `Clients waiting on renewal now` has chevron, name, `⋯` and counts at top 230 with 24 px boxes, all centred at 242. F1 is fixed: the chevron's computed box is 24 px. With a refused three-line field (head 104 px), the chevron stays at the field's top (330 = 330), by its first line. The tools are hidden while editing, per Amendment 1. Shots: `.wt-notes/l82-ui/shots/r2-1024x640-AR55-rest-open.png`, `.wt-notes/l82-ui/shots/r2-1024x640-AR55-closed.png`, `.wt-notes/l82-ui/shots/r2-crop-AR55-closed.png`, `.wt-notes/l82-ui/shots/r2-1024x640-AR55-refused-field.png`.
- **AR53: still holds.** The line ends `…keep Initiatives of the sout👨‍👩‍👧‍👦…`, with the family emoji's 7 code points whole and then `…`. It is 4 lines and 180 px wide, and the announcer has all 60 graphemes plus the period. Shot: `.wt-notes/l82-ui/shots/r2-1024x640-AR53-refused-current.png`.
- **AR54: still holds.** A cut name at the end has no period. A cut label reads `…renew… Type another name`. A whole name at the end keeps its period (`…keep No client.`). The announcer keeps whole names and periods. Shot: `.wt-notes/l82-ui/shots/r2-1024x640-AR54-refused-label.png`.
- Observation, severity 1: the head at rest is now **34 px**, down from 38 at 52bc5bea. The 28 px chevron no longer sets the head's height, so each head below moves up 4 px. The rail shrank and did not grow, so this is not a fail. Listed for aglaea below.
- Observation, severity 1: while editing, the 24 px chevron centres at 342 and the 28 px field at 344, 2 px apart. At 52bc5bea both centred at 344. FR-3 holds while editing ("stay by its first line": the tops are equal), and the 1 px rule applies at rest only.
- For aglaea (design questions, not verified): (1) Is a 34 px group head at rest the rhythm you want, given every head below moves up 4 px compared with lf81? (2) Should the chevron centre on the 28 px field while it is open (2 px off now), or is top-aligned enough?
- Spec gaps (for the FSE): none new.
- Not verified: AX frames (screen locked). Live agents events are mocked as no-ops, and they do not touch the head.
- Housekeeping: the worktree `.wt/l82-ui-r2` and the stale `.wt/l82-ui` are removed. Round 1's `wails dev` (pid 66386), its `pnpm run dev` (67161) and its app (67594) are **still running**, and `safe-kill` refuses them (adopted by launchd). Someone has to stop them by those pids.
