# fse — bitácora

What I don't know yet, and the hand-off to my next session. The file is the
record; an item that becomes a thread points at the thread instead of
restating it (the discuss skill).

## HAND-OFF — 2026-09-26, the redesign spec is out

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
  restart the API once, `organizer clean`. Launch supervisors as tabs in one
  window. End a supervisor whose task is superseded. The skill fix is
  Hephaistos's (relayed 2026-09-28). Cleaned today: sup5 to sup10 and
  install2-build; sup11 still runs.
- **Rejected:** opening a card for 0012 (the Decisions tab was built
  directly, a6ebd4d..280f58c).

## Open questions

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
