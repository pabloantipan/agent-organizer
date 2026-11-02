# Deltagos (organizer) — base map

The one map every spec and decision record of this initiative draws its
change on. Kept by Daedalus (`daedalus` skill, "The base map"); made and
checked with `c4-map` (`c4-map` skill).

| File | What | How it is made |
|---|---|---|
| `context.md` | L1 system context: people, the system, external systems; one mermaid flowchart | curated; accepted in record 0176 (2026-11-01); changed only by a ruled record |
| `containers.md` | L2 deployable units and data stores | `c4-map gen`, between its markers; prose around them by hand |
| `modules.md` | L3 modules inside each container | `c4-map gen --modules <container id>` (the app container), between its markers |
| `c4.json` | the adapters, the id lock, curated externals, edges, merges | by hand, plus the lock `gen` writes |
| `map.json` | the index diagram-check and the map lens read | `c4-map gen` |

## Ids

Every node has a stable `snake_case` id, the same in every diagram that
draws it; `c4.json` locks it, so a regeneration never renames it. A change
diagram reuses these ids; a new component is classed `added` and named in
its card's `footprint:`. Check the map with `c4-map check <root>`, a diagram
with `diagram-check <file.md>`, and render with `mermaid2svg <file.md>
--check`.

## Grounding

Every page carries the same five-column table: each node to the evidence
that it is real. A blank evidence cell is ungrounded, and `c4-map check`
says so.

| node | level | kind | status | evidence |
|---|---|---|---|---|
| (the node's id) | context, containers or modules | person, system, container, store, external or module | exists, ruled or retiring | repo, deploy, pipeline, cluster, external, record or curated, then the reference; `;` between entries |
