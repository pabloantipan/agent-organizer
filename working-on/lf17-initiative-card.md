---
title: "An Initiatives card opens its initiative and shows its details in place"
status: now
repos: [organizer]
branch: lf17-initiative-card
seat: ic-build
stage: one-window
updated: 2026-10-10
next: "review: lf17-initiative-card, gate met (C1, C2, X0), 870e0ad"
depends_on: []
boundary: ["InitiativesView.tsx and css", "a Charter component extracted from InitiativeHeader.tsx", "their tests", "not: lib/initiatives.ts, Rail.tsx, Initiatives.tsx"]
spec: "docs/specs/leftovers-17.md (FR-1, FR-2; docs/ux/specs/initiatives-view.md Amendment 2, I17-I18)"
gate: "docs/specs/leftovers-17.md Acceptance, rows C1, C2 and X0"
ui_review: true
---

## Goal
Pablo, 2026-10-10: "On clicking the card I should be able to go to the initiative. Also, getting details of the project."

## Gate
docs/specs/leftovers-17.md, rows C1, C2 and X0.

- [x] C1: vitest `frontend/src/components/InitiativesView.test.tsx` (C1 block); review build AX: `.wt-notes/ic-build/c1-ax-initiatives-1440.txt`, `c1-ax-after-press-awake.txt`, `c1-ax-after-press-asleep.txt`
- [x] C2: vitest (C2 block); review build: `.wt-notes/ic-build/c2-card-details-1440.png`, `c2-card-details-1024.png`, `c2-ax-card-details-1024.txt`, `c2-ax-asleep-details.txt`, `c2-ax-header-details.txt`
- [x] X0: `.wt-notes/ic-build/x0-make-test.log`, `x0-npm-build.log`, `x0-wails-build.log` (clean clone of 870e0ad, all pass)

## Done
- 2026-10-10 ic-build: Charter extracted and shared by header and card; card body opens on Overview, one `Open <id>` link; Details in place with Charter and Workspace; gate met (21a9d17, 16c0a70, 39abaa4, 870e0ad).

## Notes
- A card not awake hides InitiativeDetail's "Review with agent" (0042) by a css rule in initiatives.css, since Initiatives.tsx was outside the boundary; a `readOnly` prop there would be cleaner.
- The header's Details gained Measure/Target/Stage lines from the shared Charter; the Stage line repeats the strip below it.
