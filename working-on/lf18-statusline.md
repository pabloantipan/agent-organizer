---
title: "A run's last context and cost survive a statusline that stops sampling"
status: now
repos: [organizer]
branch: lf18-statusline
seat: sl-build
stage: one-window
updated: 2026-10-10
next: "review: lf18-statusline, gate met (S1, S2, X0), 6755495"
depends_on: []
boundary: ["docs/specs/leftovers-18.md Boundary, lf18-statusline"]
spec: "docs/specs/leftovers-18.md (FR-10, diagnose first)"
gate: "docs/specs/leftovers-18.md Acceptance, rows S1, S2 and X0"
ui_review: false
---

## Goal
Second sighting: statusline records stop after one sample (sup50, sup53 seats); organizer statusline is ours.

## Gate
docs/specs/leftovers-18.md, rows S1, S2 and X0.
- [x] S1 (FR-10): the cause named in Notes (runs read before the retire grace, not a stopped statusline); `.wt-notes/sl-build/s1-supervisor-reads.txt`, `s1-transcript-tails.txt`, `runs-affected.jsonl`
- [x] S2 (FR-10): `TestRetireFinalLineReadsTheTranscript` (later usage → 85348 tokens, $1.0599, from_transcript; no usable transcript and none → `"samples":1`), `TestReadTail`, `TestCountedCountsSamplesPerSession`; `.wt-notes/sl-build/s2-go-test.log`, `s2-repro-fo-review.txt`
- [x] X0: clean clone of 6755495, make test, npm run build, wails build pass; porcelain empty after restoring D1's runtime modes (lf18-build-drift unmerged) and my npm lockfile; `.wt-notes/sl-build/x0-*.log`, `x0-porcelain.txt`

## Done
- 2026-10-10 sl-build: a run's final line reads the transcript's last context and closing cost (`session.ReadTail`, `withTail`), records count statusline samples and the run line carries `samples` (c8decf9, 0dc7888, 6755495); S1 cause in Notes.

## Notes
- **S1 cause (sl-build, 2026-10-10): the statusline did not stop; the runs were read before their final line existed.** A run's final line is written only by a `session.Retire` pass that finds the process gone *and* its record at least `runGrace` (2 min) old. Both supervisors killed their seats and read `runs.jsonl` within a minute: sup50 at 23:09:50Z in the same command as `probe -k aic-*` (the ra-* seats, killed at 23:04, already had finals; its "three seats" are aic-build/review/ui), sup53 at 16:36:50Z after killing fo-*/mw-* at 16:35:40-16:36:00 (fo-review's last sample 16:35:37, grace ends 16:37:37). What they saw were the *open* lines, which carry the first sample by design. `runs.jsonl` now holds an `ended: true` line for all eight seats whose `last_seen` equals the transcript's last assistant message to the second and whose context equals that message's tokens (130394 → 13 % for ra-build). Evidence: `.wt-notes/sl-build/s1-supervisor-reads.txt`, `s1-transcript-tails.txt`, `runs-affected.jsonl`.
- Ruled out: Hephaistos's redraw lead (samples kept arriving to the last turn in every one of the eight panes, none drawn by a human); the pid walk (one record per pid, finals present); a parse failure (same fields on open and final lines).
- Found on the way, real but small: the last sample lags the session's bill by its last turn. Final `cost_usd` vs the transcript's closing `cost-state` line: ra-build 2.327/2.363, aic-build 2.453/2.489, ra-review 0.894/0.918, ra-ui 1.470/1.499, aic-ui 1.022/1.047, mw-review 1.041/1.065, fo-review 1.036/1.060, aic-review equal. The transcript is the redraw-free source FR-10 asks for; S2 reads it.
