# Leftovers 10: drafts-and-slack's findings: the build spec

status: proposed (0084)
by: the FSE, 2026-10-04, on main
design: sup36's UI review (working-on/done/drafts-and-slack.md), Aglaea's
calls on U2 and U3 (feeb8d6, thread 01M445KCDF7VCPVAM81X56YYPW), and the
design system as amended (Widths: any column gives slack; Focus and names;
Principles: dates in words, his words verbatim).

## Problem

Two severity 2 design calls and four DS-conformance rows from
drafts-and-slack's review. U2 is the one that can do harm: one new-thread
draft per initiative means a draft started in one chat is sent from another,
so "Start" can wake the wrong seat.

## Requirements, card `drafts-per-chat`

After roles-ui (both change `Home.tsx` and `lib/width.ts`).

- **FR-1** (U2, sev 2) A new thread's draft is keyed by its chat and keeps
  its addressee; starting it from another chat is impossible.
- **FR-2** (U3, sev 2) A collapsed To rule line shows `· draft` when its
  record holds a draft.
- **FR-3** (U1, sev 2) Any column, flexible or fixed, gives its slack to cut
  cells before a cell is cut (`shareRoom`): at a 1512 window with the rail
  as a strip, init-a's signals whole while the Stage column has room.
- **FR-4** (U4, sev 1) The composer's kind and recipient selects and the
  chats' search have names.
- **FR-5** (U5, sev 1) Escape that ends an IME composition does not commit
  the marked character into the draft (`isComposing`).
- **FR-6** (U6, sev 1) Message times and Overview's ruled date read in words
  (`lib/dates.ts`).

## Acceptance → gate

Rows name window or content, the rail state and the scrollbar kind; UI review
in `make review-build`, pinned; visual rows hit-tested in both engines.

| # | FR | Check | Expected |
|---|---|---|---|
| T1 | 1 | start a new thread in seat A's chat, switch to seat B's chat, open new thread there, go back to A | B's form empty; A's draft and addressee restored; no post reaches B (a lib test over the draft keys, and the built app) |
| T2 | 2 | a record with a draft, its To rule line collapsed | `· draft` on the line |
| T3 | 3 | Home at a 1512×945 window, rail as a strip, classic and overlay, both engines | init-a's signals whole; a lib test that a flexible column's slack goes first to cut cells |
| T4 | 4, 5 | the names log over the composer selects and chat search; type with a Japanese or accented IME, Escape mid-composition | names present; the draft holds no marked character |
| T5 | 6 | a thread's message times; Overview's ruled record | words, not ISO |
| T0 | all | `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build` | pass |

## Boundary

`lib/drafts.ts`, `lib/width.ts`, `lib/dates.ts` and their tests,
`Conversation.tsx` and `SlackView.tsx` (drafts, names, times),
`DecisionsView.tsx` (the To rule line's draft mark), `Home.tsx` (shareRoom's
columns), `Overview.tsx` (the ruled date), `RuleDecisionBox.tsx` and
`CardDrawer.tsx` (the IME guard only). Not: Go, `docs/design-system.md`.

## Technical notes

- Held, not in this card: compact Home inherits `shell.css`'s base cap
  (rule-words-and-dates' note); it needs Aglaea's call first.
- Spec check (spec-craft 5b): drafts stay session-only (0081); files by
  grep (`shareRoom` in `lib/width.ts`, `lib/drafts.ts`). Result: holds.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `drafts-per-chat` | T1–T5, T0 | roles-ui | true |
