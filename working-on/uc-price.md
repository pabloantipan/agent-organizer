---
title: "Usage hours are active time, and a session with no cost record is priced from a table"
status: now
repos: [organizer]
branch: uc-price
seat: up-build
updated: 2026-10-16
next: "file finding: TestCrewCmdSkipsRunningSeat is flaky (one make test run lost the qa_cleo running line), and organizer usage text prints $0.00 for a week wholly without cost where FR-5 says never $0.00 (both in ## Review, outside the gate)"
review: pass
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
- P4 (Amendment 2), met. Rule table, W42, the audit's msgs.pkl: FR-3 per session-day (<=5 min, longer adds nothing) 28.1 h; 5-min cap 47.8 h; <=10 min else 0 40.8 h; 10-min cap per session (the audit's sess.py) 64.9 h. Fresh data-dir copy at 2026-10-16T02:28:44Z, branch `usage --week 2026-W42 --json` totals.hours **31.47 h** (main on an earlier copy 185.9 h); independent script, FR-3 over the same transcripts cut at that instant (every assistant message by id, sub-agents under the parent, local day, gaps <= 300 s; `.wt-notes/up-build/p4_independent.py`) **31.49 h**, 130 session-days: 0.06% apart, inside 20-45 h.
- P7: W34 holds claude-opus-5 and claude-fable-5 only, neither in the table: money `—`, without_cost 7 on main and branch.
- P10 real half: 368c36b6 whole session main $24.00 record, reset; branch $74.71 priced, reset (audit $74.71). W42 total main $465.40, branch $492.50; W41 main $785.10, branch $823.92 (audit $801.82, +2.8%): 368c36b6 and the price split across days and weeks; no session newly without cost.
- Not anticipated: `forInitiative` in frontend/src/lib/usage.ts sums the filtered view's hours from session minutes (first to last); found, not asked (went to: docs/specs/usage-audit.md Amendment 2, FR-3 covers `forInitiative`): `SessionRow.active` is added in Go and `forInitiative` now sums it (sup75: FR-3 makes the view's hours active time; "one frontend change" names FR-5's words). The source is named in `UsageSessions.tsx` (the Usage view's session list), not `Usage.tsx`, so the priced words are called there. `internal/cli/usage_test.go` expected a lone opus-5-5 session without a cost source to be without cost; FR-5 prices it (f79465c).

## Declared changes
- added `internal/usage/prices.go`: the price table (`Prices`, `Price`), `priceOf`, `priceOfModels`, `priceLine`, `priceLines` (FR-4)
- added `internal/usage/price_test.go`: P1, P2, P3, P5, P6, P8, P10, the gap boundary and the model cut's split
- modified `internal/usage/ledger.go:Kinds`: `CacheWrite1h`, the 1-hour part of cache writes, read from `cache_creation` (FR-4)
- modified `internal/usage/ledger.go:Line`: `Active` seconds (FR-3)
- added `internal/usage/ledger.go:addStretch`, `activeOf`, `activeFor`, `stretch`, `activeGap`, `sessionMeta.Stretches`: active time per session-day, kept in the offsets
- modified `internal/usage/ledger.go:Ingest`: records stretches, sets `Active`, keeps what a rebuild cannot reread
- added `internal/usage/ledger.go:rebuild`: a rebuild keeps sessions whose transcript is gone and the old attribution of sessions read again
- modified `internal/usage/ledger.go:offsetsVersion`: 4, the one-time rebuild for `active` and the TTL split
- modified `internal/usage/ledger.go:costOf`: priced cost for no source (FR-5), the larger for a reset (FR-7)
- modified `internal/usage/ledger.go:splitCost`: days by priced tokens when every day is priced (FR-6)
- modified `internal/usage/report.go:totals`: `Hours` sums `Active` (FR-3)
- modified `internal/usage/report.go:cut`: the model cut splits by priced tokens when every model is priced (FR-6)
- modified `internal/usage/report.go:SessionRow`: `Active`, summed in `sessions`, for `forInitiative`
- modified `frontend/src/lib/usage.ts`: `sessionMoney`, `costFromWords` (FR-5 words); `UsageSession.active`; `forInitiative` sums active time (FR-3, Amendment 2)
- modified `frontend/src/lib/usage.test.ts`: P9 and forInitiative's hours
- modified `frontend/src/components/UsageSessions.tsx`: calls `sessionMoney` and `costFromWords`, where the session list names the cost source
- modified `internal/cli/usage_test.go`: a lone opus-5-5 session without a cost source is now priced (FR-5)
- modified `frontend/wailsjs/go/models.ts`: generated by `wails build` for `SessionRow.active`
- modified `working-on/uc-price.md`: Notes, this declaration
Risky:
- `offsetsVersion` 4: the first ingest after install rereads every transcript (one slow pass) and rewrites the ledger; lines of deleted transcripts are kept, not rebuilt.
- `rebuild.restore`: a session whose sub-agent file is gone but main transcript lives keeps its old lines (stretches of that day dropped, first-to-last hours).
- Week totals move where the split now follows price (W41 $785.10 -> $823.92 on the copy).
Not changed, on purpose:
- `foldCosts`, the post to the record (`internal/service/usagepost.go` maps Kinds field by field, so `cache_write_1h` is not sent).
- `SessionRow.Minutes` and the session list's duration: first to last, as before; FR-3 names hours.
- `internal/service/usage.go`: the rebuild needed nothing there.
- `Usage.tsx`: shows no session money; the words are called in `UsageSessions.tsx`.

## Done
- 2026-10-16, up-build: hours are active time, missing and reset costs priced from the table, split by priced tokens, `$<n> (priced)`; gate P1-P10 and X0 met on f56743a (rebased on main b983ed5); P4 as amended, 31.47 h vs the independent 31.49 h.

## Review
**pass** at ebc95f7 (branch uc-price, detached clean checkout). Unmet gate items: none. Reviewer up-review, 2026-10-16.

`change-check organizer uc-price`, run from the checkout, reads the card from the root's main (no `## Declared changes` there): 10 files, 63 flags (outside boundary 10, outside footprint 6, undeclared 36, untested? 11); every undeclared line is that missing section. Rerun against the branch's card (symlink `organizer` to the checkout, `.wt-notes/up-review/cc-branch.txt`): 40 flags: outside boundary 10, outside footprint 6, undeclared 12, declared, not changed 1, untested? 11. Explained:
- outside boundary (all 10): the tool does not resolve `Boundary (uc-price)`. By hand: `internal/usage/{ledger,report,prices,price_test}.go`, `frontend/src/lib/usage.ts` and `usage.test.ts` are in it. `UsageSessions.tsx` is the session list inside the Usage view, where the cost source is named; the change only imports and calls `sessionMoney`/`costFromWords` (2 lines), what the boundary allows `Usage.tsx`. `internal/cli/usage_test.go`: one assertion that expected FR-5's old behaviour (no cost) now expects a priced one. `frontend/wailsjs/go/models.ts`: generated for `SessionRow.active`, which X0 needs committed. `working-on/uc-price.md`: the card.
- outside footprint (6): the same tests, the generated file, the card and `UsageSessions.tsx`, above.
- undeclared (12): symbols of declared changes the tool reads by first name only. `Kinds.Add`, `counted.grow`, `entry`, `readFrom`: threading `CacheWrite1h` from `cache_creation` (the `Kinds` bullet). `sessionMeta`: declared as `sessionMeta.Stretches`. `stretch`, `activeOf`, `activeFor`: listed in the `addStretch` bullet. `rebuild.restore`: the `rebuild` bullet. `sessionCost`: the comment gains "priced". `report.go:Totals`: the `Hours` comment. `report.go:sessions`: `s.Active +=`, declared in the `SessionRow` bullet ("summed in `sessions`").
- declared, not changed, `ledger.go:offsetsVersion`: a tool miss; the diff changes `const offsetsVersion = 3` to `4`.

Gate:
- P1, P2, P3, P5, P6, P8, P10 (go test half): `go test -count=1 -run 'TestP|TestActiveGap|TestModelCut' -v ./internal/usage/`: all PASS. I read each test against its row. P1 checks 360 s and 0.1 h. P2 splits the passes between 10:03 and 10:04. P3 checks version-3 offsets with `active` stripped, which reads 360 after one ingest. P5 is $30.50 by hand, `priced`. P6 has a haiku token, so null and no `priced`. P8 checks 9.901 and 0.099, summing to 10. P10 checks over → 25 priced reset; under and mixed → 19 record reset. On main they do not compile (`Active`, `Prices`).
- P4 (Amendment 2): I copied the data dir and removed `record_url` from a copied config. Branch `usage --week 2026-W42 --json` gives totals.hours **31.69**. My own script (`.wt-notes/up-review/p4_fr3.py`: assistant messages with id and usage, first timestamp per id, sub-agent files under the parent, local day, gaps ≤ 300 s, cut at the run's instant 2026-10-16T02:3xZ) gives **31.81 h**, 132 session-days. They are 0.4% apart and inside 20-45 h. The Notes keep the four-rule table.
- P7: W34 `this_week` is money 0, without_cost 7 of 7 sessions. Its models are claude-opus-5 (6) and claude-fable-5 (1), neither in the table. The view's `unknownMoney` (usage.ts:80) makes this `—`, with `unknownWords` "no cost recorded for 7 sessions".
- P9: vitest "priced money (usage-audit P9)" passes (`$12.50 (priced)`, `—`).
- P10 (real half): 368c36b6's lines on the copy add up to **$74.71**, `priced`, `reset`, matching the audit's $74.71.
- FR-7: `costOf` takes the larger only when the session is reset and all of its tokens are priced. FR-3 `forInitiative` sums `active/3600`, and vitest expects 1 h, not 3.
- X0: `pnpm install`, then `XDG_DATA_HOME=$(mktemp -d) test-lease run -- make test`. The first run failed in `TestCrewCmdSkipsRunningSeat` (crew_test.go:146, output missing `qa_cleo running`). The rerun passed: go all ok, vitest 759 of 759. Then `pnpm run build`, `wails build` (Built …/Deltagos.app), and `git status --porcelain` is empty (`.wt-notes/up-review/x0.log`, `x0b.log`).

Outside the gate (Note, not blocking; neither touches this diff):
- Note: `TestCrewCmdSkipsRunningSeat` is flaky. It failed once in make test and passed 3 of 3 alone. It is crew code this card does not touch. Not filed: the card stays open for it.
- Note: `organizer usage --week 2026-W34` (CLI text, internal/cli/usage.go:85) prints `$0.00; excludes 7 sessions with no cost` for a week with no cost at all. FR-5 says "never $0.00" of the view, and the view says `—`; the CLI behaves as it does on main. Not filed: the card stays open for it.
- Note: a week's money total does not say "(priced)" for its priced share. FR-5 names only where the source is shown.
