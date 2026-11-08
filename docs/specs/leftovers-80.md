# Leftovers 80: no stale refusal is heard, and the refusal line reads whole: the build spec

status: proposed (0193)
by: the FSE, 2026-11-08, on main at 766ef7aa
sources: sup121's UI review of lf79-refused-field (#76), U1 and Q2;
Aglaea's `docs/ux/specs/run-report.md` Amendment 14 (66315c51; AR49,
AR50): the announcer is emptied when the rename field closes (Escape,
save, focus leaving); the line wraps as prose to three lines at 180 px,
pushes the groups below down, is never clipped or drawn over a row, and
goes when the field closes.

## Premises (read 2026-11-08 at 766ef7aa)

| Premise | Shown by |
|---|---|
| the announcer (`said`, from `useLiveRegion`) keeps the refusal sentence after the field closes: closing clears `refused`, not `said` | `frontend/src/components/Rail.tsx:41-46` (`refused`, `useLiveRegion`), `:356`, `:404` (`rail-said`); `frontend/src/lib/liveRegion.ts:47` |
| the line and its wrapper already allow wrapping (`white-space: normal`, 180 px); whether the next group header starts below its last line is unchecked | `frontend/src/styles/global.css:199-201` |

## Requirements

Card `lf80-refusal-close` (frontend, ui_review):
- **FR-1 (AR49)** Closing the rename field by Escape, by saving or by
  focus leaving empties the announcer as well as the line.
- **FR-2 (AR50)** The line wraps as prose at 180 px; the group header
  after it starts below its last line (no clip, no overlap, no fixed
  height); closing the field removes it and the rows return.

## Acceptance → gate

UI rows run as leftovers-67 says (review build in the worktree, launched by
its own path after the fixture launcher's exports in the same shell, pid
saved; AX of that pid, or the offscreen harness, saying which); stand-ins
stopped with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before the dir
goes. No row drives Pablo's desktops, focus or input, and no row sends
AXPress to the floating icon. There is no DOM test library: FR-1's vitest
runs over the hook or a pure close helper, not a rendered field.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| V1 | 1 | vitest with fake timers over the live region hook (or the close helper it gets): say a refusal, then close | the region text is empty after close (main: the sentence stays) |
| V2 | 2 | vitest reading `global.css`: the rename wrapper and line rules | no `white-space: nowrap`, no `overflow: hidden`, no fixed `height` on either |
| AR49, AR50 | 1, 2 | review build at 1024x640: a refusal, read the announcer by AX, Escape, read it again; the AX frames of the line and of the next group header while refused, then after Escape | empty after Escape; the header's top at or below the line's bottom; rows back after |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

`frontend/src/components/Rail.tsx` (the rename close paths and the
announcer only), `frontend/src/lib/liveRegion.ts` and its test,
`frontend/src/styles/global.css` (the rename wrapper and line rules only),
and tests asserting the old behaviour (those asserts only).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf80-refusal-close` | V1, V2, AR49, AR50, X0 | lf79-refused-field (merged #76) | true |
