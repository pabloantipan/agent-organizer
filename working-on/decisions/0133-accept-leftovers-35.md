---
title: Accept leftovers 35 - the focus ring turns light violet, busy colours follow their roles, a sent thread lets go
status: ruled
raised: 2026-10-15
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf35-ring-tokens]
forecast: 25-50m
threads: [01M500DD8973107SZ7YQRGEHBN]
supersedes: []
superseded_by:
ruled: 2026-10-15
ruled_by: pablo
chosen: accept as written
---

## Question

leftovers-34's UI review, answered by Aglaea (launch-progress Amendment 9,
and thread 01M500DD), plus the two done findings she kept from the tidy
(0131). One card (`docs/specs/leftovers-35.md`):

- **A visible change to your colours:** the focus ring becomes light violet
  (#c0abfe, violet-11) everywhere, instead of the accent purple (#8a3ffc).
  Today the purple ring fails the 3:1 contrast rule on menus, drawers,
  dialogs and selected rows (2.5 to 3.0:1). The accent itself, its fills
  and the "you are here" line stay #8a3ffc; only the focus outline changes.
- The busy colours (dimmed copies of other colours) each name their source,
  and a test fails when a source changes without its copy.
- A new thread that was sent but never shows in the feed: after two feeds
  Send stops waiting, the form clears and says `Sent. The thread shows when
  the feed lists it.`, focus goes to the message box. Today Send stays busy
  for good.
- A memory session's `Agents ›` finds its row by its key, not its position
  (it can land on the wrong row today); the top bar reads Usage, memory,
  Rescan; the roadmap's diamond corners go from 2px to 4px.

No check drives your screen or keyboard, starts a real agent, or writes
your clipboard.

forecast: 25-50 min over 1 wave; basis: leftovers-31 to 34, this
initiative (19, 15, ~26 and 37 min of work, one card each; this one has six
small requirements across tokens, Conversations and Agents).

## Options

- **"accept as written"**
- **"accept with amendments"**: name them (for example, keep the purple
  ring and accept the contrast failure).
- **"send back"**: say what is wrong.

## Recommendation

The FSE: **"accept as written"**.

## Ruling

pablo, 2026-10-15, in the FSE session (organizer-probe-fse): "do", answering the FSE's message that put 0132 and 0133 to him with the FSE's recommendation on each. Recorded by the FSE.

## Consequences

On accept: the FSE spawns sup72 for `lf35-ring-tokens`, one wave.
