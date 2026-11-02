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
next: "PR with talos-lab"
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

## UI review
- Verdict: **pass**. Reviewer l72-ui, 2026-11-02, commit 27962f3 (main 35992ed for comparison). Unmet rows: none. Sev 4/3: none.
- How: review build `Deltagos Review` (pid saved, stopped), launched by `testdata/fixture-report/launch.sh … rr --rejected --wide-slug --resize 1024x640@2`; `ORGANIZER_CONFIG` and `XDG_DATA_HOME` under `/private/tmp/organizer-fixture.BuwPnN` (removed after). Screen unlocked. AX reads and AXPress on that pid, `screencapture -l` of its 1024x640 window (1x display), ink measured with `measure.py`. The AR35 ring ran **offscreen** (WKWebView Tab harness over the built `frontend/dist`, bindings dumped from this fixture by the real service): WebKit draws no ring in a window that is not key, and I may not make it key. Notes and shots in `.wt-notes/l72-ui/`.
- Shared test run: **reused** 9fa47207-69925 of 27962f3 (l72-rev's), exit 0. `make review-build` 0, porcelain empty.
- **AR36 met** (review build). Ink px before/after the `·`: Usage `Sessions · 10` 4/4, chevron before it (main had 4/9) `1024x640-ar36-usage-sessions.png`; Overview `GATES · 6` 4/4, `EXIT 0/2` unchanged `1024x640-ar36-overview-gates.png`; rail `ROLES · 4` 2/3 `1024x640-ar36-rail-roles.png`, after Group by client `ACME · 2` 3/3, `PERSONAL · 7` 3/4 `1024x640-ar36-rail-groups.png` (the rail's xs size; markup is one space each side, the 1 px is rounding at 1x); run report `RULED WHILE YOU WERE AWAY · 1` 4/4 `1024x640-ar35-report-left.png`. Counts stay right after the name, before the spacer, as on main. The builder's risk, a long group name, checked offscreen: `acme platform modernization and onboarding` ellipsizes and `· 2` stays visible `1024x640-risky-rail-longgroup-offscreen.png`.
- **AR35 met** (commas in the review build, ring offscreen). `wide-slug, f (not cut)`: 1 px from the `g` to the comma, a space after it `1024x640-ar35-report-left-zoom.png`. Focused by Tab: outset ring 2 px at offset 2 px, the name clear of it, the comma inside it, untouched `1024x640-ar35-ring-branch-offscreen-zoom.png`. Main reads `wide-slug ,f` with the ring at the comma `1024x640-ar35-ring-main-35992ed-offscreen-zoom.png`.
- F1 (sev 2) The focused ring crosses the next item's first glyph. What Pablo cannot do: read the item after a focused link cleanly while it holds focus. Where: a track's `left`, `wide-slug` focused, `f (not cut)` after it, `1024x640-ar35-ring-branch-offscreen-edge.png`. Evidence: the ring's right edge is css 451.7-453.7; `f`'s crossbar starts at about 452, inside it. The comma's pull moved the next item 4 px into the outset ring; a following link keeps clear because of its own 4 px padding, but a not-cut span has none. Severity 2: only while it is focused, and only before a not-cut item; `f` still reads. Proposal: in a `left` list draw `.rr-card`'s ring inset (`outline-offset: -2px`, as `.rt-waitline` does), or pad `.rt-tocut` at its start.
- F2 (sev 1, known: the builder's Found, not asked) One-letter slugs keep a gap before the comma, `d , e ,` (8-9 px of ink), because AR28's 24 px minimum centres the glyph. Real slugs are wider; only the contract fixture has one-letter slugs.
- Spec gaps (FSE): AR35 says the ring may touch the comma, never the name, but not whether the name means the focused link only or also the next item (F1). AR36 does not cover the folded rail groups' `ASLEEP (1)` / `ARCHIVED (1)`, a third count form.
- For aglaea (questions, not findings): (a) F1, inset or outset ring in a comma list; (b) F2, start-aligned text inside the 24 px minimum; (c) `ASLEEP (1)`, should it become `Asleep · 1`; (d) rail group names are client names (`ACME`, `CCINT`) uppercased by `.rail-group`, as on main: does the rule against uppercasing proper names cover a user's group names?
- Not verified: the ring on screen in the review build (it ran offscreen, for the reason above); the rail's rename field inside the new title row (opening it needs a double-click, which no AX action gives).
- Housekeeping: my two offscreen `http.server` processes (127.0.0.1:34172/34173, pids 15840, 25252) were reparented and safe-kill refuses them; their directories are gone. The fixture's stand-in agents exit on their own.
