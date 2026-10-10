# Memory on this Mac

status: proposed
owner: pablo
by: aglaea, 2026-10-09, for the FSE (thread 01M4CK6VQ11WY8YJW9YWQ4C63T)
rulings it rests on: 0101 (scope, Pablo's words); 0088 and floating-icon
amendments 1-4 (the icon, its sizes, the mark); FR-14 (Needs me is the one
badge); the design system (red is blocked's alone, the magenta tone as
caution, never colour alone, Focus and names, Widths, layers)

Looked at: 0101, the top bar as built, and the floating icon's spec. No
reading exists yet, so this is designed from the data the OS gives (its
memory pressure levels and free memory) and from the agents scan.

## The problem, in the lead's terms

Pablo, 2026-10-07: "Due we're having heavy ram usage in other laptop, we
need a ram monitoring indicator for lease ram" (`said`). The other laptop
runs out of memory under agent load, and nothing tells him until the Mac
slows to a crawl, nor which session to stop.

## The jobs

1. Notice **before** it hurts that memory is tight on this Mac.
2. See **which agent sessions** hold the most, and get to them to stop one.
3. Be **warned** when it is critical, even with Deltagos on another
   desktop.

Deltagos shows and warns. It never stops a session by itself; Kill stays
on Agents, one click from here.

## The levels

The OS's own memory pressure, the levels Activity Monitor draws in its
graph, under plain words. Deltagos sets no thresholds of its own.

| OS level | Word | Colour |
|---|---|---|
| normal | `normal` | none: neutral text |
| warn | `high` | the magenta tone (caution) |
| critical | `critical` | the magenta tone, as a filled chip |

Red is not used, because red is blocked's alone (design system), and the
word always carries the level (principle 4).

## 1. The top bar indicator

It sits in the top bar's right cluster, right after `Usage` and before
Help: `… Needs me 3 · Rescan · Usage · ▣ 12 GB free · ? · ⚙` (amended
2026-10-09 to the bar as built; Rescan stays where it is). The glyph is a
memory chip outline at 16 px. **It is not a badge**: it carries no count
and no bubble. Needs me stays the one badge (FR-14).

| Level | Shows | Look |
|---|---|---|
| normal | `▣ 12 GB free` | `--fg-subtle`, as quiet as the version line |
| high | `▣ 3.1 GB free · high` | text and glyph in the magenta tone |
| critical | `▣ Memory critical · 1.2 GB free` | a chip: magenta fill, text and glyph in the ground's ink (`--fg-on-tone`, 5.2:1; white on the tone is 3.5:1 and fails), radius 6 |

- It is a button. Its name is `Memory: high, 3.1 GB free of 32 GB`, and its
  hover title is the same.
- **Pressing it opens a popover** (on click, not hover, so the keyboard
  reaches it; focus goes into it, and Escape returns focus to the button):

```
Memory · this Mac (lodestar)
Pressure  high, for 4 min
Free      3.1 GB of 32 GB
Agents    use 18.6 GB of the 28.9 GB in use
──────────────────────────────────────────
Biggest agent sessions
camp-probe-andrea      ccint-camp-monorepo   working   4.2 GB   Agents ›
organizer-probe-sup46  organizer             running   3.0 GB   Agents ›
probe-hefesto          —                     running   2.6 GB   Agents ›
… 2 more
──────────────────────────────────────────
Stop a session from its Agents row. Deltagos never stops one by itself.
```

- **The list**: the five biggest agent sessions by memory, counting each
  session's whole process tree (the agent and what it started). Each row
  shows its session name (mono), initiative (or `—` when it has none),
  state, memory, and `Agents ›`. That link lands on the initiative's Agents
  with the session's row focused, by the session's name; for a session with
  no initiative, Agents' unassigned group. `… N more` opens the rest.
- At normal, the popover holds the same content, with the pressure line
  reading `normal`.

## 2. The floating icon

The icon shows memory **only when it matters**, as a ring around its tile.
It is never a number, so it never becomes a second badge.

| Level | On the icon |
|---|---|
| normal | nothing |
| high | a 2 px magenta ring outside the tile, 2 px from its edge |
| critical | the same ring at 3 px, breathing in opacity from 1 to 0.5 over 1.6 s |

- The ring sits outside the tile, so it never touches the mark or its
  animation (floating-icon amendment 4). Under Reduce motion, critical's
  ring is a steady 3 px. The breathing is functional, not decorative: it is
  the one motion that means something.
- The icon's name adds the level: `Deltagos, memory high`.
- **The panel**: at high and critical, one line sits under the search
  field: `Memory high · 3.1 GB free` (critical: `Memory critical · 1.2 GB
  free`, in the chip). Under it are the three biggest sessions, one row
  each: name, memory, `Agents ›`. Choosing one opens Deltagos full on this
  desktop at that Agents row, as choosing an initiative does. At normal,
  nothing is shown and the panel is as before.

## 3. The warning at critical

A macOS notification, the system's own, with the default sound (he sets
that in System Settings):

- **Title**: `Memory critical on lodestar`
- **Body**: `1.2 GB free. Biggest: camp-probe-andrea 4.2 GB,
  organizer-probe-sup46 3.0 GB, probe-hefesto 2.6 GB.`
- **Clicking it** brings Deltagos full to the current desktop with the
  memory popover open, so the biggest sessions and their `Agents ›` are one
  click away.
- **How often**: once each time the pressure turns critical. A new
  notification needs the pressure to have left critical for at least 10
  minutes, and never comes sooner than 30 minutes after the last one, so a
  level flapping at the edge sends one, not twenty.
- Nothing is sent at high, and nothing when it goes back to normal.
- If notifications are off for Deltagos, the top bar and the icon still
  show critical. The popover adds one line: `Notifications are off for
  Deltagos in System Settings.`

## States

| State | Top bar | Icon | Popover |
|---|---|---|---|
| no reading yet (the first 10 s after launch) | `▣ —`, subtle | nothing | `Reading memory…` |
| reading failed | `▣ —`, title `memory unknown` | nothing | `Memory could not be read on this Mac.` |
| normal | `▣ 12 GB free`, subtle | nothing | pressure `normal` |
| high | `▣ 3.1 GB free · high`, magenta | 2 px ring | pressure `high, for 4 min`, the list |
| critical | the chip `Memory critical · 1.2 GB free` | 3 px ring, breathing | pressure `critical, for 1 min`, the list; the notification is sent once |
| back to normal | quiet again, at once | the ring goes | `normal`, plus `Was critical until 14:32` for the next 30 min |
| no agent sessions running | as its level | as its level | `No agent sessions running. Other apps hold the memory.` |
| Reduce motion | as above | no breathing; a steady 3 px ring at critical | as above |
| **1024** | the word moves into the name and hover: normal `▣ 12 GB`, high `▣ 3.1 GB` in magenta, critical keeps its chip as `▣ critical · 1.2 GB` | as above | the popover's width is capped at the window less 32 px, and the initiative column gives way first |

Nothing runs when the app is closed (0101): no reading, no ring, no
notification. That is the design, not a gap. The popover's pressure line
says `since Deltagos opened` when the reading is younger than the level's
duration would need.

## Acceptance, in the lead's terms

| # | The lead can | Checked by |
|---|---|---|
| M1 | see free memory quietly at normal | `▣ 12 GB free` in `--fg-subtle`, with no colour and no badge |
| M2 | notice high and critical without reading numbers | high in the magenta tone with the word `high`; critical as the filled chip with `Memory critical` |
| M3 | find the sessions holding memory | the popover lists the five biggest by memory, process trees counted, and `Agents ›` lands on the session's row, focused |
| M4 | see it from another desktop | the icon's ring at high (2 px) and critical (3 px, breathing; steady under Reduce motion); the panel's memory line and three sessions |
| M5 | be warned once at critical | one notification with the title, body and click as in §3; no repeat inside 30 min or while it flaps |
| M6 | trust that it never stops anything | no control in the popover, ring or notification stops a session |
| M7 | read it at 1024 | the short form with the word in the name; no horizontal scroll |
| M8 | use it by keyboard | Tab reaches the button, Enter opens the popover with focus inside, Escape returns focus to the button |

## Amendment 1 (2026-10-09, rv-review c4eafe3)

The critical chip's text is the ground's ink, `--fg-on-tone` (#1a1523 on
#d946ef, 5.2:1), not white (3.5:1, under 4.5 at 13 px). The fill stays the
tone. The same holds wherever text sits on a `--tone` fill (the panel's
memory line at critical).

## Amendment 2 (proposed, 2026-10-09): the ring always on, pressure in amber

Pablo, 2026-10-09, after the ring showed on the floating icon: "the border
pink brilliant arround the icon helped me a lot to find the app quickly.
So, not now, but keeping it and maybe using an orange tone when ram spikes
up, would be a good upgrade"; then, the same evening: "we can tell Aglaea
doing both" (`said`, relayed by the FSE). The ring is also how he finds the
icon on a busy desktop, so it stays at every level. Memory pressure moves to
a second hue. Orange needs no new colour: `--amber-9` (#ffb020) is already
the warning hue (`--warning`, the context bar past 50%). Red stays blocked's.

| Level | On the icon (§2 replaced) | Top bar (§1 amended) |
|---|---|---|
| normal | a 2 px ring in the tone (`--tone`), 2 px outside the tile: the one he saw | `▣ 12 GB free`, subtle, as before |
| high | the ring turns amber, 2 px | `▣ 3.1 GB free · high`, text and glyph in amber (9.8:1 on the ground) |
| critical | amber at 3 px, breathing in width to 4.5 px over 1.6 s at full opacity (amended, below); steady 3 px under Reduce motion | the chip: amber fill, text in the ground's ink (`--fg-on-warning`, 9.8:1) |
| no reading, or reading failed | the tone ring, as normal | `▣ —` as before |

- **One hue for pressure everywhere**: the top bar, the panel's memory line
  and the icon all use amber for high and critical, so the ring and the bar
  say the same thing. This replaces the magenta of §1, §2 and Amendment 1
  for memory only. The tone keeps every other use.
- **A 1 px keyline in the ground** (#1a1523) sits just outside the ring, at
  every level. Amber on a white wallpaper is 1.8:1 and the tone 3.5:1. The
  dark keyline holds both rings against any wallpaper (17.9:1 on white).
- **Never colour alone**: the ring's width (2, then 3 px) and the breathing
  carry the level, and the icon's name keeps the word (`Deltagos, memory
  high`). Under Reduce motion, critical is the steady 3 px ring.
- **Not a badge**: the ring carries no number and no count, so FR-14 holds.
- **Amber is not red**: the amber and blocked's red stay apart for colour
  vision (deutan and protan both keep amber far lighter than #ff4d63).
  Amber's other use, context past 50%, is the same meaning: a resource
  running low.

| # | The lead can | Checked by |
|---|---|---|
| M9 | find the icon at any level | at normal the 2 px tone ring with its dark keyline shows on a light and a dark wallpaper |
| M10 | tell memory pressure from findability | high: an amber 2 px ring; critical: amber 3 px, breathing (steady under Reduce motion); the top bar's high text and critical chip are amber with the ground's ink |

Rows M2 and M4 read "amber" for "the magenta tone" once this is accepted.

**Amended 2026-10-09 (ram-ring-amber UI review, A1)**: critical breathes in
**width, not opacity**. The ring stays at full opacity and swells from 3 to
4.5 px and back over 1.6 s, with the 1 px ground keyline following its
outer edge at full opacity. At opacity 0.5, amber on a white wallpaper
faded to almost nothing (1.8:1 at full, less at half). Under Reduce motion
it is a steady 3 px ring. The M10 row reads "3 to 4.5 px, breathing in
width".

**Amended 2026-10-10 (lf15-ring-breath A1)**: the swell is **3 to 6 px**,
not 4.5. A 1.5 px change on a 56 to 88 pt icon is visible when looked at,
but too small to pull the eye from the edge of a 3440 ultrawide, where the
opacity breath did. Doubling the width is the change peripheral vision
catches. It stays at full opacity, with the keyline following it. Whether it
pulls the eye is Pablo's look in use, not a gate row. The gate's frames read
3 and 6 px.

## Open questions

- **O1** (FSE): "memory" per session means its process tree's resident
  memory. Say if the OS gives a better per-tree figure (footprint).
- **O2** (Pablo, only if the FSE wants it confirmed): critical drawn in
  magenta, not red (Amendment 2 proposes amber). Red is blocked's, and Activity Monitor's red would make
  the two read alike.

## Technical notes

The FSE, 2026-10-09: build spec `docs/specs/ram-indicator.md`, cards
`ram-sample` and `ram-view`, accept record 0103. O1: footprint
(`proc_pid_rusage`), summed over the tree, resident size only where
footprint cannot be read. O2: put to Pablo inside 0103.
