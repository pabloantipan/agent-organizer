---
title: Retiring every seat must not erase the cell, and tests stay out of the real home
status: now
repos: [organizer]
branch: retire-keeps-the-cell
updated: 2026-09-26
next: "review: retire-keeps-the-cell, gate 1-4 met, f5675fe cd4ebce 7aa6230 4e18e76"
depends_on: []
seat: wave1-retire
boundary: ["internal/scan/scan.go (readCell)", "internal/scan/scan_test.go", "internal/scan/agents_test.go", "internal/service/retire.go (the cell.json write)", "internal/service/retire_test.go", "testdata/", "frontend/src/components/Crew.tsx (Bring crew up inert at zero seats)"]
spec: "CLAUDE.md Crew paragraph; ~/agent-slack/ops/cells/camp.json"
gate: "the four items under Gate below"
---

## Goal
Found by the crew-session-names review on 2026-09-16: after `organizer
retire` took all five camp seats, `agents/cell.json` read `"agents": null`
and `scan.readCell` dropped the cell as malformed, so the initiative lost
its cell. Separately, `TestAttachSessions` archives into the real
`~/.local/share/organizer/runs.jsonl` when HOME is real.

## Gate
1. `readCell` accepts `"agents": []` and `"agents": null` as a cell with no seats; the crew block renders "0 seats" and Bring crew up is inert, not absent
2. `retire` writes `"agents": []`, never null; a test retires the last seat and reads the cell back
3. Every test that can reach `session.Dir()` sets `XDG_DATA_HOME` (or HOME) to `t.TempDir()`; `go test ./...` with the real HOME writes nothing under `~/.local/share/organizer` (assert by mtime in the test or by a doc'd check)
4. `go test ./...` green; golden untouched

## Done
- 2026-09-16 opened from the crew-session-names review
- 2026-09-26 wave1-retire, branch `retire-keeps-the-cell` rebased on main (f5675fe cd4ebce 7aa6230 4e18e76), unmerged. Gate:
  1. `TestReadCellAcceptsAnEmptyRoster` (empty, null, noproject; fixtures `testdata/cells/*.json`): `[]` and `null` read as a cell with zero seats, no project is still a problem. `Crew.tsx`: the button stays rendered with `disabled={busy || seats.length === 0}`; `AgentsView.tsx` already renders `· {g.crew?.length ?? 0} seats`, so "· 0 seats" (read, not edited). `npx tsc --noEmit` OK.
  2. `TestRetireOfTheLastSeatKeepsTheCell`: PlanRetire of a temp cell's only seat, writeCell, file has `"agents": []` and its other fields, `scan.ReadInitiative` gives cell rpex with 0 seats and no problem; fails with the fix removed.
  3. Only `TestAttachSessions` reached the real dir (every scan/service/cli test run alone under a fake HOME seeded with a stale session record); it now sets `XDG_DATA_HOME`. Check with the real HOME, XDG_DATA_HOME unset: `touch stamp; go test -count=1 ./...; find ~/.local/share/organizer -newer stamp -type f` listed `state.json` (the running organizer.app, pid 71147, already rewriting it 10 s before the stamp) and `sessions/96219.json` (pid 96219 is this builder session's own statusline). No runs.jsonl, nothing else. Same run under an empty fake HOME: no file written.
  4. `go vet ./... && go test -count=1 ./...` all ok after the rebase; `git diff --name-only main...retire-keeps-the-cell -- internal/cli/testdata` empty.

## Next
1. The four gate items
2. Also from that review, not gated: the 22-character ceiling is a bare constant; the worktree needs an ignored `frontend/dist/index.html` to build package main (document in CLAUDE.md)

## Blockers
none
- 2026-09-26 sup4 runs this card (organizer-probe-sup4), spawned by the FSE (0025)

## Notes
- 2026-09-26 sup4: boundary widened by one file, `frontend/src/components/Crew.tsx`: with zero seats the button reads "Bring crew up" and is enabled (`off === seats.length` is 0 === 0), so gate 1's "inert" needs it. Builder seat `wave1-retire`, branch and worktree `.wt/retire-keeps-the-cell`.
- 2026-09-26 wave1-retire: `.gitignore`'s `agents/` matches at any depth, so cell fixtures live flat in `testdata/cells/` and the test copies them into a temp `agents/cell.json`. The worktree has no `package-lock.json`, so `npm ci` fails there; tsc ran through a temporary symlink to the main checkout's node_modules.
