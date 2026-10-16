# Leftovers 40: the verb column fits Rule · draft, and the map entry is one name: the build spec

status: proposed (0144)
by: the FSE, 2026-10-16, on main at a4580f1 (lf38-owner-once at 1b13701, not yet merged)
sources: lf38-owner-once's UI review (f09ced4, U1, U2, spec gap), answered by
Aglaea: `docs/ux/specs/needs-me-waits.md` A3 and `docs/ux/specs/diagrams-in-app.md`
A4 (a4580f1).

## Premises (each read today)

- A Rule row with a kept draft reads `Rule · draft` (`draftVerb`,
  `components/Home.tsx:403`, `lib/drafts`); lf38's verb column fits the
  five verbs only, so that row's age sits 14 px left (827.78 vs 842 at
  1024, lf38 UI review U1). Show (unread rows) fits.
- lf38 names the map entry with a visible text plus
  `<span className="sr-only">, start here</span>` (`components/SpecReader.tsx:357`
  at 1b13701); WebKit reads `Change on the map , start here` (U2).

## Requirements, card `lf40-verb-fit` (frontend)

- **FR-1** (A3, W12 amended) The verb column fits every verb label a row
  can show, `Rule · draft` included, so every age column has one x.
- **FR-2** (A4, D9) The map entry carries one `aria-label` string,
  `Change on the map, start here`; the `sr-only` span goes.

## Acceptance → gate

| # | FR | Check | Expected (fails on main after lf38) |
|---|---|---|---|
| V1 | 1 | Tab harness at 1024×640 and at 1440, fixture with a kept draft on init-a 0002 plus Rule, Open, Answer and Show rows in view | every `ib-age` left x equal within 0.5 px, at each width |
| V2 | 2 | vitest of `SpecReader`'s Contents | the entry's accessible name is exactly `Change on the map, start here` (no space before the comma); no `sr-only` span inside it |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf40-verb-fit`: `styles/shell.css` (the verb cell), `components/SpecReader.tsx`
  (the entry), their tests. Not: `lib/drafts`, `Home.tsx`'s rows.
- Starts from main after lf38-owner-once merged: `depends_on: [lf38-owner-once]`.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf40-verb-fit` | V1, V2, X0 | `lf38-owner-once` | true |
