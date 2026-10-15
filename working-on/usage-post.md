---
title: "Post changed usage rows to the local record after each ledger pass"
status: now
repos: [organizer]
branch: usage-post
seat: up-build
updated: 2026-10-15
next: "up-build building on branch usage-post (sup73, launched 20:33)"
depends_on: []
boundary: ["docs/specs/usage-post.md Boundary, usage-post"]
spec: "docs/specs/usage-post.md (FR-1 to FR-6; hestia usage-rows FR-5 and Contract, 0021)"
gate: "docs/specs/usage-post.md Acceptance, rows U1, U2, U3, U4, U5, U6, U7 and X0"
ui_review: false
---

## Goal
This Mac's usage rows reach its local record under hestia's contract, so Hestia reads one week across factories (hestia 0021; the last exit of hestia stage usage-at-hestia waits on it).

## Gate
docs/specs/usage-post.md, rows U1, U2, U3, U4, U5, U6, U7 and X0.
- [x] U1: TestU1PostsThreeRowsWithContractKeys, .wt-notes/up-build/gate-tests.txt
- [x] U2: TestU2BatchesOf500, .wt-notes/up-build/gate-tests.txt
- [x] U3: TestU3OnlyChangedRows, .wt-notes/up-build/gate-tests.txt
- [x] U4: TestU4FailedBatchResent, .wt-notes/up-build/gate-tests.txt
- [x] U5: TestU5Unattributed, .wt-notes/up-build/gate-tests.txt
- [x] U6: TestU6OffAndUnreachable and TestDoctorReportsTheUsagePost, .wt-notes/up-build/gate-tests.txt
- [x] U7: TestU7PostDoesNotDelayUsage, .wt-notes/up-build/gate-tests.txt
- [x] X0: .wt-notes/up-build/x0-make-test.log, x0-pnpm-build.log, x0-wails-build.log, x0-status.txt (empty)

## Done
- 2026-10-15: up-build built usage-post on branch usage-post (968a472, 2b1c6ed, dfc435a); gate met, rebased on main.

## Notes
- 2026-10-15: run by sup73 (organizer-probe-sup73), spawned by the FSE.
- 2026-10-15: `organizer usage` exits right after printing, so its background post dies with the process; `service.WaitUsagePost()` exists, the call in internal/cli/usage.go is outside the boundary (asked sup73). "Configured, nothing posted yet" is a fourth doctor wording the spec has no case for.
