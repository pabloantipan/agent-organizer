---
title: Get both machines onto the board
status: done
repos: []
branch: none
updated: 2026-09-03
next: "wails build, copy build/bin/organizer.app to the other machine, set gcp_project ai-organizer-507419 there, run organizer sync"
---

## Goal
Both machines pushing to ai-organizer-507419 so the board shows everything.

## Where
| Repo | Branch | State |
|---|---|---|
| organizer | none | first sync from lodestar succeeded 2026-09-02 |

## Done
- Superseded by Firebase sign-in: project ai-organizer-507419 now has Firebase Auth (email/password), a native database `organizer`, rules released; first real push and pull from lodestar succeeded 2026-09-03 (9 initiatives)
- Phases 1-3 built: CLI (status, board, sync, doctor, config), Datastore sync, Wails UI
- Project ai-organizer-507419: Firestore API on, database in Datastore mode at southamerica-west1
- First push from lodestar: 4 initiatives, pull round-trips; config at ~/.config/organizer/config.yaml

## Next
1. `wails build`, copy the .app to the other machine, `organizer config --init`, set gcp_project, `organizer sync`
2. Install the working-on skill there too (`git pull` in claudecode, `./install.sh`)
3. Optional: once Java exists somewhere, run the emulator test tag once

## Blockers
none

## Notes
- Plan: ~/.claude/plans/temporal-doodling-shell.md
