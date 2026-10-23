---
title: "Conversations lists a chat with someone outside the roster under Others, and lands on it at once"
status: done
repos: [organizer]
branch: lf47-others
seat: o47-build
reviewer: o47-review, o47-ui
stage: review-map
updated: 2026-10-23
next: "done: review pass (o47-review), UI review pass (o47-ui); findings routed to the FSE"
depends_on: []
boundary: ["docs/specs/leftovers-47.md Boundary, lf47-others"]
spec: "docs/specs/leftovers-47.md (FR-7 to FR-9)"
gate: "docs/specs/leftovers-47.md Acceptance, rows O1-O3 and X0"
ui_review: true
review: pass
---

## Goal
A chat with a supervisor or any other name outside the roster has a row, and landing on it makes that row current.

## Gate
docs/specs/leftovers-47.md, rows O1-O3 and X0; the UI review checks review-view R41.

## Declared changes
- added `frontend/src/components/Conversation.tsx:othersOf`: names outside the roster with an open direct thread with the human, first-seen order, plus the chat shown (FR-7 to FR-9)
- modified `frontend/src/components/Conversation.tsx:Conversation`: the chat list draws an `Others` sub-label and rows after People's seats; seats and Others share `personRow` (FR-7, FR-8)
- added `frontend/src/components/Conversation.others.test.tsx`: gate rows O1-O3
Risky:
- `othersOf`: keeps the shown name's row even with no thread, so a focus set to any name outside the roster draws a row; only openSlack and the list set focus
Not changed, on purpose:
- `frontend/src/styles/global.css`: `.chats-label.sub` already styles the sub-label
- `frontend/src/components/SlackView.tsx:People`: reads the crew, which holds no Others (FR-9)
- `frontend/src/components/Conversation.tsx:unlistedLanding`, `askedSeat`: a landing on a seat outside the roster already stays on it; `askedSeat` returns null for it and moves nothing

## Done
- 2026-10-23 o47-build: FR-7 to FR-9 on `lf47-others` (09c5d11); O1-O3 fail on main, pass on the branch; X0 passes from a clean clone (`.wt-notes/o47-build/progress.md`)

## Notes
- The new-thread form's recipient picker lists only the roster, so `+` in an Other's chat cannot address that name; replying into its thread works. Not in FR-7 to FR-9.

## Review
**Verdict: pass** at 09c5d11 (branch `lf47-others`, not moved). Unmet gate items: none.

change-check (`change-check organizer lf47-others`, clean clone at 09c5d11):
```
repo organizer: base eefd82a92 (default origin/main) ... head lf47-others 09c5d114c; 2 files, 1 flags
Changed: Conversation.others.test.tsx (added, test); Conversation.tsx (modified): othersOf, Conversation
| outside boundary | organizer/frontend/src/components/Conversation.others.test.tsx |  | added |
1 flags: outside boundary 1, undeclared 0, declared, not changed 0, new dependency 0, new env var 0, new host 0
```
- `outside boundary` Conversation.others.test.tsx: the Boundary reads "`Conversation.tsx` and its tests" after the path, which change-check cannot parse; it is Conversation.tsx's test. Explained. No Go, no stylesheet, no `frontend/wailsjs/`, no package files in the diff (`git diff --stat main...09c5d11`: 2 files).

Fails on main (the branch's test file copied onto a main clone at eefd82a, `npx vitest run src/components/Conversation.others.test.tsx`: 6 failed | 3 passed):
- O1: `TypeError: othersOf is not a function` (first-seen order); row-like-a-seat `AssertionError: expected '' to be '<button class="chat  fresh" title="di…'` (no sup87 row on main). The two O1 cases that pass on main are the negative ones (People panel has neither; group absent with no such thread), which hold on main by construction.
- O2: `AssertionError: expected null to deeply equal [ '*sup87' ]` at `others(render([mine], "sup87"))`, a `renderToStaticMarkup` first render with no effects. Its second case (`unlistedLanding` keeps sup87) passes on main: it pins leftovers-46's landing, unchanged.
- O3: both cases `TypeError: othersOf is not a function`; the shown case also asserts `others(render([mine], "sup87"))` is `["*sup87"]`, which fails on main.

Test run (X0): `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` from the clean clone: **reused** run e06bdf48-90594 of 09c5d114ca77 (o47-ui, 2026-10-23T20:29:16), exit 0: Go 19 packages ok, vitest 79 files / 1033 tests passed (roster seats, needs me and `unlistedLanding` suites included). `test-lease run -- pnpm run build` exit 0; `test-lease run -- wails build` exit 0; `git status --porcelain` empty (wailsjs/runtime untouched).

Words: `Others` sub-label, `chats-label sub` like `People`, rows titled `direct with <name>` and drawn byte-equal to a seat's row (O1 compares them), no health words, none in the People panel: matches FR-7 to FR-9 and review-view Amendment 12 string by string.

- Note: O3's leave-while-another-is-shown is proved on `othersOf` with a kept `seen` across calls; its one render assertion (`others(render([mine], "ru-build"))` null) also passes on main. The component's single `othersOf(all, human, seats, focus, ref)` call is covered by O1/O2 renders, so the row is met; a re-render test needs a DOM vitest does not have here. To the FSE (gate wording).
- Note: the new-thread picker lists only the roster, so `+` in an Other's chat cannot address it (the builder's own note). Outside FR-7 to FR-9. To the FSE.
- Routing of the UI review's findings (written there "for aglaea", none sev 4/3): UO1 (2), UO2 (1) and its two spec gaps go to the FSE, which takes them to aglaea for an amendment.

Reviewer o47-review, 2026-10-23.

## UI review
o47-ui, 2026-10-23. Every row checked on **09c5d11**; the branch did not move. **Verdict: pass.** No finding of severity 4 or 3 against leftovers-47 FR-7 to FR-9 or review-view Amendment 12 (R41, R30). Evidence is in `.wt-notes/o47-ui/out/`: harness logs `h-1024x640.txt` and `h-1440x900.txt`, shots `wk-*.png` and `rb-*.png`, AX dumps `rb-ax-*.txt`, `driver-dev.log`, `killed.txt`.

Shared test run: **fresh**, run `e06bdf48-90594` of 09c5d114ca77 (exit 0; Go ok, vitest 79 files / 1033 tests, `x0-make-test-2.txt`). o47-review reused it. My first attempt timed out in the queue (exit 75) and ran nothing.

No mailbox, no editor. Each fixture was `--review --canned-post` and `auth: off`, with one `discuss_state_dir:` under its own temp dir (`*-config-check.txt`). The probe was stubbed, and `editor:` was a logging stub that was never pressed (`editor-calls.txt` was never written). The two asks went only to the fixture's `posts.jsonl` (`to: sup10`).

Setup: the fixture has no one outside the roster with a direct thread. I used `sup10`, the supervisor in the canned health, which reads **capped** there, so a health word would have shown if one leaked. A driver added and removed one open `pablo`↔`sup10` thread in the temp `health.json`. The temp copy of `rv-fixture` got `next: "sup10 reviews the change"`, so the review asks sup10 (canned `canned-1`, never in the feed).

How each state was checked:
- **WKWebView, Tab harness** (as-ui's `tabharness.swift`, read first, unchanged). It ran offscreen with `isKey`, under `harness.lock`, against my own `wails dev -devserver localhost:34265` from a clean clone of 09c5d11, with a fresh fixture at each size. Both sizes read the same.
  - **O1 / FR-7**:
    - With no thread there is no `Others`.
    - With the thread, the list reads `People`: fse, po_ana, dev_bruno, then `Others`: `@ sup10 1`, then `More`.
    - The `Others` label's computed style equals `People`'s: 11px, rgb(149,142,162), uppercase, .44px, margin 10/4/6/8.
    - The sup10 row has the seat row's metrics (12px, pad 6/8, radius 8, h28, h30 with the fresh badge) and the title `direct with sup10`.
    - No health word appears in its text, title or name. The People panel (open at 1440) lists pablo, fse, po_ana, dev_bruno, not sup10.
    - Tab from channel goes fse → po_ana → dev_bruno → sup10 → journal → archive, with a 2px ring rgb(192,171,254) on each.
    - Return on sup10 opens `@ sup10`. Its row is the one `aria-current="true"` in the list, and focus stays on it.
  - **O3 / FR-9**:
    - Thread closed while channel is shown: the row and the label go within one feed tick.
    - Closed while sup10 is shown: after 15 s the row stays, current. It leaves once channel is picked.
  - **R41 / FR-8**: I asked sup10 from Greet (`Ask sup10, next`; ask line `Saves the mark and asks sup10 (runs this card) in this review's thread. Wakes sup10.`), reopened Greet, and pressed `Open the thread`.
    - A MutationObserver and rAF recorder ran for 4 s and logged **one** state, from the first commit: `focus: sup10`, `Others` present, title `sup10`, `aria-current` and `.active` both on sup10 only. The fill rgba(138,63,252,.18) was on that row alone.
    - Focus was on `← Review`, and the one `aria-current="page"` is the crumb.
    - Tab from there goes back to the channel → People toggle → search → needs me → needs po_ana → channel → fse → po_ana → dev_bruno → **sup10** → journal → archive.
    - Picking channel removes the row and the group.
  - No horizontal scroll (1024/1024, 1440/1440).
- **Review build** (`make review-build` in my detached worktree, pid saved, AX and AXPress on that pid only, window 52445 shot with `screencapture -o -l`, screen unlocked; the note typed by AXValue on my pid):
  - At 1440×900: `OTHERS` / `sup10 1` after the seats (`rb-1440x900-O1-others.png`). AXPress opens it with the fill on sup10 alone, and the People panel holds no sup10 (`rb-1440x900-O1-opened.png`). Closed while shown, the row stays `.chat.active`; after channel it is gone (`rb-1440x900-O3-*.png`).
  - At 1024×640, R41: the row reads `Greet, modified, question, asked` and the panel `Asked sup10` + AXLink `Open the thread`. After the AXPress, `sup10` under `OTHERS` is the one `.chat.active`, the title is `@ sup10`, and AX focus is on `← Review` (`rb-1024x640-R41-landing-0s.png`, shot right after the press). After channel, no `OTHERS` and no sup10 (`rb-1024x640-R41-after-switch.png`).
- **Against lf46-review-words' UI review**: the seats' rows are now drawn by the same `personRow`, and their markup, order, counts and the 2px ring are unchanged at both sizes. needs me, needs po_ana, channel, journal and archive are unchanged. `Open the thread` still lands with one current row and focus on `← Review`, and `Asked <seat> · Open the thread` and `? asked` read as before. The fse landing itself was not re-run, since the fixture now points the card at sup10. It rides `unlistedLanding`, which is unchanged, and its suites passed in the run above.

Words, design vs screen:
- `Others` reads `Others` in the DOM, uppercased by the shared `.chats-label` rule like `People`. Same.
- The row is `@`, the name, the count, like a seat's. Same.
- `Asked <seat> · Open the thread` reads `Asked sup10 · Open the thread`. Same.
- `Ask <seat>` (next form) reads `Ask sup10, next`. Same.
- There is no health word on Others, as designed, and no People panel entry, as designed.

Findings (none of severity 4 or 3):
- **UO1 (2), for aglaea**:
  - What the person cannot do: see the current row at once at 1024×640. After `Open the thread` lands on sup10, the chat list's scroller shows `OTHERS` and only the top edge of the filled sup10 row at its bottom. The chat head `@ sup10` and the `with sup10` chip still say which chat is shown.
  - Where: `rb-1024x640-R41-landing-0s.png`.
  - Evidence: AX shows the row at y 742 of a list that ends near y 620 (window coordinates differ by the AX offset). At 1440 it is in view.
  - Severity: 2. Neither R41 nor FR-8 asks for it to be in view.
  - Proposal: a landing scrolls the current chat row into view (`nearest`), as `Reviewed, next` does for the worklist.
- **UO2 (1), for aglaea, not this card**:
  - What happens: `.chat.active`'s fill rides the global `button` background transition (global.css:22, 356). In a window that draws no frames (the offscreen harness, or an occluded review window) the fill stays on the previous row after a click between chats, while the class and `aria-current` have moved.
  - Where: harness `O1_opened` (fill on channel, current on sup10); `rb-1024x640-O1-others.png` (channel active, no fill).
  - Evidence: computed style and class disagree, the same for seats on main. The landing (a mount) always agreed in both engines.
  - Severity: 1.
  - Proposal: the design system already says "the dim lands at once, no transition" for disabled. The same could hold for the current-row fill.

Spec gaps (for the FSE):
- The fixture has no name outside the roster with a direct thread, and no card whose `next` names a supervisor. R41 needed a hand-edited temp `health.json` and card. A `--review` overlay with one open `pablo`↔`sup10` thread would make R41 reachable as written.
- The builder's note stands: the new-thread picker lists only the roster.

For aglaea: UO1, UO2.

Not verified in WKWebView:
- The People panel at 1024. It is closed by default in compact, and I did not open it there; at 1440 it was checked in both engines.
- A real thread with sup10 that has messages: the canned feed carries no messages, so the timeline read `opening…`. That is outside FR-7 to FR-9.
- A live mailbox: none, by rule.
