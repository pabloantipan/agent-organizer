# Leftovers 74: one space after a comma, the app's own labels in sentence case: the build spec

status: accepted (0187, ruled 2026-11-08)
by: the FSE, 2026-11-08, on main at 65a8d51
sources: sup117's closing on lf73-inline-names (organizer #64, 127b35c),
"Found, not asked" (1) and (2); Aglaea's `docs/ux/specs/run-report.md`
Amendment 10 and `docs/design-system.md` (43ab477; AR39, AR40): a link
after a comma is pulled in by its 4 px start padding, as the comma already
is at the link's end, so the gap after a comma is one space whatever
follows; the seeded `other` group is the app's label and reads `Other`,
like `Asleep` and `Archived`; a group the person renamed keeps their case.

## Premises (read 2026-11-08 at 65a8d51; greps over all of frontend/src, .ts and .tsx, strings and tests, for `rt-comma`, `"other"` and `(n)`)

| Premise | Shown by |
|---|---|
| in a track's `left` list the comma is pulled into the link before it (`.rr-card + .rt-comma`, minus 4 px), but a link after a comma keeps its 4 px start padding, so the gap is about 6 px before a link and about 2 px before plain text | `frontend/src/styles/runreport.css:72`, `:64-66` (`.rr-card` padding-inline `--space-1`); `frontend/src/components/RunTracks.tsx:91`; sup117 Found (1) |
| `rt-comma` is used only in RunTracks.tsx (one list) | grep `rt-comma` over frontend/src |
| "Group by client" seeds a group named `other` for initiatives with no client, written in lowercase into the stored order (`Order.Groups`), and its name is shown as stored | `frontend/src/components/Rail.tsx:153-154` (`e.client \|\| "other"`), `:280` (`{s.name}`); the collapsed rail's float list shows the same name, `frontend/src/components/FloatList.tsx:202` (`fl-group`) |
| two doc comments still say `Asleep (n)` and `Archived (n)` after lf73 changed the labels to `· n` | `frontend/src/components/Rail.tsx:28-29`, `frontend/src/components/FloatList.tsx:216-217`; a test title, `FloatList.test.tsx:20` |

## Requirements

Card `lf74-comma-other` (frontend, ui_review):
- **FR-1 (AR39)** In a comma list, a link that follows a comma is pulled
  in by its start padding (`margin-inline-start: calc(-1 * var(--space-1))`
  on an `.rr-card` that follows an `.rt-comma`), so the gap after every
  comma is the one space of text, before a link and before plain text
  alike. The first item and the inset ring (AR35) are unchanged.
- **FR-2 (AR40)** "Group by client" seeds the no-client group as `Other`.
  A stored group named exactly `other` (what the old seed wrote) reads
  `Other` in the rail and in the float list, through one helper in
  `frontend/src/lib/` used by both; any other name, `misc` or `Acme`
  included, shows exactly as stored. Accepted cost: a person who typed
  exactly `other` also reads `Other`; the stored value is never rewritten.
- **FR-3** The two doc comments and the test title read `Asleep · n` and
  `Archived · n`.

## Acceptance → gate

UI rows run as leftovers-67 says (review build in the worktree, launched by
its own path after the fixture launcher's exports in the same shell, pid
saved; measurements by AX of that pid or the offscreen harness, saying
which). No row drives Pablo's desktops, focus or input, and no row sends
AXPress to the floating icon (it activates the app over Pablo's work).

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| V1 | 1 | vitest reading `runreport.css`: a rule `.rt-comma + .rr-card` (or equivalent selector over the same pair) with `margin-inline-start: calc(-1 * var(--space-1))`; the `.rr-card + .rt-comma` rule kept | present; kept (main: no rule for a link after a comma) |
| V2 | 2 | vitest of the helper and of `groupByClient`'s seed: `other` → `Other`; `misc`, `Acme`, `Other` unchanged; a no-client initiative is seeded into `Other` | as FR-2 (main: `other`) |
| V3 | 2 | vitest render of the rail and of the float list with a stored group `other` and one `misc` | `Other` and `misc` |
| V4 | 3 | grep `Asleep (n)` and `Archived (n)` over the frontend sources | none (main: three) |
| AR39 | 1 | review build at 1024x640: a track's `left` of a link, a not-cut item, then a link; measure the gap after each comma (AX frames of the comma and the next item) | equal within 1 px |
| AR40 | 2 | review build: the fixture rail grouped by client, then the `Other` group renamed to `misc` through the app's own rename field (by AX, no input) | reads `Other`, then `misc` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

`frontend/src/styles/runreport.css` (the comma-list rules only);
`frontend/src/components/Rail.tsx` (the seed, the group name and the doc
comment only), `FloatList.tsx` (the group name and the doc comment only);
a new helper in `frontend/src/lib/` (`groupName.ts` or beside `folds.ts`)
and its test; `RunTracks.test.tsx`, `RunTracks.lf73.test.tsx`,
`FloatList.test.tsx` and the rail's tests (asserts of the old text or rules
only, and the new rows).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf74-comma-other` | V1-V4, AR39, AR40, X0 | lf73-inline-names (merged #64) | true |

Not in this card (held low, no site today): the V2 count scan of lf73
misses `({n})`, template literals and `&#40;`; the review Worklist's group
head has no unit test; the collapsed rail's float list has no offscreen
route for a reviewer.
