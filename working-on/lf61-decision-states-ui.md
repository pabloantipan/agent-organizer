---
title: "Records waiting on the cells leave Needs me, and every view uses one word per status"
status: now
repos: [organizer]
branch: lf61-decision-states-ui
seat: l61-states
stage:
updated: 2026-11-01
next: "PR with talos-lab (branch pushed at 7de55a1, asked 2026-11-01 16:5x). Finding (rule.go signs \"owner operator\" in a Ruling): filed to the FSE (bitácora, next leftovers, 88b5584)"
review: pass
reviewer: l61-states-rev
depends_on: [lf54-decision-states]
boundary: ["docs/specs/leftovers-61.md Boundary"]
spec: "docs/specs/leftovers-61.md (FR-1 to FR-6)"
gate: "docs/specs/leftovers-61.md#Acceptance → gate"
ui_review: true
autonomy: unattended
prs:
  - {repo: organizer, pr: 20, target: main, state: merged, merge: 37b1763}
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

## Review
**Verdict: pass.** Unmet gate items: none (code review; the review-build rows of D1-D6 are the UI review's). Reviewer `l61-states-rev`, 2026-11-01, branch `lf61-decision-states-ui` at 7de55a1 (base 43e2bcd), clean clone. Test run: fresh (`test-lease run --share` replayed nothing; no run id printed). Logs: `.wt-notes/l61-states-rev/`.

```
change-check: working-on/lf61-decision-states-ui.md
risk: medium (missing, read as medium)
repo organizer: base ac8599d17 (default origin/main) ... head lf61-decision-states-ui (clone HEAD 7de55a11e, on detached) 7de55a11e; 21 files, 14 flags; read in /Users/pabloantipan/organizer/.wt-notes/l61-states-rev/clean

## Changed

- organizer/frontend/src/components/DecisionsView.test.tsx (modified, test)
- organizer/frontend/src/components/DecisionsView.tsx (modified): sectionOf, DecisionsView
- organizer/frontend/src/components/FsePanel.tsx (modified): fseWaiting
- organizer/frontend/src/components/Home.tsx (modified): DecisionRow
- organizer/frontend/src/components/InitiativeHeader.cells.test.tsx (added, test)
- organizer/frontend/src/components/InitiativeHeader.tsx (modified): InitiativeHeader
- organizer/frontend/src/components/Overview.tsx (modified): GateRow
- organizer/frontend/src/components/RuleDecisionBox.test.tsx (modified, test)
- organizer/frontend/src/components/RuleDecisionBox.tsx (modified)
- organizer/frontend/src/lib/decisionCrossings.test.ts (added, test)
- organizer/frontend/src/lib/decisionStates.test.ts (modified, test)
- organizer/frontend/src/lib/decisions.ts (modified): isWithCells, withCellsCount, decisionStatusWord, ownerName, ownerHover, ownerSign, waitingDecisions, waitingOwners, ownerPhrase
- organizer/frontend/src/lib/decisionsPage.test.ts (modified, test)
- organizer/frontend/src/lib/decisionsPage.ts (modified): lineName, timelineName, DecSections, decSectionsOf, shownSections, sectionOf, sectionRows, gateRowWords
- organizer/frontend/src/lib/header.ts (modified): waitingChip, firstWaiting, oldest, withCellsLine, firstWithCells
- organizer/frontend/src/lib/initiativeState.ts (modified): waitsOnBusiness
- organizer/frontend/src/lib/queue.ts (modified): needsMeRows, waitingOnOthers
- organizer/frontend/src/styles/global.css (modified)
- organizer/internal/cli/decisions.go (modified): WriteDecisions, statusWord, ownerName
- organizer/internal/cli/decisions_test.go (modified, test)
- organizer/testdata/fixture-overlay/init-a/working-on/roadmap.yaml (modified, test)

## Tests touched

- organizer/frontend/src/components/DecisionsView.test.tsx
- organizer/frontend/src/components/InitiativeHeader.cells.test.tsx
- organizer/frontend/src/components/RuleDecisionBox.test.tsx
- organizer/frontend/src/lib/decisionCrossings.test.ts
- organizer/frontend/src/lib/decisionStates.test.ts
- organizer/frontend/src/lib/decisionsPage.test.ts
- organizer/internal/cli/decisions_test.go
- organizer/testdata/fixture-overlay/init-a/working-on/roadmap.yaml

## Risky (declared)

- `waitingDecisions` and `waitingOwners`: Home's row signal and the rail's float list now leave records with the cells out too
- `DecSections`: a stored layout without `cells` falls back to open

## Not changed, on purpose (declared)

- `internal/service/rule.go`: outside the boundary; it signs the raw owner
- `board.store.ts`: the header press uses the existing `openDecision`
- `decisionRowAction`: its Open branch is unreachable from Needs me now, kept for OthersRow and its tests

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| outside boundary | organizer/frontend/src/components/InitiativeHeader.cells.test.tsx |  | added |
| outside boundary | organizer/frontend/src/lib/decisionCrossings.test.ts |  | added |
| outside boundary | organizer/frontend/src/lib/decisionStates.test.ts |  | modified |
| outside boundary | organizer/testdata/fixture-overlay/init-a/working-on/roadmap.yaml |  | modified |
| undeclared | organizer/frontend/src/components/DecisionsView.test.tsx |  | modified |
| undeclared | organizer/frontend/src/components/InitiativeHeader.cells.test.tsx |  | added |
| undeclared | organizer/frontend/src/components/RuleDecisionBox.test.tsx |  | modified |
| undeclared | organizer/frontend/src/lib/decisionsPage.test.ts |  | modified |
| undeclared | organizer/frontend/src/lib/queue.ts | waitingOnOthers | modified |
| undeclared | organizer/internal/cli/decisions.go | statusWord | added |
| undeclared | organizer/internal/cli/decisions.go | ownerName | added |
| undeclared | organizer/internal/cli/decisions_test.go |  | modified |
| untested? | organizer/frontend/src/components/Overview.tsx | GateRow | no test file names it |
| untested? | organizer/frontend/src/lib/initiativeState.ts | waitsOnBusiness | no test file names it |

14 flags: outside boundary 4, outside footprint 0, undeclared 8, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 2, could not read 0, boundary unreadable 0
```

Flags explained:
- outside boundary `decisionCrossings.test.ts`, `InitiativeHeader.cells.test.tsx`, `decisionStates.test.ts`: tests of boundary files ("and their tests"; component tests next to the components, Pre-answered). `decisionStates.test.ts` is lf54's lint: its check is unchanged; the allow-list gains five exact lines, each a `ruled` date field or a `"ruled"` section key (`sectionRows`, `gateRowWords`, `decSectionsOf`, `shownSections`, `sectionOf`), none a status literal.
- outside boundary `testdata/fixture-overlay/init-a/working-on/roadmap.yaml`: named by the builder (Declared changes); gates 0013-0015 on the joins stage so Overview's gate rows show the crossing states for D5. `make test` passes with it.
- undeclared `DecisionsView.test.tsx`, `RuleDecisionBox.test.tsx`, `decisionsPage.test.ts`, `decisions_test.go`, `InitiativeHeader.cells.test.tsx`: declared by file name in the test bullets; change-check reads only path-qualified names.
- undeclared `queue.ts:waitingOnOthers`, `decisions.go:statusWord`, `decisions.go:ownerName`: declared (`queue.ts:waitingOnOthers` in the queue bullet; `statusWord`, `ownerName` added in the decisions.go bullet), the parser misses the second symbol of a bullet.
- untested? `Overview.tsx:GateRow`: renders `gateRowWords`, tested in D5 (`decisionCrossings.test.ts`). `initiativeState.ts:waitsOnBusiness`: covered through `initiativeStates` (D1, `decisionStates.test.ts`).

Gate:
- D1 met. Needs me rows, `waitingChip`/`waitingDecisions`, `fseWaiting` and `waitsOnBusiness` all read `isRulable`; 0013 is in none. On 29e7d2c Needs me had 6 decision rows (0013 among them) and the FSE panel 5, so they disagreed there. On the branch both give 0002, 0003, 0008, 0009, 0010. FsePanel.tsx edit is earned under 2e089ed: on 29e7d2c a probe test `fseWaiting` with one proposed record owned by `operator` returned `[]`, expected `["decision:init-a/0013"]` (AssertionError, real assertion, not a missing export).
- D2 met (vitest `sectionOf`/`sectionRows`, DecisionsView.test "With the cells · 1" order, Themis line, no Rule). D3 met (InitiativeHeader.cells.test). D4 met (`decisionTone`, words). D5 met: vitest `gateRowWords`; `TestWriteDecisionsNamesEachStatus`; `organizer decisions init-a` on the fixture with overlay prints `12d awaiting cells` (0013), `applied 2026-10-21`, `acknowledged 2026-10-20`, and buckets only in the headings. D6 met: every owner render goes through `ownerName`/`ownerPhrase`/`ownerHover`/`ownerSign` (grep of `.owner` in frontend/src); CLI prints `owner pablo` for 0013, no "operator" in its output.
- Fail on 29e7d2c, checked here on a separate clone with the branch's tests copied in: 34 vitest fail (D1-D6 incl. all D1, D2, D5 cases) and `TestWriteDecisionsNamesEachStatus` fails (0013 `12d waiting`, 0014/0015 `ruled`, `owner operator`).
- Ruling still `proposed` only: `internal/service/rule.go` unchanged (`git diff 43e2bcd 7de55a1 -- internal/service/rule.go` empty).
- X0 met: `make test` (1431 vitest, Go ok, EXIT 0), `wails build` EXIT 0, `make review-build` EXIT 0, wailsjs/runtime unchanged, `git status --porcelain` empty.

Findings (none blocking):
- Note: `internal/service/rule.go` still signs "owner operator" under `## Ruling` when pablo rules an operator-owned proposed record, so FR-6 holds on screen but not in the written record (builder's "Found, not asked"). Outside this boundary; goes to a card (see next).
- Note: on the fixture the header's chip reads `6 decisions waiting` (0005 is alejandro's) and Needs me holds 5: the chip counts every rulable record (0068), Needs me the lead's. Both leave 0013 out, and they agree when every waiting record is the lead's (tested). The gate's "agree" does not say which; worth one word in the next spec that touches it.

## UI review
**Verdict: pass.** Commit reviewed: 7de55a1 (detached worktree, `make review-build`, `Deltagos Review` launched by its own path with `eval "$(scripts/fixture-home.sh --review)"`, `auth: off`, `discuss_state_dir` under the temp dir). Reviewer `l61-states-ui`, 2026-11-01. Shared test run: **reused** run `7fe02fde-66203` of 7de55a11ede0 (started by l61-states-rev; `make test` exit 0, 1431 vitest, Go ok; `.wt-notes/l61-states-ui/x0-make-test.txt`). Shots and AX dumps: `.wt-notes/l61-states-ui/` (`<w>x<h>-<state>.png`, `tree-*.txt`), at 1440x900 and 1024x640. Text read from the AX tree of the saved pid, AXPress on that pid only; colours from the shots and `styles/global.css`/`tokens.css`.

How each state was checked:
- (a) D1 met: Needs me expanded (Show the other 11) holds 16 rows, badge `Needs me 16` = heading `NEEDS ME · 16`; no 0013 row, no "awaiting cells", no "operator" anywhere on Home. init-a's header chip `6 decisions waiting` and FSE panel `waiting on you: 5` both leave 0013 out (see UI1). `1440x900-a-needsme-all.png`.
- (b) D2 met: Decisions reads `To rule · 6`, `With the cells · 1`, `Ruled · 8` in that order; 0013 line `awaiting cells, owner pablo, 12 days`, fuchsia waiting badge; expanded: "Waits on the cells it affects. Themis settles it.", no Rule button; Timeline bar `.dec-bar.proposed` (dashed) to today. `1440x900-c-press-to-decisions.png`, `1440x900-d-timeline.png`, `1024x640-b-with-cells.png`.
- (c) D3 met: header `6 decisions waiting` (lozenge) then `· 1 with the cells` (`button.linkish.ihead-cells`, `--fg-subtle`, `--font-size-sm`, no lozenge; 86x28 target). AXPress opened Decisions with 0013 expanded and focused inside With the cells. `1440x900-c-header-overview.png`.
- (d) D4 met: 0014 `applied`, 0015 `acknowledged` badges in the ruled indigo pair; bars `.dec-bar.ruled`; Overview diamonds solid for 0014/0015, hollow fuchsia for 0002/0013. `1440x900-d-ruled-0014-0015.png`.
- (e) D5 met: Overview gate rows `awaiting cells 12d`, `applied 21 Oct`, `acknowledged 20 Oct`; `organizer decisions init-a` prints `12d awaiting cells`, `applied 2026-10-21`, `acknowledged 2026-10-20` (`decisions-init-a.txt`). `1440x900-e-overview-gates.png`, `1024x640-e-overview-gates.png`.
- (f) D6 met on screen: 0013's owner reads `owner pablo` in Decisions (line and timeline); the rule box on 0002 reads `signed pablo · commits one file`, on 0005 `signed pablo · owner alejandro · commits one file` (opened and cancelled, nothing ruled). The only "operator" on screen is the fixture's 0013 body prose (`owner is written operator`), not the owner field. `1440x900-f-rulebox-0002.png`, `1440x900-g-rulebox-0005.png`.
- (g) Plain proposed and ruled records look as in l54-states-ui's main-side shot (`.wt-notes/l54-states-ui/1440x900-b-torule-ruled.png`): waiting fuchsia, ruled indigo, same row anatomy. Status is said in words beside every tone (waiting/awaiting cells/applied/acknowledged/ruled), and the dashed versus solid bar carries it without colour.

Findings:
- **UI1 (sev 2)** The lead cannot tell from one screen how many decisions wait on them. Where: init-a Overview, header `6 decisions waiting` beside the FSE panel `waiting on you: 5` (`1440x900-e-overview-gates.png`). Evidence: AX text; the header counts every rulable record (0005 is alejandro's, 0068), the panel the lead's; DS-a says the panel "equals the header's count". Severity 2: the words differ ("waiting" vs "waiting on you") and Home's Waiting on others explains 0005. Proposal: one ruling on which count the header shows (spec gap below).
- **UI2 (sev 1)** A keyboard or screen-reader user cannot reach the raw owner. Where: Decisions line, owner span. Evidence: `ownerHover` is a `title` on a span inside the `.dec-line` button (DecisionsView.tsx:331); WebKit flattens the button, so AXHelp shows `collapse`/`show the record`, never `owner: operator`. Mouse hover only. Proposal: leave as is; the raw value is a debugging aid.
- **UI3 (sev 1, not this card's code)** After a live resize 1440→1024, the header's wrapped second row (unread chip, target) sat over the sub-view tabs (`1024x640-c-header-overlap.png`: header 76 px, tabs at its y 44); reopening init-a reflowed it to 96 px (`1024x640-c-header-reopen.png`). Seen once, cause not traced; for the FSE to watch.

Not verified:
- D3's landing scroll: the smooth `scrollTo` never ran in my window (onscreen but behind other windows, z 17; WebKit throttles it), at 1440 and 1024, so at 1024 0013 stayed at the bottom edge (`1024x640-c-press-landing.png`) though focused. Not judged; the press → `openDecision(init-a, 0013)` is pinned by `InitiativeHeader.cells.test.tsx`.
- The hover holding "owner: operator" on screen (see UI2); verified only by source and `DecisionsView.test.tsx`.
- No fixture record is a proposed one owned by `operator`, so "owner operator" dropped in the rule box is in vitest only.

Spec gaps (for the FSE):
- D1/DS-a "agree": the fixture's header (6) and panel (5) differ through 0005; the spec should say whether the header counts every rulable record or the lead's.
- FR-6 "everywhere" stops at the screen: `internal/service/rule.go` still signs "owner operator" under `## Ruling` (already filed, 88b5584).

For aglaea (design questions, not verified):
- A1: should Home's initiative row carry a with-the-cells signal, now that `waitingDecisions` leaves those records out of its "N waiting" (builder's note)?
- A2: should the header's chip count the lead's records, matching the FSE panel and Needs me (UI1)?
