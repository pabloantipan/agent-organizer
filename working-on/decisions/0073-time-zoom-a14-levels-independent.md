---
title: time-zoom A14 - each graph's level is its own, or remembered across sub-views
status: proposed
raised: 2026-10-03
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [amend A14 to the spec, remember the level while the app runs]
chosen:
cards: [time-zoom]
threads: [01M416RZH3E5VPJC9D5H8PK73F]
supersedes: []
superseded_by:
---

## Question

`time-zoom`'s code review failed on one row, A14 (3b533f5), and the gate is
what is wrong, not the build. A14 says: set Roadmap > Cards to Days, zoom
Decisions to Days and back to Fit, and "the Roadmap is still at Days". But
Roadmap and Decisions are separate sub-views, and opening one closes the
other. The spec's States table ("the graph left and reopened: back to Fit,
zoom is a look, not a setting") and my Technical note T5 (level is component
state, reset on remount) both say the Roadmap comes back at Fit. The builder
built T5; A14 as written cannot pass with T5 in place. The fault is mine:
spec-craft step 5b did not catch the row against T5.

What A14 was for: zooming one graph never moves another. That holds today
(measured: each graph's level is its own).

## Options

- **amend A14 to the spec**: "each graph has its own level: zooming the
  Decisions Timeline leaves the Roadmap's level as it was while the Roadmap is
  open; leaving a graph returns it to Fit". The build passes as is; re-review
  only.
- **remember the level while the app runs**: each graph's level lives in the
  store per initiative until the app quits (not on disk, not synced). A14
  passes as written; T5 and the States row change; the builder adds the store
  field and a test; about one more build round.

## Recommendation

The FSE's: amend A14 to the spec. Aglaea designed the level as a look that
resets, and nothing you said asked to keep it.

## Ruling

## Consequences

Amend: the FSE rewrites A14 in `docs/ux/specs/roadmap-time-zoom.md` and the
card goes back to review. Remember: the FSE amends T5 and the States row and
the card goes back to its builder.
