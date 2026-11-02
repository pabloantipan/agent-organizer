# Leftovers 62: today's review findings: the build spec

status: proposed (0175)
by: the FSE, 2026-11-01, on main at 96bd18d
sources: review findings filed to the FSE on 2026-11-01 (bitácora, day log):
lf56-run-roles (sup96), lf54-usage-rejected and lf54-decision-states
(sup99), lf61-decision-states-ui (sup100); Aglaea's
`docs/ux/specs/decision-states.md` Amendment 1 (DS7, 26f96ce) and
`docs/ux/specs/review-view.md` Amendment 20 (R53 amended).

## Premises (read 2026-11-01 at 96bd18d)

| Premise | Shown by |
|---|---|
| `organizer runs` shows the attribution as the last usage pass left it, until `organizer usage` runs once (lodestar: 0% overhead and 40.6% no task before, 25.5% and 13.6% after) | sup96 closing report; `internal/service/run.go` `InitiativeRuns` |
| a ruling written by `organizer rule` names `owner operator` when pablo rules an operator-owned record | sup100 Found 2; `internal/service/rule.go:193` `rulingLines` |
| the record's rejected usage rows are in the post state but not in `organizer usage --json` nor the app's Usage view; a rejected row whose ledger row is gone stays in the state; `organizer doctor` prints a blank line before them | sup99 lf54-usage-rejected findings 1-3; `internal/service/usagepost.go:52-78` |
| `internal/service/tasks.go:110` compares `model.DecisionRuled` directly; no Go test guards status literals as `decisionStates.test.ts` does for the frontend | sup99 Found 5 |
| `decisionStates.test.ts`'s `stripComments` drops the code after a `//` inside a string | lf54-decision-states code review at 1df5001 |
| the header and the FSE panel count different sets (every rulable record; the lead's own), both right | Aglaea DS7, 26f96ce |
| after a live resize from 1440 to 1024 the header overlaps the sub-tabs | lf61 UI review UI3; R53 amended (Amendment 20) |

## Requirements

Card `lf62-go`:
- **FR-1** `organizer runs` and the app's runs view attribute each run when
  they read, as `organizer usage` does, so the two print the same shares
  whichever ran first.
- **FR-2** A ruling's line reads the owner through the person reader
  (`operator` is pablo) and drops it when the owner is the ruler.
- **FR-3** `organizer usage --json` carries the rejected rows (session,
  day, reason); a rejected row whose ledger row is gone leaves the post
  state at the next pass; `organizer doctor` prints no blank line before
  them.
- **FR-4** `tasks.go` reads a ruled record through the model's helper, and
  a Go test fails on a comparison of a decision status to a `model.Decision*`
  constant outside `internal/model` and that helper's callers' allowlist.

Card `lf62-ui` (after lf62-go):
- **FR-5 (DS7)** When the header's count and the lead's count differ, the
  chip reads both, in words and in its accessible name: `6 decisions waiting
  · 5 on you`; equal, unchanged.
- **FR-6 (R53)** The header's height follows a live resize while shown.
- **FR-7** The Usage view lists the rejected rows with their reason, from
  FR-3's JSON.
- **FR-8** `stripComments` keeps the code after a `//` inside a string.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| G1 | 1 | go test over a fixture ledger last written by an older attribution: `InitiativeRuns` before and after a usage pass | the same task per run both times |
| G2 | 2 | go test of `rulingLines`: owner operator, ruler pablo; owner alejandro, ruler pablo | no owner named; `owner alejandro` (unattended: "operator" is a field value in the fixture, no person is asked) |
| G3 | 3 | go test of the usage JSON and the post state over a fixture with two rejected rows, one gone from the ledger; the doctor output | one rejected row in the JSON with its reason; the gone one pruned; no blank line |
| G4 | 4 | go test: the literal guard over the Go packages | passes after the change; fails on a planted `d.Status == model.DecisionRuled` in a temp copy |
| U1 | 5 | vitest of the chip's text and name over a fixture where the counts are 6 and 5, and 5 and 5 | `6 decisions waiting · 5 on you`; `5 decisions waiting` |
| U2 | 6 | review build (in the worktree, never auth: firebase; launched by its own path, pid saved, AX of that pid, `screencapture -l`), init-a opened at 1440x900, the window resized to 1024x640 by the app's own API, not by input | the header's last row ends above the sub-tabs with the gap it has when opened at 1024 |
| U3 | 7 | vitest of the Usage view over FR-3's JSON | the rejected row listed with its reason |
| U4 | 8 | vitest: `stripComments` over `"a // b"; x === "proposed"` | the comparison is still seen |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree (lf62-ui), `git status --porcelain` | pass, empty |

## Boundary

- `lf62-go`: `internal/service/run.go`, `rule.go`, `usagepost.go`,
  `tasks.go` and their tests; `internal/usage/` (the read-time
  attribution) and its tests; `internal/cli/` (usage, doctor) and its
  tests; a new `internal/service/literals_test.go`.
- `lf62-ui`: `frontend/src/components/InitiativeHeader.tsx`,
  `frontend/src/lib/header.ts`, `frontend/src/styles/shell.css`,
  `frontend/src/components/Usage.tsx`, `UsageTable.tsx`,
  `frontend/src/lib/decisionStates.test.ts`, and their tests;
  `frontend/wailsjs` if FR-3 changes a bound type.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf62-go` | G1-G4, X0 | — | false |
| `lf62-ui` | U1-U4, X0 | lf62-go | true |

## Amendment 1 (FSE, 2026-11-02, on l62-ui's question; Aglaea decision-states Amendment 2, 7d3da41, DS-h)

FR-5 and U1, three cases: equal counts read `5 decisions waiting on you`
(unchanged from main, 0068 FR-2); unequal `6 decisions waiting · 5 on
you`; none on the lead `6 decisions waiting`. U1 checks all three.

## Amendment 2 (FSE, 2026-11-02, on l62-ui's U2)

U2's resize "by the app's own API": the frontend cannot read an
environment variable and the review build has no devtools, so the hook is
Go, in the pattern of `memfake.go` (`ORGANIZER_MEMORY_FAKE`):
`reviewresize.go` (and its test) in package main reads
`ORGANIZER_REVIEW_RESIZE=<w>x<h>@<seconds>` and calls
`runtime.WindowSetSize` once after the delay; unset, nothing runs. One
line in `app.go`'s startup starts it. The boundary of `lf62-ui` adds
`reviewresize.go`, `reviewresize_test.go` and that one line of `app.go`;
U2 adds a test that the hook does nothing when the variable is unset.
