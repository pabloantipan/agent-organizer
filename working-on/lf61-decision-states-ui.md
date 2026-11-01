---
title: "Records waiting on the cells leave Needs me, and every view uses one word per status"
status: now
repos: [organizer]
branch: lf61-decision-states-ui
seat: l61-states
stage:
updated: 2026-11-01
next: "review: lf61-decision-states-ui, gate met (D1-D6 tests fail on 29e7d2c and pass; X0 pass, porcelain empty), 7de55a1"
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

## Done
- 2026-11-01 l61-states: D1-D6 built on lf61-decision-states-ui, rebased on origin/main 43e2bcd (2b1a54f frontend, 3b8a567 cli, 7de55a1 fixture roadmap); 25 new vitest and TestWriteDecisionsNamesEachStatus fail on 29e7d2c and pass on the branch; X0 from a clean clone pass (1431 vitest, wails build, review-build, porcelain empty). Evidence and reviewer commands: `.wt-notes/l61-states/progress.md`.

## Notes
- D1 "agree": on init-a the header chip counts every proposed record (6, alejandro's 0005 included, 0068) and Needs me and the FSE panel the lead's (5); all three leave 0013 out, and the tests pin that they give one number when every waiting record is the lead's.
- `fseWaiting` was edited under the amendment: a D1 case (a proposed record owned by `operator`) failed before it (raw owner compared).
- `internal/service/rule.go` (not in the boundary) still signs "owner operator" in the record when pablo rules an operator-owned proposed record.

## Declared changes
- modified `frontend/src/lib/decisions.ts`: `isWithCells`, `withCellsCount`, `ownerName`, `ownerHover`, `ownerSign` added; `decisionStatusWord` names applied, acknowledged and writes hyphens as spaces; `waitingDecisions`, `waitingOwners` read `isRulable`; `ownerPhrase` reads `ownerName` (FR-1, FR-4, FR-5, FR-6)
- modified `frontend/src/lib/queue.ts:needsMeRows`, `queue.ts:waitingOnOthers`: rulable records only; others' owner through `ownerName` (FR-1)
- modified `frontend/src/lib/header.ts`: `waitingChip`, `firstWaiting` rulable only; `withCellsLine`, `firstWithCells` added (FR-1, FR-3)
- modified `frontend/src/lib/initiativeState.ts:waitsOnBusiness`: rulable only (FR-1)
- modified `frontend/src/lib/decisionsPage.ts`: `DecSections.cells`, `sectionOf`, `sectionRows`, `gateRowWords` added; `lineName`, `timelineName` owner through the reader (FR-2, FR-5, FR-6)
- modified `frontend/src/components/DecisionsView.tsx`: With the cells section between To rule and Ruled, absent at 0; owner hover (FR-2, FR-6)
- modified `frontend/src/components/InitiativeHeader.tsx`: muted "· N with the cells" opening Decisions on the oldest of them (FR-3)
- modified `frontend/src/components/Overview.tsx:GateRow`: the record's own status word; a with-the-cells gate opens Decisions (FR-5)
- modified `frontend/src/components/Home.tsx:DecisionRow`: owner raw value in the hover (FR-6)
- modified `frontend/src/components/RuleDecisionBox.tsx`: signature via `ownerSign`, raw owner in the hover (FR-6)
- modified `frontend/src/components/FsePanel.tsx:fseWaiting`: `isRulable` and the owner read as a person (FR-1, FR-6; amendment 2e089ed)
- modified `frontend/src/styles/global.css`: `button.linkish.ihead-cells` muted (FR-3)
- modified `internal/cli/decisions.go:WriteDecisions`: status word per line, owner operator as pablo; `statusWord`, `ownerName` added (FR-5, FR-6)
- modified `testdata/fixture-overlay/init-a/working-on/roadmap.yaml`: joins gates on 0013-0015 so Overview shows them (D5)
- added `frontend/src/lib/decisionCrossings.test.ts`, `frontend/src/components/InitiativeHeader.cells.test.tsx`: D1-D6
- modified `frontend/src/lib/decisionStates.test.ts`, `decisionsPage.test.ts`, `frontend/src/components/DecisionsView.test.tsx`, `RuleDecisionBox.test.tsx`, `internal/cli/decisions_test.go`: 0164 FR-6 expectations moved to 0173's; D2, D5, D6 cases
Risky:
- `waitingDecisions` and `waitingOwners`: Home's row signal and the rail's float list now leave records with the cells out too
- `DecSections`: a stored layout without `cells` falls back to open
Not changed, on purpose:
- `internal/service/rule.go`: outside the boundary; it signs the raw owner
- `board.store.ts`: the header press uses the existing `openDecision`
- `decisionRowAction`: its Open branch is unreachable from Needs me now, kept for OthersRow and its tests

