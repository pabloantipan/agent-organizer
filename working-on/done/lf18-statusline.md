---
title: "A run's last context and cost survive a statusline that stops sampling"
status: done
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
review: pass
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

## Review
**Pass.** sl-review, 2026-10-10, commit 6755495e4eaa6cfec0b831434c57f6af14e1a64a (branch head, not moved).
- S1 met. Checked the real `runs.jsonl` read-only: all eight sessions have an open line (the first sample) and an `ended: true` line whose `input_tokens` equal the transcript's last main-chain usage (re-derived for fo-review 1b08888a: 85348 at 16:35:36.817Z, cost-state 1.0598626). sup53's transcript shows the read of `runs.jsonl` at 16:36:43–49Z, less than 2 min after fo-review's last sample at 16:35:37Z, so it was inside `runGrace`. The cause in Notes stands: the runs were read before the final line existed, and the statusline did not stop. The redraw lead, the pid walk and a parse failure are ruled out with evidence.
- S2 met. `TestRetireFinalLineReadsTheTranscript` runs Retire over a once-sampled record. With a transcript that carries later usage, the final line has 85348 tokens, $1.0599, `from_transcript`, last seen at the last response. With a transcript that has no usage, or no transcript at all, the line keeps the one sample and says `"samples":1`. Production counts samples through `Counted` in `statusline` (`TestCountedCountsSamplesPerSession`). I ran these with `-v` in the clean clone and all passed. The diff stays inside the boundary: `internal/session`, `internal/cli/crew.go` and testdata. The statusline's printed text is unchanged.
- X0 met for this card. Clean clone at 6755495: `XDG_DATA_HOME=$(mktemp -d) test-lease run -- make test` passed (16 Go packages ok, vitest 486/486), and `npm install`, `npm run build` and `wails build` exited 0 (`.wt-notes/sl-review/x0-*.log`). `git status --porcelain` is not empty, for two reasons outside this card: mode-only changes 100755→100644 on `frontend/wailsjs/runtime/*`, which are D1's drift, owned by lf18-build-drift and still unmerged; and `frontend/package-lock.json`, written by the `npm install` the review prescribes. The diff touches no frontend file. The porcelain clause belongs to D1 and cannot be met inside this card's boundary until lf18-build-drift merges. That is a gate contradiction, reported to sup55.
- Unmet rows: none.
