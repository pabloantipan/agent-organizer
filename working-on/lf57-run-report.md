---
title: "Overview's While you were away: the run's rows with their waves, the tracks, the rulings, and Copy as text"
status: now
repos: [organizer]
branch: lf57-run-report
seat: l57-ui
stage:
updated: 2026-11-01
next: "l57-ui continues from .wt-notes/l57-ui/progress.md, phase 1 (reading done, no code yet; stopped at usage limit 2026-11-01)"
depends_on: [lf57-report-go]
boundary: ["docs/specs/leftovers-57.md Boundary, lf57-run-report"]
spec: "docs/specs/leftovers-57.md (FR-7 to FR-13)"
gate: "docs/specs/leftovers-57.md#Acceptance → gate"
ui_review: true
autonomy: unattended
---

## Goal
The morning after, Overview shows what moved, which wave moved it and at what cost, what stopped it, where each track is, and what was ruled while Pablo was away.

## Gate
docs/specs/leftovers-57.md, rows W1-W7 and X0.

## Pre-answered
- Base: origin/main at the card's start (the merge target line below names the commit it must include).
- Short-sample fallback: a fixture short of a state gets the state added to the fixture overlay or built from the contract's `make-fixture.sh`; never the real home, never skipped.
- Merge target: `main` through talos-lab's PR; base: origin/main with lf57-report-go merged.
- Tests: vitest beside `RunReport.tsx`, `RunTracks.tsx` and `lib/runReport.ts` (`cd frontend && npm test`), inside the boundary.
- Evidence: review-build shots and AX text under `.wt-notes/<seat>/`.
- Data: the report's JSON as the contract `contracts/factory-report/` (specs 54cf10d, 8474386 content) gives it; every state (no window, one window, waves, no waves, refused remote, factory missing) has a fixture built from `make-fixture.sh` or the contract's `expected*.json`.
- Design questions: Aglaea's `docs/ux/specs/run-report.md` with Amendments 1 and 2 (8d2141a, d9c7a54) and `docs/ux/specs/progress-and-waves.md` option B (0168) answer them; anything else goes to the FSE, which asks the judge-design subagent while Pablo is away.
- Copy as text is checked against the app's own text, never the system pasteboard.
- Overview.tsx: if lf61 has not landed, the change is the mount line only, rebased before review.
- Data shape across states: the report JSON as the factory-report schema gives it; the view stores nothing.
- Retention: n/a.
