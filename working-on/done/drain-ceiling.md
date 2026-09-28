---
title: A seat keeps getting its mail past eight drains
status: done
repos: [agent-slack]
branch: main
updated: 2026-09-26
next: "review: main in agent-slack/api and agent-slack/specs, gate 1-7 met, api 8991640 0c9f33e, specs aac17ee"
depends_on: []
review: pass
seat: w1b
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
- [x] 1. A drain on UserPromptSubmit or SessionStart delivers whatever the session's count, and resets it; a test delivers 20 times across prompts to one session
- [x] 2. Consecutive Stop drains that deliver still stop at the ceiling; `TestDrainCeilingIsAHardStop` passes with its assertions unchanged
- [x] 3. A refused drain returns a reason, and discuss-hook logs `reason=drain_ceiling`, never `nothing_to_deliver`
- [x] 4. Pause and resume still reach a seat at the ceiling (`TestPauseReachesASeatAtTheDrainCeiling` green)
- [x] 5. `discuss-spec.md`'s ceiling section says what counts now and why, and its env table names the variable the code reads
- [x] 6. `cd ~/agent-slack/api && make test` green; the binary installed at `~/.local/bin/discuss-api` and `launchctl kickstart -k gui/$(id -u)/com.pabloantipan.discuss` run
- [x] 7. End to end: the organizer FSE seat (`organizer-probe-fse`, session 91db5bd3…) receives its undelivered mail on its next prompt; `curl …/projects/organizer/health` shows fse undelivered 0 afterwards

## Done
- 2026-09-26 cut by the FSE from Pablo's ruling (0024)
- 2026-09-26 21:42 w1b: gate 1-6 met. api `8991640` (postDrain: `event` field; UserPromptSubmit/SessionStart reset the count via new `store.ResetDrains` and are never counted or refused; a refusal answers `{block:false, reason:"drain_ceiling"}`; no `event` counts as before), `0c9f33e` (discuss-hook sends `event`, logs the refusal reason); specs `aac17ee` (new "The drain ceiling counts per stop cycle" subsection, /drain pseudocode and table row, env table `DISCUSS_MAX_DRAINS`). Evidence: 1 `TestPromptDrainsDeliverPastTheCeiling` (20 prompt/session-start deliveries to one session past a spent ceiling, then 3 Stop deliveries and a refusal, then an empty prompt resets) + `TestResetDrainsStartsTheCycleOver`; 2 `TestDrainCeilingIsAHardStop` PASS, diff to it empty; 3 built hook against a stub server: hook.log `event=Stop exit=0 reason=drain_ceiling`, and `reason=nothing_to_deliver` for a reasonless block:false; 4 `TestPauseReachesASeatAtTheDrainCeiling` PASS; 5 spec as above; 6 `make test` green, `make install` put both binaries (vcs.revision 0c9f33e, unmodified) in ~/.local/bin, `launchctl kickstart -k` at 21:41:36, /healthz 200. Gate 7 baseline after install 21:41:58: fse undelivered 4, deaf true, watcher alive, last drain 21:36:36 (Stop, old binary)
- 2026-09-26 21:44 w1b: gate 7 met. The fse session 91db5bd3 took its next prompt on its own (not forced): hook.log `21:44:30.169 drain session=91db5bd3-… event=UserPromptSubmit exit=0 mode=context delivered=4 bytes=3199`; organizer /health at 21:44:34: fse undelivered 0, deaf false, last drain 4s ago, watcher alive

## Review
- Verdict: pass. Unmet gate items: none. Reviewer r1b, 2026-09-26.
- Checked: api diff 6a52699..0c9f33e and specs aac17ee read; `TestDrainCeilingIsAHardStop` untouched by the diff; `go test -race -count=1 ./...` green; installed discuss-api and discuss-hook carry vcs.revision 0c9f33e unmodified, and the installed hook and a fresh build of main both send `event` and log `reason=drain_ceiling` against a stub; organizer /health 21:46:22: fse undelivered 0, deaf false, last drain 2 s ago.
- Not covered by the gate: nothing tests that an agent-to-agent wake loop stays bounded now that every asyncRewake resets the ceiling (see Notes); the running discuss-api started 21:44:57, after the recorded 21:41:36 kickstart, cause not recorded; the review brief's spec diff (`c5635f8` in ~/agent-slack) names a commit the specs repo does not have.

## Next
1. Count the ceiling per stop cycle, not per session

## Blockers
none

## Notes
- `specs/` is its own git repo (the spec commit is there, not in `~/agent-slack`)
- No config.go change: the code reads `DISCUSS_MAX_DRAINS`; the spec table was the one that was wrong
- An asyncRewake wake and the external watcher's typed wake both arrive as UserPromptSubmit, so after this nearly every wake resets the ceiling; the bound on agent-to-agent ping-pong is now `WAKE_PER_MIN`, the wake budget and the agreement stall, and the ceiling bounds one wake's Stop chain (written into the spec's Why)
- An external watcher that spent its wake budget on a starved seat stays silent until the undelivered count falls, so a seat starved before this install drains on a human prompt, not on its own watcher
- `~/agent-slack/api` is its own git repo inside `~/agent-slack`; commit each in its own repo, named files only
- The organizer's `capped` health (`discuss.AgentHealth.Capped`, CLAUDE.md Slack paragraph) may read differently after this; not this card's to change
- 2026-09-26 sup1 runs this card (organizer-probe-sup1), spawned by the FSE
