---
title: Aglaea, the Product Designer, sits beside the FSE
status: ruled
raised: 2026-09-29
raised_by: hephaistos
owner: pablo
ruled: 2026-09-29
ruled_by: pablo
options: [a seat beside the FSE, a cell member, pair session only]
chosen: a seat beside the FSE
cards: []
threads: []
supersedes: []
superseded_by:
stage:
---

## Question

Aglaea, the Product Designer role (the `aglaea` skill; factory record
"Aglaea", `~/agent-slack/docs/decisions.md`, 2026-09-29), may run as a pair
session or as one seat per initiative that builds UI. Which initiative gets
the first seat, and how does it sit?

## Options

- **A seat beside the FSE**: its own mailbox identity (`organizer/aglaea`),
  its own window, woken only by mail; not in `cell.json`, no crew, no
  reconciling.
- **A cell member**: listed in `cell.json` like a crew persona.
- **Pair session only**: Aglaea exists only while Pablo is present.

## Ruling

Pablo, in the Hephaistos session on lodestar: "organizer one needs it", then
"Do not seat Aglaea as a cell member, due we're not in discovery stage
there. We need Aglaea could sit beside FSE".

## Consequences

- `agents/aglaea.md`, `agents/aglaea-prompt.md`, a row in `agents/README.md`;
  `cell.json` unchanged. Token `organizer/aglaea`; session
  `organizer-probe-aglaea`, launched like a supervisor
  (`fse/references/standing-up.md`, "Spawning a supervisor, the line").
- The FSE asks Aglaea by mail to `aglaea`; a card gets a UI reviewer only
  when the FSE marks it `ui_review: true`.
- Open, for the FSE and Aglaea to settle: whether Aglaea owns
  `docs/design-system.md` or only reviews against it (Pablo: "When an
  inititive requires, she does. That's an open question to be answered with
  the FSE").
