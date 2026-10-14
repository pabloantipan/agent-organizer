---
title: Accept leftovers 27 - seats show their start, waiting mail said, scroll stops padded, harness scrolls
status: ruled
raised: 2026-10-14
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf27-launch-state, lf27-launch-view, lf27-polish]
threads: []
supersedes: []
superseded_by:
ruled: 2026-10-14
ruled_by: pablo
chosen: accept as written
---

## Question

Now that seats start detached, each start takes 30-60 s with nothing on
screen. Aglaea designed what to show (`docs/ux/specs/launch-progress.md`,
91cf067). Three cards (`docs/specs/leftovers-27.md`):

1. **Launch state** (Go): the app keeps each seat's start (waiting,
   starting, trying again, running, didn't start) and returns at once
   instead of blocking; Stop starting, Try again; a stub probe so no check
   starts a real seat. The unused iTerm code goes.
2. **Launch view**: Bring crew up turns into a list of seats with their
   state and seconds, said once each to a screen reader; New agent's
   button shows its start; a failure you walked away from becomes a Needs
   me row.
3. **Polish**: a person's description says "1 message waiting"; scroll
   regions pad their text so the focus ring clears it; the Tab harness
   scrolls in its hidden window.

No check drives your screen or keyboard, and none starts a real agent.

forecast: 70-110 min over 2 waves (state and polish together, then the
view); plus any test-lease wait; basis: leftovers-15 to 26 and lf23, this
initiative (lf23: 12 min; leftovers-25: 36 min, no wait).

## Options

- **"accept as written"**
- **"accept with amendments"**: name them.
- **"send back"**: say what is wrong.

## Recommendation

The FSE's: accept as written.

## Ruling

pablo, 2026-10-14, in the organizer on lodestar: ok
