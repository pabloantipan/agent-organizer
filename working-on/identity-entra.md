---
title: Identity is Azure Entra ID, when identity comes
status: next
repos: [organizer]
branch: main
updated: 2026-09-16
next: "decide: keep Firebase Auth as the broker with Entra as its OIDC provider (Firestore rules and the record's verifier keep working on the Firebase uid), or replace Firebase with Entra end to end (Firestore rules, the organizer's auth manager, the record's developer verifier and key issuance all change)"
---

## Goal
Pablo's call, 2026-09-16: the organizer's identity will be Azure Entra ID.
Today identity is one seam in four places: the organizer's Firebase
sign-in (`internal/auth`), Firestore rules keyed by uid, the record's
Firebase ID-token verifier for developer keys (`record/internal/auth`), and
the management app's identity (its card says "the developer's Firebase
sign-in, as the organizer"). Decide the shape before touching any of them.

## Where
| Place | Today | Entra changes |
|---|---|---|
| organizer `internal/auth` | Firebase email + password over REST, refresh token in the Keychain | the sign-in flow (OIDC device or browser flow), the token it keeps |
| Firestore `users/{uid}/…` and rules | uid from Firebase | unchanged if Firebase brokers Entra; rewritten if not |
| record `FirebaseVerifier` | Firebase ID tokens for `POST /v1/factories/keys` | an Entra JWT verifier (tenant, audience) or unchanged if Firebase brokers |
| management app | not specified; identity "as the organizer" | inherits this decision |

## Next
1. The decide line above; the tenant, the app registration and who administers it are PLV questions
2. Then one card per place, in the order the table lists them; the organizer's sign-in stays off until the first lands

## Blockers
- decide: broker or replace. Owner: Pablo
- PLV's Entra tenant and an app registration. Owner: Pablo

## Notes
- Firebase Auth accepts OIDC providers, so brokering is the smaller change and keeps Firestore and the record untouched; replacing is cleaner if PLV will not allow Firebase in the path
- Nothing here is urgent: `auth: off` (no-sign-in card) is the state until then
