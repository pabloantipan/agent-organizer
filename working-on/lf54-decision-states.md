---
title: "Decision states are read once on each side, and ruled_by reads as a person plus a mode"
status: now
repos: [organizer]
branch: lf54-decision-states
seat: l54-states
stage:
updated: 2026-11-01
next: "file finding: decisionStates.test.ts stripComments drops the code after a // inside a string (x5, Review 1df5001), then UI review, then PR with talos-lab"
review: pass
reviewer: l54-states-rev, l54-states-ui
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
- 2026-11-01 l54-states: review finding 1 fixed in 1df5001 (the literal guard fails on a template literal, includes() and Set.has()); X0 passes again from a clean clone at 1df5001.

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
- note: `decisionStates.test.ts` guard rewritten in 1df5001 (review finding 1): any decision-status literal in lib code outside decisions.ts fails, with an exact-line allow-list for the non-status word `ruled`
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

## Review
**pass** at 1df5001 (the branch moved from 39f64de by one commit, `test(frontend)`, which changes only `decisionStates.test.ts` and one comment in `decisions.ts`). Unmet: none.
Reviewer l54-states-rev, 2026-11-01, on a new clean clone at 1df5001, specs at 54cf10d. X0's `make test` was **reused**: `test-lease run --share` replayed the same command at 1df5001d276e, run by organizer-probe-l54-states-ui from 15:35:58 (it printed no run id; log `.wt-notes/l54-states-rev/x0-make-test-1df5001.log`). `wails build` and porcelain ran fresh.

Re-review at 1df5001:
- Finding 1 (39f64de) is **fixed**. The same x1, x2 and x3 appended to `src/lib/plan.ts` in a scratch copy outside the clone now fail the guard: `Tests 1 failed | 78 passed (79)`, listing `plan.ts:37`, `:38` and `:39`. Without them it passes 79 of 79. `LITERAL` now flags any status literal in any quote style, after comments are stripped. Six exact lines are allowed, each with its reason (the `ruled` date field, the section key, the gem kind), and the test fails if an allowed line disappears.
- G5 is met: every clause from 39f64de still holds (the test diff touches only the guard), and the guard clause now holds for every comparison shape the gate names.
- X0: `make test` exit 0 (Go 19 packages ok; vitest 87 files, 1385 tests). `test-lease run -- wails build` exit 0. `git status --porcelain` was empty.
- Note (filed as `next`, not blocking): `stripComments` treats `//` inside a string as a comment unless a `:` or a quote precedes it. So `const u = "a//b"; return d.status === "ruled"` on one line passes the guard (scratch x5: 79 of 79 passed). No lib line today has `//` inside a string (grep over `frontend/src/lib/*.ts`), so it hides nothing now. Two more forms pass, and I read neither as the gate's "literal compared": a map lookup with unquoted keys (`{ applied: true }[d.status]`) and a concatenation (`"rul" + "ed"`).
- The 39f64de notes stand: Go and component literals unguarded (`tasks.go:110`, `FsePanel.tsx:31`), and no scan test reads a refused `ruled_by`. The stale comment is fixed in 1df5001.

### History: review at 39f64de (fail)
**fail** at 39f64de. Unmet: **G5** (its last clause). X0 met.
Fresh run from a clean clone (no --share replay; test-lease printed no run id; log `.wt-notes/l54-states-rev/x0-make-test.log`), specs at 54cf10d.
cause: execution

**change-check organizer lf54-decision-states** (base ac7f805, head 39f64de, 20 files, 34 flags): outside boundary 14, undeclared 10, declared-not-changed 0, untested? 10, no env, dependency or host flags.
- outside boundary (14): the boundary names the premise's lib files in prose, which change-check cannot read: `decisions.ts`, `decisionsPage.ts`, `header.ts`, `outline.ts`, `initiativeState.ts`, `queue.ts` and their tests (`decisionStates.test.ts`, `decisionsPage.test.ts`) are the premise row's files; `DecisionsView.tsx` and `Overview.tsx` are Amendment 5's; `frontend/wailsjs/go/models.ts` is generated (new `ruler`, `ruler_mode`, `forecast_low` json fields); the three `testdata/fixture-overlay/.../0013-0015` records are the builder's named UI-review fixtures. All explained.
- undeclared (10): `Overview.tsx:GateRow`, `initiativeState.ts:owner,waitsOnBusiness`, `outline.ts:decisionName,gemsOf`, `queue.ts:ownedByLead,needsMeRows,waitingOnOthers`, fixtures 0014 and 0015. Each is declared, but in a bullet listing several files at once (`header.ts, outline.ts, …`; `DecisionsView.tsx, Overview.tsx`; `0013…, 0014…, 0015…`), which change-check reads as one file. Explained.
- untested? (10): `sectionOf`, `GateRow` are components (UI review); `decisionTone`, `decisionStatusWord`, `personOf`, `ownerPerson`, `waitsOnBusiness`, `rulingTimes` are reached through tested callers (gemsOf/lineName/needsMeRows/initiativeStates, scan); `PersonOf`, `ReadMode` through `ReadRuledBy`/`ReadRuling` tests. Not findings.

**Finding 1 (blocking, G5): the literal guard misses literal comparisons.** Proof: in a scratch copy of `frontend/` at 39f64de outside the clone, appended to `src/lib/plan.ts`:
```
export const x1 = (d: { status: string }) => d.status === `ruled`;
export const x2 = (d: { status: string }) => ["proposed", "awaiting-cells"].includes(d.status);
export const x3 = (d: { status: string }) => new Set(["applied"]).has(d.status);
```
`npx vitest run src/lib/decisionStates.test.ts` → `Tests 77 passed (77)`. Control: adding `d.status === "ruled"` to the same file fails it, and the failure lists only that line (`plan.ts:40`), not x1 to x3. The cause is `LITERAL`, which accepts only `'` and `"` quotes, and which reads `includes(` only when the literal follows it directly. So "a test fails if any file under frontend/src/lib compares a decision status to a literal outside the helper" is unmet. `x1` is a plain `===` against a literal. A whole-file check that no status literal appears outside `decisions.ts` would close all three.

**Checked and met:**
- (1) `contract_test.go` reads more of the contract. The old checks were "a mode is never a ruler" and `model.RuledByModes` DeepEqual the contract. At 54cf10d both contradict `ruled_by_reading`, which maps every one of the nine `ruled_by_modes` values to person pablo plus a mode. Proof: origin/main 076eb5c fails them for 0001, 0002, 0007-0011, 0013-0015 (`the mode "operator" counted as ruler "operator"`, `model.RuledByModes = [...]`), plus the 0012 forecast problem. The replacements check person and mode per decision, the facts rows (ruler, mode, forecast lo and hi), every `ruled_by_reading` value and every `ruled_by_refused` value (no person, no mode). The modes-list membership check stays, and the null-reading case still demands no ruler. The reading keys equal `ruled_by_modes` at the pin, so dropping the DeepEqual lets no value through.
- (2) FR-7 refusal: `ReadRuledBy` refuses the three contract values and `(standing rule)`, `pablo by vacation`, `pablo (FR-4)`, `pablo )` and `pablo and ana` (Go and vitest). `ReadRuling` returns a note, and `readDecisions` turns it into a problem with the record still read. The CLI shows the refused value quoted, never as a ruler.
- G5 fails on main: `TestWorkingOnContract` fails at 076eb5c with CONTRACTS_DIR at the pin. The branch's new Go tests do not compile there (`undefined: ReadRuledBy`, `d.Mode`), and `decisionStates.test.ts` fails 42 of 77.
- G5's other clauses: awaiting-cells is a Needs me row and is in the header's count; applied and acknowledged count as ruled (gemsOf, lineName, Go `Class`, CLI buckets); each variant reads as `expected.json` maps it (contract-driven in Go and vitest).
- (4) `internal/service/` is unchanged (`git diff --quiet origin/main...39f64de -- internal/service/`). `isRulable` is proposed only.
- (5) Amendment 5: the `DecisionsView.tsx` and `Overview.tsx` changes only call `isOpen`, `isDecided`, `isRulable` and `decisionTone` from `lib/decisions`.
- X0: `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=…/sup99/specs/contracts test-lease run --share -- make test` exit 0 (Go all ok; vitest 87 files, 1383 tests). `test-lease run -- wails build` exit 0. `git status --porcelain` was empty.

Note: `decisions.ts` says `decisionStatusLiterals.test.ts` fails on a literal; the file is `decisionStates.test.ts`.
Note: no scan test reads a record whose `ruled_by` is refused (the sample has none). The problem path is covered only at `model.ReadRuling`.
Note (gate gap): G5's guard covers only `frontend/src/lib`. `internal/service/tasks.go:110` (`status == ruled`, the builder's Found) and `FsePanel.tsx:31` still compare literals, and nothing on the Go side guards against it.
