---
title: "The card's id raises it; the header's Details keeps one label"
status: now
repos: [organizer]
branch: lf19-card-details
seat: cd-build
stage: one-window
updated: 2026-10-11
next: "review: lf19-card-details, gate met (C1, C2, X0), 023cb1e"
depends_on: []
boundary: ["docs/specs/leftovers-19.md Boundary, lf19-card-details"]
spec: "docs/specs/leftovers-19.md (FR-7, FR-8; initiatives-view Amendment 4, I33-I34)"
gate: "docs/specs/leftovers-19.md Acceptance, rows C1, C2 and X0"
ui_review: true
---

## Goal
lf18-charter-once's UI review U1-U2 (Aglaea, e93a3ef).

## Gate
docs/specs/leftovers-19.md, rows C1, C2 and X0.

- [x] C1: vitest `CardDetails.test.tsx`; Chromium computed style `.wt-notes/cd-build/c1-c2-chromium-1024x640.json` (hover in the review process needs the real pointer, 0108)
- [x] C2: vitest `CardDetails.test.tsx`; review-app AX frames `.wt-notes/cd-build/ax-C2-{1-open,2-closed,3-open}.txt` (76x24 each)
- [x] X0: `.wt-notes/cd-build/x0-rc.txt`, `x0-porcelain.txt` (clean clone of 023cb1e)

## Done
- 2026-10-11 cd-build: the id link raises the card; the header's Details reads `Details` both ways with a swapped chevron and one height (023cb1e, progress in `.wt-notes/cd-build/progress.md`).

## Notes
- The header chevron swaps instead of rotating: WebKit's AX frame of the rotated svg read 33 px tall against 24 drawn. shell.css's rotate rules are now dead (pl-build's file this wave).
