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
- **Rejected:** opening a card for 0012 (the Decisions tab was built
  directly, a6ebd4d..280f58c).

## Open questions

- Found by sup4, not asked (thread 01M3GCSAS9H71K58HZQG5JEY6K): `organizer crew`
  on an empty roster still opens an empty iTerm window; retire's plan text is
  blank after the last seat. Candidate cards; not raised yet.

- `organizer rule` writes and commits with no dry run, unlike `retire --run`,
  `crew --print`, `run --print` (review note, `done/redesign-rule-record.md`).
  Not raised yet; a candidate `proposed` record if it bites.

- none yet
