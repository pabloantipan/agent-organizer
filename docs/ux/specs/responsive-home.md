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
| A8 | a reviewer who did not build it answers G9's four questions from one screenshot at each of 1024×640, 1512×945 and 3440×1440, timed | All four answers right, each under a minute |

## Out of scope

The six sub-views; widths under 1024; touch; any change to what Home
contains. Once this is accepted, I add a "Widths" section to
`docs/design-system.md` with these three classes, so later screens follow
them.

## Open, for Pablo

- The wide list's cap: 1,600 plus Needs me, left-aligned from the rail.
  The alternative is to centre the whole content in the ultrawide. I
  recommend left-aligned, so things do not move when the window is resized
  or snapped.

## Technical notes

(left for the FSE)
