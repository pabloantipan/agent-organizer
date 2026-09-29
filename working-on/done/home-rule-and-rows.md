---
title: Rule from Needs me with the record in view, and Home rows that keep their names
status: done
repos: [organizer]
branch: main
updated: 2026-09-29
next: "none: merged, code and UI reviews pass (sup18)"
depends_on: []
boundary: ["frontend/src/components/Home.tsx (RuleAction, RuleDecisionBox, the row layout, the Launch/Open row, the subtitle)", "frontend/src/lib/queue.ts (the row's kind, verb and words)", "frontend/src/components/TopBar.tsx (the badge title only)", "frontend/src/styles/shell.css, Home and rule-box CSS", "frontend/src/lib/*.test.ts", "testdata/"]
spec: "docs/specs/lead-side-fixes.md (FR-1, FR-2, FR-3, FR-7); the findings: docs/ux/reviews/2026-09-29-first-look.md F1 F2, docs/ux/reviews/2026-09-29-cell-screens.md C1 C6 C7; values: docs/design-system.md"
gate: "docs/specs/lead-side-fixes.md Acceptance, rows G1, G2, G3, G7; the Gate section below"
stage: discovery-in-a-cell
seat: fix-home
ui_review: true
review: pass
---

## Goal
FR-1, FR-2, FR-3 and FR-7 of `docs/specs/lead-side-fixes.md`: Aglaea's F1,
F2, C1, C6 and C7.

## Gate
- [x] G1: see `docs/specs/lead-side-fixes.md`, Acceptance
- [x] G2: see `docs/specs/lead-side-fixes.md`, Acceptance
- [x] G3: see `docs/specs/lead-side-fixes.md`, Acceptance
- [x] G7: see `docs/specs/lead-side-fixes.md`, Acceptance

## Done
- 2026-09-29 cut from lead-side-fixes by the FSE
- 2026-09-29 fix-home built FR-7 8eaf010, FR-3 3c885ec, FR-1 05137e2, FR-2 bf4915a on home-rule-and-rows, rebased on main 7c86c74; evidence in `/Users/pabloantipan/organizer/.wt-notes/fix-home/`, DOM numbers in `g2-dom-check.txt`, choices in `progress.md`
  - G1: `g1-rule-clamped-claims-portal-0002-1440.png`, `g1-rule-expanded-claims-portal-0002-1440.png`, `g1-rule-clamped-init-drafted-0001-1440.png`, `g1-rule-expanded-init-drafted-0001-1440.png`, `g1-link-lands-decisions-claims-portal-1440.png`; body 160 of 250 px clamped with "show all", 250/250 expanded; link "0002 in Decisions" opens claims-portal's Decisions
  - G2: `g2-home-1024x640.png`, `g2-home-1440x900.png` (before: `before-home-1024.png`, ids 40 px of 82–129); DOM over all 20 rows of `--twenty`: `cut: []` at 1024×640 (narrow, --id-w 129px) and 1440×900
  - G3: `cd frontend && npx vitest run src/lib/queue.test.ts -t FR-3` → "Tests 2 passed | 10 skipped"; `g3-needs-me-open-and-launch-1440.png` ("designer_diego has no persona file" · Open; init-ready · Launch), `g3-open-lands-agents-init-define-1440.png` (sub-view Agents); subtitle "everything waiting on you, oldest first", badge title "everything waiting on you"
  - G7 (after rebase): `XDG_DATA_HOME=$(mktemp -d) make test` → exit 0, all go packages ok, "Tests 20 passed (20)" (`g7-make-test.log`); `npm run build` → exit 0 (`g7-npm-build.log`); redesign G18 grep on `git diff main...home-rule-and-rows` → empty

## Next
1. review: home-rule-and-rows (code and UI review, ui_review: true)

## Blockers
none

## Notes
- `ui_review: true`: the wave gets a UI reviewer (aglaea skill,
  references/ui-review.md) besides the code reviewer.
- FR-1's link opens the initiative's Decisions with `openInitiative(id, "decisions")`. Landing on the record expanded needs a store action carrying the record key (initiative and number) that `DecisionsView` reads to expand and scroll to it, the same thing cell-screens-fix builds for FR-6; once it lands, `RecordBody` in `RuleDecisionBox.tsx` should call it.
- The rule box's record is a `withRecord` prop on `RuleDecisionBox.tsx` (not in the boundary's file list, but it is the rule box); the Decisions tab does not set it.
- fixture-twenty's onboarding-flow cell has an `fse` seat without a persona file, so its row now reads "fse has no persona file" with Open.
- init-a's next date ("2026-10-01 target") wraps in its 96 px column at 1440; not new, not carried.
- New fixture `testdata/fixture-overlay/init-ready` (a cell in definition with every file) adds one Launch row and one initiative to the fixture's Home, which the other builder's screenshots will show.

## Review
- Verdict: **pass**. Unmet gate rows: none.
- G1: diff puts `RecordBody` (the body through `marked`, as `DecisionsView.tsx:129`) above the options when Needs me opens the box (`withRecord`), clamped to 8 × `--line-md` with "show all" and "<NNNN> in Decisions" (`openInitiative(id, "decisions")`). Builder's screenshots show claims-portal 0002 clamped and expanded, init-drafted 0001 (the roster record) expanded, and the link landing on claims-portal's Decisions.
- G2: re-measured on `--twenty` in headless Chrome, rail expanded (250 px): 1024×640 port `narrow`, `--id-w` 129 px, 20 rows, cut none; 1440×900 20 rows, cut none. `.wt-notes/fix-home-review/g2-dom-check.txt`, `g2-home-1024x640-{top,bottom}.png` (the builder's 1024 shot showed only 9 of 20 rows), `g2-home-1440x900-*.png`.
- G3: `npx vitest run src/lib/queue.test.ts -t FR-3` → 2 passed (`g3-vitest.log`); screenshots show init-define "designer_diego has no persona file" · Open landing on Agents, init-ready · Launch; subtitle and badge title read as FR-7 (diff and screenshots).
- G7: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0, go ok, vitest 20/20; `npm run build` exit 0; redesign G18 grep on `main...home-rule-and-rows` empty; `wails build` exit 0. Boundary: 11 files, all in the card's list or the rule box it names (`RuleDecisionBox.tsx`, `home.css`, `rule-box.css`; the spec says "Home and rule-box CSS").
- Not covered by the gate: (1) the "in Decisions" link lands with nothing expanded until cell-screens-fix's FR-6 action exists; `RecordBody` should call it then. (2) `ONE_LINE_REST = 320 + 480` in `Home.tsx` restates the column widths in `home.css`; a change to one silently breaks the narrow switch. (3) `useFitIds` measures on mount and resize only, not on font load; the measured 129 px matches the builder's, so no effect seen. (4) G2 is measured in Chromium, not WKWebView (Safari 15 floor); ResizeObserver and grid areas are both supported there. (5) the record body is `marked` HTML unsanitised, as on the Decisions tab already.
- Reviewer: fix-home-review, 2026-09-29. Evidence in `.wt-notes/fix-home-review/`.

## UI review
- Ran: branch `home-rule-and-rows` at bf4915a, on `scripts/fixture-home.sh` and `--twenty`, in headless Chromium at 1440×900, 1024×640 and 400 px, with keyboard-only passes over Rule, the rule box, show all, the Decisions link, Open, Launch and the Home rows. Screenshots in `.wt-notes/fix-home-ui/`. A `-tags dev` binary built to a scratch path stood in for `wails dev`, because the code reviewer's `wails dev` shared this worktree's `build/bin`.
- Verdict: **pass**. Failing findings: none. Nothing is severity 3 or 4. F1, F2, C1, C6 and C7 are answered: no id is cut at 1024×640 or 1440, the rule box shows the record, the cell row names the missing file and says Open, and the subtitle and badge title read as FR-7.

**U1: the recommendation is below the clamp (2).**
1. When the lead rules from Needs me, they see the start of the Question and the Options list. The Options list repeats the radio buttons under it. The Recommendation is hidden until they press show all. On a real record like 0057, whose Question runs 24 lines, the clamp shows only part of the Question.
2. Home, Needs me, Rule on init-a 0002: `.wt-notes/fix-home-ui/home-rule-init-a-0002-clamped-1440.png`. The body shows 160 of 316 px. In 0057 the `## Recommendation` heading is on body line 32.
3. heuristic: Nielsen 6 (recognition rather than recall) and 8 (the Options list says twice what the radio buttons say).
4. Severity 2. The build matches FR-1 ("clamped to about eight lines"), and the recommendation is one press away.
5. Proposal: F2's original direction. Show the Question and the Recommendation, each clamped, and skip `## Options`, since the radio buttons carry it. See Spec gaps.

**U2: focus skips the record (2).**
1. A keyboard or screen-reader lead who opens Rule lands on the first option. The record, show all and "0002 in Decisions" come before it and are reached only with Shift+Tab. A screen reader never reads the body, because the dialog has no `aria-describedby`.
2. Rule on init-a 0002 at 1440 and at 1024×640. Measured: Enter on Rule puts focus on `INPUT` (the first radio). Shift+Tab reaches "0002 in Decisions", then "show all".
3. heuristic: WCAG 2.4.3 (focus order) and 1.3.1 (info and relationships).
4. Severity 2.
5. Proposal: point `aria-describedby` at the body on the dialog, or put focus on the title so the body is read first.

**U3: the rule box runs past the window (2).**
1. At the minimum window, the rule box's Rule and Cancel buttons are below the fold. The lead must scroll Home to reach them.
2. At 1024×640: init-a 0002 clamped ends at 646 px, and expanded at 802 px. init-drafted 0001 expanded ends at 968 px, also at 1440×900. Screenshots: `.wt-notes/fix-home-ui/home-rule-init-a-0002-expanded-1024x640.png`, `.wt-notes/fix-home-ui/home-rule-init-drafted-0001-expanded-1440x900.png`. The buttons are reachable: Home scrolls, and Tab scrolls the focused Rule into view (`.wt-notes/fix-home-ui/home-rule-init-drafted-0001-expanded-submit-focused-1024x640.png`).
3. heuristic: Nielsen 1 (the commit is out of sight), design system Overlay.
4. Severity 2.
5. Proposal: cap the box at the viewport and scroll the record inside it, or open it upward when there is no room below.

**U4: the clamp cuts a heading in half (1).**
1. The clamped body ends mid-line, so half of "RECOMMENDATION" shows as a sliver above show all.
2. `.wt-notes/fix-home-ui/home-rule-init-a-0002-clamped-1440.png`.
3. heuristic: Nielsen 8.
4. Severity 1.
5. Proposal: clamp at a block boundary, not a pixel height.

**U5: the Decisions link lands on nothing (2).**
1. "0002 in Decisions" opens init-a's Decisions with no record expanded, and focus is on the page body. The lead has to find 0002 in the list again.
2. `.wt-notes/fix-home-ui/decisions-init-a-after-rule-link-1440.png`.
3. heuristic: Nielsen 6. The card already notes this under Notes as waiting on cell-screens-fix FR-6.
4. Severity 2.
5. Proposal: call FR-6's record-landing action from `RecordBody` once cell-screens-fix lands.

**U6: narrow Home trades names for fewer rows and cut stages (2).**
1. At 1024×640 each row takes two lines (60 px, or 76 px with a wave badge; 36 px before). Only about three initiatives show under Needs me without scrolling. The stage column is now the one that cuts, to about 8 characters ("2 · Gateway · n…", "2 · Core invoici…").
2. `--twenty` at 1024×640: `.wt-notes/fix-home-ui/home-twenty-top-1024x640.png`, `.wt-notes/fix-home-ui/home-twenty-initiatives-live-1024x640.png`. Measured: `narrow`, `--id-w` 129 px, 20 rows, no id cut. At 1440: `.wt-notes/fix-home-ui/home-twenty-initiatives-1440x900.png`, one line, no id cut.
3. heuristic: design system principle 2 (the content leads). The spec allowed the second line.
4. Severity 2.
5. Proposal: move stage to the second line too, or show only its number and title in narrow. Say in twenty-at-a-glance what "at a glance" means at 1024×640.

**U7: after navigating, focus goes nowhere (2).**
1. After Open, Launch or the Decisions link, focus is on the body. A keyboard lead starts again from the top bar. C1's proposal, "its landing puts the focus on Bring crew up", was not carried into FR-3.
2. Open lands on init-define's Agents (`.wt-notes/fix-home-ui/agents-init-define-after-open-1440.png`) and Launch on init-ready's (`.wt-notes/fix-home-ui/agents-init-ready-after-launch-1440.png`); `document.activeElement` is `body` in both. The seat row does show "no persona file", so the lead can see what to fix.
3. heuristic: WCAG 2.4.3, Nielsen 1.
4. Severity 2.
5. Proposal: on landing, focus the blocked seat (Open) or Bring crew up (Launch).

**U8: row verbs mix default and accent (2, for conform-and-waiting).**
1. Needs me shows Rule and Launch as accent buttons, while Open and Agents are default buttons. The design system's Inbox row says every row verb is a default button.
2. `.wt-notes/fix-home-ui/home-1440-top.png`, `.wt-notes/fix-home-ui/home-twenty-top-1024x640.png`.
3. heuristic: design system principle 3 and Inbox row.
4. Severity 2. This is FR-11, owned by conform-and-waiting, not this card.
5. Proposal: as FR-11.

**Spec gaps (for the FSE)**
- FR-1 clamps the whole body. F2 asked for the Question and the Recommendation. On real records the clamp shows neither in full, and the Options section repeats the radio buttons (U1). Decide which sections the rule box shows.
- No FR says where focus goes after a Needs me verb navigates, or when the rule box opens (U2, U7).
- The rule box has no height rule for the minimum window (U3).
- FR-2 names what gives way (goal, next date, phase) but not stage, which is now what cuts. The two-line rows cut how many initiatives one screen shows at 1024×640 (U6).
- The fixture's roster record (init-drafted 0001) lists no seat lines, so "A the-cell-roster record shows its seat lines this way" cannot be seen on the fixture. A fixture record shaped like drafting.md §5 would let G1 show it.

**Not verified**
- Seat lines of a roster record in the rule box: the fixture record has none.
- WKWebView (the Safari 15 floor). Everything above was seen in Chromium.
- 400 px: the app's minimum window is 1024 (`main.go`). In the browser at 400 px the whole shell scrolls sideways (586 px wide); that predates this card and is not a finding here.
- Pressing Rule inside the box: I stopped at the box with the record shown, as instructed. A ruling was never committed, so its success and refusal states were not seen.
- Reviewer: UI review session (aglaea references/ui-review.md), 2026-09-29.
