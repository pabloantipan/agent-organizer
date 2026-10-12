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

## UI review
Pass. Checked on d6e12f7 as pinned (version stamp `v0.2.0-1785-gd6e12f7`). I did not re-check ea21679; code review shows the rebase is the same patch. Fixture `auth: off`. My own `Deltagos Review` (pid 85100) ran from a detached worktree, and I read AX only on that pid. Shots are under `.wt-notes/hs-ui/`.

States, and how each was checked:
- Home, 1440×900 and 1024×672 (WKWebView): the hero is static text only ("Working on", "Home", counts), with no AXButton (`ax-home.txt`, `wkwebview-*-H2-home.png`).
- An initiative (AXPress on rail item init-a), 1440 and 1024: the hero holds exactly one AXButton, `Back to Initiatives`, above acme / init-a / counts (`ax-initiative.txt`, `wkwebview-*-H2-initiative.png`). AXPress on it opens Initiatives (`ax-press-back.txt`, `ax-initiatives-place.txt`). FR-2 holds.
- Home tab from an initiative: AXPress makes it `.place-tab.on`, and the hero reads Home again (`ax-after-home-tab.txt`). The only way Home is the tab, as I39 says.
- Initiatives and Usage show no rail, so they have no hero to check.
- H3, my own headless WebKit 26.5 and Chromium 151 run over the worktree's dist (`h3-mine.mjs`, `h3-computed.json`). The hero is a `DIV` with no role, title, tabindex or buttons. Its cursor is `auto` plain, with a headless hover, and with all 91 `:hover` rules forced. Background and border are the same in all three.
- H1 vitest: 4/4 pass (`h1-vitest.log`).

Findings:
- U1, sev 1. **What:** none for the person. **Where:** `global.css`, where `button.link` lost its `cursor: pointer`. **Evidence:** the base `button` rule still sets `cursor: pointer`, and `button.link` now declares no cursor, so every link button keeps its pointer. Nothing visible changes, but the edit is outside the Boundary (code review raised it too). **Proposal:** restore the line when the branch is next touched. Does the cursor matter to me (sup58)? Not for the person: reverting it changes nothing on screen, and keeping it changes nothing either. It matters only as a boundary edit, so the revert is fine. The UI verdict stands for the reverted head, provided the revert touches nothing but that line.

Spec gaps (FSE): none.

For aglaea:
- Q1: on Home the hero's counts reach AX as separate texts ("1", "now", "1", "blocked"…). A screen reader therefore reads each number apart from its noun. Should a summary group each count with its noun (for example one text "1 now")? This is not this card's scope.

Not verified in WKWebView: real pointer hover and the pointer cursor over the hero (rule 0108: no pointer on the desktop). Both rest on computed styles in headless WebKit and Chromium. I did not check VoiceOver speech.

I moved the card to done/ in 1d6431d before sup58's change of plan reached me; it is back in working-on/, status now, for sup58 to move.

UI reviewer hs-ui, 2026-10-11, commit d6e12f7fac3f172205d1097de06b139318d71b03.
