---
title: Accept the floating icon - its shape, and the badge, shortcut and Home row
status: ruled
raised: 2026-10-05
raised_by: fse
owner: pablo
ruled: 2026-10-05
ruled_by: pablo
options: ["v2 native panel; O1 no badge; O2 no shortcut for now; O3 Home row yes"]
chosen: "v2 native panel; O1 no badge; O2 no shortcut for now; O3 Home row yes"
cards: [floating-icon]
threads: [01M46K870W9YST0YV90F1S8GSE]
supersedes: []
superseded_by:
---

## Question

The spike (0089, in `done/`) proved your 0088 behaviour on today's Wails v2
with public APIs only: a native floating panel on every desktop, hidden on
full-screen ones by a check of its own, Deltagos brought to the current
desktop on click, and Compact to icon. Aglaea's design is
`docs/ux/specs/floating-icon.md`; the card is `floating-icon` (F1-F9, N1-N3).

**The shape:**
- **Wails v2 with a native icon panel** (the spike's way, recommended):
  about 250-300 lines of Objective-C. Costs: it leans on two Wails internals
  (the window's class name, its minimum size), the icon appears about 1.2 s
  after you switch desktop (after the slide, the floor with public API), and
  "pick nothing" sends the window home after the slide rather than with it.
- **A second webview window on v2:** keeps the main window at home; untried,
  would need its own spike.
- **Wails v3:** native panels and several windows built in; v3 is a beta
  and moving to it is a migration of the whole app.

**Aglaea's three questions:**
- **O1:** a Needs me count badge on the icon? 0088 made the animation
  decorative, so she left it out.
- **O2:** a global keyboard shortcut to open the list from anywhere?
- **O3:** keep a `Home` row at the top of the list (her addition), so the
  list also reaches your queue?

Your pointer takes are part of the gate again: a short by-hand script for
the drag and the click (the seats may not send real mouse events).

forecast: 1.5-3 h of wave time over 1 wave, plus your 2-minute pointer take
and this decision (median 0 d); basis: this initiative's single-wave tasks
and the spike (about 2 h of work).

## Options

As in the question; the FSE's recommendation for each is below.

## Recommendation

The FSE's: the v2 native panel; O1 no (keep 0088's decorative icon); O2 no
for now; O3 yes.

## Ruling

pablo, 2026-10-05, in the FSE session on lodestar, answering the FSE's form: shape "v2 native panel (Recommended)"; O1 "No (Recommended)"; O2 "Not now (Recommended)"; O3 "Yes (Recommended)".

## Consequences

On acceptance: the FSE amends the card to the chosen O1-O3 and starts one
supervisor for floating-icon.
