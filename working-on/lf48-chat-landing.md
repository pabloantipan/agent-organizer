---
title: "A landing shows its chat row, state fills do not ease, the new-thread picker reaches Others, and the fixture has a chat with a supervisor"
status: next
repos: [organizer]
branch: lf48-chat-landing
seat: l48-build
reviewer: l48-review, l48-ui
stage: review-map
updated: 2026-10-24
next: "review: l48-review and l48-ui on e559f4d (sup90)"
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
