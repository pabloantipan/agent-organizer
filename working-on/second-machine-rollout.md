---
title: Roll the workstation and organizer out to the second Mac
status: now
repos: []
branch: none
updated: 2026-09-16
next: "Push claudecode; on the other Mac follow docs/second-laptop.md from the agent-slack root repo — no organizer sign-in (auth: off, decided 2026-09-16)"
---

## Goal
Both Macs on the same organizer account, same skills, same probe tooling, with
nothing hand-copied.

## Where
| Repo | Branch | State |
|---|---|---|
| ~/organizer | main | 5 commits ahead of nothing: no remote added yet (origin was github.com/pabloantipan/agent-organizer) |
| ~/claudecode | main | workstation commit c4497b4 local; remote github.com/pabloantipan/personal-cloude |

## Done
- Firebase Auth + Firestore native (`organizer` db) sync per user; verified end to end from lodestar
- Local passcode (argon2id in Keychain) and sign-in gate in the app; CLI login/logout/whoami
- Workstation repo: Brewfile, layered install.sh, doctor.sh, SETUP.md; ~/bin and configs are symlinks into ~/claudecode
- Installer: make dmg / make install, release workflow on tags v*
- 2026-09-15 organizer main pushed at d5654c8, untagged; the v0.2.0 tag and the claudecode push are still open
- 2026-09-16 the organizer sign-in step is dropped: auth is off until Entra (no-sign-in and identity-entra cards); cards travel by the agent-slack root repo, not by Firestore sync

## Next
1. `git -C ~/organizer remote add origin git@github.com:pabloantipan/agent-organizer.git && git push -u origin main && git tag v0.2.0 && git push --tags`
2. `git -C ~/claudecode push` (review the pre-existing uncommitted skill edits first; they were left unstaged)
3. Other Mac: clone claudecode, `./install.sh`, then SETUP.md steps; sign in; confirm two machines on the board
4. Set a passcode on this Mac (Settings > Security); `brew install gh` so the release download path works

## Blockers
none

## Notes
- Plan of record: ~/.claude/plans/temporal-doodling-shell.md
- Gotchas that cost time: rules must be released to `cloud.firestore/organizer` (first deploy silently did not); Firestore forbids collection-group queries below the root, pull walks machines/*/initiatives; `wails dev` deletes the release binary on exit
- 2026-09-15 organizer main pushed at d5654c8, untagged; the v0.2.0 tag and the claudecode push are still open
