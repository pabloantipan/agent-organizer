---
title: "A C4 level draws as an inline, sanitized dark SVG with a real button over each node"
status: now
repos: [organizer]
branch: lf58-map-render
seat: l58-render
stage:
updated: 2026-11-01
next: "review: lf58-map-render, V1 V2 X0 pass, 6935178"
depends_on: []
boundary: ["frontend/src/lib/mapSvg.ts", "frontend/src/lib/mapSvg.test.ts", "frontend/src/components/MapFigure.tsx", "frontend/src/components/MapFigure.test.tsx", "frontend/package.json", "frontend/pnpm-lock.yaml", "frontend/src/lib/testdata/"]
spec: "docs/specs/leftovers-58.md (FR-4 and FR-5)"
gate: "docs/specs/leftovers-58.md#Acceptance → gate"
ui_review: false
autonomy: unattended
---

## Goal
A lens can recolour the map's nodes, and every node is reachable by keyboard.

## Gate
docs/specs/leftovers-58.md, rows V1, V2 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Fixture: `testdata/fixture-map/` from the contract's harbor files (specs 54cf10d or later), plus the three variants the spec names; lf58-map-read creates it, the others read it.
- Short-sample fallback: a state the fixture lacks is added as a variant beside it; never the real home, never skipped.
- Data shape across states: c4-map/1 as `contracts/c4-map/map.schema.json` gives it; Deltagos stores nothing but the diagram cache it already keeps.
- Tests: Go in `internal/service/map_test.go`; vitest beside the new lib and components (`cd frontend && npm test`).
- Design questions: Aglaea's map-and-roadmap Amendments 1 and 2 answer them; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Evidence: test output and review-build shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-01: FR-4 and FR-5 built (f226344 mapSvg, 6935178 MapFigure), on origin/main bf66580; V1, V2 fail on the base (modules absent) and pass on the branch (43 tests); X0 passes from a clean clone (vitest 1475, Go, pnpm build, wails build, review-build, porcelain empty). Detail and the lens's API: `.wt-notes/l58-render/progress.md`.

## Notes
- The dark render draws node labels as HTML in `<foreignObject>` (mermaid 11 ignores `flowchart.htmlLabels`); ruled as Amendment 1 (a): the sanitizer swaps each for `<text>`. Root `htmlLabels: false` at the source is held for a later card.
- mmdc's SVG carries the dark style's CSS unscoped (`.node rect`, `marker path`, …); inlined it would restyle the page, so the sanitizer renames the root (`map-svg-N`) and scopes every rule under it. A lens rule therefore needs `#id .node rect`-level specificity or `!important`.

## Declared changes
- added `frontend/src/lib/mapSvg.ts`: FR-4 sanitizer (own XML reader and escaping serializer, element allowlist, foreignObject label to `<text>`, stylesheet scoping, aria-hidden root) and FR-5 node boxes, reading order, roving step, button names, lens classes
- added `frontend/src/lib/mapSvg.test.ts`: V1 (hostile SVG; Amendment 1 over the real L2 render) and V2 (id to box over the fixture's L2)
- added `frontend/src/lib/testdata/harbor-containers.svg`: the contract's L2 block rendered through `internal/diagram`, the V2 test data
- added `frontend/src/lib/testdata/README.md`: the SVG's source, contract sha and how it was rendered
- added `frontend/src/components/MapFigure.tsx`: renders a level through RenderDiagram, inlines the sanitized SVG, a roving set of real buttons over the nodes, lens classes as a prop
- added `frontend/src/components/MapFigure.test.tsx`: the figure's states, names, roving stop, percent placement, lens classes
Risky:
- `parseXml`: a hand-written XML reader; it throws on what it cannot read (the figure then says `Map not drawn`), and only escaped, allowlisted output is inlined
- `scopeCss`: a brace-counting CSS splitter; enough for mmdc's sheets, not a general CSS parser
Not changed, on purpose:
- `frontend/src/components/DiagramFigure.tsx`: its render cache is copied in MapFigure, not exported from it
- `frontend/package.json`, `frontend/pnpm-lock.yaml`: no sanitizer dependency; DOMParser is absent in vitest's Node and a DOM test library is outside the boundary
- `internal/diagram`, `~/.mermaid/mermaid-config-dark.json`: Amendment 1 holds the source-side fix for a later card
- `frontend/src/styles/`: the lens's map.css; the figure's only styles are inline layout
