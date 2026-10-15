---
title: Accept usage-post - the organizer sends its usage rows to the local record
status: proposed
raised: 2026-10-15
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [usage-post]
forecast: 25-50m
threads: [01M50RN69B0SCKW9A68DW6VJFR]
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

You ruled hestia 0021 today (hestia FSE session): the organizer posts usage
rows to its local record, and sessions with no initiative go as numbers
only. Hephaistos relayed it here. One Go card (`docs/specs/usage-post.md`):

- After each ledger pass, the rows that changed go to the local record
  (`127.0.0.1:8090` on this Mac) with the factory key, 500 at most per
  post, only the contract's fields; never the working directory, the card
  title, the reason or the card list.
- A session with no initiative goes as `unattributed`, with no seat or
  task.
- No record, no key, or a record that fails: the Usage view is not slowed
  or broken; the next pass retries; `organizer doctor` says how the last
  post went. The key is never logged.

The check against hestia's real route waits until hestia builds it; it joins
`factory-integration`'s next action.

One thing to know: the ledger pass runs when the Usage view or `organizer
usage` is opened, not on a timer. So rows reach the record when someone
looks at usage on this Mac. If hestia's "a week equal at both ends" needs
more than that, it is a second card (a pass on the agents ticker, say);
not in this one.

forecast: 25-50 min over 1 wave; basis: one-card tasks on this initiative
(leftovers-23 Go, 12 min; leftovers-31 to 35, 15-37 min).

## Options

- **"accept as written"**
- **"accept with amendments"**: name them (for example, also run the pass
  on a timer).
- **"send back"**: say what is wrong.

## Recommendation

The FSE: **"accept as written"**.

## Ruling

## Consequences

On accept: the FSE spawns a supervisor for `usage-post`, one wave, after
leftovers-36 if both are accepted (they share no files; one supervisor can
run both).
