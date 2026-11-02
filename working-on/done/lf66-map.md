---
title: "The organizer's map is regenerated and checks clean"
status: done
repos: [organizer]
branch: lf66-map
seat: l66-map
reviewer: l66-map-rev
stage:
updated: 2026-11-02
next: "done: merged as organizer #47 83056a1"
review: "pass at 81812b0 by l66-map-rev, 2026-11-02: C1-C3 and X0 met, unmet none"
depends_on: [lf66-go]
boundary: ["docs/architecture/"]
spec: "docs/specs/leftovers-66.md (FR-5)"
gate: "docs/specs/leftovers-66.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
prs:
  - {repo: organizer, pr: 47, target: main, state: merged, merge: 83056a1}
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

## Review
Verdict: pass at 81812b0 (on 784a1f3). Unmet rows: none. Reviewer l66-map-rev, 2026-11-02. Clean clone at 81812b0; logs in `.wt-notes/l66-map-rev/`.

change-check (`--base origin/main`, 16716a9): 2 files changed (containers.md, map.json, both declared), 0 flags: outside boundary 0, undeclared 0, declared not changed 0. Nothing to explain.

- C1 met. With the clone's origin set to the repo's own URL (git@github.com:pabloantipan/agent-organizer.git): `c4-map check .` before gen exit 0 "clean"; `c4-map gen .` exit 0 "wrote: nothing (up to date)"; `git status --porcelain` empty; `c4-map check .` exit 0 "clean".
- C2 met. `diagram-check <page> --map docs/architecture` per page: no `ungrounded:` line. `invented: pablo` (context.md) and 20 `invented: agent_organizer__*` (modules.md) are identical at 784a1f3 on pages this commit does not touch: tool-side, not this commit.
- C3 met. context, containers, modules copied to `.wt-notes/l66-map-rev/svg/`, `cmp` identical, `mermaid2svg <copy> --check` exit 0 each (no crossings).
- X0 met. `git diff --name-only 784a1f3..81812b0`: docs/architecture/containers.md, docs/architecture/map.json only; porcelain empty.

Note (goes to Hephaistos, c4-map tool): c4-map names the repo from `origin`'s URL. In a clone whose origin is the local path (`git clone /Users/pabloantipan/organizer`), `c4-map check .` before gen exits 1 with 23 flags (`repo gone: agent-organizer` x21, `repo not on map: organizer`, `stale: containers.md`), and `gen` rewrites c4.json, containers.md, map.json (locks a new id `organizer`). Environment, not this commit: with the real URL the same tree is clean. A reviewer's clean clone needs the remote set, or c4-map should take the repo identity from somewhere stable.
Note (goes to Hephaistos, diagram-check tool): per-page map load does not read L1 person and L3 module nodes as map ids, so context.md and modules.md exit 1 with `invented:` (builder's progress.md says the same).
