---
title: Records that ask several questions - Deltagos rules each question, or every record lists full answers
status: ruled
raised: 2026-10-24
raised_by: fse
owner: pablo
options: ["A: Deltagos rules each question", "B: keep one full-answer option per record"]
cards: [lf49-rule-questions]
forecast: 30-60m
stage: review-map
affects: [hestia]
crossing: 0019
supersedes: []
superseded_by:
ruled: 2026-10-24
ruled_by: pablo
chosen: "A: Deltagos rules each question"
---

## Question

Hestia writes a record that asks two questions as one option per question,
the alternatives split by ` | ` (0026, 0037, 0038:
`["Q1 a | b | c", "Q2 x | y | z"]`). Deltagos offers one radio per option,
so ruling it writes `chosen: "Q1 a | b | c"` and drops Q2; hestia's FSE
fixed all three by hand, and the hand fix is itself a scan problem here
(chosen is not one of the options). Your convention of 2026-10-06 says a
multi-question ruling is one quoted option holding the full answer, so
hestia's records break it. Which way?

## Options

- **A: Deltagos rules each question.** An option list where every item
  reads `Q<n> <alt> | <alt> ...` is a question record: the rule box draws
  one radio group per question and writes `chosen: "Q1 <alt>, Q2 <alt>"`;
  rule and scan accept that shape. One card (`lf49-rule-questions`,
  `docs/specs/leftovers-49.md`), forecast 30-60m, UI review. Records with
  plain options rule as today. The working-on skill gains the format
  (Hephaistos's, `[for hephaistos]`).
- **B: keep the convention.** Hestia's FSE writes a multi-question record
  as full-answer options (`"Q1 start-now, Q2 record-page"`, one per
  combination it offers). No code; the three hestia records stay as hand
  fixed and keep showing a problem here until rewritten. Combinations grow
  as questions multiply (3 x 3 = 9 options for 0037).

## Recommendation

A. Two-question records already happen on another cell, and "as
recommended" is how you rule most of them; with A one pick per question in
the box does it, with B the FSE must foresee every combination. A also
makes hestia's hand fixes valid without rewriting them. The 2026-10-06
reason (nothing new to install on the other laptop) holds less now that
Deltagos installs from main on both.

`affects: [hestia]`: under A hestia's existing records read as they are;
under B hestia's FSE rewrites how it writes them. This goes to Themis
before it is ruled.

## Forecast

forecast: 30-60m over 1 wave, plus the UI review and no lease data;
basis: 3 tasks, this initiative (leftovers 45-47: 14, 23 and 83 min, the
last on one review round and the test-lease queue).

## Ruling

pablo, 2026-10-24, in the organizer on lodestar: as recommended
