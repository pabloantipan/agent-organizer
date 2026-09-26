---
title: Crew sessions are named by the cell, inside zellij's budget
status: done
repos: [organizer]
branch: crew-names
updated: 2026-09-16
next: "review: branch crew-names, gate items 1-5 filled, unmerged"
depends_on: []
boundary: [".wt/crew-names/internal/service/crew.go", ".wt/crew-names/internal/service/crew_test.go", ".wt/crew-names/internal/service/retire.go", ".wt/crew-names/internal/service/retire_test.go", ".wt/crew-names/internal/scan/agents.go (the session-to-seat join only)", ".wt/crew-names/testdata/", ".wt/crew-names/CLAUDE.md (one final commit, only this file)"]
spec: "~/agent-slack/docs/runs/2026-09-05-first-wave.md (the trap); ~/.claude/skills/supervise/SKILL.md step 4; ~/agent-slack/ops/cells/camp.json (project and agents)"
gate: "the five items under Gate below"
review: pass
---

## Goal
macOS caps a unix socket path at 104 bytes and zellij spends 79 of them,
so a session name over about 24 characters is refused. `crewSession`
builds `<initiative>-probe-<seat>`, which for ccint-camp-monorepo is 49.
The sessions that actually ran were named by hand `camp-probe-andrea`:
the cell's project and the seat's short name. Make that the rule, so
launch, the agents join and retire all agree. Decided 2026-09-16: the
probe path stays for cells; builders run as subagents.

## Where
| Repo | Branch | State |
|---|---|---|
| organizer | crew-names, worktree .wt/crew-names | from main after the run-gate merge |

## Gate
1. `crewSession(cell, seat)` returns `<cell.Project>-probe-<short>` where short is the seat name after its role prefix (`po_andrea` → `andrea`, `tech_lead_nicolas` → `nicolas`); a name over 22 characters is an error naming the length, never a truncation. Table test
2. `CreateCrew` launches with that name and the prelude exports `AGENT_SESSION` to match
3. The agents join (`service.buildCrew`) and `retire`'s "kill sessions" find seats by the new name; on a fixture cell with five seats and five matching zellij session names, the retire plan lists all five. Test with a fake session list
4. A retire plan on the camp fixture prints the same five names the 2026-09-16 run had to pass by hand with `--kill`
5. `go test ./...` green; the status golden untouched or refreshed and said so

## Done
- 2026-09-16 opened; the trap and its numbers are in ~/agent-slack/docs/runs/2026-09-05-first-wave.md
- 2026-09-16 built on crew-names, five commits, rebased on main (24d8027), unmerged:
  e9a68d1 crewSession + CreateCrew + prelude, 8ed8cf9 retire, 9867e79 scan,
  58f3a7a launch-line test, 72ddce7 CLAUDE.md (plus 10f7f3b progress.md)

## Gate — result
1. done. `crewSession(cell, seat)` = `<cell.Project>-probe-<seat after its role prefix>`; over 22 characters it returns an error naming the length. Table test `TestCrewSessionNamesTheCellAndTheSeat` (nine rows, including ccint-camp-monorepo at 32)
2. done. `CreateCrew` resolves every seat's name before it creates anything, wraps probe on the cell's project and hands it the short name; the prelude exports `AGENT_SESSION` with that name. `TestCrewLaunchOpensTheSessionCrewSessionNames` (no pane opened)
3. done. `buildCrew`, `Retirable`, `PlanRetire` and `scan.AssignAgents` all read the new name; `TestPlanRetireFindsEverySeatsSessionOnTheCampCell` uses a fake session list
4. done. The camp fixture (testdata/cells/camp.json, the five-seat roster) plans camp-probe-{andrea,nicolas,francisco,javiera,mauricio}
5. done. `go test ./...` green; the internal/cli status golden untouched (no fixture was added under testdata/home)

## Next
1. Review the branch and merge it

## Blockers
none

## Notes
- `ZELLIJ_SOCK_DIR` in probe is the other fix and is not this card: it moves the sockets and makes old sessions invisible to `probe -l/-k`
- Found while building, not anticipated:
  - `~/ccint/ccint-camp-monorepo/agents/cell.json` now reads `"agents": null` — retiring every seat wrote it, and `scan.readCell` treats a cell with no seats as malformed ("project and agents are required"), so camp has no cell at all until someone refills the roster. The fixture is the roster as of 409dcc3. Fixing `readCell` is outside this card's boundary
  - `internal/scan` `TestAttachSessions` fails in a sandboxed session because it writes the real `~/.local/share/organizer/runs.jsonl` through `session.RunsPath()`; with HOME set to a temp dir the whole suite is green. Pre-existing on main, and a unit test that touches the real home
  - The worktree has no `frontend/dist`, so `go test ./...` cannot build package main there; an ignored placeholder `frontend/dist/index.html` is enough (`wails build` writes the real one)
  - One case was added to `internal/scan/agents_test.go` for the family join; the card's boundary named only `agents.go`

## Review
Pass: every gate item is demonstrably met by the diff (main..crew-names, six commits).
Unmet gate items: none.
- 1. `crewSession(cell, seat)` = `<cell.Project>-probe-<last underscore token>`; over 22 characters it returns an empty name and an error naming the length — no truncation path exists. Table test, nine rows, including the ccint-camp-monorepo refusal at 32.
- 2. `CreateCrew` resolves every seat's name before creating anything, wraps probe on `si.Cell.Project` and hands it `sanitize(seatShort(seat))`; `~/bin/probe --wrap <proj>` names sessions `<proj>-probe-<name>`, so the pane opens exactly that name, and the prelude exports `AGENT_SESSION` with it.
- 3. `buildCrew`, `Retirable`, `PlanRetire` and `scan.AssignAgents` all read the new name; an unnameable seat joins nothing and is a plan problem, not a silent miss.
- 4. `TestPlanRetireFindsEverySeatsSessionOnTheCampCell` plans camp-probe-{andrea,nicolas,francisco,javiera,mauricio} off `testdata/cells/camp.json`, which matches the roster at 409dcc3; the CLI prints them as "kill sessions".
- 5. `HOME=$(mktemp -d) go test ./...` green, `go vet ./...` clean; `internal/cli/testdata/status.golden` untouched (no diff under `internal/cli/`).

Boundary: the one file outside the card's boundary is `internal/scan/agents_test.go` (one added case, the cell-project family join) plus `progress.md`; CLAUDE.md is its own commit and touches only that file. Not merged.

Reviewer: review session, subagent. Date: 2026-09-16.
