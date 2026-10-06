---
title: Every Claude session's tokens by kind and money, per day, attributed to initiative, role and task, and organizer usage
status: now
repos: [organizer]
branch: usage-ledger
seat: ul-build
stage: one-window
updated: 2026-10-06
next: "review: usage-ledger, gate met (G1-G5, X0; review findings and FR-2 Amendment 1 folded in), 7594a07"
review: fail
depends_on: []
boundary: ["internal/usage (new) and its tests and testdata", "internal/service (one Usage method), internal/cli (the usage command), app.go (one bound method), frontend/wailsjs regenerated", "not: internal/session record format, the runs.jsonl writer"]
spec: "docs/specs/usage.md (FR-1 to FR-4)"
gate: "docs/specs/usage.md Acceptance, rows G1 to G5 and X0"
ui_review: false
---

## Goal
0098: tokens consumed and money, as clear as possible, weekly, in Deltagos.

## Gate
docs/specs/usage.md, G1 to G5 and X0.
- [x] G1 `TestIngestSumsOncePerMessageAndRereadsNothing`: msg_1 streamed 3× with growing usage (a mid-stream snapshot, then its final usage) counted once at its final usage; msg_3's stream straddles two passes and adds only what grew; the sub-agent's 10 tokens on its parent; second pass 0 bytes, no change. `TestCrashBetweenRenamesDoesNotDoubleCount`: a crash between the ledger and offsets renames rebuilds instead of counting twice
- [x] G2 `organizer usage --week 2026-W40 --json` = `.wt-notes/ul-build/g2_sum.py 2026-W40` (last line per id) to the token: input 25,443 · output 6,979,139 · cache read 2,084,340,296 · cache write 38,419,158 · 2,129,764,036 tokens, 205 sessions, both. Money W40 $894.53 (202 sessions from the record, 3 from the transcript), W41 $328.82 so far (45 sessions); without cost 0 in both weeks. Whole ledger: 361 sessions, 299 record, 50 transcript, 12 without cost
- [x] G3 `TestCostFourCases` (Amendment 1): a record ($3, split by tokens; the transcript's own $9.50 does not override it); transcript only ($1.00, split $0.25/$0.75); a $0 record the transcript prices at $61.50 takes $61.50; neither is `cost: null`, `without_cost: 1`. Each line says `cost_from`: record or transcript. `TestOldOffsetsRebuild`: older offsets are dropped and the ledger rebuilt, so sessions read before get their transcript cost
- [x] G4 `--week 2026-W41 --by task` on the real home: rlf-build/review/ui under ruled-line-floor, fi3-build/review/ui under floating-icon-3, sup46 under the wave row `sup46 · floating-icon-3, ruled-line-floor`; none Not attributed (output under Done)
- [x] G5 `--by role` 2026-W41: builder, ui reviewer, supervisor, pair, reviewer, fse, then Not attributed (0 this week: every W41 session has a role; its reasons print when there are some, `TestUsageCmdOverATranscript`)
- [x] X0 fresh clone of 7594a07 under .wt-notes/ul-build: `XDG_DATA_HOME=$(mktemp -d) make test` (go all ok, vitest 279), `npm run build`, `wails build` all exit 0; clone removed
- Scan cost on the real home (467 transcripts, 1.17 GB): first run (a rebuild) 5.42 s, second 0.14 s

## Notes
- 0099 ruled 2026-10-06; supervisor sup47, spawned by the FSE.
- Cost source (FR-2): runs.jsonl misses money. 62 of 360 sessions have no recorded cost; 51 of them carry a transcript `cost-state` worth $3,371.94, against $1,202.41 recorded for the rest. Some runs say $0 for sessions the transcript puts at $61 and $78 (a $0 record is now read as "no cost", not $0). Where both exist they agree within 0.2% ($1,202.41 vs $1,200.10). Kept the spec's source; question posted to sup47.
- Supervisors: real cards name them in Done/log bullets ("sup43 launched fic-build", "- 2026-10-05 sup40: ..."), not only under ## Notes, so the match reads the whole card body as actor forms; a passing mention ("left by sup43") does not count. A supervisor of several cards is one wave task `supN · a, b`.
- Choices (ledger fields, offsets, role table, JSON shape): .wt-notes/ul-build/progress.md.

## Done
- 2026-10-06 ul-build: internal/usage (ledger, attribution, report) 7127349; Service.Usage af16dae; `organizer usage` 107fa7b; App.Usage + wailsjs 2b5e941 (SHAs after the rebase on 04f3f34).
- 2026-10-06 ul-build, rework after ul-review's fail at 0c8a44b and FR-2 Amendment 1: 78edf49 (transcript cost-state fallback, cost_from), fe61b49 (bindings), 7594a07 (a streamed message at its final usage, also across passes; ledger and offsets on one generation, fsynced). Branch usage-ledger rebased on main 04f3f34, unmerged.

G4, `organizer usage --week 2026-W41 --by task` (at 7594a07):
```
2026-W41 · 2026-10-05 to 2026-10-11 · lodestar only
money  $328.82, -63% on last week ($894.53)
tokens  810.2M: cache read 790.3M · cache write 17.6M · output 2.3M · input 8k
sessions  45, 136.3 h of work, 9 running (so far)

by task
name  money  share  tokens  input  output  cache read  cache write  sessions  
organizer/decisions-still  Decisions holds still - the view moves by itsel…  $41.82  13%  114.3M  1k  311k  112.3M  1.6M  5  
  builder organizer-probe-dst-build, reviewer organizer-probe-dst-review, reviewer organizer-probe-dst-review, ui reviewer organizer-probe-dst-ui, supervisor organizer-probe-sup41  
organizer/floating-icon-2  Floating icon, second pass - double-click opens…  $28.14  9%  60.1M  785  216k  58.3M  1.5M  5  
  builder organizer-probe-fi2-build, reviewer organizer-probe-fi2-review, ui reviewer organizer-probe-fi2-ui, ui reviewer organizer-probe-fi2-ui, supervisor organizer-probe-sup44  
organizer/decisions-line-and-names  The Ruled line never widens the board (no sidew…  $25.71  8%  70.0M  905  231k  68.9M  892k  5  
  builder organizer-probe-dln-build, reviewer organizer-probe-dln-review, ui reviewer organizer-probe-dln-ui, reviewer organizer-probe-dln-x1, supervisor organizer-probe-sup45  
organizer/floating-icon  Deltagos floats as an icon on other desktops; c…  $24.22  7%  73.5M  653  214k  72.6M  661k  3  
  builder organizer-probe-fic-build, reviewer organizer-probe-fic-review, ui reviewer organizer-probe-fic-ui  
hestia/kb-forward  The forwarder carries kb rows to Hestia, keyed…  $20.59  6%  42.6M  298  168k  41.3M  1.1M  1  
  builder hestia-probe-w4-kbforward  
organizer/ruled-line-floor  The Ruled line drops its chosen option cleanly,…  $16.48  5%  47.4M  592  158k  46.8M  496k  3  
  builder organizer-probe-rlf-build, reviewer organizer-probe-rlf-review, ui reviewer organizer-probe-rlf-ui  
organizer/floating-icon-spike  Spike - can Deltagos float as a native icon on…  $14.90  5%  27.5M  398  133k  26.5M  859k  3  
  builder organizer-probe-fis-build, reviewer organizer-probe-fis-review, supervisor organizer-probe-sup42  
organizer/roles-and-needs-me-five  Needs me shows its oldest five then "Show the o…  $14.45  4%  36.1M  469  127k  35.4M  598k  4  
  builder organizer-probe-rn5-build, reviewer organizer-probe-rn5-review, ui reviewer organizer-probe-rn5-ui, supervisor organizer-probe-sup40  
organizer/floating-icon-3  The floating list ends at its last row, the ico…  $13.78  4%  38.1M  460  129k  37.5M  462k  3  
  builder organizer-probe-fi3-build, reviewer organizer-probe-fi3-review, ui reviewer organizer-probe-fi3-ui  
organizer/usage-ledger  Every Claude session's tokens by kind and money…  $8.55  3%  19.1M  231  111k  18.7M  317k  2  
  builder organizer-probe-ul-build, reviewer organizer-probe-ul-review  
organizer/floating-icon+usage-ledger  sup43 · floating-icon, usage-ledger  $5.64  2%  15.8M  193  51k  15.6M  171k  1  
  supervisor organizer-probe-sup43  
organizer/floating-icon-3+ruled-line-floor  sup46 · floating-icon-3, ruled-line-floor  $3.99  1%  9.9M  142  44k  9.8M  140k  1  
  supervisor organizer-probe-sup46  
hestia/hestia-deploy  A new record image reaches Hestia by one line P…  $2.03  1%  3.2M  66  16k  3.0M  218k  2  
  builder hestia-probe-w3-deploy, reviewer hestia-probe-w3-review-deploy  
organizer/usage-ledger+usage-view  sup47 · usage-ledger, usage-view  $1.95  1%  3.6M  67  20k  3.5M  104k  1  
  supervisor organizer-probe-sup47  
Not attributed  $106.59  32%  248.9M  1k  328k  240.1M  8.5M  6  
  3: a fse session works on no single card  
  1: a pair session works on no single card  
  1: no card names sup3 as its supervisor  
  1: no initiative root above /Users/pabloantipan  
```

G5, `organizer usage --week 2026-W41 --by role` (at 7594a07):
```
2026-W41 · 2026-10-05 to 2026-10-11 · lodestar only
money  $328.82, -63% on last week ($894.53)
tokens  810.2M: cache read 790.3M · cache write 17.6M · output 2.3M · input 8k
sessions  45, 136.3 h of work, 9 running (so far)

by role
name  money  share  tokens  input  output  cache read  cache write  sessions  
builder  $115.93  35%  308.5M  3k  1.1M  303.1M  4.3M  11  
fse  $70.75  22%  201.8M  843  194k  197.4M  4.3M  3  
ui reviewer  $47.98  15%  140.9M  2k  425k  139.1M  1.4M  8  
supervisor  $40.93  12%  81.8M  1k  293k  79.2M  2.3M  9  
pair  $32.15  10%  40.9M  387  119k  36.8M  4.0M  2  
reviewer  $21.07  6%  36.3M  699  171k  34.8M  1.3M  12  
Not attributed  $0.00  0%  0  0  0  0  0  0  
```

## Review
- Verdict: **fail** at 0c8a44bf7e76f4563bb83adb47939fc377829d58 (branch usage-ledger). Unmet: G2. G3 pending (FR-2/G3 amended in 517b3a5 while this review ran; sup47 asked for G3 to be judged only at the new SHA). G1, G4, G5, X0 met.
- X0: fresh clone at 0c8a44b, `XDG_DATA_HOME=$(mktemp -d) make test` (go all ok, vitest 279), `npm install && npm run build`, `wails build` all exit 0.
- G1: `TestIngestSumsOncePerMessageAndRereadsNothing` passes and tests what the row says (msg_1 ×3 once, sub-agent on its parent, split by day, second pass 0 bytes). Its fixture repeats msg_1 with identical usage, which real transcripts do not (below).
- G2 (unmet): on a fresh ledger (copies of runs.jsonl and sessions/) W40 prints input 25,443 · output 6,890,421 · cache read 2,084,340,296 · cache write 38,419,158 = 2,129,675,318, 205 sessions; my own script (.wt-notes/ul-review/check/mysum.py) gets exactly that when it takes each message id's *first* line. But the first line is a partial snapshot: on the real home 634 repeated ids carry different usage across their lines, always output_tokens growing (e.g. thinking line 7, final tool_use line 846, same id, stop_reason null then tool_use). Summing each id's final line gives output 6,979,139 (+88,718, 1.3% of W40 output). The ledger undercounts output; the builder's script shares the choice, so the match proves nothing. A fix must take the final usage per id and, when a stream straddles two passes (`LastID`), add the delta.
- G4: W41 by task, fresh ledger: rlf-build/review/ui under organizer/ruled-line-floor, fi3-build/review/ui under organizer/floating-icon-3, sup46 under `sup46 · floating-icon-3, ruled-line-floor`; none Not attributed.
- G5: by role W41: builder, ui reviewer, supervisor, pair, reviewer, fse, then Not attributed ($0, 0 sessions, so no reasons this week; the reason path is tested in `TestUsageCmdOverATranscript`). Task cut's Not attributed gives reasons (fse ×3, pair, `no card names sup3` for hestia-probe-sup3, `no initiative root above ~` for probe-hefesto).
- Second pass: 0 files read, 0 bytes, unchanged. First pass 5.0 s over 468 files, 1.18 GB.
- Boundary: every changed path inside it; internal/session and the runs.jsonl writer untouched; no network or exec in the new code. Local days and local Monday weeks throughout, no UTC edge error.
- Durability (not gated): ledger and offsets are two separate renames, ledger first; a crash between them re-reads the grown bytes next pass and double counts them. No fsync before rename.
- Cost evidence (not deciding): at 0c8a44b a $0 record is read as no cost; FR-2 as first written gave no-cost only to a session with no record, so that was outside it; Amendment 1 now addresses $0 records. W40 shows `without_cost: 3`, $788.00.
- Reviewer: ul-review, 2026-10-06.
