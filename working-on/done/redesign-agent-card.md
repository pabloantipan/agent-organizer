---
title: Each live agent is joined to the card it works
status: done
repos: [organizer]
branch: redesign-agent-card
updated: 2026-09-26
review: pass
next: "review: redesign-agent-card, gate G4, G9, G17 met, a21793a dccaa85"
seat: wave1-agentcard
depends_on: []
boundary: ["internal/model/model.go (Agent: its card; nothing else)", "internal/service/cardjoin.go (new)", "internal/service/cardjoin_test.go (new)", "internal/service/service.go (agentOptions, RefreshAgents wiring)"]
spec: "docs/specs/redesign.md (FR-6 to FR-8); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G4, G9, G17; the Gate section below"
---

## Goal
The redesign, wave 1 of 2: FR-6 to FR-8 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [x] G4: see `docs/specs/redesign.md`, Acceptance
- [x] G9: see `docs/specs/redesign.md`, Acceptance
- [x] G17: see `docs/specs/redesign.md`, Acceptance

## Review
- 2026-09-26 **pass**. Gate G4, G9, G17 all met by the diff (`a21793a`, `dccaa85`).
  - **G4** re-run: `XDG_DATA_HOME=$(mktemp -d) go test ./internal/service/ -run 'Join|OpenCards|ParseETime' -v` → all PASS, `ok organizer/internal/service 0.278s`. The three keys are in FR-6's order (`matchByPlace` calls `session.MatchCard`, which tries the path element then the branch, before `matchBySeat`), FR-7's two-cards-is-no-card holds at both key kinds (`TestJoinAgentTwoCardsAnswer`), and FR-8's four numbers ride on `model.CardJoin` (`TestJoinAgentCardsCarriesStateContextAndStart`: state, 41 %, 212000 tokens, start = sample less ps elapsed).
  - **G9** re-run in the worktree: `XDG_DATA_HOME=$(mktemp -d) make test` → `go vet` clean, every package `ok` or no test files. No `status.golden` refresh, and none needed: the join reaches no CLI output.
  - **G17** re-run: `git diff --name-only main...redesign-agent-card -- '*.css'` → empty.
  - **Boundary** clean: the branch touches exactly the four files it names. `model.go` adds one field to `Agent` and the new `CardJoin` it points at; no other struct changed.
  - Main moved to `1092f6e` (redesign-runs-binding merged) after the branch was cut; `git merge-tree` merges clean and the two branches' files are disjoint.
- Unmet gate items: none.
- Not in the gate, for whoever comes next:
  - `Service.Scan` does not join, so the cached and synced `model.Snapshot` carries no card until the first 10 s `RefreshAgents` tick. The card's Notes say so; one line in `Scan` closes it.
  - FR-7 is applied per key, not per agent: an agent whose place matches two cards but whose seat matches one is joined to the seat's card. Defensible, and `session.MatchCard` cannot express the difference, but FR-7 read strictly says none. A ruling for Pablo, not a change to make here.
  - `frontend/wailsjs` is not regenerated, so the TS `model.Agent` has no `card`. Wave 2 must run `wails generate module` before a view reads the join.
- Reviewer: `wave1-review-agentcard`, 2026-09-26.

## Done
- 2026-09-26 cut from the redesign spec by the FSE
- 2026-09-26 the join built on `redesign-agent-card` (a21793a `model.Agent.Card` + `model.CardJoin`; dccaa85 `internal/service/cardjoin.go` and the `RefreshAgents` wiring). Gate met:
  - **G4** `internal/service/cardjoin_test.go`: `TestJoinAgent` (a worktree path element, a seat when the place does not answer, a seat for a session with no directory, plus exited, shell and out-of-root cases), `TestJoinAgentByBranch` (the checkout's branch), `TestJoinAgentTwoCardsAnswer` (two cards on one branch, two cards on one seat), `TestJoinAgentCardsCarriesStateContextAndStart` (state, 41 %, 212000 tokens, start = sample less ps elapsed), `TestJoinAgentWithoutStatusline`, `TestOpenCardsSkipsFinished`, `TestParseETime`. `XDG_DATA_HOME=$(mktemp -d) go test ./internal/service/ -run 'Join|OpenCards|ParseETime' -v` → all PASS, `ok organizer/internal/service 0.598s`
  - **G9** `cd .wt/redesign-agent-card && XDG_DATA_HOME=$(mktemp -d) make test` after the rebase onto main → `ok organizer/internal/service 0.781s`, every other package `ok` or no test files; no `status.golden` refresh needed (the join reaches no CLI output)
  - **G17** `git diff --name-only main...redesign-agent-card -- '*.css'` → empty (the branch touches four Go files only)

## Next
1. review: `redesign-agent-card` is rebased on main and unmerged; a reviewer that is not the builder checks it and moves the card

## Blockers
none

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- The join is wired into `RefreshAgents` only, which is what this card's boundary names and covers every reader of the agents view (`app.go`, `internal/cli` line 482). `Service.Scan` is outside the boundary, so the cached and synced `model.Snapshot` carries no join until the first 10 s tick. One line in `Scan` would close it.
- `Service.branchOf` takes `s.mu` and `RefreshAgents` already holds it, so the join takes the lock-free `agentOptions().BranchOf` (`branchIn(s.repoBranchesLocked())`) — the same answer `branchOf` computes. `branchOf` and `session.MatchCard` are unchanged.
- `session.MatchCard` returns the same "no" for absent and ambiguous and may not be edited, so the seat key runs whenever the place keys give no card. Two cards on one seat is still no card (FR-7 applied per key). If the reviewer wants an ambiguous path to beat an explicit seat, that is a change to `MatchCard`, not here.
- The statusline writes no start time, so `StartedAt` is the sample time less ps's elapsed time (`Agent.Uptime`), zero for a session with no process of its own. `runs.jsonl`'s `FirstSeen` is the alternative and belongs to `redesign-runs-binding`.
- `frontend/wailsjs` is not regenerated (outside the boundary): the TS `model.Agent` has no `card` until wave 2 runs `wails generate module`.
- Phases, choices and the found-not-asked list: `.wt-notes/wave1-agentcard/progress.md` (untracked).
- 2026-09-26 sup2 runs this card (organizer-probe-sup2), spawned by the FSE after 0023; seat wave1-agentcard, worktree .wt/redesign-agent-card, branch redesign-agent-card
