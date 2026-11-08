---
title: "The React app is on the organizer's own map, with its modules"
status: done
repos: [organizer]
branch: lf83-webview-map
seat: l83-map
reviewer: l83-rev
review: "pass, unmet: none (l83-rev, 2026-11-08, d0f6780a)"
stage:
updated: 2026-11-08
next: "merged as organizer #84 513db0c6; supervisor moves it to done/"
depends_on: [lf76-map-regen]
boundary: ["docs/architecture/", "scripts/c4-adapter-webview"]
spec: "docs/specs/leftovers-83.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-83.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
prs:
  - {repo: organizer, pr: 84, target: main, state: merged, merge: 513db0c6}
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

## Review
- Verdict: **pass**. Unmet rows: none. Reviewer l83-rev, 2026-11-08, commit d0f6780a (on origin/main 03f7d9b3). Run in a fresh clone of origin under `.wt-notes/l83-rev/clean`, since removed; logs in `.wt-notes/l83-rev/`.
- change-check `organizer lf83-webview-map --base origin/main`: `5 files, 0 flags` (outside boundary 0, undeclared 0, declared, not changed 0), exit 0. Changed: c4.json, containers.md, map.json, modules.md (modified), scripts/c4-adapter-webview (added). Nothing to explain.
- C1 met: `--root . --repo agent-organizer` with C4_REPO_DIR = clone root prints FR-1's line byte-equal, exit 0; `--repo other` 3; no args 2; C4_REPO_DIR an empty dir 3; unknown flag 2; `--root` with no value 2; `--env qa` accepted, 0. `#!/bin/sh`, no dependencies, mode 100755 in git. Main: no adapter (127).
- C2 met, against Amendment 1 (c398f958): gen exit 0 `wrote: nothing (up to date)`, check `clean` exit 0, porcelain empty. map.json: `agent_organizer` and `deltagos_webview` both kind container, parent `deltagos`; webview grounding `[{"kind":"repo","ref":"agent-organizer/frontend"}]`; one edge `deltagos_webview → agent_organizer`, evidence `repo agent-organizer/frontend/wailsjs`, why "calls the Wails-bound App methods" in c4.json. Lock: I deleted every `deltagos_webview*` id from c4.json and reran gen and `--modules deltagos_webview`: `locked 1 new id(s)` then `locked 5 new id(s)`, and porcelain was empty after, so gen wrote the committed lock byte for byte. Stamp: `inputs` = fc56507a, an ancestor of HEAD. Main: one container (`["agent_organizer"]`).
- C2's open question: the builder's claim holds. In `~/claudecode/bin/c4-map` (0016c5f), `run_adapters` passes adapter evidence through `parse_evidence` as `(kind, ref)` unchanged (about lines 296-338). Only `c4-adapter-repos` writes `@sha`, and `git_stamp` (263-281) stamps a self repo with the last commit outside `docs/architecture/`. So `@<sha>` can't be met with FR-1's fact verbatim. The original C2 wording was a gate wording issue, which the FSE's Amendment 1 fixed; against the amended row, C2 is met.
- C3 met: indexed the clone (`index_repository`, 16195 nodes) before any `--modules` run. `--modules agent_organizer` and `--modules deltagos_webview` each `wrote: nothing`, exit 0; check clean, exit 0. The webview region lists components, hooks, lib, stores and styles; the Go region lists 20 `internal/` packages. `frontend/wailsjs` appears only in the edge row (containers.md:43, c4.json edge, map.json edge). No page was rewritten.
- C4 met: `diagram-check <page> --map docs/architecture` for context.md, containers.md and modules.md, one page per run (README.md holds no diagram): exit 0 each, 0 flags, no `ungrounded:`.
- C5 met: `cmp`-identical copies in `.wt-notes/l83-rev/c5/`; `mermaid2svg <copy> --check` exit 0 x3 (context 6 nodes, containers 6, modules 20 + 5, no crossings); no new svg in the clone.
- X0 met: porcelain empty after all rows; `git diff --stat 03f7d9b3..d0f6780a` touches only docs/architecture/ (4 files) and scripts/c4-adapter-webview.
- Pages against the c4-map skill: every grounding table has five columns and the edge table three. The new container and its five modules are grounded. modules.md's hand edits (title, intro, two `##` headings, the webview markers) are outside the generated regions, and the regions are exactly what gen writes.
- Note (to the FSE, no action on this card): with C4_REPO_DIR unset, the adapter falls back to `<root>/agent-organizer`, which does not exist for a self repo, so it exits 3. That's harmless, because c4-map always sets C4_REPO_DIR (`run_adapters`).
- Note (to the FSE): at 03f7d9b3, main's map was already stale (`c4-map gen .` there rewrote containers.md and map.json; stamp 46fc597). This branch restamps it, nothing to do.
- Note: the Map reader drawing only the first mermaid block of modules.md is leftovers 84 (sup125), not this card.
