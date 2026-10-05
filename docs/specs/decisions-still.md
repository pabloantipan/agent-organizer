# Decisions holds still: the build spec

status: proposed (0086)
by: the FSE, from Pablo's report, 2026-10-05: "this view 'vibrates' kinda
rendering doesn't work properly" (screenshot: Decisions, organizer, To rule
open, record 0085 expanded with its stuck head and Rule, at about 1245 px
wide, the installed app v0.2.0-1047).

## Problem

The Decisions sub-view moves by itself while the operator reads a record:
something on the page re-renders or re-lays out in a loop. The cause is not
known. Candidates the code shows, none verified: the stuck record head
(decisions-view Amendment 1 and leftovers-8 FR-2: the facts line joins the
head while ruling), the scroll-edge observers (`lib/useScrollEdges.ts`, on
the record body and its code blocks), and the body re-render on the periodic
refresh (leftovers-4 FR-9 kept the DOM only when the HTML is unchanged).

## Requirements, card `decisions-still`

- **FR-1** Measure first, in the built app and in Chromium, and record the
  cause on the card: what moves, how often, and which code moves it.
- **FR-2** With no input from the operator, nothing on Decisions moves: no
  layout shift, no change of an element's box, no class toggling, at any
  scroll position, with a record expanded, stuck, and with Rule open.
- FR-2 clarified 2026-10-05 (dst-ui G3): marks driven by the clock (the
  today line, `now`) move with time and are not motion in FR-2's sense.
- **FR-3** The stuck head, the scroll edges and the refresh keep doing what
  their specs say (no behaviour removed to stop the motion).

## Acceptance → gate

| # | FR | Check | Expected |
|---|---|---|---|
| W1 | 1 | the cause, measured in both engines, written on the card with the files and lines | present |
| W2 | 2 | Decisions on the organizer's records, windows 1245×932 and 1024×640, rail expanded and as a strip, classic and overlay: a waiting record expanded; scrolled so its head is stuck; then Rule open. In each, 30 s with no input, recording `layout-shift` entries and the record head's and body's bounding boxes every 100 ms, across at least two agents-feed refreshes | zero layout shifts; every box constant; both engines |
| W3 | 3 | leftovers-8 Q2, decisions-view B12-B13, leftovers-4 L12 rerun | still pass |
| W0 | all | `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build` | pass |

## Boundary

`DecisionsView.tsx`, `decisions.css`, `RuleDecisionBox.tsx`, `rule-box.css`,
`lib/useScrollEdges.ts` and `lib/` tests, `global.css` (`.markdown` rules
only). Not: Home, Conversations, Go, `docs/design-system.md`.

## Technical notes

- Disjoint from roles-and-needs-me-five's files: the two run in parallel.
- Spec check: the gate measures the reported symptom directly; W3 guards the
  features most likely involved. Result: holds.
