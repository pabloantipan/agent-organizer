---
title: Initiatives that are not active fold away from Home, the rail and Needs me
status: proposed
raised: 2026-09-27
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [fold into one collapsed group, hide entirely, as today]
chosen:
cards: []
threads: [01M3HZSXFQ1EV5BFH8ARSZ71JR]
supersedes: []
superseded_by:
stage: twenty-at-a-glance
---

## Question

Pablo, 2026-09-27: "Let's keep former initiatives terminated so we focus in
what we need … We'll keep camp, organizer, slack". Hephaistos marks the other
seven terminated (thread 01M3HZSXFQ1EV5BFH8ARSZ71JR). The organizer ignores
an initiative's `status` today: nothing reads it (`model.go`, `Home.tsx`), so
an archived initiative still shows as live on Home and in the rail, and its
queue rows still count in Needs me. What should it do with one that is not
`active`?

## Options

- **fold into one collapsed group**: `paused` and `archived` initiatives
  leave Home's list, the rail's groups and Needs me (rows and badge). They
  sit in one collapsed "Not active (n)" group at the bottom of the rail,
  and can still be opened read-only. Nothing is hidden; the focus is on the
  three.
- **hide entirely**: they disappear from the app, and are reachable only by
  un-archiving the file.
- **as today**: they stay live, and the scan reports nothing.

## Recommendation

The FSE's: fold into one collapsed group. It gives the focus Pablo asked
for, while a terminated initiative stays readable (its decisions and cards
are the record 0012 wanted kept).

## Ruling



## Consequences

The FSE cuts one card for it, in the same small wave as 0034's card if that
is ruled too, and spawns one supervisor.
