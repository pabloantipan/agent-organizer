---
title: Accept leftovers 65 - the review and dev builds refuse the real home
status: proposed
raised: 2026-11-02
raised_by: fse
owner: pablo
options: ["accept as written", "send back"]
cards: [lf65-review-guard]
forecast: 45-90m
supersedes: []
superseded_by:
---

## Question

At 03:08 a UI reviewer ran the dev build against Pablo's real data
directory. The rule against it is words in prompts. Leftovers 65
(`docs/specs/leftovers-65.md`) puts it in the binary: a review or dev build
refuses to start unless both `ORGANIZER_CONFIG` and `XDG_DATA_HOME` are
set and outside the real home; `wails dev` keeps an explicit override for
Pablo's own use; the installed app is unchanged. One Go card.

## Options

- **accept as written**: one card, one wave.
- **send back**.

## Recommendation

accept as written.

## Forecast

forecast: 45-90m over 1 wave; basis: lf62-go and lf60-icon today (one Go
card each, 40-80 min with review).
