---
title: Accept the Roles design and launch roles-feed then roles-ui
status: ruled
raised: 2026-10-04
raised_by: fse
owner: pablo
ruled: 2026-10-04
ruled_by: pablo
options: [accept as written, accept without Daedalus, accept with amendments, send back]
chosen: accept as written
cards: [roles-feed, roles-ui]
threads: [01M4432DTFCSXJN9F715G84FYS]
supersedes: []
superseded_by:
---

## Question

Aglaea's design from your scope (0082): `docs/ux/specs/transversal-roles.md`
(299b221), with my Technical notes.

- **Home:** a Roles section between Needs me and the initiatives (Needs me
  stays first). One line per role: `live · 42% context` or `not running ·
  last seen 2 Oct`; what it is on (`hand-off 30 Sep · <first line>`, or `no
  bitácora yet`); `2 messages waiting`; its initiatives.
- **Rail:** a Roles group at the top, unranked; the strip shows initials and
  the live dot.
- **A click** opens a drawer: its sessions (each lands on that initiative's
  Agents), the hand-off, its mail threads (each opens Conversations), its
  initiatives. No Attach, Kill, Start or Message: show only.
- **Talos and Hermione:** one muted line, `Talos, Hermione · PLV infra, on
  odyssey`, no state, no click. This is my reading of your "maybe naming it
  here", and Aglaea's; the option below lets you say otherwise.
- **Daedalus** (head of architecture, a role since 2026-10-01) was not in
  your list; Aglaea included it. Accept as written keeps it; "accept without
  Daedalus" drops it.
- Roles are a list in config, not hard-coded. A role's mail stays out of the
  Needs me badge.

Two cards: roles-feed (Go: the data on the 10 s agents feed and `organizer
roles`), then roles-ui (Home, rail, drawer, with a UI reviewer).

forecast: 1.5-3 h of wave time over 2 waves (roles-feed, then roles-ui),
plus this decision (median 0 d); basis: 16 single-wave tasks, this
initiative (4 to ~80 min), high end raised for the first Go card in this
run and a new view.

## Options

- **accept as written** (Daedalus in, Talos and Hermione named only)
- **accept without Daedalus**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written.

## Ruling

pablo, 2026-10-04, in the organizer on lodestar: Ok

## Consequences

On acceptance: the FSE starts one supervisor for roles-feed, and one for
roles-ui when roles-feed is in `done/`.
