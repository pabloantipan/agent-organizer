---
title: "Needs me says an others' owner once, and the age column keeps one x"
status: now
repos: [organizer]
branch: lf38-owner-once
seat: oo-build
stage: decisions-owned-and-used
updated: 2026-10-16
next: "review: lf38-owner-once, gate met (O1-O6, X0), 1b13701"
risk: low
footprint: [frontend/src/components/Home.tsx (decisionContext, the others' row), frontend/src/styles/shell.css (.ib-row verb column, .lz.waiting.dashed), frontend/src/components/SpecReader.tsx (Contents entry name), frontend/src/lib/diagram.ts (classLine), frontend/src/components/DiagramFigure.tsx, their tests]
depends_on: []
boundary: ["docs/specs/leftovers-38.md Boundary, lf38-owner-once"]
spec: "docs/specs/leftovers-38.md (FR-1 to FR-3; needs-me-waits Amendment 2, W11, W12)"
gate: "docs/specs/leftovers-38.md Acceptance, rows O1 to O6 and X0"
ui_review: true
---

## Goal
An others' row names its owner once, and the age column lines up across every row of Needs me and Waiting on others (needs-me-waits Amendment 2).

## Gate
docs/specs/leftovers-38.md, rows O1 to O6 and X0.
- [x] O1: /Users/pabloantipan/organizer/.wt-notes/oo-build/out/o1-o4-o5-o6-vitest.log (Home.waits.test.tsx, "O1: …")
- [x] O2: /Users/pabloantipan/organizer/.wt-notes/oo-build/out/o2-1024x640.txt, /Users/pabloantipan/organizer/.wt-notes/oo-build/out/o2-1440x900.txt (18 rows in both groups, Rule, Open, Answer in view; spread 0)
- [x] O3: /Users/pabloantipan/organizer/.wt-notes/oo-build/out/o3-grep.txt (nothing, rc=1)
- [x] O4: /Users/pabloantipan/organizer/.wt-notes/oo-build/out/o1-o4-o5-o6-vitest.log (SpecReader.test.tsx, "leftovers-38 O4")
- [x] O5: /Users/pabloantipan/organizer/.wt-notes/oo-build/out/o1-o4-o5-o6-vitest.log (diagram.test.ts, "leftovers-38 O5")
- [x] O6: /Users/pabloantipan/organizer/.wt-notes/oo-build/out/ax-o6.txt, /Users/pabloantipan/organizer/.wt-notes/oo-build/out/o6-ax-excerpt.txt (review build pid, init-a 0012: one AXImage with the alt, no children, the text line after it)
- [x] X0: /Users/pabloantipan/organizer/.wt-notes/oo-build/out/x0-make-test.log, out/x0-pnpm-build.log, out/x0-wails-build.log, out/x0-status.txt (0 bytes), clean clone at 1b13701

## Done
- 2026-10-16 oo-build: FR-1 to FR-6 on lf38-owner-once (52ac8af, 0f141dd, 51ae654, ca257c2, 1b13701), rebased on main; gate met; how to reproduce in /Users/pabloantipan/organizer/.wt-notes/oo-build/progress.md.

## Notes
- A kept draft's `Rule · draft` is wider than the verb column's 72 px floor, so that one row still moves its own age column (the spec lists five verbs).
- The review window's screencapture came back blank; O6 rests on the AX tree.

## Declared changes
- modified `frontend/src/components/Home.tsx:decisionContext`: takes `withOwner`; the others' row passes false (FR-1)
- modified `frontend/src/components/Home.tsx:OthersRow`: context line without the owner (FR-1)
- modified `frontend/src/styles/shell.css`: verb track `minmax(var(--ib-verb-w), auto)`, 72 px, button right-aligned; `.lz.waiting.dashed` deleted (FR-2, FR-3)
- added `frontend/src/components/SpecReader.tsx:Contents`: the Contents list as a component, map entry with a screen-reader-only `, start here` (FR-4)
- modified `frontend/src/components/SpecReader.tsx:SpecReader`: renders `Contents` (FR-4)
- added `frontend/src/lib/diagram.ts:nodeLabels`: node labels by id, glyphs and markup stripped (FR-5)
- added `frontend/src/lib/diagram.ts:classIds`: shared class-line parse
- modified `frontend/src/lib/diagram.ts:changeClasses`: same contract, through classIds
- modified `frontend/src/lib/diagram.ts:classLine`: labels and `Around it` (FR-5)
- added `frontend/src/components/DiagramFigure.tsx:silentSvg`: SVG root aria-hidden, own role and aria names dropped (FR-6)
- modified `frontend/src/components/DiagramFigure.tsx:DiagramView`: image source through silentSvg (FR-6)
- modified `frontend/src/components/Home.waits.test.tsx`: O1
- modified `frontend/src/components/SpecReader.test.tsx`: O4
- modified `frontend/src/lib/diagram.test.ts`: O5, line now with `Around it`
- modified `frontend/src/components/DiagramFigure.test.tsx`: O6, new line and src
Risky:
- `nodeLabels`: a mermaid shape the regex does not know falls back to the id, never a wrong label for an edge
Not changed, on purpose:
- `frontend/src/styles/diagram.css`: outside the boundary; no wrapper around the img, so `.diagram-frame > img` still applies
- `frontend/src/lib/decisions.ts:ownerPhrase`: boundary
