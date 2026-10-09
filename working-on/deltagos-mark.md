---
title: "The Deltagos mark on the floating icon, the app icon and the Help header"
status: now
repos: [organizer]
branch: deltagos-mark
seat: dm-build
stage: one-window
updated: 2026-10-09
next: "dm-build builds on branch deltagos-mark (sup50 wave 2), from main at c94c28c"
depends_on: [ram-view]
boundary: ["floaticon_darwin.m/.h/.go (the tile's layers only)", "build/appicon.png and build/darwin/iconfile.icns (copied from docs/ux/inputs/deltagos-mark/app-icon/, never redrawn)", "new DeltagosMark.tsx and css, HelpView.tsx (header)", "not: the panel's list, activation paths (float-focus-steal), the RAM ring's logic"]
spec: "docs/specs/deltagos-mark.md (FR-1 to FR-4; docs/ux/specs/floating-icon.md Amendment 4)"
gate: "docs/specs/deltagos-mark.md Acceptance, rows F17 to F22, H1 and X0"
ui_review: true
---

## Goal
0102: the mark Pablo suggested, in the app's palette, wherever Deltagos names
itself.

## Gate
docs/specs/deltagos-mark.md, F17 to F22, H1 and X0.

## Notes
- 2026-10-09: supervisor sup50 (window 8383), spawned by the FSE.
