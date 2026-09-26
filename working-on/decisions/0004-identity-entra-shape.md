---
title: The shape of Entra identity
status: proposed
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



## Consequences


