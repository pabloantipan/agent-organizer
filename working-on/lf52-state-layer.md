---
title: "Every state mark is painted on one untransitioned layer, so a mark never eases and hover eases on every control"
status: next
repos: [organizer]
branch: lf52-state-layer
seat: l52-layer
reviewer: l52-layer-review, l52-layer-ui
stage:
updated: 2026-10-24
next: "l52-layer builds leftovers-52 Amendment 1 (FR-1a-1d, FR-2a; sup93)"
depends_on: []
boundary: ["docs/specs/leftovers-52.md Boundary, lf52-state-layer"]
spec: "docs/specs/leftovers-52.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-52.md#Acceptance → gate"
ui_review: true
review: fail
---

## Goal
No highlight in Deltagos ever lags behind a click, and hover eases on every control.

## Gate
docs/specs/leftovers-52.md, rows S1-S3 and X0.

## Done
- 2026-10-24 l52-layer: one shared layer (`.sl`, `.sl::before`, `.sl-shadow`) paints every state mark; S1 92/92, S2, S3 30/30 pass (49 and 15 fail on main); X0 passes from a clean clone of e6d77d6 (8db6359, e6d77d6; .wt-notes/l52-layer/progress.md).
- 2026-10-24 l52-layer: review fix (S1 FR-3): the kit reads bare attribute values and `:is()`/`:where()`, and a premise-grep cross-check fails any match it did not classify; the review's three inputs now fail (3 each), no new control found, no stylesheet changed; CSS test 96/96, harness 30/30; X0 passes from a clean clone of 75945c2 (75945c2; rebased on main 6ff86ea, f84a45d 998a280 75945c2)

## Declared changes
- modified `frontend/src/styles/global.css`: adds the shared layer (`.sl`, `.sl::before`, `.sl-shadow`); tiny-btn, strip, rail-item, person and chat marks on it; removes lf51's `transition: none` list and the rail-item's own transitions
- modified `frontend/src/styles/shell.css`: place-tab, gear (on, open), ib-act .act, ihead-details, stg (and its focus ring), subtabs and seg marks on the layer; drops the sub-tabs' transparent inset
- modified `frontend/src/styles/float.css`: fl-row and week-list marks on the layer; own background transition removed
- modified `frontend/src/styles/usage.css`: usage marks on the layer; own background transition removed
- modified `frontend/src/styles/memory.css`: memory button marks on the layer (critical's outer ring as --mark-line)
- modified `frontend/src/styles/roles.css`: r-row mark on the layer
- modified `frontend/src/styles/initiatives.css`: marks on the layer; own background transition removed
- modified `frontend/src/styles/rule-box.css`: rb-option span's mark via `.sl-shadow`; its reduced-motion `transition: none` goes with the layer
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
- added `frontend/src/components/stateLayer.kit.ts`: reads the stylesheets as rules (bare attribute values quoted, `:is()`/`:where()` unfolded), reaches/specificity/winners, MARKS, and `unclassified` (the premise grep as a check on MARKS)
- added `frontend/src/components/StateLayer.css.test.ts`: S1, S2, FR-3 (incl. the premise cross-check)
- added `frontend/src/components/StateLayer.harness.test.tsx`: S3
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
- hover's border-color and ink no longer ease on these controls; the sub-tabs' hover is ink only
Not changed, on purpose:
- `review.css` (0159); `decisions.css` (no state fill there; `.dec-chev` is ink with no transition)
- `.ib-row.focused`: its word is outside the premise's list (Notes)
- every stylesheet and component in the review fix: the wider enumeration found no marked control off the layer
- dead `.srm-*` rules in roadmap.css and time-zoom.css

## Notes
- The seven markup tests above pin class strings; updating them is outside the boundary's letter but follows from the class it allows.
- `.ib-row.focused` (Home's inbox) paints a fill on its own transitioned background, so its leaving mark eases; "focused" is not in the spec's state list, so S1 does not see it. A next leftovers could add it.
- The rule box options lost their reduced-motion `transition: none` with the layer; they ease as every control does.

## Review

**Verdict: fail.** Reviewer `l52-layer-review` (code review, gate rows), 2026-10-24, branch `lf52-state-layer` at e6d77d6 (not moved during the review), from a clean clone.

**Unmet gate items: S1 (its FR-3 half).** S1 also cites FR-3 ("a control added later is checked without editing the test"), and the enumeration misses three legal spellings of the premise's own classes and attributes. The premise grep finds all three. S1's FR-1 half, S2, S3 and X0 are met.

### Blocking finding: the enumeration misses unquoted attribute values and `:is()`

`stateLayer.kit.ts`: `stateAttr` matches only `aria-pressed="true"` / `aria-expanded="true"` written with quotes (`parseCompound` turns `'` into `"` but does not quote a bare value), and `parseCompound` files `:is(...)`/`:where(...)` as an opaque pseudo, so a state class inside it is not seen. Proof: each line below was appended, one at a time, to a copy of `outline.css` in a scratch copy of the clone (`.wt-notes/l52-layer-review/exp`, test untouched), then `npx vitest run src/components/StateLayer.css.test.ts` was run:

| input appended (each one a marked control whose mark eases 1 s) | result |
|---|---|
| `.ol-label:hover{background:red}` `.ol-label[aria-expanded=true]{background:blue;transition:background 1s}` | `Tests 95 passed (95)`: missed |
| `.ol-label:hover{background:red}` `.ol-label[aria-pressed=true]{background:blue;transition:background 1s}` | `Tests 95 passed (95)`: missed |
| `.ol-label:hover{background:red}` `.ol-label:is(.active){background:blue;transition:background 1s}` | `Tests 95 passed (95)`: missed |

The spec premise's grep (`aria-(current|selected|pressed|expanded)=`, `\.(active|on|…)\b`) matches all three, so the test reads less than the premise names. Amendment 17 says "and any later one". Fix, inside the boundary (the CSS test): either read a bare value as quoted and look inside `:is`/`:where`, or cross-check MARKS against the premise regex over the raw selector text and fail on any match the parser did not classify.

Sensitivity holds for the usual spellings, test untouched (same method):
- V1 `.ol-label.active{background:blue}` + `.ol-label{transition:background 100ms ease}`: 3 fail (`nothing it paints … is transitioned`, `a control's fill and line are the layer's`, `background-color eases 100 ms`).
- V2 a mark on the layer with `.ol-label.sl.active::before{transition:background 1s}`: 1 fail (`one layer, written once`).
- V4 `.ol-sdot.current{transition:background 300ms}` (not a control): 1 fail.
- V5 `.ol-label.selected{background:blue;transition:background-color 1s}`: 2 fail.

### change-check (from the clean clone)

```
change-check: working-on/lf52-state-layer.md
risk: medium (missing, read as medium)
repo organizer: base 864a5eee1 (default origin/main) ... head lf52-state-layer (clone HEAD e6d77d6ff, on detached) e6d77d6ff; 34 files, 78 flags
81 flags: outside boundary 26, outside footprint 0, undeclared 33, declared, not changed 3, new env var 0, new dependency 0, new host 0, risk 0, untested? 19, could not read 0, boundary unreadable 0
```
(The full table is in `.wt-notes/l52-layer-review/change-check.txt`.) Explanations:
- **outside boundary (26)**: change-check reads the boundary's literal path, `styles/*.css`. The spec's Boundary also allows the class names on the components and the CSS test. 18 component `.tsx` files: I read every `-`/`+` line of `git diff main...e6d77d6 -- 'frontend/src/components/*.tsx' ':!*test*'`, and each one adds only `sl`/`sl-shadow` to a `className`, nothing else. That is in the boundary. `StateLayer.css.test.ts` + `stateLayer.kit.ts` are the CSS test and its helper (only the two StateLayer tests import the kit). `StateLayer.harness.test.tsx` is S3's test. The 7 markup tests (CardDetails, CharterOnce, Home.waits, InitiativesView, Rail.keys, ReviewSymbol, TopBar) only follow the new class literals (`"sl on"`, `--mark-line` in place of `box-shadow`), with no assertion weakened. `Conversation.landing.test.tsx` loses lf51's K4, which tested the `transition: none` list FR-2 removes. These are outside the letter but explained, not a finding. `review.css` is unchanged.
- **undeclared (33)** and **declared, not changed (3)**: one parse. The card declares several files per bullet by basename (`modified \`Rail.tsx\`, \`SlackView.tsx\`, …`; `\`float.css\`, \`usage.css\`, …`). change-check takes the first name of each bullet without a path, so it misses those three (Rail.tsx, Conversation.landing.test.tsx, CardDetails.test.tsx) and never reads the rest. Every undeclared file is named in one of those bullets. Note: build-seat asks for one bullet per file.
- **untested? (19)**: the component symbols changed by a class word only. They are covered by the S3 harness (Rail, People, InitiativeHeader, UsageTable) and by S1/S2 over their CSS. The kit's internals are exercised through the two tests that import them. Not a finding.

### Rows

- **S1 (FR-1, FR-3), unmet (FR-3, above).** FR-1 is met. One rule: `.sl, .sl-shadow` (vars and the one transition), `.sl` (relative, z-index 0) and `.sl::before` (inset 0, z-index -1, `background: var(--mark-fill)`, `box-shadow: var(--mark-line)`, `transition: none`), global.css:63-66, written once. The test asserts there is exactly one `.sl::before` rule and that no other rule sets `--mark-fill` off the layer. `.sl-shadow` is the inset-shadow form for the rule box's span, whose `::before` is the radio. The test enumerates from the sheets itself (`MARKS` over `RULES`, every `.css` but review.css), with no hand-written list. My grep (`grep -nE '\.(active|on|current|selected|open)\b|aria-(current|selected|pressed|expanded)=' frontend/src/styles/*.css`, review.css excluded) gives 62 lines. Every selector on them is in MARKS: I dumped the test's own classification, 22 controls, 17 not controls, 16 not a mark, 9 dead. Its exceptions, checked:
  - "not a mark" (opacity, transform, mask, layout, grid-column; `.ihead-open` `border-top: 1px solid transparent`): they paint no fill or line. Holds.
  - "not on screen": the `.srm-*` family, whose classes no component writes. Holds, and any new dead selector that is not `srm-` fails the test.
  - "not a control" (no hover fill on the subject): the stage, legend and stepper marks, `.init.open`, `.usage-weeks tr.on td` and `.chart-axis span.on` (ink), `.stg.current .stg-n`, `.rb-option.on span::before`, `.chart-bar.on .chart-mark`. Every one of them is still held to "nothing it paints transitions". Holds. Note: `.chart-bar` is a pressable button (`aria-pressed`, UsageChart.tsx:51) whose mark is the child bar's colour, not a control fill. It switches at once, but it is not on the layer.
  - Fails on main: copying the kit and both tests onto a clean clone of main (864a5ee) gives `Tests 64 failed | 58 passed (122)`, 49 of them in the CSS test, e.g. `× global.css: .rail-item.active: a control's fill and line are the layer's …`, `× one layer, written once …`, `× shell.css: .seg button.on: background-color eases 100 ms on --ease-out …`.
- **S2, met.** Every control's four states (marked or not, hovered or not) win `background-color var(--dur-fast) var(--ease-out)` (`--dur-fast: 100ms`, which the test asserts). The mark rule sets no transition of its own. lf51's list is gone (global.css diff, −82 lines). `transition: none` left in the sheets but review.css:
  - `header.css:60`, the compact header's chevron transform. Not a fill.
  - `global.css:32` `button:disabled` and `:40` `aria-disabled`: the dim lands at once.
  - `global.css:65`, the layer itself.
  - `work.css:117`, the reduced-motion rule for cards.
  None is the list. Fails on main: `× hover is 100 ms`, `× no rule sets transition: none on a marked control or its hover (lf51's list is gone)`, and the per-control rows.
- **S3, met.** `StateLayer.harness.test.tsx` renders the real Rail (rows and strip), People, InitiativeHeader sub-tabs and UsageTable's segmented control twice, with the mark on A and then on B. It then computes the old control's style from every sheet over the rendered tree. The old control's layer reads transparent and `0 0 transparent`, its own background is unchanged, its transition is only the background-color ease, and hover on it eases and fills (the sub-tabs' hover is ink only, flagged in the test). Branch: 30/30. Fails on main: 15, e.g. `× the old control and the new one take the shared layer`, `× the row that lost its mark has no fill in the next frame (R43 amended)`, `× hover on the unmarked control eases in and out`. Note: the click is two server renders and the cascade is the kit's model, not WebKit. The gate's "vitest in the harness" is ambiguous here (this repo's "harness" is `scripts/tab-harness`, a WKWebView one), so the next frame on screen is the UI reviewer's R50 → to the FSE to word the row.
- **X0, met.** `CI=true test-lease run -- pnpm install --frozen-lockfile` ok. `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **reused** run `43e52923-15747` of e6d77d6ff150 by organizer-probe-l52-layer-ui (19 Go packages ok, `Test Files 86 passed (86)`, `Tests 1222 passed (1222)`, exit 0). `test-lease run -- pnpm run build`: `✓ built in 1.59s`, exit 0. `test-lease run -- wails build`: `Built '…/Deltagos.app/Contents/MacOS/organizer' in 14.033s`, exit 0. Runtime not touched. `git status --porcelain`: empty.

### Notes (not blocking)
- `.ib-row.focused` (Home's inbox) eases its fill. "focused" is outside the premise's words → to the FSE (a next leftovers).
- `.ihead-details[aria-expanded] svg` still rotates over 100 ms while open: a motion, not a fill → to the FSE / Aglaea, if R50 means it.
- The builder reports 92 tests in the CSS test. I count 95 at e6d77d6, all passing.
- Declared changes should be one bullet per file (build-seat) so change-check can read them.

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
