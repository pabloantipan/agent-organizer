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

**Verdict: fail, against the gate as amended. The rows reviewed are met.** Reviewer `l52-layer-review` (code review, gate rows), 2026-10-24, round 2. Branch `lf52-state-layer` at **75945c2**, from a fresh clean clone. Round 1 failed e6d77d6 on S1 (FR-3): unquoted `[aria-expanded=true]` / `[aria-pressed=true]` and `:is(.active)` were not enumerated. The branch was rebased on main: `git range-diff` shows f84a45d and 998a280 `=` 8db6359 and e6d77d6, and the frontend at 998a280 is byte-identical to e6d77d6. Then 75945c2 changes only `stateLayer.kit.ts` and `StateLayer.css.test.ts` (+68 −8). Everything else that differs between e6d77d6 and 75945c2 is main's lf52-chosen-trim merge (Go and cards).

**Unmet gate items: the S2 and S3 additions of Amendment 1 (FR-1a to FR-1d, FR-2a).** Amendment 1 (91cc03f) landed after 75945c2 was sent to review, and none of it is built at this SHA (proof below). Against the rows as they stood when 75945c2 went to review, it passes: S1 (its FR-3 half, round 1's finding, is now fixed), S2, S3 and X0 are met. The card's `next` (sup93, 743d2e5) already names this work, so I left it as it is. The amended rows need a review on the SHA that builds them.

### Amendment 1 at 75945c2 (from the clean clone)
- FR-1a / S2 "the reduced-motion guard exists once and sets every transition to none": `grep -n 'prefers-reduced-motion' frontend/src/styles/*.css` (review.css excluded) gives float.css:20 (an animation), global.css:375 (`no-preference`, `.card`), global.css:509 (an animation), spec-reader.css:13, outline.css:127, work.css:116 (`.wk-card, .wk-tile`). There is no global guard. Unmet.
- FR-1b / S3 "a bordered control's fill covers its border box": global.css:65 `.sl::before { … inset: 0; … }`. Unmet.
- FR-1c: memory.css:20 `--mark-line: 0 0 0 2px var(--surface-selected)`, which spreads from the layer's padding edge (U2). Unmet.
- FR-1d / S3 "hover on the current rail row draws no rim": global.css:185 `.rail-item.sl.active { --mark-fill: …; --mark-line: … }` keeps no `background: transparent`; likewise shell.css:344 `.seg button.sl.on` and shell.css:146 `.ib-act .act.sl[aria-expanded="true"]`. Unmet.
- FR-2a / S2 "the hover transition lists background-color and color": global.css:63 `transition: background-color var(--dur-fast) var(--ease-out)`. Unmet.

### change-check (fresh clean clone of 75945c2)

```
change-check: working-on/lf52-state-layer.md
risk: medium (missing, read as medium)
repo organizer: base 129cd99f4 (default origin/main) ... head lf52-state-layer (clone HEAD 75945c298, on detached) 75945c298; 34 files, 47 flags
47 flags: outside boundary 26, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 21, could not read 0, boundary unreadable 0
```
(The full table is in `.wt-notes/l52-layer-review/change-check2.txt`.)
- **outside boundary (26)**: the same 26 files as round 1, with the same explanation. change-check reads the boundary literally as `styles/*.css`. The 18 components change only by an `sl`/`sl-shadow` class word: I read every diff line, and that is allowed by the Boundary's "class names … in their components". The kit and the two StateLayer tests are the CSS test and S3's test. The 7 markup tests only follow the class literals, and `Conversation.landing.test.tsx` drops lf51's K4, which FR-2 retires. `review.css` is unchanged.
- **undeclared 0 / declared, not changed 0**: the card now declares one bullet per file.
- **untested? (21)**: the round-1 list plus the kit's new `unfold` and `unmarkedOnPurpose`. The new test `classifies every selector the premise's grep matches` exercises both. Not a finding.

### Rows (as written before Amendment 1)

- **S1 (FR-1, FR-3), met.**
  - FR-1: the CSS and components are unchanged since round 1. There is one shared rule (`.sl, .sl-shadow`, `.sl`, `.sl::before` with `transition: none`, global.css:63-66), and the test asserts that only one `.sl::before` rule exists and that no rule sets `--mark-fill` off the layer.
  - FR-3: enumeration now quotes bare values (`quoted`), unfolds `:is()`/`:where()` (`unfold`), also reads inside `@supports`/`@container`, and cross-checks MARKS against the premise's own regex (`unclassified()`). That cross-check fails on any selector the regex matches that the parser did not classify, and on any count mismatch between the sheet text and the selectors it read.
  - My round-1 inputs, each appended to a copy of `outline.css` in a scratch copy of the clone, test untouched: `[aria-expanded=true]` → 3 fail; `[aria-pressed=true]` → 3 fail; `:is(.active)` → 3 fail (`× outline.css: .ol-label.active: nothing it paints … is transitioned`, `… a control's fill and line are the layer's …`, `… background-color eases 100 ms …`).
  - My own spellings:
    - `[aria-expanded="true" i]` → 1 fail (`× classifies every selector the premise's grep matches, so a spelling it does not foresee fails`).
    - `[ aria-pressed = true ]` → 3 fail.
    - `:where(:is(.x, .on))` → 3 fail.
    - These four still pass: `[class~="active"]` → `Tests 96 passed (96)`; `[ARIA-EXPANDED="true"]` → `96 passed`; `.ol-sdot { transition-property: background; transition-duration: 300ms }` (eases the `.ol-sdot.current` mark) → `96 passed`; `.tiny-btn { transition-property: all; transition-duration: 1s }` → `96 passed`. See the notes below for why none of them blocks.
  - My grep (`grep -nE '\.(active|on|current|selected|open)\b|aria-(current|selected|pressed|expanded)=' frontend/src/styles/*.css`, review.css excluded) is now in the test itself as `PREMISE`, and `unclassified()` returns `[]` on the branch. Round 1's per-selector comparison stands: the sheets have not changed.
  - Fails on main: copying the three test files onto a clean clone of main (129cd99) gives `Tests 64 failed | 59 passed (123)` (49 CSS, 15 S3), e.g. `× one layer, written once …`, `× global.css: .rail-item.active: nothing it paints …`. Branch: `Tests 126 passed (126)`.
- **S2 as first written, met.** The CSS has not changed since round 1. Every control's four states win `background-color var(--dur-fast) var(--ease-out)`, with `--dur-fast: 100ms`. lf51's list is gone. The `transition: none` left in the sheets is the compact header's chevron, disabled buttons, the layer itself and work.css's reduced-motion rule: none of it is the list. Fails on main: `× hover is 100 ms`, `× no rule sets transition: none on a marked control …`.
- **S3 as first written, met.** The test file and the components are unchanged since round 1: 30 of 30 pass on the branch and 15 fail on main (`× the row that lost its mark has no fill in the next frame (R43 amended)`, `× the old control and the new one take the shared layer`, `× hover on the unmarked control eases in and out`).
- **X0, met.** `CI=true test-lease run -- pnpm install --frozen-lockfile` ok. `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **fresh**, run `eca3a4f1-7407` of 75945c2 (19 Go packages ok, `Test Files 86 passed (86)`, `Tests 1223 passed (1223)`, exit 0). `test-lease run -- pnpm run build`: `✓ built in 1.64s`, exit 0. `test-lease run -- wails build`: `Built '…/Deltagos.app/Contents/MacOS/organizer' in 13.612s`, exit 0. Runtime not touched. `git status --porcelain`: empty.

### Notes (not blocking), each with where it goes
- **Longhand transitions are not read** (proved above: `transition-property`/`transition-duration` pass). The kit reads only the `transition` shorthand. No stylesheet uses a longhand today (`grep -n 'transition-property\|transition-duration\|transition-delay' frontend/src/styles/*.css` prints nothing), so S1 and S2 hold for the sheets the gate checks. But a later rule could ease a mark this way unseen. → to the FSE (a next leftovers: read the longhands in `transitions`/`winners`).
- **`[class~="active"]` and an uppercase `ARIA-*` attribute name** are not enumerated. The premise's own grep misses them too, so FR-3 as written ("the classes and attributes in the premise") is met. → to the FSE, if FR-3 should outrun its premise.
- `.chart-bar` (pressable, `aria-pressed`) marks the child bar's colour, not its own fill. It switches at once, but it is not on the layer. → to the FSE / Aglaea.
- `.ib-row.focused` still eases its fill ("focused" is outside the premise's words) → to the FSE (a next leftovers).
- `.ihead-details[aria-expanded] svg` still rotates over 100 ms: a motion, not a fill → to Aglaea, if R50 means it.
- S3's "vitest in the harness" is two server renders over the kit's cascade model, not WebKit. The next frame on screen is the UI reviewer's R50 → to the FSE to word the row.
- Declared changes: the `float.css` bullet names week-list, which is in usage.css, and the `usage.css` bullet says "own background transition removed", but its diff changes one mark line only. → to the FSE (wording only).

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
