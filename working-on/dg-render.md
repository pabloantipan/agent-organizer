---
title: "A mermaid block in a record or card draws as a dark figure, with its source and a text line"
status: now
repos: [organizer]
branch: dg-render
seat: dr-build
stage: review-map
updated: 2026-10-15
next: "review: dg-render, gate met (G1, G2, D1, D2, D5, D8, X0), 47a6e58"
risk: medium
footprint: [internal/diagram/ (new), app.go, frontend/wailsjs/, internal/cli (doctor), frontend/src/lib/ (mermaid blocks, class line), a figure component, the five marked sites, frontend/src/styles/, a fixture record]
depends_on: []
boundary: ["docs/specs/diagrams.md Boundary, dg-render"]
spec: "docs/specs/diagrams.md (FR-1 to FR-5; diagrams-in-app D1-D8)"
gate: "docs/specs/diagrams.md Acceptance, rows G1, G2, D1, D2, D5, D8 and X0"
ui_review: true
---

## Goal
A mermaid block in a record or card draws as a dark figure, with its source and a text line (T11c; review-map exit 3; Aglaea's diagrams-in-app).

## Gate
docs/specs/diagrams.md, rows G1, G2, D1, D2, D5, D8 and X0.

- [x] G1: go test, fake mmdc and fake home: `internal/diagram/diagram_test.go` (TestG1RenderCachesAndAppendsDarkClassdefs, TestG1MmdcFromNewestNvm)
- [x] G2: `internal/diagram/diagram_test.go` TestG2Reasons; `frontend/src/components/DiagramFigure.test.tsx` "G2: …"
- [x] D1: Tab harness 1024×640, real mmdc (nvm), dark style: /Users/pabloantipan/organizer/.wt-notes/dr-build/out/d1-figure.png, /Users/pabloantipan/organizer/.wt-notes/dr-build/out/d1d2d8.jsonl
- [x] D2: touched classes' strokes 5.14, 9.16, 5.32:1; labels 14.23, 14.23, 7.89:1 (context label 5.32:1): /Users/pabloantipan/organizer/.wt-notes/dr-build/out/d1d2d8.jsonl line 9
- [x] D5: `frontend/src/lib/diagram.test.ts` "D5: …"
- [x] D8: frame 890 holds 2418 and scrolls, page scrollWidth 1024 = 1024, Tab stop "The nightly scan, end to end, diagram": /Users/pabloantipan/organizer/.wt-notes/dr-build/out/d1d2d8.jsonl, /Users/pabloantipan/organizer/.wt-notes/dr-build/out/d8-frame.png
- [x] X0: clean clone at 47a6e58, make test 0, pnpm run build 0, wails build 0, status empty: /Users/pabloantipan/organizer/.wt-notes/dr-build/out/x0-exit.txt, /Users/pabloantipan/organizer/.wt-notes/dr-build/out/x0-status.txt

## Done
- dr-build, 2026-10-15: internal/diagram (mmdc -b transparent, cache by sha256 over block and style), App.RenderDiagram, doctor line, DiagramFigure in the five marked sites, fixture init-a 0012; gate met at 47a6e58 on main 8e1a72d; status golden unmoved.

## Notes
- mmdc paints the SVG white unless `-b transparent` is passed, and `mermaid2svg --style dark` passes none. This card passes it (a light panel otherwise). The toolchain's own script still draws white, which is Hephaistos's to fix.
- D2: context's stroke (#44404d, `--border-strong`, 1.66:1) is below 3:1 by design. diagrams-in-app §1 asks 3:1 of touched classes only, and context's label passes at 5.32:1.
- Bundling mermaid, measured once: 2.75 MB (792 KB gz) against today's whole bundle of 744 KB (233 KB gz). First render takes 55 ms in WKWebView, against about 2.4 s for a cold mmdc. The dist needs Safari 15.4 (`structuredClone`, `Object.hasOwn`, `.at`), above the 15.0 floor. Details: /Users/pabloantipan/organizer/.wt-notes/dr-build/progress.md.
- The skill's example still uses ➕; the fixture follows Amendment 1 (✚).

## Declared changes
- added `internal/diagram/diagram.go`: Renderer (Mmdc lookup PATH then nvm newest, Render with cache, Status), Key, Input, FirstError, Background
- added `internal/diagram/diagram_test.go`: G1, G2, Status over a fake mmdc and home
- modified `internal/cli/cli.go:doctor`: the `diagrams:` line
- added `internal/cli/diagram_test.go`: doctor's diagrams line
- modified `app.go`: `App.diagrams` field, `NewApp`, added `App.RenderDiagram`
- modified `frontend/wailsjs/go/main/App.d.ts`: generated RenderDiagram
- modified `frontend/wailsjs/go/main/App.js`: generated RenderDiagram
- added `frontend/src/lib/diagram.ts`: slotDiagrams, mermaidBlocks, changeClasses, classLine, diagramName, svgSource
- added `frontend/src/lib/diagram.test.ts`: D5, slots
- added `frontend/src/components/DiagramFigure.tsx`: DiagramFigure, DiagramView, useDiagrams, nearestHeading
- added `frontend/src/components/DiagramFigure.test.tsx`: G2 view half, FR-3, the five sites' wiring
- added `frontend/src/styles/diagram.css`: figure, frame, state and class line
- modified `frontend/src/components/CardDrawer.tsx`: slot mermaid blocks, mount figures
- modified `frontend/src/components/RoleDrawer.tsx`: HandOffBody slots mermaid blocks, mounts figures
- modified `frontend/src/components/RuleDecisionBox.tsx`: Clamped slots mermaid blocks, mounts figures
- modified `frontend/src/components/DecisionsView.tsx`: RecordBody takes the title, slots mermaid blocks, mounts figures
- modified `frontend/src/components/HelpView.tsx`: slot mermaid blocks, mount figures
- added `testdata/fixture-overlay/init-a/working-on/decisions/0012-draw-the-change-on-the-map.md`: D1, D2, D8 fixture
- modified `testdata/fixture-overlay/README.md`: one bullet for 0012
Risky:
- `MERMAID_HOME`: a new env var read, as mermaid2svg reads it, else ~/.mermaid
- `useDiagrams`: portals into nodes inside dangerouslySetInnerHTML; a body set again replaces the slots and the figures remount
- `Renderer.Render`: a hung mmdc holds the mutex until the 90 s timeout kills its process group
Not changed, on purpose:
- `lib/useScrollEdges.ts`: the frame reuses watchEdges, sideEdges, scrollStop as they are
- `~/.mermaid`: read only; the white background is fixed by the `-b` flag, not the style files

