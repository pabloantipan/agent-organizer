---
title: The installed organizer is main, with stage 3
status: done
repos: [organizer]
branch: main
updated: 2026-09-28
next: "none: reviewed pass 2026-09-28"
depends_on: [explain-finish]
boundary: ["build/ (the build output)", "/Applications/organizer.app (install target)", "~/.local/bin/organizer (the symlink make install writes)", "no source file in the repo"]
spec: "Pablo, 2026-09-28, in the FSE's session: \"do as recommended. Reinstall\" (0041); CLAUDE.md, Packaging"
gate: "the Gate section below"
seat: stage3b-install
review: pass
---

## Goal
Install stage 3 (the Help, health words, every agent's health, and
explain-finish) so Pablo sees it.

## Gate
- [x] 1. `make install` from a clean `main` that contains explain-finish succeeds (its output tail; the closing line may read `-dirty`, a known Makefile quirk)
- [x] 2. `/Applications/organizer.app/Contents/MacOS/organizer version` and `organizer version` on PATH both print `git describe` of `main` at install time, with no `-dirty`
- [x] 3. The installed app opens its Help from the top bar and shows how-we-build.md's sections (a screenshot of the native window; rule nothing)
- [x] 4. No file under the repo changed (`git status --short` shows nothing new but this card)

## Done
- 2026-09-28 opened by the FSE (0041)
- 2026-09-28 stage3b-install: installed v0.2.0-301-g6b37bef (main 6b37bef, contains explain-finish). Gate 1: `make install` exit 0 from a clean main, tail `installed /Applications/organizer.app and ~/.local/bin/organizer (v0.2.0-301-g6b37bef-dirty)`, the known echo quirk (make-install.log). Gate 2: the app binary and `organizer` on PATH (~/.local/bin/organizer -> /Applications/organizer.app/Contents/MacOS/organizer) both print `organizer v0.2.0-301-g6b37bef` (versions.txt); the top bar reads v0.2.0-301-g6b37bef (before-help.png). Gate 4: `git status --short` shows only the untracked baseline (status.txt). Gate 3 not met: the ? button is there with its tooltip "Help: how we…" (help-button-hover.png), but no click reached it, so help.png does not exist. Evidence in .wt-notes/stage3b-install/
- 2026-09-28 stage3b-install: gate 3 met on Pablo's screenshot (gate3-help-by-pablo.png, read back). The installed app's top bar reads v0.2.0-301-g6b37bef, the crumbs say Home / Help, the ? is highlighted, and the Help shows `/Users/pabloantipan/agent-slack/docs/how-we-build.md` with a sections list matching the file's headings: its title, Who is involved, 1. Who talks to whom, 2. The life of an initiative: discovery, then building, 3. From an idea to running software, 4. Inside one agent's work, Glossary. No seat clicked in or captured the app for it. Gates 1-4 met; installed v0.2.0-301-g6b37bef

## Next
1. Review against the gate (not this seat)

## Blockers
none

## Notes
- Build with `make install`, never `wails dev`; restore the wailsjs modes with `git checkout --` after
- Screenshots of the native window need Screen Recording, granted to `/opt/homebrew/bin/zellij`
- Pablo may be using the app; do not rule anything in it
- 2026-09-28 sup11 runs this card (organizer-probe-sup11), spawned by the FSE
- 2026-09-28 stage3b-install: Chrome was frontmost. I quit the app (osascript answered "User canceled (-128)", but pid 1128 was gone) before `make install`. `wails build` flipped `frontend/wailsjs/go/main/App.{d.ts,js}` to 100755; I restored it with `git checkout -- frontend/wailsjs`. The card's `status: now` was edited only after the install, so the build tree was clean
- 2026-09-28 stage3b-install: the reopened app (pid 94731) is left running on Home. Opening Help failed four ways: System Events `click at` (-25204), CGEvent to the HID tap (with and without click state), and CGEvent postToPid. Mouse moves arrive (the tooltip shows), clicks do not. The WKWebView exposes no accessibility tree, and the Help has no keyboard shortcut. System Events -25204 means the pane's parent (zellij) has Screen Recording but not Accessibility. The cursor stayed where I put it and the view never changed, so nobody else was using the app. Nothing was ruled, pressed or posted in the app
- 2026-09-28 FSE: Accessibility was already granted to `/opt/homebrew/bin/zellij` on 2026-09-27 (see done/redesign-rule-box.md and 4876756), and the stage-3 reviewer saw the built app refuse synthetic clicks while that grant held (done/explain-health-all-agents.md, Review, G7 caveat). A second grant is unlikely to help; Pablo clicking ? once while a seat screenshots is the reliable path. The decide: above stays Pablo's.
- 2026-09-28 sup11: the diagnosis above may be wrong. From sup11's pane (zellij 0.44.3, same binary), a System Events read that needs Accessibility (Finder's menu bar items) succeeds, so the grant looks present; what fails is a synthetic click reaching the WKWebView. The decide: stays Pablo's
- 2026-09-28 FSE: Pablo opened the Help himself in the installed app (v0.2.0-301-g6b37bef, header shows it) and sent a screenshot: `.wt-notes/stage3b-install/gate3-help-by-pablo.png` (Home / Help, `/Users/pabloantipan/agent-slack/docs/how-we-build.md`, its sections listed). That is his answer to the decide: above, evidence for gate 3.

## Review
- Verdict: pass
- Unmet gate items: none
- 1. make-install.log has no error or fail line and ends `installed /Applications/organizer.app and ~/.local/bin/organizer (v0.2.0-301-g6b37bef-dirty)`; `merge-base --is-ancestor explain-finish 6b37bef` succeeds
- 2. the app binary and `organizer` on PATH (~/.local/bin/organizer -> /Applications/organizer.app/Contents/MacOS/organizer) both print `organizer v0.2.0-301-g6b37bef`, no -dirty, rerun by the reviewer; 6b37bef is on main, and the reflog has it as main's tip from 01:31:53 to 01:35:20 while the log and the installed binary are stamped 01:32:42
- 3. gate3-help-by-pablo.png is the native window (title bar "organizer", top bar v0.2.0-301-g6b37bef, crumbs Home / Help, ? highlighted), path ~/agent-slack/docs/how-we-build.md, and its sections list matches the file's seven headings exactly
- 4. `git status --short` shows only `.playwright-mcp/`, `.wt-notes/`, `runs/`
- Not covered by the gate: the Makefile's closing line reads -dirty because `wails build` flips `frontend/wailsjs/go/main/App.{d.ts,js}` to 100755; gate 4 held only because the builder ran `git checkout -- frontend/wailsjs` by hand. `make install` should restore it (or compute the describe once) so the next install is clean without a manual step. Gate 3's evidence is Pablo's screenshot relayed by the FSE, not a seat's capture; synthetic clicks still cannot reach the WKWebView, which will block the next UI gate the same way
- Reviewer: stage3b-review-install, 2026-09-28
