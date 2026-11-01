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

## Amendment 1 (2026-11-01, the FSE, on sup97's question at a62e887)

`atlax verify` checks every `consumes:` line, authored or not, against the
published folders, and today only `agent-mailbox-api` is published, so a
`consumes:` naming the record (or a planned name) is a blocking ext-break
and S4 cannot hold (atlax.py:731-746, l59-atlax's run).

FR-2 now reads: `consumes:` lines only for elements of an artifact already
published in the atlax repo (today `ext:agent-mailbox-api#…`). An element
that reads an unpublished provider (the record's four calls, the
working-on and factory-report readers) keeps its file and names its
provider in `summary`, with no `consumes:`; the line is added by a later
card's change order once that provider publishes. S4 stays: exit 0, no
finding.

## Amendment 2 (2026-11-01, the FSE, on l59-atlax-rev's Note 1 at 1091b60)

0171 accepted one element per call Deltagos makes to the mailbox; FR-2
named only the thread list and health. `internal/discuss/client.go` makes
five more, all published in `agent-mailbox-api`: thread get (:139),
messages post (:146), thread status (:152), search (:180), drain (:224).
Card `lf59-atlax-calls` adds one unauthored element per call with its
`consumes:` (`fn:mailbox.thread.get`, `messages.post`,
`thread.status.set`, `search`, `drain`), on top of `lf59-atlax-seed`.
Gate rows S1, S2 (over the five), S4 and X0; boundary `atlax/` only.

## Amendment 3 (2026-11-01, the FSE): the record's consumes, and the first authored readers

`agent-mailbox-record` is published in atlax (fd888e3, 50 elements), and
the contract tests of lf53-usage-contract (#6) and lf53-frontmatter (#7)
are on origin/main. Card `lf59-atlax-record`, within 0171 (one element per
call, each with `consumes:`; authored where the contract sample and test
exist):

- **FR-5** The record's four calls gain their `consumes:`:
  `prod:agent-organizer.record.PostUsage` →
  `ext:agent-mailbox-record#fn:record.usage.post`; `IssueKey` →
  `fn:record.factories.keys.issue`; `RevokeKey` →
  `fn:record.factories.keys.revoke`; `RegisterCell` →
  `fn:record.factories.cells.post`; their summaries drop "unpublished".
- **FR-6** Each reader whose contract sample and named test are now on the
  base becomes `authored: true` through the card's `change_order`
  (`modifies`), naming its sample and test: the usage post
  (`contracts/usage-batch.json`) and the working-on reader
  (`contracts/working-on/`), if `atlax verify` finds their tests passing.
  The factory-report reader stays unauthored until lf57-report-go lands.

Gate rows S1, S2 (the changed files), S4 and X0; plus **S5**: `atlax
verify --card working-on/lf59-atlax-record.md` passes the book guard with
the card's `touches:` and `change_order:`. After the merge, the FSE checks
`atlax check` reports no ext-break for agent-organizer.
For `lf59-atlax-record` and every later card that authors or modifies an
element, S4 runs `atlax verify --repo . --card <the card>`: bare, the book
guard has no change order and flags exactly the elements the card lists,
which is the guard working (l59-record's note at c7cb263).

## Amendment 4 (2026-11-01, the FSE): the Wails and CLI elements

Hephaistos's extractor is merged (claudecode 3d7aea5, specs 230a515):
`atlax derive` on this repo finds 78 `wails` elements (each exported method
bound in `wails.Run`'s `Bind:`) and 26 `cli` elements (each `organizer`
subcommand). The seed's FR-4 waited for it. Card `lf59-atlax-surface`,
within 0171 and Pablo's goal for the window (the factory model built,
relayed by Hephaistos 2026-11-01):

- **FR-7** One element file per derived `wails` and `cli` element, named
  as `atlax derive` designates it (`fn:organizer.App.<Method>`,
  `fn:organizer.cli.<command>`), in the shape of
  `contracts/atlax/element-wails.sample.yaml` and its CLI sample (specs
  230a515), each with a one-line summary of what the person or seat gets
  from it, `owner: organizer-fse`, `authored: false`.
- **FR-8** An element whose behaviour has a contract sample in
  agent-mailbox-specs and a test that reads it on the base becomes
  `authored: true` through the card's `change_order` (`adds`), naming both;
  the card lists which ones and why each other one stays unauthored. No
  test is written to qualify an element.
- **FR-9** A `wails` or `cli` element that reads another published
  artifact names it in `consumes:` (only published providers, Amendment 1).

Gate: S1, S2 (every derived element has exactly one file, none extra:
`atlax derive --json` against `atlax/elements/`), S4 and S5 with `--card`,
and X0, with the atlax tool at claudecode 3d7aea5 or later and
CONTRACTS_DIR at specs 230a515 or later.

## Amendment 5 (2026-11-01, the FSE): author the report readers, change order first

`atlax verify` freezes a card's change order when the card first goes
`now`; lf59-atlax-surface went with `adds: []` (my Pre-answered said the
builder fills it), so FR-8 authored none. Its builder found three that
qualify: `fn:organizer.App.Report` (`contracts/factory-report/expected.json`,
`TestReportDecodesContract`) and `App.ReportWindows`
(`expected-windows.json`, `TestReportWindows`), both in
`internal/service/report_test.go`, plus `prod:agent-organizer.service.Report`
(planned, its test on main since lf57-report-go). `App.ReportText` stays
unauthored: its test needs the real `factory` installed. Card
`lf59-atlax-authored` lists them in `touches:` and `change_order` before
it goes now, and flips them (`authored: true`, `lifecycle: live`), with
gate rows S2 (the changed files), S4 and S5 with `--card`, and X0.
