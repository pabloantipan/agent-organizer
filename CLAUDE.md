# CLAUDE.md — organizer

Wails v2 desktop app plus CLI, Go backend, React + TypeScript frontend. It scans
configured roots for `working-on/initiative.yaml`, reads the Kanban cards next to
it, pushes one snapshot per machine to Firestore under the signed-in user, pulls every machine's, and shows
one merged board. It is read-only over the card files.

## Initiative

This directory is an initiative root: it holds copies of the repos listed in
`working-on/initiative.yaml`. Work happens here and is ported back later.

- Current state lives in `working-on/*.md` (cards) and nowhere else. Read the
  open cards' frontmatter at session start. Update the card whose next action
  changed when you finish a piece of work. Follow the `working-on` skill.
- Repos inside this root are ported elsewhere. Never create `working-on/` or
  initiative files inside them.

## Layout

- `main.go` dispatches: a known subcommand runs `internal/cli`, anything else launches the app.
- `app.go` is the Wails-bound surface; it only calls `internal/service`.
- `internal/service` sequences scan, cache, sync, merge. CLI and app both use it.
- `internal/scan` finds initiatives and parses cards. The reference behaviour is
  `~/.claude/skills/working-on/hooks/working-on-session`.
- Manual priority is `model.Order` (initiative ids, card slugs per initiative). It is app state in the cache and one Firestore document `users/{uid}/meta/order` (last writer wins), never a card field. `merge` applies it to the board and to `organizer status`.
- Identity: `internal/auth` is Firebase Authentication over REST (sign in, sign up, refresh, reset); `auth.Manager` keeps the ID token in memory and the refresh token in the Keychain (`internal/keychain`, service `cl.antipan.organizer`, items `refresh_token`, `account_email`, `passcode`). The refresh token is never written anywhere else. `internal/lock` is the local passcode (argon2id, 5 failures then 30 s cooldown); a cloud sign-in also unlocks and may reset it.
- `internal/sync` is Firestore native over REST (`BaseURL` swappable for tests): `users/{uid}/machines/{machine}/initiatives/{id}` with a JSON `payload` field, `users/{uid}/meta/order`. Rules in `firestore.rules`, database `organizer` (a second named database; the project's default one is Datastore mode and stays untouched). Each machine writes only its own subtree. Signed out is a skip, not an error. `internal/merge` builds the board; local wins.
- Board interaction model is Trello's, not its code: a left rail of initiatives (boards) by priority with drag to reorder, three fixed columns, card drag within a column only when one initiative is selected, and a centered card back. Drag is `@hello-pangea/dnd`. Cross-column drag stays disabled because it would write a status. A fourth Done column appears only with one initiative selected, collapsed, newest first, capped at 10, read-only.
- Visual direction (Pablo's pick): dark only, warm near-black with a purple cast (#1a1523), one solid electric purple accent (#8a3ffc), magenta as a tone, red for blocked. No gradients, no two-tone buttons, no white cards, no light theme. Statuses: now light purple, blocked rose, next periwinkle, done dim. Manrope Variable bundled via fontsource. Tokens in `frontend/src/styles/tokens.css`.
- `frontend/src`: zustand store, plain CSS tokens, `hooks/useWails.ts` wraps the
  generated bindings in `frontend/wailsjs`.

- Planning dates: card `due`, initiative `target` and `milestones` (all optional, all must be real; the skill forbids invented dates). The Calendar tab is a month grid of dues, milestones, and targets with an overdue and next-30-days agenda. `frontend/src/components/Roadmap.tsx` is a Gantt: one row per open card over a shared axis, milestones and target on the axis, today as a line. Bar start = card `start`, else the branch's first commit from git (`scan.branchSpans`, main/master excluded), else `updated`; bar end = `due`, else today for `now`, else the branch's last commit. No span means a dot. It lives only in the Roadmap tab (`RoadmapView.tsx`), which shares the rail with Board and Calendar: nothing selected shows `Portfolio.tsx`, one Gantt row per initiative in priority order (earliest card or branch start to target, latest due, or today); an initiative selected shows its card-level Gantt. Board, Calendar, and Initiatives do not embed it. Never use chips for initiative selection; the rail scales, chips do not. `App.MilestoneType` exists only so Wails emits the nested type.
- Agents: `scan.Agents` joins three sources: the process table (`ps`, processes whose binary is `agent_binary`, default claude; `-n`/`--resume` args give the session name; `lsof -d cwd` gives the directory), `zellij list-sessions -n`, and the probe layouts in `probe_state_dir`. States: working (CPU time grew since the previous sample, tracked in `Service.prevCPU`), running, shell (session without an agent process), exited (layout only). `AssignAgents` groups by longest initiative root prefix of the cwd, then probe family; the rest are `unassigned_agents`. `App.agentTicker` samples every 10s while the window is open (`RefreshAgents`: processes and sessions only, no git) and emits the Wails event `agents`; the store's `applyAgents` patches live/working counts into the board so rail, header, Initiatives, and the Agents tab all move without a rescan. No daemon: nothing runs when the app is closed. Lifecycle goes through `~/bin/probe` so layouts, markers and iTerm profiles stay consistent: New agent = `probe --wrap <initiative>` then `<initiative>-probe <name> <dir>` (or `-t` for an animal name) in a new iTerm window; Kill = `probe -k <session>` (conversation stays resumable); Stop = SIGTERM to a plain-terminal pid after re-checking its binary. Working = CPU rate over the sample interval >= 1% of a core. Attach = iTerm2 profile named after the session, Terminal `probe <name>` fallback. `organizer agents` prints the grouping.
- Agent hand-off: `internal/prompt` renders a review prompt from the live scan (repos, open cards, next actions, staleness, scanner problems) plus the update rules of the working-on skill. `organizer prompt <id>` prints it; `--run` and the board button write it to `~/.local/share/organizer/prompts/<id>.md` and open a terminal at the initiative root running `<agent> "$(cat file)"`. The agent command is `agent` in config, default claude.
- Record: `internal/record` is the write-only client for discuss-record (spec authority: agent-slack `specs/factory-push-spec.md` §7–8, `specs/record-spec.md` §4). `organizer factory-key [--rotate]` signs the developer in, POSTs `/v1/factories/keys` with the ID token and writes `~/.local/state/discuss/push.key` 0600; `--rotate` issues, writes, then revokes the old key by sha256, in that order. The factory id is `<state>/factory`, written once from `machine`. `CreateCrew` writes the cell's `push` flag from `cell.json` into `<state>/projects.json` (merge, other cells kept) and, when `record_url` is set and a key exists, registers the cell (`POST /v1/factories/{f}/cells` with initiative id, title, client; 2xx or 409 both count as registered). The key is never logged and never stored anywhere else.

- Packaging: `make build|dmg|install|universal`, version from `git describe` into `main.version` via ldflags (`organizer version`, shown in the top bar). `scripts/make-dmg.sh` uses hdiutil only. `.github/workflows/release.yml` builds a universal app on tags `v*`, signs and notarizes only when the Developer ID secrets exist, and attaches the DMG to a GitHub Release. Bundle id `cl.antipan.organizer`, min macOS 12. Logs: `~/.local/share/organizer/organizer.log`.

## Commands

```bash
go test ./...                                  # unit tests, fixtures in testdata/home
UPDATE_GOLDEN=1 go test ./internal/cli/        # refresh the status golden file
go run . status | board | doctor | sync        # CLI against the real home
go run . prompt <initiative-id> [--run]        # agent review prompt, or open a terminal running it
wails dev                                      # app + http://localhost:34115 for browser dev
wails build                                    # build/bin/organizer.app
wails generate module                          # regenerate frontend/wailsjs after changing bound types
firebase deploy --only firestore:rules --project <p> # after editing firestore.rules
```

## Conventions

- Config: `~/.config/organizer/config.yaml`. Cache: `~/.local/share/organizer/state.json`.
- Bound Go types need json tags; the Wails generator turns a field-name collision into
  a duplicate TypeScript identifier (that is why the initiative's origin machine is `created_on`).
- `wails dev` builds into the same `build/bin/` as `wails build` and removes its binary on exit, leaving an empty `.app`. After any `wails dev` session, run `wails build` again before launching the app from Finder.
- Card statuses are a closed set: now, blocked, next, done. Do not add one here; change the skill.
