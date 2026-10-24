# Leftovers 49: ruling a record that asks several questions: the build spec

status: proposed (0157)
by: the FSE, 2026-10-24, on main at c8f4b9a
sources: hestia's FSE via Hephaistos (organizer thread 01M5QGN5VKP3PFQ6R0P44A42DH;
hestia thread 01M5NF93GC99R4Q85PKNHG1F86), hestia records 0026, 0037, 0038;
the options convention (Pablo, 2026-10-06: a multi-question ruling is one
full-answer option). Every premise read today.

## Premises (read 2026-10-24 at c8f4b9a)

| Premise | Shown by |
|---|---|
| the rule box draws one radio per `options:` item and sends the picked item as `chosen` | `frontend/src/components/RuleDecisionBox.tsx:170-182, 144` |
| `RuleDecision` refuses a `chosen` that is not one item of `options`; the scan reports one as a problem | `internal/service/rule.go:44-45`; `internal/scan/decisions.go:98-99` |
| hestia writes a two-question record as one item per question, alternatives split by ` \| `: `["Q1 a \| b \| c", "Q2 x \| y \| z"]`; ruling it in Deltagos writes `chosen: "Q1 a \| b \| c"` and drops Q2 | `~/hestia-monorepo/working-on/decisions/0037-big-picture-stage.md:10`; hestia 0026, 0038 |
| hestia's hand fix `chosen: "Q1 after-graph-performs-start-now, Q2 record-page"` is not an item of `options`, so this scan reports it | 0037:11; `internal/scan/decisions.go:98` |

## Requirements

Card `lf49-rule-questions` (Go and frontend), built only under 0157's
option A:

- **FR-1** A record whose every `options:` item reads `Q<n> <alt> | <alt>
  ...` (`Q` and a number, a space, two or more alternatives split by
  ` | `) is a question record. Every other record is ruled as today.
- **FR-2** For a question record the rule box draws one radio group per
  question, legend `Q<n>`, one radio per alternative, and is ready only
  when every question has a pick and the words are not empty.
- **FR-3** The ruling writes `chosen: "Q1 <alt>, Q2 <alt>"` (the questions
  in order, `, ` between them). `RuleDecision` accepts exactly that
  shape for a question record, each alternative one of its question's, and
  refuses any other with the reason. A question record with one question
  also accepts a plain \`chosen: <alt>\` (one of its alternatives), so
  older single-question records read as they are (hestia's ask, crossing
  0019).
- **FR-4** The scan accepts that `chosen` on a question record, so
  hestia's hand-fixed 0026, 0037 and 0038 read without a problem, and still
  reports a `chosen` naming an alternative the question does not offer.
- **FR-5** The Decisions list shows the chosen line as written.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| Q1 | 1, 3 | go test of `RuleDecision` on a fixture copy of hestia 0037's frontmatter (two questions), chosen `Q1 after-graph-performs-start-now, Q2 record-page` | ruled; the file holds that `chosen`; every other byte unchanged |
| Q2 | 3 | go test: chosen `Q1 after-graph-performs-start-now` (Q2 missing); `Q1 nope, Q2 record-page`; a record with plain options and chosen one of them; a one-question record `["Q1 a \| b"]` with chosen `b`, and with `Q1 b` | each of the first two refused with its reason, nothing written; the third rules as today; both one-question forms accepted, the scan reports neither |
| Q3 | 4 | go test of the scan on the fixture ruled as in Q1, and with `Q2 nope` | no problem; one problem naming `Q2 nope` |
| Q4 | 2 | vitest of `RuleDecisionBox` with the fixture | two radio groups, `Q1` with 3 radios, `Q2` with 3; Rule disabled until both are picked and words typed; `ruleDecision` gets `Q1 …, Q2 …` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

The fixture record lives in `testdata/` (a copy of hestia 0037's
frontmatter and a short body, `## Recommendation` naming Q1 and Q2).

## Boundary

`internal/service/rule.go` and its test, `internal/scan/decisions.go` and
its test, `frontend/src/components/RuleDecisionBox.tsx` and its test, a
helper in `frontend/src/lib/decisions.ts` and its test, the fixture under
`testdata/`.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf49-rule-questions` | Q1-Q4, X0 | 0157 option A | true |
