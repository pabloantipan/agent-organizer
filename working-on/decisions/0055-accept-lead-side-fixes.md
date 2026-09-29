---
title: Accept the lead-side-fixes spec, and launch its two cards
status: proposed
raised: 2026-09-29
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [accept as written, accept with amendments, send back]
chosen:
cards: [home-rule-and-rows, cell-screens-fix]
threads: [01M3PVQZ7JS5F40030Z09M2NMS, 01M3PVTCBV0NSN9XZ8MBAFV5A7]
supersedes: []
superseded_by:
stage: discovery-in-a-cell
---

## Question

Is `docs/specs/lead-side-fixes.md` (proposed) the fix for Aglaea's first two
reviews? It carries her severity 3 and 2 findings, which are heuristic
(nobody was watched):

- **Rule with the record in view** (F2, C6): the Needs me Rule box shows the
  record's body (question, options, recommendation; a roster's seats) above
  the options.
- **Names at the smallest window** (F1): every Home row keeps its id at
  1024×640.
- **No dead ends** (C1–C5): the Launch row names a missing persona file with
  Open; Bring crew up shows its reason as text; Draft the cell cannot be
  pressed twice and has named checking, opened and error states; the roster
  link lands on the record expanded.
- **Smaller**: the Needs me subtitle, disabled tiny buttons at the design
  system's 45%, and sup16's two open points.

Two cards in parallel, both with a UI reviewer (`ui_review: true`, the first
wave that has one).

forecast: 20–36 min of wave time over 1 wave, plus this decision (median
0 d); basis: 24 cards in 11 single-wave tasks, this initiative. Not in the
basis: the UI reviewer's time, which has no run record yet.

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written. It makes three choices you have not ruled:
(1) no Go-side refusal of a second draft, the view guards it until
`cell.json` appears or the app reloads; (2) F3 is left out and raised as
0056; (3) F4–F6, F8, F9, C9 and C10 are not carried (F9 and the general
disabled pattern wait on 0054).

## Ruling



## Consequences

On acceptance: the FSE starts one supervisor for the two cards, with a UI
reviewer per card, and amends discovery-in-a-cell FR-6 to point at FR-4 here.
