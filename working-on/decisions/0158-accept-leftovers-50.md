---
title: Accept leftovers 50 - the floating icon comes back after a desktop change
status: proposed
raised: 2026-10-24
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf50-float-space]
forecast: 30-60m
stage: review-map
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

You said, 2026-10-24: "When I move between desktops, icon got broken and I se
none". A read-only diagnosis found it is the floating desktop icon (0088),
not the Dock tile: on a normal desktop away from the main window the panel
existed but the window server kept it off screen. Two causes in
`floaticon_darwin.m`, both in `docs/specs/leftovers-50.md`:

1. The full-screen test reads the window list once, at the desktop-change
   notification. Mid-slide that list holds both desktops, so a normal
   desktop can read as full screen, and the icon then stays hidden until
   the next change. The spike named this and proposed a later re-read that
   was never built.
2. When the window server drops the panel while AppKit still calls it
   shown, every change says "stays" and nothing orders it in again
   (floating-icon-3's builder saw it once).

After this: a second read 0.5 s after each change, and the panel ordered in
again whenever it is wanted but not on screen. Checked through the app's
existing FLOAT_LOG hooks; no gate row moves your desktops.

## Options

- **accept as written**: one card, one wave.
- **accept with amendments**: say which.
- **send back**.

## Recommendation

accept as written.

Separately, yours if you want it, no card: LaunchServices holds about 365
Deltagos registrations, most of them review builds whose folders are gone.
They do not explain the floating icon, but they can blank a Dock icon.
Clearing them touches your Dock: `lsregister -gc`, then
`lsregister -f /Applications/Deltagos.app`, then `killall Dock`
(lsregister lives under
`/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/`).

## Forecast

forecast: 30-60m over 1 wave, no UI review, no lease data; basis: 3 tasks,
this initiative (leftovers 45-47: 14, 23 and 83 min).
