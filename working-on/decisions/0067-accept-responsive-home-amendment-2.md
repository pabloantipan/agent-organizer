---
title: Accept responsive-home's second pass (Aglaea's Amendment 1), and launch its card
status: proposed
raised: 2026-09-29
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [accept as written, accept with amendments, send back]
chosen:
cards: [responsive-home-2]
threads: [01M3R30XH7M78JYKWYGK2ABKSF]
supersedes: []
superseded_by:
stage: twenty-at-a-glance
---

## Question

responsive-home's UI review found nine gaps (U1–U9), and Aglaea answered
them in her design's Amendment 1 (`docs/ux/specs/responsive-home.md`,
836866a). The one that changes what 0061 accepted is U3, severity 3, her own
error: at 1280 with the rail expanded, Home shows 7 rows, goals of about 15
characters and 3 stages. So **compact runs up to 1439 and regular starts at
1440**: the laptop's windows below full screen get the strip and one-line
rows, while the 14-inch laptop at full screen (1512) and half the ultrawide
stay regular. The rest:

- the compact rule sheet gets a scrim, and focus stays inside the box in
  every class (U1, U8);
- one draft per record: opening another Rule keeps your words (U2);
- signals never wrap in compact, with "+N" (U4);
- accessible names for the chevron and the rail toggle, and a full hover on
  wide Needs me rows (U5, U6, U9);
- the wide rule box stays in view on the last row.

It is amendment 2 of `docs/specs/responsive-home.md` (FR-7 to FR-12,
G9 to G12), one card `responsive-home-2` with a UI reviewer, after
responsive-home and rule-box-finish land.

forecast: 30–46 min of wave time over 1 wave, after those two, plus this
decision (median 0 d); basis: 26 cards in 13 single-wave tasks, this
initiative, plus the UI reviewer.

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written. The 1440 boundary is Aglaea's design call,
measured this time.

## Ruling



## Consequences

On acceptance: the FSE starts one supervisor for responsive-home-2 when its
two dependencies land.
