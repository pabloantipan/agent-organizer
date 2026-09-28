---
title: A method to estimate effort and time ahead, next to real dates
status: ruled
raised: 2026-09-28
raised_by: fse
owner: pablo
ruled: 2026-09-28
ruled_by: pablo
options: [forecast from run records, appetite only, estimate per card by the FSE]
chosen: forecast from run records
cards: []
threads: []
supersedes: []
superseded_by:
stage:
---

## Question

Pablo, 2026-09-28: "can we formulate a metodology for estimating efort and
time ahead? So roadmap and time can have a sense defined time (if exists)
vs estimated along the initiative?" Today a stage carries an appetite and,
only when real, a target. The roadmapping skill forbids invented dates.

What exists to estimate from:
- **Run records.** Every task since 2026-09-26 has one (`runs/`,
  `organizer runs`): wall time, tokens and cost per card and per wave. The
  lead's minutes are asked for, but not reported yet.
- **Card counts per stage.**

## Options

- **forecast from run records**: throughput is measured, not guessed.
  - The organizer shows, per stage, a *forecast* range: remaining cards
    times this initiative's measured wall time per card (median and 85th
    percentile), and the date it implies.
  - A forecast is drawn differently from a *target* (a real committed
    date), and recomputes as cards land.
  - The method goes into the roadmapping skill (Hephaistos), and the
    display into the organizer (a card).
  - Honest, and improves with data; weak for stages whose cards are not cut
    yet (it shows "no cards yet").
- **appetite only**: as today, a size and no dates. No new work; the lead
  keeps estimating in his head.
- **estimate per card by the FSE**: the FSE writes an `estimate` (hours or
  sessions) on each card it cuts, and the roadmap sums them. Quick, but the
  numbers are guesses, and the skill warns against invented numbers.

## Recommendation

The FSE's: forecast from run records. It answers "estimated along the
initiative" with measured data, keeps real dates separate, and gets better
every wave. The first stages can start with the redesign's and stage 2–3's
records, which exist.

## Ruling

Pablo, 2026-09-28, in the FSE's session (organizer-probe-fse): "0049.
Accepted. Just, place a clear methodology of how FSE estimates". The method
is `docs/estimating.md`.

## Consequences

On "forecast":
- Hephaistos writes the method into the roadmapping skill (cross-initiative).
- The FSE specs the organizer's forecast display (a spec amendment) and cuts
  the card.
