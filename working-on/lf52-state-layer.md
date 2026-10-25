---
title: "Every state mark is painted on one untransitioned layer, so a mark never eases and hover eases on every control"
status: next
repos: [organizer]
branch: lf52-state-layer
seat: l52-layer
reviewer: l52-layer-review, l52-layer-ui
stage:
updated: 2026-10-24
next: "review: lf52-state-layer, gate met (S1-S3, X0; Amendment 1), 8b27732"
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
- added `frontend/src/components/StateLayer.css.test.ts`: S1, S2, FR-3 (incl. the premise cross-check), Amendment 1's FR-1a to FR-1d and FR-2a
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
- hover's border-color no longer eases on these controls; a mark's ink change now eases 100 ms with hover's (FR-2a), its fill and line do not
- `--mark-edge`: a later control whose border rule omits it fails the FR-1b test, not the screen
Not changed, on purpose:
- `.sl-shadow` (rule box radio): an inset shadow inside its own border, so FR-1b's edge does not apply; its border sits over its rest background, not the fill (Notes)
- focused marks, role rows, the header gap (Amendment 1: next leftovers)
- `review.css` (0159); `decisions.css` (no state fill there; `.dec-chev` is ink with no transition)
- `.ib-row.focused`: its word is outside the premise's list (Notes)
- every stylesheet and component in the review fix: the wider enumeration found no marked control off the layer
- dead `.srm-*` rules in roadmap.css and time-zoom.css

## Notes
- Amendment 1: a mark's ink now eases 100 ms with hover's (FR-2a puts color in the one transition; R50's no-frame is the fill and line). The S1 check on what a mark paints leaves color out for that reason.
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

**Verdict: pass** (R43 amended, R50). Reviewer `l52-layer-ui`, 2026-10-24, commit e6d77d6. No severity 4 or 3 finding. Shots, logs and harness output are in `.wt-notes/l52-layer-ui/` (`r/<w>x<h>-<state>.png`, `r/h-*.txt`, `r/s-*.txt`).

**Shared test run: fresh**, test-lease run `43e52923-15747` of e6d77d6. `make test` exit 0, `Tests 1222 passed (1222)`. The code reviewer reused this run.

### How each state was checked
- **Setup.** Review build (`make review-build` in my worktree) launched on `fixture-home.sh --review` with `auth: off` and `discuss_state_dir` under the temp dir, pid saved. One real-window shot: `1024x640-init-b-conversations.png`. The AX resize to 1440 then hit the floating icon window, so the measurements come from an offscreen WKWebView harness (`tabharness`, window never ordered in, no system input). It ran over `wails dev` of a clean clone of e6d77d6 on the same fixture, at 1440×872 and 1024×612 content, which are the 1440×900 and 1024×640 windows minus the title bar.
- **Moving the mark.** For each move I read the old control's own style and its `::before` (`getComputedStyle(el,'::before')`) plus `document.getAnimations()`. Samples: before the click, synchronously after it, at the microtask, and at 16, 50, 100, 200 and 400 ms. In every case the old control had no fill or line from the first post-render sample on (microtask), the layer read `transition: none | 0s`, and there were no animations on old or new. Controls moved:
  - Rail row init-a → init-b (1440)
  - Strip init-b → init-a (both sizes)
  - Sub-tabs Overview → Work → Roadmap
  - Roadmap's segmented control Stages → Cards → Calendar, and the outline's Detail segmented control
  - People panel fse → po_ana (`button.person`)
  - Chat row po_ana → dev_bruno (R43: afterwards only the `aria-current` row has a fill)
  - People toggle (`tiny-btn[aria-pressed]`) on and off
  - Details (`ihead-details`) open and close
  - ⚙ `.gear.on`, and gear → place tab
  - Home's Rule `.act` open and close
  - Role row `r-row` open
  - Rule box option one-machine → two-machines (`.sl-shadow`)
- **Hover.** Emulated with a `.fh` copy of every `:hover` rule. An unmarked rail row, strip item, segmented button, person, chat row and stage tile each start a `background-color 100ms cubic-bezier(0, 0.4, 0, 1)` transition (`--ease-out`). Their rest state carries the same transition, which is the one the ease out uses. A marked person or chat row does not change on hover (no animation).
- **Looks as on main.** Main's CSS diff: same tokens, the same 2px left accent inset and 2px underline, and the radius inherited. The shots (`1440x872-chat-dev_bruno.png`, `1024x612-people-B.png`, `1024x612-roadmap-calendar.png`) show text and icons above the fill. No `.sl` descendant has a negative z-index. `.sl` changes no control's `position` (only `z-index` auto → 0).
- **Focus ring.** Tab through the top bar and rail reads `solid 2px rgb(192,171,254)`, offset 2px, unchanged.

### Findings
- **U1 (sev 1) The fill sits 1px inside a bordered control's edge.**
  - What the person sees: the fill is drawn 1px in from where main drew it.
  - Where: every `.sl` control with a 1px border: tiny-btn, `.act`, rail row, strip, chat, seg, stage tile.
  - Evidence: `.sl::before` is `inset: 0`, the padding box, while main's `background` painted the border box. The 1px edge now shows the control's own background through a translucent border (e.g. `.act`: rgb(39,32,51) under rgba(255,255,255,.16)) instead of the selected fill. Not visible in the shots at 1×.
  - Proposal: `inset: calc(-1 * border-width)` is not expressible, so leave it, or `inset: -1px` on bordered controls only.
- **U2 (sev 1) The critical memory chip's ring, open, is half as wide outside the chip.**
  - What the person sees: 1px of ring outside the chip instead of 2px, and the chip's amber loses 1px at its edge.
  - Where: `.memory button.memory-btn.critical[aria-expanded="true"]`.
  - Evidence: from CSS only. The ring `0 0 0 2px` now spreads from the layer's padding edge, so 1px of it covers the chip's 1px border. On main it spread 2px outside the border edge.
  - Proposal: `--mark-line: 0 0 0 3px …`, or keep this ring on the control.
- **U3 (sev 1) Hover on the current rail row shows a 1px rim around its fill.**
  - What the person sees: a 1px rim of `--surface` eases in around the opaque fill.
  - Where: the current rail row, and the same on other opaque-fill marks (seg `.on`, `.act` open).
  - Evidence: `rail_hover_marked` starts a background-color transition under the layer. On main the active rule beat hover, so nothing changed.
  - Proposal: restate `background: transparent` in the opaque mark rules, as the see-through ones already do.

### Spec gaps (for the FSE)
- S3's "vitest in the harness" is server renders over a cascade model, not WebKit. R50's no-frame check is this review's computed-style run. Word the row.
- R50 lists eight controls. The strip's role items and the rail's role rows also take the layer and were checked only at rest.
- `.ib-row.focused` (Home inbox) still eases its fill, outside the premise's words.

### For aglaea (design questions, not findings)
- A1: the sub-tabs' hover is ink only, and it switches at once, so R50's "hover eases" has nothing to ease there. Should sub-tab hover get a surface, or an ink ease?
- A2: should hover on a marked control with an opaque fill show at all? R49 amended covers the chat row only (see U3).
- A3: under `prefers-reduced-motion` hover still eases on every `.sl` control. The rule box lost its guard, and `button` never had one. The design system says "nothing moves".
- A4 (outside this card): at 1024×640 on init-b, the header's "no goal yet" line sits against the sub-tabs row (`1024x640-init-b-conversations.png`). Not compared with main.

### Not verified
- The critical memory chip on screen (the fixture shows "high"; U2 is read from CSS).
- The rail row move at 1024: my probe threw there and was not re-run (the strip was measured at 1024, the rail row at 1440).
- The real review window at 1440×900 (AX resize hit the floating icon; the harness covers 1440).
- Mark moves on stage tiles, the float list, the week list and the place tab: rest and hover only, or not reached.
