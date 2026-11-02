---
title: "The header says both counts when they differ and keeps its place on resize; Usage lists rejected rows"
status: now
repos: [organizer]
branch: lf62-ui
seat: l62-ui
reviewer: l62-rev, l62-uirev
stage:
updated: 2026-11-02
next: "PR with talos-lab"
review: "l62-rev 2026-11-02: pass at 7af4654, unmet none (U1 U3 U4 fail on 9cee125, pass on branch; U2 hook and CSS checked, geometry is l62-uirev's; X0 passes whole with specs 172790b)"
depends_on: [lf62-go]
boundary: ["frontend/src/components/InitiativeHeader.tsx", "frontend/src/lib/header.ts", "frontend/src/styles/shell.css", "frontend/src/components/Usage.tsx", "frontend/src/components/UsageTable.tsx", "frontend/src/lib/decisionStates.test.ts", "frontend/wailsjs/", "reviewresize.go", "reviewresize_test.go", "app.go"]
spec: "docs/specs/leftovers-62.md (FR-5 to FR-8)"
gate: "docs/specs/leftovers-62.md#Acceptance → gate"
ui_review: true
autonomy: unattended
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
- Note: `stripComments` treats `/` after `)` as division, so a regex after `)` would be misread; no source file has one today, and the literal guard would over-report, not miss. Not a finding.

