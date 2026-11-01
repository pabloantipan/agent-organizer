# Leftovers 60: the floating icon keeps its place on every desktop: the build spec

status: proposed (0172)
by: the FSE, 2026-11-01, on main at 4b0da19
sources: Pablo, 2026-11-01, in the FSE session: "orgqanizer icon along
desktops is failing again, send subagent to diagnose please", then "cut a
fix card"; the read-only diagnosis that day (bitácora c29fd0d).

## Premises (read 2026-11-01)

| Premise | Shown by |
|---|---|
| the window server held the panel on desktop 3 only (CGSCopySpacesForWindows `[3]` while desktop 4 was shown) and off screen there too; no full-screen Space existed | diagnosis, 13:53-13:55, pid 17271 running 7.7 days, about 20 "Display 3 Backstop" windows |
| CanJoinAllSpaces is set once, at creation, and never checked again | `floaticon_darwin.m:1122` |
| the recovery orders the panel front only when it is visible and off screen, and only at the 0.5 s re-read when it was already shown, or at a read-back | `floaticon_darwin.m:603-608`, `:1282`, `:615` |
| nothing listens for a display change | no `NSApplicationDidChangeScreenParametersNotification` in the file |
| the Dock layer-20 window is not the cause: the full-screen test never matches layer 20 | `floaticon_darwin.m:577-581` |
| check hooks exist only with `FLOAT_LOG` (SIGUSR1, SIGUSR2, SIGWINCH `.fs` stand-ins, SIGINFO drops the panel), so a check needs no desktop change | `floaticon_darwin.m:1297-1345`, leftovers-50 |

## Requirements

Card `lf60-icon-spaces` (Objective-C and its Go test):

- **FR-1** Wherever the icon is wanted and the panel is visible, a read
  that finds it not on the active desktop (`isOnActiveSpace` false) or off
  screen sets its collection behaviour again (the one at :1122) and orders
  it front, once for that read, and logs it; the read-back after it only
  logs, so a window server that refuses is no loop.
- **FR-2** That read runs at every desktop change, whether or not the icon
  was shown before it, and after every display change
  (`NSApplicationDidChangeScreenParametersNotification`, after the screens
  settle).
- **FR-3** A check hook, only with `FLOAT_LOG`, stands in for "not on the
  active desktop" for the next read, in the style of the `.fs` stand-in, so
  FR-1 is checked on the current desktop with no desktop change.

## Acceptance → gate

No row changes desktops, moves the pointer or takes focus. Rows that run the
app use the review build with `FLOAT_LOG` and the fixture home, launched and
killed by the seat's saved pid.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| I1 | 1, 3 | review build, icon shown (`FLOAT_SHOW_ICON`); the FR-3 stand-in, then the hook that triggers a read | the log reads the stand-in, "not on the active desktop: collection behaviour set again, ordered front", then a read-back on screen; the behaviour read back holds CanJoinAllSpaces |
| I2 | 1 | the same with SIGINFO (dropped panel), at a read that follows no shown state | ordered front again |
| I3 | 2 | go test over the source, in the style of `TestSpaceChangeReread`: the desktop-change read calls the recovery without the `was` guard, and the screen-parameters observer calls it | pass |
| I4 | 3 | `TestCheckHooksOnlyWithLog` extended to the new hook; run without `FLOAT_LOG` | the hook sits in the `logFile` branch; none without it |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `wails build`, `make review-build` in the worktree, then `git status --porcelain` | pass, empty |

After the merge and `make install`, Pablo's own use across desktops is the
real check (not a gate row).

## Boundary

`floaticon_darwin.m`, `floaticon_darwin.h`, `floaticon_darwin_test.go`.
Not `floaticon_darwin.go` unless a hook needs a Go line, then that one.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf60-icon-spaces` | I1-I4, X0 | — | false |

## Amendment 1 (2026-11-01, the FSE, on l60-icon-rev's finding at aa63f8d)

The premise "nothing listens for a display change" was wrong: an observer
already sits near `floaticon_darwin.m:1287`. FR-2 holds as built: the
display change now runs the same recovery read. Kept here, not deleted, so
the next spec does not repeat it.
