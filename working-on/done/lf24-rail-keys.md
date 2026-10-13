---
title: "The rail costs a few Tab stops, however long"
status: done
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
review: pass
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

## Review
rk-review, 2026-10-13, on f149239 (`git diff main...f149239`; the branch did not move). **Verdict: pass.** Unmet rows: none. Evidence under `.wt-notes/rk-review/`.

- E2: vitest `Rail.keys.test.tsx` (E2) in make test; AX tree of my own `Deltagos Review` (pid saved, fixture, auth off), `ax-tree-full.txt` l.37-46: every active row is one leaf AXButton named `<id>, <client>, rank <n>, <a> now, <b> blocked, <c> next`, zeros said, no count text under it. Met.
- E3: harness (`--links on`) against my own `wails dev` on 34121 from a clean clone, `e3-on.jsonl`: from init-many (last of acme) Tab, Tab, Tab = `Collapse personal`, `Actions for personal`, init-b; the menu's Move up gives PERSONAL, ACME, CCINT and Move down restores it; every head `tabindex=-1`, drag attributes kept, no role. The vitest for Move up/down covers `move` and `groupActionOff`, not the menu wiring; the harness covers that. Met.
- E4: `e4-on.jsonl`: the strip's ranks are one stop (init-a, the rest -1, roles -1); Down, Down, Up = init-many, init-b, init-many; Return opens init-many; the next Tab = `Asleep, 1 initiative`. Met under the reading that "strip" in E4 means the strip's ranks, as it must in "one stop" (the toggle, ALL and the folds are stops too). The folds sit inside `nav.rail.strip`, so read literally the next Tab does not leave the strip; the card's Gate line says "leaves the ranks". The FSE should reword E4.
- E5: `e5-on.jsonl`: Down x9 from init-a = init-c (last initiative), Down = Hephaistos (first role), Up Up/Down hold the walk, Return opens the `Hephaistos` dialog. Rail stops on Home: 8 with 10 initiatives and 4 roles; equality with three more initiatives and two more roles: vitest (E5 ... equal), which the row allows. Met.
- X0: fresh clone at f149239: `XDG_DATA_HOME=$(mktemp -d) test-lease run -- make test` exit 0, 16 go packages ok, 571 vitest passed (`x0-make-test.log`); `test-lease run -- make review-build` ran `wails build` whose frontend:build is `pnpm run build` (Compiling frontend: Done, Built ..., `review-build.log`); `git status --porcelain` empty. Two separate lease runs of `pnpm run build` timed out on memory pressure (exit 75, nothing ran). Met.

Not gated, seen: the Asleep and Archived rows read `init-asleep asleeppersonal` in AX (no FR-6 form, no rank; FR-6 does not say whether they count as rail rows). Boundary: the diff touches only `Rail.tsx`, its two tests and `.rail-*` rules in global.css.

## UI review
rk-ui, 2026-10-13, on f149239 (the branch did not move during the review). **Verdict: pass.** No severity 4 or 3. Evidence under `.wt-notes/rk-ui/`.

How each state was checked:
- E2: AX tree of my own `Deltagos Review` (pid saved, fixture, auth off), `ax-tree-home.txt`; every active row is one AXButton named `<id>, <client>, rank <n>, <a> now, <b> blocked, <c> next`, zeros said, counts hidden; window shot `wk-1440x900-E2-home.png`. Ring on a row: `wk-1440x900-E2-row-ring.png`.
- E3, E4, E5: the builder's steps re-run by me through `scripts/tab-harness/` (`--links on`) against my own `wails dev` on port **34131** (34121 was held by the code reviewer's own app, pid 38142, left alone): `e3-on.jsonl`, `e4-on.jsonl`, `e5-on.jsonl`, all as the card's Gate says. Extra probes in a copy of the harness with `key escape` and a `shot` verb (WKWebView snapshot of its own offscreen view): `u1-*.jsonl`, `u2-1024x640.jsonl`. Escape closes the menu back to the ⋯; Rename puts focus in the field and Escape returns to the ⋯; Remove puts focus on the ⋯ of the group before; Move up on the first group is `aria-disabled` and Return does nothing.
- Vitest `src/components/Rail*`: 5 files, 30 tests pass.

Findings:
- **U1 (2)** A screen-reader user no longer hears that a cell is in definition, that an initiative has live agents or runs on two machines: the row's `aria-label` replaces its content, and FR-6's form has no slot for them. Where: rail, Home, init-define, init-drafted, init-ready (`in definition` drawn, absent from the name), init-a (live dot); `ax-tree-home.txt` l.37-46, `wk-1440x900-E2-home.png`. Evidence: heuristic, WCAG 1.3.1 (a fact shown is a fact said). Proposal: append the row's other drawn facts after the counts, `…, 0 next, cell in definition`, `, 1 live agent`, `, 2 machines`.
- **U2 (2)** Crossing the collapsed strip takes three Tabs, not one: after the rank stop the next Tab lands on `Asleep, 1 initiative` then `Archived, 1 initiative`, still in the strip. Spec E4 expects "the next Tab leaves the strip"; the card's Gate line reads "leaves the ranks". Where: strip, `e4-on.jsonl` next-tab, next-tab-2. Evidence: heuristic, T10. Proposal: keep the folds as stops (they are other targets) and amend E4's words; see A3.
- **U3 (2)** At 1024×640 the group menu of a low head opens past the window's bottom: Move down and Remove are below the edge for the mouse until the rail is scrolled (keyboard focus scrolls them in). Where: rail grouped, `wk-1024x640-E3-menu-last-group.png`, `u2-1024x640.jsonl` (elementFromPoint misses both). Evidence: heuristic, Nielsen 6 / design system (a box fits its view). Proposal: on open, `scrollIntoView({block: "nearest"})` the menu, or open it upward when the room below is shorter.
- **U4 (2)** The rename field has no name; the menu's Rename now leads the keyboard into it, and VoiceOver reads only "acme, edit text". Where: `wk-1440x900-E3-rename-input.png`, `u1-1440x900.jsonl` after-rename (`aria-label` null). Evidence: heuristic, WCAG 4.1.2, 3.3.2. Pre-existing field. Proposal: `aria-label="Rename <group>"`.
- **U5 (2)** In the strip the focus ring is cut on both sides by the 46 px strip; only the top and bottom arcs show. Where: `wk-1024x640-E4-strip-ring.png`. Evidence: heuristic, design system (the ring is for the keyboard), WCAG 2.4.7 still met. Likely pre-existing. Proposal: an inset ring on `.strip-item` (negative `outline-offset`).
- **U6 (1)** `.rail-menu` sets `z-index: 20`, a bare number. Where: `styles/global.css` `.rail-menu`. Evidence: heuristic, design system (layers from z-index tokens). Proposal: `var(--z-raised)`, as `.menu` does.
- **U7 (1)** Move up on the first group (Move down on the last) is dimmed and Return keeps the menu open with nothing said. Evidence: heuristic, design system (disabled reasons). Proposal: as built is acceptable; or leave the item out where it can never act (A4).

Spec gaps (for the FSE):
- FR-6 fixes the row name without the lozenge, live agents or machines (U1).
- FR-6 says "a rail row"; the Asleep and Archived rows still read `init-asleep asleeppersonal` (`ax-tree-home.txt` l.53, 59): not in FR-6's form, and not said whether they are covered.
- E4's "leaves the strip" against the strip's two folds (U2).
- Where the group menu opens near the edge (U3), and the rename field's name (U4).

For aglaea:
- A1 Roles are drawn above the rows but come last in the arrow walk (FR-9 as written): Up from rank 1 does nothing though Hephaistos sits just above, and Down from the last initiative jumps focus to the top of the rail. Walk in drawn order instead?
- A2 E3 makes each shown group's rows one stop, so a grouped rail costs three stops per group (three groups: 14 rail stops, flat: 8). Amendment 1's "3 to 5 stops whatever the number" holds for initiatives and roles, not groups. Accept?
- A3 The strip's Asleep and Archived folds: two stops of their own after the ranks (U2). Keep and reword E4?
- A4 A menu item that can never act where its group stands: dimmed (as built) or left out?

Not verified in WKWebView:
- Mouse drag of a group head with `tabindex="-1"` (no pointer input allowed): judged from the DOM (`data-rfd-drag-handle-*` kept, `e3-on.jsonl`) and vitest.
- The ⋯ shown on hover (no hover by pointer); shown on focus and while open, seen in shots.
- E5 with three more initiatives and two more roles: the builder's vitest only; no overlay built.
- VoiceOver speech: AX names only, not spoken output.
