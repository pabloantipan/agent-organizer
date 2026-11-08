---
title: "A refused rename shows, says the way out, and is heard every time"
status: done
repos: [organizer]
branch: lf79-refused-field
seat: l79-build
reviewer: l79-rev
review: "pass: V1, V2, V3, X0 met at 6220c78f (l79-rev, 2026-11-08); AR46-AR48 to l79-ui"
stage:
updated: 2026-11-08
next: "done: merged as organizer #76 06e1a95c"
depends_on: [lf78-group-names]
boundary: ["frontend/src/components/Rail.tsx", "frontend/src/lib/railGroup.ts", "frontend/src/lib/", "frontend/src/styles/global.css", "frontend/src/components/"]
spec: "docs/specs/leftovers-79.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-79.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
prs:
  - {repo: organizer, pr: 76, target: main, state: merged, merge: 06e1a95c}
---

## Goal
A refused group rename is marked, says how to leave, and is announced every time.

## Gate
docs/specs/leftovers-79.md, rows V1-V3, AR46-AR48 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #74).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`), fake timers for V3; there is no DOM test library, so "stays open" and "Escape closes" are UI rows; a test outside the named files may change only where it asserts the old line.
- Design: Aglaea's fa0d4ca0 and the design system's "Refused field"; the words are FR-2's; anything else to the FSE.
- Short-sample fallback: the existing fixtures with two groups; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and output under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon; stop the fixture's stand-ins with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before removing its dir.

## Done
- 2026-11-08 l79-build: FR-1 to FR-3 on `lf79-refused-field` (7dae2859, b091e21a, 6220c78f) on origin/main a9890871. V1-V3 fail on a9890871 (7 of 10 cases) and pass on the branch; X0 passes in a clean clone. AR46-AR48 not self-checked (screen locked); steps in `.wt-notes/l79-build/progress.md`.

## Declared changes
- modified `frontend/src/lib/railGroup.ts:takenLine`: takes the current name and adds `Type another name, or press Escape to keep <current>.` (FR-2)
- modified `frontend/src/components/Rail.tsx:Rail`: passes the group's shown label as the current name; owns an sr-only live region (`useLiveRegion`) in both navs and says the line on every refusal (FR-2, FR-3)
- added `frontend/src/components/Rail.tsx:holdsRefused`: the field is invalid only while its value is the refused text (FR-1)
- modified `frontend/src/components/Rail.tsx:RenameField`: tracks its value; `aria-invalid` follows `holdsRefused`; the visible line loses `role`/`aria-live` (FR-1, FR-3)
- modified `frontend/src/styles/global.css`: `.rail-group-name-input[aria-invalid="true"]` 2 px `--status-blocked`, padding 0 5px (FR-1)
- added `frontend/src/components/Rail.lf79.test.tsx`: V1, V3
- modified `frontend/src/lib/railGroup.test.ts`: V2; leftovers-78 V2's two old-line asserts
- modified `frontend/src/components/Rail.lf78.test.tsx`: V5's old-line asserts only (line text, no role/aria-live)
Risky:
- `RenameField`: value tracked by `onChange`; a value set without an `input` event would not clear the mark
- `Rail`: the region is a direct child of `nav.rail` (positioned scroller); a layout test counting nav children would see one more
Not changed, on purpose:
- `frontend/src/lib/liveRegion.ts`: `useLiveRegion` already empties and sets 100 ms later; no new announcer
- `.rail-rename-line:empty { display: none }`: the visible line is no longer the live region
- `FloatList.tsx`, the store, Go: outside the boundary and not needed

## Review
Verdict: **pass**. Unmet rows: none of V1, V2, V3, X0 (AR46-AR48 are l79-ui's). Reviewer l79-rev, 2026-11-08, commit 6220c78f (on origin/main a9890871), fresh clone of the GitHub remote.

change-check (`change-check organizer lf79-refused-field --base origin/main`, full output in `.wt-notes/l79-rev/change-check.txt`): 6 files, outside boundary 0, risk 0, untested 0; 3 flags:
- `undeclared Rail.lf79.test.tsx (added)` and `declared, not changed Rail.lf79.test.tsx:V1` / `:V3`: one artifact. The declaration `added \`…Rail.lf79.test.tsx\`: V1, V3` was parsed as symbols `V1`, `V3`; the file is added as declared. Explained, not a finding.

Rows:
- V1-V3: `npx vitest run src/components/Rail.lf79.test.tsx src/lib/railGroup.test.ts -t "leftovers-79"`: branch 10 passed; on a9890871 with both test files laid over 7 failed, 3 passed (both V2, V1 border/holdsRefused/render, V3 region and plain line; the 3 passing are preconditions, as the builder says). Logs `base-V.log`, `branch-V.log`.
- X0: pnpm install --frozen-lockfile 0; `make test` 0 (19 Go ok, vitest 108 files 1767 passed), test-lease **fresh** run 43566c5767ec437e89e19b1fd3e31c48; `wails build` 0; `make review-build` 0; wailsjs/runtime unchanged; `git status --porcelain` empty.

Read against the FRs, with cases the builder's tests lack (`rev-extra.test.tsx`, `extra.log`):
- FR-1: `aria-invalid` follows `holdsRefused(refused, value)`, value tracked by onChange; border rule `.rail-group-name-input[aria-invalid="true"]` (0,2,0) outranks `input:focus` (0,1,1). Typing back to ` ACME ` exactly marks it again (true); `ACME` or ` acme ` do not (exact text, not the fold) — matches "while the field holds the refused text". Line stays (it reads `refused`, cleared only on Enter/blur success, Escape, or editing change).
- FR-2: line exact. Current name is `railGroupLabel(stored[i])`: the seed shows `No client`, or `Initiatives with no client` beside a group called No client (checked). Escape = onCancel: clears refused, closes, persists nothing.
- FR-3: visible line has no role/aria-live; one `.sr-only rail-said` region per Rail (one nav drawn at a time), no display:none/visibility:hidden on `.sr-only`, `.rail-said`, role or aria-live selectors in any stylesheet. Second refusal at +50 ms: region `["",""]` at 149 ms, the line at 150 ms (only the newer one, 100 ms after it); the hook's effect cleanup clears the timer on unmount and on a new `due`.
- global.css: 4 lines, the rename field rule only, `--status-blocked` (tier 2), no oklch/color-mix/nesting/@layer. Changed old tests: only the old-line asserts (railGroup.test.ts lf78 V2, Rail.lf78.test.tsx V5).

Note: change-check reads `: V1, V3` after a file bullet as symbols; goes to the change-check owner (Hephaistos), not this card.
Note: typing back to the refused text re-marks the field; if Aglaea wants it otherwise it goes to l79-ui (AR46).


## UI review
Verdict: **pass**. Commit reviewed 6220c78f (on origin/main a9890871). Reviewer l79-ui, 2026-11-08. AR46, AR47, AR48 met. Sev 4/3: none.

How checked: **offscreen** for every row. `CGSSessionScreenIsLocked` was 1 at start, so no AX and no window shot of the review build. `make review-build` built (exit 0) but was not launched. The rows ran in the offscreen WKWebView harness (l78-ui's, copied to `.wt-notes/l79-ui/`, window at -20000, never ordered in), 1024x640, over `wails dev` from the worktree with the real Go bindings on the default fixture (`eval "$(scripts/fixture-home.sh)"` in the same shell; `ORGANIZER_CONFIG` and `XDG_DATA_HOME` under `/private/tmp/organizer-fixture.0opxwD/`, checked before start; auth off). Enter and Escape went as key events to the harness window only, and the letter as an `input` event, the way l79-build's recipe does it. Nothing was posted to the system. Log: `.wt-notes/l79-ui/h-1024x640.txt`, steps `steps.txt`, helpers `h.js`, `h79.js`.

Shared test run: **reused** test-lease run 43566c57-48111 of 6220c78fb343 (l79-rev's), exit 0 (`x0-make-test.log`).

Rows (fixture: Group by client; `personal` renamed `misc`, then `misc` renamed ` no client `, which the client group `No client` holds):
- **AR46 met.** Refused: `aria-invalid="true"`, `aria-describedby` points at the line, border `2px solid rgb(255,77,99)` = `--status-blocked` #ff4d63, focused and blurred both. Padding `0 5px`, so the field stays 120x28 and nothing moves. One letter typed (` no clientx`): `aria-invalid` is gone, the border is back to 1 px `--focus-ring`, and the line stays. Shots: `.wt-notes/l79-ui/shots/1024x640-AR46-field-open.png`, `-AR46-refused-blurred.png`, `-AR46-refused.png`, `-AR46-typed.png`. Contrast on the rail (`--bg-sunken` rgb(18,14,25)): border 5.89:1 (needs 3:1), line `--danger` 5.89:1 (needs 4.5:1).
- **AR47 met.** The line reads `A group is already called No client. Type another name, or press Escape to keep misc.` exactly, in sentence case. Escape closes the field, the head reads `misc`, and focus goes to a button. `GetOrder()` is identical before the refusal (order1) and after Escape (order3): nothing stored. Shot: `.wt-notes/l79-ui/shots/1024x640-AR47-escaped.png`.
- **AR48 met.** Before any refusal, `nav.rail > span.sr-only.rail-said`: role `alert`, `aria-live="assertive"`, `aria-atomic="true"`, empty, `display: block`, absolute, 1x1, `clip: rect(0 0 0 0)`. The rail does not scroll sideways (235/235) and the document is 1024x640, so the region does not show or shift layout. The visible line has no role and no `aria-live`. A MutationObserver on the region: refusal 1 (blur) sets the sentence. Refusal 2 (Enter, same text) empties it at 437 ms and sets it at 543 ms (+106). Refusal 3 (Enter) empties it at 436 ms and sets it at 545 ms (+109). Shots: `.wt-notes/l79-ui/shots/1024x640-AR48-before.png`, `-AR48-second-refusal.png`. Not verified: VoiceOver output and AX announcement notifications (screen locked, offscreen).

Findings (none fails):
- U1 (severity 1). What: after Escape, the sr-only region still holds the refusal sentence. Where: `nav.rail > .rail-said` once the field has closed (`-AR47-escaped.png` does not show it; it is hidden). Evidence: `H.said()` after Escape returns the sentence. A screen reader reading the rail by line may land on a stale "A group is already called …". Proposal: empty the region when the field closes (Escape or a successful rename).
- U2 (severity 1, as l79-rev noted). What: typing the refused text back exactly (` no client `) marks the field again. Where: the rename field. Evidence: the `retyped` step returns `invalid: "true"` and 2 px red. This matches FR-1 ("while the field holds the refused text"). No change is proposed; it is recorded for aglaea only.

Not compared on a9890871 by screen (it would need a second dev server). l79-rev's V1-V3 on a9890871 already show the plain field and the one-sentence line, with the line itself as the alert.

Spec gaps (for the FSE): FR-3 does not say whether the region is cleared when the field closes (U1).

For aglaea (design questions, not verified): Q1, should the sr-only region empty when the field closes (U1)? Q2, the refusal line wraps to three lines at 180 px under the field and starts under the group's chevron (`-AR46-refused.png`); that is the lf78 layout, not this card's.

Housekeeping: the worktree, fixture stand-ins and temp dir are removed. `safe-kill` refused the `wails dev` tree because nohup reparented it to launchd, and a plain kill was denied. Pids 67618 (`wails dev -devserver localhost:34679`), 68274, 68298, 68307 (vite, esbuild) and 68715 (the dev `Deltagos.app` from the removed worktree, fixture env) are still running and need stopping by those pids.
