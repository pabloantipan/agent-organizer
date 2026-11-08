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
next: "merged as organizer #78 c481a3a3; supervisor moves it to done/"
depends_on: [lf79-refused-field]
boundary: ["frontend/src/components/Rail.tsx", "frontend/src/lib/liveRegion.ts", "frontend/src/lib/", "frontend/src/styles/global.css", "frontend/src/components/"]
spec: "docs/specs/leftovers-80.md (FR-1, FR-2)"
gate: "docs/specs/leftovers-80.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
prs:
  - {repo: organizer, pr: 78, target: main, state: merged, merge: c481a3a3}
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

## UI review
**Verdict: pass.** AR49 met, AR50 met. Sev 4/3: none. Reviewer l80-ui, 2026-11-08, commit 69ca546ff79157bdfbdece2559756eca6c08907c.

**How it was checked: offscreen, every row.** `CGSSessionScreenIsLocked` was true at start, so the review build (`make review-build`, exit 0, built, not launched) was not driven by AX. Every state ran in the offscreen WKWebView harness copied from l79-ui (`harness`, window at -20000,-20000, never shown, nothing posted to the system) over `wails dev` in the worktree, so the bindings were the real backend, not mocks. The default fixture (`eval "$(scripts/fixture-home.sh)"`; `ORGANIZER_CONFIG`, `XDG_DATA_HOME` checked under `/private/tmp/organizer-fixture.UsetlM`, auth off), 1024x640. Group by client gives the groups acme, personal and Initiatives with no client. `personal` was renamed to `misc`, then `misc` to ` no client `. Escape was a DOM keydown on the field. The announcer is `.rail-said`, read with `textContent` and a MutationObserver log. The frames are `getBoundingClientRect`. Steps, helpers and output are in `/Users/pabloantipan/organizer/.wt-notes/l80-ui/` (`steps.txt`, `h80x.js`, `h-1024x640.txt`). The 06e1a95c comparison was not run on screen (a second build and dev server). The failing V1 on main (l80-build, l80-rev) shows what it fixes.

**Shared test run: reused**, `test-lease: reused run dcc5c265-4584 of 69ca546ff791` (l80-rev's run). Worktree `git status --porcelain` was empty after the build and the run.

**AR49**: the announcer before, during, right after the close, 100 ms after, and 300 ms after (the further 200 ms):
- Escape: before, the sentence (`A group is already called No client. Type another name, or press Escape to keep misc.`). At 0, 100 and 300 ms, `""`. The log has only `""` and no later sentence.
- Save (field refused, `misc2` typed, blur): during, the sentence. At 0, 100 and 300 ms, `""`. The log has only `""`. The group reads misc2.
- Focus leaving (refused, `misc3` typed, focus to the acme chevron): at 0, 100 and 300 ms, `""`. The log has only `""`.
- Refuse, then Escape after the delayed set (harness steps cannot hit < 100 ms; V1 covers the pending set): the log is the sentence, then `""`, and nothing after.
- Shots: `/Users/pabloantipan/organizer/.wt-notes/l80-ui/shots/1024x640-AR50-refused.png`, `1024x640-AR50-escaped.png`.

**AR50** (the misc header, its line, the next group header `Initiatives with no client`, and the first row of misc, `init-b`):
- Before the refusal: the misc header is at top 550, init-b at 588, the next header at 1069 (the rail scrolls; scrollHeight 1745). `/Users/pabloantipan/organizer/.wt-notes/l80-ui/shots/1024x640-AR50-before.png`.
- Refused: the line is x 34, top 586, bottom 634, w 180, h 48, 3 lines of 16 px. `white-space: normal`, `overflow-wrap: break-word`, `overflow: visible`, no fixed height, `overflowsX` false. The head grows to 88 px. init-b is at 638 and the next header at 1119, both at or below 634. Every row below shifts by +50, with no clip and no overlap. `/Users/pabloantipan/organizer/.wt-notes/l80-ui/shots/1024x640-AR50-refused.png`.
- After Escape: no line. The rows are back at exactly the before tops (550, 588, ..., 1069), and focus is on the misc ⋯. `/Users/pabloantipan/organizer/.wt-notes/l80-ui/shots/1024x640-AR50-escaped.png`.
- A 40-character unbroken name: 5 lines, w 180, no x overflow, the next header below. Escape removes the line. `/Users/pabloantipan/organizer/.wt-notes/l80-ui/shots/1024x640-AR50-refused-long.png`.
- Design: colour `--danger` #ff4d63 on the rail rgb(18,14,25) is 5.89:1 (AA). 11 px (`--font-size-xs`), 16 px line height, weight 500. Sentence case. Reads as prose. The hidden region is `.sr-only`: absolute, 1x1, clipped, at -1,44, so it does not shift the layout.

**Findings**

U1 (sev 2), from sup122's extra case (the code reviewer's note).
- What the person cannot do: with a refused name in the field, collapsing the rail leaves the refusal in the strip's announcer. It says "press Escape to keep misc3", where no field is visible and Escape does nothing.
- Where: the collapsed strip's `.rail-said`. `/Users/pabloantipan/organizer/.wt-notes/l80-ui/shots/1024x640-AR49-collapsed.png`.
- Evidence: blur then collapse (as a pointer does): the region holds the sentence at 0, 200 and 400 ms, and the log is `""` then the sentence again at +100 ms (the blur re-refuses). Collapse with focus still in the field: the sentence is held, with no new set. Re-expanding shows the field still open with ` no client `, focused, and the line. Collapse is not a close (`editing` is kept), so the sentence is still true of the hidden field.
- Severity: 2. FR-1 names Escape, save and focus leaving, and a refused blur is said again by lf79 FR-3, so this is not a fail.
- Proposal: decide whether collapsing the rail closes the field as Escape does (then `hush`), or keeps it and drops the sentence from the strip.

U2 (sev 1), the builder's "Found, not asked", seen.
- What the person cannot do: on a three-line refusal, the chevron and the `· 7` count sit at the block's vertical middle, beside the line's first line, not beside the input.
- Where: `.rail-group-head` `align-items: center`. `/Users/pabloantipan/organizer/.wt-notes/l80-ui/shots/1024x640-AR50-refused.png`.
- Evidence: the shot.
- Severity: 1.
- Proposal: `align-items: flex-start` on the head while renaming.

**Spec gaps (for the FSE)**: collapsing the rail while the rename field is open is no close path in FR-1 or lf79. Name it (U1).

**For aglaea (design questions, not verified)**:
- Q1: should collapsing the rail cancel the rename (U1)?
- Q2: should the head's tools align to the input's line on a multi-line refusal (U2)?
- Q3: a long current name makes the line 5 lines at 180 px. Accept it, or clamp the quoted name?

**Not verified**: VoiceOver speech, and AX frames in the real review build (screen locked; offscreen DOM frames stand in).

