---
title: The installed organizer is main, with stage 3
status: now
repos: [organizer]
branch: main
updated: 2026-09-28
next: "decide: pablo, the installed Help could not be opened by a seat (synthetic clicks do not reach the app: no Accessibility grant); click ? in the top bar yourself and let a seat screenshot it, or grant Accessibility to /opt/homebrew/bin/zellij?"
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
- [x] 1. `make install` from a clean `main` that contains explain-finish succeeds (its output tail; the closing line may read `-dirty`, a known Makefile quirk)
- [x] 2. `/Applications/organizer.app/Contents/MacOS/organizer version` and `organizer version` on PATH both print `git describe` of `main` at install time, with no `-dirty`
- [ ] 3. The installed app opens its Help from the top bar and shows how-we-build.md's sections (a screenshot of the native window; rule nothing)
- [x] 4. No file under the repo changed (`git status --short` shows nothing new but this card)

## Done
- 2026-09-28 opened by the FSE (0041)
- 2026-09-28 stage3b-install: installed v0.2.0-301-g6b37bef (main 6b37bef, contains explain-finish). Gate 1: `make install` exit 0 from a clean main, tail `installed /Applications/organizer.app and ~/.local/bin/organizer (v0.2.0-301-g6b37bef-dirty)`, the known echo quirk (make-install.log). Gate 2: the app binary and `organizer` on PATH (~/.local/bin/organizer -> /Applications/organizer.app/Contents/MacOS/organizer) both print `organizer v0.2.0-301-g6b37bef` (versions.txt); the top bar reads v0.2.0-301-g6b37bef (before-help.png). Gate 4: `git status --short` shows only the untracked baseline (status.txt). Gate 3 not met: the ? button is there with its tooltip "Help: how we…" (help-button-hover.png), but no click reached it, so help.png does not exist. Evidence in .wt-notes/stage3b-install/

## Next
1. Pablo decides how gate 3 gets its screenshot (the decide: above); then open Help in the installed app, screenshot it, compare with how-we-build.md (sections: Who is involved; 1. Who talks to whom; 2. The life of an initiative; 3. From an idea to running software; 4. Inside one agent's work; Glossary)

## Blockers
- gate 3: a seat cannot click in the installed app (see Notes)

## Notes
- Build with `make install`, never `wails dev`; restore the wailsjs modes with `git checkout --` after
- Screenshots of the native window need Screen Recording, granted to `/opt/homebrew/bin/zellij`
- Pablo may be using the app; do not rule anything in it
- 2026-09-28 sup11 runs this card (organizer-probe-sup11), spawned by the FSE
- 2026-09-28 stage3b-install: Chrome was frontmost. I quit the app (osascript answered "User canceled (-128)", but pid 1128 was gone) before `make install`. `wails build` flipped `frontend/wailsjs/go/main/App.{d.ts,js}` to 100755; I restored it with `git checkout -- frontend/wailsjs`. The card's `status: now` was edited only after the install, so the build tree was clean
- 2026-09-28 stage3b-install: the reopened app (pid 94731) is left running on Home. Opening Help failed four ways: System Events `click at` (-25204), CGEvent to the HID tap (with and without click state), and CGEvent postToPid. Mouse moves arrive (the tooltip shows), clicks do not. The WKWebView exposes no accessibility tree, and the Help has no keyboard shortcut. System Events -25204 means the pane's parent (zellij) has Screen Recording but not Accessibility. The cursor stayed where I put it and the view never changed, so nobody else was using the app. Nothing was ruled, pressed or posted in the app
- 2026-09-28 FSE: Accessibility was already granted to `/opt/homebrew/bin/zellij` on 2026-09-27 (see done/redesign-rule-box.md and 4876756), and the stage-3 reviewer saw the built app refuse synthetic clicks while that grant held (done/explain-health-all-agents.md, Review, G7 caveat). A second grant is unlikely to help; Pablo clicking ? once while a seat screenshots is the reliable path. The decide: above stays Pablo's.
