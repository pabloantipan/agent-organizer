---
title: Initiatives as cards - sleep and wake, awake first, memory per initiative and agent - scope
status: ruled
raised: 2026-10-09
raised_by: fse
owner: pablo
ruled: 2026-10-09
ruled_by: pablo
options: ["A: an Initiatives view of cards with Sleep and Wake; Wake refuses a fifth; the rail's fold is Asleep; memory on each card and on every Agents row", "B: as A, but Wake at the limit offers Wake anyway", "C: no new view; Sleep and Wake on Home's rows and the initiative header; the rest as A"]
chosen: "A: an Initiatives view of cards with Sleep and Wake; Wake refuses a fifth; the rail's fold is Asleep; memory on each card and on every Agents row"
cards: []
threads: ["01M4GHM3YT12YSA67HK1DB45M5"]
supersedes: []
superseded_by:
---

## Question

Pablo, 2026-10-09, in the Hephaistos pair session on lodestar (relayed by
Hephaistos): "What do we need now is a way to reflex that at organizer.
What I am missing is view where I could handle initiatives as cards,
activate deactivate some. Also, In the left menu, at top, active ones shall
be placed. Also, I need a monitor of how ram is being used by each
initiavie, each agent". "That" is the factory's awake and asleep state:
`factory awake | sleep <id> | wake [--force] <id>` (claudecode 4f1e113,
d828b99; at most four awake, agent-slack decisions.md).

What exists (read, not assumed):

- Asleep is `status: paused` in `initiative.yaml` plus the seats frozen
  (`seat-freeze`); `factory sleep|wake` writes the status and commits it
  (`~/claudecode/scripts/factory/sleep.sh`).
- Deltagos already reads that status (0036, 0042): an initiative that is not
  `active` leaves Home and Needs me, folds into "Not active" at the bottom
  of the rail, and opens read-only. So awake ones are already on top; what
  is missing is the word and the control.
- 0103 (proposed) already samples each agent's memory and, amended today,
  each initiative's total.

## Options

All three: Sleep and Wake run `factory sleep|wake` (Deltagos writes no
status itself, as with probe); the four-awake count shows as `3 of 4 awake`;
the rail keeps awake initiatives in their groups and renames its fold
"Asleep (n)"; memory per initiative and per agent come from 0103's sampling.

- **"A: an Initiatives view of cards with Sleep and Wake; Wake refuses a
  fifth; the rail's fold is Asleep; memory on each card and on every Agents
  row"**: a top-level Initiatives view (like Usage), one card per
  initiative: title, client, awake or asleep, live and frozen seats, its
  memory, its next date, and Sleep or Wake. At four awake, Wake is refused
  and the view says which are awake. Every row in Agents shows its memory.
- **"B: as A, but Wake at the limit offers Wake anyway"**
  (`factory wake --force`), with the count then reading `5 of 4 awake`.
- **"C: no new view; Sleep and Wake on Home's rows and the initiative
  header; the rest as A"**: Home already lists every initiative in the
  rail's order; asleep ones would show there instead of leaving it.

## Recommendation

A. It is the view you asked for, and the limit stays a limit (the factory's
ruling); `factory wake --force` stays on the command line for the rare case.

## What it costs, and what it changes

- Sleeping an initiative makes it read-only here and takes its decisions
  and threads out of Needs me (0042). Waking brings them back. Say if a
  sleeping initiative's waiting decisions should stay in Needs me.
- `factory awake` lists initiatives three levels under ~ only; camp
  (`~/ccint/ccint-camp-monorepo`) is four and is missing from it, though
  Deltagos scans it. Told to Hephaistos; the view needs the factory to see
  the same set Deltagos does.
- Aglaea designs the view, its states and words; the FSE specs and cuts
  the cards after 0103's task (they share the top bar and the Agents rows).

## Ruling

pablo, 2026-10-09, in the organizer on lodestar: ok
