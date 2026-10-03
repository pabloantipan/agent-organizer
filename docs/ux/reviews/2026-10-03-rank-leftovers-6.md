# Ranked: sup29's and sup30's leftovers (zoom-decisions-polish, markdown-and-labels)

- **Asked by:** the FSE, thread 01M4234H29HX9P9J0WJFQYYA9F.
- **Sources:** `working-on/done/zoom-decisions-polish.md` (code review; UI
  review U1–U4, R2, gaps) and `working-on/done/markdown-and-labels.md` (code
  review; UI review R1, U4–U7, gaps a–c); the two run records. Cited as
  `zdp-` and `mal-`. I did not re-run them.
- **Already fixed in the waves:** zdp-U1 (sev 3, Stages could not be zoomed)
  and mal-U1–U2.
- **Design system, amended in the same commit** (Timeline): the axis grows
  a title row rather than overlap, then "+N" past three rows; at least 12 px
  between tick labels; the today line passes under title text; the today
  label sits in the axis and carries the date at Days and Hours; the context
  label names the first whole unit in view. Scroll edge: a code block or
  table carries it too. With these, rows 1, 3, 5, 6 and 7 are conformance.
- **None needs Pablo.**

## The list, ranked

| # | What the lead cannot do, or does wrong | From | Sev | Kind | Next cards' files | Direction |
|---|---|---|---|---|---|---|
| 1 | At Days he cannot tell which day is today: its tick gives way to a title, the context label names last month, and "today" sits at the frame's foot below its own scroll | mal-R1, mal-gap a | 2 | DS | no (`TimeZoom.tsx`, `lib/axis.ts`) | Timeline, as amended: `today · Sat 3` in the axis; the context label names the first whole unit in view |
| 2 | Ruling a record while Ruled is closed drops focus to the page | zdp code review (2) | 2 | DS | **rule-box-and-stages** (`RuleDecisionBox.tsx`'s after-rule), plus `DecisionsView.tsx` | Focus and names, closing: after a ruling, focus goes to the next waiting record's line, or to the To rule heading when none waits |
| 3 | After "Show the other 66", focus stays on a toggle 3,000 px below, out of view | zdp-U2 | 2 | DS | no (`DecisionsView.tsx`) | Focus lands on the first record it revealed (the eleventh), which is where he was going. "Show only the newest ten" keeps focus on the toggle and scrolls it into view |
| 4 | A third colliding title overlaps silently | mal code review (1) | 1 | DS | no (`lib/axis.ts`) | Timeline, as amended: the axis grows a row; past three rows, "+N" at that date |
| 5 | A code line cut by its block's edge stops mid-word with no sign it scrolls | mal-U4 | 1 | DS | **home-signals-5** (`useScrollEdges`, `shell.css`'s edge) and `global.css` (`.markdown`) | Scroll edge, as amended: a `pre` or table that scrolls carries the edge. Reuse home-signals-5's hook once it lands |
| 6 | The today line is drawn over "target 1 Oct" and a letter of "Port to canonical" | mal-U5, mal-gap b | 1 | DS | no (`time-zoom.css`) | Timeline, as amended: the line passes under title text (titles on the panel's ground) |
| 7 | Decisions at Fit shows ten ticks about 5 px apart | mal-U6, mal-gap c | 1 | DS | no (`lib/axis.ts`) | Timeline, as amended: at least 12 px between tick labels |
| 8 | Under a find, he cannot tell whether a hidden record matched ("1 of 73 · 3 hidden") | zdp-U3 | 1 | Design | no (`DecisionsView.tsx`) | While a find is on: `Timeline · 1 of 73 · 1 more among 3 hidden`. With no hidden match, `· 3 hidden` as now |
| 9 | A section he closes during a find is stored, though a find stores nothing | zdp-U4 | 1 | Design | no (`DecisionsView.tsx`) | A find stores nothing, toggles included: while a find is on, opening and closing are for the visit. Clearing restores the stored layout |
| 10 | A landing during a find into a section closed during that find keeps it closed, so the record is hidden | zdp code review (3) | 1 | DS | no (`DecisionsView.tsx`) | decisions-view §6: never land on a hidden record. A landing opens its section whatever the find did |
| 11 | On Stages the frame's focus ring stops 12 px short of the lane | zdp-R2 | 1 | DS | **rule-box-and-stages** if `.srm .tz-frame`'s margin moves in Stages' CSS; else `time-zoom.css` | Move the −16 px margin onto `.tz-wrap` in Stages, so the ring wraps what scrolls |
| 12 | At Hours, "Nothing in this window. Today" shows while today's line is in the window | zdp, seen | 1 | Design | no (`TimeZoom.tsx`) | With today in view, the line reads `No cards in this window.` and drops the Today button |
| 13 | Stages' appetite text is cut inside short bars ("two wav…") | mal-U7 | 1 | Design | **rule-box-and-stages** (`StageRoadmap.tsx`) | A bar's text that does not fit sits after the bar, as the due label does; never cut inside |

## Gates and code (not UI changes)

| # | What | Direction |
|---|---|---|
| S1 | No gate row zooms Stages, which is how zdp-U1 passed two reviews | Every zoom card has a row per graph (Cards, Stages, Decisions) |
| S2 | L7 is unreachable: no fixture box is taller than its room | A fixture record with eight options and a long question, in `testdata/fixture-overlay/` (rule-box-and-stages holds it) |
| S3 | L2 rests on a run-time copy of 76 records | Commit a generated many-records fixture initiative (≥ 70 records) for find and limit rows |
| S4 | Reviewers keep writing into Pablo's installed app's WebKit storage; zdp's copy is left unrestored | The FSE's and supervise's: the build under review takes a test bundle id, or the reviewer restores before ending. Third sighting |
| S5 | `.tz-labelcol` hard-codes 240 px beside `LABEL_W`; `placeAxisLabels` forces layout every render; the spec's Cards table says L9–L11 | Code, the FSE's |

## Sequencing

- **rule-box-and-stages**: rows 2 (the after-rule focus), 11 (if Stages' CSS
  moves) and 13 (`StageRoadmap.tsx`), and S2 (the overlay fixture).
- **home-signals-5**: row 5 (it reuses that card's `useScrollEdges` and
  `global.css`).
- **Free of both:** rows 1, 3, 4, 6–10 and 12: `TimeZoom.tsx`,
  `lib/axis.ts`, `time-zoom.css`, `DecisionsView.tsx`.
