# organizer

A desktop board for someone who runs many initiatives in parallel, on more than
one machine, with AI agents doing a lot of the work.

It answers one question fast: **which initiative was I in, on which branch, and
what is the next step?** It reads that from small markdown cards that already
live next to the code, and it never writes them.

## How it works

An **initiative** is a directory that holds the repos one line of work needs.
Inside it, a `working-on/` folder carries the state:

```
<initiative>/
├── CLAUDE.md                  # has a short "Initiative" section pointing here
├── working-on/
│   ├── initiative.yaml        # id, title, client, repos, optional target and milestones
│   ├── <slug>.md              # one card per piece of work: status, branch, next action
│   └── done/                  # finished cards, moved here untouched
└── <repo-a>/ <repo-b>/ ...
```

A card is a markdown file with YAML frontmatter. The only mandatory line is the
next action:

```markdown
---
title: Rate limit the login endpoint behind a feature flag
status: now            # now | blocked | next | done
repos: [api, web]
branch: feat/login-rate-limit
updated: 2026-09-02
next: "Decide the limit per client, then wire the flag in the api"
due: 2026-09-16        # optional, only when a real date exists
---
```

Agents (Claude Code sessions) create and update these cards by following the
`working-on` skill, which sets the format and a strict verbosity contract. The
organizer scans them, enriches them with git, shows them, and syncs a snapshot
per machine through Google Cloud Datastore so every machine sees the whole map.

The app is read-only over the files. People and agents write cards; the app
reads. The only state it owns is the manual priority order.

## Views

- **Board** — three columns, now / blocked / next, plus a collapsed Done column
  per initiative. Drag cards within a column to set priority. A rail on the left
  lists initiatives by priority; drag to reorder, click to focus one.
- **Agents** — every agent process on the machine, grouped by the initiative
  whose directory it runs in. Live and working states from the process table,
  sampled every ten seconds. Start, attach, kill, and stop, through `probe`.
- **Roadmap** — a Gantt per initiative: one row per open card, bar from the
  branch's first commit (from git) to its due date or today, milestones and the
  target on the axis. With nothing selected, one row per initiative.
- **Calendar** — month grid of due cards, milestones, and targets, with an
  overdue and next-30-days agenda.
- **Initiatives** — the index: one collapsible row per initiative with the lead
  card's next action, repo digest, live agents, and links into the other views.
- **Settings** — roots to scan, GCP project, machine name, sync interval, editor
  and agent commands.

The card back opens from any card: the markdown body, repos, and actions to
open it in the editor, a terminal at the initiative, or reveal it in Finder.

## Install

### From a release

Download `organizer-<version>.dmg` from the Releases page, open it, and drag
`organizer.app` to Applications. Releases are built unsigned, so the first
launch is blocked by Gatekeeper. Right-click the app and choose Open, or run:

```bash
xattr -d com.apple.quarantine /Applications/organizer.app
```

Optional CLI on your PATH:

```bash
ln -sf /Applications/organizer.app/Contents/MacOS/organizer ~/.local/bin/organizer
```

### From source

Requirements: Go 1.25+, Node 20+, pnpm, and the Wails v2 CLI
(`go install github.com/wailsapp/wails/v2/cmd/wails@latest`). macOS is the
primary target; Linux paths exist but are less exercised.

```bash
git clone <this repo> ~/organizer
cd ~/organizer
make install        # builds, copies to /Applications, links ~/.local/bin/organizer
make dmg            # or: package build/bin/organizer-<version>.dmg for another machine
```

The version comes from the git tag (`make version`). A tag `v*` pushed to
GitHub runs the release workflow, which builds a universal binary, packages the
DMG, and attaches it to a GitHub Release. If Developer ID secrets are configured
the app is signed and notarized; otherwise it ships unsigned as above.

Logs go to `~/.local/share/organizer/organizer.log`.

The same binary is a CLI:

```bash
alias organizer=~/organizer/build/bin/organizer.app/Contents/MacOS/organizer
organizer status                 # open cards per initiative, in priority order
organizer board                  # merged view across machines (from the last pull)
organizer agents                 # agent processes grouped per initiative
organizer prompt <initiative>    # the review prompt for an agent; --run opens it in a terminal
organizer login | logout | whoami   # cloud session on this machine
organizer sync                   # push this machine, pull all (skipped when signed out)
organizer doctor                 # roots, initiatives found, cards rejected and why
organizer config --init          # write ~/.config/organizer/config.yaml with defaults
```

## Configuration

`~/.config/organizer/config.yaml`, created by `organizer config --init`:

| Key | Default | Meaning |
|---|---|---|
| `machine` | short hostname | key prefix in Datastore; must differ per machine |
| `roots` | `~` | directories scanned for `working-on/initiative.yaml`; add the folders that hold your initiatives |
| `max_depth` | 3 | how deep below each root to look |
| `ignore_dirs` | node_modules, vendor, Library, ... | directory names never entered |
| `gcp_project` | empty | Firebase / GCP project; empty disables sync |
| `firebase_api_key` | empty | web API key of the Firebase project (public by design) |
| `firestore_database` | `organizer` | Firestore database id, native mode |
| `sync_interval_minutes` | 15 | automatic sync while the app is open; 0 disables |
| `editor` | `code` | command for "open in editor" |
| `agent` | `claude` | command run by "Review with agent" |
| `agent_binary` | `claude` | process name that counts as an agent |
| `probe_state_dir` | `~/.local/state/probe` | where `probe` keeps its session layouts |
| `zellij` | `/opt/homebrew/bin/zellij` | zellij binary, for session state |

## Accounts, sync, and the app lock

Sync is per account. You sign in once per machine with email and password
(Firebase Authentication); the app keeps the refresh token in the macOS
Keychain and nothing else on disk. Every machine pushes its snapshot under
`users/<uid>/machines/<machine>` in a Firestore database and reads the other
machines back. Security rules restrict each user to their own tree. Nothing
merges at write time, so nothing conflicts; the manual priority order is one
shared document, last writer wins.

A local **passcode** can gate the app on each machine. It is an argon2id hash
in the Keychain, verified at launch, with a 30-second cooldown after five wrong
tries. It also lets the app open offline on the last pull. If you forget it,
signing in to the cloud proves it is you and lets you set a new one.

"Continue offline" and "Use without an account" keep everything local: the
board still works from the files; only sync is paused.

### One-time project setup

You need a Firebase project (a GCP project with Firebase added), the
email/password provider enabled, a web API key, and a Firestore database in
native mode. All of it is free-tier at this scale.

```bash
P=<your-project>
firebase projects:addfirebase $P
gcloud services enable identitytoolkit.googleapis.com firestore.googleapis.com --project $P
# Enable Email/Password: Firebase console → Authentication → Sign-in method,
# or the Identity Toolkit admin API once Authentication has been initialized.
firebase apps:create WEB organizer --project $P
firebase apps:sdkconfig WEB --project $P | grep apiKey        # -> firebase_api_key
gcloud firestore databases create --database=organizer --location=<region> --type=firestore-native --project $P
firebase deploy --only firestore:rules --project $P            # rules in this repo
```

Then in Settings, or in `~/.config/organizer/config.yaml`: `gcp_project`,
`firebase_api_key`, `firestore_database: organizer`. Create the account from
the sign-in screen or with `organizer login`.

## Agents

The Agents view is built on the process table, not on any registry. Every
process whose binary is `agent_binary` counts; its working directory decides
the initiative. Sessions started with `probe` (`~/bin/probe`, a small script that pairs a
zellij session, a named Claude conversation, and an iTerm2 profile under one
name) get attach, kill, and restart-safe behaviour for free.
Plain terminals show their tty and can be stopped.

"Working" means the process used at least 1% of a core since the previous
sample. An idle agent waiting for input stays under that.

## The review prompt

"Review with agent" generates a prompt from the live scan: repos with branches
and dirty state, every open card with its next action and staleness, other
agents alive in the initiative, and the update rules of the skill. It opens a
terminal in the initiative running the agent with that prompt, or copies it for
a session you already have. This is how a stale board gets refreshed without
you reading each card.

## Development

```bash
go test ./...                                  # fixtures in testdata/home
UPDATE_GOLDEN=1 go test ./internal/cli/        # refresh the status golden file
wails dev                                      # app + http://localhost:34115 for browser dev
wails generate module                          # after changing any bound Go type
```

`wails dev` builds into the same `build/bin` as `wails build` and removes its
binary on exit. Run `wails build` again before launching from Finder.

Layout: `internal/scan` finds initiatives, parses cards, runs git, and discovers
agents; `internal/merge` builds the board; `internal/sync` talks to Datastore;
`internal/service` sequences them for both the CLI (`internal/cli`) and the
Wails bindings (`app.go`). The frontend is React with a zustand store, plain
CSS tokens, and `@hello-pangea/dnd` for drag.

## License

MIT. See `LICENSE`.
