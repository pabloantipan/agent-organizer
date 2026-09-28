---
title: Cloud identity is Firebase email sign-in
status: superseded
raised: 2026-09-02
raised_by: pablo
owner: pablo
ruled: 2026-09-02
ruled_by: pablo
options: [gcloud ADC, Firebase email sign-in]
chosen: Firebase email sign-in
cards: [gcp-project-and-first-sync]
supersedes: []
superseded_by: "0003"
---

## Question

Sync ran on gcloud ADC, which travels neither across machines nor across users. How does the organizer know who is syncing?

## Options

- **gcloud ADC**: already working on lodestar; does not travel.
- **Firebase email sign-in**: tokens in the Keychain, Firestore native database `organizer`, per-user rules.

## Recommendation



## Ruling

Pablo chose Firebase email and password on 2026-09-02 (the session that built sync; `done/gcp-project-and-first-sync.md`).

## Consequences

Firestore `users/{uid}/…`, the passcode lock, sign-in in the gate. Superseded by 0003.
