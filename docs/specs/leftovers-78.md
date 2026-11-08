# Leftovers 78: no group reads like another, and a blank client is no client: the build spec

status: proposed (0191)
by: the FSE, 2026-11-08, on main at e7131dd6
sources: sup119's closing on lf77-no-client (#72 d832cc8a), findings 1-3;
Aglaea's `docs/ux/specs/run-report.md` Amendment 12 and
`docs/design-system.md` (e7131dd6; AR43-AR45): a client's name cannot be
refused, so while a client group is called `No client` (trimmed, any case)
the seed reads `Initiatives with no client`; Rename refuses, in place, a
name another group shows (trimmed, any case), `A group is already called
<name>.`, the field kept; renaming the seed to `No client` clears its
stored name; a blank or whitespace-only client is no client, and clients
are trimmed when read.

## Premises (read 2026-11-08 at e7131dd6; greps over frontend/src for `railGroupLabel`, `renameGroup`, `savedGroups`, `clientGroups`, and over internal/ for where `initiative.yaml` is decoded)

| Premise | Shown by |
|---|---|
| the seed's label does not look at the other groups: a client group named `No client` reads exactly like it | `frontend/src/lib/railGroup.ts` (`railGroupLabel(g)`); sup119 finding 1 |
| Rename stores any text not equal to the group's own label, so a group can be renamed to another group's name, and the seed renamed to `No client` after a rename stores the literal | `frontend/src/lib/railGroup.ts` (`renameGroup`); `frontend/src/components/Rail.tsx:167-173`, `:596-607` (`RenameField`, no error line) |
| a stored seed plus a legacy `other` of no-client initiatives saves as two seeded groups | `frontend/src/lib/railGroup.ts` (`savedGroups`); sup119 finding 2 |
| `client` is decoded from `initiative.yaml` as written, spaces kept; the seed treats only the empty string as no client | `internal/scan/scan.go:130`; `internal/model/model.go:40`; `clientGroups` (`e.client ? …`) |
| the float list labels groups through the same helper | `frontend/src/components/FloatList.tsx` (`railGroupLabel`) |

## Requirements

Card `lf78-group-names` (frontend, one Go line; ui_review):
- **FR-1 (AR43)** The seed's label takes the groups it stands among:
  while another group's label is `No client` (trimmed, any case), the seed
  with an empty name reads `Initiatives with no client`; otherwise `No
  client`. The rail and the float list both use it, accessible names
  included.
- **FR-2 (AR43)** Rename refuses a name another group shows (trimmed, any
  case): nothing is written, the field stays open with the typed text, and
  one line under it reads `A group is already called <that group's label>.`
  (announced to assistive tech).
- **FR-3 (AR44)** Renaming the seed to `No client` (trimmed, any case)
  stores an empty name: the app's label again.
- **FR-4 (AR45)** The scan trims `client` when it reads `initiative.yaml`;
  a client blank or only spaces is no client, and its initiatives join the
  seed. No group has a blank header.
- **FR-5** Saving merges a legacy `other`/`Other` group of no-client
  initiatives into the stored seed when one exists (its initiatives
  appended, in order, none twice); it becomes the seed only when none
  exists. At most one seeded group is ever saved.

## Acceptance → gate

UI rows run as leftovers-67 says (review build in the worktree, launched by
its own path after the fixture launcher's exports in the same shell, pid
saved; AX of that pid, or the offscreen harness, saying which); the
fixture's stand-ins are stopped with the launcher's stop before its dir is
removed. No row drives Pablo's desktops, focus or input, and no row sends
AXPress to the floating icon.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| G1 | 4 | go test of the scan over an initiative whose `client:` is two spaces, and one with ` acme `: the read client | empty; `acme` (main: spaces kept) |
| V1 | 1 | vitest of the label over the seed alone; the seed beside a client group ` no CLIENT `; beside one named `misc` | `No client`; `Initiatives with no client`; `No client` |
| V2 | 2 | vitest of rename: group `misc` renamed ` ACME ` while a group `acme` exists; the seed renamed `no client` while a client group `No client` exists | both refused with the line naming the other group; nothing written |
| V3 | 3 | vitest: the seed renamed `misc`, then ` No Client ` | name `misc`, then empty |
| V4 | 5 | vitest of saving a stored seed holding `a` plus a legacy `other` holding `b` and `a` (both no-client) | one seed holding `a`, `b` |
| V5 | 2 | vitest render of the rename field after a refusal | field open with the typed text; the line present, in a live region |
| AR43, AR44, AR45 | 1-4 | review build at 1024x640, a fixture with a client `No client`, a client of spaces and an initiative with none: group by client; rename attempts by AX through the app's own field | as Aglaea's rows |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

`frontend/src/lib/railGroup.ts` and its test; `frontend/src/components/Rail.tsx`
(the group labels, the rename field and its line only), `FloatList.tsx`
(the label call only); `frontend/src/styles/global.css` (the rename line's
style only, tier-2 tokens); `internal/scan/scan.go` (the client trim only)
and its test; the fixture overlay or rail fixture for the clients above if
a row needs them; tests asserting the old behaviour (those asserts only).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf78-group-names` | G1, V1-V5, AR43-AR45, X0 | lf77-no-client (merged #72) | true |
