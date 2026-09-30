# Home at every width Pablo works at: the build spec

status: accepted (0061, 2026-09-29); 0062 ruled
owner: pablo
decisions: [0033 ruled, 0059 ruled, 0060 ruled, 0061 ruled, 0062 ruled]
design: `docs/ux/specs/responsive-home.md` (Aglaea, 3174fc2), "the design"
roadmap: fixes to stage 2 (twenty at a glance) at the widths Pablo uses; appetite one wave

## Problem

Pablo, 0059: "1024 is real … Can we have kinda responsive? In my case I have
a wide monitor buy I also work at the laptop screen 14 inches." The design
measured Home on main `6aac168` with `--twenty` (its table and screenshots
are the evidence; not repeated here):

- at 3440×1440, 1,900 px stay empty and goals are still cut;
- at 1024×640, 2½ initiatives show.

Both fail twenty-at-a-glance G9, which was timed at 1440 only. The design
chooses three width classes. This spec turns it into requirements, a gate
and one card, and adds 0060's "you".

**Appetite:** one wave, one card, after `ui-leftovers` (both touch
`Home.tsx`, the rule box and `Rail.tsx`).

## Goals

The design's acceptance, A1–A8: the glance holds at 1024×640, at 1512×945 and
at 3440×1440.

## Non-goals

As the design's "Out of scope": the six sub-views, widths under 1024, touch.
Nothing Home contains changes, except 0060's word.

## Requirements

- **FR-1** The app shall derive a width class from the window width:
  compact under 1280, regular from 1280 to 1919, wide from 1920. It
  re-derives on resize. One source for it (a store field or a hook), not a
  media query per component.
- **FR-2** (compact) Each item as the design's "Compact" section says:
  - **the rail** starts as the strip unless the lead's stored choice says
    otherwise (see the technical notes);
  - **Needs me rows** take one line each, their context in the hover and in
    what the verb opens;
  - **initiative rows** take one line each: the stage as `n/m`, the goal and
    the next date moved into the chevron's detail and the id's hover, and the
    id never cut (lead-side-fixes FR-2);
  - **the rule box** is a sheet capped at the window.
- **FR-3** (regular) As built, with the rule box capped at the window.
  From 1720, the `.home` cap (`shell.css:63`, 1240) becomes 1480, and the
  goal column takes the room.
- **FR-4** (wide) Each item as the design's "Wide" section says:
  - **Needs me** becomes a right column of about 520 px that scrolls on its
    own;
  - **the list** is capped at 1,600 px, and the whole is capped near
    2,200 px, starting at the rail with the empty space on the right
    (0062: left from the rail);
  - **goals** show whole up to about 70 characters;
  - **the rule box** opens inside the Needs me column, under its row;
  - **an empty Needs me** keeps its column, with "Nothing waits on you".
- **FR-5** (every class) Crossing a class shall keep the open rule box, its
  typed words and each column's scroll position. A word that moves into a
  hover keeps its icon and stays in the accessible name.
- **FR-6** (0060) In Home's waiting signal, the lead's own records shall read
  "you" ("1 waiting · you"). The lead is the cell's human, else pablo (the
  rule box's `leadOf`). Other owners keep their names.

## Acceptance → gate

| # | Design | Check | Expected |
|---|---|---|---|
| G1 | A1, A2 | 1024×640, `--twenty`, a fresh browser storage: screenshot; then expand the rail, reload, screenshot | as A1 (strip, one-line rows, at least six initiative rows, whole ids, state and phase in words), then as A2 |
| G2 | A3 | 1512×945 screenshot | as A3 |
| G3 | A4, A5 | 3440×1440 screenshots, before and with Rule open on a Needs me row | as A4 and A5 |
| G4 | A6 | 1024×640, Rule on the longest fixture record (the ui-leftovers roster record) | as A6 |
| G5 | A7 | a scripted resize across each class boundary with the rule box open and words typed; screenshots before and after | as A7 |
| G6 | FR-6 | a lib test for the owner list with the lead's own record; a Home screenshot | "you" for the lead, names for others |
| G7 | A8 | a reviewer who did not build it answers G9's four questions, timed, from one screenshot at each of the three sizes | all right, each under a minute |
| G8 | all | `XDG_DATA_HOME=$(mktemp -d) make test`; `cd frontend && npm run build`; the redesign's G18 grep | pass |

## Boundary

- **responsive-home card:**
  - `frontend/src/components/Home.tsx`, `RuleDecisionBox.tsx`, `Rail.tsx`,
    `App.tsx` or the shell component that lays out rail and main;
  - `frontend/src/stores/board.store.ts` (the width class; the rail's
    default);
  - `frontend/src/lib/` and its tests;
  - `frontend/src/styles/shell.css`, `home.css`, `rule-box.css`;
  - `docs/specs/twenty-at-a-glance.md` (G9's widths, one line).
- **Must not touch:**
  - the sub-views' components;
  - Go code;
  - `docs/design-system.md` (Aglaea adds "Widths" once accepted);
  - `~/.claude/skills`.

## Technical notes

- **The class.** Home already switches rows through a ResizeObserver
  (`Home.tsx:214-229`). The class is the window's width, not Home's, because
  the rail's default depends on it. It is one listener on `window`, and it
  sets a store field that Home, the rail and the rule box read.
- **The rail's default.** `railCollapsed` is read from localStorage key
  `rail.collapsed.strip` (`board.store.ts:117`), and it is `false` when
  absent. Compact's "starts as the strip" means: absent key and compact
  class, collapsed. A stored "0" or "1" always wins, and it is written only
  by the lead's toggle, never by the class.
- **Wide layout.** `.home` becomes a two-column grid in the wide class. Needs
  me's column is `position: sticky` with its own `overflow: auto`, so it
  scrolls on its own. It starts at the rail; the space past the cap stays empty on the right (0062).
- **The rule box in the wide class** renders inside the Needs me column,
  under its row, not in the page's overlay layer. FR-5 means the box's state
  must live above the layout switch: the open row's key and the typed words
  in the store or a parent, not in a component that unmounts on the class
  change.
- **Compact rows** reuse the existing one-line/two-line switch. Compact
  forces one line and moves the goal and next date into `InitiativeDetail`
  (the chevron) and the id's `title`.
- **Screenshots at 3440×1440** need a browser viewport of that size. Headless
  Chromium takes `--window-size=3440,1440`. The MCP browsers may be busy,
  and a private one is fine (sup18, sup19).
- **FR-6** reuses `leadOf`; no new rule for who "you" is.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `responsive-home` | G1–G8 | ui-leftovers | true |

## Amendments

- none yet
