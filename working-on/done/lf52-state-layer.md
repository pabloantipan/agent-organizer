---
title: "Every state mark is painted on one untransitioned layer, so a mark never eases and hover eases on every control"
status: done
repos: [organizer]
branch: lf52-state-layer
seat: l52-layer
reviewer: l52-layer-review, l52-layer-ui
stage:
updated: 2026-10-25
next: "merged (sup93); code review pass and UI review pass at 949c3dc"
depends_on: []
boundary: ["docs/specs/leftovers-52.md Boundary, lf52-state-layer"]
spec: "docs/specs/leftovers-52.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-52.md#Acceptance → gate"
ui_review: true
review: pass
---

## Goal
No highlight in Deltagos ever lags behind a click, and hover eases on every control.

## Gate
docs/specs/leftovers-52.md, rows S1-S3 and X0.

## Done
- 2026-10-24 l52-layer: one shared layer (`.sl`, `.sl::before`, `.sl-shadow`) paints every state mark; S1 92/92, S2, S3 30/30 pass (49 and 15 fail on main); X0 passes from a clean clone of e6d77d6 (8db6359, e6d77d6; .wt-notes/l52-layer/progress.md).
- 2026-10-24 l52-layer: review fix (S1 FR-3): the kit reads bare attribute values and `:is()`/`:where()`, and a premise-grep cross-check fails any match it did not classify; the review's three inputs now fail (3 each), no new control found, no stylesheet changed; CSS test 96/96, harness 30/30; X0 passes from a clean clone of 75945c2 (75945c2; rebased on main 6ff86ea, f84a45d 998a280 75945c2)
- 2026-10-24 l52-layer: Amendment 1: one reduced-motion guard (FR-1a), the layer at the border box with the border over an opaque fill (FR-1b), the memory ring outside the border (FR-1c), no hover under an opaque mark (FR-1d), color in the hover ease (FR-2a); the new S2/S3 checks fail at 75945c2 (93 of 190), branch 194/194; X0 passes from a clean clone of 8b27732 (rebased on main 8f96d92: 279759b b8f4071 db50c11 8b27732)
- 2026-10-24 l52-layer: U4 and Amendment 2: every `--mark-edge` zero is `0px`, a test rejects a unitless custom property in the layer's calc(); the hover ease is background-color only again, ink switches at once; the new checks fail at 8b27732 (56 of 200), branch 200/200; X0 passes from a clean clone of 949c3dc (rebased on main 82f0d30: 161240e e8a3610 9c4db53 0a9f374 949c3dc)

## Declared changes
- modified `frontend/src/styles/global.css`: adds the shared layer (`.sl`, `.sl::before`, `.sl-shadow`) at the border box (`--mark-edge`, `--mark-rim`) with color in its ease and one reduced-motion guard; tiny-btn, strip, rail-item, person and chat marks on it; removes lf51's `transition: none` list
- modified `frontend/src/styles/shell.css`: place-tab, gear, ib-act .act, ihead-details, stg, subtabs and seg marks on the layer; opaque marks keep their rest background; `--mark-edge` on .stg and the sub-tabs
- modified `frontend/src/styles/float.css`: fl-row mark on the layer; `--mark-edge: 0`; keeps its rest background when on
- modified `frontend/src/styles/usage.css`: week-list mark on the layer; keeps its rest background when current
- modified `frontend/src/styles/memory.css`: memory button marks on the layer; the critical ring spreads from the border's outer edge
- modified `frontend/src/styles/roles.css`: r-row mark on the layer; `--mark-edge: 0`; keeps its rest background when open
- modified `frontend/src/styles/initiatives.css`: ic-more mark on the layer; keeps its rest background when open
- modified `frontend/src/styles/rule-box.css`: rb-option span's mark via `.sl-shadow`; keeps its rest background when on
- modified `frontend/src/styles/work.css`: its own reduced-motion `transition: none` removed (the global guard covers it)
- modified `frontend/src/components/Rail.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- modified `frontend/src/components/SlackView.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- modified `frontend/src/components/Conversation.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- modified `frontend/src/components/UsageChart.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- modified `frontend/src/components/TopBar.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- modified `frontend/src/components/InitiativeHeader.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- modified `frontend/src/components/UsageTable.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- modified `frontend/src/components/RoadmapView.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- modified `frontend/src/components/StageRoadmap.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- modified `frontend/src/components/Usage.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- modified `frontend/src/components/FloatList.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- modified `frontend/src/components/Home.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- modified `frontend/src/components/InitiativesView.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- modified `frontend/src/components/MemoryButton.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- modified `frontend/src/components/RuleDecisionBox.tsx`: class `sl` (or `sl-shadow`) on its marked controls, nothing else
- added `frontend/src/components/stateLayer.kit.ts`: reads the stylesheets as rules (bare attribute values quoted, `:is()`/`:where()` unfolded), reaches/specificity/winners/winnerOf, border width and colour, component companions, MARKS, and `unclassified` (the premise grep as a check on MARKS)
- added `frontend/src/components/StateLayer.css.test.ts`: S1, S2, FR-3 (incl. the premise cross-check), Amendment 1's FR-1a to FR-1d, U4 (a unitless length in the layer's calc), Amendment 2 (no color in the ease)
- added `frontend/src/components/StateLayer.harness.test.tsx`: S3, with Amendment 1's border-box and no-rim checks
- modified `frontend/src/components/Conversation.landing.test.tsx`: lf51's K4 removed (superseded by S1-S3)
- modified `frontend/src/components/CardDetails.test.tsx`: class literals follow `sl`
- modified `frontend/src/components/CharterOnce.test.tsx`: class literals follow `sl`
- modified `frontend/src/components/Home.waits.test.tsx`: class literals follow `sl`
- modified `frontend/src/components/InitiativesView.test.tsx`: class literals follow `sl`
- modified `frontend/src/components/Rail.keys.test.tsx`: class literals follow `sl`
- modified `frontend/src/components/ReviewSymbol.test.tsx`: class literals follow `sl`
- modified `frontend/src/components/TopBar.test.tsx`: class literals follow `sl`
Risky:
- `.sl`: `position: relative; z-index: 0` makes each control a stacking context (no control here holds a raised child today)
- hover's border-color and ink no longer ease on these controls (Amendment 2: only background-color eases); the sub-tabs' hover is ink only, so it switches at once
- `--mark-edge`: a later control whose border rule omits it fails the FR-1b test, not the screen
Not changed, on purpose:
- `.sl-shadow` (rule box radio): an inset shadow inside its own border, so FR-1b's edge does not apply; its border sits over its rest background, not the fill (Notes)
- focused marks, role rows, the header gap (Amendment 1: next leftovers)
- `review.css` (0159); `decisions.css` (no state fill there; `.dec-chev` is ink with no transition)
- `.ib-row.focused`: its word is outside the premise's list (Notes)
- every stylesheet and component in the review fix: the wider enumeration found no marked control off the layer
- dead `.srm-*` rules in roadmap.css and time-zoom.css

## Notes
- (superseded by Amendment 2, 949c3dc: ink no longer eases; S1's check reads color again) Amendment 1: a mark's ink now eases 100 ms with hover's (FR-2a puts color in the one transition; R50's no-frame is the fill and line). The S1 check on what a mark paints leaves color out for that reason.
- Amendment 1 FR-1d: "background: transparent" read as "the control's rest background": `.act` and the non-ghost tiny-btn rest on `--button-bg`, and a transparent mark there would ease the old control's background back in on leaving.
- The rule box's radio span (`.sl-shadow`) is not on the border box: its fill is an inset shadow, inside its 1px border; noticed, not in R52's list.
- The seven markup tests above pin class strings; updating them is outside the boundary's letter but follows from the class it allows.
- `.ib-row.focused` (Home's inbox) paints a fill on its own transitioned background, so its leaving mark eases; "focused" is not in the spec's state list, so S1 does not see it. A next leftovers could add it.
- The rule box options lost their reduced-motion `transition: none` with the layer; they ease as every control does.

## Review

**Verdict: pass.** Reviewer `l52-layer-review` (code review, gate rows), 2026-10-24, round 4. Branch `lf52-state-layer` at **949c3dc**, from a fresh clean clone; the branch did not move during the review.
- History: rounds 1 to 3 were e6d77d6 (fail, S1 FR-3), 75945c2 (fail, Amendment 1 not built) and 8b27732 (pass).
- Round 3 missed U4, which the UI review found: `--mark-edge: 0` (unitless) made `calc(-1 * var(--mark-edge))` a number, so four controls laid out 0x0. My round 3 described that value without catching it.
- This SHA: `git range-diff` shows 161240e, e8a3610, 9c4db53 and 0a9f374 `=` 279759b, b8f4071, db50c11 and 8b27732. Then 949c3dc (+43 −21) gives `--mark-edge` its unit in float, global, roles and shell. It drops `color` from the `.sl, .sl-shadow` ease (Amendment 2, 82f0d30, FR-2a withdrawn) and changes the kit and the two StateLayer tests to match.

**Unmet gate items: none.** S1, S2 and S3 as amended by Amendments 1 and 2, and X0, are met.

### change-check (fresh clean clone of 949c3dc)

```
repo organizer: base f812182e5 (default origin/main) ... head lf52-state-layer (clone HEAD 949c3dcc5, on detached) 949c3dcc5; 35 files, 49 flags
49 flags: outside boundary 26, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 23, could not read 0, boundary unreadable 0
```
(The full table is in `.wt-notes/l52-layer-review/change-check4.txt`.) The flags are the same as round 3, with the same explanations. The 26 outside the boundary are the components (class words only; 949c3dc touches none), the CSS test, its kit and S3's test, the 7 markup tests' class literals, and lf51's K4 removed. `review.css` is unchanged. There are 0 undeclared and 0 declared-not-changed. The 23 untested are kit helpers and class-only component symbols.

### Rows

New and changed checks, with 949c3dc's three test files copied onto a clean clone of 8b27732: `Tests 56 failed | 144 passed (200)`. On the branch: `Tests 200 passed (200)`.

| check | fail at 8b27732 | pass at 949c3dc |
|---|---|---|
| S1 `every custom property the layer's calc() reads is a length with a unit wherever it is set, and so is its fallback (U4)` | 1/1 | 1 |
| S1 `nothing it paints … is transitioned` (ink no longer exempt) | 13 of 39 | 39 |
| S2 `the hover transition lists background-color and not color … (Amendment 2)` | 1/1 | 1 |
| S2 `hover is 100 ms` (EASE back to background-color only) | 1/1 | 1 |
| S2 `background-color eases 100 ms on --ease-out …` (per control) | 23/23 | 23 |
| S3 `the old control's ink is the unmarked ink in the next frame (Amendment 2)` | 5/5 | 5 |
| S3 `a bordered control's fill covers its border box (FR-1b)` (U4: `px` rejects `calc(-1 * 0)`) | 2 of 5 (People, sub-tabs) | 5 |

- **S1, met.**
  - The layer is unchanged except that every `--mark-edge` now has its unit. `grep -n -- '--mark-edge:' frontend/src/styles/*.css | grep -v '1px\|0px'` prints nothing.
  - The U4 test reads every `var()` inside the layer's `calc()` and rejects any rule setting that property without a unit, and a unitless fallback. Sensitivity (appended to a copy of outline.css in a scratch copy of the clone, test untouched): `.ol-label { border: 0; --mark-edge: 0; }` → 1 fail (U4); `0rem` passes, which is right, since it is a length.
  - "Nothing it paints transitions" covers ink again: a mark whose ink eases with `color` in an `.sl` transition → 2 fail.
  - My earlier inputs, re-run: `[aria-expanded=true]`, `:is(.active)`, `[aria-pressed=true]` → 3 fail each. A control's own reduced-motion rule → 1 fail (the guard check). A bordered control with no `--mark-edge` → 2 fail. An opaque mark with no restated background → 1 fail (FR-1d).
- **S2, met.** `.sl, .sl-shadow { … transition: background-color var(--dur-fast) var(--ease-out); }` (global.css:74) and `--dur-fast: 100ms`. The one reduced-motion guard is at global.css:79-81. lf51's list is gone. The `transition: none` left are disabled buttons (:32, :40), the layer (:76), the guard (:80) and header.css:60's chevron.
- **S3, met.** 5 surfaces × 9 checks, all passing on the branch. The new ink check fails on all 5 at 8b27732.
- **X0, met.**
  - `CI=true test-lease run -- pnpm install --frozen-lockfile` ok.
  - `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **reused**, run `2042905c-65822` of 949c3dcc5b4e by organizer-probe-l52-layer-ui at 21:21:36 (`Test Files 86 passed (86)`, `Tests 1297 passed (1297)`, exit 0).
  - `test-lease run -- pnpm run build`: `✓ built in 1.32s`, exit 0.
  - `test-lease run -- wails build`: `Built '…/Deltagos.app/Contents/MacOS/organizer' in 10.358s`, exit 0.
  - Runtime not touched. `git status --porcelain`: empty.

### Notes (not blocking), each with where it goes
- **The tests model the cascade and cannot see layout.** U4 slipped past the code review and every vitest until the UI review measured a 0x0 box. The new test covers this one case, but the kit cannot tell a valid value from an invalid one in general → to the FSE: keep R50/R52's computed-box check in the UI review for any change to `.sl::before`.
- Round 3's ink note is closed by Amendment 2.
- Still open, from earlier rounds:
  - Longhand transitions, `[class~="active"]` and uppercase `ARIA-*` names are not read → FSE (a next leftovers).
  - A see-through mark's fill sits over a coloured border (`.chat`, strip) → UI re-review.
  - `.chart-bar` is not on the layer → FSE / Aglaea.
  - `.ib-row.focused` → the next leftovers.

## UI review

**Verdict: pass.** Reviewer `l52-layer-ui`, 2026-10-25, commit 949c3dc. Third round: e6d77d6 passed, 8b27732 failed on U4. This round checked U4's four controls, R43 (amended), R50 (amended by A18 and A19), R51, R52 and Amendment 19's next-frame ink. No severity 4 or 3 finding. Output is in `.wt-notes/l52-layer-ui/r3c/`.

**Shared test run: fresh**, test-lease run `2042905c-65822` of 949c3dc. `make test` exit 0, `Tests 1297 passed (1297)`.

### How it was checked
- **Setup.** Review build made with `make review-build` in my worktree, exit 0.
  - Measurements: the offscreen WKWebView harness over `wails dev` of a clean clone of 949c3dc, on `fixture-home.sh --review` with `auth: off` and the mailbox under the temp dir. Content sizes were 1440×872 and 1024×612, the 1440×900 and 1024×640 windows minus the title bar.
  - Real window: I launched the review build itself (saved pid, then quit). Its window shot did not save, because my script misread the window id. No real-window shot this round. The round at 8b27732 showed that the real build and the harness agree on these rules.
- **U4, fixed.**
  - The layer now spans its control at both sizes: current sub-tab 113×32 at 0,0 with the 2px underline; active person 236×52 at 0,0 with its fill; open role row 1136×36 and 720×36 at 0,0.
  - No `.sl` element on the initiative view, Conversations or Home has a layer under 1px, and no rule sets a unitless `--mark-edge`. `.fl-row` and `.fl-row:hover` read `0px`.
  - Shot `1024x612-U4-subtab-person.png`: Conversations underlined and po_ana filled, as on main.
- **R43 (amended), met.** Chat po_ana → dev_bruno: the old row has no fill from the first post-render sample on, nothing animates, and afterwards only the `aria-current` row has a fill.
- **R50 (amended), met.**
  - Mark moves: rail, strip, sub-tabs, Roadmap's segmented control, People and chat, at both sizes. The old control's fill, line and ink are unmarked from the first post-render sample on (microtask, then 16, 50 and 400 ms), and no animation starts on either control.
  - Hover on an unmarked control: the rail row and segmented button start `background-color 100ms cubic-bezier(0, 0.4, 0, 1)`. The transition lists `background-color` only.
  - The sub-tab's ink-only hover switches at once with no animation, as Amendment 19 allows.
- **A19's next-frame ink, met.** Pressing Work while on Conversations: the old sub-tab reads `rgb(181,175,195)` with no underline, and Work reads `rgb(238,235,244)` underlined, from the microtask on at both sizes. No color animation starts.
- **R51, met (emulated).**
  - The one guard `*, ::before, ::after { transition: none !important }` was copied out of its media query (the system setting is not changed, 0108).
  - With it applied, every element on the initiative view and on Home reads 0s, and moves and hovers on the rail and sub-tabs start nothing.
- **R52, met.**
  - No bordered `.sl` control's layer inset differs from its negative border width, so the fill covers the border box.
  - Hover changes nothing on the current rail row, strip, seg `.on`, stage tile, Details, `.act` open and the People toggle. I compared rest against hovered with transitions forced off.
  - The critical memory chip's ring is still not reachable on screen (see Not verified).

### Findings
None of severity 4, 3 or 2. U1-U5 from the earlier rounds are closed: U1-U3 by FR-1b to FR-1d, U4 by `0px`, U5 by Amendment 2.

### Spec gaps (for the FSE)
- `fixture-home.sh --review --memory critical` still shows a non-critical chip ("normal" at 1440, "reading…" at 1024), so R52's ring row can only be read from CSS. A fixture that holds a critical chip would close it.

### For aglaea
- A4 (R53, header gap) stands for the next leftovers, with `.ib-row.focused` and the role rows in R50.

### Not verified
- The critical memory chip's ring on screen. From CSS: a `button` with `--mark-edge: 1px` and the layer at -1px, so the `0 0 0 2px` ring sits 2px outside the border, as on main.
- A real-window shot of the review build at 949c3dc (the capture failed; see Setup).
- R51 under a real system reduce setting.
- Mark moves on the float list and the week list (`.fl-row` checked from its rule).
