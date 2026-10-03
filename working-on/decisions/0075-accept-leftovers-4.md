---
title: Accept the leftovers-4 batch and launch zoom-decisions-polish now, markdown-and-labels after
status: ruled
raised: 2026-10-03
raised_by: fse
owner: pablo
ruled: 2026-10-03
ruled_by: pablo
options: [accept as written, accept with amendments, send back]
chosen: accept as written
cards: [zoom-decisions-polish, markdown-and-labels]
threads: [01M41EBN13XE2GAPG9M7R2T5BW]
supersedes: []
superseded_by:
---

## Question

Aglaea ranked sup27's findings (`docs/ux/reviews/2026-10-03-rank-leftovers-4.md`,
94308ad): 16 rows, 5 gate rows, all severity 2 or 1, none needing your word on
design. She put the two factory-wide items into the design system: gate sizes
are window sizes and name the rail state; keyboard is checked in the real app
with macOS Keyboard navigation named. The build spec is
`docs/specs/leftovers-4.md`, two cards:

- **zoom-decisions-polish** (L1-L8), now, beside sup28: zoom focus kept with
  its ring in the real app; the Timeline axis sticks; an empty Ruled says
  "Nothing ruled yet."; a find opens the sections with hits and clearing
  restores your layout; a landing opens a section for the visit only; the
  Timeline count says how many it hides; label column, focus ring and
  scrollbar fixes; "no ruler recorded" in text and name.
- **markdown-and-labels** (L9-L11), after sup28 and the first card: a wide
  code block scrolls inside the record instead of widening the page;
  superseded records dimmed by colour, not opacity (their pills read
  ~1.5:1 today); no cut axis label; the rule box carries its own placement.

Rows 5, 6, 8 and 9 change Aglaea's decisions-view spec (§2, §6) as she
ranked them. Each UI reviewer clears the app's stored state afterwards, since
a reviewer's remembered sections were landing in your installed app.

**Q1, Aglaea's, separate from this record:** do you move around Deltagos
with Tab? With macOS Keyboard navigation off (it is on this machine), Tab
never reaches a button in the app. If you do, I add a spike card.

forecast: 40-75 min of wave time per wave over 2 waves (the first beside
sup28's, the second after both), plus this decision (median 0 d); basis: 8
single-wave UI tasks, this initiative (25, 34, 41, 45, 45, 46, 47, ~80 min).

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written.

## Ruling

pablo, 2026-10-03, in the FSE session on lodestar: "al recommendation accepted. Go on"

## Consequences

On acceptance: the FSE starts a supervisor for zoom-decisions-polish at once,
and one for markdown-and-labels when its three dependencies are in `done/`.
