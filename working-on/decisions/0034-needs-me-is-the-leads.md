---
title: Needs me lists only the lead's decisions
status: proposed
raised: 2026-09-27
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [only the lead's, every proposed record, the lead's plus a waits-on-business section]
chosen:
cards: []
threads: []
supersedes: []
superseded_by:
stage: twenty-at-a-glance
---

## Question

Found by glance-home-state's builder (`done/glance-home-state.md`, Notes,
its `decide:`); the reviewer flagged it too. `needsMeRows`
(`frontend/src/lib/queue.ts`) lists every `proposed` record, whoever owns
it. On the `--twenty` fixture the badge says 6, while 3 rows say "waits on
you". The rest are owned by business people or the FSE. Should Needs me
hold only what waits on the lead?

## Options

- **only the lead's**: Needs me and its badge list records whose `owner` is
  the lead, or empty. Others show on Home as "waits on business" (FR-6),
  and on their initiative's Decisions tab. The badge then equals the
  count of "waits on you" rows. One change to `needsMeRows`.
- **every proposed record**: as today. The badge overstates what is the
  lead's; with 20 initiatives and business owners it stops meaning "me".
- **the lead's plus a waits-on-business section**: Needs me keeps the
  others below a divider, not counted in the badge. More to read; nothing
  is hidden.

## Recommendation

The FSE's: only the lead's. "Needs me" means the lead's queue and nothing
else (CLAUDE.md, the queue definition). Business-owned records already
surface as the initiative's state, "waits on business".

## Ruling



## Consequences

The FSE cuts one card changing `needsMeRows` and its badge, with a gate on
the `--twenty` fixture (badge = the lead's rows). It is stage 2's last code.
