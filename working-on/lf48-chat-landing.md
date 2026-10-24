---
title: "A landing shows its chat row, state fills do not ease, the new-thread picker reaches Others, and the fixture has a chat with a supervisor"
status: next
repos: [organizer]
branch: lf48-chat-landing
seat: l48-build
reviewer: l48-review, l48-ui
stage: review-map
updated: 2026-10-24
next: "l48-build: fix review F1 (L1 test drives a landing through Conversation) and F2 (FR-2 opt-outs for .seg button.on, .week-list button[aria-current], .subtabs button.on, .place-tab.on, .gear.on in global.css) (sup90)"
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
- modified `frontend/src/styles/global.css`: state fills switch with no transition on and off, hover keeps its ease in; opted out: `.chat.active`, `button.person.active`, `.strip-all.active`, `.strip-item.active`, `.tiny-btn[aria-pressed="true"]` (FR-2)
- added `frontend/src/components/Conversation.tsx:rowReveal`: scrolls the chat list's current row into view, nearest and instant, on a landing; a pick in the list scrolls nothing (FR-1)
- modified `frontend/src/components/Conversation.tsx:Conversation`: a layout effect on the current chat calls `rowReveal`; list rows mark their pick (`listPick`, `reveal.click`); both new-thread forms get `others` (FR-1, FR-3)
- modified `frontend/src/components/Conversation.tsx:NewThread`: `others` prop, an `Others` optgroup after the roster, none when empty (FR-3)
- modified `frontend/src/components/Conversation.tsx:shownSeats`: an addressee under Others is not appended to the roster (FR-3)
- added `frontend/src/components/Conversation.landing.test.tsx`: gate rows L1-L3
- modified `scripts/fixture-home.sh`: `--review` adds one open pablo/sup10 direct thread to the canned health (FR-4)
Risky:
- `global.css`: on the opted-out controls hover now eases in and leaves at once; an old row that is hovered while a landing moves the mark eases from the fill to the hover colour
- `rowReveal`: scrolls on mount too, so opening Conversations with a seat focused scrolls its row into view (nearest: no-op when visible)
Not changed, on purpose:
- `testdata/fixture-health.json`: the script adds the thread
- `frontend/src/components/Conversation.tsx:ReplyBox`, `RuleBox`: FR-3 names only NewThread's picker
- other stylesheets' selected fills (`shell.css`, `roles.css`, `overview.css`, `work.css`, `.rail-item`): not on the global button transition, outside the boundary

## Done
- 2026-10-24 l48-build: FR-1 to FR-4 on `lf48-chat-landing` (dee2e79, 5d1bbdc, e559f4d); L1-L4 fail on main and pass on the branch; X0 passes from a clean clone (`.wt-notes/l48-build/progress.md`)

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
- other stylesheets' selected fills (`shell.css`, `roles.css`, `overview.css`, `work.css`, `.rail-item`): not on the global button transition, outside the boundary

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
