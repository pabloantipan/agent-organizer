---
title: The installed organizer is main, with rule-anyone
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "decide: pablo, gate 3 cannot hold as written: organizer status prints no initiative status, so the seven archived initiatives are listed like active ones (read-only, 2bffd31, is frontend-only); accept the installed commit containing 2bffd31 plus the initiative.yaml list as gate 3, or open a card for an archived mark in organizer status?"
depends_on: [rule-anyone]
boundary: ["build/ (the build output)", "/Applications/organizer.app (install target)", "~/.local/bin/organizer (the symlink make install writes)", "no source file in the repo"]
spec: "Pablo, 2026-09-28: \"Reinstall\" (0041), then \"I see nothing happening?\" after the read-only card merged past the installed v0.2.0-301; CLAUDE.md, Packaging"
gate: "the Gate section below"
review: fail
---

## Goal
The installed app (v0.2.0-301) predates the read-only card (2bffd31) and the
merge of odyssey's initiative description and specs (fc26867). Install main.

## Gate
- [x] 1. `make install` from a clean `main` at that contains rule-anyone succeeds (its output tail; the closing line may read `-dirty`, a known Makefile quirk)
- [x] 2. `/Applications/organizer.app/Contents/MacOS/organizer version` and `organizer version` on PATH both print `git describe` of `main` at install time, with no `-dirty`
- [ ] 3. `organizer status --json` from the installed binary lists the seven PLV initiatives as `archived`
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
- Pablo may be using the app; rule nothing in it
- 2026-09-28 sup14 runs this card after rule-anyone lands; it supersedes install-current-build-4
