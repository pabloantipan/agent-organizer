---
title: The installed organizer is main, with rule-anyone
status: now
repos: [organizer]
branch: main
updated: 2026-09-28
next: "review: install-current-build-5, gate 1-4 met, evidence in .wt-notes/install5-build, installed v0.2.0-348-gf324257"
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
- [x] 1. `make install` from a clean `main` at that contains rule-anyone succeeds (its output tail; the closing line may read `-dirty`, a known Makefile quirk)
- [x] 2. `/Applications/organizer.app/Contents/MacOS/organizer version` and `organizer version` on PATH both print `git describe` of `main` at install time, with no `-dirty`
- [x] 3. `organizer status --json` from the installed binary lists the seven PLV initiatives as `archived`
- [x] 4. No file under the repo changed (`git status --short` shows nothing new but this card)

## Done
- 2026-09-28 opened by the FSE
- 2026-09-28 install5-build: installed v0.2.0-348-gf324257 (main f324257, `merge-base --is-ancestor rule-anyone main` ok, tree clean before the build). 1: make-install.log ends `installed … (v0.2.0-348-gf324257-dirty)`, exit 0 (the -dirty is the wailsjs flip). 2: app binary and `organizer` on PATH (~/.local/bin/organizer -> /Applications/organizer.app/Contents/MacOS/organizer) both print `organizer v0.2.0-348-gf324257` (versions.txt). 3: status-archived.txt lists the seven PLV initiatives `archived`, camp, organizer, agent-slack `active` (status-json.txt). 4: git-status.txt shows nothing after the wailsjs restore and the card commit

## Next
1. Review the gate evidence in .wt-notes/install5-build

## Blockers
none

## Notes
- Build with `make install`, never `wails dev`; restore the wailsjs modes with `git checkout --` after
- Pablo may be using the app; rule nothing in it
- 2026-09-28 sup14 runs this card after rule-anyone lands; it supersedes install-current-build-4
- 2026-09-28 sup14: reset the Done, Review, gate ticks and next copied from install-current-build-4; gate 3 now reads `organizer status --json`, which answers install-4's decide; seat install5-build
- 2026-09-28 install5-build: the app (pid 50924) was running, WhatsApp frontmost; quit answered "User canceled (-128)" but the process was gone. Reopened with `open -a` (pid 9921), left running, not touched
- 2026-09-28 install5-build: `wails build` left `frontend/wailsjs/runtime/{package.json,runtime.d.ts,runtime.js}` modified (as in install-4, not App.{d.ts,js}); restored with `git checkout -- frontend/wailsjs`
