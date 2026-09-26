---
title: Retiring every seat must not erase the cell, and tests stay out of the real home
status: next
repos: [organizer]
branch: main
updated: 2026-09-16
next: "scan.readCell accepts an empty roster (a cell with no seats is a cell between waves, not a malformed file); retire writes [] not null; TestAttachSessions and any test reaching session.Dir() set XDG_DATA_HOME to a temp dir"
depends_on: []
boundary: ["internal/scan/scan.go (readCell)", "internal/scan/scan_test.go", "internal/scan/agents_test.go", "internal/service/retire.go (the cell.json write)", "internal/service/retire_test.go", "testdata/"]
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

## Next
1. The four gate items
2. Also from that review, not gated: the 22-character ceiling is a bare constant; the worktree needs an ignored `frontend/dist/index.html` to build package main (document in CLAUDE.md)

## Blockers
none
