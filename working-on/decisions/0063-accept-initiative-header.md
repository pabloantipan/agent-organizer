---
title: Accept the initiative header's design and build spec, and launch its two cards
status: ruled
raised: 2026-09-29
raised_by: fse
owner: pablo
ruled: 2026-09-29
ruled_by: pablo
options: [accept as written, accept with amendments, send back]
chosen: accept as written
cards: [header-fold, rule-box-finish]
threads: [01M3R14N3KAYTGQFH09AMBK73W]
supersedes: []
superseded_by:
stage: twenty-at-a-glance
---

## Question

Your header review (`working-on/header-review-2.md`): "I can't colapse the
goal and the scope. And gain, too much space", the chip that does nothing,
the unlabelled strip, the phase read as a status, the tiles that open
nothing. Aglaea designed the answer (`docs/ux/specs/initiative-header.md`).
The header is 378 px today, 59% of a 1024×640 window, which is also why
Answer lands on an 8 px timeline there.

- **Folds to one bar:** id, stage, waiting chip, target, the goal on one
  line, and Details. Folded by default, remembered per machine; every
  landing folds it.
- **The chip** opens Decisions on the first waiting record, and is gone at
  zero.
- **The strip** reads "Roadmap · building · stage 5 of 6"; the phase shows
  once, not on every tile.
- **A tile** opens that stage's detail in Roadmap.
- **The sub-views** stop repeating the initiative's id, and at 1024
  Conversations keeps half its height for the thread.
- **The rule box's leftovers**: focus stays inside it, the recommendation
  shows on short records, it names its initiative.

The build spec, `docs/specs/initiative-header.md`, has FR-1 to FR-9 and gate
rows G1 to G11. It has two cards in parallel, both with a UI reviewer, after
responsive-home. **It changes a ruled line:** redesign FR-17 ("the header
shows goal, measure, stages") becomes "the folded bar and Details" (FR-8).
0038's clamps and fixed header stand.

forecast: 45–70 min of wave time over 1 wave, after responsive-home, plus
this decision and 0064 (median 0 d); basis: 26 cards in 13 single-wave
tasks, this initiative, plus the UI reviewer (11–14 min on the path in three
waves). The high end is raised because header-fold is the largest card cut
so far: seven design sections and a new expanded stage row.

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written. The fold's default (folded) and its rule
(every landing folds it) are Aglaea's design calls you have not seen in
words.

## Ruling

pablo, 2026-09-29, in the organizer on lodestar: Go

## Consequences

On acceptance: when responsive-home lands, the FSE starts one supervisor for
both cards, with FR-9 as 0064 rules. header-review-2 closes when they land.
