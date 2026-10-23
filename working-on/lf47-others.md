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
