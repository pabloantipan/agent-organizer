---
title: The installed organizer is the current main
status: now
repos: [organizer]
branch: main
updated: 2026-09-27
next: "review: install-current-build, gate 1-4 met, evidence in .wt-notes/wave1-install, installed v0.2.0-229-g3472f6b"
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
- [x] 1. `make install` from a clean `main` succeeds (its output tail as evidence)
- [x] 2. `/Applications/organizer.app/Contents/MacOS/organizer version` and `organizer version` on PATH both print `git describe` of `main` at install time
- [x] 3. The installed app opens on Home, the archived initiatives sit in the collapsed "Not active" rail group, and Needs me counts only the lead's rows (a screenshot of the native window)
- [x] 4. No file under the repo changed (`git status --short` shows nothing new but this card)

## Done
- 2026-09-27 opened by the FSE from Pablo's request
- 2026-09-27 wave1-install: gate 1-4 met, installed v0.2.0-229-g3472f6b. (1) `make install` from clean main at v0.2.0-229-g3472f6b (card commit 3472f6b) exited 0, tail "installed /Applications/organizer.app and ~/.local/bin/organizer": `.wt-notes/wave1-install/make-install.log`. (2) `/Applications/organizer.app/Contents/MacOS/organizer version` and `organizer version` (`~/.local/bin/organizer` -> `/Applications/organizer.app/Contents/MacOS/organizer`) both print `organizer v0.2.0-229-g3472f6b`, equal to the describe read before the build: `versions.txt`. (3) The app opened on Home against the real home: the top bar shows v0.2.0-229-g3472f6b, "Not active (7)" sits collapsed at the bottom of the rail under Everything/Pro/Ungrouped, and the Needs me badge is 19, the same as the list's "NEEDS ME 19" header: `home.png` (window region). For "lead's rows only", I compared the list with `organizer decisions`. Of the five proposed records, the four owned by pablo (knowledge-collector 0002-0005) are Rule rows, and ccint-camp 0005 (owner alejandro) is not in the list. No row comes from the seven non-active initiatives (rpex, facial, pwa-auth… whose `decide:`/Pablo cards `organizer status` still lists). (4) `git status --short` afterwards shows only the baseline untracked dirs: `status.txt`.

## Next
1. review: a seat that is not wave1-install checks gate 1-4 against .wt-notes/wave1-install

## Blockers
none

## Notes
- A `wails dev` session leaves an empty .app behind (CLAUDE.md, Conventions); build with `make install`, not `wails dev`
- Screenshots of the native window need Screen Recording, which is granted to `/opt/homebrew/bin/zellij`
- 2026-09-27 sup7 runs this card (organizer-probe-sup7), spawned by the FSE
- 2026-09-27 wave1-install: `wails build` flipped the mode of `frontend/wailsjs/go/main/App.{d.ts,js}` to 100755, as expected. make re-evaluates VERSION after the build, so its closing line said `v0.2.0-229-g3472f6b-dirty`. The ldflags were evaluated before the build, so both binaries carry the clean describe. I restored the mode with `git checkout --`. The Makefile could pin VERSION with `:=` so the echo can't disagree with the binary; that is a source change, so it was not made here.
- 2026-09-27 wave1-install: `osascript ... to quit` returned "User canceled (-128)" twice, but the app process was gone after the second call, and pgrep confirmed no /Applications/organizer.app process before the install. While I was capturing a second screenshot, the running app was navigated to agent-slack > Decisions, which a keypress of mine could not do (someone was likely using it). I stopped interacting, and rows 17-19 of Needs me were not viewed. The app is left running.
