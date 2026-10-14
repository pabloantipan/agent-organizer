# Needs me task rows: words and colour (aglaea, 2026-10-14)

From sup65's close (`runs/2026-10-14-sup65-leftovers-28.md`,
`working-on/done/lf28-task-rows.md` UI review, tr-ui) on the over and
stalled task rows (agent-slack 0014, `docs/specs/leftovers-28.md`). This
is for the batch after leftovers-29.

## 1. Stalled is amber, not red (the colour question)

Red is blocked's alone (design system), and blocked means stopped, waiting
on something outside. A stalled task is late: its supervisor has not posted
for too long, and nobody has said it is stuck. Red would make every late
task look like a blocker.

- **`stalled`**: the `--warning` lozenge (amber text on `--warning-bg`;
  amber on the ground measures about 10:1). The word carries the meaning,
  the colour only ranks it.
- **`over`** stays `--tone` (magenta), past its forecast but moving.
- Escalated keeps `--danger`, since it is an ask of the lead.

## 2. Say the multiple (U2)

Replace `twice its forecast` with **`<n>× its forecast`**, `n` rounded
down: `10 m, 5× its forecast`. A row under 2× does not show the multiple.
The forecast is in the hover: `forecast 1-2 m`.

## 3. The fact comes before the title (U4)

At narrow widths the ellipsis cuts the end of the line, so the line is
ordered to put what matters first:

`stalled · 10 m, 5× its forecast · init-a 0011 · Accept the task watch`

The lozenge comes first, then the fact, then the id, then the title, so the
title is what gets cut. On the second line, the asker's health comes
before the record and the card: `hestia not picking up · record 0011 ·
w-task now`. The full text stays in the hover and the accessible name.

## 4. The verb lands on the task (U3)

`Agents` landing on a view that names nothing about the task leaves the
lead to search. The row's verb goes where the task lives:

- **The task's supervisor session is live**: the verb is **Agents**, and it
  lands on Agents with that session's row scrolled into view, highlighted
  as `openAgentsAt` does for a seat, and focused. Its name is `Agents,
  supervisor of 0011`.
- **No live supervisor**: the verb is **Open**, and it lands on the task's
  card back (`w-task`) in Work, focused on its title, where the next action
  and the Discuss section are.

## 5. A capped asker (U1), as the FSE reads it

After the seat name the row uses the health table's blocker words
(`HEALTH[state].blocker`): `hestia capped, mail waits for its next
prompt`. A capped seat with a live watcher is never called "not picking
up".

## Acceptance

| # | The lead can | Checked by |
|---|---|---|
| N1 | tell late from stuck | `stalled` uses the warning lozenge (amber), `over` the tone, and blocked and escalated stay red |
| N2 | read how late | at 10 m on a 1-2 m forecast the row reads `5× its forecast`; under 2× no multiple is shown; the forecast is in the hover |
| N3 | read the fact at 1024 | at 1024×640 with the rail open and a 60-character title, the lozenge and `<m>, <n>× its forecast` are whole and the title is what the ellipsis cuts |
| N4 | land on the task | with a live supervisor, Agents lands focused on its session row; without one, the verb is Open and lands on the card back's title |
| N5 | not restart a capped seat | a capped asker reads `capped, mail waits for its next prompt`, never `not picking up` |
