---
title: "Every count title through one piece, and commas that sit beside their names"
status: now
repos: [organizer]
branch: lf72-counts-commas
seat: l72-build
reviewer: l72-rev, l72-ui
review: "l72-rev pass (V1 V2 X0) at 27962f3, 2026-11-02; AR35 AR36 for l72-ui"
stage:
updated: 2026-11-02
next: "review: lf72-counts-commas, V1 V2 X0 pass, AR35 AR36 for l72-ui, 27962f3"
depends_on: [lf71-count-look]
boundary: ["frontend/src/components/RunTracks.tsx", "frontend/src/components/UsageSessions.tsx", "frontend/src/components/Overview.tsx", "frontend/src/components/Rail.tsx", "frontend/src/components/RunReport.tsx", "frontend/src/components/SecCount.tsx", "frontend/src/styles/runreport.css", "frontend/src/styles/usage.css", "frontend/src/styles/overview.css", "frontend/src/styles/shell.css", "frontend/src/components/RunTracks.test.tsx", "frontend/src/components/RunReport.test.tsx", "frontend/src/components/RunReport.lf64.test.tsx", "frontend/src/components/SecCount.test.tsx", "frontend/src/components/"]
spec: "docs/specs/leftovers-72.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-72.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No count title left by hand, and no comma set apart from its name.

## Gate
docs/specs/leftovers-72.md, rows V1, V2, AR35, AR36 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #59, SecCount).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); a test outside the named files may change only where it asserts the old count or comma markup (the boundary's last entry, for that only).
- Design: Aglaea's f62790a; anything else to the FSE.
- Short-sample fallback: the existing fixtures; a state they lack (a `left` list of three) is added to the fixture; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- l72-build (2026-11-02): FR-1 d28a8f1, FR-2 bfc322a, fixture `--wide-slug` 27962f3 on origin/main 35992ed (no rebase needed). V1 and V2 fail on 35992ed (V2: the spec's five) and pass on the branch; X0 passes from a clean clone (1702 vitest, 19 Go packages, porcelain empty). AR35/AR36 states read by AX in the review build; how to put each on screen in `.wt-notes/l72-build/progress.md`.

## Declared changes
- modified `frontend/src/components/RunTracks.tsx`: the `left` list's comma is a sibling `.rt-comma` after its item, outside the link (FR-1)
- modified `frontend/src/styles/runreport.css`: `.rr-card + .rt-comma` pulls the comma into the link's padding (FR-1)
- modified `frontend/src/components/SecCount.tsx:SecCount`: `countClass`, `className`, element `title` props (FR-2)
- modified `frontend/src/components/UsageSessions.tsx`: Sessions disclosure through SecCount (FR-2)
- modified `frontend/src/components/Overview.tsx`: Gates label through SecCount (FR-2)
- modified `frontend/src/components/Rail.tsx`: group count and Roles through SecCount, `rail-group-n` kept (FR-2)
- modified `frontend/src/components/RunReport.tsx:Rulings`: title through SecCount (FR-2)
- modified `frontend/src/styles/shell.css`: `.rail-group-title`, the rail's `<name> · N` row (FR-2)
- modified `frontend/src/components/RunTracks.test.tsx`: V1
- modified `frontend/src/components/SecCount.test.tsx`: V2 widened scan, props test
- modified `testdata/fixture-report/launch.sh`: `--wide-slug`, a slug wider than the 24 px minimum in the last run's left list (AR35)
Risky:
- `Rail.tsx` group header: the name sits inside SecCount's inline-flex; a long group name must still ellipsize with the count visible (checked only with short names)
- `.rail-group-title` `white-space: pre` reaches the rename field's wrapper (an input; no visible effect found)
Not changed, on purpose:
- `Overview.tsx` Exit `0/2` and `FsePanel.tsx` `and N more`: not counts (A8 (d))
- AR33 `.rr-card` padding (FR-3)
- one-letter slugs still show a gap before the comma from `min-width: 24px` (AR28); in progress.md, Found, not asked

## Notes
- The default report fixture's last run already lists three slugs (`d, e, f (not cut)`) but all one letter; `--wide-slug` is what shows AR35.
- The rail's folded groups draw `ASLEEP (1)`, a count form outside this spec (Found, not asked).

## Review
- Verdict: **pass** (code gate). Unmet rows: none. Reviewer l72-rev, 2026-11-02, commit 27962f3 (base origin/main 35992ed), clean clone of the GitHub remote. AR35, AR36 are l72-ui's.
- change-check (`--base origin/main`): 11 files, 4 flags; undeclared 0, declared-not-changed 0.
  - `outside boundary testdata/fixture-report/launch.sh`: the `--wide-slug` fixture state; Pre-answered allows adding a state the fixtures lack. Explained.
  - `untested? StageGates, TrackRowView, UsageSessions`: V1 drives TrackRowView through RunTracks' `draw`; V2's scan reads all three files' source. Explained.
- V1: `npx vitest run src/components/RunTracks.test.tsx src/components/SecCount.test.tsx -t leftovers-72` on 35992ed with the branch's two test files copied in: 5 failed, 1 passed (the scan's self-test); on 27962f3: 6 passed. V2 on 35992ed names exactly the spec's five (Overview.tsx:152, Rail.tsx:279, :380, RunReport.tsx:172, UsageSessions.tsx:27).
- Cases the builder's tests lack: a `left` of one reads `1/4 · left a` (0 `.rt-comma`), of two `1/4 · left a, b` (1), a to-cut first `a (not cut), b`; SecCount n=0 → `Gates · <span class="num sec-count">0</span>`, n=12 → `… 12`. The scan catches `{' · '}`, `&middot;`, `<b className="num`, a `cx(` title class (each → `Gates`). Read: all five sites go through SecCount, Usage's chevron before it, the rail's count stays before the spacer; `Exit 0/2` and `and N more` untouched.
- X0: `pnpm install --frozen-lockfile` 0; `make test` 0, 19 Go packages ok, vitest 101 files / 1702 tests; test run **fresh**, id 9fa472076b1e117255a2bcaadfd5b667; `wails build` 0; `make review-build` 0; `git status --porcelain` empty. Logs in `.wt-notes/l72-rev/`.
- Note (to the FSE, a possible V2 widening, no site today): the scan misses a count span whose class does not start with `num` (`className="mono num"`), a dot written `{"\u00b7"}`, and a title that is an expression (`{label} <span className="num">`); a grep of components finds no title count written those ways now.
- Note (to Aglaea, with the builder's Found, not asked): one-letter slugs keep a gap before the comma (AR28's 24 px minimum); folded rail groups draw `ASLEEP (1)`.
