---
title: The installed organizer is the current main, again
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "make install from main, then confirm the installed app and the organizer on PATH report main's git describe, the header clamps and the Decisions tab offers Rule"
depends_on: []
boundary: ["build/ (the build output)", "/Applications/organizer.app (install target)", "~/.local/bin/organizer (the symlink make install writes)", "no source file in the repo"]
spec: "Pablo, 2026-09-28, in the FSE's session: \"do\" (reinstall after glance-header-scroll and glance-rule-in-decisions); CLAUDE.md, Packaging"
gate: "the Gate section below"
---

## Goal
The installed app (v0.2.0-229) predates `glance-header-scroll` and
`glance-rule-in-decisions` (both in done/). Rebuild and reinstall so Pablo
sees them.

## Gate
- [ ] 1. `make install` from a clean `main` succeeds (its output tail as evidence; the closing line may read `-dirty`, a known Makefile quirk, see done/install-current-build.md)
- [ ] 2. `/Applications/organizer.app/Contents/MacOS/organizer version` and `organizer version` on PATH both print `git describe` of `main` at install time, with no `-dirty`
- [ ] 3. The installed app shows the organizer's header clamped to two lines with "more", and an expanded proposed record on its Decisions tab offers Rule (a screenshot of the native window; do not rule anything)
- [ ] 4. No file under the repo changed (`git status --short` shows nothing new but this card)

## Done
- 2026-09-28 opened by the FSE from Pablo's request

## Next
1. make install from main, then the version and screenshot checks

## Blockers
none

## Notes
- Build with `make install`, never `wails dev`; `wails build` flips the wailsjs modes, restore them with `git checkout --`
- Screenshots of the native window need Screen Recording, granted to `/opt/homebrew/bin/zellij`
- Pablo may be using the app; quit it only if it is not in the foreground, otherwise ask him through the card
- 2026-09-28 sup9 runs this card (organizer-probe-sup9), spawned by the FSE
