---
title: Every Claude session's tokens by kind and money, per day, attributed to initiative, role and task, and organizer usage
status: done
repos: [organizer]
branch: usage-ledger
seat: ul-build
stage: one-window
updated: 2026-10-06
next: "merged as 6e4e004 (sup47)"
review: pass
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
- Verdict: **pass** at 7594a07f07836d7c3deba1bfa30f975291c10938 (branch usage-ledger, rebased). Unmet: none. G1-G5 and X0 met; G3 judged against the amended row (Amendment 1, 517b3a5).
- Earlier round: fail at 0c8a44bf7e76f4563bb83adb47939fc377829d58 (card 04f3f34). G2 was unmet because each streamed message was counted at its first, partial usage line (W40 output short by 88,718). G3 was left pending the amendment.
- X0: fresh clone at 7594a07. `XDG_DATA_HOME=$(mktemp -d) make test` passed (go all ok, also with -count=1; vitest 279). `npm install && npm run build` and `wails build` both exit 0.
- G1: `TestIngestSumsOncePerMessageAndRereadsNothing` now repeats msg_1 with growing usage (output 10, then 100) and counts its final usage once. A stream that crosses two passes (msg_3) is counted once, and the sub-agent's tokens land on its parent. The second pass reads 0 bytes, and the third reads only the grown file. `TestCrashBetweenRenamesDoesNotDoubleCount` writes the new ledger with stale offsets and finds msg_c counted once.
- G2: fresh ledger, W40 has input 25,443, output 6,979,139, cache read 2,084,340,296 and cache write 38,419,158, 2,129,764,036 tokens in total over 205 sessions. My own script (.wt-notes/ul-review/check/mysum.py, which takes each id's last line) gets the same numbers to the token. No message id appears in two files.
- G3: `TestCostFourCases` covers all four cases. A record gives $3, split by tokens per day, and the record wins over the transcript's $9.50. A session with only a transcript gets $1 split 1:3. A $0 record with a transcript cost gets the transcript's $61.50. A session with neither gets null and is counted in without_cost (1). On the real home W40 shows $894.53 and 0 without cost: 202 sessions cost from a record, 3 from a transcript.
- G4: W41 by task. rlf-build/review/ui sit under organizer/ruled-line-floor, fi3-build/review/ui under organizer/floating-icon-3, and sup46 under the wave `sup46 · floating-icon-3, ruled-line-floor`. None is Not attributed.
- G5: W41 by role shows builder, fse, ui reviewer, supervisor, pair, reviewer, then Not attributed last ($0 and 0 sessions this week). The task cut's Not attributed row lists its reasons: fse ×3, pair, `no card names sup3` (hestia-probe-sup3) and `no initiative root above ~` (probe-hefesto).
- Second pass: 0 files read, 0 bytes, unchanged. First pass: 468 files, 1.18 GB.
- Boundary: every changed path is inside it. internal/session and the runs.jsonl writer are untouched, and the new code makes no network call and runs no exec. Days and Monday weeks are local time, with no UTC edge error.
- Not gated, for the FSE: a generation mismatch (a crash between the two renames) or an offsets version bump rebuilds the whole ledger from the transcripts. A session whose transcript is gone by then loses its lines, and every session is re-attributed from the cards as they stand then, not kept from when it was first seen (FR-3). Today the oldest transcript is from 2026-08-19, so nothing is lost yet, but the ledger is called the only copy of the history. Keeping lines for sessions whose transcript has vanished would close that.
- Reviewer: ul-review, 2026-10-06.
- 2026-10-06 sup47: merged as 6e4e004 after ul-review passed at 7594a07; card to done/.
