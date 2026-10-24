---
title: "The floating icon comes back after a desktop change: a second full-screen read, and the panel ordered in again when the window server dropped it"
status: done
repos: [organizer]
branch: lf50-float-space
seat: f50-build
reviewer: f50-review
stage: review-map
updated: 2026-10-24
next: "merge lf50-float-space (b2b291a), reviewed pass by f50-review"
review: pass
depends_on: []
boundary: ["docs/specs/leftovers-50.md Boundary"]
spec: "docs/specs/leftovers-50.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-50.md#Acceptance → gate"
ui_review: false
---

## Goal
Moving between desktops never leaves Pablo without the floating icon where it should be.

## Gate
docs/specs/leftovers-50.md, rows S1-S4 and X0; no row moves between desktops.

## Done
- f50-build, 2026-10-24: FR-1 to FR-3 on `lf50-float-space` (c0ea9c4, b2b291a), rebased on main at 2cf4882; code identical to the gated baadff1; S1-S4 and X0 pass, evidence and commands in `.wt-notes/f50-build/progress.md`.

## Declared changes
- modified `floaticon_darwin.m:fullScreenSpace`: takes a stand-in reading from the hook's `.fs` queue when one is waiting (FR-3)
- added `floaticon_darwin.m:onScreen`, `floaticon_darwin.m:readBack`: the window server's word on the panel, shared by the read-backs
- added `floaticon_darwin.m:orderInIfDropped`: a wanted panel visible to AppKit but off screen is ordered front again, once per read (FR-2)
- modified `floaticon_darwin.m:showIcon`: the 0.3 s read-back also runs `orderInIfDropped` (FR-2)
- modified `floaticon_darwin.m:FloatIconStart`: the desktop-change observer re-reads 0.5 s later, latest change wins (FR-1); with FLOAT_LOG, SIGWINCH (desktop change with `.fs` stand-ins), SIGINFO (drop stand-in) and FLOAT_COMPACT=1 (compact at start) (FR-3)
- modified `floaticon_darwin_test.go`: `TestSpaceChangeReread`, `TestCheckHooksOnlyWithLog` (S4)
Risky:
- `orderInIfDropped`: a panel fully covered by another app's floating-level window reads off screen and is ordered above it, once per read
- the drop stand-in covers the panel instead of ordering it out: no public call orders a window out and leaves `isVisible` at 1 (progress.md, Choices)
Not changed, on purpose:
- `update`: its decision is unchanged; the re-read is a second call to it
- `scripts/floating-icon-by-hand.sh`: Pablo's optional look with real desktop moves; no step for a check hook belongs there

## Notes
- f50-build: FR-3's "orders the panel out behind the code's back" is done as a cover: an opaque window of the panel's level and frame above it gives isVisible=1, on screen=0, and orderFrontRegardless is what puts the panel back (S3 region shots). Tried and not usable: orderOut plus KVC visible=YES (back on screen), alpha 0 (still on screen), a level below the desktop (orderFront does not undo it).
- f50-build: with FLOAT_SHOW_ICON=1 the state stays home with the main window here, so update hides the icon whatever fs reads; the rows use FLOAT_COMPACT=1.

## Review
**Verdict: pass** at b2b291a (the branch did not move during the review). Unmet gate items: none.

### change-check (clean clone at b2b291a)
```
change-check: working-on/lf50-float-space.md
risk: medium (missing, read as medium)
repo organizer: base 0c733bf1d (default origin/main) ... head lf50-float-space (clone HEAD b2b291a6a, on detached) b2b291a6a; 2 files, 2 flags; read in /Users/pabloantipan/organizer/.wt-notes/f50-review/clean

## Changed

- organizer/floaticon_darwin.m (modified)
- organizer/floaticon_darwin_test.go (modified, test)

## Tests touched

- organizer/floaticon_darwin_test.go

## Risky (declared)

- `orderInIfDropped`: a panel fully covered by another app's floating-level window reads off screen and is ordered above it, once per read
- the drop stand-in covers the panel instead of ordering it out: no public call orders a window out and leaves `isVisible` at 1 (progress.md, Choices)

## Not changed, on purpose (declared)

- `update`: its decision is unchanged; the re-read is a second call to it
- `scripts/floating-icon-by-hand.sh`: Pablo's optional look with real desktop moves; no step for a check hook belongs there

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| outside boundary | organizer/floaticon_darwin.m |  | modified |
| undeclared | organizer/floaticon_darwin.m |  | modified |
| declared, not changed |  | floaticon_darwin.m:fullScreenSpace | no matching change |
| declared, not changed |  | floaticon_darwin.m:onScreen | no matching change |
| declared, not changed |  | floaticon_darwin.m:orderInIfDropped | no matching change |
| declared, not changed |  | floaticon_darwin.m:showIcon | no matching change |
| declared, not changed |  | floaticon_darwin.m:FloatIconStart | no matching change |

7 flags: outside boundary 1, outside footprint 0, undeclared 1, declared, not changed 5, new env var 0, new dependency 0, new host 0, risk 0, untested? 0, could not read 0, boundary unreadable 0
```
Explained, none a finding:
- `outside boundary` floaticon_darwin.m: the spec's Boundary names it first. change-check reads the section, but gate-check's `path_like` returns False for `.m` and `.h` (checked: `floaticon_darwin.m False`, `floaticon_darwin.h False`, `.go True`), so it drops those two entries. This is a tool gap.
- `undeclared` floaticon_darwin.m and the 5 `declared, not changed` lines (fullScreenSpace, onScreen, orderInIfDropped, showIcon, FloatIconStart): change-check extracts no symbols from Objective-C (`"symbols": []` for the .m in `--json`), so the file reads as undeclared and every declared symbol as unmatched. The diff shows each declared change: the stand-in branch in `fullScreenSpace`, new `onScreen`/`readBack`/`orderInIfDropped`, `showIcon`'s read-back, and the observer plus the hooks in `FloatIconStart`. Note, to the FSE: change-check/gate-check need `.m`/`.h` as paths and an ObjC symbol reader.

### Rows
Review build from the clean clone, fixture home (discuss_state_dir under the fixture's temp dir, checked by the runner), FLOAT_COMPACT=1, runner `/Users/pabloantipan/organizer/.wt-notes/f50-review/row.sh`. Each app pid was saved and killed by that pid, along with the fixture's own stand-ins.
- **S1 met.** `float-s1.log`: `625.282 space-change: state=compacted here=0 fs=1 icon hidden`, then `625.805 space-change re-read: state=compacted here=0 fs=0 icon shown` (0.52 s), `626.119 icon read back: isVisible=1 on screen=1`. `screencapture -l 55229` (the panel window number from the log): `/Users/pabloantipan/organizer/.wt-notes/f50-review/s1-panel.png` shows the tile.
- **S2 met.** `float-s2.log`: `fs=1 icon hidden`, then `space-change re-read: ... fs=1 icon stays hidden`. No `shown` line after the hook.
- **S3 met**, with `.fs` = `0` as written (the re-read then reads the real window list, fs=0). `float-s3.log`: `SIGINFO: the panel dropped at the window server: isVisible=1 on screen=0`; `space-change: ... fs=0 icon stays`; `space-change re-read: ... icon stays`; `re-read: icon wanted, isVisible=1 but off screen (occlusion 8192): ordered front again`; `icon read back: isVisible=1 on screen=1`. Region shots at the tile: `/Users/pabloantipan/organizer/.wt-notes/f50-review/s3-shown.png` (tile), `s3-dropped.png` (black, mean 0), `s3-front.png` (tile, taken while the cover was still up).
- **S4 met.** grep: the `SIGWINCH`/`SIGINFO` sources and the only assignment of `fsStandIn` (in the `.fs` read) sit inside `if (logFile) {` (floaticon_darwin.m:1295-1362). `fullScreenSpace` reads `fsStandIn` only when it is non-empty. `logPath` is set only from the log argument (:1245). `FLOAT_COMPACT` is read after the block but guarded `if (logFile && compact ...)`, the same pattern as the existing `FLOAT_SHOW_ICON`. `go test -run 'TestCheckHooksOnlyWithLog|TestSpaceChangeReread' .` PASS. Run without FLOAT_LOG, with a `.fs` file present: after `kill -WINCH` and `kill -INFO` the app is alive, the fixture's organizer.log has 0 lines matching SIGWINCH|SIGINFO|stand-in|FLOAT_COMPACT|space-change, and no float log exists.
- **Fails on main** (0c733bf), shown from main's source, not built: the observer is only `update(@"space-change", YES)` (:1242). There is no second read, no SIGWINCH/SIGINFO hook, no `.fs`. Every update after a hide runs with `fsCheck=NO` and keeps a hidden icon hidden, so S1's `fs=0 icon shown` cannot occur. S2's second read does not exist. In S3, `shown` is `isVisible`, so a change says `stays`, and the 0.3 s read-back only logs (:584).
- **FR-2 in the real path:** `orderInIfDropped` runs at the 0.3 s read-back in `showIcon` and at the 0.5 s re-read (only when the panel was visible before that re-read; a just-shown panel gets its own read-back). Each call orders front at most once and schedules only `readBack()`, which logs. Nothing calls it again, and a later change cancels a pending re-read (`k != spaceChanges`). So there is no loop that could fight the window server.
- **FR-3 drop stand-in:** an opaque window at the panel's level, frame and collection behaviour meets FR-3's purpose: AppKit reports `isVisible=1`, the window server reports occlusion 8192 (no Visible bit), and FR-2's `orderFrontRegardless` alone brings the panel back (S3 shots). Note, to the FSE: the cover reaches the state FR-2 reads, not necessarily the window server's own drop, so whether `orderFrontRegardless` recovers a real drop is shown only by Pablo's optional by-hand look. FR-3's wording "orders the panel out" is not buildable with public API while keeping isVisible (the builder's Notes). The spec could say "hides it at the window server".

### X0
- `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **fresh**, run **48956b79-75991** (sha b2b291a), **rc 2**. One failure, `TestAppCreateCrewReturnsAtOnce`: `CreateCrew took 1.161304667s, want < 1 s`. That is app_launch_test.go, untouched by this diff, and the machine had 3.8 GB of swap in use. Rerun fresh (`--share --fresh`, which saves no id): **exit 0**, all go packages ok, vitest 79 files, 1045 tests passed (`/Users/pabloantipan/organizer/.wt-notes/f50-review/x0-test2.log`). Note, to the FSE: that test's 1 s bound flakes under memory pressure.
- `test-lease run -- wails build` 0. `test-lease run -- make review-build` 0 (`built build/bin/Deltagos Review.app (cl.antipan.organizer.review)`). `git status --porcelain` of the clone was empty (wails left frontend/wailsjs/runtime untouched). Clone removed.

### Notes
- Note, to the FSE: SIGWINCH and SIGINFO are also the terminal's resize and Ctrl-T signals, so a FLOAT_LOG build run in a foreground terminal takes the hooks on a resize. With no `.fs` file the hook only posts a desktop change that reads the real list. Harmless, check builds only.

Reviewer f50-review, 2026-10-24.
