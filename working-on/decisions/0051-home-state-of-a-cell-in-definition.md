---
title: What Home's state says for an initiative whose cell is in definition
status: proposed
raised: 2026-09-29
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [keep the four states, a Launch row in Needs me, a fifth state]
chosen:
cards: [cell-definition-finish]
threads: []
supersedes: []
superseded_by:
stage: discovery-in-a-cell
---

## Question

sup15 found Home's state reading "quiet" beside "cell in definition"
(`runs/2026-09-28-discovery-in-a-cell.md`). The four states come from 0034
and 0035 (`lib/initiativeState.ts`): you (a Needs me row), executing,
business, quiet. With cell-draft (0050), a drafted cell raises a proposed
accept record owned by you, so it already reads "you". The case left is a
cell whose roster is accepted but whose seats have never run: it waits on
you to launch it, and Home says "quiet".

## Options

- **keep the four states**: no code. The "cell in definition" signal and
  its "waits on its first launch" hover carry it. Cost: none; the two words
  keep disagreeing on one row.
- **a Launch row in Needs me**: an accepted cell with no seat run is a Needs
  me row with the verb Launch (opens Agents), so the state is "you" and the
  badge counts it. Cost: one row kind in `needsMeRows`, part of
  cell-definition-finish; "you" keeps meaning a Needs me row (0034).
- **a fifth state, "defining"**: a state word between business and quiet.
  Cost: `initiativeState`, its order, an icon, the Help's text; a fifth word
  to learn on the glance.

## Recommendation

The FSE's: a Launch row in Needs me. Launching is the one thing the cell
waits on, and it is yours; the row says so where you already look, without
adding a word to the glance.

## Ruling



## Consequences

On "a Launch row" or "a fifth state": the FSE writes it as FR-7 of
discovery-in-a-cell and adds its gate row to cell-definition-finish if that
card has not launched.
