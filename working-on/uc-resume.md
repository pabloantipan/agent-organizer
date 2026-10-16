---
title: "A resumed session's money counts every process, not the largest one"
status: next
repos: [organizer]
branch: uc-resume
seat: uc-build
updated: 2026-10-15
next: "review: uc-resume, gate met (A1-A5, X0 as amended by usage-audit Amendment 1)"
risk: high
footprint: [internal/usage/ledger.go (CostSource, foldCosts), internal/usage/ledger_test.go, internal/service/usage.go]
depends_on: []
boundary: ["docs/specs/usage-audit.md Boundary (uc-resume)"]
spec: "docs/specs/usage-audit.md (FR-1, FR-2)"
gate: "docs/specs/usage-audit.md Acceptance (uc-resume), rows A1, A2, A3, A4, A5 and X0"
ui_review: false
---

## Goal
The Usage view's money is right for a woken or resumed seat: each process's cost is added, since Claude Code's total restarts per process (Hephaistos's audit, 2026-10-15: the organizer FSE shows $18.08, the audit $74.71).

## Gate
docs/specs/usage-audit.md, rows A1, A2, A3, A4, A5 and X0.

## Notes
- 2026-10-15, uc-build: (resolved by Amendment 1, eb83092) stopped before committing code. FR-1's premise ("total_cost_usd restarts at 0 in each new process") is false on this Mac's data, and FR-1 as written breaks A4. Question posted to sup75; the FR-1-as-written patch was discarded on sup75's word.
- A5 (FR-2), evidence. Neither cost source restarts per process on a resume: Claude Code restores the session's cost on resume, so both the statusline record and the transcript's `cost-state` are cumulative across processes.
  - runs.jsonl: 35 sessions have more than one pid; in 34 each new pid's open line equals the previous pid's final (aglaea 1030fdd4: 10 pids, 0.22 → 44.40 → 52.81 → 59.66 → 73.56 → 77.52, never down). Its transcript's 10 `cost-state` totals rise the same way.
  - The one drop is 368c36b6 (the FSE): pid 88428 0 → 18.08; pid 28295 opens at 18.08 and ends at 3.02; pid 51126 opens at 3.02 and ends at 5.92. The reset is inside pid 28295, at `/login` (transcript `local_command` /login at 2026-10-15T13:18:09.948Z; the next `cost-state` has `startTime` 1792070289942 = 13:18:09.942Z and 0.18 h of duration, and 51126's keeps that same startTime). A `cost-state` line is written only when a process exits, so pid 28295's peak before `/login` is in no record: not runs.jsonl (open and final lines only), not the transcript.
  - Tokens of 368c36b6 by window (dedupe by message id): 88428 55.3M cache read; 28295 before /login 154.3M cache read, 1.89M cache write, 347k output; after 6.4M; 51126 10.7M. The ~$50 the audit finds missing is the 28295 window before /login, priced only from tokens.
- A3, A4 on a copy of the data dir (`XDG_DATA_HOME` copy, config copy without `record_url` so nothing posted), main vs FR-1 as written: W41 total $781.77 vs $1215.10 (audit $801.82: main is already within 3%, FR-1 is 52% over); W42 total $451.70 vs $572.64; 368c36b6 whole session $18.08 vs $27.01 (W42 share $7.88 vs $11.78; audit $74.71). Largest jumps under FR-1: aglaea 1030fdd4 W42 $14.30 → $98.49, hestia fse 5d1d4216 $3.38 → $13.20, each a resumed session counted once per process.
- So: no fold of the cost records can reach A3 (the money is in no record), and summing per pid double-counts every ordinary resume. What can: keep the max (cumulative) and price the 28295-style reset from tokens, which is uc-price's price table (0138).
- Amended FR-1 on the data-dir copy (config copy without `record_url`), main eb83092 vs branch 8d97409: 368c36b6 whole session $18.08 vs **$24.00, reset** (A3). W41 total $781.77 vs **$785.10** (audit $801.82, −2.1%); the only session above main is 368c36b6, reset, $10.19 → $13.53 (A4). W42 $454.12 vs $456.70, same single session. No other session in runs.jsonl is reset.
- A record's time is runs.jsonl `last_seen` and the live record's `updated_at` (the value as of then); ties order by pid. Two processes of one session running at once would interleave and read as a reset; not seen in the data.
- `frontend/wailsjs/go/models.ts` changed: `wails build` regenerates it from `usage.SessionRow`, which gained `reset`. Generated, not hand-written; no frontend code reads it yet (uc-price's).

## Declared changes
- modified `internal/usage/ledger.go:CostSource`: carries `PID`, `At` (when the record held its value) and the output `Reset`
- modified `internal/usage/ledger.go:foldCosts`: records in time order split into runs at each drop; cost = sum of each run's largest; `Reset` when more than one run
- modified `internal/usage/ledger.go:Line`: `reset` field on a ledger line of a reset session
- modified `internal/usage/ledger.go:sessionCost`: carries `Reset` from the record
- modified `internal/usage/ledger.go:costOf`: passes the record's `Reset`
- modified `internal/usage/ledger.go:splitCost`: writes `Line.Reset` and counts its change as a change
- modified `internal/usage/report.go:SessionRow`: `reset` field
- modified `internal/usage/report.go:sessions`: a session row is reset when any of its lines is
- modified `internal/service/usage.go:Service.Usage`: passes pid and last seen / updated at into each `CostSource`
- modified `internal/usage/ledger_test.go`: `TestFoldCostsRuns` (A1, A2), `TestIngestMarksReset`
- modified `frontend/wailsjs/go/models.ts`: regenerated by `wails build` for `SessionRow.reset`
Risky:
- `foldCosts`: two processes of one session alive at once interleave their records and would read as a reset (sum, an overcount)
- `Line.Reset`: a new ledger field; older ledgers read it as false until the next pass rewrites the cost
Not changed, on purpose:
- `internal/session`: runs.jsonl keeps open and final lines only; the pre-/login peak stays in no record (uc-price FR-7, P10)
- the transcript cost-state reading: cumulative across processes (A5), so its max stays right
- the frontend views: `reset` is not shown yet

## Done
- 2026-10-15 uc-build: FR-1 (Amendment 1) built and gate met: A1, A2 go test; A3 368c36b6 $24.00 reset; A4 W41 $785.10, only the reset session above main; A5 Notes; X0 make test (757 frontend tests), pnpm build, wails build, porcelain empty. Commits c94af78, 8d97409.
