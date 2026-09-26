---
title: No sign-in now; identity is Azure Entra ID later
status: ruled
raised: 2026-09-16
raised_by: pablo
owner: pablo
ruled: 2026-09-16
ruled_by: pablo
options: [keep Firebase sign-in, "auth off by default, Entra later"]
chosen: auth off by default, Entra later
cards: [no-sign-in, identity-entra]
supersedes: ["0001"]
superseded_by:
---

## Question

The second Mac's setup asked for a sign-in nobody needed. Does the organizer keep asking?

## Options

- **keep Firebase sign-in**: sync keeps working across machines through Firestore.
- **auth off by default, Entra later**: cards travel by the root repo; the Firebase code stays behind a switch.

## Recommendation



## Ruling

Pablo's call, 2026-09-16 (`~/agent-slack/docs/decisions.md`, "identity: no sign-in now, Azure Entra ID later").

## Consequences

`auth: off` is the default; sync is a silent skip; the lock stays optional. The shape of Entra is 0004.
