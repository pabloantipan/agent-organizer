---
title: Home holds the glance at 1024, on the laptop and on the ultrawide
status: now
repos: [organizer]
branch: main
updated: 2026-09-29
next: "G7 unmet (resp-review): at 1024 and 1512 the timed reader cannot see all twenty rows, so the four answers are partial; the gate conflicts with A1/A3, pablo to amend G7/A8 or the layout"
depends_on: ["ui-leftovers"]
boundary: ["frontend/src/components/Home.tsx, RuleDecisionBox.tsx, Rail.tsx, App.tsx (the shell layout)", "frontend/src/stores/board.store.ts (the width class; the rail's default)", "frontend/src/lib/ and its tests", "frontend/src/styles/shell.css, home.css, rule-box.css", "docs/specs/twenty-at-a-glance.md (G9's widths, one line)"]
spec: "docs/specs/responsive-home.md (FR-1 to FR-6); the design: docs/ux/specs/responsive-home.md (Aglaea, 3174fc2)"
gate: "docs/specs/responsive-home.md Acceptance, rows G1 to G8; the Gate section below"
review: fail
stage: twenty-at-a-glance
seat: resp-build
ui_review: true
---

## Goal
0059 ("1024 is real", Pablo: "kinda responsive") and 0060 ("you"): FR-1 to
FR-6 of `docs/specs/responsive-home.md`, from Aglaea's design spec.

## Gate
- [x] G1: see `docs/specs/responsive-home.md`, Acceptance
- [x] G2: see `docs/specs/responsive-home.md`, Acceptance
- [x] G3: see `docs/specs/responsive-home.md`, Acceptance
- [x] G4: see `docs/specs/responsive-home.md`, Acceptance
- [x] G5: see `docs/specs/responsive-home.md`, Acceptance
- [x] G6: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G7: see `docs/specs/responsive-home.md`, Acceptance
- [x] G8: see `docs/specs/responsive-home.md`, Acceptance

## Done
- 2026-09-29 cut from responsive-home by the FSE
- 2026-09-29 sup21 launched resp-build on branch responsive-home (worktree .wt/responsive-home, from 4c3c78d); reviewers resp-review (code), resp-ui (UI), resp-reader (G7, timed)
- 2026-09-29 resp-build: branch responsive-home rebased on main 8eae333, commits cd722c2 (width class from one window listener, rail default, rule draft in the store), 1ee1a6d (signalOwners, "you"), 4831660 (Home and rule box per class), 898cd78 (twenty-at-a-glance G9 widths). Choices and found-not-asked in .wt-notes/resp-build/progress.md
- G1: .wt-notes/resp-build/g1-1024.png (fresh profile: rail 46 strip, stored null, 5 Needs me rows at 36 px, 7 initiative rows in view, idsCut [], state and phase in words) and .wt-notes/resp-build/g1-1024-expanded-reloaded.png (after the toggle and a reload: rail 250, stored "0"); `node shot.cjs 1024 640 g1-1024.png --expand-and-reload`, output in .wt-notes/resp-build/shots.log; hover and detail: .wt-notes/resp-build/compact-detail.log (id title carries goal and next date, row title the context, chevron detail opens on goal and next date)
- G2: .wt-notes/resp-build/g2-1512.png, class regular, one-line rows (36 px), idsCut [], 14 of 20 in view as before
- G3: .wt-notes/resp-build/g3-3440.png (20 of 20 rows in view, goalsCut [], .home 270→2422 = 2152 px) and .wt-notes/resp-build/g3-3440-rule.png (box static in the Needs me column, 20 rows in view, Cancel and Rule in view, page scrollTop 0); `node shot.cjs 3440 1440 g3-3440.png --rule`
- G4: .wt-notes/resp-build/g4-1024-rule.png, default fixture, Rule on init-drafted 0001 (the roster record, the longest): sheet 560 px, top 53 bottom 632 of 640, record scrolls inside, Cancel and Rule in view, page scrollTop 0; `node shot.cjs 1024 640 g4-1024.png "--rule=Rule init-drafted 0001"`
- G5: .wt-notes/resp-build/g5-resize.cjs, shots .wt-notes/resp-build/g5/g5-1…5-*.png, log .wt-notes/resp-build/g5.log: wide→regular→compact→regular→wide at 2400/1600/1100, box open, words and chosen option kept at each step, the list's top row kept at its offset, the Needs me column's scroll 60 restored on return to wide
- G6: `npm test` (frontend/src/lib/decisions.test.ts, signalOwners: 3 tests pass, 40/40); Home .wt-notes/resp-build/g2-1512.png: claims-portal "1 waiting · you", vendor-audit "2 waiting · you, no owner", data-lake "3 waiting · carla, rodrigo", email-digest "1 waiting · fse"
- G7: not mine; shots for the timed reader at .wt-notes/resp-build/g7-1024.png, g7-1512.png, g7-3440.png (--twenty, fresh profile, no rule box)
- G8 (after the rebase): `XDG_DATA_HOME=$(mktemp -d) make test` exit 0, 13 go packages ok, vitest 40 passed (.wt-notes/resp-build/g8-make-test.log); `npm run build` exit 0 (.wt-notes/resp-build/g8-build.log); G18 grep over main...responsive-home empty; `wails build` run after wails dev

## Next
1. review: resp-review (code), resp-ui (UI); resp-reader times G7 from the g7 shots

## Blockers
none

## Notes
- 2026-09-29 sup21 runs this card, spawned by the FSE after ui-leftovers landed (508d9a8)
- The frontend uses pnpm; add no dependency (aebc25e). No Go change.
- 2026-09-29 resp-build: at 1024 with the rail expanded, busy rows' signals wrap to two or three lines (auth-gateway); A2 asks only that the choice is kept. For Aglaea.
- 2026-09-29 resp-build: with no stored choice the rail follows the class live (compact → regular expands it); the spec says "starts as"; a stored choice always wins.
- G3 needs a 3440×1440 viewport: headless Chromium `--window-size=3440,1440`.

## Review
**Verdict: fail.** Unmet gate rows: **G7**. G1–G6 and G8 are met by the diff and the gate's own checks.

- **G1** (A1, A2): `g1-1024.png`. The rail is the strip (46 px, nothing stored), the 5 Needs me rows are 36 px, 7 initiative rows are in view, `idsCut []`, and state and phase are in words. `g1-1024-expanded-reloaded.png`: after the toggle and a reload the rail is 250 px and the stored value is "0". `railCollapsedFor` in `lib/width.ts` is tested in `width.test.ts`. Met.
- **G2** (A3): `g2-1512.png`, class regular. Each initiative row is one line (36 px) and `idsCut []`. Met.
- **G3** (A4, A5): `g3-3440.png`. All 20 rows and Needs me are in view, `goalsCut []`, and `.home` is 2152 px wide, starting at the rail. `g3-3440-rule.png`: the box opens in the Needs me column under its row, all 20 rows stay in view, and Cancel and Rule are in view. Met.
- **G4** (A6): `g4-1024-rule.png` on the default fixture's init-drafted 0001 roster record. The sheet is capped at the window, the record is clipped inside the box, and Cancel and Rule are in view. Met.
- **G5** (A7): `g5.log` and `g5/g5-1…5`, going wide→regular→compact→regular→wide. The box, option b and the typed words survive every step. The list's top row keeps its offset. The Needs me column's scroll goes 60→60 on the return to wide. The state lives in the store (`ruleDraft`), and the tree is the same in every class. Met.
- **G6** (FR-6): `signalOwners` has 3 tests in `lib/decisions.test.ts`, and they pass. Home reads "1 waiting · you", "2 waiting · you, no owner", "3 waiting · carla, rodrigo" and "1 waiting · fse". The lead comes from `leadOf`. Met.
- **G7** (A8): unmet, see the table below.
- **G8**: I re-ran `XDG_DATA_HOME=$(mktemp -d) make test`: exit 0, 13 go packages ok, vitest 40/40. `npm run build`: exit 0. The G18 grep over `main...responsive-home` is empty. Logs are in `.wt-notes/resp-review/`. Met.
- **Boundary**: the diffstat touches 12 files, all inside the card's boundary. There is no Go change and no sub-view change. Both worktrees are clean.

### G7 grading (reader `resp-reader`, `.wt-notes/resp-reader/answers.md`)
The truth is what the app shows for `--twenty`:
- executing: auth-gateway, billing-api, field-app, ops-dashboard
- discovery: field-app, onboarding-flow, pricing-model, risk-scoring, search-index
- waits on business: data-lake, pricing-model
- waits on you: claims-portal, onboarding-flow, vendor-audit

| Size | Q1 execute | Q2 discovery | Q3 business | Q4 you | Max s |
|---|---|---|---|---|---|
| 1024×640 | partial, "cannot tell" past row 8: not right | field-app only: not right | "cannot tell" for the rest: not right | claims-portal only: not right | 6 |
| 1512×945 | "cannot tell" past row 14: not right | missing risk-scoring, search-index: not right | "cannot tell" past row 14: not right | missing vendor-audit: not right | 5 |
| 3440×1440 | right | right | right | right | 4 |

Every answer came in under a minute. Only 3440 is right. At 1024 and 1512 the screenshot cannot hold twenty rows, so four of four answers are wrong at each of those sizes.

**The gate itself conflicts:** A1 asks for at least six rows at 1024. A3 is "as today", which is 14 of 20 at 1512. A8/G7 asks for all four answers right from one screenshot at those sizes, which neither layout can give on a twenty-initiative fixture unless G7 allows scrolling or several screenshots. For Pablo: either amend G7/A8 (for example "right for the rows in view", or one screenshot per scroll page), or change A1/A3. As written, no build that meets A1 and A3 can pass G7.

### Findings the gate does not cover
- With no stored choice, the rail follows the class live: resizing from compact to regular expands it. The spec says "starts as". The builder noted this. Harmless, but not what the words say.
- `home.css` hides compact's goal and next-date header cells with `.p-head > :nth-child(5)` and `:nth-child(8)`. This breaks silently if a column is added.
- In the wide Needs me column, the context line of each row is cut at one line ("owner pablo · raised … o…"). The options are only in the hover or the box.
- At 1024 with the rail expanded, busy rows' signals wrap to 2–3 lines. This is for Aglaea.

Reviewer: resp-review, 2026-09-29.
