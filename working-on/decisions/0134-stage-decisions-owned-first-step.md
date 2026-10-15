---
title: "Stage decisions-owned-and-used: exit 1 is already met; the first change from decision data"
status: ruled
raised: 2026-10-15
raised_by: fse
owner: pablo
ruled: 2026-10-15
ruled_by: pablo
options: ["record exit 1, act on the waits", "record exit 1, wait for more data", "not yet"]
chosen: record exit 1, act on the waits
cards: []
threads: []
supersedes: []
superseded_by:
stage: decisions-owned-and-used
---

## Question

Stage `decisions-owned-and-used` became current with 0132. Its two exit
items, read against the records on this Mac today (`organizer decisions`,
2026-10-15):

1. **Records owned by someone other than the lead exist on at least one
   initiative.** Already met, without identity: camp's 0003 and 0004 are
   owned **and ruled** by alejandro (2026-09-27), and camp's 0005 (its first
   roadmap) is his and waiting. Of 177 records, 3 are not owned by you.
2. **One change traced to decision data.** Not met. What the data says:
   166 ruled, median turnaround 0 days; you rule what reaches you the same
   day. The waits are elsewhere: five records are waiting, four of them for
   9 to 18 days (camp 0005 owner alejandro 18d, camp 0007 and 0008 yours
   16-17d, agent-slack 0013 yours 9d). All four sit on initiatives you are
   not working in this week, so a record there waits until someone opens it.

## Options

- **"record exit 1, act on the waits"**: the FSE stamps exit 1 met with the
  camp evidence, and drafts one small leftovers card from the data: a
  waiting record older than 7 days says its age on its Needs me row and
  sorts first, and a record owned by someone else than you shows its owner
  there with "waiting on <owner>" (today it reads like yours). If that card
  lands and those four records move, exit 2 is met by a change traced to
  the data.
- **"record exit 1, wait for more data"**: stamp exit 1 met; no card until
  more owners than alejandro rule records.
- **"not yet"**: say what is wrong with the reading.

## Recommendation

The FSE: **"record exit 1, act on the waits"**. It needs no identity: the
`owner` field already exists. Before carding it the FSE checks with Aglaea
how Needs me shows a row that is someone else's to rule.

Separately, the four long waits are rulings only you (and alejandro, for
camp 0005) can give; the cheapest change is to rule or withdraw them.

## Ruling

pablo, 2026-10-15, in the organizer on lodestar: as recommended

## Consequences

On the first option: `met` on exit 1 in `roadmap.yaml`; one spec and card,
proposed as their own accept record with a forecast.
