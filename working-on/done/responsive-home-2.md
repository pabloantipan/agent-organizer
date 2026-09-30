---
title: Responsive Home, second pass - compact to 1439, the sheet's scrim, one draft per record, one-line signals, names
status: done
repos: [organizer]
branch: main
updated: 2026-09-30
review: pass
next: "merged d5abf1f; code review pass (resp2-review), UI review pass (resp2-ui), R1-R5 sev 2-1 and the spec gaps for the FSE"
depends_on: ["responsive-home", "rule-box-finish"]
boundary: ["frontend/src/components/Home.tsx, RuleDecisionBox.tsx, Rail.tsx, App.tsx (the shell layout)", "frontend/src/stores/board.store.ts (the width class; drafts per record)", "frontend/src/lib/ and its tests", "frontend/src/styles/shell.css, home.css, rule-box.css"]
spec: "docs/specs/responsive-home.md (FR-7 to FR-12, amendment 2); the design: docs/ux/specs/responsive-home.md, Amendment 1 (Aglaea, 836866a)"
gate: "docs/specs/responsive-home.md Acceptance, rows G9 to G12 and G8; the Gate section below"
stage: twenty-at-a-glance
seat: resp2-build
ui_review: true
---

## Goal
responsive-home's UI review (U1–U9) answered by Aglaea's design Amendment 1:
FR-7 to FR-12 of `docs/specs/responsive-home.md`.

## Gate
- [x] G9: see `docs/specs/responsive-home.md`, Acceptance
- [x] G10: see `docs/specs/responsive-home.md`, Acceptance
- [x] G11: see `docs/specs/responsive-home.md`, Acceptance
- [x] G12: see `docs/specs/responsive-home.md`, Acceptance
- [x] G8: see `docs/specs/responsive-home.md`, Acceptance

## Done
- 2026-09-29 cut from responsive-home amendment 2 by the FSE
- 2026-09-30 resp2-build: FR-7 d6d8804, FR-9 d48101b, FR-11 780163f, FR-10 79176a4, FR-8 ca0ed80 + 33b0fd9, FR-12 b3c9975, and 10f2966 (the wide list at 1920, see Notes); rebased on main 445b11e; progress in `.wt-notes/resp2-build/progress.md`
- G9: fresh storage per size, `node drive.cjs <w> <h> s-g9.cjs` → `.wt-notes/resp2-build/g9.log`, `.wt-notes/resp2-build/1280x800-g9.png`, `1439x900-g9.png`, `1440x900-g9.png`, `1512x945-g9.png`, `1720x1000-g9.png`: "1280x800: class=home compact rail=strip stored=null initiative rows one line=true … needs-me rows one line=true"; 1439 the same; 1440, 1512 and 1720 "class=home regular … rail=expanded"
- G10: `s-g10.cjs` at 1024x640, 1512x945 and 1920x1080 → focus log `.wt-notes/resp2-build/g10-focus.log` (the compact one again after the rebase, `g10-focus-compact-rebased.log`), `.wt-notes/resp2-build/<size>-g10-open.png`, `-second.png`, `-restored.png`: compact "scrim: 1024x640 … at the centre of Rule vendor-audit 0001 the top element is div.rb-scrim"; in every class "focus left the box 0 times in 16 presses", Escape and Cancel put focus back on "Rule claims-portal 0002", "reopened Rule claims-portal 0002 words: "g10: words typed in the first record"", after Cancel the words are "" and the other record's are kept. Nothing was ruled
- G11: `s-g11.cjs` at 1024x640 with the rail expanded, unchanged `--twenty` → `.wt-notes/resp2-build/g11.log`, `.wt-notes/resp2-build/1024x640-g11-expanded.png`: "rows in view: 7; rows whose signals take more than one line: 0"; "auth-gateway: … shown=["1 now","+1"] title="and 1 more: wave 2 · 1 building" srName="and 1 more: wave 2 · 1 building""
- G12: `s-g12.cjs` at 1920x1080 → names log `.wt-notes/resp2-build/g12-names.log`, `.wt-notes/resp2-build/1920x1080-g12-before.png`, `1920x1080-g12-rule-last.png`: "rail toggle: name="Initiatives rail" aria-expanded=true" (false once collapsed), "chevron: name="Details for auth-gateway: goal, next date, repos" title="Details for auth-gateway: goal, next date, repos"", every wide Needs me row "title==context:true", "Needs me rows: 8", "Rule on the last row (Rule vendor-audit 0005): … whole box in the column's view: true; page scrolled: 0". To get eight rows, the throwaway `$FIXTURE_HOME/vendor-audit/working-on/decisions/` got copies of 0002 as 0003–0005 (new titles and raised dates), removed after G12
- G8, after the rebase: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0, 13 Go packages ok, "Tests 52 passed (52)" (`.wt-notes/resp2-build/g8-make-test.log`); `cd frontend && npm run build` exit 0, "built in 1.05s" (`.wt-notes/resp2-build/g8-build.log`); G18 grep `main...responsive-home-2` empty (`.wt-notes/resp2-build/g8-g18.log`, 0 lines); `wails build` exit 0

- 2026-09-30 sup24: merged d5abf1f; on main make test exit 0 (13 Go packages ok, vitest 52/52), npm run build green; to done/

## Next
1. resp2-review (code) and resp2-ui (UI) review branch responsive-home-2

## Blockers
none

## Notes
- 2026-09-30 sup24 runs this card, spawned by the FSE after rule-box-finish landed (8450cac)
- The frontend uses pnpm; add no dependency. No Go change.
- 2026-09-30 resp2-build: wide at 1920x1080 with the rail expanded (responsive-home FR-4's fixed columns) overflowed the ~1,080 px list: the goal column went to 0 and the chevrons spilled into the Needs me column. Fixed in 10f2966: the goal keeps 160 px, stage and signals give way down to 120 px, and wide's signals use compact's one-line "+N". Nothing changes at 3440
- 2026-09-30 resp2-build: no scrim token exists, so the scrim is `--bg-sunken` at opacity 0.7; Aglaea may want a token for it. Escape closes the box and keeps the draft; only Cancel discards it (FR-9's reading)

## Review
**Verdict: pass.** Unmet gate rows: none. Branch responsive-home-2 at 33b0fd9 (8 commits over main); evidence in `.wt-notes/resp2-review/`.

- **G9 met.** `.wt-notes/resp2-build/g9.log` + shots: 1280x800 and 1439x900 "class=home compact rail=strip stored=null", initiative and Needs me rows one line (tallest 36 px); 1440x900 and 1512x945 "class=home regular … rail=expanded". I read `1280x800-g9.png`: strip, one-line rows. `width.test.ts` pins 1280 and 1439 compact, 1440, 1512 and 1720 regular (`REGULAR_FROM = 1440`).
- **G10 met.** `.wt-notes/resp2-build/g10-focus.log` and `g10-focus-compact-rebased.log`: in compact, regular and wide "focus left the box 0 times in 16 presses", Escape and Cancel put focus back on "Rule claims-portal 0002"; in compact the scrim is the top element over the other Rule verbs (`1024x640-g10-open.png`, which I read); the first record's words come back on reopen, and Cancel empties only that record's draft. The builder closed with Escape before opening the second Rule in every class, so I ran the literal step myself (`s-switch.cjs`, `switch.log`): at 1920x1080 a mouse click on "Rule vendor-audit 0001" with 0002's box open and words typed → "boxes open 1 … words """, clicking 0002 again → "review: words in A", then Cancel on A kept B's "review: words in B" (`1920x1080-switch-*.png`). At 1512 the fixture's other Rule verbs sit under the open box, so the switch goes through Escape there, which the builder's log covers. `drafts.test.ts` covers the direct switch in the store. Nothing was ruled.
- **G11 met.** `.wt-notes/resp2-build/g11.log`, `1024x640-g11-expanded.png` (read): rail expanded, `--twenty`, "rows in view: 7; rows whose signals take more than one line: 0"; auth-gateway and billing-api show `+1` with title and sr-only text "and 1 more: wave 2 · 1 building" (the `+N` itself is aria-hidden).
- **G12 met.** `.wt-notes/resp2-build/g12-names.log`: rail toggle name "Initiatives rail", `aria-expanded` true/false with `aria-controls=rail`; chevron name and title "Details for <id>: goal, next date, repos"; all eight wide Needs me rows have title == context; 1920x1080 with eight rows, Rule on vendor-audit 0005: "whole box in the column's view: true; page scrolled: 0" (`1920x1080-g12-rule-last.png`, read).
- **G8 met, rerun by me.** `XDG_DATA_HOME=$(mktemp -d) make test`: exit 0, 13 Go packages ok, "Tests 52 passed (52)" (`g8-make-test.log`); `npm run build`: exit 0, "built in 1.14s" (`g8-build.log`); redesign G18 grep over `main...responsive-home-2`: 0 lines (`g8-g18.log`); `wails build` exit 0 (`wails-build.log`). Boundary: `diff --stat` touches only Home.tsx, Rail.tsx, RuleDecisionBox.tsx, board.store.ts, lib/drafts(.test).ts, lib/width(.test).ts, home.css, rule-box.css: all inside it. No Go, no sub-view, no InitiativeHeader. Worktree status clean after my run.

Findings the gate does not cover:
1. 10f2966 also puts wide on the one-line "+N" signals and lets the goal shrink to 160 px. At 1920x1080 with the rail expanded, goals are cut near 25 characters and the first signal is cut without its owners ("3 waiting · carla, rodri", "5 waiting · you, no ow", `1920x1080-g12-rule-last.png`). FR-4's "goals whole up to about 70 characters" no longer holds at 1920 with the rail open, and no gate row measures wide below 3440. For the FSE and the UI reviewer.
2. G12's "Rule on the last" row: the last Needs me row is `launch:onboarding-flow` (Open, no Rule), so the check ran on the last Rule row (7th of 8). The box (470 px) stays under the cap (991 px), so FR-12's cap shows as `max-height`, not as a box taller than the column. The gate should name a record long enough to reach the cap.
3. `ruleDrafts` keeps a closed record's draft after that record is ruled elsewhere (CLI, Decisions tab) until reload. Harmless, but unbounded in a long session.
4. The spec's G9–G12 rows have five cells in a four-column table (a stray "screenshots" cell), so they render misaligned. For the FSE.
5. The scrim has no token: `--bg-sunken` at 0.7 (builder's note). For Aglaea.

Reviewer resp2-review, 2026-09-30.

## UI review
Commit run: `33b0fd9` (detached in `.wt/resp2-ui`), `wails dev` on :34225 in a private headless Chromium 1234, `--twenty` and the default fixture. Shots, logs and the driver (`drive.cjs`, `s-*.cjs`) are in `.wt-notes/resp2-ui/`, named `<w>x<h>-<state>.png`.

**Verdict: pass. No finding fails it** (no severity 4 or 3).

What holds, measured: 1280×800 and 1439×900 open compact with the strip and one-line rows (14 and 15 of 20 initiatives in view); 1440, 1512 regular; 1920 and 3440 wide (`rest.log`). 1024×640 with the rail expanded: 7 rows in view, 0 signals wrapped, auth-gateway and billing-api show "1 now +2", hover and sr-only text "and 2 more: wave 2 · 1 building, 1 live" (`names-1024.log`). The rule box at 1024, 1280 (expanded rail), 1512, 1920 and 3440: opened by keyboard, focus left it 0 times in 20 Tab/Shift+Tab presses, and once words and an option are set the loop takes in Rule; Escape and Cancel return focus to the row's Rule. In compact the scrim is the top element over the rail toggle, the top bar, the ids, the other Rule and the Open verbs, and a click on it closes the box keeping the words. Words and option come back on reopen, Cancel empties only that record (`box-1024.log`, `box-others.log`). In wide, a direct click on another row's Rule with words typed opens that one and keeps the first's (`switch.log`, `1920x1080-switch-direct.png`). 1920×1080 with eight Needs me rows, Rule on vendor-audit 0005 (a six-paragraph record): the box 190–1062, Rule and Cancel in view, page not scrolled (`eight.log`, `1920x1080-eight-rule-last.png`). The default fixture's longest record (init-drafted 0001) fits the window at 1024, 1512 and 1920, focus stays in (`longest.log`). The rail toggle is named "Initiatives rail" with `aria-expanded` false/true and keeps focus across the toggle (`strip.log`). The chevron reads "Details for auth-gateway: goal, next date, repos" and its detail opens on the goal and next date. Every wide Needs me row's `title` is its context line.

U1–U9 of responsive-home: U1 answered (focus loop in every class, compact's scrim), U2 answered (one draft per record), U3 answered by FR-7 with R2 and R3 left, U4 answered (7 rows, no wrap, "+N"), U5 answered, U6 answered, U7 kept by design (not re-run), U8 answered (scrim), U9 answered.

- **R1: at 1920 with the rail expanded, the lead reads a wrong or partial name in "who it waits on", and goals are cut to about 22 characters.**
  - Where: wide, 1920×1080, `--twenty`, Home at rest (`1920x1080-rest.png`, crop `1920x1080-cut-signals-crop.png`). "3 waiting · carla, rodri" and "5 waiting · you, no ow": the first lozenge is clipped by its cell with no ellipsis (it is `display: flex`, so `text-overflow: ellipsis` does nothing; shown 120 of 140 px). Goals show 160 px of 38–49 characters.
  - Evidence: heuristic, Nielsen 1 and 2 (a cut name reads as another name), measured. The code review's finding 1 is the same.
  - Severity: 2. The lead's own "you" comes first and the cell's hover names all.
  - Proposal: the ellipsis on the lozenge's text span, not on the flex box; and the FSE decides whether FR-4's "goals whole" applies to wide below about 2400 with the rail open.
- **R2: from 1280 to 1439 the lead loses the goals and next dates from Home while half the row is empty.**
  - Where: compact, 1280×800, strip (`1280x800-rest.png`): signals end near x 750 and the chevron is at x 1236, about 480 px of nothing where regular shows GOAL and NEXT DATE.
  - Evidence: heuristic, Nielsen 6 (recognition over recall: the goal is now behind a hover or a chevron), measured.
  - Severity: 2.
  - Proposal: compact keeps the goal column when the list has the room (for example from about 1200 px of window with the strip), or the FSE accepts the trade. A spec change to FR-2 and FR-7.
- **R3: at 1440, one pixel past compact, busy rows wrap their signals again and fewer initiatives show.**
  - Where: regular, 1440×900 (`1440x900-rest.png`) against 1439×900 (`1439x900-expanded.png`): 11 rows in view with two rows at 52 px ("1 now · wave 2 · 1 building" over "1 live") against 15 at 1439 with the rail expanded; goals cut near 22 characters. By 1512 no row wraps (16 in view).
  - Evidence: heuristic, measured; it is U3's cliff, smaller, moved to 1440.
  - Severity: 2.
  - Proposal: regular takes the one-line "+N" signals too (compact and, since 10f2966, wide already do), so no class wraps.
- **R4: in regular, the open box covers the other Needs me rows' verbs, with nothing to say they are out of reach.**
  - Where: 1512×945, Rule on claims-portal 0002 (`1512x945-box-open.png`): "Rule vendor-audit 0001" and the Open verbs are under the box; a click on them lands on the box. Escape first works.
  - Evidence: heuristic, Nielsen 1; the design puts the scrim in compact only.
  - Severity: 1.
  - Proposal: the FSE decides whether regular's box gets the scrim too, or opens where it covers no verb.
- **R5: the rail toggle is 20 px wide, under the 24 px target.**
  - Where: 1024×640, strip (`1024x640-strip-toggle-focus.png`), 20×28.
  - Evidence: heuristic, WCAG 2.2 2.5.8.
  - Severity: 1.
  - Proposal: 24 px wide.

**Spec gaps (for the FSE)**
- Wide below 3440: no gate row measures FR-4's "goals whole" or the signals at 1920 with the rail expanded (R1). 10f2966 put wide on one-line signals, which FR-10 does not say.
- Compact's room from 1280 to 1439: FR-2 hides the goal whatever the room (R2).
- Regular's signals: FR-10 makes them one line in compact only (R3).
- Regular's box and the verbs it covers (R4).
- G12's "Rule on the last": the last Needs me row may be a non-Rule row (here `launch:onboarding-flow`), and neither my six-paragraph record (box 872 px) nor the builder's reached the column's 991 px cap, so FR-12's cap was never shown clipping. The gate should name a record long enough.
- The scrim has no token (`--bg-sunken` at 0.7); for the design system (Aglaea).

**Not verified**
- Crossing 1439↔1440 with the box open and words typed (FR-5 at FR-7's new boundary): not run this time; G5 covered it at 1279↔1280 on the first card.
- U7 (wide Tab order) and a wide-class tab pass: only the 1024 pass was run.
- A real screen reader: names from the DOM and Playwright's aria snapshot, not VoiceOver.
- Native tooltip rendering: `title` read as text; headless draws no tooltip.
- WKWebView and Safari 15: Chromium only.
- The first seconds of Home: until the 10 s agents feed arrives, executing initiatives read "quiet" and Needs me shows 3 of 5 rows (`1280x800-rest.png`); not this card's, not investigated.
- Widths under 1024, 200 % zoom and touch: out of this card.

Eight Needs me rows: copies of vendor-audit 0002 as 0003–0005 in the throwaway `$FIXTURE_HOME/vendor-audit/working-on/decisions/` (0005 with a six-paragraph Question and Recommendation), deleted after. Nothing was ruled or posted.

UI reviewer: resp2-ui, 2026-09-30.
