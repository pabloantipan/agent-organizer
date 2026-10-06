# aglaea — bitácora

The Product Designer seat beside the organizer's FSE (0053). HAND-OFF at the
top; one dated line per session below.

## HAND-OFF — 2026-10-04, at the context cap

Read first: the `aglaea` skill, `agents/aglaea.md`, `docs/ux/memory.md`,
`docs/ux/principles.md`, `docs/design-system.md` (**mine since 0054**; the app
is **Deltagos**, 0066; amended many times on 2026-10-03/04, every line cites
its source).

- **Doing:** nothing in flight. The pattern of these days: the FSE asks me to
  rank each wave's UI leftovers (`docs/ux/reviews/<date>-rank-leftovers-N.md`,
  N = 3…8 so far), and supervisors (sup31–35) send design questions mid-wave
  ("[for aglaea]"). I answer in one message, put the rule in the design system,
  and send the FSE a msg with the row for its next batch.
- **Last answered:** sup35 (d06e265): Escape keeps drafts per record (`Rule ·
  draft`), and Home's fixed columns give their slack to cut cells. Both were
  sent to the FSE for leftovers-9.
- **My design specs (proposed, ruled into cards):** `docs/ux/specs/roadmap-time-zoom.md`
  (amendment 1; 0070, 0071, 0073), `docs/ux/specs/decisions-view.md` (0072;
  amendment 1 and later notes on §8: the facts line joins the stuck head while
  ruling), `responsive-home.md`, `initiative-header.md`.
- **Waits on Pablo:** Q1 of leftovers-4: does he use Tab in the app? Tab in
  WKWebView reaches buttons only with macOS Keyboard navigation on. Not
  answered yet; it goes through the FSE.
- **Reviews now run** in `Deltagos Review.app` (bundle id
  `cl.antipan.organizer.review`), so Pablo's storage is safe. Ask for
  WKWebView shots every time; Chromium has missed sev 3s.
- **Tooling:** as in `memory.md`, "How I look at it". Post with `discuss-hook
  post --to <seat> --kind answer --thread <id> "<body>"`, then
  `discuss-hook ack <id>`.
- **Also sent:** `docs/ux/specs/transversal-roles.md` (0082), proposed; O1 (Daedalus) and O2 to the FSE.
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
- 2026-10-04 — leftovers-8 ranked (7 rows + 3 gate/code); DS: dates as words, words verbatim.
- 2026-10-04 — sup35: Escape keeps drafts per record ('Rule · draft'); slack goes to cut cells (DS).
- 2026-10-04 — transversal-roles design spec (0082): Home section, rail group, drawer, states.
- 2026-10-04 — sup36: drafts keyed per chat with their addressee; '· draft' on collapsed rows (DS).
- 2026-10-04 — sup38 roles-ui A1-A3: Needs me shows five then 'Show the other N' (for Pablo); drawer initiatives as text links; landing on the session row (R5 defect).
- 2026-10-04 — sup39 U2/U3: draft marks only where he acts; the channel composer defaults to everyone with the wake count (DS).
- 2026-10-05 — sup40 rn5-A1/A2: wake count beside Start or Send, neutral, magenta for a broadcast, never red (DS).
- 2026-10-05 — sup41: a Ruled line's long chosen option gives way first, then the title; the line never widens the board (DS).
- 2026-10-05 — floating-icon design spec (0088): icon, float, list panel, compact button.
- 2026-10-05 — sup41 dst-ui A1/A2: tallness decided before ruling and held; inset line accepted (decisions-view §8).
- 2026-10-05 — sup43 fic-ui A1: the panel keeps the native window shadow (spec §3); A2 to look at once installed.
- 2026-10-05 — 0091: double-click to the full app at its last view; list at once; icon 56/72/88 pt by display (floating-icon amendment 1).
- 2026-10-05 — sup44 A1/A2: the icon's close waits out the double-click interval; growth 200 ms (floating-icon amendment 2).
