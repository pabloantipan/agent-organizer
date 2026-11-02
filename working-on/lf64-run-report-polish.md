---
title: "The run report reads clearly at every size, and every wave footer keeps its promise"
status: now
repos: [organizer]
branch: lf64-run-report-polish
seat: l64-build
reviewer: l64-rev, l64-ui
stage:
updated: 2026-11-01
next: "review: lf64-run-report-polish, P1-P8 and X0 pass (UI rows in the review build by AX, shots by screencapture -l), 8eabfb4"
depends_on: []
boundary: ["frontend/src/components/RunReport.tsx", "frontend/src/components/RunTracks.tsx", "frontend/src/components/SpecReader.tsx", "frontend/src/lib/runReport.ts", "frontend/src/lib/specReader.ts", "frontend/src/styles/runreport.css"]
spec: "docs/specs/leftovers-64.md (FR-1 to FR-8)"
gate: "docs/specs/leftovers-64.md#Acceptance → gate"
ui_review: true
autonomy: unattended
---

## Goal
The report Pablo reads after a run has no false alarms, no dead presses and no zeros that mean "unknown".

## Gate
docs/specs/leftovers-64.md, rows P1-P8 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #26, #29).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); P3, P5, P8 in the review build.
- Design: Aglaea's run-report Amendment 3 and progress-and-waves Amendment 2 (60ea44c); anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Work's strip predicate: read it where Work defines it; export it if needed, change nothing else there.
- Short-sample fallback: a state the fixture lacks (two-day window, a wave with no strip) is added to the fixture; never the real home.
- Data shape across states: the factory report JSON as its schema gives it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- l64-build built it on `lf64-run-report-polish` (eaff097, be69d27, 8eabfb4) on origin/main 1bc2d44 (unmoved); P1, P2, P4, P6, P7, P8 vitest fail on 1bc2d44 (15 of 15) and pass; P2, P3, P5, P8 (and P7's names) in the review build by AX of its pid, shots by `screencapture -l` of its window (the screen allowed it); X0 passes from a clean clone. No fixture added: the contract fixture spans two days at -03 and its sup2/1 has no strip. Detail: `.wt-notes/l64-build/progress.md`.

## Declared changes
- modified `frontend/src/lib/runReport.ts:waitWords`: `0002 (pablo)`, `·` between waits only (FR-1)
- added `frontend/src/lib/runReport.ts:waitsWords`, `WAIT_SEP`, `waitsThatFit`, `moreWaits`: one-line waits and the `+N` with the rest in words (FR-1)
- added `frontend/src/lib/runReport.ts:NO_TOKENS`, `hasTokens`; modified `costWords`: `sessions: 0` reads no tokens recorded (FR-4)
- added `frontend/src/lib/runReport.ts:Strip`, `drawsStrip`; modified `ScanRuns`, `WaveTarget` (`none`), `waveTarget`, `waveLinkName`: Work only with a strip, else the record, else no press (FR-7, Amendment 1)
- modified `frontend/src/components/RunReport.tsx:Progress`: `days` class (FR-5); a `none` footer is a span named `<key>: no run record` (FR-7)
- added `frontend/src/components/RunReport.tsx:stripsOf`: WaveStrip's `running` over the agents feed (FR-7)
- modified `frontend/src/components/RunReport.tsx:goToWave`: `none` does nothing; `LocalRunReport`: loads the agents feed as Work does, passes strips
- modified `frontend/src/components/RunTracks.tsx:Waits`, added `Wait`: one measured line with `+N` (FR-1)
- modified `frontend/src/styles/runreport.css`: not-drawn without rule (FR-2), 24 px targets (FR-3), `days` time column (FR-5), `.rt-link` `--fg-subtle` (FR-6), waits line and measure
- added `frontend/src/lib/specReader.ts:runRecordParts`, `roundsHtml`, `ROUNDS_SUMMARY`, `readerSource`, `firstHeadingId`: a run record's prose, then its rounds folded (FR-8)
- modified `frontend/src/components/SpecReader.tsx:SpecReader`: renders through `readerSource`; a run record lands on its first heading (FR-8)
- added `frontend/src/components/RunReport.lf64.test.tsx`: P1-P8
- modified `frontend/src/components/RunReport.test.tsx`, `RunTracks.test.tsx`, `SpecReader.test.tsx`: the new words, strips and the `none` target
Risky:
- `Waits`: the fit measures on layout; a font that loads late is caught by the ResizeObserver only if the cell's size changes
- `drawsStrip`: matches Work's strip by wave number and supervisor; a strip whose supervisor the scan could not name matches any wave of that number
Not changed, on purpose:
- `frontend/src/components/WaveStrip.tsx`: `running` was already exported
- `frontend/src/components/Board.tsx`, the store: read only
- `frontend/src/styles/spec-reader.css`: outside the boundary; the markdown `pre` is already mono
- `internal/service/report.go:lineTokens`: keeps writing `sessions: 0`; the frontend reads it as unknown
