---
title: "Deltagos reads every card and record the factory writes, scalar or list, crossing statuses and ledgers included, tested on the shared sample"
status: next
repos: [organizer]
branch: lf53-frontmatter
seat: l53-front
stage:
updated: 2026-10-25
next: "review pass; PR asked of talos-lab, done/ when it answers with the merged sha"
depends_on: []
boundary: ["docs/specs/leftovers-53.md Boundary, lf53-frontmatter"]
spec: "docs/specs/leftovers-53.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-53.md#Acceptance → gate"
ui_review: false
review: pass
reviewer: l53-front-rev
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

## Review
Verdict: pass, at 3f2bec1 (branch lf53-frontmatter), from a clean clone. Unmet gate items: none. Reviewer l53-front-rev, 2026-10-25.

change-check organizer lf53-frontmatter (base bccd979b9, head 3f2bec131; 11 files):
```
| undeclared | organizer/internal/model/card_test.go |  | modified |
| undeclared | organizer/internal/scan/rejects_test.go |  | modified |
| undeclared | organizer/internal/service/run.go | Service.PrepareLaunch | modified |
| undeclared | organizer/internal/service/run_test.go |  | modified |
| untested? | organizer/internal/model/decision.go | RuledByMode | no test file names it |
| untested? | organizer/internal/model/lenient.go | listify | no test file names it |
| untested? | organizer/internal/model/lenient.go | Card.UnmarshalYAML | no test file names it |
| untested? | organizer/internal/model/lenient.go | Decision.UnmarshalYAML | no test file names it |
| untested? | organizer/internal/model/lenient.go | Stage.UnmarshalYAML | no test file names it |
| untested? | organizer/internal/scan/scan.go | readCard | no test file names it |
| declared, not changed |  | internal/scan/scan.go:ledgerNames | no matching change |
11 flags: outside boundary 0, outside footprint 0, undeclared 4, declared, not changed 1, new env var 0, new dependency 0, new host 0, risk 0, untested? 6, could not read 0, boundary unreadable 0
```
- undeclared: the three test files are covered by the declared bullet "modified internal/model/card_test.go, internal/scan/rejects_test.go, internal/service/run_test.go" (change-check does not read a multi-path bullet); `PrepareLaunch` is the one line filling the declared `Launch.Spec` (run.go:137).
- untested?: all six run through tests that do not name them: the Unmarshal hooks and listify through every card/decision/stage decode in TestWorkingOnContract and the model tests; RuledByMode through `Decision.Ruler` (decision_test.go, contract decisions); readCard through ReadInitiative.
- declared, not changed: `ledgerNames` is a var, which change-check does not track as a symbol; the diff adds `"assumptions.md": true` to it (scan.go:399).
- outside boundary: none.

Rows:
- F1, F2, F3: `go test ./internal/scan -run 'TestWorkingOnContract|TestLoadContract' -v` PASS (cards, decisions, stages, specs, ledgers, problems). Fails on main: the test does not compile there (SpecRefs, Decided, Ruler, DecisionOpen missing). Main's own scan of the sample, probed separately, gives the drift: next-scalars.md unread (`cannot unmarshal !!str … into []string`, 4 lines), blocked-spec-list.md unread (`cannot unmarshal !!seq into string`), assumptions.md unread (`no frontmatter`), stale-status status=now with no problem, 0005-0007 `unknown decision status`.
- F4: `CONTRACTS_DIR=<empty dir> go test ./internal/scan -run TestWorkingOnContract` FAIL: `working-on contract sample missing: open …/emptyc/working-on/expected.json: no such file or directory`. TestLoadContractMissingFails PASS.
- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` exit 0 (19 Go packages ok, vitest 1153 passed); `test-lease run -- wails build` exit 0; `git status --porcelain` empty, before and after the runtime checkout.

Found 1, outside the gate (filed: the FSE's held list for the next leftovers, docs/bitacora/fse_bitacora.md 2026-10-25 03:25, 9d3fa22): FR-2 says awaiting-cells "waits on a ruling", but only internal/model knows it. `Decision.Open()` has no caller outside tests (`grep -rn 'Open()' internal` → decisions_test.go, contract_test.go, decision_test.go, decision.go only). `internal/cli/decisions.go:78` and `internal/service/rule.go:43` match `DecisionProposed` directly, and the frontend reads `status === "proposed"` (builder's Notes). So in the app an awaiting-cells record is no Needs me row, `organizer decisions` buckets it as other, applied/acknowledged are not ruled, and rulerWords shows the away mode as a ruler. The gate does not cover it: F2 checks only the model, not the reading anywhere a person sees it. The builder's other Notes (`run --print` omits Launch.Spec; unread cards kept in ScannedInitiative.Cards) go with the same filing.
