---
title: The installed organizer is the current main, again
status: done
repos: [organizer]
branch: main
updated: 2026-09-30
next: "superseded by the install of main v0.2.0-635-g83e8450 on 2026-09-30; gate 3 settled by Pablo (\"install the last version possible\")"
depends_on: []
seat: install2-build
boundary: ["build/ (the build output)", "/Applications/organizer.app (install target)", "~/.local/bin/organizer (the symlink make install writes)", "no source file in the repo"]
spec: "Pablo, 2026-09-28, in the FSE's session: \"do\" (reinstall after glance-header-scroll and glance-rule-in-decisions); CLAUDE.md, Packaging"
gate: "the Gate section below"
---

## Goal
The installed app (v0.2.0-229) predates `glance-header-scroll` and
`glance-rule-in-decisions` (both in done/). Rebuild and reinstall so Pablo
sees them.

## Gate
- [x] 1. `make install` from a clean `main` succeeds (its output tail as evidence; the closing line may read `-dirty`, a known Makefile quirk, see done/install-current-build.md)
- [x] 2. `/Applications/organizer.app/Contents/MacOS/organizer version` and `organizer version` on PATH both print `git describe` of `main` at install time, with no `-dirty`
- [ ] 3. The installed app shows the organizer's header clamped to two lines with "more", and an expanded proposed record on its Decisions tab offers Rule (a screenshot of the native window; do not rule anything)
- [x] 4. No file under the repo changed (`git status --short` shows nothing new but this card)

## Done
- 2026-09-28 opened by the FSE from Pablo's request
- 2026-09-28 install2-build: installed v0.2.0-256-g7d740c7. Gate 1: make install from clean main succeeded (make-install.log; the closing echo reads -dirty, the known quirk). Gate 2: both the app binary and `organizer` on PATH (~/.local/bin/organizer -> /Applications/organizer.app/Contents/MacOS/organizer) print v0.2.0-256-g7d740c7, no -dirty (versions.txt). Gate 3, half: header.png shows the organizer's goal and measure clamped to two lines with "more"; Rule not shown, see Blockers. Gate 4: status.txt shows only the untracked baseline. Evidence in .wt-notes/install2-build

## Next
1. Pablo decides how gate 3's Rule half is shown (see next:), then screenshot the Decisions tab

## Blockers
- Gate 3, Rule half: the card names record 0039 as proposed, but it was ruled (by pablo) in 7d740c7, the commit installed here. No record under ~/*/working-on/decisions is `status: proposed`, so no expanded record can offer Rule, and proposing one is outside this seat's boundary

## Notes
- Build with `make install`, never `wails dev`; `wails build` flips the wailsjs modes, restore them with `git checkout --`
- Screenshots of the native window need Screen Recording, granted to `/opt/homebrew/bin/zellij`
- Pablo may be using the app; quit it only if it is not in the foreground, otherwise ask him through the card
- 2026-09-28 sup9 runs this card (organizer-probe-sup9), spawned by the FSE; builder seat install2-build, reviewer seat install2-review
- 2026-09-28 install2-build: my first `make install` ran with this card's `status: now` edit uncommitted, so the tree was dirty and the binary said -dirty (make-install-first-dirty.log). I set the edit aside, restored the wailsjs modes, and rebuilt from a clean tree; the second build is the one installed. Commit card edits before building, or make them after.
- 2026-09-28 install2-build: both builds flipped the mode of `frontend/wailsjs/go/main/App.{d.ts,js}`; I restored it with `git checkout --` each time. `osascript ... quit` answered "User canceled (-128)", but the process was gone (pgrep). Chrome was frontmost, not the organizer
- 2026-09-28 install2-build: after opening the app I clicked where the Decisions tab sits; System Events returned error -25204, and the next capture showed Roadmap instead (decisions-rule.png shows Roadmap, not Decisions). Someone was probably using the app, so I stopped interacting. The app is left running
- 2026-09-28 FSE: record 0040 is proposed since 643469e (after the install) and owned by pablo. The app scans working-on/ live, so the installed Decisions tab should now offer Rule on 0040 without a rebuild; a screenshot of the box, without ruling, would cover gate 3's Rule half. The decide: above stays Pablo's.
- 2026-09-30: Pablo, 2026-09-30, in the FSE's session: "install the last version possible" (answer to gate 3) and "yes" to moving it to done/. The FSE ran `make install`: /Applications/Deltagos.app and ~/.local/bin/organizer are Deltagos v0.2.0-635-g83e8450 (main at 83e8450).
