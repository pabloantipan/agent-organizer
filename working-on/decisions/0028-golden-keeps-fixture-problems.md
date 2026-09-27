---
title: "The status golden keeps the fixture's problem lines"
status: ruled
raised: 2026-09-26
raised_by: sup2
owner: pablo
ruled: 2026-09-27
ruled_by: pablo
options: [accept, a separate fixture root]
chosen: accept
cards: []
threads: []
supersedes: []
superseded_by:
stage:
---

## Question

sup2, closing redesign wave 1: `internal/cli/testdata/status.golden` carries problem lines from init-a's deliberately broken roadmap. Accept, or a clean second fixture root?

## Options

- **accept**: the lines prove broken roadmaps and cards are reported.
- **a separate fixture root**: the broken roadmap moves out; the main snapshot stays clean.

## Recommendation

The blacksmith's: accept.

## Ruling

Pablo, 2026-09-27, in the blacksmith session: "Accept (Rec.)".

## Consequences

Nothing changes; the golden stays as it is.
