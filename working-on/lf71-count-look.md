---
title: "Every count reads the same, and a focused slug reads whole"
status: now
repos: [organizer]
branch: lf71-count-look
seat: l71-build
reviewer: l71-rev, l71-ui
stage:
updated: 2026-11-02
next: "review: lf71-count-look, gate met (V1 V2 X0 pass; AR33 AR34 for l71-ui), 1567309"
review: "pass at 1567309 (l71-rev, 2026-11-02): V1 V2 X0 met; AR33 AR34 for l71-ui"
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
- 2026-11-02 l71-build, round 2: Amendment 2 — InitiativesView's Awake, Asleep, Archived to SecCount, V2 scan widened (seven on bb7f54d, none on the branch) (1567309); X0 rerun pass; branch at 1567309 on origin/main bb7f54d, not pushed.

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
- modified `frontend/src/components/InitiativesView.tsx:InitiativesView`: Awake, Asleep and Archived titles use SecCount; one import (Amendment 2)
- modified `frontend/src/components/InitiativesView.test.tsx`: V2 render of the three titles (Amendment 2)
- modified `frontend/src/components/SecCount.test.tsx`: V2 scan widened to every `.sec-title`, across lines, any dot form (Amendment 2)
Risky:
- `.rr-card`: every card link (tracks, cards lists, waits) is 8 px wider, so the waits line folds a little sooner into `+N`
- `Overview.tsx` stage title: its count gains class `num` (tabular-nums on a mono face, no visible change)
- `InitiativesView.tsx` titles: their counts gain `sec-count` (mono, `--fg`) where they were `num` only, the one count look
Not changed, on purpose:
- `frontend/src/styles/shell.css`: the cause is two flex items, fixed in SecCount; `.sec-count` needed no change
- `frontend/src/components/Usage.rejected.test.tsx`: its U10 assert matches SecCount's markup as is
- `frontend/src/components/UsageSessions.tsx:27`: `Sessions · N` on a disclosure button, not a `.sec-title`; outside the boundary (Found, not asked in progress.md)

## Notes
- Two tests outside the boundary assert the pre-FR markup: `RunReport.lf64.test.tsx:139` (`.rr-card` `padding: var(--space-1) 0`) and `Home.waits.test.tsx:135` (`Waiting on others · <span…>` as the h3's first text). Asked sup115 to extend the boundary to them.

## Review
Round 1 (003c839): fail, unmet V2 (InitiativesView.tsx hand-written title counts outside the boundary and the scan), cause: gate; answered by leftovers-71 Amendment 2 (507d174) and its addendum (fc66ae4).

**Round 2 verdict: pass.** Unmet: none of V1, V2, X0. AR33, AR34 not run (l71-ui's).
Reviewer l71-rev, 2026-11-02, commit 1567309 (on origin/main bb7f54d), fresh clean clone of the GitHub remote; base clone at bb7f54d for the before runs. Logs in `.wt-notes/l71-rev/` (`*-r2.*`).

change-check (`--base origin/main`), flags:
```
undeclared | frontend/src/styles/runreport.css | modified
untested?  | frontend/src/components/Overview.tsx | StageGates | no test file names it
declared, not changed | frontend/src/styles/runreport.css:.rr-card | no matching change
3 flags: outside boundary 0, outside footprint 0, undeclared 1, declared, not changed 1, untested? 1
```
- `undeclared runreport.css` and `declared, not changed …:.rr-card` are one change: change-check does not read a CSS selector as a symbol; the diff changes exactly the `.rr-card` rule and its comment. Explained.
- `untested? StageGates`: no test renders it; SecCount's `name` form (`Stage 2 · Build`) is unit-tested and the V2 scan reads Overview.tsx. Explained. Note: a render test of StageGates would pin it; goes to the FSE as a follow-up, not this card.
- InitiativesView.tsx and its test are inside the amended boundary (outside boundary 0).

Rows:
- **V1** met. `npx vitest run src/components/RunReport.test.tsx -t "leftovers-71 V1"`: 1 passed at 1567309; on bb7f54d (test copied in) `expected [ 'min-height: 0', …(13) ] to include 'padding-inline: var(--space-1)'`. FR-1 read: only `.rr-card {…}` (runreport.css:64) sets its padding; users RunReport.tsx:62, RunTracks.tsx:17, :18, :88; `min-width: 24px`, `overflow-wrap`, `text-align` kept.
- **V2** met. `npx vitest run src/components/SecCount.test.tsx src/components/InitiativesView.test.tsx -t "leftovers-71"`: 6 passed at 1567309. On bb7f54d (SecCount.tsx, its test copied in) the scan fails with seven: `Home.tsx:79, :357, InitiativesView.tsx:304, :308, :325, Overview.tsx:144, UsageTable.tsx:155` (the addendum's seven; :325 is the Archived `h2` that opens the button at :328). All seven sites now use SecCount; Archived's `.ivw-fold` (inline-flex, gap 4) holds chevron and one SecCount element. 0 and 12 render `· 0`, `· 12`; `.sec-title` uppercase and `.sec-count` (shell.css:34, :39) unchanged, count keeps `num sec-count`.
- **X0** met. install exit 0; `make test` with `--share` exit 0, **fresh** (lease log start 14:02:46, saved; id `2eb6b7bda8c99ca77019e43bfd380fc3`): 19 Go packages ok, vitest 101 files, 1696 tests passed; `wails build` exit 0; `make review-build` exit 0 (`built build/bin/Deltagos Review.app`); `git status --porcelain` empty.

Cases the builder's tests lack (`probe-r2.log`):
- Note: the scan finds a `.sec-title` only on `h1-6|div|span|p|header` with a literal or template class string; it misses `className={cx("sec-title", …)}`, a `section` or `label` with the class, a count in a `<b className="num">`, and a nested same-name tag closing early. No such form exists in components/ today (every `sec-title` opener matches its regex). Goes to the FSE, if the scan should outlive this card.
- Note: Amendment 2's first sentence (scan `<title> · <span className="num` in every file) and its addendum (inside a `.sec-title`) differ: the literal form also hits `Home.tsx:929` (a `wave N · M building` lozenge, not a title) and `UsageSessions.tsx:27` (`Sessions · N` in a non-flex `.usage-disclose` button, so its spaces are real). The builder followed the addendum, whose count (seven) matches. Goes to the FSE to align the amendment's wording.
- Note: RunTracks.tsx:88 draws card links in a comma list; the 4 px inline padding puts 4 px before each comma. Goes to l71-ui (AR33 look).
