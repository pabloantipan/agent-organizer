---
title: Accept leftovers 57 - the run report on Overview, with its waves, and the Home signal
status: proposed
raised: 2026-10-28
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf57-report-go, lf57-run-report, lf57-home-signal]
forecast: 180-300m
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

You said "excecute please" on 2026-10-28 in my session, and 0167 and 0168
are ruled. Leftovers 57 (`docs/specs/leftovers-57.md`) builds Aglaea's run
report (run-report §3 and §5 with Amendments 1 and 2) and progress-and-waves
option B:

- **lf57-report-go (Go):** Deltagos reads `factory report`'s JSON and text
  for the window you pick. It computes nothing itself. It joins each line to
  the wave that holds its cards and adds the rounds, why they failed, build
  time and tokens. Run records gain the round's `cause`.
- **lf57-run-report:** Overview's "While you were away" shows the window
  picker, the rows with a wave column and what each jump cost, a footer per
  wave linking to Work, the tracks, the rulings taken while you were away,
  and Copy as text.
- **lf57-home-signal:** Home's row reads `last run · 12 cards · 2 h
  stopped`, with no percent.

Out of scope: History in Roadmap (option A, after the 0042 ledger) and the
waves block in `factory report`'s text, which is Hephaistos's.

## Options

- **accept as written**: three cards in three waves, in order.
- **accept with amendments**: say which.
- **send back**.

## Recommendation

accept as written.

## Forecast

forecast: 180-300m over 3 waves, once its dependencies are on origin/main.
basis: this initiative's Go plus frontend cards with a UI review (lf51,
lf52, lf55: 60-110 min each with reviews). The clock starts when it launches,
not now. It waits on two things:
- talos-lab merging lf52-decisions-line, the three lf53 cards and
  lf55-one-title (lf55 still needs its H3 check);
- Hephaistos's list of windows for R4.
