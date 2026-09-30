# Ranked: header-fold's and responsive-home-2's leftovers

- **Asked by:** the FSE, thread 01M3RCXDRAHWDQSD34QPZ97Y3X (restated after
  the restart).
- **Sources:** `working-on/done/header-fold.md`, UI reviews 1–3 (U1–U10 and
  the spec gaps); `working-on/done/responsive-home-2.md`, UI review (R1–R5
  and its gaps). Cited as `hf-U1`, `hf-gap5` and `rh2-R1`.
- **Already fixed:** hf-U8 and hf-U9 (UI review 3, pass). hf-U3's words are
  answered by 0068. The rest of hf-U3 is still open: nothing shows the
  stage and the tiles are buttons.
- **Design system, amended in the same commit:** Widths (wide from 2200;
  signals never wrap in any class; what gives way comes back when it fits;
  a scrim in regular); a 24 px minimum target; the focus ring at an offset
  on accent-drawn elements; the stage word is always "now"; stage runs sized
  by their count; stage buttons look like buttons. With these, several rows
  are conformance.
- **None needs Pablo's word.** Two rows change an accepted spec. Row 2
  (the landing) settles a disagreement between the build spec's technical
  note and my design. Row 5 moves wide's threshold, which responsive-home
  set at 1920. Both go in the batch's accept record.

## The list, ranked

Kinds, as in the last triage: **DS** means conformance to
`docs/design-system.md` (spec it as written); **Design** means my call,
proposed here; **Fixture** is not a UI change.

| # | What the lead cannot do, or does wrong | From | Sev | Kind | Direction |
|---|---|---|---|---|---|
| 1 | With Details open on the laptop (1024×640), the sub-view gets about 129 px, less than before the fold | hf-U4, hf-gap3 | 2 | Design | At compact, the open header is capped at 40% of the window and scrolls inside itself. Its two clamps and the strip stay; nothing else changes |
| 2 | After a landing folds the header, the next tab he presses springs it back open (466 of 640 px) | hf-U2, hf-gap1 | 2 | Design | The design stands: **a landing writes "folded"** as his choice, until he opens Details again. The build spec's technical note (fold in memory only) gives way. It is one line in the store |
| 3 | A first-time reader does not see that the folded bar's stage and the tiles open anything (`simulated`: one blind reader) | hf-U3 (second half) | 2 | DS | Stage stepper, as amended: `cursor: pointer`, the hover surface, and a chevron on hover and focus, on the bar's stage and on every tile |
| 4 | From 1280 to 1439, Home hides goals and next dates while about 480 px of the row stay empty | rh2-R2 | 2 | DS | Widths, as amended: a column gives way only when it does not fit. Compact keeps the goal column while it can show about 30 characters. The measure is the row, as the narrow mode's ResizeObserver already does, not the class name |
| 5 | At 1920 with the rail expanded, a waiting lozenge is clipped mid-name ("carla, rodri") and goals show 22 characters | rh2-R1 | 2 | DS | Two parts. The ellipsis goes on the lozenge's text span, not its flex box (a bug). **Wide starts at 2200**, so 1920 and 2199 get regular's single column with goals |
| 6 | At 1440, busy rows wrap their signals again, and fewer initiatives show | rh2-R3 | 2 | DS | Widths, as amended: signals never wrap in any class ("+N", the rest in the hover and the name) |
| 7 | "Open in Decisions" on a ruled record, from Overview, opens Decisions with nothing shown | hf-U10 | 2 | DS | Focus and names (navigating lands on the thing named): call `openDecision` for every record |
| 8 | The card back opens with focus left on the Open behind it | hf-gap5 | 2 | DS | Focus and names (opening inline): focus moves to the card back's title, and back to its opener on close |
| 9 | After Answer, the next Tab stops on the thread divider's icon buttons, which have no name | hf-gap5 | 2 | DS | Focus and names (Names): each icon button named by its action and thread ("Reopen w-queued", "Escalate w-queued") |
| 10 | On Agents, the initiative's id and client still sit under the tabs, in the crew group's head | hf-U5, hf-gap4 | 2 | Design | Yes, it counts as a title row (§6). With one initiative selected, the group head drops the id and client, and its counts and New agent move to the toolbar line. The all-initiatives view keeps them |
| 11 | On the laptop the folded bar drops the target date while the cut goal keeps 472 px | hf-U1 | 2 | Design | As the header design's §1 already says: the goal gives way first, then the target. The build has it the other way round |
| 12 | In regular, the open rule box covers other rows' verbs, and a click on them lands on the box | rh2-R4 | 1 | DS | Widths, as amended: in regular, a box over other rows' controls has a scrim over them |
| 13 | The rail toggle is 20 px wide | rh2-R5 | 1 | DS | Controls, as amended: 24×24 minimum |
| 14 | Keyboard focus is hard to see on the current stage tile (an accent ring on an accent border) | hf-U6 | 1 | DS | CSS rules, as amended: the ring at a 2px offset on accent-drawn elements |
| 15 | Words and names: every "more" is named "more"; Open in editor does not say which file; the Roadmap row says "current" where the tile says "now"; at compact a one-stage discovery run takes half the strip; `dec-line` has no `aria-expanded` | hf-U7, hf-gap5 | 1 | DS | "Goal, more", "Measure, more", "Scope in, more"; "Open initiative.yaml in editor"; "now" everywhere (Stage stepper); runs sized by their count; `aria-expanded` on `dec-line` (Focus and names, disclosure state) |

## Fixture

| # | Gap | From | Direction |
|---|---|---|---|
| V1 | No fixture initiative has several records all owned by the lead, so "N decisions waiting on you" with N > 1 was never drawn | hf-gap (review 2) | Add a second lead-owned proposed record to init-drafted, or a new fixture initiative |

## How the batch could split

Rows 1–2 and 10–11 are the header and fit one card (the header-fold
follow-up). Rows 4–6 and 12–13 are Widths and fit one Home card. Rows 3,
7–9 and 14–15 are small focus, name and word fixes across components, and
fold into either card. V1 goes with the header card, since that is where
the chip is checked.
