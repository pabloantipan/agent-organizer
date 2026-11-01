---
title: "Home's row says the last run: cards passed and time stopped"
status: next
repos: [organizer]
branch: lf57-home-signal
seat:
stage:
updated: 2026-11-01
next: "sup101 runs it (0169; leftovers-57 Amendment 2)"
depends_on: [lf57-run-report, lf61-decision-states-ui]
boundary: ["docs/specs/leftovers-57.md Boundary, lf57-home-signal"]
spec: "docs/specs/leftovers-57.md (FR-14)"
gate: "docs/specs/leftovers-57.md#Acceptance → gate"
ui_review: true
autonomy: unattended
---

## Goal
Home tells Pablo a run happened and how it went, without a percent, and takes him to the report.

## Gate
docs/specs/leftovers-57.md, rows W7, W8 and X0.

## Pre-answered
- Base: origin/main at the card's start (the merge target line below names the commit it must include).
- Short-sample fallback: a fixture short of a state gets the state added to the fixture overlay or built from the contract's `make-fixture.sh`; never the real home, never skipped.
- Merge target: `main` through talos-lab's PR; base: origin/main with lf57-run-report and lf61-decision-states-ui merged.
- Tests: vitest beside `Home.tsx` and `lib/width.ts` (`cd frontend && npm test`), inside the boundary.
- Evidence: review-build shots under `.wt-notes/<seat>/`.
- Words: `last run · 12 cards · 2 h stopped`, no percent (0167 Q3); the states (no run yet, a run with no stop, a remote initiative) follow `docs/ux/specs/run-report.md` §5.
- Design questions: Aglaea's run-report spec; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Data shape across states: the report JSON as the factory-report schema gives it; the view stores nothing.
- Retention: n/a.
