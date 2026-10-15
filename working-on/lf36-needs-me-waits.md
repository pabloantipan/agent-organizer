---
title: "Needs me says how long a record has waited; others' long waits get their own group"
status: now
repos: [organizer]
branch: lf36-needs-me-waits
seat: nw-build
stage: decisions-owned-and-used
updated: 2026-10-15
next: "nw-build building on branch lf36-needs-me-waits (sup73, launched 20:33)"
depends_on: []
boundary: ["docs/specs/leftovers-36.md Boundary, lf36-needs-me-waits"]
spec: "docs/specs/leftovers-36.md (FR-1 to FR-5; needs-me-waits W1-W6)"
gate: "docs/specs/leftovers-36.md Acceptance, rows N1, N2, N3, N4, N5, N6 and X0"
ui_review: true
---

## Goal
A record waiting a week or more says so first on its Needs me row, and someone else's long wait shows apart under Waiting on others with Open (0134, exit 2 of decisions-owned-and-used).

## Gate
docs/specs/leftovers-36.md, rows N1, N2, N3, N4, N5, N6 and X0.

- [x] N1: .wt-notes/nw-build/out/vitest-n1-n6.txt
- [x] N2: .wt-notes/nw-build/out/vitest-n1-n6.txt
- [x] N3: .wt-notes/nw-build/out/vitest-n1-n6.txt
- [x] N4: .wt-notes/nw-build/out/n4n5.jsonl, out/n4-home.png (heading reads · 2, see Notes)
- [x] N5: .wt-notes/nw-build/out/n4n5.jsonl, out/n5-decisions.png
- [x] N6: .wt-notes/nw-build/out/vitest-n1-n6.txt
- [x] X0: .wt-notes/nw-build/out/x0-make-test.log, x0-pnpm-build.log, x0-wails-build.log, x0-status.txt (empty)

## Done
- 2026-10-15: nw-build built it on lf36-needs-me-waits (5bc6a1e queue, 8249815 Home); gate met, unmerged, rebased on main.

## Notes
- 2026-10-15: run by sup73 (organizer-probe-sup73), spawned by the FSE.
- 2026-10-15: N4 reads `Waiting on others · 2`, not · 1: the overlay's init-a 0005 (alejandro, 18 d) is the record N4 asks for, so none was added, and the default fixture's init-many 0075 (ana, 14 d, testdata/fixture-many) also qualifies by FR-3. Asked sup73.
