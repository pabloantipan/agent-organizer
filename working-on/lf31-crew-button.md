---
title: "No button that does nothing; the landed row keeps its ring; focus after a list closes"
status: now
repos: [organizer]
branch: lf31-crew-button
seat: cb-build
stage: one-window
updated: 2026-10-14
next: "review: lf31-crew-button, gate met (B1, B2, B3, B4, X0), e3c470c"
depends_on: []
boundary: ["docs/specs/leftovers-31.md Boundary, lf31-crew-button"]
spec: "docs/specs/leftovers-31.md (FR-1 to FR-4; launch-progress L15-L18)"
gate: "docs/specs/leftovers-31.md Acceptance, rows B1, B2, B3, B4 and X0"
ui_review: true
---

## Goal
No launch button with every seat running; Start says why nothing started; the landed row keeps its ring; focus after a self-closing list goes to the first seat's Attach (launch-progress Amendments 3 and 4).

## Gate
docs/specs/leftovers-31.md, rows B1, B2, B3, B4 and X0.

- [x] B1: margin 8px; ring gap to `.board-wrap` 205/206, 313/98, 407/4 px after landing and two feed updates (Tab harness 1024x640) — /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b1.jsonl
- [x] B2: no launch button with all live, meta `3 live · 0 off`; `Bring 1 up`, `Bring crew up`; grep no match — /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b-vitest.txt, /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b2-grep.txt
- [x] B3: confirm gone, live region `Every seat is already running`, no `.launch-head`, focus first `Attach` — /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b-vitest.txt; live race /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b3-live.jsonl
- [x] B4: `Seat up` closes, focus `Attach fse`; with focus moved to Settings, stays there; Close the list after a failure keeps `Bring 1 up` — /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b4a.jsonl, /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b4b.jsonl, /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b-vitest.txt
- [x] X0: make test (692 vitest + Go), pnpm run build, wails build, porcelain empty, clean clone at e3c470c — /Users/pabloantipan/organizer/.wt-notes/cb-build/out/x0-*.txt

## Done
- 6fe44d1 FR-1 (`landed-held` class while held, scroll-margin in launch.css); e3c470c FR-2 to FR-4 (no launch button with 0 off, `startCrew` reads the race from CreateCrew's empty return, `afterList` focus). Gate met; progress /Users/pabloantipan/organizer/.wt-notes/cb-build/progress.md.

## Notes
- B1's feed updates are the page's own `applyAgents` with fake data (filler seats prepended to init-a's crew), lvw-build's method; steps in /Users/pabloantipan/organizer/.wt-notes/cb-build/steps/b1.txt.
- Vitest has no DOM here: B2-B4's vitest read markup and focus fakes; the harness rows show the real focus. In a stale-feed race focus goes to the first row that has an Attach.
