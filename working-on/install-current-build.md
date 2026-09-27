---
title: The installed organizer is the current main
status: next
repos: [organizer]
branch: main
updated: 2026-09-27
next: "make install from main, then confirm the installed app and the organizer on PATH report main's git describe and the app opens"
depends_on: []
seat: wave1-install
boundary: ["build/ (the build output)", "/Applications/organizer.app (install target)", "~/.local/bin/organizer (the symlink make install writes)", "no source file in the repo"]
spec: "Pablo, 2026-09-27, in the FSE's session: \"send someone to do so please\" (rebuild and reinstall); CLAUDE.md, Packaging"
gate: "the Gate section below"
---

## Goal
The installed app (v0.2.0-154, built 2026-09-26 23:41) predates roadmap stage
2 (twenty-at-a-glance, all cards in done/). Pablo asked for it to be rebuilt
and reinstalled so he sees what landed.

## Gate
- [ ] 1. `make install` from a clean `main` succeeds (its output tail as evidence)
- [ ] 2. `/Applications/organizer.app/Contents/MacOS/organizer version` and `organizer version` on PATH both print `git describe` of `main` at install time
- [ ] 3. The installed app opens on Home, the archived initiatives sit in the collapsed "Not active" rail group, and Needs me counts only the lead's rows (a screenshot of the native window)
- [ ] 4. No file under the repo changed (`git status --short` shows nothing new but this card)

## Done
- 2026-09-27 opened by the FSE from Pablo's request

## Next
1. make install from main, then the version and screenshot checks

## Blockers
none

## Notes
- A `wails dev` session leaves an empty .app behind (CLAUDE.md, Conventions); build with `make install`, not `wails dev`
- Screenshots of the native window need Screen Recording, which is granted to `/opt/homebrew/bin/zellij`
- 2026-09-27 sup7 runs this card (organizer-probe-sup7), spawned by the FSE
