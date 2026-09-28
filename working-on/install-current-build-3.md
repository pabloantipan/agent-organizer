---
title: The installed organizer is main, with stage 3
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "After explain-finish lands, make install from main, then confirm the installed version and that the Help opens"
depends_on: [explain-finish]
boundary: ["build/ (the build output)", "/Applications/organizer.app (install target)", "~/.local/bin/organizer (the symlink make install writes)", "no source file in the repo"]
spec: "Pablo, 2026-09-28, in the FSE's session: \"do as recommended. Reinstall\" (0041); CLAUDE.md, Packaging"
gate: "the Gate section below"
seat: stage3b-install
---

## Goal
Install stage 3 (the Help, health words, every agent's health, and
explain-finish) so Pablo sees it.

## Gate
- [ ] 1. `make install` from a clean `main` that contains explain-finish succeeds (its output tail; the closing line may read `-dirty`, a known Makefile quirk)
- [ ] 2. `/Applications/organizer.app/Contents/MacOS/organizer version` and `organizer version` on PATH both print `git describe` of `main` at install time, with no `-dirty`
- [ ] 3. The installed app opens its Help from the top bar and shows how-we-build.md's sections (a screenshot of the native window; rule nothing)
- [ ] 4. No file under the repo changed (`git status --short` shows nothing new but this card)

## Done
- 2026-09-28 opened by the FSE (0041)

## Next
1. After explain-finish lands, make install from main and the checks

## Blockers
none

## Notes
- Build with `make install`, never `wails dev`; restore the wailsjs modes with `git checkout --` after
- Screenshots of the native window need Screen Recording, granted to `/opt/homebrew/bin/zellij`
- Pablo may be using the app; do not rule anything in it
- 2026-09-28 sup11 runs this card (organizer-probe-sup11), spawned by the FSE
