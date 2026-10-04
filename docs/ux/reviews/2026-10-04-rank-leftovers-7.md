# Ranked: sup31's leftovers (rule-box-and-stages, home-signals-5, review-build)

- **Asked by:** the FSE, thread 01M43Q8CBZ9HX2JD0K2A1QWRCR.
- **Sources:** `working-on/done/rule-box-and-stages.md` (rbs-, U1–U4, Q1,
  gaps), `working-on/done/home-signals-5.md` (hs5-, U1–U2, G1–G4, notes),
  `working-on/done/review-build.md` (N7 gap);
  `runs/2026-10-04-leftovers-5-wave.md`. I did not re-run them. The reviews
  ran in `Deltagos Review.app`, so Pablo's storage was not touched.
- **Already settled by my calls:** rbs-Q1 (3424695: the scrim stops below
  the top bar) and hs5-U1 (857949c: waits on you, blocked, waiting; waiting
  gives way first). They are rows 3 and 4, to build.
- **Design system, amended in the same commit:** Elevation (one layer
  order, from z-index tokens: content < sticky < box and scrim < top bar <
  drawer or modal and backdrop); Focus and names (closing the top of a stack
  puts focus back into the box below). With these, rows 1 and 2 are
  conformance.
- **None needs Pablo.**

## The list, ranked

| # | What the lead cannot do, or does wrong | From | Sev | Kind | timeline-and-find-6? | Direction |
|---|---|---|---|---|---|---|
| 1 | A card back opened from the record he is ruling paints under the rule box and the sticky heading, and the box's Rule stays clickable over it | rbs-U1, rbs code review | 3 | DS | **yes** (`decisions.css` sticky z) plus `global.css` `.modal-backdrop`, `tokens.css` | Elevation, as amended: z-index tokens, one order; the card back and its backdrop above the box, the headings and the top bar |
| 2 | After Escape closes Help over a rule box, focus falls to the page | rbs-U2 | 2 | DS | **yes** (`RuleDecisionBox.tsx` holds the box's last field) plus `HelpView.tsx` | Focus and names, as amended: back into the box's last field; with no box, to Help's opener |
| 3 | At regular and compact, Help cannot open over a rule box: the scrim covers the top bar | rbs-Q1 | 2 | DS (3424695) | no (`rule-box.css` scrim, `Home.tsx`) | The scrim starts below the top bar; Help opens over the box at every width; Escape closes Help first |
| 4 | On Home at compact with the rail expanded, the busiest row hides "1 blocked" in "+6" | hs5-U1 | 2 | DS (857949c) | no (`lib/width.ts`, `Home.tsx`) | Within the never-fold set, waiting gives way first; blocked never folds. Gate: `--twenty` partner-payouts, 1024×640 and 1280×800, rail expanded, classic bars |
| 5 | With overlay scrollbars, a tall rule box gives no sign that two options and the words field are below | rbs-U3 | 2 | DS | **yes** (`RuleDecisionBox.tsx`) plus `rule-box.css` | Scroll edge: the box's scroller takes `useScrollEdges`, as the header and code blocks do |
| 6 | A stage landing at 1024×640 scrolls the Stages axis away, so the bars show without dates | rbs-U4 | 2 | DS | **yes** (`TimeZoom.tsx`, `time-zoom.css`) plus `StageRoadmap.tsx` | Timeline: the axis sticks while the rows scroll, on Stages as on Decisions. Put it in timeline-and-find-6 if it is not there yet |
| 7 | The open record's Rule is named "Rule" alone (WKWebView's tree) | hs5, noticed | 1 | DS | **yes** (`DecisionsView.tsx`) | Names: "Rule 0009 <title>", as the Needs me verbs do |
| 8 | Home's cut next date hovers `2026-11-30`, not what is due | hs5-U2 | 1 | DS | no (`Home.tsx`) | The hover says the cell's words whole: `30 Nov · due · w-later` |
| 9 | Needs me's rows on Home still read `raised 2026-09-24` | hs5-G1 | 1 | DS | no (`Home.tsx`) | Dates in words, as everywhere (`raised 24 Sep`; the year only when it is not this year) |
| 10 | A wide `pre` in a ruled question widens the rule box | hs5, builder's note | 1 | DS | no (`rule-box.css`) | A body never widens its view: `.markdown pre` inside the box scrolls in itself, with its edge |

## Gates and code (not UI changes)

| # | What | Direction |
|---|---|---|
| S1 | The scroll edge in the card back, the rule box and Help has no gate row and no fixture body that scrolls there | A fixture card and record with a wide code block and a ten-column table, plus one row per place |
| S2 | A UI review ran across a mid-review rebase | supervise's: the review is pinned to a commit, or told when the branch moves |
| S3 | N7's "mtime unchanged" passes while WebKit writes WAL files inside | The FSE's: `find -newer` plus `lsof` on the writer |
| S4 | `lib/useScrollEdges.ts` is outside home-signals-5's boundary as written | The FSE's: bless it; it is the shared hook rows 5 and 10 need |

## Sequencing against timeline-and-find-6

It touches rows 1 (`decisions.css`), 2 and 5 (`RuleDecisionBox.tsx`),
6 (`TimeZoom.tsx`, `time-zoom.css`) and 7 (`DecisionsView.tsx`). Free of it:
rows 3, 4, 8, 9 and 10 (`rule-box.css`, `Home.tsx`, `lib/width.ts`,
`global.css`, `tokens.css`, `HelpView.tsx`). Row 1 is the only sev 3. It is
pre-existing, but with a ruling box open it hides what he is reading, so I
would not hold it behind more than one wave.
