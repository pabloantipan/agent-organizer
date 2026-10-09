---
title: Accept the Initiatives view (sleep and wake) and launch its two cards after the RAM indicator
status: proposed
raised: 2026-10-09
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: ["accept as written", "accept with amendments", "send back"]
chosen:
cards: [initiatives-sleep, initiatives-view]
threads: ["01M4GK4QY61MGNM1SWN8FV876Q"]
supersedes: []
superseded_by:
---

## Question

Your ask (0104, A): initiatives as cards, sleep and wake them, awake first,
memory per initiative and agent. Aglaea's design
(`docs/ux/specs/initiatives-view.md`):

- **Initiatives** in the top bar, left of Usage. Head `3 of 4 awake`
  (`· the limit` at four). Cards in Awake, Asleep, then a closed Archived:
  id, client, awake or asleep, goal, sessions live and frozen, memory, next
  date, and Sleep or Wake.
- **Sleep** asks first, in place, only when something is running or
  waiting on you: it names the sessions that freeze, any working now, and
  what leaves Needs me. **Wake** asks nothing; at four awake it is refused,
  says why and names the four, with no Wake anyway.
- The factory's words are shown as they are when it refuses or fails. Camp,
  which the factory cannot see yet, shows its state with no button.
- The rail: `Asleep (n)` and `Archived (n)` instead of `Not active`. Home:
  `n asleep · Initiatives ›`. Every Agents row gets a Memory column.

One thing to know: **archived stays apart from asleep**, because the
factory refuses to sleep or wake an archived initiative.

Two cards: **initiatives-sleep** (Go: runs `factory sleep|wake`, reads the
asleep-since date and frozen sessions, knows what the factory sees), then
**initiatives-view**, after sup49's ram-view (both change the top bar and
the Agents rows). Build spec `docs/specs/initiatives-view.md`; every gate
row is a seat's (0095).

forecast: 1.5-3 h of wave time over 2 waves, after the RAM task (1.5-3 h);
plus this decision; basis: this initiative's last two two-card tasks,
usage 1 h 43 min and roadmap-as-a-plan 1 h 22 min (run records 2026-10-06).
It can run beside 0105's floating-icon task: they share no file.

## Options

- **"accept as written"**
- **"accept with amendments"**: name them.
- **"send back"**: say what is wrong.

## Recommendation

The FSE's: accept as written.
