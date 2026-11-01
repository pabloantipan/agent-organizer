---
title: "Records waiting on the cells leave Needs me, and every view uses one word per status"
status: now
repos: [organizer]
branch: lf61-decision-states-ui
seat: l61-states
stage:
updated: 2026-11-01
next: "l61-states builds D1-D6 on lf61-decision-states-ui (sup100 launched 2026-11-01 16:15)"
depends_on: [lf54-decision-states]
boundary: ["docs/specs/leftovers-61.md Boundary"]
spec: "docs/specs/leftovers-61.md (FR-1 to FR-6)"
gate: "docs/specs/leftovers-61.md#Acceptance → gate"
ui_review: true
autonomy: unattended
---

## Goal
Needs me holds only what Pablo can act on; a crossing is visible without asking him to act.

## Gate
docs/specs/leftovers-61.md, rows D1-D6 and X0.

## Pre-answered
- Base: origin/main at the card's start (the merge target line below names the commit it must include).
- Short-sample fallback: a fixture short of a state gets the state added to the fixture overlay or built from the contract's `make-fixture.sh`; never the real home, never skipped.
- Merge target: `main` through talos-lab's PR; base: origin/main 29e7d2c or later (lf54-decision-states merged).
- Tests: vitest under `frontend/src/lib/*.test.ts` and component tests next to the components in the boundary (`cd frontend && npm test`); Go: `internal/cli/decisions_test.go` (`go test ./internal/cli/`). All inside the boundary.
- Evidence: shots and AX text under `.wt-notes/<seat>/`, paths named in the card's Done or Review lines.
- Fixture: the overlay's 0013 awaiting-cells, 0014 applied, 0015 acknowledged (as lf54-decision-states used); a missing state is added to the overlay, never to the real home.
- D6 needs no person: "operator" is the `ruled_by` and owner value FR-6 renders as pablo. unattended: the fixture's records stand for it.
- The FSE panel's count is `fseWaiting` in `FsePanel.tsx`, which already counts proposed only: the builder tests it there and edits it only if a test fails; `FsePanel.tsx` joins the boundary for that case.
- Design questions: Aglaea's `docs/ux/specs/decision-states.md` (d05ea58) answers them; one it does not goes to the FSE, which asks the judge-design subagent while Pablo is away.
- Data shape across states: the decision records' frontmatter as the scan reads it (model.Decision); no new stored data.
- Retention: n/a.
