# Home at every width Pablo works at

status: proposed
owner: pablo
by: aglaea, 2026-09-29, for the FSE (thread 01M3QYJ7GKBX6H175TPJF6WPGM)
rulings it rests on: 0059 ("1024 is real"); 0033 twenty-at-a-glance (G9);
0038 (header, scroll); 0060 ("you")

## The problem, in the lead's terms

Pablo, 0059: "Can we have kinda responsive? In my case I have a wide monitor
buy I also work at the laptop screen 14 inches." (`said`)

Measured on main `6aac168`, `scripts/fixture-home.sh --twenty` (twenty
initiatives, five Needs me rows), in Chrome; screenshots in
`responsive-shots/`:

| window | what the lead sees | shot |
|---|---|---|
| **3440×1440**, his ultrawide (this machine's main display) | Home stops at 1240 px (`shell.css:63`, `.home { max-width: 1240px }`), so about 1,900 px of the screen stay empty to the right, and goals are **still cut** at about 25 characters (the goal cell is 192 px). Rows fit vertically, but Needs me sits above the list, not beside it | `home-3440.png` |
| **1512×945**, the 14-inch laptop at full screen (macOS default "looks like" 1512×982) | today's one-line table; 14 of 20 initiatives in view, goals cut | `home-1512.png` |
| **1024×640**, the laptop with a terminal beside the app (the window's minimum) | the rail keeps 235 px; Needs me's five rows take 60% of the height; each initiative row is two lines (lead-side-fixes FR-2), so **2½ initiatives** show | `home-1024.png` |

So both ends fail the glance the app exists for: under a minute, which of 20
execute, are in discovery, wait on business, or wait on you (twenty-at-a-glance
G9). On the laptop they are not on screen. On the wide monitor they are, but
cut, and with the space beside them empty.

## Worth it?

Yes, for **Home, the rule box and the rail**, and not yet for the six
sub-views. Home is the screen he opens first on both machines, and its
failures are measured above. The change is layout only: no backend, no new
data. The app already switches Home's rows to two lines through a
ResizeObserver (`Home.tsx:207-233`), so one mechanism exists to extend.

Not worth it now: the sub-views (Work's five columns do fine from 1280 up;
the others cap at 1240 and read well), any width under the 1024 minimum,
and touch or mobile.

## Three widths

The class follows the **window** width, because the rail's own state depends
on it. Widths inside a class adapt fluidly, as today.

| class | window width | who is there |
|---|---|---|
| **compact** | < 1280 | the laptop with something beside the app |
| **regular** | 1280 – 1919 | the laptop full screen; a half of the ultrawide (1720) |
| **wide** | ≥ 1920 | the ultrawide, or any window over 1920 on it |

## What each class shows

### Compact (< 1280)

- **Rail:** it starts **collapsed** to the 46 px strip of ranks and marks.
  If the lead expands it, that choice wins and is remembered per machine, as
  `railCollapsed` is today. The hover keeps naming each initiative.
- **Needs me:** every row stays; nothing is hidden, since it is the lead's
  queue. Each row is **one line**: the reason lozenge, `initiative number ·
  subject`, the age and the verb. The context line (owner, raised, options)
  moves into the row's hover and into what the verb opens.
- **Initiative rows:** **one line** again: rank, id (never cut: FR-2's rule
  stands), state (icon and word), phase (icon and word), the stage as `2/4`,
  signals (they may wrap), and the chevron. The goal and next date leave the
  row and appear in its chevron's detail and in the id's hover. "No goal
  yet" moves there too.
- **Rule box:** a sheet centred over Home, capped at the window height minus
  the top bar. The record scrolls inside it; the options, the words, Rule
  and Cancel always stay in view (triage row 4).

### Regular (1280 – 1919)

As built today, with the rule box capped at the window height, as in
compact. At the top of the class (1720, half of the ultrawide) the 1240
cap lifts to **1480**, and the goal column takes the extra room.

### Wide (≥ 1920)

- **Two columns:** the initiatives on the left, **Needs me on the right**
  as its own column (about 520 px wide), which scrolls on its own and stays
  put while the list scrolls.
- **The list** is capped so a row stays readable in one sweep: 1,600 px for
  the list, plus 520 for Needs me and the gap, about 2,200 px together.
  Space beyond that stays empty, starting at the rail; a 3,440-px row is
  harder to read than a 1,600-px one.
- **The goal column** takes the extra width, so goals show whole up to about
  70 characters, and signals do not wrap.
- **Rule box:** it opens **inside the Needs me column**, under its row, at
  the column's width, and capped at the column's height. The initiative
  list stays in view while the lead rules.
- **Empty Needs me:** the column stays, with one line, "Nothing waits on
  you", so the list does not jump when the last row leaves.

### Every class

- The initiative header, tabs and sub-views are unchanged, apart from the
  rail following its class.
- Crossing a class while resizing keeps the open rule box, what is typed in
  it, and the scroll position of each column.
- Nothing is shown by colour alone at any width (principle 4). Where a word
  moves into a hover, the icon stays, and the word stays in the accessible
  name.

## Acceptance, in the lead's terms

| # | Given / when | Then |
|---|---|---|
| A1 | 1024×640, `--twenty`, five Needs me rows, first open on this machine | The rail is the strip. Every Needs me row is one line. At least **six** initiative rows show without scrolling, each with its whole id, its state in words and its phase in words |
| A2 | the same, the lead expands the rail and reopens the app | The rail opens expanded: his choice is kept |
| A3 | 1512×945 | As today, one line per initiative; no id cut |
| A4 | 3440×1440 | Needs me and **all twenty** initiatives are on screen at once without scrolling. Every fixture goal shows whole. Nothing stretches past about 2,200 px |
| A5 | 3440×1440, the lead opens Rule on a Needs me row | The box opens in the Needs me column. All twenty initiatives stay in view. Rule and Cancel are in view without scrolling the page |
| A6 | 1024×640, Rule opened on the longest fixture record | Rule and Cancel are in view without scrolling; the record scrolls inside the box |
| A7 | any class, the rule box is open with words typed, and the window is resized across a class | The box, the words and each column's scroll position survive |
| A8 | a reviewer who did not build it answers G9's four questions, timed: at 3440×1440 from one screenshot; at 1024×640 and 1512×945 from Home as the lead sees it, scrolling allowed (amended by 0065, the FSE, 2026-09-29) | All four answers right, each under a minute |

## Out of scope

The six sub-views; widths under 1024; touch; any change to what Home
contains. The three classes are in `docs/design-system.md`, Widths
(added with Amendment 1).

## Open, for Pablo

- Ruled by 0062: left from the rail.

## Amendment 1 — Aglaea, 2026-09-29, after the card's UI review

The UI review of `responsive-home` (`working-on/responsive-home.md`,
898cd78, U1–U9) found gaps in this design. U3 is my own error: I called
regular "as built" without measuring it below 1440. Each finding below gets
its design answer; the FSE decides the cards.

| UI review | Sev | Answer |
|---|---|---|
| U3: at 1280 the expanded rail leaves 7 rows, goals about 15 characters and stages 3; at 1279 compact shows 12 | 3 | **Compact runs up to 1439; regular starts at 1440.** Compact's rail default (the strip) and one-line rows hold through the laptop's window sizes below 1440. The 14-inch laptop at full screen (1512) and half the ultrawide (1720) stay regular. Where A1 says "1024×640" it now reads "any width under 1440" |
| U1: Tab leaves the open rule box onto controls it covers; one Enter can lose the ruling | 3 | **One focus model in every class.** While a rule box is open, Tab and Shift+Tab loop inside it; Escape and Cancel close it and return focus to its Rule (the same answer as `initiative-header.md`, UI2). In compact, the sheet also gets a scrim over what it covers (answers U8), and the rows' Rule verbs are behind the scrim |
| U2: opening another row's Rule throws away the words typed in the first | 2 | **One draft per record** until Rule or Cancel. Opening another row's Rule closes the first box and keeps its words; reopening it restores them. Only Cancel discards |
| U4: compact with the rail expanded shows 5 rows; signals wrap to 2–3 lines | 2 | In compact, signals never wrap: they show on one line with a "+N" for the rest, and the rest go into the row's hover and accessible name. The floor for A2 (rail expanded) is at least five rows at 1024×640 |
| U5: twenty chevrons are named "repos, problems and actions" | 2 | Conformance (Focus and names): "Details for auth-gateway: goal, next date, repos", as the name and as the hover |
| U6: in wide, a Needs me row's context is cut with no hover | 1 | The row's hover (`title`) carries the full context line in every class, not only compact |
| U7: in wide, Tab goes rail, then Needs me (right), then the list (left) | 1 | Kept on purpose: Needs me is the priority. Written into the design system's Widths section |
| U8: the compact sheet has no scrim and cuts through its row | 1 | The scrim of U1 |
| U9: the rail toggle has no `aria-expanded` | 1 | Conformance (Focus and names, disclosure state) |
| gap: in wide, a rule box on the last Needs me row grows the column (at 1920×1080 with eight rows) | — | The box is capped at the column's height, and the column scrolls to keep the whole box in view |

## Technical notes

In the build spec, `docs/specs/responsive-home.md` ("Technical notes"),
with requirements FR-1 to FR-6, gate G1 to G8 (A1 to A8) and card
`responsive-home` (FSE, 2026-09-29). The open point is record 0062.
