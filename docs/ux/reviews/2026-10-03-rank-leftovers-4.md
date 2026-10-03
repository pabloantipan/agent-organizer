# Ranked: sup27's leftovers (decisions-view, time-zoom-2)

- **Asked by:** the FSE, thread 01M41EBN13XE2GAPG9M7R2T5BW, to be batched
  as leftovers-3 was.
- **Sources:** `working-on/done/decisions-view.md` (code review; UI review
  U1–U7, G1–G6, N1–N2) and `working-on/done/time-zoom-2.md` (code review; UI
  review U1–U7, G1–G4); `runs/2026-10-03-decisions-view-and-time-zoom-2.md`.
  Cited as `dv-` and `tz-`. Both UI reviews shot WKWebView this time. I did
  not re-run them.
- **Design system, amended in the same commit:** Widths (gate sizes are
  window sizes, and a row names content or window plus the rail state);
  Focus and names (a control that disables itself moves focus first;
  keyboard checked in WKWebView, naming macOS's Keyboard navigation
  setting); Timeline (the axis sticks; no axis text is ever cut;
  overlapping labels skip); Decision record (dimmed is a token, never
  opacity; a body never widens its view). The FSE's two factory-wide items
  are these lines, not cards: (a) is the Widths line, and (b) is the Focus
  line plus question Q1 below.
- **Already fixed in the wave:** dv-U1 (sev 3, 7c4f1e0).

Kinds: **DS** is conformance to `docs/design-system.md`; **Design** is my
call, here; **Spec** fixes a gate; **Code** is the FSE's, with no UI
change.

## The list, ranked

| # | What the operator cannot do, or does wrong | From | Sev | Kind | Files (sup28 overlap in bold) | Direction |
|---|---|---|---|---|---|---|
| 1 | In the real app, after Zoom in reaches Hours, focus moves to `−` but shows no ring, so it looks lost | tz-U1 | 2 | DS | `TimeZoom.tsx` | Move focus to the opposite button **before** the pressed one disables (same tick, before the state update), then check the ring in WKWebView. If WebKit still drops `:focus-visible` on a programmatic move, these moves set a class that draws the same ring |
| 2 | A record with a wide code block widens the whole Decisions scroller: a horizontal bar, and text beside the sticky headings | dv-U3, dv code review | 2 | DS | **`global.css`** (`.markdown pre`, home-widths-4 holds `.rail-icon` only) | Decision record, as amended: `pre` and tables in any rendered body scroll inside themselves (`overflow-x: auto; max-width: 100%`). Card backs and Help get the same, since they share `.markdown` |
| 3 | Superseded and withdrawn lozenges read at ~1.5:1, and they now sit inside Ruled | dv-U4 | 2 | DS | **`global.css`** (`.dec.superseded`) | Decision record, as amended: drop the row's opacity; the title and meta take `--fg-muted`; the lozenge keeps its own tokens |
| 4 | In a long Timeline, the dates scroll away and the rows below have no axis | dv-G6 | 2 | DS | `TimeZoom.tsx`, `time-zoom.css` | Timeline, as amended: the axis sticks under the Timeline's sticky heading (time-zoom's "axis sticky when rows are taller than the view") |
| 5 | Ruled says "no match" on an initiative with nothing ruled and nothing typed; it reads as a forgotten filter | dv-U2, dv-G1 | 2 | Design | `DecisionsView.tsx` | Words, decisions-view §2: with no find on, an empty Ruled says `Nothing ruled yet.`; "no match" only while a find is on |
| 6 | He types a find, and the hits sit in a closed section that shows only a count | dv-G5 | 2 | Design | `DecisionsView.tsx` | Decision on dv-G5, a change to my §2: **while a find is on, every section with a hit shows open**; clearing it restores his own layout. Nothing is stored. Finding is the job; a count he must click through is a step he always takes |
| 7 | Without macOS Keyboard navigation on, Tab never reaches a button in the app | tz-U2, dv-N2, tz-G2 | 2 | Question + DS | none yet | Q1 below. The DS line makes every keyboard row name the setting. Until Q1 is answered, rows run with it on and say so |
| 8 | After a landing opened Ruled, Ruled stays open on his next visit | dv-U6, dv-G2 | 1 | Design | `DecisionsView.tsx` | §6, sharpened: a landing opens for the visit; the stored state is only what he toggled by hand |
| 9 | Ruled and Timeline count different totals under one find ("1 of 74" beside "1 of 71") | dv-U5 | 1 | Design | `DecisionsView.tsx` | The Timeline's count names what it hides: `Timeline · 1 of 71 · 3 hidden`, where "3 hidden" is the existing show-superseded control's count |
| 10 | Milestone titles, the today label and the undated label are cut at the lane's edges; Decisions' Fit labels collide at 1024 | tz-U5, tz-U7, tz-G3 | 1 | DS | `TimeZoom.tsx`, `lib/axis.ts`, **`StageRoadmap.tsx`** (the undated label; header-fold-3's) | Timeline, as amended: no axis text is cut; labels that would overlap skip one in two. Measure the rendered width, not a count of characters (tz code review) |
| 11 | The today band and the grid show through gaps in the sticky label column, outlining every label in purple | tz-U3 | 1 | Design | `time-zoom.css` | One continuous background behind the label column, the panel's |
| 12 | The zoomed frame's focus ring hides under the sticky labels and axis | tz-U4 | 1 | DS | `time-zoom.css` | The ring is drawn outside the frame (on its wrapper), at the design system's offset |
| 13 | In WKWebView, classic scrollbars cover the lane's last ~12 px | tz-U6 | 1 | Design | `time-zoom.css` | The lane ends with 12 px of padding at the right and bottom, so a classic scrollbar covers no mark. `scrollbar-gutter` is not in Safari 15 |
| 14 | A scrolling rule box shows a needless horizontal scrollbar in WKWebView | dv-U7 | 1 | Code | **`rule-box.css`, `RuleDecisionBox.tsx`** (home-widths-4's) | `overflow-x: hidden` on the capped box. With it, move the stuck placement from `decisions.css`'s `!important` into the box (dv code review) |
| 15 | The record line's name says "by no one named" where the text shows "—" | dv code review | 1 | DS | `DecisionsView.tsx` | Label in name (WCAG 2.5.3): the visible text and the name both say `no ruler recorded`. That record is already a scanner problem |
| 16 | A done or superseded band at Hours would fail A17 (2.42:1); none is drawn today | tz code review | — | DS, no work now | — | If one is ever drawn, it borders with `--fg-subtle`. Noted so the next card that draws one meets it |

## Gates and fixtures (not UI changes)

| # | What | From | Direction |
|---|---|---|---|
| S1 | B13 passes whenever the box happens to fit; no row measures a box taller than its room | dv-G3 | A row at Chromium 1024×580 content, or with an error line in the box |
| S2 | Rows at 1024 do not name the rail state, and A18 does not name its lane width | tz-G1, tz-G4, dv-G4 | DS Widths, as amended: every row names window or content and the rail state. A18 at 1024 with the rail expanded follows §A1.3 (the nearer end at a third), and the row says so |
| S3 | No gate row for `/`, Escape clearing, "Show only the newest ten", or a ruled record leaving To rule while Ruled is closed | dv code review | Four rows for the batch |
| S4 | A reviewer's remembered sections land in Pablo's installed app (same bundle id, same WebKit storage) | run record, dv-N1 | The FSE's and the supervise skill's: a reviewer resets storage at the end, or the built app under review takes a test bundle id |
| S5 | A23's card is in the fixture overlay, not the script the boundary names | tz code review | The FSE's: name the overlay in UI cards' boundaries |

## Q1, for Pablo through the FSE

Do you move around Deltagos with Tab? In WKWebView, Tab reaches buttons
only with macOS's Keyboard navigation on (System Settings › Keyboard), and
it is off on this machine. If you don't use Tab, the setting's default is
fine and keyboard rows run with it on, as the design system now says. If you
do, the app should make its buttons reachable whatever the setting. That is
an FSE spike (whether an explicit `tabindex` or a WKWebView preference
does it), not a design change.

## Sequencing against sup28

- **header-fold-3**: row 10's undated label (`StageRoadmap.tsx`).
- **home-widths-4**: rows 2 and 3 (`global.css`, other rules than
  `.rail-icon`, but the same file) and row 14 (`rule-box.css`,
  `RuleDecisionBox.tsx`).
- **Free of both:** rows 1, 4–9, 11–13, 15: `TimeZoom.tsx`,
  `time-zoom.css`, `lib/axis.ts` and `DecisionsView.tsx`, which sup28's two
  cards both exclude.
