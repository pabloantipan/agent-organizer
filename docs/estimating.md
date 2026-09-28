# How the FSE estimates effort and time

status: ruled (0049, 2026-09-28). Pablo: "Accepted. Just, place a clear
methodology of how FSE estimates".

Two kinds of time, never mixed:

- **A target** is a real date someone committed to. It is written only when
  it is real (the roadmapping skill), and it is drawn solid.
- **A forecast** is a range computed from what this initiative has actually
  taken. It is recomputed every time a card lands, and it is drawn dashed,
  never as a promise.

An appetite ("one wave") stays what it is: how much a stage is worth, not
how long it will take.

## The data

Every task leaves a run record: `runs/<date>-<task>.md`, and
`organizer runs <initiative> --json`. From each record the FSE reads:

| measure | what it is |
|---|---|
| card wall time | from the builder's start to the card's review pass |
| rework | how many times the card failed review before passing |
| wave wall time | from the supervisor's start to its last card in `done/` |
| lead minutes | the owner's own time on the task, when reported (`pablo_minutes`) |
| decision turnaround | raised to ruled, per record (`organizer decisions`) |

## The method

1. **Estimate only cut cards.** A card with `spec`, `gate` and `boundary` is
   a unit of work; anything less has no forecast. A stage with no cards cut
   says "no cards yet" and shows its appetite only.
2. **Build the reference set.** Use this initiative's card wall times,
   latest first. With fewer than five cards, borrow the factory's (all
   initiatives' run records) and say so.
3. **Count waves, not cards.** From the cards' `depends_on`, the critical
   path is the number of waves that must run one after another. Cards in
   the same wave run in parallel, so a wave takes as long as its slowest
   card.
4. **Forecast = critical-path waves × wave wall time, as a range.**
   - The low end uses the median wave wall time of the reference set.
   - The high end uses the 85th percentile.
   - The range becomes dates from today, counting only the hours when
     supervisors actually ran.
5. **Add the waits that are not build time.** For every open gate or
   `decide:` on the stage, add the median decision turnaround. Human waits,
   such as permissions or screenshots, go in as the median observed in the
   run records' notes, when there is one.
6. **Recompute on every landing.** Each card that lands shortens the path
   and adds a data point.
7. **Say the basis.** Every forecast carries one line: how many cards and
   records it rests on, and whether it borrowed the factory's.

## Where it shows

- **The accept record of each task** (the FSE writes it): "forecast: 2–4 h
  of wave time over 2 waves, plus one decision (median 0 d); basis: 14
  cards, this initiative".
- **The roadmap:** per stage, the forecast range next to its target and its
  appetite. This is the organizer's display card, cut after this method.
- **The run record, after landing:** forecast against actual. The error is
  what tunes the next forecast.

## What it is not

- **No per-card guesses.** The FSE writes no hours on a card. Measured
  throughput replaces opinion.
- **No invented dates.** A forecast is never written into `target`.
