---
title: Accept amendment 1 of discovery-in-a-cell, and launch its two cards
status: ruled
raised: 2026-09-29
raised_by: fse
owner: pablo
ruled: 2026-09-29
ruled_by: pablo
options: [accept as written, accept with amendments, send back]
chosen: accept as written
cards: [cell-draft, cell-definition-finish]
threads: []
supersedes: []
superseded_by:
stage: discovery-in-a-cell
---

## Question

Is amendment 1 of `docs/specs/discovery-in-a-cell.md` the rest of stage 5's
build? It writes FR-3 from your ruling in 0047 ("a drafting session") and
the persona-agents skill's `references/drafting.md`, and folds in sup15's
closing points. Two cards, one after the other:

- **cell-draft** (FR-3, G4): "Draft the cell" on an initiative with no
  cell, and `organizer draft-cell`. It opens a Claude session at the root
  told to follow the skill's drafting procedure. The organizer reads
  `draft: true` in `cell.json`, shows the cell as in definition waiting on
  its accept record, and refuses to launch a draft. It refuses to draft
  without a goal or `people.md`.
- **cell-definition-finish** (FR-1 rail, FR-5, FR-6, G6): the rail marks a
  cell in definition; a cell in definition never offers "N retirable";
  Bring crew up is disabled and says why when a seat has no persona file
  or the cell is a draft.

forecast: 40–65 min of wave time over 2 waves, plus two decisions (this one
and 0051, median 0 d); basis: 21 cards in 9 single-wave tasks, this
initiative (runs/2026-09-26 to 09-28; sup3 and sup11 left out, their clocks
hold waits on permissions and on a `decide:`).

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written. Two things you have not ruled and the
amendment chooses: (1) acceptance stays the record's ruling, with no accept
button in the app (drafting.md §5 already says the session edits
`cell.json`); (2) sup15's point 5, a unit test for Overview's gate logic, is
left out because the frontend has no test runner.

## Ruling

pablo, 2026-09-29, in the organizer on lodestar: Accepted

## Consequences

On acceptance: the FSE starts one supervisor for the two cards, in order,
and the stage's exit (a) is met when both pass review and a draft has been
shown on a real initiative.
