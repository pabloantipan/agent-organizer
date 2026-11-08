---
title: "Comma lists read as text, counts read one way, your names read as you wrote them"
status: now
repos: [organizer]
branch: lf73-inline-names
seat: l73-build
reviewer: l73-rev, l73-ui
review: "l73-rev pass at ba9f59f (V1, V2, V3, X0); AR35, AR37, AR38 to l73-ui"
stage:
updated: 2026-11-08
next: "review: lf73-inline-names, V1-V3 and X0 pass (AR35 ring, AR38 review view left to l73-ui), ba9f59f"
depends_on: [lf72-counts-commas]
boundary: ["frontend/src/components/RunTracks.tsx", "frontend/src/components/Rail.tsx", "frontend/src/components/Review.tsx", "frontend/src/components/SecCount.tsx", "frontend/src/styles/runreport.css", "frontend/src/styles/global.css", "frontend/src/styles/review.css", "frontend/src/lib/folds.ts", "frontend/src/lib/folds.test.ts", "frontend/src/lib/floatList.ts", "frontend/src/lib/floatList.test.ts", "frontend/src/components/"]
spec: "docs/specs/leftovers-73.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-73.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No ring over a name, no "(N)", and no name of Pablo's shouted in capitals.

## Gate
docs/specs/leftovers-73.md, rows V1-V3, AR35, AR37, AR38 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #61).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); a test outside the named files may change only where it asserts the old markup (the boundary's last entry, for that only).
- Design: Aglaea's e729ecc; anything else to the FSE.
- Short-sample fallback: the existing fixtures; a named rail group and a not-cut item after a link are added to the fixture if missing; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-02 l73-build: FR-1..4 and Amendment 1 on lf73-inline-names (b74efc3, e4dd6cf, ba9f59f, on origin/main 51db34f); V1-V3 fail on 51db34f (9) and pass (12); X0 passes from a clean clone; rail and left list read by AX at 1024x640; notes in .wt-notes/l73-build/progress.md.

## Declared changes
- modified `frontend/src/components/RunTracks.tsx`: left-list links carry `rr-inline` (FR-1, FR-2)
- modified `frontend/src/styles/runreport.css`: `.rr-card.rr-inline` min-width 0 and inset focus ring (FR-1, FR-2)
- modified `frontend/src/components/Rail.tsx`: Asleep and Archived heads through SecCount (FR-3)
- modified `frontend/src/components/Review.tsx`: group count through SecCount, `<title> · N` (FR-3)
- modified `frontend/src/lib/folds.ts:foldLabel`: `<word> · n` (Amendment 1)
- modified `frontend/src/lib/floatList.ts`: doc comment's example only (Amendment 1)
- modified `frontend/src/styles/global.css`: uppercase moved from `.rail-group-name` to `.rail-group-head.fixed .rail-group-name` (FR-4)
- added `frontend/src/components/RunTracks.lf73.test.tsx`: V1
- added `frontend/src/components/SecCount.lf73.test.tsx`: V2 and the foldLabel test
- added `frontend/src/components/Rail.lf73.test.tsx`: V3 and the folded groups' count
- modified `frontend/src/components/RunTracks.test.tsx`: lf72 V1 assert of the old `class="rr-card"` markup
- modified `frontend/src/components/FloatList.test.tsx`, `frontend/src/lib/folds.test.ts`, `frontend/src/lib/floatList.test.ts`: asserts of the old `(n)` text
Risky:
- `.rv-gtitle`: its ellipsis now cuts title and count together on a long package path
Not changed, on purpose:
- `Charter.tsx`: `(2 of 5)` is a position (spec)
- `frontend/src/styles/review.css`: `.rv-gcount` already styled the count; no rule needed
- `FloatList.tsx`: its doc comment still says `Asleep (n)`; outside the amended boundary

## Review
**Pass**: V1, V2, V3 and X0 are met. No unmet rows. Reviewer l73-rev, 2026-11-02, commit ba9f59f (on origin/main 51db34f). AR35, AR37 and AR38 are left to l73-ui.

change-check (`organizer lf73-inline-names --base origin/main`, from a clean clone): 14 files, outside boundary 0, undeclared 0, declared but not changed 0, `untested?` 2:
- `RunTracks.tsx:TrackRowView`: RunTracks.lf73.test.tsx renders it through `RunTracks`, so it is tested. No finding.
- `Review.tsx:Worklist`: no unit test renders its group head. The `<title> · N` output was checked by rendering `SecCount` with Worklist's props (below). The view itself is AR38, which l73-ui checks. Note.

Rows (logs and probes in `.wt-notes/l73-rev/`):
- V1, V2, V3: the 12 tests in the builder's three files pass on ba9f59f. With the same tests copied onto 51db34f, 9 fail and every row has at least one failure: V1 4 of 5, V2 2 of 3, V3 3 of 4.
- FR-1 and FR-2: checked against the cascade with the repo's `stateLayer.kit` `winnerOf` (`cascade-probe.txt`). A left-list link gets `outline-offset -2px` from `.rr-card.rr-inline:focus-visible`, and still does when hovered. It gets `min-width 0` and `min-height 0`. No `.rt-waitline` rule or progress-row rule reaches it. The progress-row and waits-line links keep `min-width 24px`.
- FR-3: rendered with n=0, n=10 and n=12 (`count-probe.txt`): `src/lib · 0`, `Tests · 12`, `Ops Team · 10`. `foldLabel` returns `Archived · 0`, `Asleep · 12`, and `Asleep` when no n is given. FloatList renders `foldLabel(f, n)`, and FloatList.test asserts `Asleep · 2`. Charter is not in the diff, and `(2 of 5)` is still there.
- FR-4 (cascade): a named group's name is `font-size xs`, weight 600, colour `--muted`, with no `text-transform` or `letter-spacing` from any rule, and none from its ancestors. Roles, ungrouped, Asleep and Archived stay uppercase, weight 500, colour `--dim`.
- X0: `pnpm install --frozen-lockfile`, then `make test`. The test run was fresh, id 81e838e7-80924 (Go ok, 1714 vitests). `wails build` and `make review-build` both exit 0. `git status --porcelain` is empty and no package-lock.json was left.

Notes (none fail the card):
- Note (to the FSE, for the next spec that scans counts): V2's regex catches only `({x.length})` and a `(` before a `num`/`sec-count` span. It misses `({n})`, `` `(${n})` `` and `&#40;`. That matches V2's wording. A grep of components/ and lib/ finds no count written in any of those forms today.
- Note (to the FSE, next leftovers): the doc comment at `FloatList.tsx:216-217` still says `Asleep (n)`, because the file is outside the boundary.
- Note (to l73-ui, AR38): `Worklist`'s group head has no unit test (see the change-check flag above).

## UI review
**Pass**: AR35, AR37 and AR38 are met. No sev 4 or sev 3 findings. Reviewer l73-ui, commit ba9f59f (on origin/main 51db34f). Started 2026-11-02, paused by Pablo's cell pause, resumed and finished 2026-11-08. The branch did not move.

How it ran: the review build in a detached worktree of ba9f59f, at 1024x640. Each launch went through the fixture launcher, which set `ORGANIZER_CONFIG` and `XDG_DATA_HOME` under its own `/private/tmp/organizer-fixture.*`. I checked both on every pid I started (2830, 34061, 8238, 26499). Checks were AX reads, AXPress and `screencapture -l` of my own window. The screen was not locked, so every row except the ring ran on screen. The ring ran offscreen because WebKit paints no ring in a window that is not key. Shots and AX dumps are in `.wt-notes/l73-ui/`.

X0 shared test run: **reused**, `test-lease: reused run 81e838e7-80924 of ba9f59f826d7 by organizer-probe-l73-rev`. Exit 0. `make review-build` exit 0. `git status --porcelain` was empty and there was no package-lock.json.

Rows:
- **AR35 (FR-1, FR-2): met.**
  - *Commas, review build on screen* (report fixture, `fixture` → Last run, left list): AX reads `3/6 · left `, `d` (`.rr-card.rr-inline`, 16x24), `,`, `e` (16x24), `,`, `f`, ` (not cut)`. It reads `d, e, f (not cut)` with no space before a comma, and the links have no 24 px minimum. The waits line's `d` stays `.rr-card` at 25x24, so AR28 holds there. Shots: `shots/1024x640-ar35-left-commas.png`, `-zoom.png`; AX dump: `ar35-left-ax.txt`.
  - *Ring, offscreen WKWebView harness* (l72-ui's tabharness, built `frontend/dist` of ba9f59f, l72-ui's mock of the fixture's outputs, left list `e, wide-slug, f (not cut)`, Tab from the previous control):
    - `wide-slug` has the not-cut item after it. It is focus-visible with `solid 2px` and `outline-offset -2px`, button box 368.1–440.9. At 2x the ring's pixels lie inside that box (x 736–881, y 732–779). Its own glyphs (372.1–436.9) sit inside the ring. The ring touches only its own comma, which sits inside the link's padding (436.95–440.1). `f (not cut)` starts at 442.5, outside the ring.
    - `e`: box 351.3–366.5, ring inside it (2x x 702–733). The next name `wide-slug` starts at 372.1.
    - Shots: `shots/1024x640-ar35-ring-branch-wide-offscreen.png`, `-wide-zoom.png`, `-branch-e-offscreen.png`, `-e-zoom.png`; measures in `off/ar35-ring-*.txt`.
    - Not re-run on 51db34f's dist: building main's dist with swap at about 98% was not cheap. The outset ring crossing the next glyph on main is l72-ui's F1 evidence.
- **AR37 (FR-3): met in the rail and the review view. The float list is not verified on screen.**
  - Rail, on screen: `ROLES · 4`, `ASLEEP · 1`, `ARCHIVED · 1`, each with a ` · ` text node and the number (`shots/1024x640-ar37-rail-home.png`, `-rail-folded.png`).
  - Review view, on screen (`fixture-home.sh --review`, init-a → Work → "Greet acme by name on the board" → Review the change → Make the map): the package group reads `svc · 1` (AXRow value `svc · 1`). Must visit carries no count. No `(N)` anywhere (`shots/1024x640-ar38-review-groups.png`, `ar38-review-ax.txt`).
  - The collapsed rail's float list (Amendment 1) is **not verified on screen**. It opens only on a native click on the floating icon, and no allowed AX read reaches it (see the incident below). FloatList.test asserts `Asleep · 2` and l73-rev checked `foldLabel`.
  - No `(N)` count in any view I passed.
- **AR38 (FR-4): met.**
  - After Group by client, on screen: `acme · 2`, `personal · 7`, `other · 1`, `ccint · 1`, each as written, in lowercase. `ROLES`, `ASLEEP` and `ARCHIVED` keep the uppercase label look (`shots/1024x640-ar38-rail-grouped.png`, `-grouped-lower.png`, `ar38-rail-ax.txt`).
  - A named group keeps the rail group label's xs size, weight 600 and `--muted` colour from `.rail-group-name`. The app's labels keep weight 500, `--dim` and the uppercase transform, per the cascade in `global.css:187,191`. Tokens only, no raw colours.

Findings (none fails the card):
- F1 (sev 1, for aglaea): after a comma, the gap before the next name differs.
  - What the person cannot do: read `d, e, f (not cut)` with even spacing.
  - Where: `shots/1024x640-ar35-left-commas-zoom.png`, run report track `left`.
  - Evidence: a link's 4 px padding sits before its glyph, a not-cut item has none, so `d,␣e` looks wider than `e,␣f`. The builder reported this in progress.md "Found, not asked".
  - Severity: 1.
  - Proposal: Aglaea decides whether the not-cut item takes the same inline-start padding.

Incident (process, not the card): to reach the float list, I sent one AXPress to the floating icon of my own review app (pid 34061). In the native code, `accessibilityPerformPress` calls `iconClicked`, which runs `[NSApp activateIgnoringOtherApps:YES]` and `makeKeyAndOrderFront` (`floaticon_darwin.m`). So that one press probably activated my review app over Pablo's desktop for a moment. I could not confirm it: FLOAT_LOG was unset, and a moment later the front app was Pablo's own. I did not press it again. I stopped that app by its pid and relaunched.

Spec gaps (for the FSE):
- The collapsed rail's float list (Amendment 1) has no on-screen route a reviewer may take: the icon opens it only by a native click, and its AX press activates the app. A gate row that names it needs an offscreen route or a test-only open.
- Review-view groups: the `--review` fixture has one non-must group (`svc`), so `<title> · N` was seen with N=1 only.

For aglaea:
- (a) F1, the uneven gap after a comma.
- (b) Client grouping seeds a group the app names `other` for initiatives with no client. It now reads lowercase, like a name Pablo wrote, beside the app's uppercase labels. Is `other` the app's label (uppercase, like ungrouped), or a group like any other once seeded? Not verified as a design intent.

Left running: the offscreen harness's `python3 -m http.server` on 127.0.0.1:34191 (pid 75972). I started it in a subshell, so it reparented to launchd. `safe-kill` refuses it and `kill` by its saved pid was denied. It serves a directory that no longer exists (the worktree is removed). Every other process and temp dir I started is gone.

## Notes
- l73-build: a comma before a not-cut item sits ~2 px from its glyph, after a link ~6 px (the link's padding); the text reads right, the look is uneven. For Aglaea if it matters.
