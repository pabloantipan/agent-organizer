# aglaea — bitácora

The Product Designer seat beside the organizer's FSE (0053). HAND-OFF at the
top; one dated line per session below.

## HAND-OFF — 2026-10-09, session cleaned up

Read first: the `aglaea` skill, `agents/aglaea.md`, `docs/ux/memory.md`,
`docs/ux/principles.md`, `docs/design-system.md` (**mine since 0054**; the app
is **Deltagos**, 0066; amended almost daily, every line cites its source).

- **Mail waiting, undelivered (3, all from the FSE).** Read them with the
  read-only inbox (below); they will be delivered on the first turn of a
  seat that has its identity:
  1. **ram-indicator (0101)**, thread 01M4CK6VQ11WY8YJW9YWQ4C63T: a design
     spec `docs/ux/specs/ram-indicator.md`. It covers macOS memory pressure
     (normal, warn, critical, free GB) in the top bar, quiet at normal,
     beside Needs me (still the one badge) and Usage; a hover listing the
     biggest agent sessions by memory, linking to their Agents rows; how the
     floating icon shows warn and critical without a second badge; the
     critical notification's words, rate and click; and every state
     (no reading, normal, warn, critical, back to normal, reduced motion,
     1024). Sampling is the 10 s agents tick.
  2. **The Deltagos mark**, thread 01M4CKBP8N0MGTVP3E0BCZB7JB: Pablo's
     sketch in `docs/ux/inputs/deltagos-mark/` (a D as one violet stroke with
     three travelling gaps, two meshing gears in ember and amber, an Archivo
     wordmark, its own palette).
  3. **Pablo's ruling on it, 2026-10-09** (a decision in the same thread):
     "adjust pallete to current one and let's draw it". Recolour it to our
     tokens (#1a1523 ground, #8a3ffc accent, magenta tone, Manrope; dark
     only, no gradients), keeping the form and motion, and **draw it**: an
     HTML page in `docs/ux/inputs/deltagos-mark/` or a published artifact,
     at 56/72/88 pt and at 16/32 px, plus reduced motion's static frame. Say
     which rule the gears' extra colours bend, as a question for Pablo. Then
     amend `docs/ux/specs/floating-icon.md`. **Do this first**, since it
     shapes how the icon shows RAM (0101 may share its build card).
- **Seat identity.** A resumed session can come up without `AGENT_NAME` and
  `PROJECT_ID`, and then no hook delivers mail. The fix is to relaunch the
  seat through its prelude (`organizer-probe-aglaea`). To look by hand
  without consuming anything:
  `line="$(discuss-api token env organizer aglaea)"; eval "export ${line% claude}"`
  (zsh will not word-split an unquoted variable, and the line ends in
  `claude`, so never `eval` it whole), then
  `curl -s -H "Authorization: Bearer $DISCUSS_TOKEN" http://127.0.0.1:9494/projects/organizer/agents/aglaea/inbox`.
  `discuss-hook drain` refuses by hand, which is correct. Never print the
  token. On 2026-10-07 it was printed once into the session's output, and
  Pablo was told he may rotate it (`discuss-api token add organizer aglaea`).
- **The pattern of the work.** The FSE asks for design specs (proposed,
  Technical notes left to it) and for rankings of each wave's UI leftovers
  (`docs/ux/reviews/<date>-rank-leftovers-N.md`). Supervisors send
  "[for aglaea]" design calls mid-wave. I answer in one message, put the
  rule in the design system or the spec, and send the FSE a msg with the
  row for its next batch.
- **My design specs** in `docs/ux/specs/`: roadmap-time-zoom, decisions-view,
  responsive-home, initiative-header, transversal-roles (0082, amendment 1),
  floating-icon (0088, amendments 1-3: double-click, sizes 56/72/88 pt,
  close at once), roadmap-as-a-plan (0093), usage (0098: money only in
  Usage, tokens elsewhere per 0020).
- **Waits on Pablo:** Q1 of leftovers-4 (does he use Tab? WKWebView reaches
  buttons only with Keyboard navigation on).
- **Checking the built app:** use `Deltagos Review.app` from a detached
  worktree (`make review-build`) with the fixture, never the installed app.
  `memory.md` "How I look at it" says how to drive the native panel and how
  to clean up (`pkill -f <fixture dir>`).
- **Done 2026-10-09:** the mark (e1cdce1), the RAM indicator spec, and the Initiatives view spec (0104). Next action: read mail; if none, stay silent.

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
- 2026-10-05 — A2 checked on main 4b3291a (Deltagos Review.app, --twenty): the filtered list shrinks 480 to 160; ~50 px empty under one row (sev 1).
- 2026-10-06 — sup45 dln-U1/U2: chosen floor ~8 chars then drops with its dot; wake count beside Rule too (DS).
- 2026-10-06 — roadmap-as-a-plan design spec (0093): outline, rounds row, diamonds, four-step switch.
- 2026-10-06 — floating-icon amendment 3: panel to content; 8 px under menu bar; zoomed is not full screen; icon click closes at once (replaces A2's wait).
- 2026-10-06 — usage design spec (0098): top-level view, tiles, one chart, one table with four cuts.
- 2026-10-09 — session cleaned up; 3 FSE messages waiting (RAM indicator, the Deltagos mark and Pablo's ruling to recolour and draw it); seat identity lost on resume.
- 2026-10-09 — the Deltagos mark recoloured and drawn (deltagos-mark-drawn.html, .png); floating-icon Amendment 4, gears' colours A/B/C for Pablo.
- 2026-10-09 — ram-indicator design spec (0101): top bar, popover, icon ring, critical notification.
- 2026-10-09 — initiatives-view design spec (0104 A): cards awake/asleep, Sleep confirms, Wake refused at four, rail folds Asleep and Archived, memory on Agents rows.
- 2026-10-09 — ram-view: memory button stays after Usage, before Help; Rescan not moved; spec §1 amended (b23bf10).
- 2026-10-09 — rv-review: critical chip text to --fg-on-tone (5.2:1), design-system row, ram-indicator Amendment 1 (229506e).
- 2026-10-09 — noted Pablo's input (not now): keep the icon ring always, memory pressure in an orange tone; amber is the existing warning hue.
- 2026-10-09 — app icon exported (Amendment 5, iconset, icns, export.sh) and ram-indicator Amendment 2 (ring always, amber pressure); 7bb03f4.
- 2026-10-09 — dm-build's 16x16 diff: iconutil ARGB re-encodes translucent corners in the 16 and 32 slots; icns is the authority; F22 amended, no file change.
- 2026-10-09 — Deltagos.icon exported (Amendment 6): PNG layers since CoreSVG drops masks; IconServices shows no plate on macOS 26.1 (f9ee762).
- 2026-10-09 — dm-ui U2/U3: Help mark rests after 4.5 s, hover replays; mark aria-hidden in the lockup (Amendment 7, 8c6249d).
- 2026-10-09 — aic-ui U1: accepted the .icon's flattened rendition on macOS 11-15; F24 amended (968ce34).
- 2026-10-09 — ram-ring-amber A1: critical breathes in width 3-4.5 px at full opacity (56f0244).
- 2026-10-10 — leftovers-16 answers: ring swell 3-6 px; strip fold glyphs; Asleep/Archived apart in FloatList; Memory cell words; inline confirm rule (b3295f2).
- 2026-10-10 — initiatives-view Amendment 2: card opens, Details (charter + Home's workspace), top bar grouped by kind, places as tabs (9b9f8e6).
- 2026-10-10 — leftovers-17 review answers: initiatives-view Amendment 3 (one current mark, firebase bar folds at 1024, Charter omit, 1024 overflows), rows I22-I27; two design-system rules (237db96).
- 2026-10-10 — accepted the FSE's fifth fold (Rescan to its glyph) into initiatives-view A3 §2.
- 2026-10-11 — leftovers-18 UI review answers: initiatives-view Amendment 4 (Settings h1, rail back link to Initiatives, folds by class accepted, Sync ghost with magenta stale, Help aria-expanded, title by weight, id raises card, one Details label), rows I28-I34.
- 2026-10-11 — leftovers-19 answers: initiatives-view Amendment 5 (current = line, open = surface; h1 no focus; back link its own button; focus raises card; Details pinned), rows I35-I38; two design-system rules.
- 2026-10-11 — FSE cut A5 as docs/specs/leftovers-20.md, accept record 0116 waiting on Pablo.
- 2026-10-11 — leftovers-20 answers: initiatives-view Amendment 6 (rail hero a summary everywhere, I39; two raised cards, Tab-to-links tied to Pablo's Q1, goal-with-target kept).
- 2026-10-11 — FSE cut I39 as docs/specs/leftovers-21.md; my Tab question (Q1) is now an option of record 0117 for Pablo.
- 2026-10-11 — tab-reaches-links spec (0117: Pablo uses Tab): TabFocusesLinks switch, skip link, rail one Tab stop with arrows, ring on links; rows T1-T5.
- 2026-10-11 — FSE cut tab-reaches-links as docs/specs/leftovers-22.md (lf22-tab-links K1-K4, lf22-rail-roving V1 after lf21); Tab rows checked in WKWebView via an offscreen NSEvent harness; 0118 waits on Pablo.
- 2026-10-12 — hs-ui Q1: hero counts as one sr-only phrase, visual stats aria-hidden (A6 §3, I40), rides lf22-rail-roving.
- 2026-10-12 — I40 taken into lf22-rail-roving as FR-7 and gate row V2.
- 2026-10-13 — leftovers-22 answers: tab-reaches-links Amendment 1 (link vs button rule for F1-F5, skip link not rendered under a modal, row counts as one phrase, group head two stops, strip and Roles in the roving set), rows T6-T12.
- 2026-10-13 — FSE cut tab A1 as docs/specs/leftovers-24.md (lf24-controls, lf24-rail-keys, lf24-drawer-skip); 0120 waits on Pablo.
- 2026-10-13 — leftovers-24 graded: tab-reaches-links Amendment 2 (describedby, focus stays, drawn-order walk, folds as stops, omit never-acting items, menu upward, rename name, comma-free list), rows T13-T21; shortlist sent for leftovers-25.
- 2026-10-13 — leftovers-25 cut (0121 to Pablo); agreed F2's cell list is dead code and goes (no second cell list).
- 2026-10-13 — leftovers-25 graded: tab-reaches-links Amendment 3 (scroll region a stop while it overflows, described facts carry nouns), rows T22-T23.
- 2026-10-13 — names for every scroll region added to tab A3 §1 (FR-3 carry, next batch after leftovers-26).
- 2026-10-13 — tab A3 §1 and the design system: scroll stops keep their native role (FSE's leftovers-26 A1).
- 2026-10-14 — wd-ui U1: the person description says the waiting count after the mail word whenever the badge draws it (tab A3, T23).
- 2026-10-14 — ss-ui U2: scroll stops keep an inset ring and pad their content ≥4 px (tab A3 §1, T22; design system).
- 2026-10-14 — launch-progress spec (Bring crew up, Run card, New agent while seats start; failed twice), rows L1-L7.
- 2026-10-14 — leftovers-27 graded: launch-progress Amendment 1 (result heading, list of this press only, Close the list, dated failure row, deaf/capped badges draw the count, ring floor 2 px as built), rows L8-L12.
- 2026-10-14 — task-rows spec (lf28 findings): stalled amber not red, n× its forecast, fact before title, verb lands on the supervisor or the card, capped words; rows N1-N5.
- 2026-10-14 — leftovers-29 graded: launch-progress Amendment 2 (landed row centred then kept in view, Seat up closes at 5 s, failures never time out, shared amber kept), rows L13-L14.
- 2026-10-14 — lvw-ui answered: launch-progress Amendment 3 (landed row keeps an 8 px scroll margin, focus after a self-close goes to Reattach all only if it was in the list), rows L15-L16.
- 2026-10-14 — sup67 close: launch-progress Amendment 4 (no launch button with every seat live, Reattach all retired, race says 'Every seat is already running', L16 target moves to the first Attach), rows L17-L18.
- 2026-10-14 — cb-ui answered: launch-progress Amendment 5 (press answer applied at once, live region clears before repeating, dead confirm closes, focus fallback chain Attach → Bring n up → Retire…), rows L19-L22; design-system rule 'the newest answer wins, and focus never drops'.
- 2026-10-14 — leftovers-32 scope note accepted: empty-then-say only for sr-only live regions; visible live text keeps its words (design system reworded).
- 2026-10-14 — nw-ui answered: launch-progress Amendment 6 (assumed-live row reads running with Attach from the press's session names, dead confirm says why, 100 ms re-say gap via setTimeout, chain with no list = every row), rows L23-L25; design-system rule reworded.
- 2026-10-15 — pr-ui answered: launch-progress Amendment 7 (assumed row reads idle, busy Start aria-disabled keeps focus, focus then words in both cases), rows L26-L27, L24 amended; design-system busy rule.
