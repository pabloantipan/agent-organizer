# fse — bitácora

What I don't know yet, and the hand-off to my next session. The file is the
record; an item that becomes a thread points at the thread instead of
restating it (the discuss skill).

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
