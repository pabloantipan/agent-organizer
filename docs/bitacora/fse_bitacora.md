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
- **Running:** sup1 (organizer-probe-sup1, started 2026-09-26 ~21:45) owns
  `longer-session-names` and `drain-ceiling` (0024). I hear about it only
  through card commits; I do not read its pane.
- **Running:** sup2 (organizer-probe-sup2) owns the redesign's wave 1, the
  six backend cards (0023 accepted 2026-09-26 with the design-system
  amendment FR-23, G17, G18). Next for me: when wave 1's last card lands in
  `done/`, write sup3's prompt for wave 2 (the five view cards) and spawn it.
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
- **Rejected:** opening a card for 0012 (the Decisions tab was built
  directly, a6ebd4d..280f58c).

## Open questions

- none yet
