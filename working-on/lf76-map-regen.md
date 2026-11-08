---
title: "The organizer's map is regenerated with the grounded stamp and checks clean"
status: next
repos: [organizer]
branch: lf76-map-regen
seat: l76-map
reviewer:
review:
stage:
updated: 2026-11-08
next: "review: lf76-map-regen, gate met (C1-C3, X0), df5b9e17"
depends_on: []
boundary: ["docs/architecture/"]
spec: "docs/specs/leftovers-76.md (FR-1)"
gate: "docs/specs/leftovers-76.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
`c4-map check` is clean on main after this merge, and stays clean.

## Gate
docs/specs/leftovers-76.md, rows C1-C3 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: the c4-map, diagram-check and mermaid2svg runs of C1-C3 (mermaid2svg on copies, leftovers-63 Amendment 1).
- Short-sample fallback: n/a, the map is generated from the repo itself.
- Data shape across states: c4-map/1.
- Evidence: command output in the card's Done line.
- Retention: n/a.

## Declared changes
- modified `docs/architecture/containers.md`: gen restamps `agent_organizer` evidence from `agent-organizer@784a1f3` to `agent-organizer@46fc597`
- modified `docs/architecture/map.json`: gen restamps `inputs` and the container grounding to 46fc597
Risky:
- none: generated region and index only
Not changed, on purpose:
- `docs/architecture/context.md`: L1 changes only by a ruled record; gen did not touch it
- `docs/architecture/modules.md`: not regenerated (`gen` without `--modules`); check does not flag it
- `docs/architecture/c4.json`: gen locked no new id

## Done
- 2026-11-08 l76-map, df5b9e17 on 46fc597e (origin/main unmoved): C1 on main `c4-map check .` exit 1 `stale: containers.md containers`; `c4-map gen .` exit 0 (wrote containers.md, map.json), `c4-map check .` exit 0 clean, on the commit exit 0 clean and gen "wrote: nothing (up to date)"; a simulated `--no-ff` merge onto 46fc597e checks clean. C2 `diagram-check <page> --map docs/architecture` exit 0, 0 flags for context, containers, modules. C3 cmp identical copies in `.wt-notes/l76-map/c3/`, `mermaid2svg <copy> --check` exit 0 each, no crossings. X0 porcelain empty, diff only containers.md, map.json. Logs `.wt-notes/l76-map/`.
