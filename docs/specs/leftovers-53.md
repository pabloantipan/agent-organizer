# Leftovers 53: Deltagos's side of the factory contract map: the build spec

status: proposed (0163)
by: the FSE, 2026-10-25, on main at 34afa7d
sources: Hephaistos's relay of Pablo's ruling (agent-slack docs
`decisions.md` bfcefd1, 2026-10-25: "ok. Do. And let's solve all of these.
Ahead we'll go with installers, no repos for avoiding this kind of stuff"):
every contract between two repos gets one sample under
`~/agent-slack/specs/contracts/`, and the writer's and the reader's tests
both read it. The map: `~/agent-slack/docs/contracts/factory-contract-map.md`
(5bd1fa2), sections F2, H2, H3, L1. The map's "O" is this code; every
premise was re-read on lodestar today.

## Premises (read 2026-10-25 at 34afa7d)

| Premise | Shown by |
|---|---|
| card fields are strict types: `Boundary []string`, `Threads []string`, `Spec` a string; 18 cards on odyssey write `boundary: "<prose>"` and yaml.v3 fails the whole front-matter (`cannot unmarshal !!str into []string`); `spec: [a,b]` fails the other way | `internal/model/model.go:260-280`; map F2 drift 1 |
| a decision status outside the four values is reported; crossing records carry `awaiting-cells`, `applied`, `acknowledged` | `internal/model/decision.go:21-25`; map F2 drift 5 |
| `assumptions.md` is not a ledger here | `internal/scan/scan.go:391-414` (`isLedger`, `ledgerNames`); map F2 drift 2 |
| the usage post test checks key names only (`contractKeys`, hand-copied) against a fake that accepts any value, and sends only `cost_from` record and null | `internal/service/usagepost_test.go:150, 173`; map H3 |
| the first refused batch ends the pass, so one bad row blocks every later row | `internal/service/usagepost.go:141-147`; map D-usage-2 |
| `RegisterCell` reads a 409 as registered, but the record upserts and never answers 409 | `internal/record/record.go:92-102`; map H2 |
| the statusline test parses a hand-written sample; only `session_id` is required, so a renamed upstream field becomes a silent zero | `internal/session/session_test.go:8-11`, `session.go:70-99`; map L1 |
| the shared samples do not exist yet: `contracts/working-on/` is Hephaistos's, `contracts/usage-batch.json` hestia's | `ls ~/agent-slack/specs/contracts/` (only the map, 2026-10-25) |

## Requirements

Card `lf53-frontmatter` (Go, F2), once `contracts/working-on/` lands:

- **FR-1** `boundary`, `threads` and `spec` read as a scalar or a list,
  as the record reads them: a scalar is one item; `spec` written as a list
  joins into the one place it names, or keeps its first item, whichever the
  sample's README states. A card is never unread for this.
- **FR-2** The crossing statuses `awaiting-cells`, `applied` and
  `acknowledged` read as statuses of a crossing record, not as unknown,
  and none of them counts as waiting on a ruling in this initiative.
- **FR-3** `assumptions.md` is a ledger.
- **FR-4** The scan's tests read every file under
  `${CONTRACTS_DIR:-~/agent-slack/specs/contracts}/working-on/` and agree
  with the sample's expected readings; a missing directory fails the test,
  never skips it.

Card `lf53-usage-contract` (Go, H3), once `contracts/usage-batch.json` lands:

- **FR-5** `usagepost_test.go` builds a row through `usageRow` for every
  `CostSource` path the ledger can produce (record, transcript, priced,
  reset and priced, null) and checks each against `usage-batch.json`'s key
  set and enum; `contractKeys` goes. Every path that the sample accepts is
  posted, `priced` included; a path it refuses is mapped as the sample says.
- **FR-6** (D-usage-2) A refused batch does not end the pass: the rows of
  the later batches are still posted, the refused batch's rows stay unsent
  and are retried on the next pass, and the state and the log name each
  refusal.

Card `lf53-record-statusline` (Go, H2, L1):

- **FR-7** (H2) `RegisterCell` keeps no 409 branch: a 2xx is registered,
  any other answer is an error, and its comment says the record upserts.
- **FR-8** (L1) `organizer statusline` writes its stdin to
  `$ORGANIZER_STATUSLINE_CAPTURE` when set, nothing otherwise. A payload
  captured that way from a live seat (session id, paths and costs replaced
  by fixed stand-ins, every key kept) is the session test's fixture, and the
  test fails when a field `session.go` reads is missing from it.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| F1 | 1, 4 | go test of the scan over `contracts/working-on/` | every card reads; a scalar `boundary` is one item; a list `spec` reads as the README says; none is unread |
| F2 | 2 | the same test on the sample's crossing records | no problem for `awaiting-cells`, `applied`, `acknowledged`; none in Needs me |
| F3 | 3 | go test of `isLedger` | `assumptions.md` is a ledger |
| F4 | 4 | the test with `CONTRACTS_DIR` pointing at an empty dir | fails, naming the missing sample |
| U1 | 5 | go test of every CostSource path against `usage-batch.json` | each row's keys equal the sample's; each `cost_from` is in its enum; `contractKeys` is gone from the source |
| U2 | 6 | go test: three batches, the second refused | the first and third are accepted; the second's rows stay unsent; the state and log name the refusal |
| R1 | 7 | go test of `RegisterCell` against 201, 409, 500 | nil, error, error; no 409 branch in the source |
| L1 | 8 | go test of `Parse` on the captured fixture, and with one read field removed | the record has every field; the test fails naming the field |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `wails build`, then `git status --porcelain` | pass, empty |

The capture for FR-8 is taken by the supervisor from its own live session
(its prelude exports `ORGANIZER_STATUSLINE_CAPTURE` for one turn); no gate
row starts a claude seat.

## Boundary

- `lf53-frontmatter`: `internal/model/model.go` (the three fields and
  their YAML), `internal/model/decision.go`, `internal/scan/` and their
  tests.
- `lf53-usage-contract`: `internal/service/usagepost.go` and its test,
  `internal/record/usage.go` and its test.
- `lf53-record-statusline`: `internal/record/record.go` and its test,
  `internal/cli/crew.go` (the statusline command), `internal/session/`
  and its test, the fixture under `internal/session/testdata/`.
- The three share no file; one wave, each card launched once its sample
  exists.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf53-frontmatter` | F1-F4, X0 | `contracts/working-on/` (Hephaistos) | false |
| `lf53-usage-contract` | U1-U2, X0 | `contracts/usage-batch.json` (hestia) | false |
| `lf53-record-statusline` | R1, L1, X0 | — | false |
