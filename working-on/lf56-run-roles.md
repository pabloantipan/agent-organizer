---
title: "Every run is attributed to an initiative, a task and a role, and runs and usage agree"
status: now
repos: [organizer]
branch: lf56-run-roles
seat: l56-roles
supervisor: organizer-probe-sup96
stage:
updated: 2026-11-01
next: "talos-lab merges the PR (thread 01M6C0E2XR49SSXWY76HANW1PF; review pass at 161bf86); the FSE moves it to done/ on the merge sha. sup96 ended 2026-11-01"
review: pass
reviewer: l56-roles-rev
depends_on: []
boundary: ["docs/specs/leftovers-56.md Boundary"]
spec: "docs/specs/leftovers-56.md (FR-1 to FR-6)"
gate: "docs/specs/leftovers-56.md#Acceptance → gate"
ui_review: false
prs:
  - {repo: organizer, pr: 11, target: main, state: merged, merge: 4bd5102}
---

## Goal
No run's cost is left without an initiative, a task and a role, so Hestia's fact ledger can read where every dollar went.

## Gate
docs/specs/leftovers-56.md, rows A1-A6 and X0.

## Done
- 2026-11-01 l56-roles: FR-1 to FR-6 built on lf56-run-roles (bcc75a4, bc7a323, bf60948), plus the share with none by cause for A6 (161bf86, Amendment 2, f5a8751); on origin/main 21b5d5d. A1-A5 fail on main and pass on the branch. X0 passes from a clean clone at 161bf86 (make test: 19 Go packages ok, vitest 1297 passed; wails build ok; git status empty). A6 ran on lodestar (this Mac, lodestar.local), on a copy of the data dir with record_url stripped from a config copy. `organizer usage` W44: 63.1% overhead, 11.5% with no task (9.4% supervisor no record or card names, 2.0% seat several cards name). `organizer runs`: 25.5% overhead, 13.6% with no task (8.6% supervisor, 3.1% seat several cards name, 1.0% no usage row, 0.9% no card's seat: matches).

## Declared changes
- modified `internal/usage/attribute.go:Attribute`: initiative `factory` outside every root; `overhead:<role>` for fse, persona, pair, session; a nameless session is a plain session (FR-1)
- added `internal/usage/attribute.go:supervisorCards`: an accept record's `supervisor:` first, then the cards' bodies (FR-2)
- added `internal/usage/attribute.go:cardOfReviewer`, `reviewedBy`: the card whose `reviewer:` names the seat comes before `seat:`, and such a seat is a reviewer (FR-3)
- added `internal/usage/attribute.go:IsCardTask`, `Factory`, `OverheadPrefix`, `Record`, `Initiative.Records`, `Card.Reviewers`: what FR-1 to FR-4 read
- added `internal/usage/roles.go:LoadRoles`: reads `reviewer:` from cards and `supervisor:`/`cards:` from records under `Initiative.Root`, skipping files that do not parse (leftovers-56 Amendment 1, 46f3b55)
- modified `internal/usage/ledger.go:Ingest`: keeps only an attribution with a card task and attributes the rest again at each pass (FR-4); `rebuild.restore` sets `Fixed` by the same rule
- modified `internal/usage/report.go:cut`: an overhead task row gets no `cards`, so the view links no card
- added `internal/usage/report.go:BySession`, `Shares`, `SessionShares`: the ledger's attribution per session (FR-5) and the two shares (FR-6)
- modified `internal/service/run.go:Runs`, `InitiativeRuns`, `runsView`, `runConversations`; added `withAttribution`, `ledgerTasks`: a run's initiative and card come from its usage row (FR-5)
- modified `internal/cli/usage.go:WriteUsage`, `internal/cli/run.go:WriteRuns` (now takes the ledger's reasons), `runsCmd`; added `sharesLine`, `writeCauses`: the overhead and no-task shares (FR-6) and the no-task share by cause (Amendment 2)
- added `internal/usage/report.go:CauseOf`, `ByCause`, `CauseShare`, the `Cause*` constants: the no-task share by cause (Amendment 2)
- modified `internal/cli/testdata/runs.golden`: the shares line
- added tests `internal/usage/lf56_test.go`, `internal/usage/roles_test.go`, `internal/service/runs_lf56_test.go`, `internal/cli/runs_lf56_test.go`; modified `attribute_test.go`, `ledger_test.go`, `usage_test.go`, `run_test.go` (expectations moved by FR-1, and the new runsView argument)
Risky:
- `Ingest`: every session without a card task is attributed again at each pass, so FSE and persona sessions now take a moment's cards into account at every read instead of once
- `withAttribution`: a run's card can now be `overhead:<role>` or `wave:<seat>`; Overview shows it as text
Not changed, on purpose:
- `internal/service/usage.go`: LoadRoles reads under Root, so the scan and the model need no new fields (Amendment 1)
- `RunInfo`, `usage.View`, `Row`, `SessionRow`: no new fields, so the Wails bindings do not change; the shares are printed by the CLI
- `runs.jsonl`: never rewritten (FR-4)

## Notes
- Premise 1 only half holds: a `-build` seat without a card was already retried. What was kept forever was a no-reason answer with no task (fse, persona, pair, session, and a suffixless builder seat read as session).
- Cards carry `supervisor:` in their own frontmatter (this card; hestia `supervisor: sup32`); FR-2 reads it only from records. Reading it from cards would recover about 1.1% of runs cost here. Not built.
- `organizer usage` posts to the record when `record_url` is set: an A6 run on a data-dir copy needs a config copy without it.

## Review
**pass** at 161bf86 (lf56-run-roles, not moved). Unmet gate items: none. Reviewer l56-roles-rev, 2026-11-01, on lodestar (lodestar.local), from a clean clone.

- A1 `TestLF56A1EveryRunHasInitiativeAndTask` passes; on 21b5d5d all 7 subtests fail (fse/persona/session task "", pair "no initiative root above /home/p").
- A2 `TestLF56A2SupervisorFromAcceptRecord` passes (record with one card → its slug; two → `wave:sup95` with both slugs; record before cards). Main has no `Record`; same input there: `organizer-probe-sup95` → task "" "no card names sup95 as its supervisor". The two-cards half (`wave:sup90`) already held on main.
- A3 `TestLF56A3ReviewerFromReviewerField` passes; on main `organizer-probe-l54-retire-rev` → builder, task `decoy`.
- A4 `TestLF56A4AttributedAgainUntilCardTask` passes; on main: "next read … task \"\", want lf56-run-roles".
- A5 `TestLF56A5RunsViewCardIsUsageTask`, `TestLF56A5RunsCardIsUsageTask` pass; the CLI one on main: "s-build: runs says organizer/old-card, its usage row organizer/lf56-run-roles" (and s-fse, s-sup). The service one does not compile on main (runsView's new argument).
- A6 (Amendment 2 wording; data dir and config copied, `record_url` stripped, binary from the clone's wails build):
  - `organizer usage` (2026-W44): `cost      62.6% overhead · 11.3% with no task`; 9.4% a supervisor no record or card names; 2.0% a seat several cards name.
  - `organizer runs` (957 runs, $3842.01), after usage had ingested: `cost      25.5% overhead · 13.6% with no task`; 8.6% a supervisor no record or card names; 3.0% a seat several cards name; 1.0% a run with no usage row; 0.9% a builder or reviewer no card's seat: matches.
- X0: `make test` fresh (queued behind hestia-probe-ars-build's lint, then ran; no --share replay): 19 Go packages ok, vitest 86 files / 1297 tests passed; `wails build` ok; `git status --porcelain` empty.

change-check (`change-check organizer lf56-run-roles`): 44 flags: outside boundary 1, undeclared 30, untested? 12, could not read 1, declared-not-changed 0.
- outside boundary `internal/service/runs_lf56_test.go`: the boundary names `internal/service/run.go … and its test`; this is that test, in a new file.
- undeclared (30): every one is a symbol the Declared changes do name, in a bullet listing several (`runsCmd`, `WriteRuns`, `sharesLine`, `writeCauses`, `InitiativeRuns`, `ledgerTasks`, `withAttribution`, `runsView`, `runConversations`, `Record`, `Initiative.Records`, `Card.Reviewers`, `reviewedBy`, `rebuild.restore`, `Shares`, `SessionShares`, `CauseShare`, `ByCause`) or the test files of the unreadable tests bullet; the parser reads one symbol per bullet. Three are not named: `roleOf` (its two changes, a nameless session is a session and a `reviewer:`-named seat is a reviewer, are declared under `Attribute` and `cardOfReviewer`), and `readFront`, `names` (LoadRoles' helpers in the new roles.go).
- untested? (12): each is reached by a gate test: `supervisorCards`/`IsCardTask`/`roleOf` through A1-A4 (`Attribute`, `Ingest`), `cardOfReviewer`/`reviewedBy` through A3, `readFront` through `TestLoadRolesFromRoot`, `withAttribution`/`ledgerTasks`/`runsCmd`/`sharesLine`/`writeCauses`/`SessionShares` through the A5/A6 CLI and service tests.
- could not read: the tests bullet is not in the one-file-or-symbol form.

Findings and where they went:
- Found, not asked 1 (premise 1 half holds): answered on this card by FR-4; no further work.
- Found, not asked 2 (FR-2 does not read a card's own `supervisor:`, ~1.1% of runs cost): nowhere yet → `next`.
- Found, not asked 3 (`organizer usage` posts with `record_url`): a run instruction, already in this card's Notes and the review prompt; no work.
- Outside the gate, Note: `organizer runs` reads the ledger as the last usage pass left it, so on a ledger last written by main it prints main's attribution: run first on the copy it gave `0.0% overhead · 40.6% with no task`, 20.6% "not attributed, no reason given", 4.5% "no initiative root above /Users/pabloantipan"; after one `organizer usage` it gave the numbers above. Self-heals on the first usage pass; nowhere yet → `next`.
- Note: Declared changes put several symbols in one bullet, against build-seat's one-per-bullet format; that is the 30 undeclared above.

Clone `.wt-notes/l56-roles-rev/clean` removed after the review; logs in `.wt-notes/l56-roles-rev/`.
