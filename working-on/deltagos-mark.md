---
title: "The Deltagos mark on the floating icon, the app icon and the Help header"
status: next
repos: [organizer]
branch: deltagos-mark
seat: dm-build
stage: one-window
updated: 2026-10-09
next: "0105 accepted 2026-10-09; sup50 runs it after float-focus-steal, once ram-view is in done/"
depends_on: [ram-view]
boundary: ["floaticon_darwin.m/.h/.go (the tile's layers only)", "build/appicon.png and the darwin icon files", "new DeltagosMark.tsx and css, HelpView.tsx (header)", "not: the panel's list, activation paths (float-focus-steal), the RAM ring's logic"]
spec: "docs/specs/deltagos-mark.md (FR-1 to FR-4; docs/ux/specs/floating-icon.md Amendment 4)"
gate: "docs/specs/deltagos-mark.md Acceptance, rows F17 to F19, H1 and X0"
ui_review: true
---

## Goal
0102: the mark Pablo suggested, in the app's palette, wherever Deltagos names
itself.

## Gate
docs/specs/deltagos-mark.md, F17 to F19, H1 and X0.
