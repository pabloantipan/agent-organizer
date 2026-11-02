# Leftovers 65: the review and dev builds refuse the real home: the build spec

status: proposed (0178)
by: the FSE, 2026-11-02, on main at e335885
sources: the incident of 2026-11-02 03:08-03:14 (bitácora, day log: a UI
reviewer ran `wails dev` with the fixture's config but Pablo's real
`~/.local/share/organizer/`, from a hand-built environment); Hephaistos's
answer to it (the UI-review checklist, 7c4554b and 8d775d4, and "the code
guard is the organizer's": a launcher that refuses when `XDG_DATA_HOME` or
`ORGANIZER_CONFIG` is unset or under the real home).

## Premises (read 2026-11-02 at e335885)

| Premise | Shown by |
|---|---|
| with `XDG_DATA_HOME` unset every data path falls back to `~/.local/share`; with `ORGANIZER_CONFIG` unset the config is `~/.config/organizer/config.yaml` | `main.go:90` `appLogger`; `internal/cache/cache.go:28`, `internal/service/service.go:888`, `internal/session/session.go:62` and five more; `internal/config/config.go:165` |
| nothing in the binary knows it is a review or dev build; the guard today is words in prompts and in the UI-review checklist, which the 03:08 reviewer did not follow | `main.go:32-40`; the incident |
| the review build is the same binary in a bundle with id `cl.antipan.organizer.review` | `scripts/review-build.sh` |
| `wails dev` compiles with the build tag `dev` | wails v2.15.0 `pkg/commands/build/base.go:217` (`tags.Add(options.OutputType)`), `internal/app/app_dev.go` (`//go:build dev`) |
| `fixture-home.sh` puts both under `mktemp -d` in `$TMPDIR`, outside the home | `scripts/fixture-home.sh:301`, `:721-722` |

## Requirements

Card `lf65-review-guard` (Go, package main):
- **FR-1** A review build (the executable's bundle, `../Info.plist` from
  `Contents/MacOS/`, has `CFBundleIdentifier` `cl.antipan.organizer.review`)
  or a dev build (tag `dev`) refuses to start the app when
  `ORGANIZER_CONFIG` or `XDG_DATA_HOME` is unset or empty, or resolves
  under the account's real home. The real home is the user database's
  (`os/user`), never `$HOME`. "Resolves" is the cleaned absolute path with
  symlinks of its existing prefix evaluated.
- **FR-2** The refusal runs first in `main`'s app branch, before the
  logger, the window or any read or write of config, cache or data: one
  line to stderr naming the variable and the reason, exit 2. CLI
  subcommands are not guarded.
- **FR-3** A dev build with `ORGANIZER_DEV_REAL_HOME=1` starts against the
  real home (the lead's own `wails dev`); a review build has no override.
- **FR-4** A production build (`wails build`, `make install`'s
  Deltagos.app) behaves as on main.
- **FR-5** CLAUDE.md, Packaging: one sentence naming the guard and the
  override.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| G1 | 1, 4 | go test of the decision over a table: build kind review, dev, production × each variable unset, empty, under an injected real home, under a temp dir, and a temp symlink pointing into the injected home | refuses exactly review and dev with unset, empty, under-home or symlink-into-home; production never; the reason names the variable (main: no guard, test absent) |
| G2 | 3 | go test: dev with `ORGANIZER_DEV_REAL_HOME=1` and both under the home; review with the same | dev starts; review refuses |
| G3 | 1 | go test of the bundle id reader over temp layouts (a bundle's Contents/MacOS/organizer) with the review plist, the production plist, no plist, and a bare binary | review only for the first; the others production or not-a-bundle |
| G4 | 1, 2 | review build in the worktree: `env -u XDG_DATA_HOME -u ORGANIZER_CONFIG HOME=$(mktemp -d) "<wt>/build/bin/Deltagos Review.app/Contents/MacOS/organizer"`, run in the background with its pid saved; after 5 s | exited 2, the stderr line names `ORGANIZER_CONFIG` or `XDG_DATA_HOME`, the temp HOME is still empty, and the real `~/.local/share/organizer/organizer.log` has the same size and mtime as before the run (main: the app starts) |
| G5 | 1 | review build launched by its own path in the same shell after evaluating the exports the fixture launcher (scripts/fixture-home.sh, read only) prints, pid saved | alive after 5 s; stopped with `safe-kill <pid>`; the real `organizer.log` unchanged |
| G6 | 2 | go test that `main` calls the guard before `appLogger` and `NewApp` (source order in `main.go`, or the guard as a function `main` returns through) | holds |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

No row starts `wails dev`, reads Pablo's real config or data, drives his
desktops, focus or input, or writes the real clipboard.

## Boundary

`reviewguard.go` (new), `reviewguard_dev.go` and `reviewguard_nodev.go`
(new, the build-tag constant) and `reviewguard_test.go` (new), all in
package main; `main.go` (the one call in the app branch); CLAUDE.md (one
sentence under Packaging).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf65-review-guard` | G1-G6, X0 | — | false |
