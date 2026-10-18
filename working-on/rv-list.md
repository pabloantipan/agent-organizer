---
title: "The Review screen: opened from the card, its header and the worklist"
status: now
repos: [organizer]
branch: rv-list
seat: rl-build
stage: review-map
updated: 2026-10-18
review: pass
next: "file finding: rl-ui U1 (focus on body when the screen opens), U2 (crumb title cut at 1024), U3 (flag wrap indent), G1-G3, A1-A2; rl-review fixture gap (remote card, second package), .topbar min-width, flagLook unused (rv-symbol); then move to done (both reviews pass)"
risk: medium
footprint: [frontend/src/components/Review.tsx, frontend/src/components/Review.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/components/CardDrawer.tsx, frontend/src/stores/board.store.ts, frontend/src/App.tsx]
depends_on: [rv-data]
boundary: ["docs/specs/review-map.md v2 Boundary, rv-list"]
spec: "docs/specs/review-map.md (v2, FR-18; docs/ux/specs/review-view.md)"
gate: "docs/specs/review-map.md v2 Acceptance, rows V-R1, V-R2, V-R3, V-R9, V-R11, V-S, V-R12 and X0"
ui_review: true
---

## Goal
Pablo opens a card's change and sees what is left to review, in the order to review it.

## Gate
docs/specs/review-map.md v2, rows V-R1, V-R2, V-R3, V-R9, V-R11, V-S, V-R12 and X0.
- [x] V-R1: `.wt-notes/rl-build/out/vr1-vr3.txt`, `out/vr1-card-back.png`
- [x] V-R2: `.wt-notes/rl-build/out/vr1-vr3.txt`, `out/vr2-map.png`
- [x] V-R3: `.wt-notes/rl-build/out/vr1-vr3.txt`; order on a bigger map in `frontend/src/lib/review.test.ts`
- [x] V-R9: `.wt-notes/rl-build/out/vr9.txt`, `out/vr9-partial.png`
- [x] V-R11: `.wt-notes/rl-build/out/vr11-1024x640.txt`, `out/vr11-1440x900.txt`
- [x] V-S: `frontend/src/components/Review.test.tsx`, `frontend/src/lib/review.test.ts`
- [x] V-R12: `.wt-notes/rl-build/vr12.txt`
- [x] X0: `.wt-notes/rl-build/x0-make-test.txt`, `x0-pnpm-build.txt`, `x0-wails-build.txt`, `x0-porcelain.txt` (clean clone of 62d9133)

## Done
- 2026-10-18 rl-build: FR-18 on branch `rv-list` (fca7bdc..62d9133, unmerged, rebased on main 1e1b750); gate met in a clean clone; progress, choices and reproduction in `.wt-notes/rl-build/progress.md`

## Notes
- The review screen is the store's `review` place over `screen: "initiative"`, not a new `Screen` member: `lib/place.ts` switches over `Screen` exhaustively and is outside the boundary. Any navigation that sets `screen` leaves it.
- The crumb's card title made the top bar (and every screen, via `.shell`'s auto column) 1158 px wide at 1024; fixed in review.css by a zero basis (be5cea9). A `min-width: 0` on `.topbar` would guard every crumb; shell.css is outside this card.
- rv-symbol mounts into `SymbolPane` (Review.tsx): `.review-diff` and `.review-facts`; what it gets from the store is in progress.md.
- The fixture has no card of another machine; `!local` is proven by `reviewable` in vitest.

## Declared changes
- added `frontend/src/lib/review.ts`: groups, order, counts, next, partial lines, §4 words
- added `frontend/src/lib/review.test.ts`: V-R2, V-R3, V-R9, V-R11, V-S logic
- added `frontend/src/components/Review.tsx`: the Review screen, its header, worklist, make, the symbol's mount
- added `frontend/src/components/Review.test.tsx`: V-S, the crumb
- added `frontend/src/styles/review.css`: the screen's layout and widths, the crumb's title
- modified `frontend/src/components/CardDrawer.tsx`: the Review section, focus back on Review the change
- modified `frontend/src/stores/board.store.ts`: the review place, openReview, closeReview, leaving it on navigation
- modified `frontend/src/App.tsx`: mounts the Review screen
- modified `frontend/src/components/TopBar.tsx`: the crumb `<initiative> › <card title> › Review` (outside the card's footprint, in the spec's Boundary as "the crumbs")
- modified `frontend/src/components/SkipLink.test.tsx`: App has a fifth main
Risky:
- `leaveReview`: wraps the store's `set`; a future navigation that sets `review` and `screen` together keeps the screen
- `ReviewSection`: one ReviewStatus call per local card back opened
Not changed, on purpose:
- `frontend/src/lib/place.ts`: the screen stays `initiative`, so marks need no new case
- `frontend/src/hooks/useWails.ts`: bindings imported directly, as TopBar and Crew do
- `frontend/wailsjs`, `app.go`, any Go: the data is rv-data's

## Review
Verdict: **pass** — every gate row (V-R1, V-R2, V-R3, V-R9, V-R11, V-S, V-R12, X0) is met on 62d9133, run from a clean clone (`.wt-notes/rl-review/clean`, removed after). Unmet gate items: none.

Reviewer `rl-review`, 2026-10-18. Evidence in `.wt-notes/rl-review/`.

- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` **fresh**, run `e9312599-68276` of 62d913385069e4a08b00d84076d30ed8600fea41 (rl-ui reused it): go test ok, vitest 73 files / 846 tests passed, exit 0. `test-lease run -- pnpm run build` 0, `test-lease run -- wails build` 0, `git status --porcelain` empty (again after the harness runs and a second `wails build`).
- V-R12: `grep -iE "reactflow|@xyflow|elkjs|monaco"` over `frontend/package.json` and `frontend/dist` (the built bundle): no match (rc 1). No dependency added (package.json and the lockfile are not in the diff).
- V-S: `lib/review.test.ts` and `components/Review.test.tsx` compared string by string with review-view §4: `No review map for this change yet.`, `Make the map` (primary), `Making the map · 2 s` on the aria-disabled busy button with `Stop` and no spinner, the reason with `Try again` and `Copy the command` (stubbed clipboard only), `The branch moved since this map (4d2a91b → 9e0f3c1).` with `Make it again`, `changed since you reviewed` with no mark, `Nothing to review at symbol level: the change touches no Go or TS definition.` with the file list, `Reviewed 2 of 2` and no `Next to review`. All exact.
- Harness (my copies of rl-build's `tabharness.swift`, which differs from `scripts/tab-harness` only by the `n`/`shift-n` keys sent to its own off-screen window; my `wails dev -devserver localhost:34253` from the clean clone, `fixture-home.sh --review`, `auth: off`, probe stubbed; lock held; dev and fixture stand-ins killed by saved pid):
  - V-R1: card `nonext` (no branch) labels `Repos, Actions, Discuss, Path`, no button; `rv-fixture` shows `Review` › `Review the change`; Return opens the screen, crumb `init-a › Greet acme by name on the board › Review` (Review `aria-current`); Escape and `← Card` both land on the card back with focus on `Review the change`.
  - V-R2: `Reviewed 0 of 2 · 1 must-visit left`, counts `2afc080 ← 7a49532 · 2 symbols changed, 0 tests`.
  - V-R3: from `← Card`, `N` → `format.formatName` (Must visit, h2 focused), `N` → `Greet` (svc), `Shift+N` → back to `format.formatName`. Tab: `← Card` → `Next to review` → the tree (one stop), arrows move, ← folds, → unfolds, Enter opens.
  - V-R9: PATH without `/Users/pabloantipan/bin` (`command -v change-check`: none), Make the map → `⚠ Not checked against the card's declared changes: change-check not on PATH.` in `rgb(255,176,32)` = `--warning`; coverage drops the must-visit part since nothing was reconciled, and the line says so.
  - V-R11: 1024×640: list 280, `.review-symbol-body` one column (facts under), scrollWidth 1024 = width, no element past the right edge; 1440×900: list 300, columns `716px 360px` (facts beside), scrollWidth 1440.
  - Beyond the rows: the moved state live (`The branch moved since this map (2afc080 → 7496b4d).`, Make it again busy with Stop, the remade map's head), and `goHome` / `openInitiative` from the screen leave it (`review: null`).
- No-gos and Amendment 1: no network, no absolute path, no new dependency in the diff; `ReviewSection` gates on `c.local` only (`reviewable(local, status)`); `readOnlyOf` is not consulted for it.

change-check (from the clean clone):

```
change-check: working-on/rv-list.md
risk: medium
repo organizer: base e8a8250be (default main) ... head rv-list 62d913385; 10 files

## Changed

- organizer/frontend/src/App.tsx (modified): App
- organizer/frontend/src/components/CardDrawer.tsx (modified): CardBack, ReviewSection
- organizer/frontend/src/components/Review.test.tsx (added, test)
- organizer/frontend/src/components/Review.tsx (added): Review, ReviewViewProps, ReviewView, MakeButton, copyCommand, CopyCommand, Item, Worklist, SymbolPane
- organizer/frontend/src/components/SkipLink.test.tsx (modified, test)
- organizer/frontend/src/components/TopBar.tsx (modified): TopBar, WhereProps, Where
- organizer/frontend/src/lib/review.test.ts (added, test)
- organizer/frontend/src/lib/review.ts (added): ReviewPlace, MarkState, makingLabel, elapsedOf, short, movedLine, flagWords, flagLook, changed, isTest, pkgOf, shortName, pkgTitle, Row, GroupKind, Group, marksOf, fileOrder, rowOrder, worklist, walkOf, nextToReview, Coverage, coverage, coverageLine, allReviewed, plural, countsLine, sentence, partialLines, nothingToReview, filesOf, rowName, groupName, ScreenState, screenState, reviewable, listWidth, factsBeside, inTextField
- organizer/frontend/src/stores/board.store.ts (modified): State, ReviewOpen, Patch, leaveReview
- organizer/frontend/src/styles/review.css (added)

## Tests touched

- organizer/frontend/src/components/Review.test.tsx
- organizer/frontend/src/components/SkipLink.test.tsx
- organizer/frontend/src/lib/review.test.ts

## Risky (declared)

- `leaveReview`: wraps the store's `set`; a future navigation that sets `review` and `screen` together keeps the screen
- `ReviewSection`: one ReviewStatus call per local card back opened

## Not changed, on purpose (declared)

- `frontend/src/lib/place.ts`: the screen stays `initiative`, so marks need no new case
- `frontend/src/hooks/useWails.ts`: bindings imported directly, as TopBar and Crew do
- `frontend/wailsjs`, `app.go`, any Go: the data is rv-data's

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| boundary unreadable | organizer | docs/specs/review-map.md: no section 'v2 Boundary' | boundary entry |
| outside boundary | organizer/frontend/src/App.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/CardDrawer.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/Review.test.tsx |  | added |
| outside boundary | organizer/frontend/src/components/Review.tsx |  | added |
| outside boundary | organizer/frontend/src/components/SkipLink.test.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/TopBar.tsx |  | modified |
| outside boundary | organizer/frontend/src/lib/review.test.ts |  | added |
| outside boundary | organizer/frontend/src/lib/review.ts |  | added |
| outside boundary | organizer/frontend/src/stores/board.store.ts |  | modified |
| outside boundary | organizer/frontend/src/styles/review.css |  | added |
| outside footprint | organizer/frontend/src/components/SkipLink.test.tsx |  | modified |
| outside footprint | organizer/frontend/src/components/TopBar.tsx | TopBar | modified |
| outside footprint | organizer/frontend/src/components/TopBar.tsx | WhereProps | modified |
| outside footprint | organizer/frontend/src/components/TopBar.tsx | Where | modified |
| untested? | organizer/frontend/src/components/CardDrawer.tsx | ReviewSection | no test file names it |
| untested? | organizer/frontend/src/components/Review.tsx | MakeButton | no test file names it |
| untested? | organizer/frontend/src/components/Review.tsx | CopyCommand | no test file names it |
| untested? | organizer/frontend/src/components/Review.tsx | Worklist | no test file names it |
| untested? | organizer/frontend/src/components/Review.tsx | SymbolPane | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | flagLook | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | isTest | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | pkgOf | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | pkgTitle | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | marksOf | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | fileOrder | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | rowOrder | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | plural | no test file names it |
| untested? | organizer/frontend/src/stores/board.store.ts | leaveReview | no test file names it |

29 flags: outside boundary 10, outside footprint 4, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 14, could not read 0, boundary unreadable 1
```

Explained:
- `boundary unreadable`: the card's entry has words after the path, a known change-check false flag. Read by hand against review-map.md v2 `### Boundary`, rv-list bullet; with it the ten `outside boundary` lines go: Review.tsx, Review.test.tsx, lib/review.ts, lib/review.test.ts, styles/review.css, CardDrawer.tsx, board.store.ts, App.tsx are named; TopBar.tsx is "the crumbs" (the crumb lives in `Where`). SkipLink.test.tsx: the rv-list bullet does not say "their tests", but the change is the one count of `<main>` in App.tsx that mounting the screen (named) necessarily moves (4 → 5); I count it as part of mounting the screen. Note, not a finding.
- `outside footprint` (TopBar.tsx ×3, SkipLink.test.tsx): declared by the builder, inside the spec's Boundary as above; the footprint simply did not list them.
- `untested?` ×14: change-check matches test files by symbol name. `rowOrder`, `fileOrder`, `marksOf`, `pkgOf`, `pkgTitle`, `isTest`, `plural` are exercised through `worklist`, `coverage`, `groupName` and `countsLine` in review.test.ts; `Worklist`, `SymbolPane`, `MakeButton`, `CopyCommand` through `ReviewView` in Review.test.tsx; `ReviewSection` through `reviewable` (vitest) and V-R1 in the harness; `leaveReview` by my harness step above. `flagLook` is used by nothing on this branch (Note below).
- No `undeclared`, no `declared, not changed`.

Notes (not blocking):
- Note: `flagLook` in lib/review.ts is exported and unused; Review.tsx colours flags by class. Presumably for rv-symbol's V-R5. → rv-symbol (use it or drop it).
- Note (gate): V-R3's "packages by size" and V-R1's "another machine's card" cannot show on the fixture (one package outside Must visit, no remote card); both are proven only in vitest (`worklist(big)`, `reviewable(false, …)`). The fixture could carry a second package and a remote card. → nowhere yet: `next` files it.
- Note (gate): the harness steps only print values (no assertions); the row is judged by reading the output. Fine for a reviewer, but a builder's "gate met" on them is a reading, not a test.
- Builder's "Found, not asked": `.topbar` `min-width: 0` in shell.css (guard for every long crumb) → nowhere yet: `next` files it; change-check's boundary parse → the known change-check false flag, no new place; place.ts exhaustive switch and the docs-only file list → no action, as the builder chose.

Where the findings went (rl-review, 2026-10-18, after rl-ui's pass): nowhere yet. No card, record or backlog line names rl-ui's U1, U2, U3, G1, G2, G3, A1, A2, nor this review's fixture gap, `.topbar` `min-width: 0` or unused `flagLook` (rv-symbol's card does not mention it). So the card stays open with `next: "file finding: …"`, per the review rule; the move to done waits for the FSE to file them.

## UI review
rl-ui, 2026-10-18, on 62d913385069e4a08b00d84076d30ed8600fea41 (every row; the branch did not move). **Verdict: pass.** No severity 4 or 3. Evidence: `.wt-notes/rl-ui/` (`out/` shots and harness logs).

How each state was checked:
- Review build (`make review-build`, my worktree): I launched `Deltagos Review` myself on `fixture-home.sh --review` with auth off and the probe stub, read the AX tree by my own pid and shot `screencapture -o -l` of its window. I drove it only by AXPress on that pid. The screen was not locked.
  - A, change-check on the PATH: the card back has a Review section (`wk-1024x640-R1-card-back.png`). No map (`wk-1024x640-S-no-map.png`). Make the map shows `Making the map · 0 s` with Stop, then the map: `81ba32a ← 37622fc · 2 symbols changed, 0 tests`, `Reviewed 0 of 2 · 1 must-visit left` (`wk-1024x640-R2-map.png`). The symbol at 1440×900 (`wk-1440x900-R11-symbol.png`). Moved (`$FIXTURE_REVIEW_MOVE`): `The branch moved since this map (81ba32a → 1b4f44d).` with Make it again. Making it again shows the counter and Stop in the header, and the map is remade at 1b4f44d.
  - B, change-check off the PATH: `⚠ Not checked against the card's declared changes: change-check not on PATH.` (`wk-1024x640-R9-partial.png`). After the make, focus is on the worklist.
- Tab harness (builder's copy with `n`/`shift-n`, steps read and copied to `.wt-notes/rl-ui/steps/`). It ran against my own `wails dev` on :34254 from a clean clone of 62d9133, fixture --review, auth off, under `harness.lock`. The window was key (`isKey: true`).
  - V-R1: nonext has no Review section; rv-fixture shows `Review the change`. Esc and ← Card both return to the card back with focus on the button, focus-visible.
  - V-R3: N from ← Card goes to formatName (Must visit), then Greet (svc); Shift+N goes back to formatName. Focus is on the h2 each time.
  - Tab from ← Card: Next to review, then the worklist as one stop. ↑ ↓ ← → Enter behave per §5. The group head's ring is 2 px `--focus-ring` on `.rv-ghead`.
  - V-R11: 1024×640 gives list 280 and facts under the diff. 1440×900 gives list 300 and facts beside the diff at 360. scrollWidth equals the width on page, body, main and top bar (`h-vr11-*.txt`).
- vitest: in the shared run (Review.test.tsx states, lib/review.test.ts).
- V-R12: no reactflow, @xyflow, elkjs or monaco in `frontend/package.json` or the built `dist`.
- Shared test run: **reused**, run `e9312599-68276` of 62d913385069 by organizer-probe-rl-review. Exit 0: Go ok, vitest 73 files and 846 tests (`.wt-notes/rl-ui/x0-make-test.txt`).

§4 words, design against screen:
- `No review map for this change yet.` / `Make the map` (primary): same, on screen.
- `Making the map · 2 s` and `Stop`: `Making the map · 0 s` and `Stop` on screen. The fixture's make takes under 1 s, so n ≥ 1 is shown only in vitest. Focus stays on the busy button (harness `making`).
- Failed: the reason, `Try again`, `Copy the command`: same in vitest only.
- Partial: `Not checked against the card's declared changes: …`: same, on screen, in `--warning` (#ffb020).
- Moved: `The branch moved since this map (4d2a91b → 9e0f3c1).` / `Make it again`: same shape, on screen, with the fixture's shas.
- New map, same symbol, `changed since you reviewed`: same in vitest only (row name).
- Docs-only: `Nothing to review at symbol level: the change touches no Go or TS definition.`: same in vitest only.
- All reviewed, `Reviewed 8 of 8` with Next to review gone: `Reviewed 2 of 2` with no Next to review, in vitest only.
- Crumb `<initiative> › <card title> › Review`: `init-a›Greet acme by name on the board›Review` (separators aria-hidden), with Review `aria-current`.
- No symbol chosen: an empty `section` named Symbol, with no words, as §4 gives none. rv-symbol's place (`.review-diff`, `.review-facts`) is there and laid out per §3.4.

Findings:
- **U1 (2) Opening the screen drops focus on the page body.**
  - What the person cannot do: a screen-reader user is told nothing when the screen opens, and no ring shows where they are.
  - Where: card back → `Review the change` → the Review screen (harness `open-focus`: `BODY`, `.wt-notes/rl-ui/out/h-ui-open.txt`).
  - Evidence: `docs/design-system.md` Focus and names says of navigating: "Never on the page body". The first Tab does land on `← Card` and N works from body, so a keyboard user recovers in one press.
  - Proposal: on open, focus the screen's first target. That is the worklist stop with a map and `Make the map` without one, as the after-make handoff already does. Otherwise `← Card`.
- **U2 (2) The crumb's card title is cut to 8 characters at 1024.**
  - What the person cannot do: read which card's change is open at the laptop width.
  - Where: top bar at 1024×640, `init-a › Greet ac… › Review` (`wk-1024x640-R2-map.png`). At 1440 the title box grows to 32ch and leaves a ~50 px gap before `› Review` (`wk-1440x900-R11-symbol.png`).
  - Evidence: computed `.crumb-card` 59 px wide against 201 px of text. The full title is only in a hover `title`.
  - Proposal: shrink-wrap the title (basis auto, `min-width: 0`, max 32ch) so the gap falls after Review. Give the crumb its width budget at 1024 against the memory badge (see G1).
- **U3 (1) A row's flags wrap under the name at a smaller indent than the name** (`no direct test` at x 48 under a name at x 59, `wk-1024x640-R2-map.png`).
  - What the person cannot do: nothing is blocked; the second line reads as a separate row at a glance.
  - Evidence: `.rv-row` is a wrapping flex row and the mark span takes the first line's indent.
  - Proposal: put the flags on a second line indented to the name, or make the mark a fixed first column.

Spec gaps (for the FSE):
- G1: §5 orders Tab but does not say where focus goes when the screen opens (U1). The crumb's width at 1024 beside the memory badge is not specified (U2).
- G2: the fixture has no remote card and only one package outside Must visit. V-R1's `!local` and V-R3's "by size" rest on vitest only (same as rl-review's note).
- G3: the fixture's make is under 1 s, so the §4 making counter past `0 s` is never seen live.

For aglaea:
- A1: TS symbols in Must visit are qualified by file stem (`format.formatName`), and Go ones by package (`shared.Upload` in §3). Is the file stem the right qualifier for TS?
- A2: a make under a second flashes `Making the map · 0 s` and Stop. Should the busy state wait about 1 s before it shows?

Not verified in WKWebView (vitest or DOM only): failed state with `Try again` and `Copy the command`, since the fixture has no failure path and no row writes the clipboard. Also: docs-only, all reviewed and its live-region line (needs rv-symbol's marks), `changed since you reviewed` (no marks to carry on the remake), the counter at n ≥ 1, and another machine's card.
