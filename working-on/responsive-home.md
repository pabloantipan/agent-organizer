---
title: Home holds the glance at 1024, on the laptop and on the ultrawide
status: now
repos: [organizer]
branch: main
updated: 2026-09-29
next: "decide: pablo, rule 0065 (G7/A8 at 1024 and 1512 cannot hold twenty rows in one screenshot; fse recommends the reader may scroll Home, under a minute, 3440 as written); then fse amends G7, sup21 reruns the reader on G7 only and merges"
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
1. decide: pablo rules 0065 (the G7 gate, raised by fse)
2. fse amends G7; sup21 reruns a reader on G7 only, then merges responsive-home (unmerged, 898cd78) and moves the card

## Blockers
- 0065 proposed: G7 as written conflicts with A1/A3 (code review fail on G7 only; UI review pass)

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

## UI review
Commit run: `898cd78` (detached in `.wt/resp-ui`), `wails dev` in Chromium 1234 headless, `--twenty` and the default fixture. Shots and the driver (`ui.cjs`) are in `.wt-notes/resp-ui/`.

**Verdict: pass. No finding fails it.** A1–A7 hold at every size I ran: 1024×640 fresh (strip, 5 one-line Needs me rows, 7 initiative rows, ids whole, state and phase in words) and expanded then reloaded (250 px, "0" kept); 1279 compact / 1280 regular; 1512 (14 of 20, ids whole); 1719 cut / 1720 roomy goals whole; 1919 / 1920 wide; 3440 (20 of 20, goals whole, box in the column, Rule and Cancel in view, page not scrolled). The box, option and words survived 2400→1919→1600→1280→1279→1280→1920, with the list's top row and the column's scroll kept. "you" reads right in both fixtures. The two severity 3 findings, U1 and U3, are left out of the verdict on purpose: U1 is the box's focus model, which the spec never defined and which regular already had on main, and U3 is regular "as built" (FR-3). Both go to the FSE as spec gaps. If the FSE reads "sheet" in FR-2 as modal, U1 becomes a fail.

- **U1 — a keyboard user tabs out of the open rule box onto controls hidden under it, and one Enter loses the ruling.**
  - Where: compact with the rail expanded, 1024×640, Rule open (`1024x-exp-rule-tab.png`). After Rule, Tab lands on `auth-gateway`, `billing-api` and the other ids, at x 312–420, which sit under the sheet (x 357–917). Regular, 1512: past Cancel, focus lands on "Open onboarding-flow Step map" under the box (`1512x`, measured OBSCURED). That already happened on main.
  - Evidence: heuristic, WCAG 2.2 2.4.11 Focus Not Obscured and 2.4.3.
  - Severity: 3.
  - Proposal: decide the box's focus model. Either a modal sheet (focus stays in it, Esc or Cancel leaves), or place it so it never covers a focusable control.
- **U2 — Rule on a second row silently throws away the words typed in the first.**
  - Where: any class, `3440b` run. I typed in claims-portal 0002, opened vendor-audit 0002, then reopened claims-portal 0002: its words were "". On main each box kept its own state and stayed open. The new single `ruleDraft` resets on `openRule`. In compact, the rows' Rule verbs stay clickable beside the sheet.
  - Evidence: heuristic, Nielsen 3 and 5 (control, error prevention).
  - Severity: 2.
  - Proposal: keep the draft per record key until Cancel or Rule, or ask before discarding typed words.
- **U3 — at the bottom of regular the lead sees fewer initiatives and cut goals, one pixel after compact showed more.**
  - Where: `1279.png` against `1280.png`. At 1279 the rail is the strip and 12 rows show. At 1280 the rail expands to 250 px and 7 rows show: goals are cut to about 15 characters ("Every app signs in…"), stage titles to 3 ("2 · Gat…"), and busy rows' signals wrap to 3 lines (74 px). This persists toward 1512.
  - Evidence: heuristic, twenty-at-a-glance G9 (only timed at 1440), measured.
  - Severity: 3.
  - Proposal (FSE): regular's lower end keeps compact's row layout, or the strip default reaches further (for example until the goal column holds about 30 characters). This is a spec change to FR-3.
- **U4 — in compact with the rail expanded (A2's state), busy rows take 2–3 lines and 5 initiatives show, under A1's six.**
  - Where: `1024-fresh-expanded-reloaded.png`.
  - Evidence: heuristic, measured.
  - Severity: 2.
  - Proposal: compact keeps signals on one line (a count and an overflow), or compact's rail is narrower. The builder noted this too.
- **U5 — the chevron does not say which initiative it belongs to, or that in compact it now holds the goal and next date.**
  - Where: the tab pass at 1024. Twenty buttons are all named "repos, problems and actions" (a `title`, no label).
  - Evidence: heuristic, WCAG 2.4.6 and 2.5.3.
  - Severity: 2.
  - Proposal: an `aria-label` such as "details for auth-gateway: goal, next date, repos". In compact the hover text should say the same.
- **U6 — in wide, each Needs me row's context is cut to one line with no hover, so the options are lost from the row.**
  - Where: `3440-rule.png` ("owner pablo · raised 2026-09-18 by fse · o…"). The row's `title` is only set in compact.
  - Evidence: heuristic, Nielsen 6.
  - Severity: 1.
  - Proposal: set the row's `title` in every class, or give the context two lines in the column.
- **U7 — in wide, Tab goes rail → Needs me (right column) → list (left), against the left-to-right reading.**
  - Where: `default-1920k` tab pass.
  - Evidence: heuristic, WCAG 2.4.3.
  - Severity: 1. Defensible, since Needs me is the priority.
  - Proposal: keep it and say so in the design system's Widths section, or move Needs me first in the DOM only for the other classes.
- **U8 — the compact sheet has no scrim and its top edge cuts through its own row's subject, which reads as a glitch.**
  - Where: `1024-rule-typed.png`, row 1.
  - Evidence: heuristic, design system (Rule box anatomy).
  - Severity: 1.
  - Proposal: dim what is behind the sheet, or start it below its row.
- **U9 — the rail toggle is named by its action ("expand the rail") with no `aria-expanded`.**
  - Where: the tab pass at 1024.
  - Evidence: heuristic, WCAG 4.1.2.
  - Severity: 1.
  - Proposal: add `aria-expanded`.

**Spec gaps (for the FSE)**
- The rule box's focus model (U1): FR-2 says "a sheet" and FR-5 speaks only of class crossing. Nothing says whether focus stays in the box, or what happens to a draft when another row's Rule is pressed (U2).
- Regular below about 1440 (U3): "as built" was never measured there. G9 was timed at 1440, A3 at 1512.
- A2 has no floor: nothing says what the glance must still show at 1024 with the rail expanded (U4).
- The wide rule box on the last Needs me row grows the column (default fixture: box top 464, bottom 1133 at 3440). Fine here, but nothing says how it should behave at 1920×1080 with eight rows.

**Not verified**
- **Wide with Needs me empty:** both fixtures always have rows, and ruling is forbidden. From the code only: the section is always rendered with "Nothing waits on you.", so its column stays.
- **A real screen reader:** names were read from the DOM (accessible name, `title`, the sr-only text), not with VoiceOver.
- **WKWebView and Safari 15:** Chromium only. `display: contents` on the wide box's anchors is the known risk there.
- **Real window drag:** resizes were viewport changes through Playwright.
- **Native tooltip rendering:** checked as `title` text, not shown.
- **200% zoom and touch:** under 1024, out of this card.

UI reviewer: resp-ui, 2026-09-29.
