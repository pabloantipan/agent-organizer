---
title: A seat keeps getting its mail past eight drains
status: next
repos: [agent-slack]
branch: main
updated: 2026-09-26
next: "Count the drain ceiling per stop cycle, not per session: a prompt or session start delivers and resets it, a Stop-block chain still stops at the ceiling, and a refused drain says so"
depends_on: []
boundary: ["/Users/pabloantipan/agent-slack/api/internal/api/handlers.go (postDrain)", "/Users/pabloantipan/agent-slack/api/internal/store/store.go (session_drains)", "/Users/pabloantipan/agent-slack/api/internal/api/api_test.go", "/Users/pabloantipan/agent-slack/api/internal/store/store_test.go", "/Users/pabloantipan/agent-slack/api/internal/api/cell_test.go", "/Users/pabloantipan/agent-slack/api/cmd/discuss-hook/main.go (the drain reason)", "/Users/pabloantipan/agent-slack/specs/discuss-spec.md (the drain ceiling section and the env table)", "/Users/pabloantipan/.local/bin/discuss-api (install)"]
spec: "decision 0024; the Goal and Facts below; ~/agent-slack/specs/discuss-spec.md, the drain ceiling"
gate: "the Gate section below"
---

## Goal
The ceiling of 8 delivering drains per Claude session starves a long-lived
seat: at 8 it answers `block:false` with no reason, the hook logs
`nothing_to_deliver`, and `/wait` keeps waking the seat for mail it will never
get (the FSE seat, session 91db5bd3, 2026-09-26 21:20). Pablo ruled it fixed
(0024). The ceiling exists to stop a Stop→block loop; keep that, stop the
starvation.

## Facts (read 2026-09-26)
- `postDrain` handlers.go:211-314; the check at 260-272 (skipped for
  pause/resume); `BumpDrains` store.go:721-736 counts only drains that
  delivered, keyed by session_id; default 8 from `DISCUSS_MAX_DRAINS`
  (config.go:109,126); the spec's table calls it `DISCUSS_MAX_DRAINS_PER_SESSION`.
- The hook drains on Stop, UserPromptSubmit and SessionStart and sends
  `{session_id, stop_hook_active}` (main.go:153-157); it logs any
  `block:false` as `nothing_to_deliver` (main.go:163-165).
- `~/agent-slack/docs/decisions.md:580-627` is why the ceiling exists;
  "delivering past the ceiling" was rejected there for a Stop loop. 0024
  reverses it for deliveries that are not part of a Stop-block chain.
- The hook needs to send the event name if the API cannot tell a Stop drain
  from a prompt drain today.

## Gate
- [ ] 1. A drain on UserPromptSubmit or SessionStart delivers whatever the session's count, and resets it; a test delivers 20 times across prompts to one session
- [ ] 2. Consecutive Stop drains that deliver still stop at the ceiling; `TestDrainCeilingIsAHardStop` passes with its assertions unchanged
- [ ] 3. A refused drain returns a reason, and discuss-hook logs `reason=drain_ceiling`, never `nothing_to_deliver`
- [ ] 4. Pause and resume still reach a seat at the ceiling (`TestPauseReachesASeatAtTheDrainCeiling` green)
- [ ] 5. `discuss-spec.md`'s ceiling section says what counts now and why, and its env table names the variable the code reads
- [ ] 6. `cd ~/agent-slack/api && make test` green; the binary installed at `~/.local/bin/discuss-api` and `launchctl kickstart -k gui/$(id -u)/com.pabloantipan.discuss` run
- [ ] 7. End to end: the organizer FSE seat (`organizer-probe-fse`, session 91db5bd3…) receives its undelivered mail on its next prompt; `curl …/projects/organizer/health` shows fse undelivered 0 afterwards

## Done
- 2026-09-26 cut by the FSE from Pablo's ruling (0024)

## Next
1. Count the ceiling per stop cycle, not per session

## Blockers
none

## Notes
- `~/agent-slack/api` is its own git repo inside `~/agent-slack`; commit each in its own repo, named files only
- The organizer's `capped` health (`discuss.AgentHealth.Capped`, CLAUDE.md Slack paragraph) may read differently after this; not this card's to change
- 2026-09-26 sup1 runs this card (organizer-probe-sup1), spawned by the FSE
