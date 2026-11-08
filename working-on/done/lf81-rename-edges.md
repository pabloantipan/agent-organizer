---
title: "Collapsing closes the rename, the head's tools sit at the top, long names are cut in the line"
status: done
repos: [organizer]
branch: lf81-rename-edges
seat: l81-build
reviewer: l81-rev
review: "pass: code (V1-V3, X0, l81-rev) and UI (AR51-AR53 offscreen, l81-ui) at 8cbff45c, 2026-11-08"
stage:
updated: 2026-11-08
next: "merged in #80 b87a4cd6"
depends_on: [lf80-refusal-close]
boundary: ["frontend/src/components/Rail.tsx", "frontend/src/lib/railGroup.ts", "frontend/src/lib/liveRegion.ts", "frontend/src/lib/", "frontend/src/styles/global.css", "frontend/src/components/"]
spec: "docs/specs/leftovers-81.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-81.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
prs:
  - {repo: organizer, pr: 80, target: main, state: merged, merge: b87a4cd6}
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

## UI review
**Verdict: pass.** Commit reviewed 8cbff45c. Rows unmet: none (AR51, AR52, AR53 met). Sev 4/3: none. Reviewer l81-ui, 2026-11-08.

How checked: **offscreen** for every row. `CGSSessionScreenIsLocked` was true at start, so the rows ran in the l80-ui WKWebView harness (copied to `.wt-notes/l81-ui/`, window never ordered in, no system input) against `wails dev` of my detached worktree at 8cbff45c, real bindings over the default fixture (`eval "$(scripts/fixture-home.sh)"` in the launching shell; `ORGANIZER_CONFIG` and `XDG_DATA_HOME` both under `/private/tmp/organizer-fixture.zNF8KJ`, no firebase). Not AX of a review build: the AX frames and AXFocusedUIElement asked for are read as DOM rects and `document.activeElement` instead; the collapse is the app's own in-rail toggle by `click()` (no mousedown, as AXPress), never the floating icon. `make review-build` exit 0 but not launched. Raw output `h-1024x640.txt`, `h2-1024x640.txt`, `h-main-1024x640.txt`; shots under `.wt-notes/l81-ui/shots/`.

Shared test run: **reused**, `test-lease: reused run e08753b6-34388 of 8cbff45ca844 by organizer-probe-l81-rev`, exit 0 (`x0-make-test.log`).

- **AR51 met** (`1024x640-AR51-refused.png`, `-AR51-collapsed.png`, `-AR51-expanded.png`). Refusal "A group is already called acme. … keep misc." in the line and the announcer; collapse by the toggle: announcer `""` right after, at 200 ms and at 400 ms; field gone; focus `button.strip-toggle` "expand the rail" (aria-label Initiatives rail, focus ring visible). Expanded: `misc` stands, no field, no line. Pending set (collapse 30 ms after the refusal): MutationObserver log `[[527, refusal], [923, ""]]`, nothing after. The code reviewer's blur note: unrefused `zzz` typed then collapse, and a refused `acme` retyped in the focused field then collapse: on expand `misc` stands, announcer `""` both times, so the field's removal neither saved nor refused (WebKit fires no blur on it). Main c481a3a3 (`-AR51-main-collapsed.png`): the announcer keeps the refusal after the collapse, focus drops to body, and expanding brings back the open field with its refusal.
- **AR52 met** (`1024x640-AR52-refused.png`, `-AR52-rest.png`). Three-line refusal (`No client`): head `align-items: flex-start`, field top 556, chevron top 556, the `· 7` count on the field's row; the line runs 586-634. The ⋯ is not rendered while renaming (as before), so the head's tools during the rename are chevron and count. Main: chevron top 581, mid-way down the 88 px block.
- **AR53 met** (`1024x640-AR53-refused.png`, `-AR53-refused-30label.png`). 60-character name refused against `acme`: line "… press Escape to keep Initiatives of the south…." (24 + `…`), sentence whole, 4 lines, 180 px wide; announcer holds the 60 characters whole. 60 against a 30-character label (`Work for the acme client, east`): both cut at 24 with `…`, rest whole, 4 lines; announcer both whole. The cut reads as a cut: a real `…` glyph, no clipped letter (`overflow: visible`, scrollWidth = clientWidth 180).
- Design system: line `--danger` rgb(255,77,99) on the rail rgb(18,14,25), 5.9:1 at 11/16 px; tier-2 tokens only in the changed rule; sentence case. Announcer is `sr-only` (absolute, 1×1, clip 0): no shift seen in any shot.

Findings (none fails the card):
1. Head at rest sits slightly off the ⋯. Who: anyone scanning group heads. Where: `1024x640-AR52-rest.png`, `misc · 7` head. Evidence: name 398-418 (centre 408), ⋯ 398-422 (410), chevron box 398-426 (412); the builder's Found, not asked, and l81-rev's note. Severity 1: about 2 px between text and ⋯ centres, the chevron glyph a little lower; not visible as misalignment at 1024. Proposal: none now; if Aglaea wants it, a 24 px line box for chevron and title.
2. Ellipsis meets the sentence's full stop. Who: the reader of the line. Where: `1024x640-AR53-refused-30label.png`, "client…." and "south….". Evidence: `cutName` + the sentence's own period gives four dots. Severity 1. Proposal: for aglaea, below.

Spec gaps (for the FSE): none new; l81-rev's code-point vs grapheme note stands (not checked on screen).

For aglaea (design questions, not verified): (a) the cut name followed by the sentence's period reads "…." — keep, or drop the period after a cut? (b) at rest, chevron and name ~2-4 px above the ⋯ centre with flex-start — acceptable, or a 24 px line box?

Not verified: the review build by AX (screen locked); AR52/AR53 frames as AX frames rather than DOM rects.

## Notes
- The cut also applies to the other group's label (the spec says "each name"); a label ≤ 24 shows whole.

