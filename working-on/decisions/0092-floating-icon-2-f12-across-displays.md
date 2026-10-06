---
title: floating-icon-2 F12 - accept each size on its own display, the drag across displays untested
status: ruled
raised: 2026-10-05
raised_by: fse
owner: pablo
ruled: 2026-10-05
ruled_by: pablo
options: [accept with the drag unproven, a fourth take with both displays on]
chosen: accept with the drag unproven
cards: [floating-icon-2]
threads: []
supersedes: []
superseded_by:
---

## Question

F12 (`docs/ux/specs/floating-icon.md`, Amendment 1) asks that the icon
resizes when dragged from one display to another. On lodestar the laptop's
screen and the 3440 were never on together in three takes: with the lid
open only the laptop showed, with it closed only the 3440. Each size is
read back on its real display (56 pt on the laptop, 88 pt on the 3440), and
the screen-change path is in code.

## Ruling

pablo, 2026-10-05, in the FSE session on lodestar, answering the FSE's form:
"Accept, drag unproven (Recommended)".

## Consequences

F12 is met for each display's size; the drag across displays is noted as
untested on the card, as N4 (a second display) was for floating-icon.
