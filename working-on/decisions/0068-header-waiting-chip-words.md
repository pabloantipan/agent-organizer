---
title: What the header's waiting chip says
status: proposed
raised: 2026-09-30
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [N decisions waiting, keep N waiting and change the gate]
chosen:
cards: [header-fold]
threads: []
supersedes: []
superseded_by:
stage: twenty-at-a-glance
---

## Question

header-fold failed review on G8 alone (830672b; the rest met). A reader who
had never seen the app was shown the folded header at 1512. They read the
strip right ("sure"). On the chip, "3 waiting", they answered "a guess":
"nothing on screen names what is waiting"
(`.wt-notes/hdr-fold-reader/answers.md`). The build is as specified:
initiative-header FR-2, from Aglaea's design, fixed the words "N waiting" or
"N waiting on you". The words fail the design's own H11 ("they can say …
what the chip leads to"). Should the chip change, or the gate?

## Options

- **N decisions waiting**: the chip names what waits: "3 decisions waiting",
  or "3 decisions waiting on you" when you are the owner, which is the words
  the header had before the fold. Cost: FR-2's words amended, one string in
  header-fold, and the reader reruns G8 only. Aglaea is told, since the
  words were her design.
- **keep N waiting and change the gate**: H11 and G8 drop "what the chip
  leads to". Cost: none now; the chip stays a guess for a newcomer, the
  person 0029 names ("so a developer could become a mechanic of this
  machine").

## Recommendation

The FSE's: N decisions waiting. It is the one word the reader lacked, and it
costs one string. It is longer on the folded bar; at 1024 the bar already
keeps the id whole (H2), and the chip is the last thing to give way.

## Ruling



## Consequences

On "N decisions waiting": the FSE amends initiative-header FR-2 and tells
sup23 and Aglaea; the builder changes the words; a new reader reruns G8. On
"change the gate": the FSE amends G8 and H11, and sup23 merges.
