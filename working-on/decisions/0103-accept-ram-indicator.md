---
title: Accept the RAM indicator spec and launch its two cards
status: proposed
raised: 2026-10-09
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: ["accept as written", "accept with amendments", "send back"]
chosen:
cards: [ram-sample, ram-view]
threads: ["01M4CK6VQ11WY8YJW9YWQ4C63T"]
supersedes: []
superseded_by:
---

## Question

Your ask (0101): "we need a ram monitoring indicator", ruled as pressure,
free GB and the biggest agents, in the top bar and on the floating icon,
this Mac only, warned at critical.

Two cards, one after the other:

1. **ram-sample**: every 10 s, with the agents (no daemon, nothing when the
   app is closed), read the OS's memory pressure, free GB, and each agent
   session's memory counted over everything it started; `organizer memory`
   prints it.
2. **ram-view**: Aglaea's design (`docs/ux/specs/ram-indicator.md`): a quiet
   `▣ 12 GB free` in the top bar, `· high` in magenta, a filled `Memory
   critical` chip; a popover with the five biggest sessions, each `Agents ›`;
   a ring outside the floating icon at high and critical; one notification
   per entry into critical ("Memory critical on lodestar", the biggest
   sessions), never twice in 30 min. Nothing anywhere stops a session.

Two choices made for you, say if either is wrong:

- **Critical is magenta, never red** (Aglaea's O2): red is blocked's alone,
  and the word always says the level.
- **A session's memory is its footprint** (Aglaea's O1), the figure
  Activity Monitor's Memory column shows, not resident size, which counts
  shared memory again for every process in the tree.

The other laptop gets it by pulling and reinstalling. The notification may
need your permission the first time; if macOS refuses the review build,
the reviewer checks it in the installed app with you.

Build spec `docs/specs/ram-indicator.md`. Every gate row is a seat's (0095),
except N1 if macOS refuses the review build.

forecast: 1.5-3 h of wave time over 2 waves; plus this decision; basis:
this initiative's last two two-card tasks, usage 1 h 43 min and
roadmap-as-a-plan 1 h 22 min (run records 2026-10-06).

## Options

- **"accept as written"**
- **"accept with amendments"**: name them.
- **"send back"**: say what is wrong.

## Recommendation

The FSE's: accept as written. ram-view does not wait on 0102 (the mark's
colours): the ring sits outside the tile.
