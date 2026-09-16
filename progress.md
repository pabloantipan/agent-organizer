# no-sign-in — progress

Card: `~/organizer/working-on/no-sign-in.md`. Branch `no-sign-in` in
`.wt/no-sign-in`, from main after the crew-session-names merge.

The rule being built: `auth: off` (the default) means the organizer has no
identity — no sign-in screen, no account UI, sync is a silent skip — while
`auth: firebase` keeps today's behaviour exactly. The lock is independent of
both.

| # | Phase | Gate item | State |
|---|---|---|---|
| 1 | `auth: off \| firebase` in config, default off; regenerated bindings | 1 | done |
| 2 | The account view and `Sync` answer to the mode | 1, 2, 3 | done |
| 3 | `login`, `logout`, `whoami`, `sync`, `doctor` with auth off | 2 | done |
| 4 | The gate, the top bar and the store; forgot-passcode recovery | 1, 2, 4 | done |
| 5 | README, `go test ./...`, `tsc --noEmit`, golden untouched | 5 | done |

Verified: `HOME=$(mktemp -d) go test ./...` green (config, service and cli
tests added), `tsc --noEmit -p frontend` clean, `internal/cli/testdata`
untouched, and a built binary run against a temp config in both modes for
`doctor`, `login`, `logout`, `whoami` and `sync`.

Left for the review: the frontend has no test runner, so the gate decision is
covered where it is decided (`Service.Account`, `Sync`, `config.AuthMode`) and
`gateStep` is exported as a pure function for the day one exists.
`frontend/node_modules` in this worktree is a symlink to the main checkout's.
