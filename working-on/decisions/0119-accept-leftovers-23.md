---
title: Accept leftovers 23 - seats start detached, the organizer stops typing into iTerm
status: proposed
raised: 2026-10-13
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf23-detached-launch]
threads: []
supersedes: []
superseded_by:
---

## Question

Your ruling today, relayed by Hephaistos: keep the FSE's window clean, and
open a team's windows when you choose (`seats open`). Probe is changing so
every seat starts in the background (claudecode `feat/seat-background`,
yours to merge). Four places in Deltagos still open iTerm and type a line
into it: Bring crew up, Run on a card, New agent, and Attach's fallback.
One card (`docs/specs/leftovers-23.md`) makes the first three start seats
in the background with no window, retrying once if a seat does not come
up, and Attach's fallback uses `probe --attach`.

It starts after you merge the probe branch. One check starts and kills a
throwaway seat on this Mac and counts iTerm windows before and after; it
opens nothing on your screen.

forecast: 25-45 min over 1 wave (one builder), after your probe merge;
basis: leftovers-15 to 22, this initiative.

## Options

- **"accept as written"**
- **"accept with amendments"**: name them.
- **"send back"**: say what is wrong.

## Recommendation

The FSE's: accept as written.
