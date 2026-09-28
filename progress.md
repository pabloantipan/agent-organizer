# progress — initiative-visibility (seat wave4-initiative-visibility)

Card: `working-on/initiative-visibility.md` in the darkfactory root.
Branch: `feat/initiative-visibility` in this repo (off main `2560672`) and in
`personal-cloude` (off its main `ae7c86b`). Neither is merged; the supervisor
merges on the reviewer's pass.

## Phases

| # | Phase | State | Commits |
|---|---|---|---|
| 1 | model + scan + tests + fixtures (gate 1, 2, 3) | done | `8e418ed`, `5a46caf` |
| 2 | bindings + Initiatives body + styles (gate 4, 5, 6) | done | `febe157`, `a899bf0` |
| 3 | `skills/working-on/SKILL.md` (gate 7) | done | personal-cloude `3c42de8` |
| 4 | darkfactory `initiative.yaml`, card, this file (gate 8) | done | `<this file>` |

## Verification

- `go build ./...`, `go vet ./...` clean. `go test ./...` green except
  `TestAttachSessions` in `internal/scan`, which fails the same way on main
  `2560672` (checked in a throwaway worktree): a pre-existing failure about
  pruning a dead pid's session record, untouched by this card.
- `npm run build` in `frontend/` (tsc + vite) succeeds; `wails build` packages
  the app. The bundle in `build/bin/` was **not** installed: the running app is
  `/Applications/organizer.app` and replacing it is not this seat's to do.
- The real darkfactory root scans clean with both fields set: description
  parsed, `collector-spec/` and `agent-mailbox-specs/` resolved to six `*.md`
  files each, no problem, `target` still empty.

## Choices this card left open

- **`specs` resolves into a map, not a nested type.** `Initiative.SpecFiles` is
  `map[string][]string` (entry as written → files relative to the root). A
  `[]SpecGroup` struct would have been the obvious shape, but Wails only emits
  a nested type when something bound names it — that is why `App.MilestoneType`
  exists — and `app.go` is outside this card's boundary. A map of arrays
  generates as `Record<string, Array<string>>` with no binding hack at all.
- **Files are stored relative to the initiative root**, and the UI joins them
  with `i.path` to open them. Absolute paths would be another machine's paths
  once the snapshot syncs; the board already gates file actions on `local`.
- **Group order comes from `specs`, not from the map.** The body iterates the
  entries as written, so the order in `initiative.yaml` is the order on screen.
- **An entry that resolved to nothing still shows**, as its entry line plus
  "unresolved, see problems". The Problem says why; hiding the entry would make
  a typo invisible.
- **`.init-grid` became `repeat(auto-fit, minmax(280px, 1fr))`** so Specs sits
  beside Repos and a body with only Repos stays full width.
- **No milestones and no `target` on darkfactory.** The target is Pablo's
  (`decide:` on the card) and the roadmap needed no test to prove this gate.

## Not done, on purpose

- `skills/working-on/templates/initiative.yaml` still has neither field. Both
  are optional, and the template is outside the card's boundary. Noted on the
  card.
