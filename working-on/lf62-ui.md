---
title: "The header says both counts when they differ and keeps its place on resize; Usage lists rejected rows"
status: now
repos: [organizer]
branch: lf62-ui
seat: l62-ui
reviewer: l62-rev, l62-uirev
stage:
updated: 2026-11-02
next: "review: lf62-ui, U1 U3 U4 met (fail on f454765, pass on branch); U2 met offscreen (session locked, not by AX; hook ran in the review build); X0 met but for TestReportDecodesContract, failing on origin/main too; 7af4654"
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
