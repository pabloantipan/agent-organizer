# Leftovers 50: the floating icon comes back after a desktop change: the build spec

status: ruled (0158, pablo 2026-10-24)
by: the FSE, 2026-10-24, on main at 7248ebd
sources: Pablo, 2026-10-24 in the FSE session: "Deltagos icon at desktop is not
working properly ... When I move between desktops, icon got broken and I se
none"; a read-only diagnosis subagent the same day (the panel listed by the
window server with onscreen 0 on a normal desktop away from the main
window); `docs/specs/floating-icon-spike.md:84-93, 254-262` (the mid-slide
misfire and its unbuilt re-read); `working-on/done/floating-icon-3.md`
Notes (fi3-build saw "icon shown" while the panel stayed off screen).

## Premises (read 2026-10-24 at 7248ebd)

| Premise | Shown by |
|---|---|
| the full-screen test reads the window list only on a desktop-change notification; every other update keeps a hidden icon hidden, so one wrong read hides it until the next change | `floaticon_darwin.m:550-577` (`fullScreenSpace`), `:610-636` (`update`, "keep it hidden where it was hidden"), `:1241-1242` (the observer) |
| mid-slide the window list holds both desktops' windows, so a normal desktop can read as full screen; the spike proposed a later re-read, never built | `docs/specs/floating-icon-spike.md:84-93, 254-262`; no `after(` around `update(@"space-change"` |
| `shown` is `[panel isVisible]`; when the window server keeps the panel off screen while AppKit calls it visible, every change says "stays" and nothing orders it in again; the 0.3 s read-back only logs | `floaticon_darwin.m:582-585, 631-633`; floating-icon-3 Notes |
| with `FLOAT_LOG` set the app already has check hooks (SIGUSR1 screens, SIGUSR2 double-click, `FLOAT_SHOW_ICON`), so a check needs no desktop change | `floaticon_darwin.m:1251-1288` |
| the bundle, its icon files and the Dock tile are not involved | the diagnosis: plist = `build/darwin/Info.plist:20-23`, Assets.car and icns identical to `build/darwin`; no dock tile code |

## Requirements

Card `lf50-float-space` (Objective-C, one card):

- **FR-1** After a desktop-change notification, the full-screen test is read
  again once, 0.5 s later, and `update` acts on that later read: a normal
  desktop read as full screen mid-slide shows the icon after the second
  read. A later read that still says full screen keeps it hidden.
- **FR-2** Whenever the icon is wanted and `[panel isVisible]` is true but
  the window server does not show it (`occlusionState` without
  `NSWindowOcclusionStateVisible`, read at the 0.3 s read-back and at the
  FR-1 re-read), the panel is ordered front again, once per read, and the
  log says so.
- **FR-3** A check hook, only with `FLOAT_LOG` set, in the style of the
  existing ones: it posts the desktop-change path with a stand-in
  full-screen reading taken from `<FLOAT_LOG>.fs` (one value per read,
  `1` or `0`, in order), and another stand-in orders the panel out
  behind the code's back (AppKit's state left as shown) to stand for the
  window server dropping it. Normal runs read the real window list and
  have no hook.

## Acceptance → gate

No row moves between desktops, switches Spaces or drives Pablo's input: every
row runs the review build with `FLOAT_LOG` and the fixture home, on the
desktop the seat already has, and reads the float log.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| S1 | 1, 3 | the review build away from home (`FLOAT_SHOW_ICON` path or compact), `.fs` = `1` then `0`, the desktop-change hook | the log shows `fs=1 icon hidden`, then within 1 s `fs=0 icon shown`; `screencapture -l <panel window>` shows the tile |
| S2 | 1, 3 | `.fs` = `1` then `1` | hidden after both reads, no `shown` line |
| S3 | 2, 3 | icon shown, the drop stand-in, then the desktop-change hook with `.fs` = `0` | the log names the panel off screen and ordered front again; the next read-back says `on screen=1` |
| S4 | 3 | grep the source and run without `FLOAT_LOG` | the hooks sit inside the `logFile` branch; no `.fs` read and no hook without it |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `wails build`, `make review-build` in the worktree, then `git status --porcelain` | pass, empty |

## Boundary

`floaticon_darwin.m`, `floaticon_darwin.h`, `floaticon_darwin.go` and
`floaticon_darwin_test.go`; `scripts/floating-icon-by-hand.sh` if a step
for the new hook belongs there. Not `docs/ux/specs/floating-icon.md`.

## Not in this card

- The LaunchServices clutter the diagnosis found (209 registrations of
  `cl.antipan.organizer`, 156 of `.review`, most of them paths gone from
  `.wt-notes/`, scratchpads and `/private/tmp`). It does not explain a
  vanishing floating icon; clearing it touches Pablo's Dock and is his
  one-off step. Held for a card that unregisters review builds when their
  worktree goes.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf50-float-space` | S1-S4, X0 | — | false |

## Amendment 1 (FSE, 2026-10-24): what the drop stand-in does

From sup89's closing report (finding 1). FR-3's "orders the panel out behind
the code's back (AppKit's state left as shown)" cannot be done with public
API: ordering the panel out clears `isVisible`. As built, the stand-in hides
the panel at the window server (an opaque cover over it), which reaches
FR-2's state (`isVisible` true, not on screen) though not by a real
window-server drop. FR-3 reads: "another stand-in hides the panel at the
window server while AppKit still calls it shown". The hooks also answer
SIGWINCH and SIGINFO, so in a `FLOAT_LOG` build a terminal resize or Ctrl-T
fires them (finding 5); normal runs have no hook.
