---
title: "Every run is attributed to an initiative, a task and a role, and runs and usage agree"
status: now
repos: [organizer]
branch: lf56-run-roles
seat: l56-roles
supervisor: organizer-probe-sup96
stage:
updated: 2026-11-01
next: "review: lf56-run-roles, A1-A6 and X0 pass (A6 per Amendment 2, on lodestar), 161bf86"
depends_on: []
boundary: ["docs/specs/leftovers-56.md Boundary"]
spec: "docs/specs/leftovers-56.md (FR-1 to FR-6)"
gate: "docs/specs/leftovers-56.md#Acceptance → gate"
ui_review: false
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
