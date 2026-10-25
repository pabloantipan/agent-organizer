---
title: "Deltagos reads every card and record the factory writes, scalar or list, crossing statuses and ledgers included, tested on the shared sample"
status: next
repos: [organizer]
branch: lf53-frontmatter
seat: l53-front
stage:
updated: 2026-10-25
next: "review: lf53-frontmatter, gate met (F1-F4, X0), 3f2bec1"
depends_on: []
boundary: ["docs/specs/leftovers-53.md Boundary, lf53-frontmatter"]
spec: "docs/specs/leftovers-53.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-53.md#Acceptance → gate"
ui_review: false
---

## Goal
No card on any machine is unread in Deltagos for a field written as prose or a list.

## Gate
docs/specs/leftovers-53.md, rows F1-F4 and X0.

## Done
- 2026-10-25 l53-front: FR-1 to FR-4 on branch lf53-frontmatter (e1e42a3, 30aa399, 4ddc601, 3f2bec1), rebased on main 040ed6c; the scan reads the shared sample as expected.json says; X0 from a clean clone passed. Evidence and reviewer commands: .wt-notes/l53-front/progress.md.

## Declared changes
- added `internal/model/lenient.go`: `listify` plus `Card`, `Decision`, `Stage.UnmarshalYAML`; a list field written as one scalar is a one-item list, an empty scalar an empty list (FR-1)
- modified `internal/model/model.go:Card`: `SpecRefs`, `GateRefs` hold spec:/gate: as written; `Spec`, `Gate` are the first (FR-1a)
- modified `internal/model/decision.go`: crossing statuses, `DecisionOpen`, `DecisionDecided`, `Decision.Decided`, `RuledByModes`, `RuledByMode`, `Decision.Ruler`; `Open` includes awaiting-cells (FR-2, FR-2a)
- modified `internal/scan/scan.go:readCard`: a done/ card is done whatever its status, one problem when it said otherwise; message "unknown card status" (FR-3a)
- modified `internal/scan/scan.go:ledgerNames`: assumptions.md is a ledger (FR-3)
- modified `internal/service/run.go:Launch`: `Spec`, the first reference the builder is launched against (FR-1a)
- modified `frontend/wailsjs/go/models.ts`: regenerated, `spec_refs` and `gate_refs` on the card
- added `internal/scan/contract_test.go`: `TestWorkingOnContract`, `TestLoadContractMissingFails` against `${CONTRACTS_DIR:-~/agent-slack/specs/contracts}/working-on/` (FR-4)
- added `internal/model/decision_test.go`; modified `internal/model/card_test.go`, `internal/scan/rejects_test.go`, `internal/service/run_test.go`: unit tests for the above
Risky:
- `Card.UnmarshalYAML`: every card decode goes through the node rewrite; a key named like a list field with a scalar value now reads instead of failing
- `Card.Spec` json is the first reference only; a card with several shows only the first in the card drawer
Not changed, on purpose:
- `frontend/src/lib/queue.ts`, `lib/decisions.ts`: no type change forced them; they still read only `proposed` as waiting (see Notes)
- `internal/cli/decisions.go`, `internal/service/rule.go`, `internal/cli/run.go`: outside the boundary

## Notes
- The frontend counts only `status === "proposed"` as waiting (queue.ts, decisions.ts, DecisionsView, Overview, outline, decisionsPage) and `rulerWords` shows a mode as a ruler: an awaiting-cells record is no Needs me row in the app yet. Go-side reading is done; the app's reading needs a follow-up card (one helper, or a derived `waiting` field).
- expected.json's `specs` title and status, `status_as_written` and `waits_on_decision` are not compared: the scan keeps none of them (the spec reader reads a spec's title).
