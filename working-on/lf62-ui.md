---
title: "The header says both counts when they differ and keeps its place on resize; Usage lists rejected rows"
status: now
repos: [organizer]
branch: lf62-ui
seat: l62-ui
reviewer: l62-rev, l62-uirev
stage:
updated: 2026-11-02
next: "merged as organizer #41 4fabf9f; supervisor moves it to done/"
review: "l62-rev 2026-11-02: pass at 7af4654, unmet none (U1 U3 U4 fail on 9cee125, pass on branch; U2 hook and CSS checked, geometry is l62-uirev's; X0 passes whole with specs 172790b)"
depends_on: [lf62-go]
boundary: ["frontend/src/components/InitiativeHeader.tsx", "frontend/src/lib/header.ts", "frontend/src/styles/shell.css", "frontend/src/components/Usage.tsx", "frontend/src/components/UsageTable.tsx", "frontend/src/lib/decisionStates.test.ts", "frontend/wailsjs/", "reviewresize.go", "reviewresize_test.go", "app.go"]
spec: "docs/specs/leftovers-62.md (FR-5 to FR-8)"
gate: "docs/specs/leftovers-62.md#Acceptance → gate"
ui_review: true
ui_review_verdict: pass
autonomy: unattended
prs:
  - {repo: organizer, pr: 41, target: main, state: merged, merge: 4fabf9f}
---

## Goal
Pablo reads the header the same way at any window size, and sees which usage rows the record refused.

## Gate
docs/specs/leftovers-62.md, rows U1-U4 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); U2 in the review build.
- Short-sample fallback: a state a fixture lacks is added to the card's own fixture; never the real home, never skipped.
- Data shape across states: the existing types; FR-3 adds the rejected rows to the usage JSON as `{session_id, day, reason}`.
- Design questions: Aglaea's DS7 and R53 (Amendment 20) answer them; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Evidence: test output and shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-02 l62-ui: built FR-5 to FR-8 on `lf62-ui`, rebased on origin/main 9cee125, head 7af4654; gate rows and evidence in `.wt-notes/l62-ui/progress.md`.

## Notes
- FR-5's equal case was contradictory (FR-5 "unchanged" vs U1/DS7 `5 decisions waiting`); ruled (a) via the FSE: leftovers-62 Amendment 1.
- U2's resize needs Go (no env in the frontend, no devtools in the review build): leftovers-62 Amendment 2, `ORGANIZER_REVIEW_RESIZE`.
- U2 measured offscreen (session locked, not by AX): with the screen locked, AX of the review build's pid gives no window (AXWindows answers the AXApplication, hit test -25208) and `screencapture -l` fails; sup108 ruled the offscreen harness of the same sha. The reviewer reruns by AX if the session is unlocked, else `.wt-notes/l62-ui/offscreen/harness`.
- X0: `TestReportDecodesContract` (internal/service, report.go) fails with CONTRACTS_DIR at d20fa85, on origin/main 9cee125 too; not this card's.

## Declared changes
- modified `frontend/src/lib/header.ts:waitingChip`: the chip says the lead's share when it differs (FR-5, DS7, Amendment 1)
- added `frontend/src/lib/header.ts:leadShare`: the one place the three cases (equal, none, between) are told apart
- modified `frontend/src/lib/header.test.ts`: U1 rows, the old unequal case's wording
- modified `frontend/src/lib/decisionCrossings.test.ts`: the fixture's unequal chip now reads both counts
- modified `frontend/src/components/InitiativeHeader.cells.test.tsx`: U1 on the drawn chip, text and accessible name
- added `frontend/src/components/UsageTable.tsx:UsageRejected`: the rows the record refused, session, day, reason (FR-7)
- added `frontend/src/components/UsageTable.tsx:UsageRejectedRow`: the row's type
- modified `frontend/src/components/Usage.tsx:Usage`: draws UsageRejected under the week; `UsageData` gains `rejected`
- added `frontend/src/components/Usage.rejected.test.tsx`: U3
- modified `frontend/src/lib/decisionStates.test.ts`: `stripComments` a scan that knows strings, templates and regexes (FR-8), U4
- modified `frontend/src/styles/shell.css`: `.ihead` a flex column, children `flex: none`, so the header follows a live resize (FR-6)
- added `reviewresize.go`: `ORGANIZER_REVIEW_RESIZE=<w>x<h>@<seconds>` resizes the window once by runtime.WindowSetSize (U2, Amendment 2)
- added `reviewresize_test.go`: parse, inert when unset, once after the delay, cancelled
- modified `app.go:startup`: one line, `startReviewResize(ctx)`
Risky:
- `shell.css .ihead`: every initiative screen's header changes layout model; measured equal to the grid at 1440 (76/44) and to a fresh open at 1024; compact open keeps its own, more specific flex rules
- `app.go:startup`: the hook runs only with the env var set; unset it returns before starting anything
Not changed, on purpose:
- `frontend/src/styles/usage.css`: outside the boundary; the rejected list reuses the usage table's classes
- `frontend/wailsjs/`: `RejectedRow` was already bound (lf62-go)
- `frontend/src/components/InitiativeHeader.tsx`: the chip's text is already its accessible name; nothing to change

## Review
- Verdict: **pass** at 7af4654 (branch lf62-ui on origin/main 9cee125), code review. Unmet rows: none. Reviewer l62-rev, 2026-11-02. Clean clone `.wt-notes/l62-rev/clean`; logs beside it.
- change-check (`change-check organizer lf62-ui --base origin/main`, base 06204c675 = 9cee125 plus card commits): 12 files, 6 flags; undeclared 0, declared not changed 0.
  - outside boundary ×4 (`InitiativeHeader.cells.test.tsx`, `Usage.rejected.test.tsx`, `header.test.ts`, `decisionCrossings.test.ts`): the spec's boundary includes "and their tests"; the first three test InitiativeHeader, Usage and header.ts, and `decisionCrossings.test.ts` asserts `waitingChip`'s text (header.ts), changed only to the FR-5 wording. Explained.
  - untested? `leadShare`: private, all three cases run through `waitingChip` in header.test.ts. `App.startup`: the one line calls `startReviewResize`, which `TestReviewResizeUnsetDoesNothing` calls unset. Explained.
- U1 met: header.test.ts and InitiativeHeader.cells.test.tsx check 6/5 `6 decisions waiting · 5 on you`, 5/5 `5 decisions waiting on you`, 6/0 `6 decisions waiting` (Amendment 1), text and no aria-label. On 9cee125 the unequal cases fail; the equal and none cases pass there, as Amendment 1 says they are unchanged.
- U2 met (code side): `reviewresize.go` parses `<w>x<h>@<s>`, calls `runtime.WindowSetSize` once after the delay, cancels on ctx; `TestReviewResizeUnsetDoesNothing` (empty, blank, malformed, and `startReviewResize` unset), parse, once-after-delay and cancelled tests pass. app.go changes by one line. shell.css: `.ihead` grid to flex column with `flex: none` children, so each child sizes from content on every layout; that supports a live resize. The measured geometry is l62-uirev's.
- U3 met: Usage.rejected.test.tsx renders the Usage view over FR-3's JSON, both rows with session, day, reason; 3 of 4 tests fail on 9cee125 (the empty-case one passes there by nature). `rejected` matches `UsageResult.rejected` in wailsjs models.ts.
- U4 met: the new `stripComments` keeps `"a // b"; x === "proposed"`. The fix is in the test file itself, so the fail on main was shown by grafting the U4 assertion onto 9cee125's old `stripComments`: `expected false to be true`.
- X0 met: `pnpm install --frozen-lockfile` 0; `make test` with `CONTRACTS_DIR=.wt-notes/sup108/specs/contracts` (agent-mailbox-specs 172790b) exits 0, every Go package ok, vitest 99 files 1643 tests; `TestReportDecodesContract` passes (sup108's correction: no longer a known failure); `wails build` 0; `git status --porcelain` empty with no runtime checkout needed. `make review-build` is the UI reviewer's.
- Note: `stripComments` treats `/` after `)` as division, so a regex after `)` would be misread; a `//` inside such a regex would then hide the rest of its line from the guard. No case is shown in today's sources (unproved, so not a finding).

## UI review
- Verdict: **pass** at 7af4654 (branch lf62-ui, unmoved), reviewer l62-uirev, 2026-11-02. Unmet rows: none. Clean clone `.wt-notes/l62-uirev/clean`; `pnpm install --frozen-lockfile` 0; `make test` reused l62-rev's lease run of 7af4654 (exit 0); `make review-build` 0.
- **The session was locked** (`ioreg`: `CGSSessionScreenIsLocked` true), so no AX geometry and no `screencapture`: `screencapture -l 86943` (the review build's window) says "could not create image from window". Every shot and measurement below is an **offscreen WKWebView render of my clone's own `frontend/dist` at 7af4654** (the builder's harness source, recompiled in `.wt-notes/l62-uirev/offscreen/`, bindings stubbed with `organizer board --json` over a fresh fixture home from my build; `takeSnapshot`, `getBoundingClientRect`). Shots in `.wt-notes/l62-uirev/offscreen/shots/`.
- The real review build did run: launched by its path through `scripts/fixture-home.sh` in the same shell (`.wt-notes/l62-uirev/launch.sh`; `ORGANIZER_CONFIG` and `XDG_DATA_HOME` both under `/private/tmp/organizer-fixture.a2sfuk`, auth off), pid 56507, `ORGANIZER_REVIEW_RESIZE=1024x640@15`. Its log: `review resize: ORGANIZER_REVIEW_RESIZE=1024x640@15, window set to 1024x640`; CGWindow bounds went to 922×577 (0.9 of the asked size on this display, as the builder saw). Quit by saved pid, and the fixture's stand-in agents by `FIXTURE_AGENT_PIDS` after checking each command line.
- **U2 met (offscreen).** init-a, rail expanded:

  | run | header | bar | last row bottom | sub-tabs top | gap |
  |---|---|---|---|---|---|
  | opened 1440×900 | 76 | 44 | 36 | 44 | 8 |
  | live to 1024×640, not reopened | 96 | 64 | 60 | 64 | **4** |
  | opened at 1024×640 | 96 | 64 | 60 | 64 | **4** |

  Same gap live and fresh; no overlap. `u2-open-1440x900.png`, `u2-live-1024x640.png`, `u2-fresh-1024x640.png`.
- **U1 look met.** The three cases, drawn in the header (board variants of the fixture: as is; 0005 withdrawn; every proposed owner alejandro): `6 decisions waiting · 5 on you` (`u1-unequal-fresh-1024x640.png`), `5 decisions waiting on you` (`u1-equal-…`), `6 decisions waiting` (`u1-none-…`). The chip is a `<button>` with no `aria-label`, so its text is its accessible name in all three; never clipped (165 px at most), one line, same place. With init-a's cell (human pablo) the FSE panel beside it reads `waiting on you: 5`, so the screen agrees with itself (`u1-unequal-cell-open-1440x900.png`). Without a cell stub the panel read 6 (no human seat, `fseWaiting` counts every non-FSE owner): an artifact of the harness, not the build.
- **U3 look met.** The fixture has no rejected rows, so `Usage` was stubbed with its own `organizer usage --json` plus two FR-3 rows (`{session_id, day, reason}`, full-length session ids). Under the week: `Rejected by the record · 2  not resent until they change`, then session (mono), day, reason per row, oldest first; no horizontal scroll at 1440 or 1024 (`u3-usage.png`, `u3-usage1024.png`). Zero rows: no section (`u3-none-usage.json`).
- Notes for the FSE (none a fail, none against the spec):
  1. The rejected list says what was refused and why, not what Pablo can do about it ("not resent until they change" leaves him guessing whether he must act). Heuristic, Nielsen 9; severity 2. Proposal: one line under the title, the action or that none is needed.
  2. "the record" is the system's name (discuss-record); on a Usage screen it can read as "the record of usage". Heuristic, Nielsen 2; severity 1.
  3. At 1024 the gap above the sub-tabs is 4 px against 8 px at 1440 (on main too, when opened at 1024); R53 asks only that live equal fresh. Severity 1.
- Not verified: geometry by AX and window shots of the real build (session locked); the rejected rows from a real record's refusal (stubbed rows).

