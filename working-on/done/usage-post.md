---
title: "Post changed usage rows to the local record after each ledger pass"
status: done
repos: [organizer]
branch: usage-post
seat: up-build
updated: 2026-10-15
next: "review: usage-post, gate met (U1-U7, X0; Amendment 1 built), 2db9558"
review: pass
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
- 2026-10-15: up-build built usage-post on branch usage-post (ca36eaf, 02cc5c1, cf699e5, 2db9558); gate met, X0 rerun after Amendment 1, rebased on main.

## Notes
- 2026-10-15: run by sup73 (organizer-probe-sup73), spawned by the FSE.
- 2026-10-15: `organizer usage` exits right after printing, so its background post dies with the process; fixed under spec Amendment 1 (26a403f): the CLI waits for its post after printing, at most 10 s (2db9558, TestWaitUsagePostIsBounded). "Configured, nothing posted yet" is a fourth doctor wording the spec has no case for.

## Review
Verdict: pass. Every row met at 2db9558 (up-review, 2026-10-15). Fresh clone at 2db955831754386362d8ad93642b0bf2c7afecb5; gate tests in .wt-notes/up-review/gate-tests.txt.
- U1: TestU1PostsThreeRowsWithContractKeys read and run, pass: one POST /v1/usage, Bearer the test key, factory testfactory, body keys factory+rows, row keys exactly the 16 contract keys while the line carries cwd, task_title, reason, cards; `record.UsageRow` has no field for them.
- U2: TestU2BatchesOf500, pass: 500, 500, 203, 1,203 distinct rows.
- U3: TestU3OnlyChangedRows, pass: second pass 0 posts (ledger-only fields changed too), then one post with the one grown row.
- U4: TestU4FailedBatchResent, pass: 500 then 200 through Service.Usage, same rows resent, views equal bar Stats, one organizer.log line with HTTP 500 and the record's text, key absent although the record echoes it.
- U5: TestU5Unattributed, pass: "unattributed", no task/seat keys with a session name.
- U6: TestU6OffAndUnreachable + TestDoctorReportsTheUsagePost, pass: no request without record_url or key, closed port returns the view and records failed (connection refused), doctor prints off/ok/failed in FR-5's words.
- U7: TestU7PostDoesNotDelayUsage, pass: Service.Usage < 200 ms with the record holding 2 s; a second pass during the held post skips (1 post). Amendment 1: `defer service.WaitUsagePost()` after the Usage call, waitUsagePost(10 s), per-request client timeout 10 s; TestWaitUsagePostIsBounded pass.
- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` pass (go + 741 vitest), `pnpm run build` pass, `wails build` pass, `git status --porcelain` empty; logs in .wt-notes/up-review/.
- No-gos and Boundary read in the diff: key only read and cut from reasons, never logged or stored; no field outside the contract; no retry loop, timer or daemon; files are internal/record/usage.go, internal/service/usagepost.go, the call in service/usage.go, doctor's line in cli/cli.go, the amended call in cli/usage.go, tests. No ledger, frontend or app.go change.
Unmet rows: none. Shared test run: fresh, run 02c7a0b7-72869 at 2db9558.
Not in the gate: doctor's fourth wording "nothing posted yet" has no FR-5 case; the state file is written by app and CLI without a lock (worst case a resend).
Reviewer up-review, 2026-10-15, commit 2db955831754386362d8ad93642b0bf2c7afecb5.
