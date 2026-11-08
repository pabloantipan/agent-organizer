# Leftovers 79: a refused rename shows, says the way out, and is heard every time: the build spec

status: accepted (0192, ruled 2026-11-08)
by: the FSE, 2026-11-08, on main at fa0d4ca0
sources: sup120's UI review of lf78-group-names (#74), notes A1-A3;
Aglaea's `docs/ux/specs/run-report.md` Amendment 13 and the design
system's new entry "Refused field" (fa0d4ca0; AR46-AR48).

## Premises (read 2026-11-08 at fa0d4ca0)

| Premise | Shown by |
|---|---|
| a refused field sets `aria-invalid` but keeps its normal border, and keeps both after the person types again | `frontend/src/components/Rail.tsx:610-626` (`RenameField`); `frontend/src/styles/global.css:192` (`.rail-group-name-input`) |
| the refusal line reads `A group is already called <label>.` and says nothing of the way out | `frontend/src/lib/railGroup.ts:68` (`takenLine`) |
| the line is itself the live region (`role="alert"`) and is `display: none` while empty, so an identical second refusal may not be announced | `Rail.tsx:624`; `global.css:196-197` |

## Requirements

Card `lf79-refused-field` (frontend, ui_review):
- **FR-1 (AR46)** While the field holds the refused text, it carries
  `aria-invalid="true"` and a 2 px `--status-blocked` border; typing any
  change clears both (the line stays until the next Enter or blur).
- **FR-2 (AR47)** The line reads `A group is already called <label>. Type
  another name, or press Escape to keep <current name>.`; Escape restores
  the current name and closes the field.
- **FR-3 (AR48)** The visible line is plain text. The announcement is a
  separate visually hidden live region always in the DOM (never
  `display: none`), emptied and set again 100 ms later on every refusal,
  so an identical refusal is said again.

## Acceptance → gate

UI rows run as leftovers-67 says (review build in the worktree, launched by
its own path after the fixture launcher's exports in the same shell, pid
saved; AX of that pid, or the offscreen harness, saying which); stand-ins
stopped with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before the dir
goes. No row drives Pablo's desktops, focus or input, and no row sends
AXPress to the floating icon.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| V1 | 1 | vitest reading `global.css`: the refused field's rule | 2px border in `--status-blocked` on `[aria-invalid="true"]` (main: none) |
| V2 | 2 | vitest of the line for label `No client`, current name `misc` | the full sentence of FR-2 (main: first sentence only) |
| V3 | 3 | vitest with fake timers of the announcer: two identical refusals | the region text is emptied then set, twice; the region has no `display: none` rule (main: one region, hidden when empty) |
| AR46, AR47, AR48 | 1-3 | review build at 1024x640: rename a group to a taken name, read the field's AX attributes and its border in a shot; type a letter; Escape | as Aglaea's rows |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

`frontend/src/components/Rail.tsx` (`RenameField` and its caller's
refusal state only), `frontend/src/lib/railGroup.ts` (`takenLine`) and its
test, `frontend/src/styles/global.css` (the rename field and line rules
only, tier-2 tokens), a small announcer in `frontend/src/lib/` if one is
needed, and tests asserting the old line (those asserts only).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf79-refused-field` | V1-V3, AR46-AR48, X0 | lf78-group-names (merged #74) | true |
