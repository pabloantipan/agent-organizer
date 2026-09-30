---
title: What responsive-home's timed glance (G7, A8) asks at 1024 and 1512
status: proposed
raised: 2026-09-29
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [scroll allowed under the minute, wide only, keep as written]
chosen:
cards: [responsive-home]
threads: []
supersedes: []
superseded_by:
stage: twenty-at-a-glance
---

## Question

responsive-home failed review on G7 alone (1a7cb88; G1–G6 and G8 met). G7,
the design's A8, asks a reader to answer the four glance questions for all
twenty initiatives from **one screenshot** at 1024×640, 1512×945 and
3440×1440. The reader got all four right at 3440, in 4 s. At 1024 and 1512
the screenshot holds 7 and 14 rows, so every answer was partial. The gate
contradicts the rest of the spec: A1 asks for at least six rows at 1024, and
twenty rows of 36 px cannot fit in 640 px. The fault is the FSE's, who
copied A8 into the gate without checking it against A1 and A3. What should
G7 ask at the two smaller widths?

## Options

- **scroll allowed under the minute**: at 1024 and 1512 the reader gets Home
  as the lead would, scrolling it (a full-page capture, or the screenshots
  of one scroll), and must still answer all four questions in under a
  minute. At 3440, one screenshot as written. Cost: the spec's G7 and A8
  amended; the reader reruns; no code change.
- **wide only**: G7 is judged at 3440; at the smaller widths A1 and A3 (rows
  in view, ids whole) stand for the glance. Cost: the same rerun, less
  checked.
- **keep as written**: the layout must show all twenty at 1024 and 1512.
  Cost: a new design (Aglaea), since 640 px holds at most about fifteen rows
  of any readable height; a new card.

## Recommendation

The FSE's: scroll allowed under the minute. It keeps twenty-at-a-glance's
promise ("what needs me" in under a minute) at every width, and it tests
what the lead does on the laptop. Aglaea's design gives the laptop more rows
and one line each, not twenty rows.

## Ruling



## Consequences

On "scroll allowed" or "wide only": the FSE amends responsive-home's G7 and
Aglaea's A8 (the words she wrote, with her told), and sup21's reader reruns
G7. On "keep as written": the card goes back to Aglaea for a design.
