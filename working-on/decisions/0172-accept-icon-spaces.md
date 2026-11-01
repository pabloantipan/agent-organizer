---
title: Accept leftovers 60 - the floating icon keeps its place on every desktop
status: proposed
raised: 2026-11-01
raised_by: fse
owner: pablo
options: ["accept as written", "send back"]
cards: [lf60-icon-spaces]
forecast: 45-90m
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

The icon stopped showing on other desktops again. The window server held it
on desktop 3 only, and Deltagos sets "all desktops" once and never checks.
Leftovers 60 (`docs/specs/leftovers-60.md`, one card): when the icon is
wanted and is not on the active desktop or not on screen, set it again and
bring it front, at every desktop change and after every display change,
with a check hook so no gate row moves your desktops.

## Options

- **accept as written**: one card, one wave.
- **send back**.

## Recommendation

accept as written.

## Forecast

forecast: 45-90m over 1 wave; basis: leftovers 50 (the same file, one
card with check hooks).
