---
title: "Rings whole in the wait line, one gap at the dot, the runs paragraph current"
status: now
repos: [organizer]
branch: lf70-small
seat: l70-build
reviewer: l70-rev, l70-ui
stage:
updated: 2026-11-02
next: "review: lf70-small, V1 V2 D1 X0 pass, AR32 U10 for l70-ui, fed7495"
depends_on: []
boundary: ["frontend/src/styles/runreport.css", "frontend/src/components/UsageTable.tsx", "frontend/src/styles/usage.css", "frontend/src/components/Usage.rejected.test.tsx", "frontend/src/components/RunReport.test.tsx", "CLAUDE.md"]
spec: "docs/specs/leftovers-70.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-70.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No ring cut in the run report, the Usage title evenly spaced, CLAUDE.md true about runs.

## Gate
docs/specs/leftovers-70.md, rows V1, V2, D1, AR32, U10 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); UI rows in the review build.
- Design: Aglaea's 5a333ac; anything else to the FSE.
- Short-sample fallback: the existing run-report and Usage fixtures; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-02 l70-build: FR-1 9b33504, FR-2 b546e67, FR-3 fed7495 on lf70-small, rebased on origin/main 440d577; V1 and V2 fail on 440d577 and pass on the branch, D1 holds, X0 passes in a clean clone. U10 measured in the review build (4 px before the dot, 5 after). AR32 not painted: the review window was not key, so no ring showed; it needs the reviewer to make the window key. Steps in `.wt-notes/l70-build/progress.md`.

## Declared changes
- modified `frontend/src/styles/runreport.css`: `.rt-waitline button:focus-visible, .rt-waitline a:focus-visible` draw the ring at `outline-offset: -2px`, since the line is `overflow: hidden` (FR-1, AR32)
- modified `frontend/src/components/UsageTable.tsx:UsageRejected`: title phrase and count wrapped in one `<span>`, so `.sec-title`'s flex gap no longer replaces the space after the dot (FR-2, U10)
- modified `frontend/src/components/RunReport.test.tsx`: V1
- modified `frontend/src/components/Usage.rejected.test.tsx`: V2
- modified `CLAUDE.md`: Runs baseline paragraph names `MatchRun`'s seat match, the reviewer and supervisor attribution and `task NNNN` (FR-3)
Risky:
- `.rt-waitline` controls: top and bottom of the inset ring fit only while the line box grows to the 24 px button; a fixed height on the line would cut them
Not changed, on purpose:
- `frontend/src/styles/usage.css`: the cause was markup, not a usage rule
- `frontend/src/styles/shell.css` `.sec-title`: out of boundary; `Home.tsx:79`, `:357` and `Overview.tsx:145` share the flex-gap cause (progress.md, Found, not asked)

## Notes
- AR32 on screen needs the review window key; an AX focus on an inactive window paints no ring in WKWebView.
