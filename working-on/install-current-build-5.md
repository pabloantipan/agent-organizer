---
title: The installed organizer is main, with rule-anyone
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "after rule-anyone merges: make install from clean main, prove gates 1-4 (gate 3 by organizer status --json)"
depends_on: [rule-anyone]
boundary: ["build/ (the build output)", "/Applications/organizer.app (install target)", "~/.local/bin/organizer (the symlink make install writes)", "no source file in the repo"]
spec: "Pablo, 2026-09-28: \"Reinstall\" (0041), then \"I see nothing happening?\" after the read-only card merged past the installed v0.2.0-301; CLAUDE.md, Packaging"
gate: "the Gate section below"
seat: install5-build
---

## Goal
The installed app (v0.2.0-301) predates the read-only card (2bffd31) and the
merge of odyssey's initiative description and specs (fc26867). Install main.

## Gate
- [ ] 1. `make install` from a clean `main` at that contains rule-anyone succeeds (its output tail; the closing line may read `-dirty`, a known Makefile quirk)
- [ ] 2. `/Applications/organizer.app/Contents/MacOS/organizer version` and `organizer version` on PATH both print `git describe` of `main` at install time, with no `-dirty`
- [ ] 3. `organizer status --json` from the installed binary lists the seven PLV initiatives as `archived`
- [ ] 4. No file under the repo changed (`git status --short` shows nothing new but this card)

## Done
- 2026-09-28 opened by the FSE

## Next
1. Install main once rule-anyone has merged

## Blockers
none

## Notes
- Build with `make install`, never `wails dev`; restore the wailsjs modes with `git checkout --` after
- Pablo may be using the app; rule nothing in it
- 2026-09-28 sup14 runs this card after rule-anyone lands; it supersedes install-current-build-4
- 2026-09-28 sup14: reset the Done, Review, gate ticks and next copied from install-current-build-4; gate 3 now reads `organizer status --json`, which answers install-4's decide; seat install5-build
