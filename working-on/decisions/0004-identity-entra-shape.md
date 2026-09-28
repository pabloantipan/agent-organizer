---
title: The shape of Entra identity
status: withdrawn
raised: 2026-09-16
raised_by: pablo
owner: pablo
ruled:
ruled_by:
options: [Firebase brokers Entra (OIDC provider), Entra end to end]
chosen:
cards: [identity-entra]
supersedes: []
superseded_by:
---

## Question

When identity comes, does Firebase stay as the broker with Entra as its OIDC provider, or does Entra replace Firebase end to end?

## Options

- **Firebase brokers Entra**: Firestore rules and the record's verifier keep working on the Firebase uid; one more hop.
- **Entra end to end**: the organizer's auth manager, the Firestore rules, the record's developer verifier and key issuance all change.

## Recommendation



## Ruling

Pablo, 2026-09-26, in the blacksmith session: "Not now". Withdrawn, not ruled: auth stays off (0003) until identity is actually needed. Reopen as a new record when a second person or the record's key issuance needs it.

## Consequences


