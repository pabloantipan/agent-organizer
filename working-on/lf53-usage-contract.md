---
title: "The usage post is tested against the record's own sample, posts every cost source, and a refused batch no longer blocks the rest"
status: next
repos: [organizer]
branch: lf53-usage-contract
seat: l53-usage
stage:
updated: 2026-10-25
next: "review: lf53-usage-contract, gate met (U1, U2, X0), c2a457f"
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
