# Leftovers 81: collapsing closes the rename, the head's tools sit at the top, long names are cut in the line: the build spec

status: accepted (0194, ruled 2026-11-08)
by: the FSE, 2026-11-08, on main at 8cb87888
sources: sup122's closing on lf80-refusal-close (#78): U1 (sev 2, a gap in
leftovers-80 FR-1, which named Escape, save and blur but not the rail
collapsing), Q2/U2, Q3; Aglaea's `docs/ux/specs/run-report.md` Amendment
15 (8cb87888; AR51-AR53): collapsing closes the rename as Escape does (old
name kept, announcer emptied, focus on the rail toggle); the head's items
top-aligned; the sentence is never cut, the names quoted in it are cut on
screen at about 24 characters with an ellipsis and said whole.

## Premises (read 2026-11-08 at 8cb87888)

| Premise | Shown by |
|---|---|
| collapsing the rail with the rename field open does not close the rename: the strip's announcer keeps the refusal | `frontend/src/components/Rail.tsx:354-361` (the collapsed strip, `setRailCollapsed`), `:404` (`rail-said`); sup122 U1 |
| the group head centres its items, so its tools sit mid-way down a three-line field | `frontend/src/styles/global.css:174` (`.rail-group-head`, `align-items: center`) |
| the refusal line quotes both names whole, one string for screen and announcement | `frontend/src/lib/railGroup.ts:69-70` (`takenLine`) |

## Requirements

Card `lf81-rename-edges` (frontend, ui_review):
- **FR-1 (AR51)** Collapsing the rail while the rename field is open closes
  the rename as Escape does: the old name kept, the line and the announcer
  emptied, focus on the rail toggle.
- **FR-2 (AR52)** `.rail-group-head` aligns its items to the top.
- **FR-3 (AR53)** The visible line quotes each name cut at 24 characters
  with `…` when longer; the announcement quotes them whole. The sentence's
  own words are never cut.

## Acceptance → gate

UI rows run as leftovers-67 says (review build in the worktree, launched by
its own path after the fixture launcher's exports in the same shell, pid
saved; AX of that pid, or the offscreen harness, saying which); stand-ins
stopped with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before the dir
goes. No row drives Pablo's desktops, focus or input, and no row sends
AXPress to the floating icon. There is no DOM test library.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| V1 | 1 | vitest of the close path the collapse takes (the hook or a pure helper): a refusal, then collapse | the refusal and the announcer empty, the stored name unchanged (main: the announcer keeps it) |
| V2 | 2 | vitest reading `global.css`: `.rail-group-head` | `align-items: flex-start` (main: center) |
| V3 | 3 | vitest of the line and the announcement for a 60-character current name and a 30-character label | screen: both names cut at 24 with `…`, the rest of the sentence whole; announcement: both whole |
| AR51, AR52, AR53 | 1-3 | review build at 1024x640: a refusal, then the rail collapsed by the app's own control through AX; a three-line refused field's AX frames (tools vs field); a 60-character group name refused | as Aglaea's rows |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

`frontend/src/components/Rail.tsx` (the rename close paths, the collapse
and the announcer only), `frontend/src/lib/railGroup.ts` (`takenLine`) and
`liveRegion.ts`, and their tests; `frontend/src/styles/global.css`
(`.rail-group-head` only); tests asserting the old behaviour (those
asserts only).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf81-rename-edges` | V1-V3, AR51-AR53, X0 | lf80-refusal-close (merged #78) | true |
