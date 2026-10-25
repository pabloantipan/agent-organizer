# Leftovers 53: Deltagos's side of the factory contract map: the build spec

status: ruled (0163, pablo 2026-10-25)
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
| `contracts/working-on/` landed (20 files and `expected.json`, Hephaistos, 2026-10-25); `contracts/usage-batch.json` is hestia's, not yet written | `~/agent-slack/specs/contracts/working-on/expected.json`; `contracts/README.md` |

## Requirements

Card `lf53-frontmatter` (Go, F2), against `contracts/working-on/` (landed
2026-10-25; its `expected.json` → `accepted_reading` is the target, the rules
in `contracts/README.md`):

- **FR-1** Every field the skill writes as a list also reads one scalar as a
  one-item list, and an empty scalar as an empty list: on a card `repos`,
  `depends_on`, `boundary`, `footprint`, `threads`; on a decision `options`,
  `cards`, `threads`, `affects`, `supersedes`; on a stage `gates`.
- **FR-1a** `spec` and `gate` read as one reference or a list of several;
  the first is the one `organizer run` launches against. A card is never
  unread for either.
- **FR-2** The crossing statuses are valid in any `decisions/` folder:
  `awaiting-cells` is open (waits on a ruling, like `proposed`); `applied`
  and `acknowledged` are decided (like `ruled`, never waiting).
- **FR-2a** A `ruled_by` listed in `ruled_by_modes` (`operator away mode,
  recommendation taken`) names a mode, not a person: it is shown as written
  and is never counted as a ruler.
- **FR-3** Every ledger in `accepted_reading.ledgers` is skipped silently:
  `tickets.md`, `jira-map.md`, `jira-estimates.md`, `assumptions.md`,
  `jira-report-*.md`, and `jira-*.md` with no front-matter. No problem, no
  unread row.
- **FR-3a** A card under `working-on/done/` is done whatever its `status`
  says; any other status there is reported as a problem and the card is
  still read. A card status outside the four is kept as written, reported,
  and counted in no bucket (as today).
- **FR-4** The scan's tests read
  `${CONTRACTS_DIR:-~/agent-slack/specs/contracts}/working-on/` and compare
  the scan's reading with `expected.json` (cards, decisions, stages,
  current stage, specs, skipped silently, problems); a missing directory
  fails the test, never skips it.

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
| F1 | 1, 1a, 4 | go test of the scan over `contracts/working-on/` against `expected.json` | the reading equals `expected.json` field by field; `next-scalars.md` and `blocked-spec-list.md` read, none unread |
| F2 | 2, 2a | the same test on decisions 0005-0007 and 0006's `ruled_by` | no problem for the crossing statuses; `awaiting-cells` waits, `applied` and `acknowledged` do not; the away-mode `ruled_by` is not a ruler |
| F3 | 3, 3a | the same test on the ledgers and `done/stale-status.md` | the ledgers are skipped with no problem; `stale-status` reads as done with one problem; `dropped.md` keeps its status with one problem |
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

- `lf53-frontmatter`: `internal/model/` (the list fields' YAML, the spec
  and gate references, decision statuses), `internal/scan/`,
  `internal/service/run.go` (the first spec reference) and their tests;
  `frontend/wailsjs/go/models.ts` if a bound type changes, regenerated,
  and the frontend's reads of `spec` and decision status only if a type
  changed (`lib/queue.ts`, `lib/decisions.ts`).
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
| `lf53-frontmatter` | F1-F4, X0 | — (sample landed) | false |
| `lf53-usage-contract` | U1-U2, X0 | `contracts/usage-batch.json` (hestia) | false |
| `lf53-record-statusline` | R1, L1, X0 | — | false |
