---
title: The installed organizer is main, with read-only and odyssey's merge
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "make install from main (fc26867 or later), then confirm the installed version and that an archived initiative opens read-only"
depends_on: []
boundary: ["build/ (the build output)", "/Applications/organizer.app (install target)", "~/.local/bin/organizer (the symlink make install writes)", "no source file in the repo"]
spec: "Pablo, 2026-09-28: \"Reinstall\" (0041), then \"I see nothing happening?\" after the read-only card merged past the installed v0.2.0-301; CLAUDE.md, Packaging"
gate: "the Gate section below"
---

## Goal
The installed app (v0.2.0-301) predates the read-only card (2bffd31) and the
merge of odyssey's initiative description and specs (fc26867). Install main.

## Gate
- [ ] 1. `make install` from a clean `main` at fc26867 or later succeeds (its output tail; the closing line may read `-dirty`, a known Makefile quirk)
- [ ] 2. `/Applications/organizer.app/Contents/MacOS/organizer version` and `organizer version` on PATH both print `git describe` of `main` at install time, with no `-dirty`
- [ ] 3. `organizer status` from the installed binary lists the archived initiatives as archived (text output is enough; no screenshot needed)
- [ ] 4. No file under the repo changed (`git status --short` shows nothing new but this card)

## Done
- 2026-09-28 opened by the FSE

## Next
1. make install from main and the checks

## Blockers
none

## Notes
- Build with `make install`, never `wails dev`; restore the wailsjs modes with `git checkout --` after
- Pablo may be using the app; do not rule anything in it, and quit it only if it is not in the foreground
- 2026-09-28 sup13 runs this card (organizer-probe-sup13), spawned by the FSE
