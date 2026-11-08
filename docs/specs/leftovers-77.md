# Leftovers 77: the no-client group is the app's, by key, not by name: the build spec

status: accepted (0190, ruled 2026-11-08)
by: the FSE, 2026-11-08, on main at 5958a021
sources: sup118's closing on leftovers 74-76 (findings 2-5); Aglaea's
`docs/ux/specs/run-report.md` Amendment 11 and `docs/design-system.md`
(5958a02; AR40 amended, AR41, AR42): the seeded group holds the initiatives
with no client, reads **No client**, and is keyed by a reserved id, never by
its name; a client written `other` or `Other` gets its own group; the
rename field opens on what the header shows, named `Rename …`, and saved
unchanged it stays the app's label.

## Premises (read 2026-11-08 at 5958a021; greps over frontend/src, .ts and .tsx, strings and tests, for `groupName`, `NO_CLIENT`, `"other"`; over scripts/ for `FIXTURE_AGENT_PIDS`)

| Premise | Shown by |
|---|---|
| a stored rail group is `{name, initiatives}` only: no field can mark the seed, so it is told by its name | `internal/model/model.go:637-640` (`Group`); `frontend/wailsjs/go/models.ts:890` |
| the seed is written `Other` (`NO_CLIENT`) and keyed by that name, so a client `Other` joins it and a client `other` reads like it | `frontend/src/lib/groupName.ts` (`NO_CLIENT`, `groupName`, `clientGroups`); sup118 finding 2 |
| the groups are saved whole through `SetGroups` (bound) into `Order.Groups`, which syncs as JSON in the order document | `app.go:282`, `internal/service/service.go:750`, `internal/model/model.go:617` |
| the rename field opens on the stored name (`other`, named `Rename other`) while the header shows the label | `frontend/src/components/Rail.tsx:272-280` (`RenameField name={s.name}`); sup118 finding 4 |
| the float list labels its group by the stored name in `aria-label` and by `groupName` on screen | `frontend/src/components/FloatList.tsx:216-217` |
| `groupName` is also an export of `lib/review.ts` (a different thing) | grep `groupName` over frontend/src; sup118 finding 3 |
| `scripts/floating-icon-by-hand.sh` ends the stand-ins with `kill $FIXTURE_AGENT_PIDS`, not the launcher's stop (leftovers 75) | `scripts/floating-icon-by-hand.sh:36` |

## Requirements

Card `lf77-no-client` (Go model field, frontend, one script; ui_review):
- **FR-1** `model.Group` gains `seed` (json `seed,omitempty`), a reserved
  key; the only value is `no-client`. Every reader keeps it: `Regroup`,
  `SetGroups`, the cache and the synced order document carry it unchanged;
  `frontend/wailsjs` regenerated.
- **FR-2 (AR40, AR42)** "Group by client" seeds one group per client name
  as written and one group `{seed: "no-client", name: ""}` for the
  initiatives with no client; no client name, `other` or `Other` included,
  ever joins it. A seeded group with an empty name reads **No client** in
  the rail, in the float list and in both their accessible names.
- **FR-3 (AR41)** The rename field of a group opens on what its header
  shows and is named `Rename <that>`. Saving the seeded group's field
  unchanged (`No client`) keeps its name empty, the app's label; any other
  text is stored as the name, the person's, shown as written.
- **FR-4** A group stored before FR-1 (no `seed`) named exactly `other` or
  `Other` whose every initiative has no client is read as the seed (seed
  set, name empty) the next time the groups are saved; any other group is
  left as stored. Nothing is rewritten on read alone.
- **FR-5** The label helper is one export whose name no other module
  exports (e.g. `railGroupLabel`); `NO_CLIENT` reads `No client`.
- **FR-6** `scripts/floating-icon-by-hand.sh` stops the stand-ins with
  `scripts/fixture-home.sh stop "$FIXTURE_DIR"` instead of `kill
  $FIXTURE_AGENT_PIDS`.

## Acceptance → gate

UI rows run as leftovers-67 says (review build in the worktree, launched by
its own path after the fixture launcher's exports in the same shell, pid
saved; AX of that pid, or the offscreen harness, saying which). No row
drives Pablo's desktops, focus or input, and no row sends AXPress to the
floating icon.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| G1 | 1 | go test: a `model.Order` with a seeded group round-trips JSON and `Regroup` keeps `seed` | kept (main: no field) |
| V1 | 2 | vitest of the seed over initiatives with clients `acme`, `other`, `Other` and two with none | four groups: `acme`, `other`, `Other`, and the seeded one holding the two with none (main: `Other` joins the none) |
| V2 | 2, 5 | vitest of the label helper: seeded with empty name → `No client`; seeded named `misc` → `misc`; unseeded `other` → `other` | as written |
| V3 | 3 | vitest render of the rail's rename field on the seeded group: its value and accessible name; save unchanged, then save `misc` | `No client`, `Rename No client`; name stays empty; then `misc` |
| V4 | 4 | vitest of the legacy read: a stored `other` holding only no-client initiatives, a stored `Other` holding a client `Other` initiative | the first saved as the seed; the second unchanged |
| V5 | 5 | grep the exports of the frontend sources for the helper's name | one export |
| S1 | 6 | grep `FIXTURE_AGENT_PIDS` in scripts/floating-icon-by-hand.sh; `bash -n` on it | no kill of it; syntax ok |
| AR40, AR41, AR42 | 2-4 | review build at 1024x640, a fixture with a client `other` and initiatives with no client: group by client; the rail and the float list; rename the seed through the app's own field by AX, unchanged, then `misc` | `other` and `No client`; field `Rename No client`; then `misc` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

`internal/model/model.go` (`Group` and `Regroup` only) and its test;
`frontend/wailsjs` (regenerated); `frontend/src/lib/groupName.ts` (may be
renamed) and its test; `frontend/src/components/Rail.tsx` (the seed, the
group header and its rename field only), `FloatList.tsx` (the group label
only); the fixture overlay or rail fixture for a client `other` if a row
needs it; `scripts/floating-icon-by-hand.sh` (the cleanup only); tests
asserting the old `Other` (those asserts only).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf77-no-client` | G1, V1-V5, S1, AR40-AR42, X0 | lf74-comma-other, lf75-fixture-stop (merged #66, #68) | true |
