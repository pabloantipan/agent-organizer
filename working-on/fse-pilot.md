---
title: A standing FSE seat on the organizer, as a pilot
status: now
repos: [organizer]
branch: main
updated: 2026-09-26
next: "pablo: report your minutes on each redesign wave (run records); then the FSE proposes keep or drop on pablo_minutes, gate_rework and decide_turnaround"
---

## Context

Pablo's hand-off of 2026-09-26: an FSE seat turns his rulings into
launch-ready cards and keeps the specs coherent, never policy. Piloted here.
The seat and its authority: `agents/fse.md` (the cell's own repo). The
pattern: `~/agent-slack/docs/patterns.md`, "The FSE seat".

## Done

- Cell `organizer` with one seat `fse` (`agents/cell.json`, own repo,
  ignored here), linked as `~/agent-slack/ops/cells/organizer.json`;
  tokens for `fse` and `pablo` issued by `bootstrap.sh organizer`
- Persona `agents/fse.md`, resume prompt `agents/fse-prompt.md`, bitácora
  `docs/bitacora/fse_bitacora.md`
- `working-on/` tracked in this repo; `agents/hooks/post-commit` linked as
  `.git/hooks/post-commit`: a commit touching `working-on/` posts one
  `status` to `fse` as `pablo`, a thread per commit, fail open
- Docs: patterns section, a proposed decisions entry (`ruled-by:` empty),
  Pablo's-side columns in `docs/runs/TEMPLATE.md`

- Gate 2026-09-26: a card commit posts one `status` to `fse`; a commit
  without a card posts nothing; with the API unreachable the commit succeeds
  silently
- Launched 2026-09-26 13:01 as `organizer-probe-fse` (Opus, 6% at start);
  its first turn read the persona and stopped, as the opening prompt says.
  Gate 6: a card commit at 13:02 woke the idle pane through `watch --external`
  in about 2 s; it handled both hook messages and closed their threads

- Ruled by Pablo 2026-09-26: the FSE spawns a supervisor per defined task
  and is never one; it stays clean of orchestration and of reconciling, so
  the cell has no reconciler (`agents/fse.md`, `cell.json`)

## Next

1. Pablo rules the decisions entry, and names the as-built row it reverses
2. Two waves with the run record's new columns filled, then keep or drop

## Blockers

none

## Notes

- The hook posts as `pablo` because a seat never receives its own posts, and
  discuss has no hook identity. The FSE's own commits are skipped by
  `AGENT_NAME=fse`.
- Card edits in this initiative must be committed now, or the FSE never
  hears of them and the other machine never sees them.
