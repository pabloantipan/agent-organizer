---
title: "The run report, Usage and header say plainly what presses and what is not his"
status: now
repos: [organizer]
branch: lf67-ui-polish
seat: l67-ui
reviewer: l67-ui-rev, l67-ui-ui
stage:
updated: 2026-11-02
next: "rebased: a0fcd65, X0 pass"
review: "pass at 2557347 (l67-ui-rev, 2026-11-02): V4, V5, X0 met; unmet none"
depends_on: []
boundary: ["frontend/src/components/RunReport.tsx", "frontend/src/components/RunTracks.tsx", "frontend/src/components/SpecReader.tsx", "frontend/src/components/UsageTable.tsx", "frontend/src/components/Home.tsx", "frontend/src/lib/runReport.ts", "frontend/src/lib/specReader.ts", "frontend/src/styles/runreport.css", "frontend/src/styles/spec-reader.css", "frontend/src/styles/shell.css", "frontend/src/styles/usage.css", "frontend/src/components/RunReport.lf64.test.tsx", "frontend/src/components/RunReport.test.tsx", "frontend/src/components/SpecReader.test.tsx", "frontend/src/components/Usage.rejected.test.tsx", "frontend/src/lib/runReport.test.ts", "frontend/src/lib/specReader.test.ts"]
spec: "docs/specs/leftovers-67.md (FR-8 to FR-14)"
gate: "docs/specs/leftovers-67.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No look promises a press that is not there, and the header sits evenly at every width.

## Gate
docs/specs/leftovers-67.md, rows V4, V5, AR27-AR30, U9, R53 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); UI rows in the review build.
- Design: Aglaea's amendments named in the spec; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Short-sample fallback: a state the fixture lacks is added to the fixture; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-02 l67-ui: FR-8 to FR-14 on lf67-ui-polish (dc670b6, 47a1631, a5f60fd, b6ab0ac, abefa95, 2557347), rebased on origin/main 83056a1; V4/V5 fail on 83056a1 (10) and pass; AR27-AR30, U9, R53 checked in the review build (screen unlocked, AX of the pid, `screencapture -l`); X0 pass from a clean clone. Evidence and the reviewer's lines: `.wt-notes/l67-ui/progress.md`.

## Declared changes
- modified `frontend/src/lib/runReport.ts`: added `waveFooterParts` and `NO_RUN_RECORD`, the footer split into the wave and the rest (FR-8)
- modified `frontend/src/components/RunReport.tsx:Progress`: the wave in `.rr-wave-key`; a footer with no record adds `.rr-no-record` ` · no run record` (FR-8)
- modified `frontend/src/lib/specReader.ts:roundsHtml`: the summary carries `rr-more` (FR-10)
- modified `frontend/src/styles/runreport.css`: `.rr-wave-key`, `.rr-no-record`, `.rr-card` min-width 24 and centred, `details > summary.rr-more` with a border-drawn ▸ (FR-8 to FR-10)
- modified `frontend/src/styles/spec-reader.css`: no ring on a landed reader heading or `.sr-path` (FR-11)
- modified `frontend/src/components/UsageTable.tsx:UsageRejected`: title `Not accepted by discuss-record · N`, line `REJECTED_WHY` (FR-12)
- modified `frontend/src/styles/usage.css`: `.usage-rejected-why`, sm muted (FR-12)
- modified `frontend/src/styles/shell.css`: `.ihead.folded > .ihead-bar` pads 8 under its last row, no 44 px floor (FR-13)
- modified `frontend/src/components/Home.tsx:runSignalFor`: the comment only, it reads `progress.dead_minutes` (FR-14)
- modified `frontend/src/components/RunReport.lf64.test.tsx`, `RunReport.test.tsx`, `Usage.rejected.test.tsx`: V4, V5 rows; P8, W2, W9, U3 read the new markup and words
- added `testdata/fixture-report/launch.sh`, `bin/factory`, `rejected.py`: the review states (no-record footer, two rejected rows, resize) over the fixture home and the contract fixture
Risky:
- `shell.css` `.ihead.folded > .ihead-bar`: every initiative's folded header; a first line shorter than 28 px now makes the bar shorter than 44 (gap stays 8)
Not changed, on purpose:
- `header.css` `.ihead .ihead-bar`: outside the boundary; overridden by the more specific shell.css rule
- the open header's gap to the sub-tabs (`.ihead-open` padding 12): R53 is the folded header's rows
- `.sec-title`'s uppercase: the rejected title is drawn uppercase like every section title


## UI review
- 2026-11-02 l67-ui-ui, commit 2557347 (detached worktree, `make review-build`, `Deltagos Review.app` by its own path through `testdata/fixture-report/launch.sh`, auth off; ORGANIZER_CONFIG and XDG_DATA_HOME under `/private/tmp/organizer-fixture.*`, checked in each `<label>.env` and in the app process's own environment). Screen unlocked: every row ran in the review build, AX of my pid, `screencapture -o -l <window>`; nothing offscreen. Shots and AX dumps: `.wt-notes/l67-ui-ui/`.
- **Verdict: pass.** No severity 4 or 3.
- AR27 met: launch `--no-record --rejected`, fixture › Last run. `sup2/1` drawn in --fg-muted, ` · no run record` on the line in --fg-subtle (5.5:1 on the footer's #1e1926, measured), AX a group named `sup2/1: no run record`, no hover fill; `sup1/1` in --accent-fg, a button `open sup1's run record` (`1440x900-ar27-report-norecord.png`, `1440x900-ar27-footer-crop.png`, `ax-report.txt`).
- AR28 met: `.rr-card` a, b, c, d, e each 25×24, `0002` 30×24 (`ax-report.txt`).
- AR29 met: `Rounds as recorded` an AXDisclosureTriangle 131×24 named without the ▸, one muted ▸ and no native marker, turned when open (value 0 → 1) (`1440x900-ar29-fold-closed-crop.png`, `-open-crop.png`).
- AR30 met as far as no keys reach: opening sup1's record focuses the heading (AX FOCUSED) with no ring (`1440x900-ar30-landed-crop.png`); focus set by AX on the next control, `Rounds as recorded` (the first focusable after the heading in AX order, `ax-reader-tree.txt`), drew the violet ring, and set back on the heading drew none (`1440x900-ar30-fold-axfocused-crop.png`, `-heading-axfocused-crop.png`). CSS: the heading rule removes the outline under `:focus` and `:focus-visible`; the summary keeps global.css's `:focus-visible`. A real Tab was not sent (no synthetic keys), so "Tab rings the next control" is proved by AX order plus the ring under focus-visible, not by a keypress; enough for me, the one gap is WebKit's Tab reaching a `<summary>` at all.
- U9 met: launch `--rejected`, top bar Usage: title `Not accepted by discuss-record · 2` (drawn uppercase by `.sec-title`), the line `Sent again when its usage changes. Nothing for you to do; the reason is for the FSE.` sm muted above the two rows fixture-u-w1a, fixture-u-w1c (`1440x900-u9-rejected-crop.png`, `ax-usage.txt`).
- R53 met: box gap from the header's last row to the sub-tabs, by AX frames. 1440×900: every initiative one row, 8 (init-a 237 → 245, fixture and four others 233 → 241). After `ORGANIZER_REVIEW_RESIZE=1024x640@3`: two rows init-a 261 → 269, init-many and init-b 257 → 265; one row fixture, init-define, init-drafted 233 → 241; all 8. Live (`@25`, init-a open at 1440, resized while shown): sub-tabs at 269, the same as fresh (`ax-r53-*.txt`, `1440x900-r53-inita-onerow.png`, `1024x640-r53-inita-tworows.png`, `1024x640-r53-initmany-tworows.png`, `1024x640-r53-fixture-onerow.png`, `1024x640-r53-inita-live.png`). Ink to ink varies 22-27 px with the tallest item of the row, not with the width.
- Design system: only tier-2 tokens in the changed rules (--accent-fg, --fg-muted, --fg-subtle, --surface-hover, --space-*); the fold 24 px high; the still footer is a span, no hover, no pointer.
- Finding 1 (sev 1): the pressable footer reads `sup1/1  · sup1` with a wider gap before the dot than the still one's `sup2/1 · sup2`. Where: `1440x900-ar27-footer-crop.png`. Evidence: the button lays out its two children with the button's gap, the span inline. Proposal: the same spacing in both, so the two lines align.
- X0 shared test run: fresh, test-lease run id 78d5b386-91469 at 2557347 (`make test` rc 0, vitest 1653 passed); `make review-build` rc 0; worktree `git status --porcelain` empty, no package-lock.json.
- Spec gaps for the FSE: none that block. R53 names "several rows" but no fixture initiative wraps at 1440, so several rows were seen only at 1024.
- For aglaea (not verified, design questions): (a) U9's title is written mixed case and `.sec-title` draws it uppercase, `DISCUSS-RECORD`; is a system name kept in its own case? (b) AR30's ring after a real Tab in WKWebView (`<summary>` with macOS Keyboard navigation off) is unproven by any review without keys.

## Review
- **Verdict: pass** at 2557347 (origin/main 83056a1). Unmet rows: none. Reviewer l67-ui-rev, 2026-11-02. Fresh clone `.wt-notes/l67-ui-rev/clean` (origin set to git@github.com:pabloantipan/agent-organizer.git per sup111's correction); logs in `.wt-notes/l67-ui-rev/`.
- change-check (`--base origin/main`): 15 files, 6 flags. `outside boundary` ×3 `testdata/fixture-report/{bin/factory,launch.sh,rejected.py}`: allowed by Pre-answered; new dir, read by no test (grep), committed, not ignored; `launch.sh` refuses a config or data dir outside `organizer-fixture.*` and auth not off, `rejected.py` refuses a non-temp dir, the shim only rewrites one wave's `record` in `factory report --json` output; no other fixture written. `undeclared Home.tsx` + `declared, not changed Home.tsx:runSignalFor`: one change, the doc comment above the function (outside the symbol's range); the diff is comment only. `untested? waveFooterParts`: exercised by V4's footer text assertions through `Progress`, not named.
- V4 met: `RunReport.lf64.test.tsx` "V4 (FR-8, AR27)" ×2, "V4 (FR-9, AR28)" ×2, "V4 (FR-10, AR29)" ×2, "V4 (FR-11, AR30)" ×2; P8 updated. V5 met: `Usage.rejected.test.tsx` "leftovers-67 V5" ×2, U3 updated. 54 pass, 1 skip (contract bytes, needs CONTRACTS_DIR; ran under X0). On 83056a1 with these test files: 10 fail (FR-8 ×2, FR-9, FR-10 ×2, FR-11, V5 ×2, U3, P8) — `vitest-base.log`.
- My inputs (`extra-inputs.log`): FR-8 every wave's record present but unread → both footers `unread`, buttons, `.rr-wave-key` only, no `no run record`; every wave recorded and readable → both `record`, buttons. FR-10: the turn is `details[open] > summary.rr-more::before` only, no transition or state, so closing restores ▸ every time (no DOM in vitest; the UI reviewer saw 0 → 1). FR-12 one row → `Not accepted by discuss-record · 1` and the line verbatim. FR-13: `.ihead.folded > .ihead-bar` matches only InitiativeHeader's `<header>` (the only `ihead` root; `.folded` elsewhere is rail, float, outline, none under `.ihead`), so it reaches the folded header over all six sub-views and nothing else; open untouched. FR-14: comment matches code (`denominator.count`, `dead_minutes ?? 0`); Home.tsx diff is comment only. Tokens all defined in tokens.css; no oklch, color-mix, nesting or @layer.
- X0 met: install fresh; `make test` reused run 78d5b386-91469 (l67-ui-ui, same SHA): 99 files, 1653 tests, Go ok; `wails build` ok; `git status --porcelain` empty.
- Note: a folded one-row header whose tallest item is 24 px is now 40 tall, not 44 (gap 12 → 8, as FR-13 wants); R53 measured it. Goes: nowhere, intended.
- Note: the `runSignalFor` comment cites `FR-19` (leftovers-57) beside `FR-14` of another spec without naming either. Goes: the FSE's next leftovers touching Home.tsx.

