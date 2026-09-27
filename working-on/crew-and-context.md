---
title: Spawn a persona crew and show each agent's context fill
status: now
repos: []
branch: main
updated: 2026-09-27
next: "When a camp seat asks Pablo something, Rule that row from Needs me (decision + next action) and confirm the seat wakes and the ruling shows under Solved; then this card goes to review"
---

## Goal
One click brings every seat of an initiative's `agents/cell.json` up as its own
probe with its discuss identity, and the Agents tab shows per persona what is
running, whether discuss can wake it, and how full its context window is.

## Where
| Repo | Branch | State |
|---|---|---|
| ~/organizer | main | crew verb, statusline record store, discuss health client, crew UI; uncommitted |
| ~/claudecode | main | `bin/probe` learned PROBE_PRELUDE_FILE and PROBE_PROMPT_FILE; unstaged with the other skill edits |

## Done
- `organizer crew <id> [--print]` and the Bring crew up button: one iTerm2 window, one tab per seat, token fetched at launch via `discuss-api token env`, opening prompt on the first run only
- `organizer statusline` records context fill per agent pid under `~/.local/share/organizer/sessions`; installed as the statusLine in `~/.claude/settings.json`
- Scan reads persona and cell from the process environment (`ps -E`) and `agents/cell.json` from the root; discuss health joined per seat
- Crew seats start on `crew_model` (default opus) through `ANTHROPIC_MODEL` in the prelude; `cell.json` `model` overrides per cell. Before this they inherited the machine's Fable default
- Slack tab (2026-09-05, 09-06): the agent-slack view remade as Teams Chat on the agents feed: chats list (needs me, channel, one direct chat per seat, journal, archive; activity counts), one chat's timeline with threads under subject dividers, one message box docked at the bottom targeting the thread last touched or a new one, needs-me as a worklist (threads asking you plus cards addressed to you, Discuss and Solved per row, collapsed Solved list, marks synced in the order doc), my notes on a card carried into the discussion, People panel toggled from the header, Discuss actions on the card back, branch a side thread from any message (`re:` subject convention), kinds and decisions kept visible, search, card links. Agents stays lifecycle; Message on a row jumps to Slack
- Retire and clean (2026-09-08): `organizer retire` / Retire… on a crew block does the end-of-wave cleanup the rpex card spelled out by hand (sessions, mailbox, tokens, cell.json, crew files), plan first, `--run` to do it; `organizer clean` / Clean exited between waves
- Rail groups (2026-09-05): named sections of the priority list stored in the order doc, seeded from client, drag across and between, rank numbers stay global
- Agents tab: crew block per cell with state, watcher (alive, stale, never, deaf), context bar; persona and context on every agent row
- 2026-09-06 Rule on a needs-me row: an inline box (decision, one-line next action, recipient) posts one `decision` into the thread (reopening an escalated one first) or a new thread named after the card, marks the row solved, and the Solved list reads the ruling back from the thread. The card file stays the agents'; the next action reaches the seat as the decision's last line
- 2026-09-15 committed and pushed: main 14c16d5..d5654c8 (four commits by layer: chore, Go, frontend, CLAUDE.md), build, vet, tests and tsc green; run-gate branch pushed too, still unmerged
- 2026-09-15 v0.2.0 tagged, pushed, built and installed to /Applications; the CLI symlink and the statusLine follow it; app relaunched

- 2026-09-27 camp revived (agent-slack decisions.md): roster restored from agents/cell.json at HEAD, tokens reissued, the 09-06 backlog marked read, cell resumed (after reopening its pause thread: agent-slack resume-after-retire card), five seats up fresh through `organizer crew`, watchers alive

## Next
1. Relaunch and rule one real row; reply on a real thread from Slack and confirm the wake; then phase 2: thread members in the discuss API (agent-slack card: a membership table, the inbox query, one line in the discuss skill) so a subgroup chat exists; then a member picker on the new-conversation form; start a thread from a card
2. Phase 3 needs two calls from Pablo: do builders post claim/status/done at all (the supervise skill says do not load discuss), and is the supervisor seat Pablo's token or a spawned session; then the wave board
3. Commit organizer, push, and tag; commit the probe change in claudecode with the skill edits; second Mac gets `make install` and the statusLine line

## Blockers
none

## Notes
- The first statusline record for a process appears on its next turn; idle sessions keep their last value, which is correct
- Health comes from the human's discuss token in `~/.local/state/discuss/tokens.json`; when the API is down the crew block says so instead of guessing
- 2026-09-07 branch `run-gate` (in done/run-gate.md) vendored model.go, config.go, prompt.go and session/ byte-identical from this card's uncommitted tree; commit this card first, then merge run-gate and route the scan-side `session.Prune` through `session.Retire` so pruned records are archived to runs.jsonl
- 2026-09-15 committed and pushed: main 14c16d5..d5654c8 (four commits by layer: chore, Go, frontend, CLAUDE.md), build, vet, tests and tsc green; run-gate branch pushed too, still unmerged
