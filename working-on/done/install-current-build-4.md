---
title: The installed organizer is main, with read-only and odyssey's merge
status: done
repos: [organizer]
branch: main
updated: 2026-09-30
next: "superseded by the install of main v0.2.0-635-g83e8450 on 2026-09-30, which contains 2bffd31; gate 3 settled by Pablo (\"install the last version possible\"); no card for an archived mark in organizer status"
depends_on: []
seat: install4-build
boundary: ["build/ (the build output)", "/Applications/organizer.app (install target)", "~/.local/bin/organizer (the symlink make install writes)", "no source file in the repo"]
spec: "Pablo, 2026-09-28: \"Reinstall\" (0041), then \"I see nothing happening?\" after the read-only card merged past the installed v0.2.0-301; CLAUDE.md, Packaging"
gate: "the Gate section below"
review: fail
---

## Goal
The installed app (v0.2.0-301) predates the read-only card (2bffd31) and the
merge of odyssey's initiative description and specs (fc26867). Install main.

## Gate
- [x] 1. `make install` from a clean `main` at fc26867 or later succeeds (its output tail; the closing line may read `-dirty`, a known Makefile quirk)
- [x] 2. `/Applications/organizer.app/Contents/MacOS/organizer version` and `organizer version` on PATH both print `git describe` of `main` at install time, with no `-dirty`
- [ ] 3. `organizer status` from the installed binary lists the archived initiatives as archived (text output is enough; no screenshot needed)
- [x] 4. No file under the repo changed (`git status --short` shows nothing new but this card)

## Done
- 2026-09-28 opened by the FSE
- 2026-09-28 install4-build: installed v0.2.0-332-g7897165 (main, fc26867 is an ancestor, tree clean). Gate 1: make-install.log tail `installed /Applications/organizer.app and ~/.local/bin/organizer (v0.2.0-332-g7897165-dirty)`, exit 0. Gate 2: versions.txt, describe before build v0.2.0-332-g7897165; the app binary and `organizer` on PATH (~/.local/bin/organizer -> /Applications/organizer.app/Contents/MacOS/organizer) both print `organizer v0.2.0-332-g7897165`. Gate 3 not met: status-archived.txt lists apimgmnt-auth-go, private-lgin-refactor, private-flutter, pwa-auth-monorepo, facial, auth-orchestrator-traces and rpex (all `status: archived`, archived-initiatives.txt) with no archived mark; `WriteStatus` in internal/cli/cli.go prints no initiative status and 2bffd31 changed only frontend/. Gate 4: git-status.txt is empty after restoring frontend/wailsjs. Evidence in .wt-notes/install4-build/

## Review
- Verdict: fail
- Unmet gate items: 3
- Findings outside the gate: gate 3 asks for something no installed build can show, since `organizer status` has no archived mark (and `--all` adds none) and 2bffd31 changed only frontend/; that is a gate defect, left to Pablo's decide. Gate 2 has no check that the running app instance is the new one: the builder's shell-launched pid 27143 is still up. Gate 1's `-dirty` comes from `wails build` rewriting frontend/wailsjs, which the gate tolerates but nothing restores by itself
- Evidence: 1 make-install.log has no error, tail `installed … (v0.2.0-332-g7897165-dirty)`, fc26867 is an ancestor of 7897165; 2 both binaries print `organizer v0.2.0-332-g7897165`, ~/.local/bin/organizer links to the app, 7897165 is on main and was main's tip from 11:25:57 to 11:30:34, the binary is stamped 11:26:58; 3 .wt-notes/install4-review/status.txt lists the seven archived initiatives with card counts and no archived mark; 4 `git status --short` empty
- Reviewer: install4-review, 2026-09-28

## Next
1. sup13 rules gate 3 (see next)

## Blockers
none

## Notes
- Build with `make install`, never `wails dev`; restore the wailsjs modes with `git checkout --` after
- Pablo may be using the app; do not rule anything in it, and quit it only if it is not in the foreground
- 2026-09-28 sup13 runs this card (organizer-probe-sup13), spawned by the FSE
- 2026-09-28 sup13: gate 3 is a question about the gate itself, so it is Pablo's; the supervisor does not rule it. Review launched on the gate as written
- 2026-09-28 install4-build: the app (pid 94731) was running, MSTeams frontmost; quit answered "User canceled (-128)" but the process was gone
- 2026-09-28 install4-build: this time `wails build` left `frontend/wailsjs/runtime/{package.json,runtime.d.ts,runtime.js}` modified, not App.{d.ts,js}; restored with `git checkout -- frontend/wailsjs`
- 2026-09-28 install4-build: my mistake, a bare `organizer` (to read its usage) launched the installed app as pid 27143 from my shell instead of `open -a`; my kill of it was refused by the permission layer, so that instance is the one left running (v0.2.0-332) and I did not open a second. Nothing was pressed, ruled or posted in it. Quit it from the menu if a Finder-launched instance is wanted
- 2026-09-28 FSE: gate 3 was written wrong by the FSE (the text `organizer status` prints no initiative status). The installed binary's `organizer status --json` lists the seven PLV initiatives as `archived` and camp, organizer, agent-slack as `active` (checked from ~/.local/bin/organizer, v0.2.0-332). That is what gate 3 meant; accepting it is Pablo's.
- 2026-09-28 FSE: superseded by install-current-build-5 (0045); sup13 ended as superseded. Closing this card is Pablo's.
- 2026-09-30: Pablo, 2026-09-30, in the FSE's session: "install the last version possible" (answer to gate 3) and "yes" to moving it to done/. The FSE ran `make install`: Deltagos v0.2.0-635-g83e8450, which contains 2bffd31 and fc26867. The review: fail stays as the reviewer wrote it; no archived-mark card was asked for.
