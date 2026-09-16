# no-sign-in — progress

Card: `~/organizer/working-on/no-sign-in.md`. Branch `no-sign-in` in
`.wt/no-sign-in`, from main after the crew-session-names merge.

The rule being built: `auth: off` (the default) means the organizer has no
identity — no sign-in screen, no account UI, sync is a silent skip — while
`auth: firebase` keeps today's behaviour exactly. The lock is independent of
both.

| # | Phase | Gate item | State |
|---|---|---|---|
| 1 | `auth: off \| firebase` in config, default off; regenerated bindings | 1 | todo |
| 2 | The account view and `Sync` answer to the mode | 1, 2, 3 | todo |
| 3 | `login`, `logout`, `whoami`, `sync`, `doctor` with auth off | 2 | todo |
| 4 | The gate, the top bar and the store; forgot-passcode recovery | 1, 2, 4 | todo |
| 5 | README, `go test ./...`, `tsc --noEmit`, golden untouched | 5 | todo |
