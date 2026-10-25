---
title: "The usage post is tested against the record's own sample, posts every cost source, and a refused batch no longer blocks the rest"
status: done
repos: [organizer]
branch: lf53-usage-contract
seat: l53-usage
stage:
updated: 2026-10-25
next: "done: reviewed pass (l53-usage-rev); the three findings filed in docs/bitacora/fse_bitacora.md 2026-10-25 03:25 (7ac9cdb)"
review: pass
reviewer: l53-usage-rev
depends_on: []
boundary: ["docs/specs/leftovers-53.md Boundary, lf53-usage-contract"]
spec: "docs/specs/leftovers-53.md (FR-5 to FR-6)"
gate: "docs/specs/leftovers-53.md#Acceptance → gate"
ui_review: false
---

## Goal
Every usage row reaches the record, and a contract change fails a test before it reaches a machine.

## Gate
docs/specs/leftovers-53.md, rows U1-U2 and X0.

## Done
- Gate met on branch lf53-usage-contract at c2a457f (rebased on main bccd979): U1, U2, X0; fail-on-main proof and commands in .wt-notes/l53-usage/progress.md.

## Declared changes
- modified `internal/service/usagepost.go:postUsage`: a batch the record refuses leaves its rows unsent and the pass goes on; one with no answer still ends it (FR-6)
- added `internal/service/usagepost.go:usageRefusal`: one refused batch (batch, of, rows, reason) in the state
- modified `internal/service/usagepost.go:usagePostOutcome`: `refused` list; `rows` counts accepted rows only
- modified `internal/service/usagepost.go:UsagePostStatus`: "N of M batches refused, K rows posted: <reason>"
- modified `internal/service/usagepost_test.go`: reads usage-batch.json (fails when missing), every cost source through usageRow against the sample, refused-batch tests; `contractKeys` deleted (FR-5)
- modified `internal/record/usage.go:UsageRow`: the cost_from comment names priced
Risky:
- `postUsage`: a 401 or 5xx on every batch now makes one request per batch instead of one per pass (each answered, so fast)
Not changed, on purpose:
- `internal/record/usage.go:PostUsage`: still ignores a 200's `rejected` rows (see Notes)
- `usageRow`: already posted `priced` as is and matched the sample

## Notes
- CI: release.yml runs make test on GitHub, where the sample does not exist; U1's tests fail there by design (README rule 3) until CI has the specs repo or a vendored copy with its diff guard.
- Row-level refusals: a 200 with `rejected` rows is marked accepted and never resent; not FR-6's batch case, a later card.
- The sample allows null first/last; usageRow always formats a time.

## Review
Verdict: **pass** at c2a457f (the pinned SHA; the branch did not move). Unmet gate items: none. Reviewer l53-usage-rev, 2026-10-25. The card stays open because the three findings below have no card, record or backlog line yet.

change-check, run from the clean clone:
```
change-check: working-on/lf53-usage-contract.md
risk: medium (missing, read as medium)
repo organizer: base 742a20e90 (default origin/main) ... head lf53-usage-contract (clone HEAD c2a457fcb, on detached) c2a457fcb; 3 files, 0 flags
## Changed
- organizer/internal/record/usage.go (modified): UsageRow
- organizer/internal/service/usagepost.go (modified): usagePostOutcome, usageRefusal, postUsage, UsagePostStatus
- organizer/internal/service/usagepost_test.go (modified, test)
## Flags
none
0 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 0, could not read 0, boundary unreadable 0
```
It printed 0 flags, so there are no `undeclared`, `outside boundary` or `declared, not changed` lines to explain. All three files are inside the card's Boundary.

- **U1** met. `TestUsageRowsMatchTheSample` builds one row through `usageRow` for each of record, record+reset, transcript, priced, reset+priced, null and unattributed. It compares each to the sample's own valid row (keys, model keys, values, and `cost_from` within the enum record, transcript, priced, null), read by path from `~/agent-slack/specs/contracts/usage-batch.json`. `grep -rn contractKeys --include='*.go'` finds nothing. With the sample missing (`CONTRACTS_DIR` set to an empty dir) the tests FAIL "the usage contract sample is missing". With a mutated copy (extra row key `machine`, `priced` dropped from the enum) they FAIL "row keys … want … machine" and "cost_from \"priced\" is not in the sample's enum".
- **U2** met. `TestRefusedBatchDoesNotEndThePass` posts 1203 rows against answers 200/400/200. Batches of 500, 500 and 203 are posted and 703 rows are accepted; the refused rows are not. The state reads `refused:[{batch 2, of 3, rows 500, HTTP 400}]`, the log has one line "refused batch 2 of 3 … 500 rows unsent", and the next pass resends exactly those 500.
- **Fails on main**: I ran the branch's test file on 742a20e, minus one assertion on the new `Refused` field, which does not compile there. `TestRefusedBatchDoesNotEndThePass` FAILs "batch sizes [500 500], want [500 500 203]" and `TestUsagePostStatusNamesRefusals` FAILs. `TestUsageRowsMatchTheSample` passes on main, because main's `usageRow` already matched the sample. U1 is a test-only change, as the card says.
- **X0** met. `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` exits 0: every Go package ok, vitest 1297 passed. `test-lease run -- wails build` exits 0, and `git status --porcelain` is empty.

Outside the gate (Notes; none is proved against the gate). The builder's three "found, not asked" items stand; filed by the FSE in its held list for the next leftovers, docs/bitacora/fse_bitacora.md 2026-10-25 03:25 (7ac9cdb), the CI one also asked of Hephaistos:
1. `release.yml` runs `make test` where the sample does not exist, so a tag build fails on U1 by design.
2. `PostUsage` ignores a 200's `rejected` rows, so a row the record refuses at row level is marked accepted and never sent again.
3. `usageRow` formats a zero `first`/`last` instead of sending null.

Note: a 401 now costs one request per batch per pass (declared risky).
