---
title: "The run report, Usage and header say plainly what presses and what is not his"
status: now
repos: [organizer]
branch: lf67-ui-polish
seat: l67-ui
reviewer: l67-ui-rev, l67-ui-ui
stage:
updated: 2026-11-02
next: "review: lf67-ui-polish, gate met (V4, V5 vitest fail on 83056a1 and pass; AR27-AR30, U9, R53 seen in the review build; X0 pass), 2557347"
depends_on: []
boundary: ["frontend/src/components/RunReport.tsx", "frontend/src/components/RunTracks.tsx", "frontend/src/components/SpecReader.tsx", "frontend/src/components/UsageTable.tsx", "frontend/src/components/Home.tsx", "frontend/src/lib/runReport.ts", "frontend/src/lib/specReader.ts", "frontend/src/styles/runreport.css", "frontend/src/styles/spec-reader.css", "frontend/src/styles/shell.css", "frontend/src/styles/usage.css", "frontend/src/components/RunReport.lf64.test.tsx", "frontend/src/components/RunReport.test.tsx", "frontend/src/components/SpecReader.test.tsx", "frontend/src/components/Usage.rejected.test.tsx", "frontend/src/lib/runReport.test.ts", "frontend/src/lib/specReader.test.ts"]
spec: "docs/specs/leftovers-67.md (FR-8 to FR-14)"
gate: "docs/specs/leftovers-67.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No look promises a press that is not there, and the header sits evenly at every width.

## Gate
docs/specs/leftovers-67.md, rows V4, V5, AR27-AR30, U9, R53 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); UI rows in the review build.
- Design: Aglaea's amendments named in the spec; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Short-sample fallback: a state the fixture lacks is added to the fixture; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-02 l67-ui: FR-8 to FR-14 on lf67-ui-polish (dc670b6, 47a1631, a5f60fd, b6ab0ac, abefa95, 2557347), rebased on origin/main 83056a1; V4/V5 fail on 83056a1 (10) and pass; AR27-AR30, U9, R53 checked in the review build (screen unlocked, AX of the pid, `screencapture -l`); X0 pass from a clean clone. Evidence and the reviewer's lines: `.wt-notes/l67-ui/progress.md`.

## Declared changes
- modified `frontend/src/lib/runReport.ts`: added `waveFooterParts` and `NO_RUN_RECORD`, the footer split into the wave and the rest (FR-8)
- modified `frontend/src/components/RunReport.tsx:Progress`: the wave in `.rr-wave-key`; a footer with no record adds `.rr-no-record` ` · no run record` (FR-8)
- modified `frontend/src/lib/specReader.ts:roundsHtml`: the summary carries `rr-more` (FR-10)
- modified `frontend/src/styles/runreport.css`: `.rr-wave-key`, `.rr-no-record`, `.rr-card` min-width 24 and centred, `details > summary.rr-more` with a border-drawn ▸ (FR-8 to FR-10)
- modified `frontend/src/styles/spec-reader.css`: no ring on a landed reader heading or `.sr-path` (FR-11)
- modified `frontend/src/components/UsageTable.tsx:UsageRejected`: title `Not accepted by discuss-record · N`, line `REJECTED_WHY` (FR-12)
- modified `frontend/src/styles/usage.css`: `.usage-rejected-why`, sm muted (FR-12)
- modified `frontend/src/styles/shell.css`: `.ihead.folded > .ihead-bar` pads 8 under its last row, no 44 px floor (FR-13)
- modified `frontend/src/components/Home.tsx:runSignalFor`: the comment only, it reads `progress.dead_minutes` (FR-14)
- modified `frontend/src/components/RunReport.lf64.test.tsx`, `RunReport.test.tsx`, `Usage.rejected.test.tsx`: V4, V5 rows; P8, W2, W9, U3 read the new markup and words
- added `testdata/fixture-report/launch.sh`, `bin/factory`, `rejected.py`: the review states (no-record footer, two rejected rows, resize) over the fixture home and the contract fixture
Risky:
- `shell.css` `.ihead.folded > .ihead-bar`: every initiative's folded header; a first line shorter than 28 px now makes the bar shorter than 44 (gap stays 8)
Not changed, on purpose:
- `header.css` `.ihead .ihead-bar`: outside the boundary; overridden by the more specific shell.css rule
- the open header's gap to the sub-tabs (`.ihead-open` padding 12): R53 is the folded header's rows
- `.sec-title`'s uppercase: the rejected title is drawn uppercase like every section title

