---
title: "The app icon in Icon Composer's .icon format, so macOS 26 draws it without its grey plate"
status: next
repos: [organizer]
branch: app-icon-composer
seat: aic-build
stage: one-window
updated: 2026-10-09
next: "aglaea: export the mark as an Icon Composer .icon (layers: tile, gears, D); then the FSE raises one record for Pablo"
depends_on: [deltagos-mark]
boundary: ["build/darwin (the .icon or asset catalog and the plist key that names it)", "the Makefile or build script step that compiles it into the bundle", "not: the mark's drawing, the floating icon, the frontend"]
spec: "this card's Spec section"
gate: "this card's Gate section, rows A1 to A3"
ui_review: true
---

## Spec
deltagos-mark shipped the mark as `iconfile.icns` (floating-icon Amendment 5).
macOS 26 draws any `.icns`-only app on its own light-grey plate: dm-build's
IconServices renders show it at 16 and 32 pt (Finder lists and sidebar), while
128 pt and up render clean (dm-ui's UI review U1, 5523e32;
`.wt-notes/dm-ui/f20-f21-iconservices.txt`). Aglaea
named this as a rabbit hole; Icon Composer's `.icon` (or an asset-catalog
app icon) is the format macOS 26 draws without a plate. Requires: Aglaea's
`.icon` export; how Wails v2.15 bundles it (an `Assets.car` via `actool`
and `CFBundleIconName`, keeping `iconfile.icns` for macOS 12-15).

## Gate
- [ ] A1 IconServices renders of the built bundle at 16, 32, 128 and 512 pt @1x/@2x on lodestar (macOS 26.1): no grey plate
- [ ] A2 the same bundle on macOS 12-15 (or its plist and `iconfile.icns` proven unchanged for them): the current icon
- [ ] A3 `make test`, `wails build`, `make review-build` pass
