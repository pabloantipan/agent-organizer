---
title: "Every state mark is painted on one untransitioned layer, so a mark never eases and hover eases on every control"
status: next
repos: [organizer]
branch: lf52-state-layer
seat: l52-layer
reviewer: l52-layer-review, l52-layer-ui
stage:
updated: 2026-10-24
next: "review: lf52-state-layer, gate met (S1-S3, X0; U4 fixed, Amendment 2), 949c3dc"
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

**Verdict: pass.** Reviewer `l52-layer-review` (code review, gate rows), 2026-10-24, round 3. Branch `lf52-state-layer` at **8b27732**, from a fresh clean clone; the branch did not move during the review.
- History: round 1 (e6d77d6) failed S1 (FR-3). Round 2 (75945c2) fixed FR-3 but failed, because Amendment 1 (91cc03f) was not built yet.
- This SHA: `git range-diff` shows 279759b, b8f4071 and db50c11 `=` f84a45d, 998a280 and 75945c2. Then 8b27732 builds Amendment 1 in 9 stylesheets and the kit and two StateLayer tests (+210 −43). Its stylesheets: float, global, initiatives, memory, roles, rule-box, shell, usage, plus work.css, which loses its own reduced-motion rule to the global guard.

**Unmet gate items: none.** S1, S2 and S3, each with its Amendment 1 additions, and X0 are met.

### change-check (fresh clean clone of 8b27732)

```
repo organizer: base 3009067cb (default origin/main) ... head lf52-state-layer (clone HEAD 8b27732a4, on detached) 8b27732a4; 35 files, 49 flags
49 flags: outside boundary 26, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 23, could not read 0, boundary unreadable 0
```
(The full table is in `.wt-notes/l52-layer-review/change-check3.txt`.)
- **outside boundary (26)**: the same 26 component and test files as rounds 1 and 2, with the same explanation. The components carry class words only (8b27732 touches no component). The rest are the CSS test, its kit and S3's test, the class literals the 7 markup tests follow, and the removal of lf51's K4. The new 35th file, `work.css`, is a stylesheet and inside the boundary. `review.css` is unchanged.
- **undeclared 0 / declared, not changed 0.**
- **untested? (23)**: round 2's list plus the kit's new helpers (`withCompanions`, `winnerOf`, `px`, `borderWidth`, `borderColor`), all exercised by the new checks. Not a finding.

### Rows

Each new check fails at 75945c2: I copied 8b27732's three test files onto a clean clone of 75945c2 (`Tests 93 failed | 97 passed (190)`). On the branch: `Tests 194 passed (194)`. Per new check, failures at 75945c2 → passes at 8b27732:

| new check (Amendment 1) | fail at 75945c2 | pass at 8b27732 |
|---|---|---|
| S1 `the layer reaches the border box … (FR-1b, R52)` | 1/1 | 1 |
| S1 `a bordered control's layer covers its border box …` (per control) | 21/21 | 21 |
| S1 `an opaque fill keeps the control's border drawn over it …` (per control) | 16/16 | 16 |
| S1 `the critical memory chip's open ring is 2px outside its border (FR-1c)` | 1/1 | 1 |
| S1 `hover changes nothing on an opaque mark (FR-1d)` (per control) | 12 of 13 | 13 (one control already met it) |
| S2 `the hover transition lists background-color and color (FR-2a)` | 1/1 | 1 |
| S2 `under reduced motion one global guard … (FR-1a, R51)` | 1/1 | 1 |
| S2 `background-color and color ease 100 ms …` (per control, rewritten) | 22/22 | 22 |
| S3 `a bordered control's fill covers its border box (FR-1b)` | 5/5 surfaces | 5 |
| S3 `hover on the marked control draws no rim (FR-1d)` | 2 of 5 (rail, seg; People, strip and sub-tabs have no opaque fill) | 5 |

- **S1, met.**
  - One rule, written once (global.css:73-80). `.sl::before` sits at `inset: calc(-1 * var(--mark-edge, 0px))` and draws `border: var(--mark-edge, 0px) solid var(--mark-rim)`. `--mark-edge` is set by each rule that sets a control's border (`button` 1px; `border: 0` controls reset it to 0). An opaque mark restates its border colour as `--mark-rim`.
  - FR-1c: the memory chip's `0 0 0 2px` now spreads from the border's outer edge, unchanged in memory.css, because the layer moved.
  - FR-1d: every opaque mark restates its rest background (`transparent`, or `var(--button-bg)` on the non-ghost tiny-btn and `.act`).
  - My S1 inputs, re-run at 8b27732 (appended to a copy of outline.css in a scratch copy of the clone, test untouched): V1 3 fail, V2 3, V3 `[aria-expanded=true]` 3, V4 1, V5 2, V6 `:is(.active)` 3, V7 `[aria-pressed=true]` 3, `[… i]` 1 (the cross-check), `[ aria-pressed = true ]` 3, `:where(:is(.x, .on))` 3.
  - Inputs aimed at Amendment 1: a control's own reduced-motion `transition: none` → 1 fail (the guard check); a 2px-bordered control on the layer with no `--mark-edge` → 2 fail (FR-1b); an opaque mark with no restated background → 1 fail (FR-1d); a mark whose ink eases 2 s → 1 fail (S2's ease).
  - Still passing, as in round 2 (notes): `[class~="active"]`, `[ARIA-EXPANDED="true"]`, longhand `transition-property`/`transition-duration` (no sheet uses them today).
- **S2, met.**
  - The ease is `background-color …, color …` on `.sl` and `.sl-shadow` (FR-2a).
  - The one guard is `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; } }` (global.css:78-80). The test asserts it is the only reduced-motion `transition` rule, and work.css's own rule is gone.
  - lf51's list is still gone. `transition: none` left in the sheets but review.css: global.css:32 and :40 (disabled), :75 (the layer), :79 (the guard), header.css:60 (the compact chevron). None is a list.
- **S3, met.** Branch: the 5 surfaces × 8 checks all pass. The new checks are above.
- **X0, met.**
  - `CI=true test-lease run -- pnpm install --frozen-lockfile` ok.
  - `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **reused**, run `69843041-32146` of 8b27732a42d6 by organizer-probe-l52-layer-ui at 21:07:03 (`Test Files 86 passed (86)`, `Tests 1291 passed (1291)`, exit 0).
  - `test-lease run -- pnpm run build`: `✓ built in 1.34s`, exit 0.
  - `test-lease run -- wails build`: `Built '…/Deltagos.app/Contents/MacOS/organizer' in 9.979s`, exit 0.
  - Runtime not touched. `git status --porcelain`: empty.

### Notes (not blocking), each with where it goes
- **A mark's ink now eases 100 ms.** S1's "nothing it paints transitions" check leaves out `color`, because FR-2a puts `color` in the hover ease and the ease cannot tell a hover from a mark. So a sub-tab, gear or chat row whose mark changes ink eases its ink when the mark moves. Fill and line stay instant, which is what R50 names. This follows from Amendment 1 as written → to the FSE / Aglaea, if R50 should cover ink.
- See-through marks with a coloured border (`.chat.sl.active`, the strip) keep `--mark-rim: transparent`. Their rgba fill now sits over the control's own border, which tints the border slightly where main drew the border on the layer → to the UI re-review (R52).
- Longhand transitions, `[class~="active"]` and uppercase `ARIA-*` names are not read (proved in round 2, still true) → to the FSE (a next leftovers).
- From earlier rounds, still open: `.chart-bar`'s mark is not on the layer → FSE / Aglaea. `.ib-row.focused` eases → the next leftovers (Amendment 1 already names it). S3's "vitest in the harness" is a cascade model → FSE.

## UI review

**Verdict: fail.** Reviewer `l52-layer-ui`, 2026-10-24, commit 8b27732 (re-review: R43 amended, R50 amended, R51, R52; the round at e6d77d6 passed). One severity 3 finding, U4. Shots, logs and harness output are in `.wt-notes/l52-layer-ui/r2b/`.

**Shared test run: fresh**, test-lease run `69843041-32146` of 8b27732. `make test` exit 0, `Tests 1291 passed (1291)`. The code reviewer reused this run.

### Finding that fails
- **U4 (sev 3) Four controls lose their mark entirely.**
  - What the person cannot do: see which sub-view they are on, which person's chat is open in People, which role row is open on Home, and which float-list row is current.
  - Where: `.subtabs button`, `button.person`, `.r-row` and `.fl-row`, the four rules that set `--mark-edge: 0`, written unitless.
  - Shots:
    - Harness: `1440x872-chat-people.png` (Conversations current and dev_bruno open: no underline, no fill), `1024x612-U-before.png`, and `1024x612-U-with-0px.png` (the same screen with `0px`: both marks back).
    - Review build at 1024×640: `1024x640-rb-conversations-people.png`, Conversations current with no underline. At e6d77d6 the same screen had both marks (`r/1440x872-chat-dev_bruno.png`, `r/1024x612-people-B.png`).
  - Evidence: `inset: calc(-1 * var(--mark-edge, 0px))` with `--mark-edge: 0` is `calc(-1 * 0)`, a number and not a length. That makes it invalid at computed-value time, so `inset` falls back to `auto`. The `::before` then reads `width 0px, height 0px` at its static position, for example top 16px and left 12px on the sub-tab, and top 26px and left 8px on the person row (`r2b/h-U-1024x612.txt`). The fill and the 2px underline are computed but painted on a 0×0 box. Forcing `--mark-edge: 0px` gives the layer 113×32 and 236×52, inset 0, and both marks show. S3's harness models the cascade, not WebKit layout, so it could not see this.
  - Severity 3: the current-place mark on the primary sub-view navigation and on People is gone, a regression from main against R52 "see the mark as before" and R50.
  - Proposal: write `--mark-edge: 0px` in those four rules, or make the layer `calc(-1px * var(--mark-edge-n, 0))`. Add a test that rejects a unitless `--mark-edge`.

### Rows
- **R43 (amended), met.** Chat po_ana → dev_bruno: the old row's layer is transparent from the first post-render sample on, the layer has `transition: none`, and afterwards only the `aria-current` row has a fill.
- **R50 (amended), met for fill and line, apart from U4.**
  - Mark moves: rail row, strip, sub-tabs, Roadmap's segmented control, People and chat at 1440×872 and 1024×612 content. The old control's fill and line are gone from the first post-render sample on, the layer has no transition, and no fill or line animation runs.
  - Hover on an unmarked control: rail and seg start `background-color 100ms --ease-out`, and the seg adds `color`. The sub-tabs' ink-only hover now eases `color 100ms` (FR-2a). The rest state carries `background-color, color | 0.1s`.
  - Not this card (Amendment 1 defers them): the role rows and `.ib-row.focused` in R50's amended list.
- **R51, met (emulated).** I copied the `prefers-reduced-motion: reduce` block's rules out of their media query. There is one guard, `*, ::before, ::after { transition: none !important }`. With it applied:
  - every element on the initiative view and on Home reads transition-duration 0s;
  - sub-tab and rail moves and rail and sub-tab hovers start no animation.
  - The system setting was not changed (0108), so this is emulation, not a real reduce.
- **R52.**
  - **Fill covers the border box, met** on the bordered marks: rail, strip, chat, seg, stage tile, Details, `.act`, the People toggle, gear and memory. The layer is at `-1px` with a 1px border in `--mark-rim`, and the opaque marks restate their border colour there.
  - **Hover changes no pixel, met.** Rest against hovered with transitions forced off shows no difference on the current rail row, the strip, seg `.on`, the stage tile, Details, `.act` open and the People toggle.
  - **Memory chip ring: not verified.** `--memory critical` did not take with `--review` (the chip read "high", then "reading…"). From CSS, the chip is a `button` with `--mark-edge: 1px`, so its `0 0 0 2px` ring spreads from the border's outer edge, as on main.
  - **Not met for the four controls in U4.**

### Found, not failing
- **U5 (sev 2) A mark's ink now eases.**
  - What the person sees: the ink of a marked control (sub-tab, chat row, strip) eases over 100 ms when the mark arrives and when it leaves.
  - Why: FR-2a puts `color` in `.sl`'s own transition, and the unmarked style's transition governs a leaving mark.
  - Evidence: the moves start `color 100ms` on the old control. In a window that draws no frames, the old sub-tab keeps current ink (`rgb(238,235,244)` at 400 ms) while its underline has already gone.
  - This contradicts the design system's "State marks never ease" (including a border or ink that a mark changes) and the card's goal. It is the same CSS limit A16 solved for fill, and ink cannot go on a layer. See A5.

### Spec gaps (for the FSE)
- S3 reads the cascade, not WebKit layout, so a layer that computes but lays out at 0×0 passes it. U4 needs a check in WebKit, or one that rejects unitless lengths in `calc`.
- `fixture-home.sh --memory critical --review` does not give a critical chip, so R52's ring row cannot be reached on screen.

### For aglaea
- A5: hover ink easing (A1, FR-2a) and "marks never ease" conflict for every mark that changes ink. Pick one: mark ink switches at once (hover ink does not ease), or mark ink eases.
- A4 stands (R53, next leftovers).

### Not verified
- The memory chip's critical ring on screen (see R52).
- The role rows, `.ib-row.focused`, the float list and the week list: mark moves not driven. Role rows and `.fl-row` are covered by U4 from CSS and the role row's 0×0 layer was measured.
- R51 under a real system reduce setting.
