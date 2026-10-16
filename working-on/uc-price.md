---
title: "Usage hours are active time, and a session with no cost record is priced from a table"
status: now
repos: [organizer]
branch: uc-price
seat: up-build
updated: 2026-10-15
next: "up-build: waiting on sup75 for P4 (FR-3 gap rule vs the audit's 10-minute cap) and forInitiative hours; rest built (ab37c3d, a377b9d, f79465c)"
risk: high
footprint: [internal/usage/ledger.go (Line.active, Ingest, costOf, splitCost), internal/usage/report.go (totals, the model cut), internal/usage/prices.go (new), frontend/src/lib/usage.ts, frontend/src/components/Usage.tsx]
depends_on: [uc-resume]
boundary: ["docs/specs/usage-audit.md Boundary (uc-price)"]
spec: "docs/specs/usage-audit.md (FR-3 to FR-6; 0138)"
gate: "docs/specs/usage-audit.md Acceptance (uc-price), rows P1 to P9 and X0, and P10 (Amendment 1)"
ui_review: false
---

## Goal
The Usage view's hours are active time (messages 5 minutes apart or less), and a session with no cost record is priced from a table the organizer keeps instead of reading $0 (0138, Pablo: "Do as you recommend").

## Gate
docs/specs/usage-audit.md, rows P1 to P9 and X0.

## Notes
Forecast 25-50 min over 1 wave (the FSE; basis: one-card Go tasks here, uc-resume's 0138 forecast); 0138 forecast only uc-resume.
- 2026-10-15, up-build. FR-4: transcripts carry the TTL split (`usage.cache_creation.ephemeral_1h_input_tokens`; 8350 of the last 20 transcripts' messages have 5-minute writes of 0), so cache writes are priced per TTL: `Kinds.CacheWrite1h` (part of `cache_write`, not in Total), the rest at the 5-minute price. Lines kept from before the rebuild have no split and price their writes at 5 minutes.
- FR-3 rebuild: offsets version 4 rereads every transcript once. Not a plain reset: 45 ledger lines (16 Aug, 29 Sep) are of sessions whose transcript Claude Code has deleted, and a reset would have dropped them, tokens and money. Such a session keeps its old lines whole and reads first to last for its days (`activeFor`); a session read again keeps the attribution its old lines had (a reset re-attributed from today's cards, so removed worktrees would read Not attributed). Tokens on the copy are identical main vs branch (W42 1,025,678,985; W41 1,912,536,532; W34 341,852,133).
- Active = stretches of assistant messages (the ledger's messages) per session and local day, sub-agent files included, gap <= 5 min joins; stored per session-day in the offsets so a later pass or file can bridge two stretches.
- P4, not met as written (question to sup75): the audit's 65 h is every gap capped at 10 min (`sum(min(gap,600))`, sess.py in Hephaistos's usage-audit scratchpad), not FR-3's rule. On the audit's msgs.pkl, W42: cap 10m 64.9 h; FR-3 per session-day 28.1 h; cap 5m 47.8 h; <=10m-else-0 40.8 h. Data-dir copy, `usage --week 2026-W42 --json` totals.hours: main 185.9, branch 31.3 (FR-3 as written).
- P7: W34 holds claude-opus-5 and claude-fable-5 only, neither in the table: money `—`, without_cost 7 on main and branch.
- P10 real half: 368c36b6 whole session main $24.00 record, reset; branch $74.71 priced, reset (audit $74.71). W42 total main $465.40, branch $492.50; W41 main $785.10, branch $823.92 (audit $801.82, +2.8%): 368c36b6 and the price split across days and weeks; no session newly without cost.
- Not anticipated: `forInitiative` in frontend/src/lib/usage.ts sums the filtered view's hours from session minutes (first to last); `SessionRow.active` is added in Go, the frontend line waits on sup75 (asked). The source is named in `UsageSessions.tsx` (the Usage view's session list), not `Usage.tsx`, so the priced words are called there. `internal/cli/usage_test.go` expected a lone opus-5-5 session without a cost source to be without cost; FR-5 prices it (f79465c).

