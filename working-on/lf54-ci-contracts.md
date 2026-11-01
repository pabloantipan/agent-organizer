---
title: "The release build reads the contract samples from the specs repo, pinned"
status: now
repos: [organizer]
branch: lf54-ci-contracts
seat: l54-ci
stage:
updated: 2026-11-01
next: "PR with talos-lab (dca1222, review pass, X0 on the rebased head)"
depends_on: [lf53-frontmatter, lf53-usage-contract]
boundary: ["docs/specs/leftovers-54.md Boundary, lf54-ci-contracts"]
spec: "docs/specs/leftovers-54.md (FR-2)"
gate: "docs/specs/leftovers-54.md#Acceptance → gate"
ui_review: false
review: pass
reviewer: l54-ci-rev
prs:
  - {repo: organizer, pr: 17, target: main, state: merged, merge: 274c8e1}
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

## Review
Verdict: pass. Unmet gate items: none. Reviewer l54-ci-rev, 2026-11-01.
X0 ran on branch 82ed5a6 alone and on merge e5a8bf8 (82ed5a6 + lf54-decision-states 1df5001, `git merge --no-edit 1df5001` in the reviewer's clean clone), CONTRACTS_DIR at specs 54cf10d. Test runs fresh (test-lease --share, no replay on either SHA; a stale replay of an earlier merge was discarded). Logs: `.wt-notes/l54-ci-rev/`.

change-check (clean clone at 82ed5a6):
```
| outside boundary | organizer/release_workflow_test.go |  | added |
| undeclared | organizer/release_workflow_test.go |  | added |
| declared, not changed |  | release_workflow_test.go:TestReleaseWorkflowPinsContracts | no matching change |
| risk |  | high suggested | card says medium; infra: .github/workflows/release.yml |
4 flags: outside boundary 1, outside footprint 0, undeclared 1, declared, not changed 1, new env var 0, new dependency 0, new host 0, risk 1, untested? 0, could not read 0, boundary unreadable 0
```
- outside boundary: the boundary names "the test that reads it" without a path; release_workflow_test.go is that test.
- undeclared / declared, not changed: one file; the declared `file:Symbol` bullet was not matched to the added file. Declared.
- risk: note only.

- G2: pass. `go test -run TestReleaseWorkflowPinsContracts` against 076eb5c's release.yml (same as origin/main's) fails: "job macos: no actions/checkout of pabloantipan/agent-mailbox-specs before make test (step 6)"; passes at 82ed5a6 (`ok organizer` in make test). Short ref, missing CONTRACTS_DIR, and a specs path inside organizer/ each fail it. Local make test at the pin passes on the merge.
- FR-2 and paths: specs repo public, pin 54cf10da… on its main; sibling checkout, no vendored copy, one ref line. go-version-file, cache-dependency-path, step working-directory organizer/frontend, scripts/*, make targets and the organizer/build/bin/*.dmg(.sha256) globs all resolve from where their step runs; git describe runs in organizer/ with fetch-depth 0 and sees the tags.
- X0 on 82ed5a6 alone: make test fails only TestWorkingOnContract (ruled_by modes, 0012 forecast band), byte-identical to `go test ./internal/scan/` on 076eb5c; wails build ok; porcelain empty.
- X0 on e5a8bf8: make test passes (Go all ok, vitest 87 files / 1385 tests); wails build ok; porcelain empty.
- Note: no gate row runs a tag build; the first tag after merge proves the workflow in Actions (builder's Risky).
- 2026-11-01, X0 rerun: on dca1222 (82ed5a6 rebased by sup99 onto origin/main 29e7d2c; range-diff shows both commits `=`, and `git diff 82ed5a6 dca1222` equals `git diff 6b6e349 29e7d2c`, so only origin/main's changes) make test passes fresh (Go all ok, vitest 87 files / 1397 tests), wails build ok, porcelain empty. Verdict stays pass. (Merge 1131f36 with ae0d9c6 had passed make test too before the rebase superseded it.)
