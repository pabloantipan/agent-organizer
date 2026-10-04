# Leftovers 9: rule-words-and-dates' findings: the build spec

status: proposed (0081)
by: the FSE, 2026-10-04, on main
design: Aglaea's calls on sup35's UI review (d06e265, thread
01M442JRXZG13XA7C1BQ7XJ54Q), both severity 2; none needs Pablo.

## Problem

- **D1:** an Escape that closes a box where the lead was writing loses what
  he wrote, except in Home's rule box, which keeps one draft per record
  (`lib/drafts.ts`, responsive-home FR-9). A ruling half-written on
  Decisions, a card comment, or a message in the composer is lost.
- **U1:** at a 1512 window with the rail as a strip, Home's fixed columns
  keep slack while a cell is cut (the next date reads `due · …`); `shareRoom`
  (`lib/width.ts`) does not give fixed columns' spare room to cut cells.

## Requirements, card `drafts-and-slack`

- **FR-1** (D1) Escape keeps the draft, per record or per thread, in the rule
  box on Home and Decisions, a card's comment field and the conversation
  composer; it returns when that box reopens; while a draft is kept the verb
  reads `Rule · draft` (the composer's and comment's own verb likewise, `·
  draft`); only Cancel, or posting, discards it. One draft store
  (`lib/drafts.ts`, extended), kept for the session, never written to disk or
  synced.
- **FR-2** (U1) Fixed columns give their slack to cut cells before any cell
  is cut (`shareRoom`).

- **FR-3** (sup35's U3/S1, sev 1; the design system's Principles, dates in
  words; added before 0081's ruling) The header's target and the card back's
  `updated` read as words (`16 Sep`, the year only when not this year).
- **FR-4** (U4, U5/S2, sev 1; Focus and names) A Stages row's accessible name
  includes its dates; the card comment field and the composer's fields have
  names ("Comment on <card>", "Message to <seat>", "Subject").

## Acceptance → gate

Rows name window or content, the rail state and the scrollbar kind; UI review
in `make review-build`, pinned; visual rows hit-tested in both engines.

| # | FR | Check | Expected |
|---|---|---|---|
| S1 | 1 | in each of the four places: type words, Escape, open something else, reopen; then Cancel and reopen | the words return and the verb reads `· draft`; after Cancel the box is empty |
| S2 | 1 | `npm test` over `lib/drafts.ts` | keep, restore and discard per key, for record and thread keys |
| S3 | 2 | Home at a 1512×945 window, rail as a strip, classic and overlay scrollbars, both engines | the next date whole; a `lib/` test that `shareRoom` gives fixed slack to cut cells first |
| S4 | 3, 4 | the header with a target; a card back; the names log over a Stages row, the comment field and the composer | words, not ISO; the names as FR-4 |
| S0 | all | `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build` | pass |

## Boundary

`lib/drafts.ts` and its test, `lib/width.ts` and its test,
`RuleDecisionBox.tsx`, `DecisionsView.tsx` (its rule box's draft only),
`Home.tsx`, `CardDrawer.tsx` (the comment field's draft), `Conversation.tsx`
(the composer's draft and field names), `InitiativeHeader.tsx` (the target's
date), `StageRoadmap.tsx` (the row's name). Not: Go, the stores beyond the draft's session
state, `docs/design-system.md`.

## Technical notes

- Spec check (spec-craft 5b): FR-1 stores the draft for the session only,
  in memory, as responsive-home FR-9 already does; no row asks for disk or
  sync. Files by grep: `lib/drafts.ts`, `shareRoom` in `lib/width.ts`.
  Result: holds.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `drafts-and-slack` | S1–S4, S0 | — | true |
