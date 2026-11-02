---
title: "The run report reads clearly at every size, and every wave footer keeps its promise"
status: now
repos: [organizer]
branch: lf64-run-report-polish
seat: l64-build
reviewer: l64-rev, l64-ui
review: "l64-rev (code): pass at 8eabfb4, unmet none; UI rows P3, P5 and the build halves of P2, P8 are l64-ui's"
stage:
updated: 2026-11-02
next: "PR with talos-lab"
depends_on: []
boundary: ["frontend/src/components/RunReport.tsx", "frontend/src/components/RunTracks.tsx", "frontend/src/components/SpecReader.tsx", "frontend/src/lib/runReport.ts", "frontend/src/lib/specReader.ts", "frontend/src/styles/runreport.css"]
spec: "docs/specs/leftovers-64.md (FR-1 to FR-8)"
gate: "docs/specs/leftovers-64.md#Acceptance → gate"
ui_review: true
ui_review_verdict: pass
autonomy: unattended
---

## Goal
The report Pablo reads after a run has no false alarms, no dead presses and no zeros that mean "unknown".

## Gate
docs/specs/leftovers-64.md, rows P1-P8 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #26, #29).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); P3, P5, P8 in the review build.
- Design: Aglaea's run-report Amendment 3 and progress-and-waves Amendment 2 (60ea44c); anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Work's strip predicate: read it where Work defines it; export it if needed, change nothing else there.
- Short-sample fallback: a state the fixture lacks (two-day window, a wave with no strip) is added to the fixture; never the real home.
- Data shape across states: the factory report JSON as its schema gives it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- l64-build built it on `lf64-run-report-polish` (eaff097, be69d27, 8eabfb4) on origin/main 1bc2d44 (unmoved); P1, P2, P4, P6, P7, P8 vitest fail on 1bc2d44 (15 of 15) and pass; P2, P3, P5, P8 (and P7's names) in the review build by AX of its pid, shots by `screencapture -l` of its window (the screen allowed it); X0 passes from a clean clone. No fixture added: the contract fixture spans two days at -03 and its sup2/1 has no strip. Detail: `.wt-notes/l64-build/progress.md`.

## Declared changes
- modified `frontend/src/lib/runReport.ts:waitWords`: `0002 (pablo)`, `·` between waits only (FR-1)
- added `frontend/src/lib/runReport.ts:waitsWords`, `WAIT_SEP`, `waitsThatFit`, `moreWaits`: one-line waits and the `+N` with the rest in words (FR-1)
- added `frontend/src/lib/runReport.ts:NO_TOKENS`, `hasTokens`; modified `costWords`: `sessions: 0` reads no tokens recorded (FR-4)
- added `frontend/src/lib/runReport.ts:Strip`, `drawsStrip`; modified `ScanRuns`, `WaveTarget` (`none`), `waveTarget`, `waveLinkName`: Work only with a strip, else the record, else no press (FR-7, Amendment 1)
- modified `frontend/src/components/RunReport.tsx:Progress`: `days` class (FR-5); a `none` footer is a span named `<key>: no run record` (FR-7)
- added `frontend/src/components/RunReport.tsx:stripsOf`: WaveStrip's `running` over the agents feed (FR-7)
- modified `frontend/src/components/RunReport.tsx:goToWave`: `none` does nothing; `LocalRunReport`: loads the agents feed as Work does, passes strips
- modified `frontend/src/components/RunTracks.tsx:Waits`, added `Wait`: one measured line with `+N` (FR-1)
- modified `frontend/src/styles/runreport.css`: not-drawn without rule (FR-2), 24 px targets (FR-3), `days` time column (FR-5), `.rt-link` `--fg-subtle` (FR-6), waits line and measure
- added `frontend/src/lib/specReader.ts:runRecordParts`, `roundsHtml`, `ROUNDS_SUMMARY`, `readerSource`, `firstHeadingId`: a run record's prose, then its rounds folded (FR-8)
- modified `frontend/src/components/SpecReader.tsx:SpecReader`: renders through `readerSource`; a run record lands on its first heading (FR-8)
- added `frontend/src/components/RunReport.lf64.test.tsx`: P1-P8
- modified `frontend/src/components/RunReport.test.tsx`, `RunTracks.test.tsx`, `SpecReader.test.tsx`: the new words, strips and the `none` target
Risky:
- `Waits`: the fit measures on layout; a font that loads late is caught by the ResizeObserver only if the cell's size changes
- `drawsStrip`: matches Work's strip by wave number and supervisor; a strip whose supervisor the scan could not name matches any wave of that number
Not changed, on purpose:
- `frontend/src/components/WaveStrip.tsx`: `running` was already exported
- `frontend/src/components/Board.tsx`, the store: read only
- `frontend/src/styles/spec-reader.css`: outside the boundary; the markdown `pre` is already mono
- `internal/service/report.go:lineTokens`: keeps writing `sessions: 0`; the frontend reads it as unknown

## Review
**Verdict (l64-rev, code): pass at 8eabfb4 (on 1bc2d44, branch unmoved). Unmet rows: none.** Reviewer l64-rev, 2026-11-02. P3, P5 and the review-build halves of P2 and P8 are l64-ui's; the CSS in the diff supports them (below).

Fresh clone at 8eabfb4: `.wt-notes/l64-rev/clean`; logs in `.wt-notes/l64-rev/`.

`change-check organizer lf64-run-report-polish --base origin/main` (base resolved to 63d86bc; merge-base is 1bc2d44 and 1bc2d44..63d86bc touches only cards and docs, so the diff is the same 10 files):
```
| outside boundary | RunReport.lf64.test.tsx | added |
| outside boundary | RunReport.test.tsx | modified |
| outside boundary | RunTracks.test.tsx | modified |
| outside boundary | SpecReader.test.tsx | modified |
| undeclared | lib/runReport.ts | fitWithPlus | added |
| undeclared | lib/specReader.ts | esc | added |
| untested? | RunReport.tsx LocalRunReport; runReport.ts hasTokens, waitWords, fitWithPlus, drawsStrip, waveLinkName; specReader.ts runRecordParts, roundsHtml |
| declared, not changed | WAIT_SEP, NO_TOKENS, none, RunReport.tsx:goToWave, ROUNDS_SUMMARY |
19 flags: outside boundary 4, undeclared 2, declared, not changed 5, untested? 8
```
- outside boundary (4): the tests; the spec's Boundary includes "their tests", the card's list leaves them out. Not a finding.
- undeclared (2): `fitWithPlus` is the unexported helper of the declared `waitsThatFit`; `esc` the unexported helper of the declared `roundsHtml`. Not a finding.
- declared, not changed (5): all are in the diff. `WAIT_SEP`, `NO_TOKENS`, `ROUNDS_SUMMARY` are added `export const`s (runReport.ts, specReader.ts); `none` is the new member of the `WaveTarget` union; `goToWave` gains `if (t.kind === "none") return;` (RunReport.tsx:44). change-check did not match them, the diff shows them.
- untested? (8): each is reached by a gate test through its caller: `hasTokens` via `costWords` (P4), `waitWords` via `waitsWords` (P1), `fitWithPlus` via `waitsThatFit` (P1), `drawsStrip` via `waveTarget` (P7), `waveLinkName` via `Progress` (P7), `runRecordParts`/`roundsHtml` via `readerSource` (P8). `LocalRunReport` (loading the agents feed) has no unit test; it is in the review build, l64-ui's.

Rows:
- P1, P2, P4, P6, P7 (with Amendment 1's no-record case, `sup2/1: no run record`, span with no onClick, `goToWave` calls nothing), P8: `RunReport.lf64.test.tsx` 15 of 15 pass at 8eabfb4; the same file on a clone at 1bc2d44 (`.wt-notes/l64-rev/base`) fails 15 of 15, each on its own assertion or a missing export, not one import error (`vitest-1bc2d44.txt`).
- CSS for the UI rows: P2 `.rr-not-drawn` is `--fg-muted` only, no border; P3 `.rr-card` `--space-1 0` + `--line-sm`, `.rr-more` `--space-1`, `.rt-fold` `--space-1 --space-2`; P5 `.rr-progress.days` time column `10ch`, column-gap unchanged; P8 `<details class="sr-rounds">` with no `open`, `<pre><code>` (mono by the reader's markdown `pre`).
- X0: `pnpm install --frozen-lockfile` 0; `make test` 0 (go 19 packages ok, vitest 96 files, 1596 tests; `--share` replayed l64-ui's run at the same SHA); `wails build` 0; `git status --porcelain` empty, wailsjs/runtime unchanged.

Notes (none fail the card):
- Note: `Waits`' hidden measure draws every wait in `.rt-what` (mono), but a wait that is neither a record nor a slug renders as a plain proportional `<span>`; the fit may misjudge such a wait by a few px. Where: l64-ui, if a fixture has one; else no action.
- Note: `.rt-measure` is absolutely placed and only `visibility: hidden`, so a long list of waits can extend past the `waits on` cell; whether it adds a sideways scroll is l64-ui's to see in the build.
- Note: `runRecordParts` matches `^runs/` literally rather than `RUNS_DIR` (runReport.ts:476). No action unless the runs dir moves.

## UI review
**Verdict (l64-ui): pass at 8eabfb4 (branch unmoved). Unmet rows: none.** Reviewer l64-ui, 2026-11-02, aglaea `references/ui-review.md`.

How: fresh clone at 8eabfb4 (`.wt-notes/l64-ui/clean`); pnpm install 0; `make test` 0 (vitest 96 files, 1596 tests; the shared run l64-rev replayed); `make review-build` 0. `Deltagos Review.app` launched by path, `exec`'d so the saved pid is the app, auth off in every temp config. Three launches: the contract fixture + fixture home with the real `factory` (`launch-report.sh`), the default fixture home whose stub `factory` refuses `report` (`launch-p2.sh`), and the contract fixture behind a shim that renames sup2/1's `record` to a file the scan never read (`launch-none.sh`, `shim/bin/factory`), for Amendment 1's no-record footer. Navigation by AXPress and window size by AX, of that pid only; shots by `screencapture -l <window id>` of that pid's window (the screen allowed it), not offscreen. Each app quit by its saved pid, the fixture's stub agents by their saved pids after checking their command lines. Everything in `.wt-notes/l64-ui/` (ax-*.txt, s*.png).

Rows:
- **P2 pass.** init-a Overview: `.rr-not-drawn` at x 1286, the same x as its text (no rule padding), `--fg-muted` grey, no hue, inside the section box (`s7-p2-not-drawn.png`, `ax-p2.txt`).
- **P3 pass.** Heights from AX at 1440 and 1024: `.rr-card` 24 (a, b, c; waits `0002`, `d`; left `d`, `e`), `.rr-more` 24 (both, folded and open), `.rt-fold` 24 (Show and Hide) (`ax-report.txt`, `ax-unfolded.txt`).
- **P5 pass.** `Tue 01:00` 64×16 at x 1286, one line, wave column at 1377: 27 px gap; one-day rows keep `21:00` etc. at the same x; holds at 1024 (`s1-report-1440.png`, `s4-report-1024.png`).
- **P8 pass.** `open sup2's run record` → reader on `runs/2026-10-20-sup1.md`, whose source is 85 lines of yaml before its `#` heading: the drawer shows the heading first, focused, then `Rounds as recorded` closed (AX value 0); pressed → value 1, a mono yaml block starting `waves:` (`s2-record-drawer.png`, `s3-rounds-open.png`).
- **P1 look.** `0002 (pablo) · d: pablo: rule 0002 (pablo) · d (pablo)` on one line at 1440 (waits column) and at 1024 (under the row, narrow mode), `·` only between waits, owner muted; no sideways scroll at either width.
- **P6 look:** not verified in the build: the fixture has one open track, so no chained row draws `↓`; vitest only.
- **P7 look.** Default fixture: `open sup2's run record`, `open sup1's run record`, both buttons. Shim: `sup2/1` is a span named `sup2/1: no run record`, no press, not in the AX button list; sup1 stays a button (`ax-none.txt`, `s8-none-footer-crop.png`).

Findings (none is 3 or 4; notes for the FSE):
1. **Pablo cannot tell, at a glance, which wave footer opens a record and which goes nowhere.** Where: Overview, Waves in this window, shim launch (`s8-none-footer-crop.png`). The `no run record` footer and a pressable one are drawn alike: same words, colour and indent; the reason lives only in the name and hover. Evidence: heuristic (Nielsen 1 visibility of status, 6 recognition over recall). Severity 2. Proposal: say it on the line, e.g. a trailing `· no run record` in `--fg-subtle`, and give pressable footers a visible link cue. Spec gap: Amendment 1 defines the name, not the look.
2. **Single-letter card links are 8 px wide.** Where: `.rr-card` `a`, `b` (centres 15 px apart), `d`, `e`. Height meets AR24; WCAG 2.5.8's 24×24 is met only by the spacing exception, which two letters 15 px apart miss. Evidence: heuristic (WCAG 2.2 2.5.8). Severity 2. Proposal: `min-width: 24px` or horizontal padding on `.rr-card`. Spec gap: FR-3 asks height only.
3. **`Rounds as recorded` is the browser's native disclosure.** Where: reader (`s3-rounds-open.png`): white ▶, 22 px high, a full-width focus box, unlike the app's folds (`.rr-more`, `.rt-fold`: muted ▸, 24 px). Evidence: heuristic (design system consistency). Severity 1. Proposal: style `.sr-rounds > summary` like `.rr-more` (spec-reader.css, outside this boundary).
4. **The reader's focus ring sits on the heading** it lands on (`s2-record-drawer.png`): a box around a non-interactive h1, flush with the text. Not new (the reader focuses a section heading the same way). Severity 1. Proposal: `:focus:not(:focus-visible)` without outline on that heading.
5. Note: the `+N` waits state is not reachable in the build (window min width 1024, and narrow mode puts waits on their own row); vitest P1 only.

Not verified: `+N` in the build; `↓` (P6) in the build; the Work case of P7 (a wave with a strip), vitest only; ~400 px (window min 1024).
