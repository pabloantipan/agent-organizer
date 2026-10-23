# Leftovers 47: the review header follows the newest re-read, and no save of nothing: the build spec

status: proposed (0155)
by: the FSE, 2026-10-23, on main at 2715032
sources: Aglaea's `docs/ux/specs/review-view.md` Amendment 11 (2715032),
from rw-ui's UI review of lf46-review-words
(`working-on/done/lf46-review-words.md`, findings UW1, UW2). Every premise
read today.

## Premises (read 2026-10-23 at 2715032)

| Premise | Shown by |
|---|---|
| the header's status is read once, in `load`, when the screen opens (and again after a make); its moved line is drawn from that status only | `frontend/src/components/Review.tsx:39-56, 272-274`; `movedLine` at `frontend/src/lib/review.ts:179` |
| the panel's re-read after a refused `Open in editor` reads the status into the panel's own state; nothing reaches the header | `frontend/src/components/ReviewSymbol.tsx:50, 55, 64-69` |
| the panel already has its sr-only polite region; the screen has another | `components/ReviewSymbol.tsx:197`; `components/Review.tsx:305` |
| the primary is drawn whenever `showPrimary`, which hides only an ask already made with this note; a marked, unedited symbol still draws `Reviewed` / `Reviewed, next` | `frontend/src/lib/review.ts:80-91, 566-571`; `components/ReviewSymbol.tsx:282-293, 356-358` |
| Save is already drawn only while the mark or note differs from the saved one (`saveShown`) | `components/ReviewSymbol.tsx:305-307, 359` |
| after a save, focus goes to the primary only when it is drawn and asks, else to the radios | `frontend/src/lib/review.ts:688-690` |

## Requirements

Card `lf47-review-moved` (frontend, one card):

- **FR-1** (Amendment 11, UW1) Any status read made while the Review
  screen is open, the panel's re-read included, whose `map_head` differs
  from the head of the map shown puts the header in §4's moved state in
  place: `The branch moved since this map (<shown> → <new>).` and
  `Make it again`, with `<new>` that read's `map_head`. The map and
  marks shown are not reloaded until Make it again. Focus does not move.
- **FR-2** (Amendment 11, UW1) When FR-1 changes the header, the panel's
  polite region says the moved line once (emptied, set after 100 ms),
  after any line the press itself caused.
- **FR-3** (Amendment 11, UW2) A symbol with a saved mark whose mark and
  note equal what is saved draws no primary. An unmarked symbol keeps its
  primary. Once the mark or the note changes, the primary returns in its
  existing forms (`primaryOf`, unchanged). Focus after a save still
  follows `focusAfterSave`, which then lands on the radios.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| M1 | 1 | vitest: the screen showing map head A; the panel's re-read answers map_head B | the header reads `The branch moved since this map (A → B).` with `Make it again`; ReviewMap and ReviewMarks are not called again; focus unchanged |
| M2 | 1 | vitest: a re-read answering map_head A (the one shown) | the header is unchanged, no moved line |
| M3 | 2 | vitest with fake timers: the re-read of M1 after the refusal line | the panel's polite region is emptied, then after 100 ms holds the moved line, once, after the refusal line |
| M4 | 3 | vitest: a ✓ symbol reopened; the note edited; the mark changed; an unmarked symbol | no `Reviewed` / `Reviewed, next`; the primary returns on the note edit and on the mark change; the unmarked symbol draws `Reviewed, next` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

The UI review (ui_review: true) checks R39 and R40 of Amendment 11 in the
review build.

## Boundary

`frontend/src/lib/review.ts` and its test, `components/ReviewSymbol.tsx`,
`components/Review.tsx` and their tests. Tests that pin a primary on a
marked, unedited symbol are updated, saying so in the card.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf47-review-moved` | M1-M4, X0 | — | true |
