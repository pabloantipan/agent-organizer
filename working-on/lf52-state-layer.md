---
title: "Every state mark is painted on one untransitioned layer, so a mark never eases and hover eases on every control"
status: next
repos: [organizer]
branch: lf52-state-layer
seat: l52-layer
reviewer: l52-layer-review, l52-layer-ui
stage:
updated: 2026-10-24
next: "l52-layer (fresh session) fixes S1 FR-3 per ## Review (sup93)"
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

## Declared changes
- modified `frontend/src/styles/global.css`: adds the shared layer (`.sl`, `.sl::before`, `.sl-shadow`); moves tiny-btn, strip, rail-item, person and chat marks onto it; removes lf51's `transition: none` list and the rail-item's own transitions
- modified `frontend/src/styles/shell.css`: place-tab, gear (on, open), ib-act .act, ihead-details, stg (and its focus ring), subtabs and seg marks on the layer; drops the sub-tabs' transparent inset
- modified `frontend/src/styles/float.css`, `usage.css`, `memory.css`, `roles.css`, `initiatives.css`, `rule-box.css`: their marks on the layer (rb-option via `.sl-shadow`); own background transitions removed
- modified `Rail.tsx`, `SlackView.tsx`, `Conversation.tsx`, `UsageChart.tsx`, `TopBar.tsx`, `InitiativeHeader.tsx`, `UsageTable.tsx`, `RoadmapView.tsx`, `StageRoadmap.tsx`, `Usage.tsx`, `FloatList.tsx`, `Home.tsx`, `InitiativesView.tsx`, `MemoryButton.tsx`, `RuleDecisionBox.tsx`: class `sl` (or `sl-shadow`) on the marked controls, nothing else
- added `frontend/src/components/stateLayer.kit.ts`: reads the stylesheets as rules, reaches/specificity/winners, MARKS
- added `frontend/src/components/StateLayer.css.test.ts`: S1, S2, FR-3
- added `frontend/src/components/StateLayer.harness.test.tsx`: S3
- modified `Conversation.landing.test.tsx`: lf51's K4 removed (superseded by S1-S3)
- modified `CardDetails.test.tsx`, `CharterOnce.test.tsx`, `Home.waits.test.tsx`, `InitiativesView.test.tsx`, `Rail.keys.test.tsx`, `ReviewSymbol.test.tsx`, `TopBar.test.tsx`: class literals follow `sl`
Risky:
- `.sl`: `position: relative; z-index: 0` makes each control a stacking context (no control here holds a raised child today)
- hover's border-color and ink no longer ease on these controls; the sub-tabs' hover is ink only
Not changed, on purpose:
- `review.css` (0159); `decisions.css` (no state fill there; `.dec-chev` is ink with no transition)
- `.ib-row.focused`: its word is outside the premise's list (Notes)
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
