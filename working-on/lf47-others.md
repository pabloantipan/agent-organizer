---
title: "Conversations lists a chat with someone outside the roster under Others, and lands on it at once"
status: next
repos: [organizer]
branch: lf47-others
seat: o47-build
reviewer: o47-review, o47-ui
stage: review-map
updated: 2026-10-23
next: "review: lf47-others, O1-O3 and X0 pass, 09c5d11"
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

Reviewer o47-review, 2026-10-23.
