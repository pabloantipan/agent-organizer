---
title: "The rail costs a few Tab stops, however long"
status: now
repos: [organizer]
branch: lf24-rail-keys
seat: rk-build
stage: one-window
updated: 2026-10-13
next: "review: lf24-rail-keys, gate met (E2, E3, E4, E5, X0), f149239"
depends_on: []
boundary: ["docs/specs/leftovers-24.md Boundary, lf24-rail-keys"]
spec: "docs/specs/leftovers-24.md (FR-6 to FR-9; tab-reaches-links Amendment 1, T8-T11)"
gate: "docs/specs/leftovers-24.md Acceptance, rows E2, E3, E4, E5 and X0"
ui_review: true
---

## Goal
Rows read whole; group heads two stops; the strip and Roles in the roving set (Aglaea, b131393, from sup59's close).

## Gate
docs/specs/leftovers-24.md, rows E2, E3, E4, E5 and X0.
- [x] E2: one name per row in FR-6's form, counts hidden: vitest `Rail.keys.test.tsx` (E2); AX tree of the review build's own pid, `.wt-notes/rk-build/ax-e2.txt`
- [x] E3: two stops between groups, `Collapse <group>` and `Actions for <group>`; the menu's Move up and Move down reorder groups; handle `-1`: harness `.wt-notes/rk-build/e3.txt` → `.wt-notes/rk-build/e3-on.jsonl`; vitest (E3)
- [x] E4: one stop; arrows move; Return opens; the next Tab leaves the ranks: harness `.wt-notes/rk-build/e4.txt` → `.wt-notes/rk-build/e4-on.jsonl`; vitest (E4)
- [x] E5: Down past init-c lands on Hephaistos, Return opens its drawer; rail Tab count equal with three more initiatives and two more roles: harness `.wt-notes/rk-build/e5.txt` → `.wt-notes/rk-build/e5-on.jsonl`; vitest (E5)
- [x] X0: make test (16 go packages ok, 571 vitest), pnpm run build, wails build, porcelain empty, from a clean clone: `.wt-notes/rk-build/x0.log`, `.wt-notes/rk-build/x0-make-test.log`

## Done
- 2026-10-13 rk-build: f149239 on lf24-rail-keys (rebased on main). Rows named whole, group heads two stops with an Actions menu, strip and Roles in the roving walk; how to reproduce in `.wt-notes/rk-build/progress.md`.

## Notes
- E3 needs one Tab stop per shown group's rows (Tab from the last row of one group reaches the next group's first row past its two head stops), so lf22's single stop over all groups is now one per group; the arrows still walk every row across groups. The rail's Tab count grows with groups, not with initiatives or roles.
- Roles come last in the arrow walk though drawn above the rows, as FR-9 says (Down past the last initiative). In the strip, the Tab after the rank stop lands on the Asleep and Archived folds, which are not ranks and stay ordinary stops.
