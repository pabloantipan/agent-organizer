---
title: Accept leftovers 83 - the React app on the organizer's own map
status: ruled
raised: 2026-11-08
raised_by: fse
owner: pablo
options: ["accept as written", "send back"]
cards: [lf83-webview-map]
forecast: 20-45m
supersedes: []
superseded_by:
ruled: 2026-11-08
ruled_by: pablo (autonomous mode)
supervisor: organizer-probe-sup125
chosen: accept as written
---

## Question

The organizer's C4 map shows only the Go side; the React app has waited
off it since 2026-11-01. How to draw it was put to a judge (AI agent
Daedalus, judge-architecture, 2026-11-08), which picked option A of three
(A: a second container from an adapter in this repo; B: one container
with the repo root as its module root, mostly noise; C: wait for a c4-map
change): "The webview becomes its own L2 container, grounded on
`agent-organizer/frontend` through an adapter kept in the organizer repo
(c4-map reads `adapters[].path` against the initiative root, and the
container's repo from the first part of its evidence). Its L3 comes from
`modules.deltagos_webview.root = "frontend/src"`, and a curated edge over
the Wails bindings joins it to `agent_organizer`. No c4-map change is
needed, so C's wait on the factory is not needed either." Leftovers 83
(`docs/specs/leftovers-83.md`), one docs card plus the adapter script.

## Options

- **accept as written**: one card, option A as judged.
- **send back**.

## Recommendation

accept as written.

## Forecast

forecast: 20-45m over 1 wave; basis: lf76 (map regen, part of sup118's 43 min), lf63 (the first map), this initiative.

## Ruling

pablo (autonomous mode), 2026-11-08 10:50: the recommendation taken after
five minutes without an answer. Asked at 10:45 in the mailbox ("0196:
accept leftovers 83, the React app on the map?", options accept as written
or send back); recommended "accept as written". The approach was judged by
AI agent Daedalus (judge-architecture), option A, quoted under Question.
Not sensitive: the organizer's own record and its own map docs.
