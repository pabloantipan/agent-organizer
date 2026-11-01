---
title: "A finished wave's footer opens its run record over the report"
status: now
repos: [organizer]
branch: lf57-wave-footer
seat: l57-foot
stage:
updated: 2026-11-01
next: "review: lf57-wave-footer, W9 W11 X0 pass, W10 own look pass (offscreen, screen locked), 957cc37"
depends_on: [lf57-run-report]
boundary: ["frontend/src/components/RunReport.tsx", "frontend/src/lib/runReport.ts", "frontend/src/lib/specReader.ts", "frontend/src/components/SpecReader.tsx", "internal/service/spec.go", "internal/service/spec_test.go"]
spec: "docs/specs/leftovers-57.md (Amendment 4, FR-15 to FR-17)"
gate: "docs/specs/leftovers-57.md#Acceptance → gate"
ui_review: true
autonomy: unattended
---

## Goal
Every wave footer in the report leads somewhere: a finished wave to its run record, a running one to Work.

## Gate
docs/specs/leftovers-57.md Amendment 4 and its addendum: W9, W10, W11, X0.

## Pre-answered
- Base: origin/main with lf57-run-report merged (d4c67af).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); W10 in the review build.
- Design: Aglaea's progress-and-waves Amendment 1 (754615b); anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Short-sample fallback: a fixture without a finished wave's run record gets one added under the fixture's `runs/`; never the real home.
- Data shape across states: `model.Wave` as the scan gives it, with its run record's path.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- l57-foot built it on `lf57-wave-footer` (efec0f2, 45e3699, 957cc37), rebased on origin/main e968fc1; W9, W11 fail on base and pass; W10 checked offscreen over `wails dev` (screen locked); X0 passes from a clean clone. Detail: `.wt-notes/l57-foot/progress.md`.

## Declared changes
- modified `internal/service/spec.go:ReadSpec`: also allows the run records the scan read the waves from (FR-18)
- added `internal/service/spec.go:runRecords`: `runs/<Wave.Record>` for the initiative's waves
- modified `internal/service/spec_test.go`: W11 (`TestW11ReadSpecRunRecords`, `runFixture`)
- added `frontend/src/lib/runReport.ts:waveTarget`: a wave's target, record, unread or work (FR-15, FR-17)
- added `frontend/src/lib/runReport.ts:waveLabel`: supervisor, else key
- added `frontend/src/lib/runReport.ts:waveLinkName`: the link's name and hover (FR-16)
- added `frontend/src/lib/runReport.ts:recordRel`: the report's record relative to the root
- added `frontend/src/lib/runReport.ts:RUNS_DIR`: the scan's runs directory
- added `frontend/src/lib/runReport.ts:WaveTarget`: the target type
- added `frontend/src/lib/runReport.ts:ScanRuns`: what the scan knows of the runs
- modified `frontend/src/components/RunReport.tsx:Nav`: `wave` takes the pressed element; optional `waveTarget`
- modified `frontend/src/components/RunReport.tsx:Progress`: footer name and title by target
- added `frontend/src/components/RunReport.tsx:goToWave`: the press by target (reader, Needs me, Work)
- modified `frontend/src/components/RunReport.tsx:LocalRunReport`: targets from the board's scan waves and problems
- modified `frontend/src/components/RunReport.test.tsx`: W9; W2 reads the first argument of `nav.wave`
- modified `frontend/src/components/SpecReader.tsx:openSpec`: optional `back`, what the drawer opened over
- added `frontend/src/components/SpecReader.tsx:ReaderBack`: ← Back to the file under, else onto the view (closes)
- modified `frontend/src/components/SpecReader.tsx:SpecReader`: ReaderBack in the header, frontmatter as code, focus back without scrolling
- modified `frontend/src/components/SpecReader.test.tsx`: FR-15 Back rows
- added `frontend/src/lib/specReader.ts:frontmatterAsCode`: a leading YAML block as a yaml code block
- modified `frontend/src/lib/specReader.test.ts`: frontmatterAsCode rows
Risky:
- `SpecReader`: focus returns with `preventScroll` for every opener, not only the report's
- `frontmatterAsCode`: applies to any spec starting with a `---` block
Not changed, on purpose:
- `internal/scan/runs.go`: reads `runs/` only; docs/runs records stay unreadable (Notes)
- `stores/board.store.ts:openWave`, `openNeedsMe`: used as they are
- `runPlace`, `latestRun`, `presetsOf`, `seenAtOf`, `markSeen`: untouched (lf57-home-signal reads them)

## Notes
- The scan reads run records under `runs/` only (`internal/scan/runs.go`); the addendum's "under its runs/ and docs/runs/" holds for runs/ alone. A finished wave whose record sits in `docs/runs/` keeps the Work press, named `show <wave> on Work`, never dead; reading docs/runs is a scan card.
- An unread run record's name: `show <wave>'s run record in Needs me, Deltagos can't read it`.
