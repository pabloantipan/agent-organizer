---
title: "A landing shows its chat row, state fills do not ease, the new-thread picker reaches Others, and the fixture has a chat with a supervisor"
status: next
repos: [organizer]
branch: lf48-chat-landing
seat: l48-build
reviewer: l48-review, l48-ui
stage: review-map
updated: 2026-10-24
next: "review: lf48-chat-landing, gate L1-L4 and X0 pass after F1 and F2, b280b92"
review: fail
depends_on: []
boundary: ["docs/specs/leftovers-48.md Boundary"]
spec: "docs/specs/leftovers-48.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-48.md#Acceptance → gate"
ui_review: true
---

## Goal
Landing in Conversations always shows the row you landed on, the highlight never lags, and you can start a chat with anyone listed under Others.

## Gate
docs/specs/leftovers-48.md, rows L1-L4 and X0; the UI review checks review-view R42 to R44.

## Declared changes
- modified `frontend/src/styles/global.css`: every current, selected or open fill on a button that rode button's transition switches with none on and off, the base drops it, hover keeps its ease in; opted out: `.chat.active`, `button.person.active`, `.strip-all.active`, `.strip-item.active`, `.tiny-btn[aria-pressed="true"]`, `.seg button.on`, `.subtabs button.on`, `.places .place-tab.on`, `.gear.on`, `.gear.open`, `.stg.current`, `.fl-row.on`, `.week-list button[aria-current="true"]`, `.ib-act .act[aria-expanded="true"]`, `.ihead-details[aria-expanded="true"]`, `.memory button.memory-btn[aria-expanded="true"]`, `.ic-more[aria-expanded="true"]` (FR-2, F2)
- added `frontend/src/components/Conversation.tsx:rowReveal`: scrolls the chat list's current row into view, nearest and instant, on a landing; a pick in the list scrolls nothing (FR-1)
- modified `frontend/src/components/Conversation.tsx:Conversation`: a layout effect on the current chat calls `rowReveal`; list rows mark their pick (`listPick`, `reveal.click`); both new-thread forms get `others` (FR-1, FR-3)
- modified `frontend/src/components/Conversation.tsx:NewThread`: `others` prop, an `Others` optgroup after the roster, none when empty (FR-3)
- modified `frontend/src/components/Conversation.tsx:shownSeats`: an addressee under Others is not appended to the roster (FR-3)
- added `frontend/src/components/Conversation.landing.test.tsx`: L1 on `rowReveal`, L2 over every stylesheet, L3
- added `frontend/src/components/Conversation.reveal.test.tsx`: L1 driven through `Conversation` (stand-in hooks run its layout effect), a landing and a click (F1)
- modified `scripts/fixture-home.sh`: `--review` adds one open pablo/sup10 direct thread to the canned health (FR-4)
Risky:
- `global.css`: on the opted-out controls hover now eases in and leaves at once; an old row that is hovered while a landing moves the mark eases from the fill to the hover colour
- `rowReveal`: scrolls on mount too, so opening Conversations with a seat focused scrolls its row into view (nearest: no-op when visible)
Not changed, on purpose:
- `testdata/fixture-health.json`: the script adds the thread
- `frontend/src/components/Conversation.tsx:ReplyBox`, `RuleBox`: FR-3 names only NewThread's picker
- fills that set their own transition, not button's: `.r-row[aria-expanded]` (roles.css), `.rb-option` (rule-box.css), `.rail-item`, `.card`, `.wk-*`, `.p-row`, `.gl-row`; fills on non-buttons or on a child (`.rv-row.on` li, `.chart-bar.on .chart-mark`, `.rs-radio.on span`): no button transition to opt out of

## Done
- 2026-10-24 l48-build: FR-1 to FR-4 on `lf48-chat-landing` (dee2e79, 5d1bbdc, e559f4d); L1-L4 fail on main and pass on the branch; X0 passes from a clean clone (`.wt-notes/l48-build/progress.md`)
- 2026-10-24 l48-build: review F1 and F2 fixed (6667274, b280b92), rebased on main at f0496c4; L1 now fails with the layout effect deleted, a list row's pick unmarked, or a smooth scroll; L1-L3 42 fail on main, 61 pass on the branch; X0 passes from a clean clone at b280b92

## Notes
- L4's "last message the human's": the canned health carries a thread's head only (participants and a count, no bodies), so it is stated by the script and the participant order; the organizer reads no message in it, so it asks nothing.
- X0's first make test hit `TestAppCreateCrewReturnsAtOnce` (1.12 s against a 1 s budget) at load 17.9; the rerun passed. Not this card's code.

## Review

**Fail** at e559f4d (branch did not move during the review). Unmet gate items: **L1**. One proved finding outside the gate row: **F2** (FR-2).

### change-check (from a clean clone at e559f4d)

```
change-check: working-on/lf48-chat-landing.md
risk: medium (missing, read as medium)
repo organizer: base 0c80c717f (default origin/main) ... head lf48-chat-landing (clone HEAD e559f4d70, on detached) e559f4d70; 4 files, 2 flags; read in /Users/pabloantipan/organizer/.wt-notes/l48-review/clean

## Changed

- organizer/frontend/src/components/Conversation.landing.test.tsx (added, test)
- organizer/frontend/src/components/Conversation.tsx (modified): Conversation, rowReveal, shownSeats, NewThread
- organizer/frontend/src/styles/global.css (modified)
- organizer/scripts/fixture-home.sh (modified)

## Tests touched

- organizer/frontend/src/components/Conversation.landing.test.tsx

## Risky (declared)

- `global.css`: on the opted-out controls hover now eases in and leaves at once; an old row that is hovered while a landing moves the mark eases from the fill to the hover colour
- `rowReveal`: scrolls on mount too, so opening Conversations with a seat focused scrolls its row into view (nearest: no-op when visible)

## Not changed, on purpose (declared)

- `testdata/fixture-health.json`: the script adds the thread
- `frontend/src/components/Conversation.tsx:ReplyBox`, `RuleBox`: FR-3 names only NewThread's picker
- fills that set their own transition, not button's: `.r-row[aria-expanded]` (roles.css), `.rb-option` (rule-box.css), `.rail-item`, `.card`, `.wk-*`, `.p-row`, `.gl-row`; fills on non-buttons or on a child (`.rv-row.on` li, `.chart-bar.on .chart-mark`, `.rs-radio.on span`): no button transition to opt out of

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| outside boundary | organizer/frontend/src/components/Conversation.landing.test.tsx |  | added |
| untested? | organizer/frontend/src/components/Conversation.tsx | shownSeats | no test file names it |

2 flags: outside boundary 1, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 1, could not read 0, boundary unreadable 0
```

- `outside boundary` on `Conversation.landing.test.tsx`: false flag. The spec's Boundary lists "Conversation.tsx and its tests" and "the CSS test that reads it" (global.css); this one file is both.
- `untested?` on `shownSeats`: the L3 case "Others [sup10] with sup10 the addressee: listed once, under Others" exercises it through `NewThread`'s render. Explained.
- No undeclared, no declared-not-changed, no new dependency, no Go code, no `frontend/wailsjs/` change (`git diff --stat main...e559f4d`: 4 files, all inside the Boundary).

### Findings

- **F1 (L1, blocking): the L1 test does not test a landing.** It calls `rowReveal()` by hand and regex-checks the list's onClicks; nothing drives `Conversation`'s `useLayoutEffect` that calls `reveal.current`. Proof, mutation on a scratch clone: e559f4d's `Conversation.tsx` with line 339 (`useLayoutEffect(() => { reveal.current(chat, ...) }, [chat, reveal]);`) deleted, so no landing scrolls in the app, and `npx vitest run src/components/Conversation.landing.test.tsx` prints `Tests  19 passed (19)`. The row asks for "a landing on a row: scrollIntoView called once on the landed row". The test only proves the helper's logic. Reading the code, the wiring looks right: every landing path FR-1 names (a review, a card, Message, the feed's later selection via `unlistedLanding`) changes `chat` from outside the list, so the effect runs, and only `listPick`/person-row clicks set `picked`. But no test shows it. Goes to: this card.
- **F2 (FR-2, blocking): selected fills on buttons outside global.css still ease.** FR-2 says "any other current or selected fill that rides the global button transition opt out". The card's "Not changed, on purpose" says the other stylesheets' fills are "not on the global button transition". That is false for these `<button>` fills, which set no transition of their own and so take `button`'s (global.css:22, and :356 under no-preference): `.seg button.on` (background + colour; Roadmap Cards|Calendar, `UsageTable` cut), `.week-list button[aria-current="true"]` (background, Usage), `.subtabs button.on` (colour; the initiative's sub-view tabs), `.places .place-tab.on` and `.gear.on` (colour). Proof: the card's own L2 parser applied to global.css + shell.css + usage.css (`.wt-notes/l48-review/f1-check.mjs`):
  ```
  ok   .chat.active: transition none
  FAIL .seg button.on: transition not set (inherits button: background/border-color/color var(--dur-fast))
  FAIL .week-list button[aria-current="true"]: transition not set (inherits button: background/border-color/color var(--dur-fast))
  FAIL .subtabs button.on: transition not set (inherits button: background/border-color/color var(--dur-fast))
  ```
  The Boundary allows global.css "state fills only", so an opt-out rule there for these selectors fits it. If the FSE meant FR-2 to stop at global.css's own fills, the spec should say so: to the FSE. Goes to: this card.
- Note: L4's "last message the human's" cannot be read from `health.json`, because `discuss.Thread` (internal/discuss/discuss.go:44) carries participants and a count, no messages. It holds in substance: with no token under the fixture's `discuss_state_dir`, `threadFacts` reads no message, so `AskedOfMe` is 0, the status is open, `undecided` is false, and `needsHuman` and the reconciler's backlog stay unchanged. The gate's wording is to the FSE.
- Note: `ReplyBox` and `RuleBox` recipient selects still lack Others (FR-3 names only `NewThread`). Possible follow-up card, to the FSE.

### Per row, fails on main and passes on the branch

Main here is 0c733bf, the merge base; main's later commits are cards and docs only. The test was copied onto a main clone.

- L1: on main, 4 of 4 fail (`TypeError: rowReveal is not a function`; `expected undefined to be 5`). Passes on the branch. **Unmet** (F1).
- L2: on main, 10 of 10 fail (`expected null to be 'none'`; `expected '' to match /(^|, )background var\(--dur-fast\)/`). The "button keeps its transition" case passes on main as well (a guard, not a check). Passes on the branch. **Met as written** (the named fills); F2 covers the rest of FR-2.
- L3: on main, 3 of 3 fail (`expected [ '', 'po_ana', 'dev_bruno' ] to deeply equal [ '', 'po_ana', 'dev_bruno', …(2) ]`; `expected [ '', 'po_ana', 'sup10' ] to deeply equal [ '', 'po_ana', '# Others', 'sup10' ]`; docked `expected [ '', 'po_ana' ] to deeply equal …`). "Others empty" passes on both, as it should. No free-typed input. **Met.**
- L4: `eval "$(scripts/fixture-home.sh --review)"` (config held `discuss_state_dir: /private/tmp/organizer-fixture.1BY0CS/discuss`), `health.json` threads: `01FIXTUREFORAGLAEA000000000 open ['fse','pablo']` and `01FIXTURESUP10DIRECT0000000 open conversation ['sup10','pablo'] 2`. On main: `sup10 thread: False`. No Go or vitest test counts the fixture's Needs me; the header's 15 rows hold by the reading in the L4 note above. **Met** (gate wording note above).
- X0: **met.** `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` was **fresh**, run id `ff38278c-18736`, and exited 2 on `TestAppCreateCrewReturnsAtOnce` ("CreateCrew took 1.452763959s, want < 1 s") under machine load, before vitest ran. l48-ui reused that failing run. No Go changed in this diff, and the builder saw the same flake. A fresh rerun (`test-lease run -- make test`) exited 0: every Go package ok, vitest `80 files, 1064 tests passed`. `test-lease run -- pnpm run build` ok, `test-lease run -- wails build` ok, wailsjs untouched, `git status --porcelain` empty.
- lf47's Others, the roster's seats and the needs-me entry: the existing Conversation tests pass in the 1064. No new dependency.

Reviewer: l48-review, 2026-10-24.

## UI review
l48-ui, 2026-10-24. Every row was checked on **e559f4d**. The branch moved during this review, and per sup90 I report on e559f4d. The code review's fixes (F1, F2) land after it; sup90 will send the new SHA for a delta check of R43 alone. **Verdict: pass.** There is no finding of severity 4 or 3 against leftovers-48 FR-1 to FR-3 or review-view Amendment 13 (R42, R43, R44). Evidence is in `.wt-notes/l48-ui/out/`: harness logs `h-1024x612.txt`, `h-1440x872.txt` and `h-1024x640-run1.txt`; shots `wk-*.png`; `driver-dev.log`, `*-config-check.txt` and `killed.txt`.

**Shared test run: reused.** It was run `ff38278c-18736` of e559f4d70308, started by l48-review, and it exited 2 on the Go timing test `TestAppCreateCrewReturnsAtOnce` (1.45 s against a 1 s budget) before vitest ran. My own `vitest run` in the worktree (through test-lease, not shared) passed 80 files / 1064 tests (`out/vitest.log`). `make review-build` was ok.

**The screen was locked.** At the review build's launch `CGSSessionScreenIsLocked` was 1 (`out/rb-lock-state.txt`). AX on my pid returned only an empty AXApplication, the resize failed (-25205), and `screencapture -o -l 55601` returned "could not create image from window". I killed the review build by its saved pid and rested every row on WKWebView in the offscreen Tab harness.

**No mailbox, no editor.**
- Fixtures were `--review --canned-post` with `auth: off` and one `discuss_state_dir:` under their temp dir.
- The app ran with `DISCUSS_BIND=127.0.0.1:1`, a dead port, and the probe stubbed.
- `editor:` was a logging stub, never pressed (`editor-calls.txt` was never written).
- The three asks went only to each fixture's `posts.jsonl` (`to: sup10`).
- To make `+` usable for R44, a driver wrote a dummy `tokens.json` (pablo, organizer-fixture) into the fixture's temp discuss dir. Without it, `+` is disabled with "no token for pablo to post with". Nothing was posted from the form.

**How each state was checked.**
- **Harness**: as-ui's `tabharness.swift`, read first and unchanged (o47-ui's copy is identical). It runs offscreen with `isKey` true, is never ordered in, and so draws no frames. It ran under `harness.lock` against my own `wails dev -devserver localhost:34267` from a clean clone of e559f4d, with a fresh fixture per size.
- **Sizes**: 1024×612 and 1440×872 are the content areas of a 1024×640 and a 1440×900 window (title bar 28 px). One first run at 1024×640 content gave the base, R43 and Tab rows; there the sup10 row fits without a scroll.
- **Recorder**: rAF never fires in a window that draws no frames, so the first frame was recorded by a MutationObserver. Its callback runs after React's commit and its layout effects, which is the state the first painted frame shows.

- **R42 / FR-1**:
  - Steps: rv-fixture's temp `next` names sup10 (as o47-ui did). Make the map, mark Greet as a question with a note, `Ask sup10, next` (canned), reopen Greet, then Return on `Open the thread`.
  - At 1024×612 the first record after the landing (t 847 ms) has the current row `sup10` under Others at [566,594] inside the list [191,594]. The list scrolled 17 px, the row is wholly in view with the fill rgba(138,63,252,.18), and focus is on `← Review` (`wk-1024x612-R42-landing.png`). Focus was not moved by the scroll.
  - At 1440×872 the row is in view with no scroll (st 0).
  - A click on a row the list cuts (scrollTop 0, sup10 at 583..611 under a list ending at 594) leaves scrollTop 0. The click scrolls nothing, as FR-1 says.
- **R43 / FR-2**:
  - Clicks (JS `click()`) from channel to fse to sup10, and Return on po_ana, in a window that draws no frames. Read about 400 ms after each: the only non-transparent fill in the list is on the clicked row, and that row is the one `[aria-current]` and `.active` (both sizes).
  - The computed `transition` of `.chat.active` is `none` (property `none`, 0s). needs me, channel, fse and sup10 all read `none / 0s` at rest.
  - On main, o47-ui saw the fill stay on channel in the same harness. Here it no longer lags.
- **R44 / FR-3**:
  - With sup10 in Others, `+` opens NewThread, and Recipient reads `everyone (wakes 3)`, fse, po_ana, dev_bruno, then `<optgroup label="Others">` holding sup10.
  - Tab from Kind lands on Recipient with the 2px ring.
  - With the thread closed while channel is shown, `Others` leaves the list. The picker then reads the roster only, with no optgroup, and no `Others` text in any optgroup or label. Reopened, the group returns.
- **Against lf47-others' UI review**, at both sizes:
  - The list reads needs me, needs po_ana, channel, `People` (fse, po_ana, dev_bruno), `Others` (sup10 1), `More` (journal, archive).
  - The `Others` label's computed style equals `People`'s (11px, rgb(149,142,162), uppercase, .44px, margin 10/4/6/8). The sup10 row has the seat row's metrics (12px, pad 6/8, radius 8, h28).
  - Tab goes fse → po_ana → dev_bruno → sup10 → journal → archive, with a 2px rgb(192,171,254) ring.
  - `Asked sup10 · Open the thread` and `Ask sup10, next` read as before. After the landing, `sup10` is the one `aria-current="true"` row and focus is on `← Review`. Tab from there reaches sup10 after the seats.

**Words, design vs screen.**
- `Others` (A13, FR-3 `<optgroup label="Others">`): the optgroup label is `Others`. Same.
- List label: `Others` in the DOM, shown as OTHERS by the shared uppercase. Same.
- `Asked <seat> · Open the thread`: `Asked sup10 · Open the thread`. Same.
- `Ask <seat>, next`: `Ask sup10, next`. Same.

**Findings** (none of severity 4 or 3):
- **UL1 (2), for aglaea, spec gap for the FSE**:
  - What the person cannot do: see sup10 placed the same way in every recipient picker. In sup10's own chat, the docked reply box (`↳ in rv-fixture: …`) lists `sup10` as a plain option after the roster, while NewThread lists it under `Others`.
  - Where: `wk-1024x612-R44-picker-sup10-chat.png`.
  - Evidence: the Recipient children are `everyone (wakes 3)`, fse, po_ana, dev_bruno, `sup10`, with no optgroup. This is ReplyBox's `shownSeats(seats, to)`.
  - Severity: 2. FR-3 and A13 name only the new-thread picker; the builder flagged it too.
  - Proposal: one recipient list for every composer (roster, then Others), with the addressee appended only when it is in neither.
- **UL2 (1), for aglaea**:
  - What happens: at 1024×640 the landing's nearest scroll moves the list 17 px, which cuts the `Chats` label row, where `+` (new thread) lives, under the top edge.
  - Where: `wk-1024x612-R42-landing.png`.
  - Evidence: list scrollTop 17. The label sits behind `← Review`.
  - Proposal: none needed now. If it matters, keep the Chats head outside the scroller.
- **UL3 (1), for aglaea**:
  - What happens: a click on a row the list half cuts leaves it half cut. FR-1 forbids the scroll, but A13's premise ("that row is already in view") does not hold for a cut row.
  - Where: L_click rows in `h-1024x612.txt`.
  - Proposal: a click may reveal with `nearest` too, since a visible row does not move.
- **UL4 (1), for aglaea**:
  - What happens: on the opted-out controls hover now eases in and leaves at once, because the base has no transition. The design system says `--ease-exit` out.
  - Where: global.css (the FR-2 block).
  - Proposal: accept, or move the exit ease onto the base for background, border and colour only on non-state rules.

On the code review's F2: R43 as written covers `.chat.active`, which passes. I did not check the fills F2 names (`.seg button.on`, `.week-list button[aria-current]`, `.subtabs button.on`); that is the delta sup90 will send.

**Spec gaps (for the FSE)**:
- UL1, the reply and rule boxes' recipient lists.
- The fixture holds no pablo token, so NewThread (R44) cannot be opened without the dummy `tokens.json` plus a dead `DISCUSS_BIND`. A `--review` option for that would make R44 reachable as written.
- The canned health keeps Needs me at 16 in the top bar here. I did not judge that number against the script's header.

**For aglaea**: UL1, UL2, UL3, UL4.

**Not verified in WKWebView (review build)**: every review-build row, because the screen was locked (AX and screencapture empty). These are R42 at a real 1024×640 window, AXPress clicks for R43 in a not-key or occluded window, and the 1440×900 shots. Also not verified: the native select popup's rendering of the `Others` group, and arrow-key movement inside it (the harness does not open native menus).
