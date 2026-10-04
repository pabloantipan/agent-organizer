# Leftovers 8: layers-focus-and-words' findings: the build spec

status: proposed (0080)
by: the FSE, 2026-10-04, on main 7694455
design: Aglaea's ranking `docs/ux/reviews/2026-10-04-rank-leftovers-8.md`
(10bc67a), "row n", and the design system's Principles as amended there
(dates read as words wherever a person reads them, ISO only for a file's own
content; the lead's words are kept verbatim: autocorrect, autocapitalize and
spellcheck off on fields that take them).

## Problem

sup33's reviews and Aglaea's A1-A3 left seven severity 2 and 1 rows and
three gate and code rows; none needs a design call from Pablo. One card:
the rows share `DecisionsView.tsx`, `RuleDecisionBox.tsx` and the rule box's
CSS.

## Requirements, card `rule-words-and-dates`

- **FR-1** (row 1) A table in the rule box's body scrolls inside itself
  (`overflow-wrap: normal` on `.rb .rb-body table`) and carries the scroll
  edge; it never crushes or widens the box.
- **FR-2** (row 2, A1) While ruling, the record's facts line joins the stuck
  head; the box opens below it.
- **FR-3** (row 3) Every field that takes the lead's words (the rule box's
  words, the composer, card comments) has autocorrect, autocapitalize and
  spellcheck off; an Escape that closes a WebKit correction bubble does not
  also close the box.
- **FR-4** (row 4, A3) First measure Home's list at a 1512 window with the
  rail as a strip in WKWebView against Chromium and record the cause on the
  card; then the list fills to the content edge before any column is cut.
- **FR-5** (row 5) Dates read as words (`24 Sep`, the year only when not
  this year) in record meta, Timeline row names and Stages, through
  `lib/dates.ts` (`shortDate` or one helper beside it); ISO stays only where
  a file's own content is shown.
- **FR-6** (row 6, A2) The card back is capped at the window and scrolls its
  own body, with the edge.
- **FR-7** (row 7) `.tz-more` carries its own accessible name ("N more
  milestones on <date>").
- **FR-8** (S2) `make test` passes from a clean checkout: the test target
  builds `frontend/dist` first (or provides the embed's minimum) so `go vet`
  finds the `//go:embed all:frontend/dist` (`main.go:16`).

## Acceptance → gate

Rows name window or content, the rail state and the scrollbar kind; rows
over a fixture run from a clean checkout at the pinned SHA; a visual row is
hit-tested in both engines (S1); UI review in `make review-build`.

| # | FR | Check | Expected |
|---|---|---|---|
| Q1 | 1 | the fixture record with a ten-column table, Rule open, 1024×640 and 1512×945 windows | the table scrolls inside the box with its edge; the box keeps its width |
| Q2 | 2 | Decisions, a tall waiting record, Rule open, scroll 600 px | the facts line inside the stuck head, the box below it |
| Q3 | 3 | the built app: type `words` in the rule box, the composer, a comment; press Escape with a correction bubble showing | each keeps `words` as typed; the attributes in the DOM; the box stays open |
| Q4 | 4 | Home at a 1512×945 window, rail as a strip, classic scrollbars, both engines | the cause recorded on the card; the list reaches the content edge; no column cut while room remains (hit-test) |
| Q5 | 5 | record meta, a Timeline row name, a Stages date | words, not ISO; `lib/` tests for the helper |
| Q6 | 6, 7 | a card back longer than the window; the names log on a `+N` | the drawer capped, its body scrolls with the edge; `+N` named as FR-7 |
| Q7 | 8 | `git clone` to a temp dir, `make test` | pass |
| Q0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`; `cd frontend && npm run build`; `wails build` | pass |

## Boundary

`rule-box.css`, `RuleDecisionBox.tsx`, `DecisionsView.tsx`, `decisions.css`,
`Conversation.tsx` (the composer's attributes only), `CardDrawer.tsx` and its
CSS (cap, scroll, comments' attributes), `Home.tsx`, `home.css`,
`TimeZoom.tsx` (`.tz-more` name, Timeline names' dates), `StageRoadmap.tsx`
(dates only), `lib/dates.ts`, `lib/` tests, `testdata/fixture-overlay/`,
`Makefile` (the test target only). Not: Go, `docs/design-system.md`.

## Technical notes

- S3 (review drivers refuse points outside their window) goes to Hephaistos
  for the supervise skill's review templates.
- Spec check (spec-craft 5b): rows read against the amended Principles; no
  row asks for stored state; files found by grep (`main.go:16` embed;
  `shortDate` in `lib/dates.ts`; the test target at `Makefile:33`). Result:
  holds.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `rule-words-and-dates` | Q1–Q7, Q0 | — | true |
