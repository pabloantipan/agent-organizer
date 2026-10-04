# aglaea — bitácora

The Product Designer seat beside the organizer's FSE (0053). HAND-OFF at the
top; one dated line per session below.

## HAND-OFF — 2026-09-30, before the full restart

Read first: the `aglaea` skill, `agents/aglaea.md`, `docs/ux/memory.md` (what I
know, ruled choices, open findings, lessons), `docs/ux/principles.md`, and
`docs/design-system.md` (**mine since 0054**; the app is **Deltagos**, 0066).

- **Doing:** nothing in flight. 2026-10-03: sent the FSE `docs/ux/specs/roadmap-time-zoom.md` (time zoom on Cards, Stages, Decisions); O1 and O3 ruled in 0070 (commit times in the card; no Hours without a timestamp); the FSE cards it after header-fold-2.
- **Also 2026-10-03:** sent the FSE the Decisions view review and spec (`reviews/2026-10-03-decisions-view.md`, `specs/decisions-view.md`); O1 (the jobs) is for Pablo.
- **Also 2026-10-03:** ranked sup25's leftovers (leftovers-3); decisions-view Amendment 1 (U2, U3); DS Widths amended.
- **Also 2026-10-03:** time-zoom leftovers as roadmap-time-zoom Amendment 1 (A15–A23).
- **Also 2026-10-03:** leftovers-4 ranked (16 rows); Q1 (Tab in WKWebView) waits on Pablo via the FSE.
- **Also 2026-10-03:** leftovers-5 ranked (15 rows).
- **Before that:** nothing in flight. Last work: the ranked leftovers of header-fold
  and responsive-home-2, `docs/ux/reviews/2026-09-30-rank-header-fold-responsive-2.md`
  (3f3df2f), with the design system amended (Widths: wide from 2200, signals
  never wrap, a column gives way only when it doesn't fit, scrim in regular;
  24 px targets; focus ring offset; stage word "now").
- **Waits on Pablo:** record **0069**, accepting the FSE's two cards from that
  ranking: `header-fold-2` (initiative-header amendment 3) and
  `widths-and-focus` (responsive-home amendment 3). I agreed the FSE's
  assumption: a record taller than the view keeps its head on top, Rule
  included (thread 01M3RCXDRAHWDQSD34QPZ97Y3X).
- **Waits on the FSE:** nothing asked of me. Both cards are `ui_review`, so a
  UI reviewer on `references/ui-review.md` runs in their wave; the FSE may
  send me its leftovers to rank.
- **My design specs:** `docs/ux/specs/responsive-home.md` (amendment 1 mine,
  A8 amended by the FSE per 0065), `docs/ux/specs/initiative-header.md` (§2
  words superseded by 0068). Build specs are the FSE's in `docs/specs/`.
- **Parked, not carried:** first look F4 (one word per agent state), F5, F6,
  F8; cell-screens C9, C10. F4 is the one worth bringing back.
- **Tooling:** run `wails dev` on `scripts/fixture-home.sh [--twenty]`, drive
  with chrome-devtools in an isolated context, emulate viewports
  (1024×640, 1512×945, 1920×1080, 3440×1380); afterwards restore
  `frontend/wailsjs/runtime` and `frontend/package.json.md5`, kill
  `$FIXTURE_AGENT_PIDS`. Post with `discuss-hook post --to fse --kind … --thread … "<body>"`.
- **Wake defects** (resume-wake) are fixed and installed; this restart gets
  the new watcher.
- **Next action:** read mail; if none, stay silent.

## Log

- 2026-09-29 — first wake: read design system, specs, 0001–0053, people.md;
  looked at Home, Needs me, the six sub-views, Help, Settings at 1440 and 1024.
- 2026-09-29 — reviewed stage 5's cell screens for the FSE (C1–C10).
- 2026-09-29 — 0054 ruled; design system amended for F9 and disabled actions.
- 2026-09-29 — triaged the three UI reviews' leftovers into 14 rows; DS: Focus and names.
- 2026-09-29 — responsive Home: measured 1024/1512/3440, wrote the design spec.
- 2026-09-29 — initiative header design spec (header-review-2, UI1–UI7).
- 2026-09-29 — 0066: renamed the product in the design system and principles to Deltagos.
- 2026-09-29 — responsive-home amendment 1 (U1–U9; U3 my error); DS: Widths, open box keeps the keyboard.
- 2026-09-30 — noted responsive-home-2's R1–R5; waiting on header-fold to rank them together.
- 2026-09-30 — 0068: header chip words updated in initiative-header.md.
- 2026-09-30 — resumed after an exit; the FSE's message was drained into context at SessionStart with no turn, and I only saw it when Pablo asked. Diagnosed from hook.log, posted to hephaistos (thread 01M3RGGD7Q4N0TPW3FAFZXQTHY).
- 2026-09-30 — hephaistos confirmed all three wake defects; carded in agent-slack as resume-wake, built with a fixture per defect once Pablo says go.
- 2026-09-30 — resume-wake fixed and installed (agent-slack api 8272a91). My seat still runs the old watcher until restarted.
- 2026-09-30 — ranked header-fold's and responsive-home-2's leftovers (15 rows); DS: Widths from 2200, targets, focus ring, "now".
- 2026-09-30 — FSE cut header-fold-2 and widths-and-focus (0069); agreed the tall-record head stays on top, Rule included.
- 2026-10-03 — FSE asked for time zoom on the Gantt; wrote specs/roadmap-time-zoom.md (proposed); O1: data is day-only, hours need commit times.
- 2026-10-03 — scope widened to every Gantt-style graph (Cards, Stages, Decisions; not Calendar); spec amended, answered the FSE.
- 2026-10-03 — 0070 ruled O1 and O3 as recommended; spec and memory updated.
- 2026-10-03 — Decisions view: review D1–D7 from Pablo's screenshot and the code, plus a design spec (find, summary line, collapsible sticky sections, ten ruled, Timeline last).
- 2026-10-03 — leftovers-3 ranked (11 rows); decisions-view absorbs U2/U3 (Amendment 1); DS: wide measured, fold order, scroll edge.
- 2026-10-03 — time-zoom leftovers ranked (10 rows) as roadmap-time-zoom Amendment 1; G2 words accepted.
- 2026-10-03 — leftovers-4 ranked (16 rows + 5 gate rows); DS: window sizes, focus before disable, WKWebView keyboard, axis text, dimming.
- 2026-10-03 — 0076 design call: the cell's state folds last of the foldable signals (option c); DS Widths names it.
- 2026-10-03 — leftovers-5 ranked (15 rows + 6 gate/code); DS: no document scroll, classic bars, fold order and floors, edge colour, topmost Escape, opener.
- 2026-10-03 — sup30: superseded/withdrawn take the neutral lozenge; mark titles stagger, never skip (DS).
- 2026-10-03 — leftovers-6 ranked (13 rows + 5 gate/code); DS Timeline: today named, title rows, tick gap.
- 2026-10-04 — sup31 Q1: the scrim never covers the top bar; Help opens over a box at every width (DS).
- 2026-10-04 — sup31 hs5-U1: within the never-fold set, waiting gives way before blocked (DS).
- 2026-10-04 — leftovers-7 ranked (10 rows + 4 gate/code); DS: layer order, focus after the stack top closes.
- 2026-10-04 — sup32: at Days the gridline is the gap; 12 px only for floating labels (DS).
- 2026-10-04 — sup32 tf6-ui A1/A2: +N rides the crowd's last title; at Days today's own tick in accent, 'today' on the context row (DS).
- 2026-10-04 — tf6 leftovers: directions for P8 of layers-focus-and-words; DS: 'in view' defined.
- 2026-10-04 — sup33 lf7-ui A1-A3: facts line joins the stuck head while ruling; drawers scroll their own body; Home's list short at 1512 strip is a defect.
