---
title: "The release build reads the contract samples from the specs repo, pinned"
status: now
repos: [organizer]
branch: lf54-ci-contracts
seat: l54-ci
stage:
updated: 2026-11-01
next: "review: lf54-ci-contracts, G2 passes (fails on origin/main), X0 fails only TestWorkingOnContract identically to origin/main 076eb5c (Amendment 4: X0 on the merge with lf54-decision-states), 82ed5a6"
depends_on: [lf53-frontmatter, lf53-usage-contract]
boundary: ["docs/specs/leftovers-54.md Boundary, lf54-ci-contracts"]
spec: "docs/specs/leftovers-54.md (FR-2)"
gate: "docs/specs/leftovers-54.md#Acceptance → gate"
ui_review: false
---

## Goal
A tag build runs the contract tests against the same samples as lodestar.

## Gate
docs/specs/leftovers-54.md, rows G2 and X0.

## Done
- l54-ci, 2026-11-01: release.yml checks out agent-mailbox-specs at 54cf10da4fcbae240a8abb7ee8353fd4e8c5bafa into `agent-mailbox-specs/` beside `organizer/`, CONTRACTS_DIR for make test; G2 test `TestReleaseWorkflowPinsContracts` (root package). Branch at 82ed5a6 on origin/main 6b6e349. Detail: `.wt-notes/l54-ci/progress.md`.

## Declared changes
- modified `.github/workflows/release.yml`: organizer checked out into `organizer/` (job default working-directory), a second checkout of pabloantipan/agent-mailbox-specs pinned to the full SHA into the sibling `agent-mailbox-specs/`, `CONTRACTS_DIR` on the Test step, setup-go, pnpm cache, frontend dir and release asset paths prefixed `organizer/`
- added `release_workflow_test.go:TestReleaseWorkflowPinsContracts`: G2, fails unless the specs checkout is pinned to a 40-hex SHA outside the organizer's checkout before make test, and CONTRACTS_DIR points at its contracts/
Risky:
- `release.yml`: the moved paths (setup-go `go-version-file`, setup-node `cache-dependency-path`, the DMG glob) are checked by reading only; the first tag build is the proof
Not changed, on purpose:
- `Makefile`: `go test ./...` already runs the root package's test
- `internal/scan/contract_test.go`: TestWorkingOnContract is lf54-decision-states'

## Notes
- origin/main moved 076eb5c → 6b6e349 during the build; nothing touched release.yml.
