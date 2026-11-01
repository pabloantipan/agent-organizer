---
title: "Decision states are read once on each side, and ruled_by reads as a person plus a mode"
status: now
repos: [organizer]
branch: lf54-decision-states
seat: l54-states
stage:
updated: 2026-11-01
next: "review: lf54-decision-states, G5 and X0 pass (clean clone, specs 54cf10d), 39f64de"
depends_on: [lf53-frontmatter]
boundary: ["docs/specs/leftovers-54.md Boundary, lf54-decision-states"]
spec: "docs/specs/leftovers-54.md (FR-6 to FR-7)"
gate: "docs/specs/leftovers-54.md#Acceptance → gate"
ui_review: true
---

## Goal
A crossing record shows in Needs me and the Decisions view the way the skill reads it.

## Gate
docs/specs/leftovers-54.md, rows G5 and X0.

## Notes
- 2026-11-01 l54-states: Go side done (633c2c2, 95c89b1 after rebase): TestWorkingOnContract passes at 54cf10d. Premise row 6 is incomplete: DecisionsView.tsx, Overview.tsx and FsePanel.tsx also compare decision status to literals; asked sup99.
- Forecasts with a unit on the low end (`30 min-1 h`, records 0112 and 0114) now read; they were unread before.
- Found, not asked: `internal/service/tasks.go:110` still reads `status == ruled` for task rows (an applied accept record gets none); FsePanel.tsx:31 left as ruled.

## Done
- 2026-11-01 l54-states: FR-6, FR-7 (pin 54cf10d), FR-8 built on branch lf54-decision-states, rebased on origin/main 6b6e349, head 39f64de; G5 fails on 076eb5c and passes here; X0 passes from a clean clone. progress.md in .wt-notes/l54-states.

## Declared changes
- modified `internal/model/decision.go`: `ReadRuledBy`, `ReadMode`, `PersonOf`, `Decision.ReadRuling`, `Class`, `Ruler` (the person), fields `RuledMode`, `Person`, `Mode`, `ForecastLow`; `ForecastBand` reads a band followed by text or with a low-end unit; `RuledByModes`/`RuledByMode` deleted (FR-7, FR-8)
- modified `internal/model/decision_test.go`: readings, refusals, written ruled_mode, forecast bands
- modified `internal/scan/decisions.go`: `readDecisions` fills the ruling and the band, reports a refused ruled_by as a problem; `rulingTimes` reads decided records
- modified `internal/scan/contract_test.go`: `TestWorkingOnContract` checks person and mode per decision, the facts' rows and every listed and refused reading
- modified `internal/cli/decisions.go`: `WriteDecisions` buckets by `Class`; `rulerWords` added (FR-6, FR-7)
- added `internal/cli/decisions_test.go`: the buckets and the ruler words
- modified `frontend/src/lib/decisions.ts`: `decisionClass`, `isOpen`, `isDecided`, `isRulable`, `decisionStatusWord`, `decisionTone`, `readRuledBy`, `rulingOf`, `rulerName`, `ownerPerson`; `waitingDecisions`, `waitingOwners` use them
- modified `frontend/src/lib/decisionsPage.ts`: `statusWord`, `lineName`, `timelineName`, `rulerWords` (now takes the record)
- modified `frontend/src/lib/header.ts`, `outline.ts`, `initiativeState.ts`, `queue.ts`: read status and owner through decisions.ts
- added `frontend/src/lib/decisionStates.test.ts`: G5 vitest, contract readings and the literal guard
- modified `frontend/src/lib/decisionsPage.test.ts`: `rulerWords` call sites
- modified `frontend/src/components/DecisionsView.tsx`, `Overview.tsx`: call the helper (Amendment 5)
- modified `frontend/wailsjs/go/models.ts`: `wails generate module` after the bound-type change
- added `testdata/fixture-overlay/init-a/working-on/decisions/0013-which-cells-take-the-crossing.md`, `0014-apply-the-shared-format.md`, `0015-acknowledge-the-record-fields.md`: UI review states
Risky:
- `ReadRuledBy`: reads the general forms, not only the listed values; a one-word value is always a person, mode present
- `Decision.Ruler`: now returns pablo for the old mode wordings, so counts by ruler include them
- `decisionTone`: applied and acknowledged rows now draw as ruled, awaiting-cells as waiting
Not changed, on purpose:
- `internal/service/rule.go`: ruling stays proposed only (FR-6)
- `internal/service/tasks.go`: service, outside the boundary (noted above)
- `frontend/src/components/FsePanel.tsx`: left as is (Amendment 5)
