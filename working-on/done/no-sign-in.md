---
title: The app runs without asking anyone to sign in
status: done
repos: [organizer]
branch: no-sign-in
updated: 2026-09-16
next: "review: branch no-sign-in, gate items 1-5 filled, unmerged"
depends_on: []
boundary: ["internal/config/config.go", "internal/service/service.go (LockState and the account view only)", "app.go (GetAccount only)", "frontend/src/components/Gate.tsx", "frontend/src/components/TopBar.tsx", "frontend/src/stores/board.store.ts", "README.md", "CLAUDE.md (one final commit, only this file)"]
spec: "CLAUDE.md Identity paragraph; docs/decisions.md 2026-09-16 (identity) in ~/agent-slack/docs"
gate: "the five items under Gate below"
review: "pass — review session, subagent, 2026-09-16; item 3's frontend-test half met by substitution, see Review"
---

## Goal
Pablo's call, 2026-09-16: no sign-in in the organizer for now; identity,
when it comes, is Azure Entra ID, not the Firebase email flow. Today the
gate shows a sign-in screen on every launch unless the user picks "continue
offline", and the second Mac's setup tells them to sign in. Neither should
happen. Firebase stays in the code behind a switch, off, so nothing is
ripped out that Entra replaces later.

## Gate
1. `auth: off | firebase` in config.yaml, default `off`; with `off` the Gate renders the board directly after the lock (if enabled), never the sign-in screen, and `offlineChoice` is not consulted — done, `config.AuthMode` (empty or unknown reads as off) and `gateStep` in `Gate.tsx`, which reaches the sign-in step only under firebase (0ed9aee, 3b0307b)
2. With `off`: no account menu, no Sign in button, no email in the top bar; `organizer login`, `logout`, `whoami` print one line saying auth is off and exit 0; `sync` prints "skipped: auth off" and exits 0; `doctor` reports `auth: off` — done, top bar gated on the mode (Sync button hidden too, a Lock button in its place when a passcode is set) and the four verbs run against a temp config in both modes (3b0307b, 082a70e)
3. With `firebase`: behaviour exactly as today (the sign-in screen, the account menu, sync); one test per mode on the Gate's decision and on `Sync` — done for `Sync` and the account view the gate decides from (`internal/service/auth_test.go`, both modes); the gate's own branch has no test runner in this repo, see Notes (c658157)
4. The lock stays independent of auth: a passcode set works with `auth: off`; "Forgot passcode" with auth off says a sign-in is not available and names the recovery (delete the keychain item) instead of showing the sign-in form — done, `ForgotPasscode` in `Gate.tsx` gives the `security delete-generic-password` line; nothing in the lock path reads the mode (3b0307b)
5. README Install and Identity say auth is off by default and Entra is the plan; `go test ./...` green, `tsc` clean, golden untouched — done (fbe75cd); `HOME=$(mktemp -d) go test ./...` green, `tsc --noEmit -p frontend` clean, `internal/cli/testdata` unchanged

## Review
**Pass** — review session, subagent, 2026-09-16. All five gate items met.

Unmet items: none. One qualification on item 3: "one test per mode on the
Gate's decision" has no test. `frontend/package.json` has no runner and adding
one is outside the card's boundary, so the decision was extracted as the pure
exported `gateStep` and verified by reading instead: under `off` the sign-in
step is unreachable and `offlineChoice` short-circuits away; under `firebase`
`gateStep` is logically identical to main's three `if`s, with `mode === null`
the only added loading condition. Both modes are tested where the decision's
inputs are made (`config.AuthMode`, `Service.Account`, `Sync`). A builder
narrowing its own gate item is the coordinator's and Pablo's call, not this
review's; recorded, not failed.

Verified: default with no `auth` key and unknown values both read as off
(`Default()` + `AuthMode`, and a built binary's `doctor` in three configs);
`login`/`logout`/`whoami` one line exit 0, `sync skipped: auth off` exit 0,
`doctor` prints `auth: off`; under `firebase` with no credentials sign-in
fails cleanly (`login` exit 2, `whoami` exit 1) — skipped nowhere. TopBar and
Settings render no account menu, Sign in, email or Sync under off; Settings'
Identity line names Azure Entra ID. Nothing in the Go lock path reads the mode
(the only mode read on the lock screen is which recovery to offer, which item
4 asks for); Forgot passcode under off gives the `security
delete-generic-password` line. `frontend/wailsjs/go/models.ts` was regenerated
in 0ed9aee, the same commit as the `config.Auth` field, and the drifted
run-gate fields it picked up (`depends_on`, `boundary`, `spec`, `gate`,
`review`) match `model.Card` in name, type and order. README Install and
Identity say off is the default and Entra is the plan. `internal/cli/testdata`
untouched. `HOME=$(mktemp -d) go test ./...` green, `go vet ./...` clean,
`tsc --noEmit -p frontend` clean.

Outside the gate, for Pablo:
- `organizer factory-key` (`internal/cli/factory.go:36`) still guards on
  `svc.Auth.Account().SignedIn` and calls `loginCmd` when signed out. With auth
  off `loginCmd` now prints its line and returns **0**, so the guard falls
  through and `FactoryKey` runs with no token: the failure is a confusing
  downstream one instead of "auth is off". The card's Notes say factory-key
  fails with auth off; this is why, and a two-line guard there would make it
  clean before identity-entra lands.
- `loadSession` now also awaits `api.getConfig()`. If that call fails,
  `authMode` stays null and the gate sits on "Starting…" forever — a new way
  to hang the window that the old two-call version did not have.
- The branch is rebased on main and **unmerged**. Closing the card does not
  merge it; `## Next` still carries the merge and the `~/claudecode/SETUP.md`
  edit.

## Done
- 2026-09-16 opened from Pablo's call
- 2026-09-16 built on branch `no-sign-in` (`.wt/no-sign-in`), 9 commits e78a3f8..4207184 on top of main 58f3a7a, left unmerged and rebased
- 2026-09-16 Settings too (boundary extended by the coordinator): with auth off it has no Account block and no Sign in button, one line "Identity is off; Azure Entra ID is planned (identity-entra card)"; firebase renders as today (4207184)
- 2026-09-16 review gaps closed on the same branch, now 11 commits e78a3f8..2560672: `organizer factory-key` with auth off prints one line naming the record's CLI and exits 2 before any network call, tested beside the other verbs (ecc562b); the Gate renders a failed start with the error and a Retry instead of sitting on "Starting…" (2560672). `go test ./...` green, `tsc --noEmit -p frontend` clean

## Next
1. Review the branch, then merge it (it is rebased on main and unmerged)
2. Then edit ~/claudecode/SETUP.md: drop the organizer sign-in row (second-laptop-factory card carries it)

## Blockers
none

## Notes
- The frontend has no test runner (no vitest, no test script in `frontend/package.json`), so gate item 3's "one test per mode on the Gate's decision" is covered where the decision is made — `Service.Account`, `Sync` and `config.AuthMode`, both modes — and `gateStep` was extracted as an exported pure function so it can be tested the day a runner exists. Adding one was outside this card's boundary.
- `organizer factory-key` refuses with auth off (it needs a developer token); `internal/service/factory.go` still signs in through the Firebase manager under `auth: firebase`. That is the record's developer-token half, on the identity-entra card, not this one.
- The worktree's `frontend/node_modules` is a symlink to the main checkout's; the worktree has none of its own.
- `config.Config` gained a bound field, so `frontend/wailsjs/go/models.ts` was regenerated in the same commit; it also picked up the run-gate card fields (`spec`, `gate`, `boundary`, `depends_on`, `review`) that had drifted out of the committed bindings.
- The record's developer-token verifier is Firebase-only (`internal/auth/firebase.go`); it is unused locally (keys come from the CLI) and is the other half of the Entra change — see the identity-entra card
