---
title: Accept the time-zoom spec and launch its card after header-fold-2
status: ruled
raised: 2026-10-03
raised_by: fse
owner: pablo
ruled: 2026-10-03
ruled_by: pablo
options: [accept as written, accept with amendments, send back]
chosen: accept as written
cards: [time-zoom]
threads: [01M416RZH3E5VPJC9D5H8PK73F]
supersedes: []
superseded_by:
---

## Question

Aglaea's design `docs/ux/specs/roadmap-time-zoom.md` (6569427), with the
FSE's Technical notes T1-T5 and your ruling 0070: one zoom on Roadmap Cards,
Roadmap Stages and the Decisions Timeline. Fit (as today) -> Days (40 px a
day) -> Hours (64 px an hour, quarter-hour grid), Hours only where a mark has
a time, which after the scan reads commit times is Cards with a git branch.
Control per graph `[-] level [+] Today Fit`; pinch, cmd+wheel, keys,
double-click on the axis; plain wheel never zooms. A day-only date fills its
whole day. The level is per graph and not remembered. Calendar and Portfolio
untouched. One card, `time-zoom`, gate A1-A14 plus T1-T2, with a UI reviewer,
after header-fold-2 (shared files).

forecast: 45-90 min of wave time over 1 wave (one card, UI reviewer
included), after header-fold-2's wave, plus this decision (median 0 d);
basis: 5 single-wave UI tasks, this initiative (25, 34, 41, 47, ~80 min),
high end raised because this card spans three graphs and a Go change.

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written.

## Ruling

pablo, 2026-10-03, in the organizer on lodestar: Ok

## Consequences

On acceptance: the FSE starts one supervisor for `time-zoom` once
header-fold-2 is in `done/`.
