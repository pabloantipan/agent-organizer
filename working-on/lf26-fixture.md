---
title: "The fixture draws a ruling and a low group"
status: now
repos: [organizer]
branch: lf26-fixture
seat: fx-build
stage: one-window
updated: 2026-10-13
next: "fx-build: F2 waits on sup62 (the lowest group cannot open up while Asleep and Archived trail it); F1 met on 503db90"
depends_on: []
boundary: ["docs/specs/leftovers-26.md Boundary, lf26-fixture"]
spec: "docs/specs/leftovers-26.md (FR-11, FR-12; leftovers-25 Amendment 1)"
gate: "docs/specs/leftovers-26.md Acceptance, rows F1, F2 and X0"
ui_review: false
---

## Goal
The fixture draws a ruling and a low group (Aglaea, 70a43e9, from sup61's close).

## Gate
docs/specs/leftovers-26.md, rows F1, F2 and X0.

## Notes
- F2 (FR-12): Asleep (43 px) and Archived (43 px), laid from testdata/fixture-sleep, always trail the last group, so at 1024x640 with the rail scrolled to its end the lowest group's ⋯ keeps 179 px below it against an 88 px menu; more initiatives or groups above cannot change that. Asked sup62 (options: a --groups fixture without fixture-sleep, amend F2 as leftovers-25 Amendment 1 did R3, or widen the boundary). Geometry: .wt-notes/fx-build/f2-main-geometry.jsonl.
- The mailbox already held a decision (w-queued thread, pablo, 2026-10-05) whose body was a reviewer's pasted JS; the script posts the fixture's ruling into that thread, so it stays one thread.
