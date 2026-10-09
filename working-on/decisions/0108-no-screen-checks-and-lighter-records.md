---
title: Gate rows without the lead's screen, and one record for a small UI ask
status: ruled
raised: 2026-10-09
raised_by: fse
owner: pablo
ruled: 2026-10-09
ruled_by: pablo
options: ["Drop screen checks; less: one record", "I check it myself; keep as is", "Stop and talk"]
chosen: "Drop screen checks; less: one record"
cards: [ram-sample]
threads: []
supersedes: []
superseded_by:
---

## Question

Pablo, 2026-10-09, in the FSE session on lodestar, after ram-sample had run
over two hours without passing review: "What are we doing? this is not
working". The FSE's reading: G2 and G4 compared with an Activity Monitor
screenshot, so the reviewer waited for Pablo to be idle; G4 contradicted
FR-3 (0107); and six records in a day for three small asks.

## Ruling

pablo, 2026-10-09, in the FSE session on lodestar, answering the FSE's form:

- "Drop screen checks" ("G2/G4 compare with a command-line reading
  (top/footprint) instead of an Activity Monitor screenshot. The reviewer
  finishes without you").
- "Less: one record" ("Scope and accept in one record with the design
  attached; I amend specs myself when a review finds a gate contradiction
  and tell you after, instead of a new record each time").

## Consequences

ram-indicator G2 and G4 amended (Amendment 3). From now on, for a small UI
ask: one record carries scope, design and accept; a gate contradiction found
in review is amended by the FSE and reported after. Gate rows read a
command, not the lead's screen, unless the screen itself is what is checked.
