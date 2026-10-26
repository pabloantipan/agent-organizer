# Leftovers 54: retire never picks a standing seat, CI reads the contracts, the record's rejected rows, and decision states read once: the build spec

status: ruled (0164, pablo 2026-10-26)
by: the FSE, 2026-10-25, on main at c3ded63
sources: sup94's closing report on leftovers 53 (finding 1: `organizer retire
organizer --retirable` planned to retire fse); Pablo's rulings relayed by
Hephaistos, agent-slack docs `decisions.md` "2026-10-25 — five rulings on
protection, contracts and records" (CI checks out
`pabloantipan/agent-mailbox-specs`, public, pinned, `CONTRACTS_DIR` at its
`contracts/`; no vendored copies); hestia's FSE via Hephaistos (record
d4703bb: `/v1/usage` answers 200 with `rejected`); lf53-frontmatter's and
lf53-usage-contract's review findings (FSE bitácora, 2026-10-25). Premises
read today.

## Premises (read 2026-10-25 at c3ded63)

| Premise | Shown by |
|---|---|
| `Retirable` returns every cell agent but the human, the reconciler and the busy; the organizer cell's only agent is `fse`, so `--retirable` plans to retire the FSE and kill its session | `internal/service/crew.go:683-713`; `agents/cell.json` (`agents: [fse]`); sup94 finding 1 |
| `release.yml` runs `make test` after one checkout; lf53's tests read `${CONTRACTS_DIR:-~/agent-slack/specs/contracts}` and fail when it is missing | `.github/workflows/release.yml:18, 34`; leftovers-53 FR-4, FR-5 |
| the specs repo is `pabloantipan/agent-mailbox-specs`, here at `~/agent-slack/specs` (d709699) | `git -C ~/agent-slack/specs remote -v` |
| the record answers `/v1/usage` 200 with `{upserted, unchanged, rejected: [{index, session_id, day, reason}]}` and lands the rest; `PostUsage` returns only an error, so a rejected row is either resent every pass or marked accepted, and never shown | `agent-mailbox-specs contracts/usage-batch.json` `response`; `internal/record/usage.go:49-55`; `internal/service/usagepost.go` |
| `usageRow` formats a zero `first`/`last` instead of null, which the sample allows | lf53-usage-contract review; map D-usage-3 |
| the app reads decision status as the literals `"proposed"`/`"ruled"` in eight places and the CLI and rule in two, so `awaiting-cells` never waits and `applied`/`acknowledged` never count as ruled; `rulerWords` names the away mode as a ruler | `frontend/src/lib/decisions.ts:7, 14`, `decisionsPage.ts:72, 88, 93`, `header.ts:41, 54`, `outline.ts:254-268`, `initiativeState.ts:42`, `queue.ts:155, 217`; `internal/cli/decisions.go:78`; lf53-frontmatter Found 1 |

## Requirements

Card `lf54-retire-guard` (Go):

- **FR-1** `Retirable` returns only seats that some card of the initiative
  (open or done) names in `seat:`, minus the human, the reconciler and the
  busy; a seat no card names (the FSE, a standing role) is never retirable,
  and `--seats` naming one is refused unless `--force`.

Card `lf54-ci-contracts` (CI), after lf53's PRs merge:

- **FR-2** `release.yml` checks out `pabloantipan/agent-mailbox-specs` at
  a pinned commit into a sibling path and exports `CONTRACTS_DIR` to its
  `contracts/` before `make test`. No vendored copy. The pin is one line
  a later card moves.

Card `lf54-usage-rejected` (Go), after lf53-usage-contract's PR merges:

- **FR-3** `PostUsage` returns the response (`upserted`, `unchanged`,
  `rejected`); `usagepost` marks only the landed rows accepted, keeps each
  rejected row with its reason in the post state, does not resend it until
  its content (hash) changes, and logs it once.
- **FR-4** `organizer usage` (and `doctor`) shows the rejected rows: count,
  and per row session, day and reason.
- **FR-5** A zero `first` or `last` is sent as null.

Card `lf54-decision-states` (Go and frontend), after lf53-frontmatter's PR merges:

- **FR-6** One helper per side says whether a decision is open
  (`proposed`, `awaiting-cells`), decided (`ruled`, `applied`,
  `acknowledged`) or closed (`superseded`, `withdrawn`): `model.Decision`'s
  in Go, one function in `frontend/src/lib/decisions.ts`. Every reader
  named in the premise uses it: Needs me and the header count open records
  owned by the lead; the Decisions timeline and turnaround count decided
  ones as ruled; `organizer decisions` buckets by it. Ruling stays
  `proposed` only (an `awaiting-cells` record is Themis's).
- **FR-7** `ruled_by` reads as a person plus an optional mode, per
  `agent-mailbox-specs` `contracts/working-on/expected.json`
  `accepted_reading.ruled_by_reading` (0eeddc3; Pablo's ruling 5 of
  2026-10-25: one form ahead, old variants read, never rewritten): `operator
  away mode, recommendation taken` and `pablo by away mode` read as pablo,
  mode away; `pablo (standing rule)` and `pablo by standing rule` as pablo,
  mode standing rule; any other value is a person with no mode.
  `internal/scan` carries both on the decision; the app names the person as
  the ruler and the mode beside it ("pablo, away mode"); median turnaround
  and every count by ruler use the person.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| G1 | 1 | go test of `Retirable` and `PlanRetire`: cell `[fse, b1, b2]`, a done card `seat: b1`, an open card `seat: b2` | `[b1]`; `--seats fse` refused without `--force` |
| G2 | 2 | a Go or shell test reading `release.yml`; then `CONTRACTS_DIR=<a checkout of the pin>/contracts make test` locally | the workflow checks out `pabloantipan/agent-mailbox-specs` at a full SHA and sets `CONTRACTS_DIR` before `make test`; the local run passes |
| G3 | 3 | go test against an httptest record answering 200 with one rejected row of three | two marked accepted, one kept with its reason, not resent on the next pass, resent once its content changes |
| G4 | 4, 5 | go test of `organizer usage`'s output and of `usageRow` with zero times | the rejected row's session, day and reason are listed; `first`/`last` are null |
| G5 | 6, 7 | go test of the scan and the CLI buckets over the sample, and vitest of the helper and each reader with `awaiting-cells`, `applied`, `acknowledged` and each `ruled_by` variant | `awaiting-cells` is a Needs me row and in the header's count; `applied`/`acknowledged` count as ruled; each variant reads as `expected.json` maps it (pablo plus its mode); a test fails if any file under `frontend/src/lib` compares a decision status to a literal outside the helper |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=~/agent-slack/specs/contracts make test`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf54-retire-guard`: `internal/service/crew.go` (`Retirable`),
  `internal/service/retire.go` and their tests.
- `lf54-ci-contracts`: `.github/workflows/release.yml` and the test that
  reads it.
- `lf54-usage-rejected`: `internal/record/usage.go`,
  `internal/service/usagepost.go`, `internal/cli` (the usage and doctor
  output) and their tests.
- `lf54-decision-states`: `internal/model/decision.go`, `internal/scan/`
  (the ruled_by reading), `internal/cli/decisions.go`, and the frontend files named in the premise
  and their tests.
- The four share no file. They merge through talos-lab PRs, and the last
  three wait for lf53's PRs to be on `origin/main`.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf54-retire-guard` | G1, X0 | — | false |
| `lf54-ci-contracts` | G2, X0 | lf53 PRs merged | false |
| `lf54-usage-rejected` | G3, G4, X0 | lf53-usage-contract merged | false |
| `lf54-decision-states` | G5, X0 | lf53-frontmatter merged | true |

## Amendment 1 (FSE, 2026-10-26): every retire path, and a plan that retires nothing

From l54-retire's review (findings 1-4). FR-1 covered `--retirable` and
`--seats`, not the default, so `organizer retire organizer` still plans
`retire seats: fse`, `kill sessions: organizer-probe-fse`, `revoke tokens:
fse`; and a plan that retires no seat still closes threads (3 with
`--retirable`, 45 with `--seats fse`) and commits `cell.json`. The card's
goal ("no retire plan ever ends the FSE or a standing seat") is the rule:

- **FR-1a** The default seat set (no `--seats`, `--keep` or `--retirable`)
  follows FR-1: only seats some card named, minus the human, the reconciler
  and the busy. `--keep` subtracts from that set.
- **FR-1b** A plan that retires no seat closes no thread, revokes nothing,
  kills nothing but an explicit `--kill` session, and writes and commits
  nothing; it says "nothing to retire".
- **FR-1c** The help of `--force`, `--retirable` and the default, the
  Retire dialog's words (`Retire.tsx`), and CLAUDE.md's "Retire and clean"
  paragraph say what FR-1 to FR-1b do.
- **FR-1d** Each doc comment in `retire.go` sits above its own function.

G1 adds: `organizer retire organizer` (dry) on a cell `[fse, b1]` with a
done card `seat: b1` plans `b1` only; a plan with no seat lists no threads,
no tokens, no cell.json write. The boundary adds `internal/cli/retire.go`,
`frontend/src/components/Retire.tsx` (words only) and CLAUDE.md's "Retire
and clean" paragraph.
