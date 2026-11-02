---
title: "Every count reads the same, and a focused slug reads whole"
status: now
repos: [organizer]
branch: lf71-count-look
seat: l71-build
reviewer: l71-rev, l71-ui
stage:
updated: 2026-11-02
next: "V2 (FR-2): InitiativesView.tsx:304 and :308 still write `Awake · N` and `Asleep · N` by hand on .sec-title, outside the boundary and invisible to the scan; FSE amends boundary and scan, builder moves them to SecCount"
review: "fail at 003c839 (l71-rev, 2026-11-02): unmet V2 (FR-2, two hand-written title counts left); V1 X0 pass; cause: gate"
depends_on: []
boundary: ["frontend/src/styles/runreport.css", "frontend/src/components/Home.tsx", "frontend/src/components/Overview.tsx", "frontend/src/components/UsageTable.tsx", "frontend/src/components/SecCount.tsx", "frontend/src/components/SecCount.test.tsx", "frontend/src/styles/shell.css", "frontend/src/components/RunReport.test.tsx", "frontend/src/components/Usage.rejected.test.tsx", "frontend/src/components/RunReport.lf64.test.tsx", "frontend/src/components/Home.waits.test.tsx", "frontend/src/components/InitiativesView.tsx", "frontend/src/components/InitiativesView.test.tsx"]
spec: "docs/specs/leftovers-71.md (FR-1, FR-2)"
gate: "docs/specs/leftovers-71.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
One look for every count, and no ring over a glyph.

## Gate
docs/specs/leftovers-71.md, rows V1, V2, AR33, AR34 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); UI rows in the review build, ring rows by the offscreen Tab harness.
- Design: Aglaea's 25baf46; anything else to the FSE.
- Short-sample fallback: the existing fixtures; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-02 l71-build: FR-1 (5a5f9a6), FR-2 SecCount (ee2403e), stale asserts (003c839); V1 V2 fail on bb7f54d and pass; X0 pass from a clean clone; AR34 states and AR33's 38x24 link checked by AX in the review build; branch at 003c839 on origin/main bb7f54d, not pushed. Reviewer steps: .wt-notes/l71-build/progress.md.

## Declared changes
- modified `frontend/src/styles/runreport.css:.rr-card`: padding-inline 4 px so the inset ring clears the slug's glyphs (FR-1)
- added `frontend/src/components/SecCount.tsx:SecCount`: draws `<title> · N` as one flex item (FR-2)
- added `frontend/src/components/SecCount.test.tsx`: V2, the piece and the hand-written-count scan
- modified `frontend/src/components/Home.tsx`: Needs me and Waiting on others titles use SecCount; one import
- modified `frontend/src/components/Overview.tsx`: the stage title uses SecCount (`Stage N · name`); one import
- modified `frontend/src/components/UsageTable.tsx:UsageRejected`: Not accepted uses SecCount; one import
- modified `frontend/src/components/RunReport.test.tsx`: V1
- modified `frontend/src/components/RunReport.lf64.test.tsx`: the `.rr-card` padding assert follows FR-1 (Amendment 1)
- modified `frontend/src/components/Home.waits.test.tsx`: the Waiting on others heading assert follows SecCount (Amendment 1)
Risky:
- `.rr-card`: every card link (tracks, cards lists, waits) is 8 px wider, so the waits line folds a little sooner into `+N`
- `Overview.tsx` stage title: its count gains class `num` (tabular-nums on a mono face, no visible change)
Not changed, on purpose:
- `frontend/src/styles/shell.css`: the cause is two flex items, fixed in SecCount; `.sec-count` needed no change
- `frontend/src/components/Usage.rejected.test.tsx`: its U10 assert matches SecCount's markup as is

## Notes
- Two tests outside the boundary assert the pre-FR markup: `RunReport.lf64.test.tsx:139` (`.rr-card` `padding: var(--space-1) 0`) and `Home.waits.test.tsx:135` (`Waiting on others · <span…>` as the h3's first text). Asked sup115 to extend the boundary to them.

## Review
**Verdict: fail.** Unmet: V2 (FR-2's "no title writes the dot by hand"). V1 and X0 pass. AR33, AR34 not run (l71-ui's).
Reviewer l71-rev, 2026-11-02, commit 003c839 (on origin/main bb7f54d), clean clone of the GitHub remote; base clone at bb7f54d for the before runs. Logs in `.wt-notes/l71-rev/`.

cause: gate (the spec's premise counted four hand-written counts and its boundary names only those files; V2's scan keys on `sec-count`, so it cannot see the two left)

**Finding 1 (blocking, FR-2).** `frontend/src/components/InitiativesView.tsx:304` `<h2 className="sec-title">Awake · <span className="num">{…}</span></h2>` and `:308` `Asleep · …`: two mounted section titles (App.tsx:68, the Initiatives screen) still write `<title> · N` by hand as a text node plus a span inside the flex `.sec-title` (shell.css:34, gap `--space-2`), the U10 shape FR-2 removes: the space after the dot collapses and the 8 px gap stands in for it. Probe (`probe.log`): a scan for `sec-title…> … · <span` over components/ at 003c839 prints `HIT InitiativesView.tsx:304 HIT InitiativesView.tsx:308`. Goes to: the FSE (amend leftovers-71: boundary adds InitiativesView.tsx's two titles; V2's scan widens), then the builder.

**Finding 2 (blocking with 1, V2's scan).** The scan catches only the literal form. Probe of its two regexes on one line each: `Needs me · <span className="num sec-count">` caught; `Needs me{' · '}<span className="num sec-count">` missed; `Needs me &middot; <span …sec-count">` missed; the dot and span on two lines missed; `Awake · <span className="num">` (no sec-count) missed. Goes to: the same amendment (scan for `·`, `&middot;` or `\u00b7` beside a count span in any `.sec-title`, across lines).

change-check (`--base origin/main`):
```
undeclared | frontend/src/styles/runreport.css | modified
untested?  | frontend/src/components/Overview.tsx | StageGates | no test file names it
declared, not changed | frontend/src/styles/runreport.css:.rr-card | no matching change
3 flags: outside boundary 0, outside footprint 0, undeclared 1, declared, not changed 1, untested? 1
```
- `undeclared runreport.css` and `declared, not changed …:.rr-card` are one change: change-check does not read a CSS selector as a symbol; the diff changes exactly the `.rr-card` rule (and its comment). Explained.
- `untested? StageGates`: no test renders it, but V2's piece test covers `SecCount name=` (`Stage 2 · Build`) and the scan covers Overview.tsx's source. Explained; Note: a render test of StageGates would pin it.

Rows:
- V1: `npx vitest run src/components/RunReport.test.tsx -t "leftovers-71 V1"`: 1 passed at 003c839; on bb7f54d (test copied in) `expected [ 'min-height: 0', …(13) ] to include 'padding-inline: var(--space-1)'`. Met. FR-1 read: only `.rr-card {…}` sets its padding (runreport.css:64; no other rule names it); users RunReport.tsx:62, RunTracks.tsx:17, :18, :88; `min-width: 24px` kept (V1 asserts it), `overflow-wrap`, `text-align` unchanged.
- V2: `npx vitest run src/components/SecCount.test.tsx`: 4 passed; on bb7f54d (SecCount.tsx and test copied in) the scan fails listing `Home.tsx:79, Home.tsx:357, Overview.tsx:145, UsageTable.tsx:158`. The four named sites use SecCount; 0 and 12 render `· 0`, `· 12`; `.sec-title` (uppercase, flex) and `.sec-count` (shell.css:34, :39) are unchanged and the count keeps `num sec-count`. As written the row passes; FR-2 does not (Findings 1, 2).
- X0: install exit 0; `make test` with `--share` exit 0, **fresh** run (lease log start 13:50:30, waited 50 s, saved; id `6175d0ae4ee750b86b7d4da65fe8e828`): 19 Go packages ok, vitest 101 files, 1694 tests passed; `wails build` exit 0; `make review-build` exit 0 (`built build/bin/Deltagos Review.app`); `git status --porcelain` empty, wailsjs/runtime unchanged. Met.

Note: RunTracks.tsx:88 draws card links in a comma list (`a, b`); the new 4 px inline padding puts 4 px before each comma. For l71-ui's AR33 look; goes to l71-ui.
