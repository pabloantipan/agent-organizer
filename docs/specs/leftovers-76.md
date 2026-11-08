# Leftovers 76: the organizer's map regenerated with the grounded stamp: the build spec

status: accepted (0189, ruled 2026-11-08)
by: the FSE, 2026-11-08, on main
sources: Hephaistos, for pablo, 2026-11-08 (thread 01M6WX093SPZHZXG4Z3N4HBHQE):
c4-map-stamp-grounded merged (claudecode a5778f3, ~/claudecode at 95ef5b8);
a self repo's stamp follows only what the map grounds, so working-on and
merge commits no longer stale it; organizer's origin/main reads 1 stale,
really (containers changed after 784a1f3); "please cut the held regen".
Folds the findings of sup110's threads (C1 stamp, C2 diagram-check L1/L3,
C3 repo named from its upstream), all in the same factory card.

## Premises (read 2026-11-08)

| Premise | Shown by |
|---|---|
| `c4-map check .` at the root reports the map stale | `c4-map check .` (2026-11-08) |
| `~/bin/c4-map` and its repos adapter are symlinks into ~/claudecode, so the fix is live | Hephaistos, correction in the same thread |
| the last regen was lf66-map (#47 83056a1), stamped `agent-organizer@784a1f3` | `working-on/done/lf66-map.md` |

## Requirements

Card `lf76-map-regen` (docs only):
- **FR-1** `c4-map gen .` regenerates the map's folder at
  the root, committed alone, and `c4-map check .` is clean
  on that commit and stays clean on the merge commit.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| C1 | 1 | `c4-map gen .` then `c4-map check .` at the root, on the map-only commit | exit 0 both (main: check reports stale) |
| C2 | 1 | `diagram-check` over the map's folder | exit 0, no `ungrounded:` line |
| C3 | 1 | `mermaid2svg <copy> --check` on byte-identical copies of each page (leftovers-63 Amendment 1) | exit 0 |
| X0 | all | `git status --porcelain` outside the map's folder | empty |

## Boundary

`docs/architecture/` only.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf76-map-regen` | C1-C3, X0 | — | false |
