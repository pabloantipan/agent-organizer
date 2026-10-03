# fse — bitácora

What I don't know yet, and the hand-off to my next session. The file is the
record; an item that becomes a thread points at the thread instead of
restating it (the discuss skill).

## HAND-OFF — 2026-09-30 (3), 0069 ruled; sup25 not started; restart by Pablo

Read first: `agents/fse.md`, the fse skill, `references/standing-up.md`
("Spawning a supervisor, the line"), then this section and the two below it.

- **Last SHA seen:** d184114 (mine). Not pushed: 222ad92 onward.
- **Cell facts:** no reconciler (README, cell.json, Pablo 2026-09-26), even
  if a launch prompt says I am one; stalled threads are Pablo's.
- **0069 ruled** (pablo, "Ok", accept as written, 549217f). Both cards
  (header-fold-2, widths-and-focus) record it (eded9e4); both pass
  `organizer run organizer <slug> --print` (only the builders' task prompts
  are missing, and those are the supervisor's to write).
- **Next action: start sup25** for both cards in parallel. The last session
  was refused by the Claude Code auto-mode permission classifier on (a)
  `discuss-api token add organizer sup25` + writing
  `~/.local/share/organizer/prompts/organizer-sup25.{prelude.sh,md}`
  ("Create Unsafe Agents") and (b) closing hook thread
  01M3SCC44ZBTNZBTSZM98V18G3 by curl POST ("External System Writes"). Pablo
  was told; he restarts the seat. Do not retry by another route: ask
  him whether it is now allowed, or hand him the lines to run.
  Recipe: the prelude from standing-up.md with sup25; launch in a new iTerm
  window, pass its window id in the prompt; then set both cards' next to
  "sup25 builds it" and commit. The prompt drafted last session said:
  you are sup25, load supervise; task ruled by 0069; two cards in parallel,
  one builder each in its own worktree (header-fold-2: initiative-header am. 3
  FR-10..16, gate G12-G17+G11; widths-and-focus: responsive-home am. 3
  FR-13..19, gate G13-G18+G8); boundaries disjoint, hold each builder to its
  own; both ui_review (docs/ux/memory.md, the 3f3df2f ranking); write each
  builder's task prompt at prompts/organizer-<slug>.md; forecast 40-70 min
  over one wave, actual in the run record; open tabs in window id N, never
  "current window"; task ends when both cards are reviewed, merged, in done/,
  run record written, seats ended, a commit to working-on/ says so.
- **Waiting on Pablo:** the transversal-roles scoping (OPEN section below,
  thread 01M3SBV952KNT4XMBTXMQHZDFC); crew-and-context; factory-integration.
- **Hephaistos, 2026-09-30:** spec-craft has step 5b (check gate rows,
  trace every "no X change"/boundary claim to its source, a one-line result
  under "Decisions cited") and applies from the next accept record. The
  supervise finding on changed tasks is postponed; a changed task goes into
  a fresh seat's launch prompt.

## OPEN — 2026-10-03, rulings 0072 and 0073

- Pablo: "I accept recommendations go on" (FSE session). 0073 amend A14,
  0072 accept as written, leftovers batched (12d6019). sup26 told (decision,
  thread 01M41B2BR8NATVMPRHVQHQM8MY). Aglaea asked to rank sup25's leftovers
  into amendments, U2 included (thread 01M41B2BRFY6W55KSBC307ZWY5).
- Order: time-zoom (sup26, re-review) -> decisions-view (new supervisor when
  time-zoom is in done/) -> leftovers-3 (after Aglaea's ranking and its
  accept record). Rebuilt and reinstalled the app from main on Pablo's ask.
- Aglaea ranked (2b6d608); I wrote amendment 4 of both specs, cards
  header-fold-3 and home-widths-4 (depends_on decisions-view), decisions-view
  widened to B1-B14, and proposed 0074 (8ed2ec3). Waiting on Pablo.
- time-zoom merged 2c0292f, done 3ef7c7e, ~45 min vs 45-90. sup26 ended by
  me. Run records live in ~/organizer/runs/, gitignored (local by design);
  moved sup26's there from agent-slack/docs/runs (my prompt named the old
  place). Leftovers to aglaea (thread 01M41BMCN93DZYWK5SZFNEBEVM); spec-craft
  5b proposal to hephaistos (thread 01M41BMCNH2AM10EG4BTKSS255).
- 0074 ruled (117e269). sup27 ran decisions-view (2fd42fa) and time-zoom-2,
  ~45 min vs 40-75, ~$32; ended by me. sup28 launched for header-fold-3 and
  home-widths-4 (window 394068), held until time-zoom-2 landed for shared
  files (9b71bf4). sup27's findings to aglaea for leftovers-4. End sup28 on
  its done.
- Pablo "al recommendation accepted. Go on": 0075 accept, 0076 folds last
  (ce75486; FR-20 and G19 amended; sup28 told). Tab question (Aglaea's Q1)
  unanswered: no spike; the DS line covers it. sup29 launched for
  zoom-decisions-polish (window 395002). make install after sup28 lands.
- sup28 closed (header-fold-3 4f17404 21 min; home-widths-4 c8cc059 ~80
  min working, 4h39m wall, ~3h18m waiting on 0076; ~$48). Ended by me.
  Installed the app from main 1c6eca9. Findings to aglaea (leftovers-5,
  thread 01M41YCPTBFVQDFS9CQW76DQ14); fixture and S4 traps to hephaistos.
- Repetition: 0076 cost 3h18m of a 4h39m wave. A gate-vs-measure conflict
  raised while Pablo is away stalls a task. Second time a decision blocked a
  wave mid-build (0073 was the first, quicker). Watch for a third.
- leftovers-5 cut, 0077 proposed (55c1ecc). sup29 closed zoom-decisions-polish
  (d92e33e, 45 min, ~$23), ended by me. sup30 runs markdown-and-labels.
- S4 open: UI reviewers share Pablo's WebKit storage (bundle id
  cl.antipan.organizer). zdp-ui's pre-review copy sits in
  .wt-notes/zdp-ui/webkit-before, not restored (his app was running): his
  call. My "clear the state" line in sup29/sup30 prompts was wrong (it wipes
  his own layout); sup30 corrected to copy-and-restore. Durable fix: a test
  bundle id for review builds; a card to propose.
- sup29's leftovers (U2 focus after "Show the other 66", U3, U4, R2, gate
  gaps) not yet sent to aglaea: batch with sup30's.

## OPEN — 2026-10-03, sup25 ended; its findings not yet triaged

- sup25's task closed (aff199a): 46 min against 0069's 40-70, all four
  reviews passed first time. Run record runs/2026-10-03-header-fold-2-widths-and-focus.md
  ("Found, not asked"). Ended by me: probe -k, token rm, organizer clean,
  prompt files removed. sup26 (time-zoom) still running.
- To triage with Pablo: U2 needs his reading of 0069's note (record head
  stays at top while scrolling vs only lands there); W1 (wide's start at
  2200 cuts goals with the rail open), W2 (which signals fold first), W3
  (Escape after clicking record text does not close the rule box) are sev 2;
  U1 sev 2; the rest sev 1 or spec cleanup (G13/G15 wording, FR-11 untested).
- Run records live in <initiative root>/runs/ now (supervise skill), not
  ~/agent-slack/docs/runs/. sup26's prompt named the old place; the skill wins.
- Repetition: a spec boundary named the wrong file (StageRoadmap.tsx held
  "current", not Roadmap.tsx). spec-craft 5b traced the claims I wrote, not
  where the words live: first time; second time, propose a grep step.
- Second gate error the same day: time-zoom A14 contradicted my own T5 and
  the spec's States row (review fail 3b533f5; 0073 proposed, 049fe66).
  spec-craft 5b checks claims against sources, not gate rows against the
  spec's own notes. Second recurrence of "my 5b missed it": propose to
  Hephaistos a 5b line, "read every gate row against the Technical notes
  and States", once 0073 is ruled.

## OPEN — 2026-10-03, sup25 running; Decisions view review asked

- sup25 launched (Pablo "ok"): token added, prelude and prompt in
  ~/.local/share/organizer/prompts/organizer-sup25.*, iTerm window 393104,
  session organizer-probe-sup25; cards marked in 17d19ba. Let go; end it
  when both cards are in done/ (standing-up.md, "Ending a supervisor").
  header-fold-2 merged 4afddc0, in done/ (7c0e979). time-zoom: sup26
  launched, window 393369, session organizer-probe-sup26; end it when
  time-zoom is in done/.
- Pablo's Decisions sub-view ask (collapsible sections, scroll length, tiles,
  median in days, headings; "the operator spends most time here") is with
  aglaea, thread 01M417NHHRR2WP7XPY69XM438N. Her review and spec 9386d15;
  card decisions-view (after header-fold-2, time-zoom) and proposed 0072 in
  a93dd92. Help already names working-on/decisions/ (how-we-build.md:122).
- Hook threads not closed (curl POST refused before); not retried.

## OPEN — 2026-10-03, roadmap time zoom

- Pablo: "we have dates at the top of the graph, we need to be able have time
  zooming ... month there, after user action ... days and then to hours with
  mins. call Aglaea for taking this". Asked of aglaea as a question, thread
  01M416RZH3E5VPJC9D5H8PK73F: a proposed design spec for the Gantt axis
  (Roadmap.tsx). No card until it arrives; then spec-craft with step 5b. Its
  card overlaps header-fold-2's boundary (RoadmapView.tsx, Roadmap.tsx).
- Spec 6569427 (Aglaea); O1/O3 ruled as 0070 (20435e7); Technical notes,
  card time-zoom (depends_on header-fold-2) and proposed 0071 in 4781b3a.
  Passes run --print. Waiting on Pablo for 0071.

## OPEN — 2026-09-30, transversal roles in Deltagos

- Asked by Pablo through Hephaistos, thread 01M3SBV952KNT4XMBTXMQHZDFC: show
  Hephaistos, Aglaea, Ariadna, Talos and Hermione in Deltagos "properly". The
  five scoping questions (placement, what each role shows, odyssey-only roles
  on lodestar, how a session is recognized, show or also start) are in that
  thread as a question to pablo. No spec until he answers; then spec-craft
  with step 5b, and Aglaea on the design.
- Checked on lodestar: probe-hefesto is listed under "not in any initiative";
  organizer-probe-aglaea is a session under the organizer, not in the crew.
  The talos and hermione skills are not installed here; there is no ariadna
  bitácora.

## HAND-OFF — 2026-09-30 (2), 0069 proposed; restart asked by Pablo via Hephaistos

Read first: `agents/fse.md`, the fse skill, `working-on/roadmap.yaml`,
`agents/people.md`, then this section; the previous hand-off below still
holds for rules learned and the supervisor recipe.

- **Last SHA seen:** 0631f00 (mine). origin/main pushed at 6564f76 this
  session; 222ad92 and 0631f00 are not pushed yet.
- **Settled with Pablo today:** Deltagos v0.2.0-635-g83e8450 installed;
  install-current-build-2/-4, app-review-with-pablo, fse-pilot and
  header-review-2 moved to done/ with his words; Draft the cell later ("we'll
  draft the cell ahead"); no minutes for sup16–sup24 given.
- **Aglaea:** alive with the fixed watcher (resume-wake, agent-slack
  8272a91); comm check acked. A seat whose agent died comes back with
  `probe -r <session>`. Her ranking 3f3df2f is spec'd.
- **Open, waiting on Pablo:** 0069 (accept the leftovers batch: amendment 3
  of docs/specs/initiative-header.md, card header-fold-2, and of
  docs/specs/responsive-home.md, card widths-and-focus; parallel, both
  ui_review, forecast 40–70 min). Aglaea's tall-record condition folded in
  (0631f00). Both cards pass `run --print` (task prompts are the
  supervisor's).
- **0069 ruled** (pablo, "Ok", 549217f); recorded on both cards (eded9e4).
  sup25 NOT started: the token add, prelude and prompt were refused by the
  permission classifier, and so was closing hook thread 01M3SCC44ZBTNZBTSZM98V18G3.
  Waiting on Pablo to allow it.
- **Next action (was):** when 0069 is ruled, record it on both cards (next:
  launchable) and start sup25 for both cards (recipe in the hand-off
  below; next number sup25). If sent back or amended, amend both specs.
- **Also waiting on Pablo:** crew-and-context (rule a live camp ask from
  Needs me); factory-integration (record_url in config); the four small
  candidates in the hand-off below.

## HAND-OFF — 2026-09-30, every task landed; nothing of mine runs

Read first: `agents/fse.md`, the fse skill (authority table; "Ending a
supervisor" in references/standing-up.md, changed on disk 2026-09-30, reread
it), `working-on/roadmap.yaml`, `agents/people.md`, then this section. The
sections below this one are history.

- **Last SHA seen:** 533ef12 (header-fold to done). No supervisor or seat
  runs. Tokens: organizer/aglaea, fse, pablo. Aglaea sits beside me as a seat
  (0053), session organizer-probe-aglaea; mail her at `aglaea`. Read
  `docs/ux/memory.md` before asking her.
- **Landed 2026-09-29/30 (all merged on main, runs/ has each record):**
  cell-draft, cell-definition-finish (discovery-in-a-cell am. 1); frontend-tests
  (0052, vitest); home-rule-and-rows, cell-screens-fix, conform-and-waiting
  (lead-side-fixes, 0055/0056/0057); ui-leftovers (0058); responsive-home
  (0061/0062/0065) and responsive-home-2 (0067); rename-deltagos (0066: the app
  is Deltagos, CLI and ids stay organizer); rule-box-finish and header-fold
  (initiative-header, 0063/0064/0068, am. 1 Go fact charter_modified, am. 2
  "N decisions waiting"). Last merges: header-fold 3a3454d, rule-box-finish
  421dd9b, responsive-home-2 d5abf1f, rename 27c81a6.
- **Open, mine, next:**
  1. The UI leftovers of the last waves are with Aglaea to rank (asked in
     thread "responsive-home-2 landed: its sev 2-1 leftovers"): R1–R5 from
     responsive-home-2 (R1 sev 2: wide 1920 with the rail open cuts goals),
     plus header-fold's UI U1, U2 and 7+3 sev 2-1 (working-on/done/header-fold.md
     ## UI review), and the spec gap FR-2/H5: which wins when an expanded
     record is taller than the view. When her ranked file comes, spec one
     batch with ui_review cards and an accept record with forecast.
  2. `header-review-2` is delivered by header-fold and rule-box-finish;
     moving it to done/ is not mine (no gate): ask Pablo.
  3. Small candidates, not cut: DecisionsView owner phrase if still "—";
     fixture-home.sh talks to the live organizer-fixture mailbox; rule.go
     signs "in the organizer on <machine>" (0066 scope; ask Pablo);
     `make test` needs `pnpm install` on a fresh clone.
- **Hephaistos applied 0054 and 0066 (claudecode 542204d):** the design
  system is Aglaea's in its skill; skills and install/doctor tooling say
  Deltagos. Its mail hook dropped every [for hephaistos] note until ef0142b
  (2026-09-29): repetitions 4 and 5 may need resending if not acknowledged.
- **Wake 2026-09-30 (FSE session after b27b9c2):** no card moved since
  533ef12. Aglaea has not answered the leftovers thread
  (01M3RCXDRAHWDQSD34QPZ97Y3X); her session organizer-probe-aglaea is
  EXITED in zellij (her watcher still reads alive, mail drained, 0
  undelivered), so the ranking will not come until the seat is resurrected.
  Asked Pablo. His answers, same session: (1) "Do": I reopened her
  session with `probe organizer-probe-aglaea` in a new iTerm window and
  re-sent the ask. (2) "install the last version possible": `make install`
  put Deltagos v0.2.0-635-g83e8450 in /Applications (the build flips
  frontend/wailsjs/runtime file modes; restore with git checkout). (3) "we'll
  draft the cell ahead" (stage 5 exit a waits, later) and "yes to the
  other": the five cards moved to done/ with his words in Notes. No minutes
  for sup16–sup24 were given; the Waiting-on-Pablo line below is settled
  except Draft the cell.
  Pablo then killed that pane's agent; `probe -r organizer-probe-aglaea`
  in a new iTerm window brought her back (`claude --resume`, mail drained).
  Rule: a seat whose pane dropped to a shell comes back with `probe -r`,
  not `probe <name>`; `zellij list-sessions` without TMPDIR=/tmp shows
  stale EXITED rows, use `probe -l`.
- **Batch cut 2026-09-30:** Aglaea's ranking (3f3df2f,
  docs/ux/reviews/2026-09-30-rank-header-fold-responsive-2.md) became
  amendment 3 of initiative-header (FR-10–16, G12–17, card header-fold-2)
  and of responsive-home (FR-13–19, G13–18, card widths-and-focus; rows 7–9
  ride here, outside Home). Parallel, both ui_review, both pass `run
  --print`. Accept record 0069 proposed, forecast 40–70 min. On its ruling:
  sup25 for both. Assumption put to Aglaea: a tall expanded record keeps its
  head at the top (UI review 2 gap 1, not in her ranking).
- **Waiting on Pablo:** press Draft the cell on a real initiative (stage 5
  exit a; b is camp's); `make install` for Deltagos.app (macOS may re-ask
  keychain access; Dock keeps the old path); pablo_minutes for sup16–sup24;
  moves to done/: install-current-build-2 and -4, app-review-with-pablo,
  fse-pilot, header-review-2.
- **Rules learned this session (keep):**
  - Seats in auto mode refuse work instructed by mail (a Go write, a rebase,
    killing pids); a change of scope goes into a fresh continuation seat's
    launch prompt. Tell every supervisor: seats stop and report, never wait
    on a permission prompt. (Sent to Hephaistos as repetition 5.)
  - A blind reader (G7/G8/G9-style gates) launches outside any initiative
    root and outside ~/agent-slack (hooks and CLAUDE.md load there).
  - Before an accept record, check each gate row against the others and name
    where each FR's data comes from (repetition 4, sent to Hephaistos: G7 vs
    A1/A3; "No Go change" vs FR-9).
  - A UI reviewer costs 11–14 min of the critical path; forecasts add it.
    One-card tasks run far under the reference set (7–12 min).
  - Frontend uses pnpm; name pnpm-lock.yaml; add no fresh deps (odyssey's
    minimumReleaseAge, aebc25e).
  - Mark UI cards `ui_review: true` when cutting them. Every spec's
    "nothing broke" row runs `make test` (which now runs vitest).
  - Supervisor recipe: prompt + prelude in ~/.local/share/organizer/prompts/
    organizer-sup<n>.*, `discuss-api token add organizer sup<n>`, launch in a
    new iTerm window; end with probe -k, token rm, `organizer clean`, rm the
    two files. Next number: sup25.
  - Close each hook thread with POST /projects/organizer/threads/<id>/status
    {"status":"closed"} on 127.0.0.1:9494, bearer $DISCUSS_TOKEN.

## HAND-OFF — 2026-09-29, sup21 landed; sup22 on the rename, sup23 on the header

- **Last SHA seen:** 8119e20. responsive-home merged d8591aa; 41 min vs
  35–55 (incl. ~11 on 0065), gate_rework 1 (my G7); run record
  runs/2026-09-29-responsive-home.md. **sup21 ended.**
- **sup22 ended:** rename-deltagos merged 27c81a6, 12 min vs 19–32. Found:
  build/darwin Info.plists gained CFBundleDisplayName (outside the boundary
  as written, needed by G1); rule.go still signs "in the organizer on
  <machine>" (not in 0066's scope; candidate, ask Pablo if it bites).
  Pablo's install: macOS may re-ask keychain access; Dock keeps the old path.
- **responsive-home-2 landed (d5abf1f), 34 min vs 30–46; sup24 ended.**
  Leftovers R1–R5 (sev 2–1; R1 wide 1920 goals cut, FR-4 gated only at 3440)
  sent to Aglaea to rank with header-fold's. Gate gaps: G12's last row was a
  launch row; G9–G12 rows have a stray fifth cell (my table).
- **rule-box-finish landed (8450cac); sup24 runs responsive-home-2**
  (token organizer/sup24), while sup23 holds header-fold on 0068. End sup23
  when header-fold lands, sup24 when its card does.
- **header-fold failed G8 only (830672b):** the chip's words "N waiting"
  (FR-2, from the design) leave a newcomer guessing. **0068** ruled "N decisions
  waiting" (9cfb369); FR-2 amended; sup23 relaunches a seat with rebase + chip. The hdr-rule-review permission prompt went
  unanswered 90 min; sup23 replaced the reviewer (hdr-rule-review2, told not to
  kill fixture stand-ins). Repetition (5), third occurrence, sent to Hephaistos:
  auto-mode seats refuse work instructed by mail (Go write, rebase, pid
  kill); a fresh seat's launch prompt works. Proposed for the supervise skill.
- **Learned (sup23):** a "reader who never saw the app" launched at the
  initiative root gets CLAUDE.md in context; blind readers launch outside it.
  Applies to every timed-reader gate (G9, G7, G8).
- **header-fold decide: (046c69e)** answered by spec amendment 1 (7925401):
  charter_modified, one Go fact for FR-9; sup23 told.
- **Running:** sup22 on `rename-deltagos` (0066); sup23 on `header-fold` and
  `rule-box-finish` (0063, 0064 file only), tokens organizer/sup22, sup23.
  End each when its cards land.
- **Next:** when rule-box-finish lands, start a supervisor for
  `responsive-home-2` (0067 accepted; compact to 1439). header-review-2
  closes when header-fold and rule-box-finish land.
- **For Aglaea later:** header-fold's and rule-box-finish's UI reviews.
- **Stage 5 exit (a):** Pablo presses Draft the cell on a real initiative;
  (b) camp's. pablo_minutes for sup16–sup21: ask Pablo.

## HAND-OFF — 2026-09-29, sup20 landed; sup21 on responsive-home

- **Last SHA seen:** 2ff4292. ui-leftovers merged 508d9a8; 47 min vs 30–46
  (UI reviewer 14 min on the path); run record runs/2026-09-29-ui-leftovers.md.
  **sup20 ended.**
- **Running:** sup21 on `responsive-home` (0061, 0062 left from the rail;
  carries 0060's "you"), token organizer/sup21. End it when the card lands.
- **responsive-home UI review → Aglaea's Amendment 1 (836866a)** → build
  amendment 2 (FR-7–12, compact to 1439), card `responsive-home-2` (after
  responsive-home and rule-box-finish), **0067** accept.
- **0066 (Pablo, in my session): the app is Deltagos**, "what you see, plus
  the .app"; CLI, bundle id, paths, keychain, repos, ids stay organizer.
  Card rename-deltagos, **sup22 running** (token organizer/sup22). Told
  Hephaistos (skills, factory docs) and Aglaea (design-system title).
- **0063 accepted ("Go", f399664):** header-fold and rule-box-finish wait on
  responsive-home landing. 0064 ruled "file only" (0b830f6): FR-9 and G10
  written firm.
- **responsive-home failed review on G7 only (1a7cb88):** my gate copied
  A8 (one screenshot, all twenty) without checking A1/A3; impossible at 1024
  and 1512. **0065** ruled "scroll allowed under the minute" (30a55f0); G7 and A8
  amended; sup21 told to rerun the reader.
  Wrong-gate rule followed: amended nothing. sup21 told it waits on 0065.
- **Repetition (4), second occurrence, proposed to Hephaistos:** a spec
  claim of mine not checked before accept: responsive-home's G7 copied A8
  against A1/A3 (1a7cb88), and initiative-header's "No Go change" when FR-9's
  mark had no data source (046c69e). Both cost a builder or reviewer round.
  Proposed: a spec-craft pre-accept check (each gate row against the others;
  each "no X change" against where every FR's data comes from).
- **Header:** Aglaea's design (6c93a49) → build spec
  `docs/specs/initiative-header.md`, cards `header-fold` and `rule-box-finish`
  (parallel, after responsive-home, ui_review), **0063** accept (changes
  redesign FR-17; forecast 45–70 min), **0064** editing goal/scope (recommend
  file only). On both: one supervisor after sup21.
- **Open from sup20:** FR-10's "no owner everywhere" missed DecisionsView
  ("owner —", outside the boundary); fixture-home.sh talks to the live
  organizer-fixture mailbox (not hermetic). Candidates for the next small card.
- **Forecast note:** three UI-reviewed waves ran 25, 27, 47 min; the reviewer
  costs 11–14 min of the path. Keep the +10, widen the high end.
- **Stage 5 exit (a):** Pablo presses Draft the cell on a real initiative;
  (b) camp's.

## HAND-OFF — 2026-09-29, sup19 landed; the UI findings go to Aglaea for triage

- **Last SHA seen:** 0c162ea. conform-and-waiting merged d4f5658; 27 min vs
  20–36 (UI reviewer 11 min of the critical path); run record
  runs/2026-09-29-conform-and-waiting.md. **sup19 ended.** Nothing of mine
  runs; tokens: aglaea, fse, pablo.
- **ui-leftovers UI review, UI1 (sev 3, outside the card):** at 1024×640,
  Answer lands on Conversations with an 8 px timeline under the initiative
  header: the lead answers blind. Sub-views are out of responsive-home (0061
  as written), so it goes with header-review-2's "header fold" to Aglaea for
  a design, after sup20 reports. Its other U-findings: read with the report.
- **0061 ruled ("Go", 3a4bb3d).** 0062 ruled "left from the rail" (70bdfc3),
  written into FR-4. responsive-home waits only on ui-leftovers landing.
- **Aglaea's responsive design (3174fc2)** → build spec
  `docs/specs/responsive-home.md`, card `responsive-home` (after ui-leftovers,
  ui_review, carries 0060's "you" as FR-6), **0061** accept (forecast 35–55
  min), **0062** wide: left or centred (recommend left). On both ruled and
  ui-leftovers landed: one supervisor.
- **0060 ruled "you" (6aac168):** the lead's own records read "1 waiting ·
  you"; an FR in the next UI card (sup20 had launched).
- **0059 ruled "1024 is real" (45dc799)**; Pablo asks for "kinda responsive"
  (wide monitor and a 14" laptop), relayed to Aglaea for a design spec (thread
  "0059: Home at 1024 and wide"). Next UI card: her spec or the stage-shortening
  FR, and twenty-at-a-glance records both widths.
- **0058 ruled ("Do", ce21cb0): sup20 runs ui-leftovers**, token
  organizer/sup20. 0059, 0060 open: if ruled while sup20 runs, they go to the
  next UI card, not this one. Last SHA seen: ce21cb0. Pablo's aebc25e: pnpm on
  odyssey refuses packages younger than minimumReleaseAge; no fresh deps in cards.
- **Aglaea's triage (ec3ecbb):** 14 rows, V1–V4; design system gained
  "Focus and names" and "said once per view". Spec `docs/specs/ui-leftovers.md`,
  card `ui-leftovers` (ui_review), records **0058** accept (forecast 30–46
  min), **0059** Home's width (row 9, no FSE recommendation), **0060** "you"
  or "pablo" (row 13, recommend "you"). On 0058: one supervisor; fold 0059/
  0060 FRs first if ruled.
- **Learned:** a UI reviewer sits on the critical path (11 of 27 min, 11 of
  25 in sup18); both shared MCP browsers can be busy, so it may run its own
  headless Chromium. Forecasts with a UI reviewer: add ~10 min per wave.
- **Stage 5 exit (a):** Pablo presses Draft the cell on a real initiative;
  (b) camp's.

## HAND-OFF — 2026-09-29, sup18 landed; sup19 on conform-and-waiting

- **Last SHA seen:** f7bc069 (0057 ruled "Do"). sup18's wave landed
  (a72173b cell-screens-fix, 74a6c97 home-rule-and-rows; run record
  runs/2026-09-29-lead-side-fixes.md): 25 min vs 20–36, UI reviewers ran in
  parallel (11 m, 5 m). **sup18 ended.**
- **Running:** sup19 on `conform-and-waiting` (FR-10–12), token
  organizer/sup19. End it when the card lands.
- **Next batch (not cut, 0057 was accepted as written):** the UI reviews'
  sev 2–1 findings: home-rule-and-rows `## UI review` U1–U8 (U1 the clamp
  hides the recommendation, skip `## Options`; U2 focus skips the record,
  no aria-describedby; U5 the Rule box's Decisions link can call
  openDecision, one line) and cell-screens-fix U1–U4 (U1 focus lost after
  Draft the cell/Cancel/link; U2 IN_DEFINITION_WAITS beside the real
  blocker). Read both cards in done/, then one spec amendment and a card
  after sup19, ui_review, with an accept record and forecast.
- **Stage 5 exit (a):** Pablo presses Draft the cell on a real initiative;
  (b) camp's.

## HAND-OFF — 2026-09-29, lead-side-fixes raised; sup17's card landed

- **Last SHA seen:** 57fcea3. `frontend-tests` landed (merged 45e85f8; 18
  tests over queue and initiativeState); actual 7 min vs forecast 19–32 (run
  record runs/2026-09-29-frontend-tests.md). **sup17 ended** (probe -k, token
  revoked, clean, prompts removed). `make test` now runs the frontend tests.
- **Learned (sup17):** the frontend uses pnpm: a card touching frontend deps
  names `pnpm-lock.yaml`, not `package-lock.json` (my frontend-tests card had
  it wrong). `make test` on a fresh clone fails until `pnpm install`. Untested
  still: seat rows (deaf/capped) and inactive initiatives in needsMeRows.
  Forecast error: a one-card test task ran at a third of the low end; small
  single-card tasks should get their own reference set once there are five.
- **0054 ruled (5b2df77): Aglaea owns docs/design-system.md** on the
  organizer; told her and Hephaistos (its skill claimed it). F9 and the
  disabled pattern are hers to write, then code changes come to me as cards.
- **0055 ruled ("Do", 270108a): sup18 runs home-rule-and-rows and
  cell-screens-fix in parallel**, each with a UI reviewer (first such wave);
  token organizer/sup18, prompts in ~/.local/share/organizer/prompts/
  organizer-sup18.*. End it when both land.
- **0056 ruled ("waiting says whose", baa5c81) after sup18 launched:**
  lead-side-fixes amendment 1 (FR-10, G8).
- **Aglaea's design-system rewrite (7b6afd4)** → amendment 2 (FR-11, FR-12,
  G9) and **0057** (proposed). One card `conform-and-waiting` (FR-10–12,
  ui_review) replaces waiting-says-whose; depends on both sup18 cards. Next
  supervisor after sup18, on 0057 ruled.
- **Aglaea** told where her findings went (thread
  01M3PW6Z2H9YV25E6GQG7CJWVE). Not carried: F4–F6, F8, C9, C10.
- **Stage 5 exit (a):** a draft on a real initiative (Pablo presses Draft
  the cell); (b) camp's.

## HAND-OFF — 2026-09-29, stage 5's build landed; sup17 on frontend-tests

- **Last SHA seen:** 42c63b8 plus sup16's run record
  (runs/2026-09-29-cell-draft-and-finish.md): 37 min over 2 waves vs 40–65
  forecast, 0 rework. **sup16 ended** (probe -k, token revoked, clean,
  prompts removed).
- **Running:** sup17 on `frontend-tests` (0052), own window, token
  organizer/sup17; forecast 19–32 min. End it when the card lands.
  Aglaea (seat beside me, 0053) asked to review stage 5's cell screens,
  thread 01M3PVQZ7JS5F40030Z09M2NMS; her findings come back [for fse]; the
  design-system ownership question rides her answer; raise it as a record.
- **Aglaea's first look (3e374f1, docs/ux/reviews/2026-09-29-first-look.md):**
  F1 sev 3, Home names cut to 4–5 chars at the 1024 minimum; F2 sev 3, Rule
  from Needs me shows no question, option meanings or recommendation; F3
  sev 2, "quiet" beside "1 blocked"/"1 waiting" (against FR-6 of
  twenty-at-a-glance, ruled: a record, not a card); F4–F9 minor. Held until
  her answer on the cell-screens review, then one batch. **0054** raised:
  who owns docs/design-system.md (recommend Aglaea; Hephaistos's skill claims
  it too). Read docs/ux/memory.md before any ask of her.
- **Stage 5 exit:** (a) needs a draft shown on a real initiative: Pablo
  presses Draft the cell on one with a goal and people.md and no cell (the
  Open path was never pressed by a gate); (b) is camp's move into building.
- **sup16's open points (not built):** accept-record rule duplicated
  (draft.go, Crew.tsx); RunReview/openAgentTerminal duplication; retire
  --retirable omits "in definition" as a reason; disabled Bring crew up reads
  near-enabled (to Aglaea); Home's Needs me subtitle omits launches (to
  Aglaea). Candidate small card after her review.
- **From now on:** every spec's G5 includes `cd frontend && npm test` once
  frontend-tests lands; UI cards get `ui_review: true` when I want Aglaea's
  reviewer in the wave.
- **Still open:** header-review-2 (spec and records), the roadmap forecast
  display card (0049), Pablo's moves to done/ (install-current-build-2 and
  -4, app-review-with-pablo, fse-pilot); pablo_minutes for sup16: ask Pablo.

## HAND-OFF — 2026-09-29, stage 5's amendment raised

- **Last SHA seen:** 02f5652 (no `working-on/` change after it before this
  session; no mail on wake).
- **Done this session:** amendment 1 of `docs/specs/discovery-in-a-cell.md`
  (FR-3 from 0047 and drafting.md, G4; FR-1 adds the rail; FR-5 no
  "N retirable" in definition; FR-6 Bring crew up says why; FR-7 open).
  Cards `cell-draft`, then `cell-definition-finish`; both pass
  `organizer run organizer <card> --print` (the task prompts are the
  supervisor's). Records: **0050** accept the amendment (forecast 40–65 min
  over 2 waves), **0051** Home's state for a cell in definition (recommend a
  Launch row in Needs me), **0052** a frontend test runner (repetition 3,
  below). Stage forecast block written in `roadmap.yaml`.
- **0050 ruled (62f0a8b, "Accepted"); sup16 runs both cards** (spawned
  2026-09-29, own window, token organizer/sup16, prelude and prompt in
  ~/.local/share/organizer/prompts/organizer-sup16.*). FR-7 left out: 0051 is
  open; when ruled, FR-7 gets its own card. **Next:** when both cards land,
  read sup16's closing report and end it (standing-up.md, "Ending a
  supervisor").
- **0051 ruled (d10c0d0, "a Launch row in Needs me"):** FR-7 and G7 written
  into the spec and cell-definition-finish before it launched (065dbcc);
  sup16 told in thread 01M3PSKFXGCD889WBEG7D0GW2X. Last SHA seen: 065dbcc.
- **0052 ruled ("vitest over lib/", "Do"):** card `frontend-tests` cut, depends
  on cell-definition-finish (it changes lib/queue.ts); **next:** when sup16's
  task ends, start one supervisor for it. From now on every spec's G5 includes
  `cd frontend && npm test`. 0052 carried no forecast line (my miss: the
  rule covers every accept record); the forecast is on the card's Notes.
  On 0052 "vitest over lib/", cut its card.
- **Checked:** camp's six seats all have `agents/<seat>.md`, so FR-2 does not
  refuse camp (cell-persona-check's review point 2).
- **Aglaea (2026-09-29, Hephaistos relay; renamed from Daedalus):** the
  Product Designer pair role, `aglaea` skill; ask with `[for aglaea]` to
  pablo (`[for daedalus]` is no longer read). Pablo's rulings (decisions.md
  "Aglaea", via Hephaistos): a wave gets a UI reviewer only on a card I cut with
  `ui_review: true`; post to an `aglaea` seat once this initiative has one;
  her participants are persona agents (`simulated`), a real user only on my
  ask to Pablo for a severe finding; read `docs/ux/memory.md` before asking
  her (none here yet); who owns the design system is a proposed record the
  first time I work with her. sup16's and frontend-tests' cards predate it:
  no `ui_review` flag (frontend-tests has no UI). **0053 (4ca1b37):** the organizer has an
  `aglaea` seat beside me (token organizer/aglaea, agents/aglaea.md; not in
  cell.json); I mail `aglaea` directly. Seated by Hephaistos 2026-09-29: session
  `organizer-probe-aglaea`, watcher alive (agents 82dc03c). Her first wake
  posts to me once: up, up to three findings, and the design-system question.
  **Next with her:** when cell-definition-finish lands, one mail to `aglaea`
  asking a review of both sup16 cards' screens (Draft the cell's loading and
  error states named nowhere).
  The design-system ownership record is raised with her on the first ask. When sup16's cards land, ask it to review
  cell-draft's and cell-definition-finish's screens (amendment 1 named no
  loading or error state for Draft the cell).
- **Still open from the 09-28 hand-off:** header-review-2 (spec and
  records), the roadmap's forecast display card (0049), Pablo's moves to
  done/ (install-current-build-2 and -4, app-review-with-pablo, fse-pilot).

## HAND-OFF — 2026-09-28, stage 5 starting

- **Read first:** `agents/fse.md`, the fse skill (authority table, "Ending a
  supervisor"), `working-on/roadmap.yaml`, `agents/people.md`.
- **Roadmap (0032):** stages 1–4 done (0039, 0044, 0046). **Current: stage 5
  `discovery-in-a-cell`.** Spec `docs/specs/discovery-in-a-cell.md`, cards
  cell-in-definition, cell-persona-check, discovery-gate-shown; 0048 ruled by Pablo
  from the app; sup15 landed all three (discovery-gate-shown,
  cell-in-definition, cell-persona-check; run record
  runs/2026-09-28-discovery-in-a-cell.md, gate_rework 0) and was ended.
  sup15's open points for a follow-up amendment and card: (1) the spec's
  Goals name the rail for "in definition" but FR-1 does not, and the rail
  shows nothing (my inconsistency: pick one, likely FR-1 plus the rail);
  (2) a cell in definition still offers "N retirable"; (3) Home's state says
  "quiet" beside "cell in definition"; (4) Bring crew up is enabled on a seat
  with no persona file and refuses only after the click; (5) no unit test for
  Overview's gate-into-building logic. Stage 5's exits are not met yet: (a)
  needs the drafting card (0047), (b) is camp's move into building. 0047 ruled "a drafting session". The
  procedure now exists (claudecode 807cd47: persona-agents "Drafting a roster
  from an initiative", references/drafting.md; draft markers `"draft": true`
  in cell.json; accept record NNNN-the-cell-roster). **Next session, first:**
  amend discovery-in-a-cell FR-3/G4 and cut the drafting card: a "Draft the
  cell" button whose prompt is "load persona-agents, follow
  references/drafting.md at this root"; the organizer shows the draft as in
  definition and refuses to launch a crew while `draft: true`. Fold sup15's
  five open points into the same amendment. Supervisor recipe (own window, identity prelude, recipe in
  the fse skill's references/standing-up.md). Camp is the live case; its
  roadmap lacks a gate on its first building stage (camp's FSE owns that).
- **Also open (2026-09-28, Pablo from v0.2.0-348):** `header-review-2` (header
  fold, the waiting chip opens Decisions, a label on the stage strip, editing
  goal/scope in the app) needs a spec amendment and records; 0049 (estimating
  effort and time: forecast from run records vs appetite vs FSE estimates)
  waits on Pablo, and on "forecast" goes to Hephaistos for the skill.
- **0049 ruled (forecast from run records):** method in `docs/estimating.md`;
  relayed to Hephaistos for the skills. It is now the factory's
  (roadmapping/references/estimating.md, claudecode bb12016): a per-stage
  `forecast:` block in roadmap.yaml (range, waves, waits, basis, as_of;
  recomputed, never hand-set). Next: every accept record carries a forecast
  line; spec the roadmap's forecast display reading that block.
- **Running:** nothing but Pablo's `organizer-probe-builder` and me. Tokens:
  fse, pablo. `main` pushed, even with origin at a5c75f8 or later.
- **Installed:** v0.2.0-348 (rule-anyone, read-only archived, stage 3).
- **Waiting on Pablo:** move to done/: install-current-build-2 and -4
  (superseded), app-review-with-pablo, fse-pilot (0043 kept it).
- **Rules I keep:** end every supervisor when its last card lands (read its
  closing report; probe -k; revoke tokens; organizer clean); relay Pablo's
  answers to the supervisor waiting on them; gate rows name the exact
  command and output; never build a card by copying another; cross-initiative
  actions go to Hephaistos (`[for hephaistos]` subject, to pablo).
- **Older detail** below is history; the lines above supersede it.

## HAND-OFF history (2026-09-26 to 2026-09-28)
### — 2026-09-26, the redesign spec is out

- **Last SHA seen:** bf0e085 (the mockups in `docs/specs/redesign-mockups.html`).
- **Task:** the UI redesign, thread 01M3G3SE8B4QAK39G6JY2W8ZH8 (Pablo, 0015).
  Delivered: `docs/specs/redesign.md` (proposed), cards `redesign-*` (11, two
  waves, all pass `organizer run organizer <card> --print`), records 0021
  (Q4), 0022 (Q5), 0023 (accept the spec).
- **Done:** sup1's task (0024): drain-ceiling and longer-session-names both
  passed review 2026-09-26. The installed app (`/Applications/organizer.app`,
  the `organizer` on PATH) predates it and still warns at 22; `make install`
  is Pablo's.
- **Done 2026-09-26:** the redesign (0015, 0023): wave 1 (sup2) and wave 2
  (sup3), 11 cards, all passed review. The installed app still predates it;
  `make install` is Pablo's. Next task: 0025 ruled "both": sup4 ran
  retire-keeps-the-cell (passed review, in done/); the intake and the roadmap wait on Pablo. 0005 ruled
  (as drafted, §12 dropped); 0002 none for now; 0004 withdrawn. fse-pilot:
  when Pablo reports his minutes per wave, propose keep or drop.
- **Observed:** sup1 seated `w1a`/`w1b`, not `wave<N>-*` (short because of
  the name ceiling). sup2 was told to seat `wave1-<name>`. If a third
  supervisor does it again, that goes in the repetition log.
- **Goal work (2026-09-27):** goal and measure in `initiative.yaml`; 0029
  (six sub-goals) and 0030 (scope, discovery to building, cells drafted from
  the initiative, a seventh sub-goal) ruled. Next: when the blacksmith's
  format change for `scope` and the stage phase label lands in the
  working-on and roadmapping skills, and Pablo gives the organizer's scope,
  propose `working-on/roadmap.yaml` as a record: one stage per sub-goal,
  order 1, 4, 3, 2, 7, 6, 5.
- **The Help's source (0031):** `~/agent-slack/docs/how-we-build.md` (agent-slack
  a5465b3), per the blacksmith, thread 01M3HTFVT8VXSMXQDV9N7NBP6H: who is
  involved, who talks to whom, the life of an initiative (discovery to
  building), idea to running software, inside one agent's work, glossary.
  patterns.md, workflow.md and one-pager.md are engineering-facing, not for
  the Help. The blacksmith's view: the Help renders the file and never copies
  it; a missing diagram is asked of the blacksmith and added there. That is a
  design proposal, not a ruling: the stage-3 spec cites it as an assumption
  (the app reads a file outside its repo).
- **Stage 2 (twenty-at-a-glance):** roadmap written (0032, aebee4f). Spec
  `docs/specs/twenty-at-a-glance.md` and cards glance-scope-phase,
  glance-header-phase, glance-home-state (bb47225); 0033 accepted 2026-09-27;
  sup5 ran it: all three cards passed review 2026-09-27, so stage 2's code
  is done; the stage's exit also needs the organizer's
  scope (Pablo) and goals on active initiatives (owners), then an "exit met"
  record. The blacksmith is now Hephaistos: its posts start `[hephaistos, for pablo]`; reach it by posting to pablo with a subject starting `[for hephaistos]`.
- **2026-09-27 later:** sup5 done and retired itself. 0034, 0035, 0036 ruled;
  sup6 ran glance-needs-me-lead and glance-inactive-fold; both passed review. Terminating the
  seven PLV initiatives went to Hephaistos (thread 01M3HZSXFQ1EV5BFH8ARSZ71JR);
  the organizer keeps camp, organizer, agent-slack. `app-review-with-pablo`
  holds his three findings from the installed app (long header, no Rule on
  the Decisions tab, no scroll): review with him soon, then spec.
- **Stage 2 exit (2026-09-27):** 2 met (phase), 3 met (goals on organizer,
  camp, agent-slack da6bde8), 4 met on the fixture by a model (5 s). Left: 1,
  the organizer's scope in Pablo's words. Then propose "stage
  twenty-at-a-glance: exit met" as a record.
- **sup8 done (2026-09-28):** glance-header-scroll and glance-rule-in-decisions
  passed review. `app-review-with-pablo` has no gate; closing it (done/) is not
  the FSE's. Installed app predates both.
- **Stage 3 (machine-explains-itself), current since 0039:** spec
  `docs/specs/machine-explains-itself.md`, cards explain-help,
  explain-health-words, explain-health-all-agents (643469e); 0040 accepted
  2026-09-28; sup10 ran it: all three passed review; G7 all right in 70 s. 0041 ruled: fix
  first. sup11 runs explain-finish then install-current-build-3. After both
  land: propose stage 3 exit met. Found: the capped remedy is wrong since agent-slack 8991640
  (the next prompt delivers), fixed by FR-5.
- **Installed:** v0.2.0-229-g3472f6b (sup7, install-current-build passed).
- **Waiting on Pablo:** the intake (thread 01M3FAWKV2159MCSH0AZZJWE08); 0021, 0022, 0005, 0004, 0002. No card carries `stage:` until the
  organizer has a roadmap, which waits on the intake.
- **Learned:** this session hit the drain ceiling (8 per session) at about
  21:20: `health` shows fse undelivered 2 while the hook logs
  nothing_to_deliver. Read threads with GET `/threads/<id>` (it does not
  advance the cursor). A fresh session (`probe -r organizer-probe-fse`) clears it.
- **Learned (my error, 8d42553):** the shell is zsh; `for c in $VAR` does
  not word-split, so a loop over a space-separated variable writes one file
  named after all of them. sup2 cleaned it up in 713d2aa. Loop over a literal
  list or `${=VAR}`.
- **The blacksmith (2026-09-26):** the pair session posts as `pablo` with the
  prefix `[blacksmith, for pablo]`; a relay, a ruling only where it quotes
  Pablo and says where (fse skill). Its unprefixed earlier messages: the
  redesign task, the two FSE rulings, the design-system amendment; their
  rulings stand as relays. Records 0021 and 0022 were written there and
  quote Pablo's choice.
- **Learned (2026-09-26):** sup2 launched deaf: `opus.prelude.sh` exports only
  the model. Fixed with its own prelude and `probe -r`; the recipe is now in
  the stand-up reference (claudecode 29a8aac).
- **Cleanup 2026-09-27:** sup1–3 killed, `organizer clean` run, sup3 token
  revoked; organizer holds tokens for fse and pablo only. For the next
  supervisor: add its token first (the recipe).
- **Learned (2026-09-28):** a supervisor's closing report goes to pablo, not to
  me, and it can carry items "open for the FSE" (sup5, sup6). I missed two for a
  day. When a task's last card lands, read its supervisor's closing thread
  (health's thread list, GET the thread) before proposing the next step.
- **Rule from now on (Pablo, 2026-09-28: "you have to kill supervisor window
  and clean up"):** when a task's last card lands, read the closing report,
  then `probe -k` the supervisor and any seat it left, revoke their tokens,
  restart the API once, `organizer clean`. One new iTerm window per supervisor
  is what Pablo wants (his amendment via Hephaistos, 2026-09-28); its crew
  are tabs in it. End a supervisor whose task is superseded. In the skills:
  claudecode 88e1fcb, fse skill "Letting go ends when the task does",
  standing-up.md "Ending a supervisor". Cleaned today: sup5 to sup10 and
  install2-build; sup11 still runs.
- **2026-09-28 later:** 0045 (anyone may rule; ruled_by is the ruler;
  alejandro is Pablo). sup14 ran rule-anyone and install-current-build-5 (v0.2.0-348, both pass) and was ended;
  sup13 ended as superseded (its card 4 failed review on my wrong gate 3).
  I wrote two gates wrong on install cards: name the exact command and
  output that decides each row. And never build a card by copying another:
  install-current-build-5 carried card 4's state until sup14 reset it (512b2cd).
- **Done 2026-09-28:** sup11 ended (no closing message; run record
  runs/2026-09-28-explain-finish-and-reinstall.md); worktrees removed;
  .gitignore takes runs/, .wt-notes/, .playwright-mcp/ (6ad2c71); origin/main
  (odyssey's initiative description and specs) merged clean, tests and
  frontend build green, pushed fc26867, even with origin. 0044 proposes
  stage 3 exit met; sup13 reinstalls.
- **Was: when sup11 lands** (Hephaistos, thread 01M3K60BV5B85ZA42YW0ZS77KG, Pablo:
  "finish the cleaning"), as part of ending sup11, once no seat is working:
  (1) `git pull --rebase` and push `main` (ahead 100, behind 6 of origin; odyssey
  pushed 106681b), settling conflicts with the owning supervisor; (2) `git
  worktree remove` .wt/explain-finish, glance-header-phase, glance-home-state,
  glance-scope-phase; (3) add `runs/`, `.wt-notes/`, `.playwright-mcp/` to
  .gitignore. Then tell Pablo the repo is even with origin.
- **2026-09-28:** 0042 ruled, sup12 ran glance-archived-read-only (pass, 2bffd31); sup12 ended. 0043: the FSE
  pilot is kept.
- **Learned (2026-09-28):** my commits wake nobody, so a supervisor parked on a
  `decide:` never sees Pablo's answer on the card. sup11 sat idle 9 h. When
  Pablo answers a card's decide:, relay his answer to the card's supervisor
  as a `decision` message quoting him.
- **Rejected:** opening a card for 0012 (the Decisions tab was built
  directly, a6ebd4d..280f58c).

## Open questions

- From cell-draft's review (b6862dd, found not asked): the accept-record rule
  (slug the-cell-roster, proposed, highest number) is written twice,
  `acceptRecord` in draft.go and in Crew.tsx; `openAgentTerminal` repeats
  RunReview's terminal half; the button's Open (writes the prompt, opens a
  terminal) was never pressed by any gate; fixture persona files are thinner
  than drafting.md §3–4. Its point (1), a draft offering "1 retirable" and an
  enabled Bring crew up, is already FR-5/FR-6 of cell-definition-finish (a
  draft is in definition, FR-3e). Candidates for after the task; the Open path
  is the first thing to show Pablo or Aglaea on a real initiative.

- From sup14 (found, not asked): the Rule box lowercases the cell human while
  ruled_by keeps its spelling; no test of the Decisions tab's Rule condition;
  `wails build` dirties frontend/wailsjs/runtime on every install (with the
  VERSION item, a Makefile card). Candidates, not raised.

- The header's "N decisions waiting" still counts an archived initiative's
  records (sup12, found not asked; FR-13 named only the pill and
  Conversations). May explain Needs me 18 in Pablo's screenshot. Candidate card.

- Home's live-agent count dropped once after the first 10 s sample in the built
  app (review of explain-health-all-agents). Seen once, not investigated.

- **Repetition (1):** my supervisor prompts all say `seat: wave1-<name>`, so every
  task restarts at wave 1 and seat names collide across tasks (sup8 renamed
  wave1-header and wave1-rule, cee898b). If it recurs: number waves per
  initiative, or seat by task (`<stage>-<name>`). FR-9 of the redesign
  groups by `wave<N>-`; any change is a record.

- The Makefile's `VERSION ?=` re-runs `git describe --dirty` after
  `wails build` flips `frontend/wailsjs/go/main/App.{d.ts,js}` to 100755, so
  every `make install` ends with `-dirty` while the binary is clean (sup7,
  thread 01M3J29YBHEVGYG277K7WTD696). Candidate card: pin VERSION before
  the build and keep the modes. Not raised.
- **Corrected (sup7):** the install's failed review came from a `no -dirty`
  check in sup7's review prompt, not from my gate. The gate stood; 0037 was
  moot. My earlier belief that the gate was ambiguous was wrong.

- **Repetition (3), generalized as 0052:** frontend logic with no test,
  because there is no frontend test runner: sup14 (the Decisions tab's Rule
  condition) and sup15 (Overview's gate into building). Second occurrence,
  so proposed, not built.

- **Repetition (2):** zsh does not word-split an unquoted variable. It bit me
  (8d42553), and the fixture doc's `kill $FIXTURE_AGENT_PIDS` (review of
  glance-home-state). A third time means proposing a line in a shared skill.
- `queueOf` reads `pablo:` cards only in initiatives with a cell; such a card
  elsewhere never reaches Needs me (glance-home-state Notes). Candidate card.
- G9 was timed by a model (5 s); stage 2's exit wants Pablo reading the real
  Home in under a minute. The exit-met record asks him to time it.

- Found by sup4, not asked (thread 01M3GCSAS9H71K58HZQG5JEY6K): `organizer crew`
  on an empty roster still opens an empty iTerm window; retire's plan text is
  blank after the last seat. Candidate cards; not raised yet.

- `organizer rule` writes and commits with no dry run, unlike `retire --run`,
  `crew --print`, `run --print` (review note, `done/redesign-rule-record.md`).
  Not raised yet; a candidate `proposed` record if it bites.

- none yet
