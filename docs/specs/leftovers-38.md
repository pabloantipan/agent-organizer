# Leftovers 38: Needs me says the owner once and keeps the age column in one line: the build spec

status: proposed (0142)
by: the FSE, 2026-10-15, on main at 4285b0d
sources: lf37-waits-polish's UI review (`working-on/done/lf37-waits-polish.md`,
`## UI review`, U1, U2, U3), answered by Aglaea in `docs/ux/specs/needs-me-waits.md`
Amendment 2 (4285b0d, W11, W12); dg-reader's UI review U2 (6ef262a), answered
in `docs/ux/specs/diagrams-in-app.md` Amendment 2 (D9); dg-render's A3,
answered in its Amendment 3 (0e189eb, D5 amended, D10).

## Premises (each read today)

- `decisionContext` (`components/Home.tsx:309`) feeds the context line of
  both `DecisionRow` (:331) and the others' row (:369), and starts with
  `ownerPhrase`.
- The row grid is `112px minmax(0, 1fr) 48px auto` (`styles/shell.css:121`):
  the verb column is `auto`, so its width follows the button's word, which
  moves the age column (U2: 862.98 with Rule, 857.84 with Open).
- `.lz.waiting.dashed` (`styles/shell.css:33`) has no user in
  `frontend/src` since lf37 (grep of `dashed` in components and lib).

- The Contents' ✎ is `<span className="sr-map-mark" aria-hidden="true">`
  in `components/SpecReader.tsx:341`; the entry has no other name.
- The class line is `classLine` in `lib/diagram.ts:51`, built from
  `changeClasses` (:36), listing ids, `context` left out. The figure is an
  `<img src={svgSource(...)} alt={name}>` in `components/DiagramFigure.tsx:84`;
  WebKit still exposes the SVG's node labels inside that image (dg-render
  UI review A3).

## Requirements, card `lf38-owner-once` (frontend)

- **FR-1** (W11) An others' row's context line drops the owner and starts
  at `raised …`; the lead's own record rows keep theirs as today.
- **FR-2** (W12) The verb cell is as wide as the widest verb (Rule, Open,
  Answer, Agents, Launch) with the button right-aligned in it, so every
  age column in both groups has one left x. A min-width on the verb cell
  is enough; no row changes its other columns.
- **FR-3** (U3) `.lz.waiting.dashed` goes.
- **FR-4** (D9) The spec reader's Contents entry for `Change on the map`
  has the accessible name `Change on the map, start here` (a
  screen-reader-only suffix); ✎ stays aria-hidden.
- **FR-5** (D5 amended) A figure's text line reads `Added: <labels>.
  Changed: <labels>. Removed: <labels>. Around it: <labels>.`: each node's
  label (its id only when it has none), no glyph, `context` nodes under
  `Around it`; `none` for an empty class.
- **FR-6** (D10) The figure is one image with its alt and no child text in
  the accessibility tree; the text line is read after it.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| O1 | 1 | vitest of the others' row and `DecisionRow` | others' context starts `raised`, holds no `owner `; the lead's row context unchanged |
| O2 | 2 | Tab harness at 1024×640 and at 1440 wide, fixture with Rule, Open and Answer rows in view (both groups) | every `ib-age` left x equal within 0.5 px, at each width |
| O3 | 3 | `grep -rn 'waiting.dashed' frontend/src` | nothing |
| O4 | 4 | vitest of `SpecReader`'s Contents | the entry's accessible name is exactly `Change on the map, start here`; ✎ has aria-hidden |
| O5 | 5 | vitest of `classLine` on the skill's change-classes example with labelled nodes (`BFF["✎ BFF"]`) and one unlabelled | `Added: Payments. Changed: BFF. Removed: none. Around it: PWA.` shape: labels, no ✚ ✎ ✕, the id for the unlabelled one |
| O6 | 6 | review build (fixture, auth off), AX tree by pid: the fixture record's figure | one image with the alt, no child text elements; the text line after it |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf38-owner-once`: `components/Home.tsx` (`decisionContext` or the
  others' row's use of it), `styles/shell.css` (the verb cell, the dead
  rule), `components/SpecReader.tsx` (the Contents entry),
  `lib/diagram.ts` (`classLine`), `components/DiagramFigure.tsx`, their tests. Not: `lib/queue.ts`, `lib/decisions.ts`'s
  `ownerPhrase`, Go.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf38-owner-once` | O1 to O6, X0 | — | true |
