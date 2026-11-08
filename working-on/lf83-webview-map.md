---
title: "The React app is on the organizer's own map, with its modules"
status: now
repos: [organizer]
branch: lf83-webview-map
seat: l83-map
reviewer:
review:
stage:
updated: 2026-11-08
next: "review: lf83-webview-map, gate met (C1-C5, X0; C2 grounding without @sha, see Notes), d0f6780a"
depends_on: [lf76-map-regen]
boundary: ["docs/architecture/", "scripts/c4-adapter-webview"]
spec: "docs/specs/leftovers-83.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-83.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
The map shows the Deltagos webview as its own container, with its modules and its edge to the Go app, and checks clean.

## Gate
docs/specs/leftovers-83.md, rows C1-C5 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #82).
- Merge target: `main` through talos-lab's PR.
- Design: Daedalus's judgement in 0196, option A; the fact line and the c4.json fragments are FR-1 and FR-2's, as the judge quoted c4-map reading them.
- Index the card's root in codebase-memory (`index_repository`) before the `--modules` runs; the existing index is of a removed worktree.
- Tests: the C rows' commands; no Go or vitest test.
- Short-sample fallback: n/a, the map is generated from the repo itself.
- Data shape across states: c4-map/1.
- Evidence: command output in the card's Done line.
- Retention: n/a.

## Declared changes
- added `scripts/c4-adapter-webview`: the c4-map adapter printing the deltagos-webview container fact for agent-organizer (FR-1)
- modified `docs/architecture/c4.json`: webview adapter, curated edge deltagos_webview -> agent_organizer, modules.deltagos_webview root frontend/src; ids lock and layout written by gen (FR-2)
- modified `docs/architecture/containers.md`: generated L2 with two containers and the edge, restamped fc56507 (FR-3)
- modified `docs/architecture/modules.md`: page retitled, a `##` per container, hand-added deltagos_webview markers, generated webview region (FR-3)
- modified `docs/architecture/map.json`: generated index, 37 nodes, second modules level (FR-3)
Risky:
- `docs/architecture/c4.json`: gen rewrote the whole file in its compact layout, so the diff is wide though only 3 entries and 6 ids are new
Not changed, on purpose:
- `internal/service/map.go`: its first-block-per-page read now shows the Go modules for the webview level too; outside the boundary (Notes)
- `frontend/`: the map reads it, nothing in it changed

## Notes
- codebase-memory: indexed this worktree (`index_repository` on /Users/pabloantipan/organizer/.wt/lf83-webview-map, 16188 nodes) before any `--modules` run; X0's clean clone was indexed too, then its project and the clone were removed.
- C2 says the webview is grounded `repo agent-organizer/frontend@<sha>`; FR-1 (and C1) fix the fact's ref as `agent-organizer/frontend` and c4-map adds no sha to adapter evidence, so the row reads `repo agent-organizer/frontend` and the stamp is map.json `inputs` (fc56507a). Kept FR-1 verbatim; the reviewer judges C2's wording.
- Deltagos's Map reader takes the first mermaid block of a page per level; modules.md now holds two, so the webview's L3 level would draw the Go modules in the app. Follow-up card for `internal/service/map.go`, not this one.

## Done
- 2026-11-08 l83-map: lf83-webview-map at d0f6780a on origin/main 03f7d9b3 (commits fc56507a adapter, 199d7d64 c4.json, d0f6780a pages). Main vs branch: C1 adapter missing (127) / fact line 0, other 3, bare 2; C2 one container / gen nothing to write, check clean, agent_organizer + deltagos_webview containers, edge with wailsjs evidence and why; C3 no webview region / both --modules nothing to write, webview region components hooks lib stores styles, Go region 20 packages; C4 diagram-check per page exit 0, 0 flags (containers 6 nodes, modules 20+5); C5 mermaid2svg --check on cmp-identical copies exit 0 x3 (main: pages without the webview), no svg in the worktree; X0 clean clone: C1-C3 nothing to write, porcelain empty, diff only docs/architecture/ + scripts/c4-adapter-webview. Evidence and commands: /Users/pabloantipan/organizer/.wt-notes/l83-map/progress.md.
