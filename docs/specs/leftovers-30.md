# Leftovers 30: a crew start skips running seats and dates its failures; the landed row stays in view; Seat up closes; badges show the deaf count: the build spec

status: proposed (0126)
by: the FSE, 2026-10-14, on main at 3af463b
sources: sup66's close (`runs/2026-10-14-sup66-leftovers-29.md`; `## UI
review` of `working-on/done/lf29-*.md`), Aglaea's
`docs/ux/specs/launch-progress.md` Amendment 2 (rows L13, L14) and her
reading of the FSE's three (2026-10-14). Kept as built: stalled and the
unreadable-files row share amber; `Seat not up` / `Crew not up`; a list
with a failure never closes by time. Gate rows follow 0095 and 0108: no row
drives Pablo's desktops, focus or input, none starts a real seat (the probe
stub), none writes the real clipboard.

## Requirements, card `lf30-launch-go` (Go)

- **FR-1** `CreateCrew` starts only the seats that are not already
  running (the same live check the Agents feed makes); a running seat gets
  no entry and no probe call. The CLI says which it skipped.
- **FR-2** A failed entry carries `failed_at`, the time its last try
  failed (`AgentsView.launches`), next to `started_at`.

## Requirements, card `lf30-launch-view` (frontend), after `lf30-launch-go`

- **FR-3** (L13) The row Agents lands on is centred (`block: "center"`).
  While it keeps focus and the lead has not scrolled, each feed update
  scrolls it back with `block: "nearest"`; a scroll or a blur stops that.
  No `overflow-anchor` (Safari 15.0 has none).
- **FR-4** (L14) `Seat up` closes after 5 s, as `Crew up` does.
- **FR-5** The unseen-failure Needs me row is dated by `failed_at`
  (leftovers-29 FR-5 used the last try's start).
- **FR-6** (rb-ui R1, L12) The watcher badge on Agents and on the crew
  block (`WatcherBadge`, `ContextBar.tsx`) draws `· n waiting` for deaf and
  capped, as the person badge does.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| G1 | 1 | Go test with the stub as `probeBin` and a fake live set: a crew of three, one running; `organizer crew <fixture>` with the stub | two entries, two probe calls; the CLI names the skipped seat |
| G2 | 2 | Go test: a seat that fails twice, fake clock | `failed_at` the second failure's time, after `started_at` |
| V1 | 3 | harness at 1024×640: land on a row below the fold; read its rect; push three feed updates that add rows above it; then scroll the list and push one more | centred on landing; back in view after each update; not moved after the scroll |
| V2 | 4 | harness with the stub: `Bring 1 up`, read the list at 1 s and 6 s after `Seat up` | present, then gone |
| V3 | 5 | vitest of `needsMeRows` with `failed_at` 12:05 and `started_at` 12:04 | dated 12:05 |
| V4 | 6 | vitest and AX of a deaf and a capped seat with 3 waiting on Agents and in the crew block | `· 3 waiting` on both |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf30-launch-go`: `internal/service` (`crew.go`, `launch.go`, their
  tests), `internal/cli` (the crew line), `frontend/wailsjs` regenerated.
  Not: components.
- `lf30-launch-view`: `AgentsView.tsx` (the landing), `Crew.tsx`,
  `ContextBar.tsx` (`WatcherBadge`), `lib/queue.ts` (the failure row's
  date), their tests; `styles/launch.css`. Not: Go, `SlackView.tsx`.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf30-launch-go` | G1, G2, X0 | — | false |
| `lf30-launch-view` | V1, V2, V3, V4, X0 | `lf30-launch-go` | true |
