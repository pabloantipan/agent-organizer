---
title: "The fixture draws a ruling and a low group"
status: now
repos: [organizer]
branch: lf26-fixture
seat: fx-build
stage: one-window
updated: 2026-10-14
next: "review: lf26-fixture, gate met (F1, F2, X0), 5b87b66"
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

- [x] F1 (11): one decision thread after two runs, F5 `Open the thread …` in Solved — .wt-notes/fx-build/f1-after-run1.jsonl, f1-after-run2.jsonl, f1-ax.txt
- [x] F2 (12, Amendment 2): review build, `--groups`, 1024x640, rail at its end: ccint menu 449-537 above its ⋯ 539-563, inside the window — .wt-notes/fx-build/f2-review-ax.txt, f2-review.png
- [x] X0 (all): clean clone of 5b87b66, make test, pnpm run build, wails build pass, status empty — .wt-notes/fx-build/x0-rc.txt, x0-status.txt

## Done
- 2026-10-14 fx-build: the fixture leaves one solved thread with pablo's ruling (b48ccc3) and `--groups` lays a home whose last group ends the rail (5b87b66); F1, F2, X0 met, rebased on main.

## Notes
- F2 (FR-12): Asleep (43 px) and Archived (43 px), laid from testdata/fixture-sleep, always trail the last group, so at 1024x640 with the rail scrolled to its end the lowest group's ⋯ keeps 179 px below it against an 88 px menu; more initiatives or groups above cannot change that. Asked sup62 (options: a --groups fixture without fixture-sleep, amend F2 as leftovers-25 Amendment 1 did R3, or widen the boundary). Geometry: .wt-notes/fx-build/f2-main-geometry.jsonl.
- The mailbox already held a decision (w-queued thread, pablo, 2026-10-05) whose body was a reviewer's pasted JS; the script posts the fixture's ruling into that thread, so it stays one thread.
