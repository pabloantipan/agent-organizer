---
title: "The organizer's map is regenerated and checks clean"
status: now
repos: [organizer]
branch: lf66-map
seat: l66-map
reviewer: l66-map-rev
stage:
updated: 2026-11-02
next: "review: lf66-map, C1-C3 and X0 met, 81812b0"
depends_on: [lf66-go]
boundary: ["docs/architecture/"]
spec: "docs/specs/leftovers-66.md (FR-5)"
gate: "docs/specs/leftovers-66.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
`c4-map check` is clean on main after this merge.

## Gate
docs/specs/leftovers-66.md, rows C1-C3 and X0.

## Pre-answered
- Base: origin/main after lf66-go's merge.
- Merge target: `main` through talos-lab's PR.
- Tests: the c4-map, diagram-check and mermaid2svg runs of C1-C3 (mermaid2svg on copies, leftovers-63 Amendment 1).
- Short-sample fallback: n/a, the map is generated from the repo itself.
- Data shape across states: c4-map/1.
- Evidence: command output in the card's Done line.
- Retention: n/a.

## Declared changes
- modified `docs/architecture/containers.md`: gen restamps `agent_organizer` evidence to `agent-organizer@784a1f3`
- modified `docs/architecture/map.json`: gen restamps inputs and the container grounding to 784a1f3
Risky:
- none: generated region and index only
Not changed, on purpose:
- `docs/architecture/context.md`: L1 changes only by a ruled record; gen did not touch it
- `docs/architecture/modules.md`: not regenerated (`gen` without `--modules`); its 20 modules match `internal/` today
- `docs/architecture/c4.json`: gen added no id

## Done
- 2026-11-02 l66-map, 81812b0 on 784a1f3: C1 `c4-map gen .` exit 0 (wrote containers.md, map.json), `c4-map check .` exit 0 "clean", and again after the commit exit 0 "clean" (no stale-by-one); C2 diagram-check per page, 0 `ungrounded:` lines (invented: pablo and 20 module ids flagged, tool-side, progress.md); C3 cmp identical and `mermaid2svg <copy> --check` exit 0 for context, containers, modules; X0 porcelain empty, diff only docs/architecture.
