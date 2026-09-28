---
title: The FSE spawns a supervisor per task and is never one
status: ruled
raised: 2026-09-26
raised_by: pablo
owner: pablo
ruled: 2026-09-26
ruled_by: pablo
options: [FSE may not start sessions, "FSE spawns supervisors, never supervises"]
chosen: FSE spawns supervisors, never supervises
cards: [fse-pilot]
supersedes: []
superseded_by:
---

## Question

May the FSE ever start a supervisor itself?

## Options

- **may not start sessions**: every task waits on Pablo to launch it.
- **spawns, never supervises**: the FSE hands a defined task to a supervisor it starts and keeps its context clean of the wave.

## Recommendation



## Ruling

Pablo, 2026-09-26: "FSE is never a supervisor. It spawns a supervisor agent for taking a defined task along the initiative. So, FSE keeps context clean from the orchestration, and about what the reconciler could be doing."

## Consequences

The FSE is not the reconciler either; the organizer cell has none.
