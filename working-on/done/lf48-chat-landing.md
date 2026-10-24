---
title: "A landing shows its chat row, state fills do not ease, the new-thread picker reaches Others, and the fixture has a chat with a supervisor"
status: done
repos: [organizer]
branch: lf48-chat-landing
seat: l48-build
reviewer: l48-review, l48-ui
stage: review-map
updated: 2026-10-24
next: "done: review pass at b280b92 (l48-review), UI review pass (l48-ui)"
review: pass
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

### Round 2: **pass** at b280b92 (l48-review, 2026-10-24)

Unmet gate items: **none**. F1 and F2 from round 1 are fixed. The branch was rebased on main at f0496c4 and did not move during this review.

**change-check** (fresh clean clone at b280b92; base origin/main, 5 files):

```
## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| outside boundary | organizer/frontend/src/components/Conversation.landing.test.tsx |  | added |
| outside boundary | organizer/frontend/src/components/Conversation.reveal.test.tsx |  | added |
| untested? | organizer/frontend/src/components/Conversation.tsx | shownSeats | no test file names it |

3 flags: outside boundary 2, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 1, could not read 0, boundary unreadable 0
```

- `outside boundary` on `Conversation.landing.test.tsx` and `Conversation.reveal.test.tsx`: false flags. The Boundary lists "Conversation.tsx and its tests" and "the CSS test that reads it"; both files are those.
- `untested?` on `shownSeats`: L3's "sup10 the addressee: listed once, under Others" renders it through `NewThread`.
- No undeclared, no declared-not-changed, no new dependency, no new env var. `git diff main...b280b92` touches no Go code, `frontend/wailsjs/`, `go.mod` or lockfile.

**Rows. Each fails on main (f0496c4, both test files copied onto it) and passes on the branch:**

- **L1, met.** On main, all 5 L1 cases fail (`rowReveal is not a function`, and the two driven cases).
  - The new `Conversation.reveal.test.tsx` runs `Conversation` under stand-in hooks that run its layout effects. Landing on sup10 under Others gives `[["sup10", {block:"nearest"}]]` once, with no focus call; a redraw adds nothing. A click on po_ana or journal scrolls nothing, and a landing after the click scrolls again.
  - F1 mutation: with the landing `useLayoutEffect` deleted from b280b92's `Conversation.tsx`, 2 of 2 fail (`expected [] to deeply equal [ [ 'sup10', { block: 'nearest' } ] ]`).
  - Second mutation: the person row's `reveal.click` removed fails the click case (`expected [ [ 'po_ana', { block: 'nearest' } ] ] to deeply equal []`).
  - Every landing path FR-1 names changes `chat` from outside the list, so the one effect covers them all.
- **L2, met.** On main, 34 of 34 fill cases fail (`expected null to be 'none'`, and hover `expected '' to match …`). The branch passes 61 of 61 with L1 and L3.
  - F2: `.wt-notes/l48-review/f2-check.mjs` lists every state-marked selector in every stylesheet. Each one left without `none` is either not on a button or has its own transition: a child span (`.chart-bar.on .chart-mark`, `.rs-radio.on span`, `.rb-option.on span`, `.stg.current .stg-n`, `.stepper i`), an `li` (`.rv-row.on`), a div or bar (`.srm-*`, `.tz-*`, `.g-bar`, `.ihead-open`, `.ol-*`), or a button with its own background transition (`.r-row`, `.rail-item`).
  - `.memory button.memory-btn[aria-expanded="true"]:not(.critical)` takes `none` from the higher-specificity rule.
  - `f1-check.mjs` now reads `ok` for `.seg button.on`, `.week-list button[aria-current="true"]` and `.subtabs button.on`.
- **L3, met.** On main, 3 of 3 fail (`expected [ '', 'po_ana', 'dev_bruno' ] to deeply equal [ …, '# Others', 'sup10' ]`). "Others empty" passes on both. The picker has no free-typed input.
- **L4, met.** `--review` `health.json` holds `01FIXTURESUP10DIRECT0000000 open conversation ['sup10','pablo'] 2`. On main that thread is absent.
  - The FSE's question (thread 01M5QMWK7ZP8XQN06XEZ3BFDRV): I measured Needs me directly. `service.New` + `Scan` + `RefreshAgents` dumped, then the app's own `needsMeRows`, against a `--review` home per tree (`discuss_state_dir` under its temp dir each time). Result: **16 rows on main and 16 on the branch, the same 16 keys** (`rows-main.txt`, `rows-probeB.txt`, `diff` empty).
  - The sup10 thread has `asked_of_me 0`, open, and adds no row. The 16 against the header's "15 rows" already exists on main, so it is not this card's.
- **X0, met.** `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` was **fresh**, run `e04e0e7c-12633` of b280b921, rc 0: 19 Go packages ok, vitest 81 files / 1106 tests. `test-lease run -- pnpm run build` ok, `test-lease run -- wails build` ok, wailsjs untouched, `git status --porcelain` empty.
- lf47's Others, the roster and the needs-me entry: their existing tests pass in the 1106. No new dependency.

**Where each finding goes:**
- UL1 (and ReplyBox/RuleBox without Others), UL2, UL3: lf51-composers (0160).
- The `TestAppCreateCrewReturnsAtOnce` flake: lf51-crew-flake.
- L4's "last message the human's" cannot be read from `health.json` (`discuss.Thread` holds no messages): to the FSE.
- `fixture-home.sh`'s header says Needs me has 15 rows, but it is 16 on main already: to the FSE.

### Round 1: fail at e559f4d (l48-review, 2026-10-24)

L1 unmet: the test passed with the landing's layout effect deleted (F1). F2 (FR-2): `.seg button.on`, `.week-list button[aria-current]`, `.subtabs button.on`, `.place-tab.on` and `.gear.on` rode the button transition. L2 to L4 met. The shared run was fresh, `ff38278c-18736`, rc 2 on the Go timing flake; the fresh rerun passed.

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
