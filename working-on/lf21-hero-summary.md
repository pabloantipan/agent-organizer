---
title: "The rail hero is a summary, never a button"
status: now
repos: [organizer]
branch: lf21-hero-summary
seat: hs-build
stage: one-window
updated: 2026-10-11
next: "hs-build: revert the button.link cursor change (outside boundary), rebase on 0f09de0, X0; then hs-review re-pins"
depends_on: []
boundary: ["docs/specs/leftovers-21.md Boundary, lf21-hero-summary"]
spec: "docs/specs/leftovers-21.md (FR-1, FR-2; initiatives-view Amendment 6, I39)"
gate: "docs/specs/leftovers-21.md Acceptance, rows H1, H2, H3 and X0"
ui_review: true
review: pass
---

## Goal
The hero is read as what it is, a summary; Home is the Home tab (Aglaea, f5d0302, from sup57's bk-ui).

## Gate
docs/specs/leftovers-21.md, rows H1, H2, H3 and X0.

- [x] H1 vitest of `RailHero` on Home and on an initiative: `frontend/src/components/Rail.hero.test.tsx`, `.wt-notes/hs-build/x0-make-test.log`
- [x] H2 AX tree of the review process on Home and on an initiative: `.wt-notes/hs-build/ax-home.txt`, `ax-initiative.txt`, `ax-press-home-tab.txt`, `ax-after-home-tab.txt`
- [x] H3 computed style of `.rail-hero` on Home, plain and hover forced: `.wt-notes/hs-build/h3-computed.json` (WebKit 26.5, Chromium 151)
- [x] X0 make test, pnpm run build, wails build, git status --porcelain from a clean clone: `.wt-notes/hs-build/x0-*.log`, `x0-porcelain.txt` (empty)

## Done
- hs-build, 2026-10-11: the hero is a role-less summary on every screen (no title, press, pointer or hover); on an initiative its one control stays Back to Initiatives; ea21679 (rebased on main from d6e12f7, where the gate ran; same code), gate met. Progress: `.wt-notes/hs-build/progress.md`.

## Notes
- lf20's initiative wrapper `<section aria-label>` was a region landmark; it is now a plain div on both screens, since A6 says no role.
- X0 passed on d6e12f7 (based on e54cad0). After the rebase on main, `wails build` leaves `frontend/wailsjs/runtime/{package.json,runtime.d.ts,runtime.js}` as mode changes 755 → 644 (`.wt-notes/hs-build/x0-ea21679-modes.txt`): main's cbada68 committed them 644 → 755, picked up from a stray review build of mine that ran in the root checkout at 23:25 (progress.md, Found). Fix is `git update-index --chmod=-x` on those three on main, outside this card's boundary; asked sup58.
- `pressHero`'s Home branch is now unreachable from the rail; left in place (outside the boundary), covered by Places.test.

## Review
Pass: H1, H2, H3 and X0 met on d6e12f7. The branch has since moved to ea21679, a rebase with the same patch (`git range-diff` shows `=`). I reviewed d6e12f7 as pinned.

- H1: `npx vitest run src/components/Rail.hero.test.tsx` in a clean clone at d6e12f7: 4/4 pass. With main's `Rail.tsx` and `global.css` put back, all 4 fail (`.wt-notes/hs-review/h1-vitest.log`, `h1-on-main.log`). Home renders a `div.rail-hero` with no button, role, title or tabindex. An initiative renders exactly one button, `Back to Initiatives`.
- H2: `make review-build` in the clone, launched with the fixture (`auth: off`), pid saved. AX was read on that pid only. Home: the hero is static text only, with no AXButton (`ax-home.txt`). After AXPress on rail item init-a there is one AXButton `Back to Initiatives` (`.hero-back`) in the hero (`ax-initiative.txt`). AXPress on the Home tab gives `.place-tab.on` Home and the hero back to "Working on / Home" (`ax-press-home-tab.txt`, `ax-after-home-tab.txt`).
- H3: the clone's `pnpm run build` dist ran in Playwright headless WebKit 26.5 and Chromium 151. Every `:hover` rule was copied onto a forced class, with no pointer used. Plain and hovered both read `cursor: auto`, bg `rgb(32, 27, 43)`, border `solid 1px rgba(255, 255, 255, 0.09)`, and the hero holds 0 buttons (`h3-computed.json`).
- X0: in the clean clone at d6e12f7, `XDG_DATA_HOME=$(mktemp -d) make test` passes (Go ok, vitest 41 files / 542 tests). `pnpm run build` and `wails build` both exit 0, and `git status --porcelain` is empty (`x0-*.log`, `x0-porcelain.txt`).

Unmet rows: none.

Outside the gate: `global.css` also drops `cursor: pointer` from `button.link`. That change applies to every link button in the app. It is outside the Boundary (`.rail-hero*` and `.hero-back` only), and progress.md does not explain it. No row covers it. sup58 should decide whether to revert it before merge.

No `## UI review` section yet, so status and place are unchanged.

Reviewer hs-review, 2026-10-11, commit d6e12f7fac3f172205d1097de06b139318d71b03.
