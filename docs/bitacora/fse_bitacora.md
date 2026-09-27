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
- **Next action:** when 0023 is ruled accepted, set the spec's status, write
  `~/.local/share/organizer/prompts/organizer-sup1.md` for the six wave-1
  cards (their order is the spec's Cards table; builder sessions six
  characters or fewer, see Rabbit holes), start sup1 per
  `~/.claude/skills/fse/references/standing-up.md`, note `sup1` on those
  cards, commit, let go.
- **Waiting on Pablo:** the intake (thread 01M3FAWKV2159MCSH0AZZJWE08); 0023,
  0021, 0022, 0005, 0004, 0002. No card carries `stage:` until the
  organizer has a roadmap, which waits on the intake.
- **Learned:** this session hit the drain ceiling (8 per session) at about
  21:20: `health` shows fse undelivered 2 while the hook logs
  nothing_to_deliver. Read threads with GET `/threads/<id>` (it does not
  advance the cursor). A fresh session (`probe -r organizer-probe-fse`) clears it.
- **Rejected:** opening a card for 0012 (the Decisions tab was built
  directly, a6ebd4d..280f58c).

## Open questions

- none yet
