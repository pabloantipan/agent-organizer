# Decisions sub-view: review

By aglaea, 2026-10-03, for the FSE (thread 01M417NHHRR2WP7XPY69XM438N).
**From Pablo's screenshot and the code, not from a run**: the screenshot
(organizer, Decisions, regular width, about 1400×1140) is of the real app
with the real 71 records, which no fixture has. Code: `DecisionsView.tsx`,
`styles/global.css:713-723` on main `65c190c`. Heights are estimated from the
screenshot's row pitch and the CSS, not measured in a browser.

## What Pablo said (`said`, 2026-10-03, relayed by the FSE)

"consider we need to be able to colapse Timeline view, also waiting for rulin
and ruled. Indeed, we need review ux in this view. Srolling down is a pain due
a LOT of stuff get stacked on. Also at top, cards with numbers makes no sense.
'median turnaround' in days no sense. Also, seccion heading text needs an
upgrade. Consider that factory human operator spend mayor time in this view"

## The jobs this view is for

Pablo says the operator spends most of his time here. From the view's own
code and the ruling flow (0019, 0045), the jobs are (`assumption` until he
confirms, O1 in the spec):

1. **Rule what waits**: find it, read it, rule it.
2. **Check what was just ruled**: the ruling landed, with the right words.
3. **Look up a past ruling**: "what did we decide about X", by number or by
   words.
4. **See the pace**: is anything stuck, and since when.

The Timeline serves 4 only. Today the page is laid out as if 4 came first.

## Findings

**D1 (4): every record is listed twice, so the page is about six screens
long, and nothing he can do shortens it.** (`said` + measured from code)
The 71 records appear once as Timeline rows (two lines each, ~43 px, so
~3,050 px) and again as Ruled rows (~46 px each, so ~3,130 px). With the
tiles and headings, the page is ≈ 6,500 px, about 6½ views at his window.
Waiting, the job he comes for, is above both, but a record that was just
ruled sits ~3,200 px down, under the whole Timeline. No section collapses.
Heuristic: Nielsen 8 (aesthetic and minimalist design), 7 (flexibility and
efficiency of use).
*Proposal*: every section collapsible and remembered. The Timeline is closed
by default, being a report and not a worklist. Ruled shows the newest ten
and the rest on request. Timeline rows go to one line.

**D2 (3): the four tiles answer nothing he acts on.** (`said`)
"0 waiting on a ruling" repeats the empty section right below it. "—" for
oldest waiting is a dash with no meaning. "68 ruled in 30 days" counts the
initiative's whole life (it is a month old). "0d median turnaround" is 0
because most records are raised and ruled the same day, and records have
dates only (0070: no timestamp, no hours), so the number can never say
anything finer. Four bordered tiles take a full row at the top of his main
view. Heuristic: Nielsen 8; design system principle "numbers need their
noun" (memory lesson, 0068).
*Proposal*: one line of words, which says what waits, the oldest and its
number as a link, and what was ruled this week. Drop the median.

**D3 (3): no way to find a past ruling.** (`heuristic`, Nielsen 7; job 3)
Looking up "what did we decide about the rail" means scrolling 68 rows and
reading titles cut at ~30 characters in the Timeline.
*Proposal*: a find field above the sections, filtering every section by
number or by words in the title, the chosen option and the body.

**D4 (2): section headings are UI-size text, so the page has no visible
structure.** (`said`, `heuristic`: design system Type, "xl 16/22: section
titles") `.dec-section h2` is 13 px (`global.css:714`), the size of the
rows under it. When scrolled into the Timeline, nothing says which section he
is in.
*Proposal*: headings at 16 px with their count, sticky under the initiative
header while their section scrolls, and each heading is the section's
collapse control.

**D5 (2): heading words describe the data, not his work.** (`said`)
"Waiting on a ruling", "Ruled" and "Timeline", each with a meta that
explains the sort order. The page's first line ("decision records in
working-on/decisions/ · anyone may rule a waiting record here, and it notes
who did") is a developer's note, read every visit.
*Proposal*: "To rule · 3", "Ruled · 68", "Timeline". The sort order moves
into the count's title. The first line goes to Help (0031: Help is
`how-we-build.md`), or becomes the find field's placeholder.

**D6 (2): the per-record turnaround says "0d" or "1d" on every ruled row.**
(`heuristic`, Nielsen 8) Same cause as D2.
*Proposal*: show it only when it is at least a day, as "after 3 days".

**D7 (1): the Timeline's second label line repeats the status** ("ruled"
under every title), which the bar's colour and the legend already say. It
doubles the row height. (`heuristic`)
*Proposal*: one line, the status in the hover title and the accessible name
only.

## The three that matter

D1 (4), D2 (3), D3 (3). Design: `docs/ux/specs/decisions-view.md`.
