# Usage rows to the local record: the build spec

status: proposed (0136)
by: the FSE, 2026-10-15, on main at f331751
sources: hestia 0021 (Pablo, 2026-10-15, in the hestia FSE session: "Q1
organizer-posts; Q2 numbers-only"), relayed by Hephaistos (organizer thread
01M50RN6, hestia thread 01M50R5Z); the contract is hestia
`docs/specs/usage-rows.md`, FR-5 and "Contract". Code read before writing:
`internal/service/usage.go` (`Service.Usage` runs `usage.Ingest`, the ledger
pass, then `usage.Build`), `internal/usage/ledger.go` (`Line`,
`Attribution`, `DataPaths`, `LoadLedger`), `internal/record` (`Client`,
`post`, `ReadKey`, `Factory`), `internal/config` (`record_url`; this Mac:
`http://127.0.0.1:8090`).

## Requirements, card `usage-post` (Go)

- **FR-1** After each ledger pass (`usage.Ingest` returning without error),
  the organizer posts the ledger lines that changed since they were last
  accepted to `<record_url>/v1/usage`, `Authorization: Bearer <factory
  key>` (`record.ReadKey`), body `{"factory": <record.Factory>, "rows":
  [...]}`, at most 500 rows per post, in as many posts as needed.
- **FR-2** Each row carries exactly the contract's fields: `session_id`,
  `day`, `initiative`, `role`, `task`, `seat` (the session name,
  `Attribution.Name`), `input`, `output`, `cache_read`, `cache_write`,
  `models`, `messages`, `first`, `last` (RFC 3339), `cost` (number or
  null), `cost_from` (`record`, `transcript` or null). Never `cwd`,
  `task_title`, `reason`, `cards`, nor any other field.
- **FR-3** (0021 Q2) A line with no initiative goes as `initiative:
  "unattributed"` with no `task` and no `seat`.
- **FR-4** "Changed" is per (session_id, day): the organizer keeps, beside
  the ledger in the data dir, the hash of each row as last accepted (a 2xx).
  A row is sent when its hash differs or it was never accepted; a batch not
  accepted leaves its rows unsent, so the next pass resends them. An
  unchanged resend is harmless by the contract.
- **FR-5** No `record_url`, no key or no factory id: no request, no error,
  nothing logged beyond one debug line. A record that does not answer, or
  answers non-2xx: the Usage view and `organizer usage` still return their
  result unchanged; the failure is one line in `organizer.log` (status and
  the record's error text, never the key) and `organizer doctor` reports the
  last post's outcome (`usage post: ok <time>, <n> rows` / `failed <time>:
  <reason>` / `off: <why>`).
- **FR-6** The post never delays the Usage view: it runs after the view's
  result is built, off the caller's path, one at a time (a pass that finds a
  post running skips its own; the next pass catches up).

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| U1 | 1, 2 | go test with an `httptest` record: a ledger of three lines, one pass | one POST to `/v1/usage`, Bearer the test key, `factory` the test id, three rows whose JSON keys are exactly the contract's set (cwd, task_title, reason, cards absent even when the line has them) |
| U2 | 1 | go test: 1,203 changed lines | three posts of 500, 500, 203 |
| U3 | 4 | go test: a second pass with nothing changed; then one line's tokens grow | 0 posts; then one post with that one row |
| U4 | 4, 5 | go test: the record answers 500, then 200 on the next pass | the first pass's rows are resent in the second; the view's result identical in both; one log line, no key in it |
| U5 | 3 | go test: a line with no initiative and a session name | `initiative: "unattributed"`, no `task`, no `seat` keys |
| U6 | 5 | go test: no `record_url`; no key file; an unreachable URL (closed port) | no request in the first two; the third returns the view and records `failed`; `doctor` prints the three outcomes as FR-5 words |
| U7 | 6 | go test: a record that holds the request 2 s | `Service.Usage` returns in under 200 ms |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

The end-to-end check against hestia's real route waits on hestia card
usage-rows; it joins `factory-integration`'s next action (the local record
at `127.0.0.1:8090`), not this gate.

## Boundary

- `usage-post`: a new file in `internal/record` (the post and its request
  types) and one in `internal/usage` or `internal/service` (the changed-row
  state and the trigger after `Ingest`), `internal/service/usage.go` only to
  call it, `internal/cli` only for `doctor`'s line, their tests. Not: the
  ledger's format or its attribution, the frontend, the record's server
  side, `push.key` handling beyond reading it.

## No-gos

- The key is never logged, printed or stored anywhere but `push.key`. No
  row field outside the contract, ever. No retry loop or daemon: the next
  ledger pass is the retry.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `usage-post` | U1, U2, U3, U4, U5, U6, U7, X0 | — | false |

Amendment 1, 2026-10-15, the FSE, from up-build via sup73 (thread
01M50YCH): `organizer usage` exits right after printing
(`internal/cli/usage.go:42`), so a post started off the caller's path dies
with the process and the CLI never posts, though FR-5 names it. So:
- The Boundary also allows one call in `internal/cli/usage.go` after the
  output is printed that waits for the post (`service.WaitUsagePost`). The
  output and its timing are unchanged; the wait is bounded (the post's
  request timeout, at most 10 s), so an unreachable record never holds the
  CLI longer than that.
