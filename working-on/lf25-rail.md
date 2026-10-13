---
title: "The rail reads whole and walks as drawn"
status: now
repos: [organizer]
branch: lf25-rail
seat: rl-build
stage: one-window
updated: 2026-10-13
next: "review: lf25-rail, gate met (R1 R2 R3 R4 X0), 48914c1"
depends_on: []
boundary: ["docs/specs/leftovers-25.md Boundary, lf25-rail"]
spec: "docs/specs/leftovers-25.md (FR-6 to FR-9; tab-reaches-links Amendment 2, T13, T15-T17)"
gate: "docs/specs/leftovers-25.md Acceptance, rows R1, R2, R3, R4 and X0"
ui_review: true
---

## Goal
The rail reads whole and walks as drawn (Aglaea, a5c30ed, from sup60's close).

## Gate
docs/specs/leftovers-25.md, rows R1, R2, R3, R4 and X0.
- [x] R1: vitest Rail.lf25.test.tsx; AX /Users/pabloantipan/organizer/.wt-notes/rl-build/ax-tree.txt (2 machines vitest only: no fixture initiative on two machines)
- [x] R2: harness /Users/pabloantipan/organizer/.wt-notes/rl-build/r2.jsonl (steps r2.txt)
- [x] R3: vitest Rail.lf25.test.tsx; harness 1024x640 /Users/pabloantipan/organizer/.wt-notes/rl-build/r3.jsonl (steps r3.txt)
- [x] R4: vitest Rail.lf25.test.tsx; AX /Users/pabloantipan/organizer/.wt-notes/rl-build/ax-rename.txt:40
- [x] X0: /Users/pabloantipan/organizer/.wt-notes/rl-build/x0-make-test.log, /Users/pabloantipan/organizer/.wt-notes/rl-build/x0-build.log (clean clone, porcelain empty)

## Done
- rl-build built FR-6 to FR-9 on lf25-rail (48914c1); gate met; progress in /Users/pabloantipan/organizer/.wt-notes/rl-build/progress.md.

## Notes
- At 1024x640 the fixture's lowest group sits mid-rail (folds below), so its menu opens down; the upward case was proved with the ⋯ scrolled to the rail's bottom edge.
