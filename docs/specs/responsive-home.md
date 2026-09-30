# Home at every width Pablo works at: the build spec

status: accepted (0061, 2026-09-29); 0062 ruled
owner: pablo
decisions: [0033 ruled, 0059 ruled, 0060 ruled, 0061 ruled, 0062 ruled, 0065 ruled, 0067 ruled, 0069 proposed]
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

- **FR-7** (amendment 2, U3; the design's Amendment 1) The compact class
  shall run up to 1439 and regular shall start at 1440, changing FR-1's
  boundary. FR-2 holds through every window under 1440; 1512 and 1720 stay
  regular.
- **FR-8** (U1, U8) In compact, the rule-box sheet shall have a scrim over
  what it covers, with the rows' Rule verbs behind it. The focus loop inside
  the box is initiative-header FR-7 (rule-box-finish); this FR checks it
  holds in every class.
- **FR-9** (U2) Each record keeps one draft until Rule or Cancel. Opening
  another row's Rule closes the first box and keeps its words, reopening it
  restores them, and only Cancel discards.
- **FR-10** (U4) In compact, a row's signals shall stay on one line with
  "+N" for the rest. The rest go into the row's hover and accessible name.
- **FR-11** (U5, U6, U9) The chevron's name and hover shall read "Details for
  <id>: goal, next date, repos". A Needs me row's `title` carries its full
  context line in every class. The rail toggle carries `aria-expanded`.
- **FR-12** (the wide gap) In wide, the rule box shall be capped at the Needs
  me column's height, and the column scrolls to keep the whole box in view.

- Amendment 3 (proposed, 0069; Aglaea's ranking
  `docs/ux/reviews/2026-09-30-rank-header-fold-responsive-2.md`, "row n";
  the design system's Widths as amended in 3f3df2f):
- **FR-13** (row 5, rh2-R1) Wide shall start at 2200, changing FR-1's 1920
  (`WIDE_FROM`, `lib/width.ts`). From 1440 to 2199 Home is regular: one
  column, goals shown. FR-4 and FR-12 hold from 2200.
- **FR-14** (row 5) A lozenge that cannot fit shall be cut with an ellipsis
  on its text, never clipped mid-word by its box.
- **FR-15** (row 6, rh2-R3) In every class, a row's signals shall stay on
  one line with "+N", the rest in the hover and the accessible name
  (FR-10, extended from compact to all classes).
- **FR-16** (row 4, rh2-R2) A column shall give way only when the row has
  no room for it, measured on the row (the ResizeObserver Home already has),
  not by the class name. Compact keeps the goal column while it can show
  about 30 characters, and the next date while it fits; what gave way comes
  back when the row grows.
- **FR-17** (row 12, rh2-R4) In regular, an open rule box that covers other
  rows' controls shall have a scrim over them, as compact's sheet has
  (FR-8); a click there does not reach the covered verb.
- **FR-18** (row 13, rh2-R5) The rail toggle's target shall be at least
  24×24 px, expanded and as the strip.
- **FR-19** (rows 7–9, hf-U10 and hf-gap5; Focus and names in the design
  system; carried by this card, outside Home):
  - Overview's record rows open a record that is not waiting with
    `openDecision`, so Decisions shows it expanded and focused;
  - the card back moves focus to its title when it opens, and back to its
    opener when it closes;
  - the thread divider's icon buttons are named by action and thread
    ("Reopen <subject>", "Escalate <subject>", "Close <subject>").

## Acceptance → gate

| # | Design | Check | Expected |
|---|---|---|---|
| G1 | A1, A2 | 1024×640, `--twenty`, a fresh browser storage: screenshot; then expand the rail, reload, screenshot | as A1 (strip, one-line rows, at least six initiative rows, whole ids, state and phase in words), then as A2 |
| G2 | A3 | 1512×945 screenshot | as A3 |
| G3 | A4, A5 | 3440×1440 screenshots, before and with Rule open on a Needs me row | as A4 and A5 |
| G4 | A6 | 1024×640, Rule on the longest fixture record (the ui-leftovers roster record) | as A6 |
| G5 | A7 | a scripted resize across each class boundary with the rule box open and words typed; screenshots before and after | as A7 |
| G6 | FR-6 | a lib test for the owner list with the lead's own record; a Home screenshot | "you" for the lead, names for others |
| G7 | A8 (amended, 0065) | a reviewer who did not build it answers G9's four questions, timed, at each of the three sizes: at 3440×1440 from one screenshot; at 1024×640 and 1512×945 from Home as the lead sees it, scrolling allowed (a full-page capture, or the screenshots of one scroll), the time including the scroll | all four right at each size, each under a minute |
| G9 | 7 | 1280×800 and 1439×900: strip by default, one-line rows; 1440 and 1512: regular | screenshots | as stated |
| G10 | 8, 9 | compact: the sheet's scrim; Tab and Shift+Tab loop inside the box in each class; type words in one record's box, open another's Rule, reopen the first | screenshots; a focus log; the words restored | as stated |
| G11 | 10 | 1024×640, rail expanded, `--twenty`: no row's signals wrap; at least five rows in view; a "+N" row's hover and name list the rest | screenshot; the DOM | as stated |
| G12 | 11, 12 | the chevron's and the rail toggle's accessible names and state; a wide Needs me row's `title`; wide at 1920×1080 with eight rows, Rule on the last | a names log; screenshots | as stated |
| G13 | 13, 14 | `--twenty` at 1920×1080 and 2199×1200 with the rail expanded, and at 2200×1200 | screenshots; the class per size (regular, regular, wide); at 1920, every lozenge's text either whole or ending in an ellipsis (DOM: `text-overflow` on the text span) |
| G14 | 15 | `--twenty` at 1440×900, 1920×1080 and 3440×1440 | DOM: no row's signals take more than one line; a "+N" row's hover and name list the rest |
| G15 | 16 | `--twenty` at 1280×800 and 1439×900; a resize from 1024 to 1439 | screenshots and DOM: the goal column shown with at least 30 characters on each row at both sizes; it comes back during the resize |
| G16 | 17 | 1512×945, Rule open, the element at the centre of another row's Rule | DOM: the top element is the scrim |
| G17 | 18 | the rail toggle, expanded and as the strip | its bounding box ≥ 24×24 in both |
| G18 | 19 | Overview → Open in Decisions on a ruled record; open and close a card back; Answer, then Tab through the thread divider | screenshots; `activeElement` after each; a names log with every divider button named |
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
- **widths-and-focus card** (amendment 3: FR-13 to FR-19):
  - `frontend/src/components/Home.tsx`, `Rail.tsx`, `RuleDecisionBox.tsx`;
  - `frontend/src/lib/width.ts`, `lib/` and its tests;
  - `frontend/src/styles/home.css`, `rule-box.css`, `shell.css` (the
    rail's rules only);
  - FR-19 only: `Overview.tsx` (the record row's open), `CardDrawer.tsx`
    (focus on open and close), `Conversation.tsx` (the divider's icon
    button names);
  - `board.store.ts` only if the class boundary is read there.
  - Must not touch the header-fold-2 card's files (initiative-header,
    amendment 3), Go code, `docs/design-system.md`.
- **Must not touch** (the first two cards):
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
| `responsive-home-2` | G9–G12, G8 | responsive-home, rule-box-finish (both touch the rule box) | true |
| `widths-and-focus` | G13–G18, G8 | — (parallel with header-fold-2) | true |

## Amendments

- **1, 2026-09-29, 0065 ("scroll allowed under the minute"):** G7 at 1024 and
  1512 allows scrolling Home; one screenshot stays the rule at 3440. The
  first G7 contradicted A1 and A3 (twenty rows cannot fit 640 px); the
  FSE's error, found by resp-review (1a7cb88).
- **2, 2026-09-29, proposed (0067):** the design's Amendment 1 (Aglaea,
  836866a), from the card's UI review U1–U9: FR-7 to FR-12, G9 to G12, card
  `responsive-home-2`. Its boundary is the first card's, plus `Home.tsx`'s
  chevron names.
- **3, 2026-09-30, proposed (0069):** Aglaea's ranking of responsive-home-2's
  leftovers (rows 4–6, 12, 13) and three focus and name rows from
  header-fold (7–9), with the design system's Widths as amended (3f3df2f):
  FR-13 to FR-19, G13 to G18, card `widths-and-focus`. FR-13 moves wide
  from 1920 to 2200, which 0061 accepted at 1920.
