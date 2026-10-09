---
title: "Deltagos comes to the front by itself and pulls Pablo off his desktop: find which path activates it, and stop it"
status: now
repos: [organizer]
branch: float-focus-steal
seat: ffs-build
stage: one-window
updated: 2026-10-09
next: "ffs-build builds on branch float-focus-steal (sup50 wave 1): prove the cause (S1), then fix"
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

## Notes
- 2026-10-09: supervisor sup50 (window 8383), spawned by the FSE.
