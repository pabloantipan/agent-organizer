---
title: Lift the session-name ceiling and the per-session drain ceiling, through a supervisor
status: ruled
raised: 2026-09-26
raised_by: fse
owner: pablo
ruled: 2026-09-26
ruled_by: pablo
options: [fix both now through a supervisor, live with both]
chosen: fix both now through a supervisor
cards: [longer-session-names, drain-ceiling]
threads: [01M3G3SE8B4QAK39G6JY2W8ZH8]
supersedes: []
superseded_by:
stage:
---

## Question

Two limits surfaced while cutting the redesign: probe's 22-character session
name (zellij's unix socket path on macOS) leaves `organizer-probe-` six
characters, and discuss's drain ceiling (8 per Claude session) left the FSE
seat with undelivered mail its watcher kept waking it for.

## Options

- **fix both now through a supervisor**: two cards, one supervisor.
- **live with both**: short session names by convention; restart capped seats
  with `probe -r`.

## Recommendation

None; Pablo ruled before one was written.

## Ruling

Pablo, 2026-09-26, in the FSE's session (organizer-probe-fse): "fix for
longer names. fix for getting more mails. Naturally, spawn a supervisor for
doing so".

## Consequences

The FSE cuts the two cards and spawns one supervisor for them. The redesign
waits on 0023 as before.
