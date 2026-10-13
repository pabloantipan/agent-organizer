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
review: pass
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

## Review
Verdict: pass. R1, R2, R3, R4 and X0 met on 48914c1, all run from a fresh clone at that SHA (removed after), fixture, auth off.
- R1: vitest `Rail.lf25.test.tsx` R1 passes (cell in definition, 1 and 2 live agents, 2 machines, in that order; nothing that is not drawn; the strip gets the same name). AX on my own review build: `init-define … 0 next, cell in definition`, `init-a … 31 live agents`, plain rows unchanged (/Users/pabloantipan/organizer/.wt-notes/rl-review/ax-tree.txt:42-61). The fixture has no initiative on two machines, so `2 machines` is vitest only.
- R2: harness on my own wails dev (34120), 1440x900: rank 1 init-a, Up → `Daedalus` (last of four roles); last initiative init-c, Down → init-c (/Users/pabloantipan/organizer/.wt-notes/rl-review/r2.jsonl).
- R3: vitest R3 passes (first group: no Move up; last: no Move down; `menuPlace` both ways). Harness 1024x640, grouped by client: lowest group ccint as drawn (⋯ 437-461) opens down, menu 463-551, inside; scrolled so that ⋯ sits at the window's bottom (616-640) it opens up, menu 526-614, above the ⋯, inside 1024x640; items `Rename, Move up, Remove`, first group `Rename, Move down, Remove` (/Users/pabloantipan/organizer/.wt-notes/rl-review/r3.jsonl). The row expects "above the ⋯" for the lowest group, but as drawn on the fixture that group has 177 px below it, so FR-8 rightly opens it down; "above" needs the scroll. The row's premise does not hold on the fixture; FR-8 holds in both cases. Reported to sup61.
- R4: vitest R4 passes; AX of my own build: AXPress `Actions for acme`, then `Rename` → `AXTextField t="Rename acme"` (/Users/pabloantipan/organizer/.wt-notes/rl-review/ax-rename.txt:39).
- X0: `XDG_DATA_HOME=$(mktemp -d) make test` rc 0 (Go ok, vitest 592/592), `pnpm run build` rc 0, `wails build` rc 0, `git status --porcelain` empty (/Users/pabloantipan/organizer/.wt-notes/rl-review/x0-*.log).
Unmet: none. UI review: missing, so status and place stay as they are.
Reviewer rl-review, 2026-10-13, commit 48914c1a978b296767fb99a44f9cb9de04109ccf.
