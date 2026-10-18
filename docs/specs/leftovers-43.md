# Leftovers 43: Open in editor's refusals, the definition line, Save only when it saves, and one page marker: the build spec

status: ruled (0151)
by: the FSE, 2026-10-18, on main at aa29cb1, in away mode
sources: Aglaea's `docs/ux/specs/review-view.md` Amendment 7 (104d92d,
R31-R33, from oe-ui's U1, U2 on lf42-open-at-line) and Amendment 8
(40d6cec, R34-R35, from lw-ui's A1, A3 on lf41-review-words).

## Premises (read 2026-10-18 at aa29cb1)

| Premise | Shown by |
|---|---|
| a refusal at the press shows `String(e)` (`Error: <sha> is not checked out here`) in `.review-error`, and the button stays | `frontend/src/components/ReviewSymbol.tsx:145-157` |
| the editor is started and not waited on, so an editor that exits 1 reports nothing | `internal/service/review_open.go:32` (`exec.Command(...).Start()`) |
| the line opened is the head range's start (`editorAt`), which for a symbol with a doc comment is the comment | `frontend/src/lib/review.ts:595-596`; oe-ui U2 (format.ts `1-4` opened at `:1`) |
| Save is drawn always, disabled by `canSave` when nothing changed | `frontend/src/components/ReviewSymbol.tsx:269` |
| the sub-view tab marks itself `aria-current="true"`; the chat list's row also uses `"true"` | `frontend/src/components/InitiativeHeader.tsx:240`; `SlackView.tsx:103` and lf41's chat row |

## Requirements, card `lf43-review-states` (Go and frontend)

- **FR-1** (R31) A refusal saying the head is not checked out re-reads the
  review status; `Open in editor` goes, the title line reads, in
  `--fg-muted`, `Not checked out here at <short sha>.`, focus moves to the
  symbol's h2, and the polite region says the line once.
- **FR-2** (R32) `OpenReviewAt` waits up to 2 s for the editor: an exit
  with a non-zero code in that time returns `editor didn't open:
  <first stderr line>`; a process still running, or exiting 0, is opened.
  The panel keeps the button and its focus and shows `Editor didn't open:
  <first error line>` under it in the blocked-reason style. No red, no
  `Error:` prefix, in either case.
- **FR-3** (R33) The line opened is the first head-range line after the
  leading comment block (`//`, `/* … */`, `#` lines); decorators count as
  code. The label keeps the full range.
- **FR-4** (R34) Save is drawn only while the mark or the note differs from
  what is saved, in every state of the mark form. When Save goes after a
  press, focus moves to the next control in the panel (the asking primary,
  else the radio group), never the body.
- **FR-5** (R35) The sub-view tab marks the current one `aria-current="page"`;
  a list's current item stays `"true"`, one per list.

## Acceptance → gate

No row launches a real editor (go test stubs the command with `sh -c 'exit
1'` and `sleep 5`), drives Pablo's screen or posts anywhere.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| S1 | 1 | vitest, mocked: the press refuses with `… is not checked out here` | the button is gone; `Not checked out here at <sha>.` muted; focus on the h2; the region says it once; no `Error:` |
| S2 | 2 | go test: editors `sh -c 'echo nope >&2; exit 1'`, `sleep 5`, `true`; vitest of the panel with the first | `editor didn't open: nope`; opened (returns under 2.5 s); opened; the button keeps focus, `Editor didn't open: nope` in the blocked-reason class |
| S3 | 3 | vitest of the line: a `//` doc comment, a `/** */` block, a `#` comment, a decorator first | the first code line; the decorator's line; the label keeps the range |
| S4 | 4 | vitest: an asked unedited symbol; edit the note; Save | no Save; Save and `Ask <seat> again`; Save gone, focus on the asking primary (else the radio group) |
| S5 | 5 | vitest: Conversations after `Open the thread` | one `aria-current="page"` (the tab), one `"true"` (the chat row) |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `internal/service/review_open.go` and its test, `components/ReviewSymbol.tsx`
  and its test, `lib/review.ts` and its test, `styles/review.css`,
  `components/InitiativeHeader.tsx` (the tab's `aria-current` only) and its
  test. Not `frontend/wailsjs/runtime/` (a regenerate that rewrites it is
  reverted: wails CLI drift on this Mac).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf43-review-states` | S1-S5, X0 | — | true |
