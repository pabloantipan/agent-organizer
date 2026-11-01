# Leftovers 59: Deltagos's atlax slice, seeded by hand: the build spec

status: proposed (0171)
by: the FSE, 2026-11-01, on main at 46f3b55
sources: Pablo, 2026-11-01, relayed by Hephaistos in thread
01M6BZ9CJH5X531M6DTYNJYFFG ("message the FSEs to seed their slices");
agent-slack `docs/atlas/implementation.md` step 3 (seed the four slices;
authored only where a contract sample and a test exist); agent-slack card
`working-on/done/atlax-mailbox-seed.md` (the template); agent-mailbox-specs
`contracts/atlax/` (plant, element and consumer samples, schemas).

## Premises (read 2026-11-01)

| Premise | Shown by |
|---|---|
| the artifact id is the repo slug, `agent-organizer` | `git remote get-url origin`: pabloantipan/agent-organizer |
| atlax derives only Go mux routes; Deltagos's interfaces are Wails-bound methods and the CLI, with no extractor yet (Hephaistos is building one) | `atlax --help`; thread 01M6BZ9CJH5X531M6DTYNJYFFG |
| on origin/main 21b5d5d no Go test reads CONTRACTS_DIR; the contract tests are on unmerged branches (lf53-frontmatter: working-on reader, lf53-usage-contract: usage post) and lf57-report-go (factory report) is unbuilt | `git grep CONTRACTS_DIR origin/main -- '*.go'` |
| the consumer sample is Deltagos's read of the thread list, `prod:agent-organizer.discuss.ThreadsByStatus` consuming `ext:agent-mailbox-api#fn:mailbox.threads.list` | `contracts/atlax/element-consumer.sample.yaml` |
| Deltagos posts to the record: `/v1/factories/keys`, `/v1/factories/{f}/keys/revoke`, `/v1/factories/{f}/cells`, `/v1/usage` | `internal/record/record.go:73-96`, `internal/record/usage.go:53` |

## Requirements

Card `lf59-atlax-seed`:

- **FR-1** `atlax/plant.yaml`: artifact `agent-organizer`, owner
  `organizer-fse`, norm `"0.1"` quoted, purpose in one line, repo
  `github.com/pabloantipan/agent-organizer`, c4_system `deltagos`.
- **FR-2** One element file per reader that has a contract sample (the
  working-on reader, the factory-report reader, the usage post) and one per
  outbound call to another artifact (the mailbox's thread list and health,
  the record's four calls), each with `consumes:` naming what it reads
  (`ext:agent-mailbox-api#fn:mailbox.threads.list`, the record's elements
  as that artifact names them, or a planned name it says is unpublished).
- **FR-3** `authored: true` only for an element whose contract sample and
  named test are both on the branch's base (origin/main when it branches);
  every other element `authored: false`, so day one raises no redline. A
  reader whose test lands later (lf53-frontmatter, lf53-usage-contract,
  lf57-report-go) is flipped by a later card's `change_order`.
- **FR-4** No Wails method or CLI subcommand gets an element by hand
  beyond FR-2: those wait for Hephaistos's extractor.

## Acceptance → gate

| # | FR | Check | Expected |
|---|---|---|---|
| S1 | 1 | `atlax/plant.yaml` against `contracts/atlax/plant.schema.json` | valid |
| S2 | 2 | every file in `atlax/elements/` against `element.schema.json`; the list of files against FR-2's readers and calls | valid; none missing, none extra |
| S3 | 3 | for each `authored: true` element, its contract sample and test exist at the base sha; the count of authored elements | named; 0 if no contract test is on the base |
| S4 | 2, 3 | `atlax verify --repo .` on the branch | exit 0, no finding |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, then `git status --porcelain` | pass, empty |

After the merge (not a gate row; the FSE checks it): atlax-watch publishes
`artifacts/agent-organizer/` and `atlax check` reports no ext-break for it.

## Boundary

`atlax/` at the repo root only. No code, test or fixture changes.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf59-atlax-seed` | S1-S4, X0 | — | false |
