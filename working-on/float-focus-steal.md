---
title: "Deltagos comes to the front by itself and pulls Pablo off his desktop: find which path activates it, and stop it"
status: now
repos: [organizer]
branch: float-focus-steal
seat: ffs-build
stage: one-window
updated: 2026-10-09
next: "ffs-build: fix e9ce3f5 on float-focus-steal; its retest and S2 wait for lodestar's screen to unlock (locked since 16:36)"
depends_on: []
boundary: ["floaticon_darwin.m and floaticon_darwin.go, and their check scripts", "not: the frontend, the Go service, the mark (0102)"]
spec: "this card's Spec section"
gate: "this card's Gate section, rows S1 to S4"
ui_review: false
---

## Spec
Reported by Hephaistos, 2026-10-09, lodestar: Deltagos came to the front by
itself at 11:33:20 and 11:33:43 (frontmost-app log), and with macOS "switch
to a Space with open windows" on, that pulls Pablo off Desktop 1. Pablo:
"for some reason, I can't stay in first Desktop permanently". Not proved that
the floating icon is the cause; the installed app runs without FLOAT_LOG, so
nothing was logged.

Candidates read in `floaticon_darwin.m`, not verified: `orderHere`
(orderFrontRegardless with MoveToActiveSpace) called from `update` on every
`NSWorkspaceActiveSpaceDidChangeNotification` when the state is Returning
and the home marker is on the active space; `markHome`; and the two
`activateIgnoringOtherApps` (click, `growFromIcon`).

Required: Deltagos is brought to the front only by the lead's own act (a
click or double-click on the icon, the Dock, Cmd-Tab, a notification
click). Nothing on a desktop change, a timer, a scan or the agents tick
orders the main window front or activates the app.

## Gate
- [ ] S1 the cause named with evidence: a FLOAT_LOG run (or an added
  activation log) showing which call activated or ordered front the window
  at an unrequested moment, reproduced on lodestar
- [ ] S2 after the fix, with "switch to a Space with open windows" on: 30
  minutes moving between three desktops with Deltagos home on desktop 2 and
  the icon used twice; the frontmost-app log shows Deltagos only after the
  two uses
- [ ] S3 the floating icon's existing checks (F-rows of floating-icon-2)
  still pass
- [ ] S4 `make test`, `wails build` pass

## Cause (S1, ffs-build, 2026-10-09)
None of the card's candidates: the steal is macOS's own fallback activation,
made possible by the icon. The floating icon is a window on every desktop
(CanJoinAllSpaces), so on any desktop Deltagos counts as an app with a window
there. When the app in front on a desktop quits (or hides), macOS activates
the most recent app that has a window on that desktop; if that is Deltagos,
AppKit makes its main window key (`_handleActivatedEvent` →
`_NXShowKeyAndMain`, no call of ours) and, the window being on its home
desktop, "switch to a Space with open windows" moves the lead there.
Reproduced on lodestar in the review build (Deltagos Review home on desktop 3
of 5): a stand-in app on desktop 4, Deltagos used on desktop 3, back to 4,
the stand-in quits at 16:20:48.507 → Deltagos Review activated 16:20:48.507
on desktop 4, main window became key with `onActive=0`, desktop 3 at
16:20:49.136 (exp8). Control (exp9): the same order with a plain app B (a
window only on desktop 5) next in line: the quit went to Finder, not B.
Contributing: `dismissList`'s `[NSApp deactivate]` does nothing on this macOS
(Darwin 25): after every list close Deltagos stays the active app with no
window on the desktop until the lead activates something else (exp2, exp6),
so it is the most recent app more often; exp6 shows the fallback picking it
then (no desktop change, the window being ordered out). The candidates
`orderHere`/`update`, `markHome` and both `activateIgnoringOtherApps` logged
only at the lead's own acts (the added activation log names every one).
Evidence in `.wt-notes/ffs-build/`: `s1-float.log` (float and activation
log, epoch seconds), `s1-frontmost.log` (frontmost app with desktop number),
`s1-steps.log` (each step's time), experiments listed in `progress.md`.

## Notes
- 2026-10-09: supervisor sup50 (window 8383), spawned by the FSE.
- 2026-10-09, ffs-build: the fix's retest is met at 18:46:57: the system's hand-on reached Deltagos Review on desktop 2, was refused, and went to Chrome 25 ms later with no desktop change (`.wt-notes/ffs-build/fix-float.log`, `fix-frontmost.log`, `fix-steps.log`; `scripts/focus-steal-check.sh`, ef9caac). For a few milliseconds the frontmost log still names Deltagos Review: macOS activates it before the refusal can hand activation on.
- 2026-10-09, ffs-build: in S2, each move that lands on desktop 2 while Review's window is the topmost one there makes macOS activate Review. The app orders nothing (event 13, no `orderFront` in `s2-float.log`). Any app whose window is on top of the desktop you arrive at gets the same. Read literally, "only after the two uses" counts these arrivals. Pablo also clicked the review app himself at 18:56:51-18:57:05 (compact, list, double-click).
- decide: S2's arrivals at Review's own home: options "count the arrival activation at its own home as the lead's act (no desktop pulled, no window ordered front)" | "rerun S2 with another app's window above Review on desktop 2"
