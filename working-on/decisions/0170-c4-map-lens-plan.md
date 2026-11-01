---
title: The C4 map lens in Deltagos - the plan, and where Map lives
status: proposed
raised: 2026-10-27
raised_by: fse
owner: pablo
options: ["roadmap mode", "own sub-view"]
cards: []
threads: [01M604ZJYQVBX3HGDBW6TX2Q59, 01M6051CZHV0D8YERRRWYNPZ9Q]
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

You said "C4 are for being integrated to Deltagos and Elenx, send fses"
(2026-10-27, relayed by Hephaistos). The source is odyssey's spec for a map
generator, `docs/specs/c4-base-map.md` on personal-cloude branch
`spec/c4-base-map` (f3d2346). `bin/c4-map` writes `docs/architecture/`:
context, containers and modules pages, each with a grounding table, plus one
index, `map.json`. Hephaistos builds it on lodestar once you give the word.
Aglaea's map design is `docs/ux/specs/map-and-roadmap.md`, and her Amendment
1 (4e02302) answers the spec's questions for Deltagos.

The plan:
- Deltagos reads `map.json` and never parses the pages, the same rule as
  `factory report`.
- It renders each level once, dark, from the mermaid source, and keeps the
  node ids so a lens only recolours them.
- You drill from context to containers to modules.
- A node's panel ends with where it was found: repo and commit, deploy path,
  record.
- A node with no evidence draws dotted, marked "not grounded". That is the
  drift odyssey found.
- With no `map.json` there is an empty state. Elenx gets the same lens.

Nothing is built until the generator lands and its output has a contract
sample (agent-mailbox-specs `contracts/c4-map/`, as `factory-report` has).

Cards, cut once you rule and the sample exists:

- **lf58-map-read (Go):** read `map.json` at the pinned schema. An unknown
  version reads "Map not drawn". It is bound for the app.
- **lf58-map-render:** render each level's mermaid dark through the existing
  diagram renderer (0140). The SVG is drawn inline, sanitized, so a lens can
  reach the node ids. Today's diagrams are images, which a lens cannot
  recolour.
- **lf58-map-lens (frontend, UI review):** the Map view with the levels and
  breadcrumb, the node panel with its grounding, dotted ungrounded nodes,
  planned nodes dashed with their record, and the empty state.

Later and not in this plan: the stage lens, record pins and `touches:`
(Aglaea's other open questions from 2026-10-18).

Q1 was settled outside this record (below), so one question is left:

- **Q2 (the question)** Where does Map live: as a mode of Roadmap (Stages, Map, Cards,
  Calendar, History), or as a sub-view of its own? 0167 put History in
  Roadmap.

Settled elsewhere, kept for the record:

- **Q1** What does the base map draw: only what exists, with its status, so
  that each change is a lens over it (Aglaea's position)? Or does it also
  bake the change classes in (added, changed, removed), as odyssey's
  hand-made map did? This is also the generator spec's blocker Q1, so your
  answer goes to Hephaistos too.
  Ruled by Pablo in the Hephaistos session on lodestar, 2026-10-31, on
  the atlas proposal: "let's ammend the best way we figure out here"
  (agent-slack docs/decisions.md 2026-10-31, entry (4), relayed in thread
  01M6054SPVXXD8H9KK7QJD657Q). The base map draws what exists, with no
  change classes, which belong to a change order's diagram. Corrected the
  same day (Pablo, "ok.", Hephaistos session, relayed in thread
  01M6AAE8F6W1M0D0A710HHD8BP): there is no c4-map/2. The reader is built on
  c4-map/1 as merged (agent-mailbox-specs #15), whose `status` is the Atlas
  lifecycle: `exists` live, `ruled` planned, `retiring` deprecated.

## Options

- **roadmap mode**
- **own sub-view**

## Recommendation

**roadmap mode.**

Roadmap already owns the stages that the map is coloured by, and a
seventh sub-view breaks FR-14.

## Asked of Hephaistos for the contract

- `schema` and a full `map.json` example (c4-map/1, merged in agent-mailbox-specs #15);
- per node, the SVG element id, or the exact rule to find it, since the id
  carries a mermaid counter;
- each level's mermaid source, or its page and block, so Deltagos renders it
  dark itself and never shows the committed light SVGs;
- the drawn id that stands for merged members;
- ✚ (U+271A), not ➕, if change glyphs ever appear, as Deltagos already
  reads them (Aglaea's diagrams Amendment 1).
