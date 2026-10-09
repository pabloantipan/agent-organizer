---
title: "Deltagos comes to the front by itself and pulls Pablo off his desktop: find which path activates it, and stop it"
status: now
repos: [organizer]
branch: float-focus-steal
seat: ffs-build
stage: one-window
updated: 2026-10-09
next: "review: float-focus-steal, S1-S4 met (S2 as amended under 0108), 33cf4ff"
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
- [x] S1 the cause named with evidence: a FLOAT_LOG run (or an added
  activation log) showing which call activated or ordered front the window
  at an unrequested moment, reproduced on lodestar
  Met: § Cause (9ad4035), exp8 in `.wt-notes/ffs-build/s1-float.log`, `s1-frontmost.log`, `s1-steps.log`; activation log 056e877
- [x] S2 after the fix, with "switch to a Space with open windows" on: 30 minutes moving between three desktops with Deltagos home on desktop 2 and the icon used twice; the frontmost-app log shows Deltagos activated only after the two uses, or on arriving at desktop 2 where its window is the topmost (the lead's own move; macOS does this for any app), and never a desktop change the lead did not make (amended by the FSE under 0108, 2026-10-09: ffs-build's question at 95de4fb)
  Met (as amended, ceaa6e2): retest 18:46:57, the hand-on refused, no desktop change (`.wt-notes/ffs-build/fix-float.log`, `fix-frontmost.log`, `fix-steps.log`); moves 18:48-19:06, cut short by the FSE on Pablo's word: 32 desktop changes mine, 11 Pablo's own, none unasked; Review activated only on arriving at desktop 2 where it was topmost and at Pablo's two uses 18:56:51-18:57:07 (`s2-desktop-changes.txt`, `s2-frontmost.log`, `s2-float.log`)
- [x] S3 the floating icon's existing checks (F-rows of floating-icon-2)
  still pass
  Met from logs and code, no driven input (FSE ~19:21): F1, F7 (click outside), F8, F10, F11, F12, F16 and the A2 growth (200 ms) read back from Pablo's own pointer on the fix build (`.wt-notes/ffs-build/s3-evidence.txt`, `progress.md` § S3 rows). Not re-run, code untouched by the fix: F2-F6, F9, F13-F15, F17-F19; Escape not exercised (same `dismissList` as the click outside); F9's AX read not taken (the review app was gone after the stop)
- [x] S4 `make test`, `wails build` pass
  Met at 33cf4ff from a clean clone (removed): go vet + go test ok, vitest 362/362, `wails build` exit 0, 0 CGS/SLS symbols (`.wt-notes/ffs-build/s4-make-test.out`, `s4-wails-build.out`)

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

## Done
- 2026-10-09, ffs-build: branch `float-focus-steal` at 33cf4ff, rebased on main (2c94254): activation log 056e877, check helpers a76a3c3, the fix 20feed3 (refuse the system's hand-on when another app just quit or hid and Deltagos has no window on this desktop; hand activation to the app macOS would have picked; the list's close hands focus back, replacing the no-op `[NSApp deactivate]`), the retest, S2 and F-row scripts 33cf4ff. S1-S4 met. Pablo's installed Deltagos keeps the old behaviour until this is installed.

## Notes
- 2026-10-09: supervisor sup50 (window 8383), spawned by the FSE.
- 2026-10-09, ffs-build: the fix's retest is met at 18:46:57: the system's hand-on reached Deltagos Review on desktop 2, was refused, and went to Chrome 25 ms later with no desktop change (`.wt-notes/ffs-build/fix-float.log`, `fix-frontmost.log`, `fix-steps.log`; `scripts/focus-steal-check.sh`, ef9caac). For a few milliseconds the frontmost log still names Deltagos Review: macOS activates it before the refusal can hand activation on.
- 2026-10-09, ffs-build: in S2, each move that lands on desktop 2 while Review's window is the topmost one there makes macOS activate Review. The app orders nothing (event 13, no `orderFront` in `s2-float.log`). Any app whose window is on top of the desktop you arrive at gets the same. Read literally, "only after the two uses" counts these arrivals. Pablo also clicked the review app himself at 18:56:51-18:57:05 (compact, list, double-click).
- answered by the FSE (0108): the arrival at its own home counts as the lead's act; S2 reworded. No rerun needed for it.
- 2026-10-09 ~19:20 the FSE (0108): S2 cut short on Pablo's word ("there's an action that some agent does that switcheses Desktop to right ... it's annoying"): the recorded retest and S2's log so far are the evidence; no scripted desktop moves while Pablo uses the Mac.
