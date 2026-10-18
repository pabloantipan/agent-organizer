# Leftovers 44: an ask survives a Save, a note says it needs a mark, and Open the thread never lands on archive: the build spec

status: ruled (0152)
by: the FSE, 2026-10-18, on main at 49bb15f, in away mode
sources: lf43-review-states' reviews (RS1-RS3 and rs-review's notes,
`working-on/done/lf43-review-states.md`; sup84's report); Aglaea's
`docs/ux/specs/review-view.md` Amendment 9 (62fb188, R36-R38).

## Premises (read 2026-10-18 at 49bb15f)

| Premise | Shown by |
|---|---|
| `SetMark` drops the symbol's old mark and appends a new `Mark{Symbol, State, Note, By, At, Hash}`, so `Asked` and `AskedThread` are lost on every Save | `internal/review/marks.go:134, 158-178` |
| a mark records the ask's message and thread but not the note it asked with | `internal/review/marks.go:41-57` |
| a thread not in the feed lands on `archive` | `components/Conversation.tsx:186, 262` |
| the editor-failure line's id is built from the file path (`rs-editor-failed-${file}`), which breaks `aria-describedby` on a path with a space | `components/ReviewSymbol.tsx:172, 186-188` |

## Requirements, card `lf44-ask-survives` (Go and frontend)

- **FR-1** (R36) `SetMark` keeps `Asked`, `AskedThread` and a new
  `AskedNote` (the note sent with the ask, written by `SetAsked`) on every
  Save. After a saved note that differs from `AskedNote`, the panel keeps
  `Asked <seat> · Open the thread`, the row keeps `? asked`, and the
  again-forms show (`Ask <seat> again`). A mark changed to Reviewed or none
  keeps the link, drops `asked` from the row, and offers no ask.
- **FR-2** (R37) Save is drawn only when it can save. A note with no mark
  shows, muted under the note, `Choose a mark to save this note.`; the
  line goes once a mark is chosen.
- **FR-3** (R38) `Open the thread` never lands on archive: it lands on the
  direct chat of the seat that was asked (else channel), then selects the
  thread once the feed lists it, unless Pablo has moved since. The
  `aria-current` row and the selected fill are the same row.
- **FR-4** The editor-failure line's id is safe for `aria-describedby`
  (from the node id, sanitised, never a raw path).

## Acceptance → gate

No row posts to a real mailbox, launches an editor or drives Pablo's screen.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| K1 | 1 | go test: ask a mark, then SetMark with an edited note; then SetMark to reviewed | `Asked`, `AskedThread`, `AskedNote` kept both times |
| K2 | 1 | vitest: an asked symbol, edit the note, Save; then Reviewed | `Asked <seat> · Open the thread`, `Ask <seat> again`, the row `? asked`; then the link kept, no `asked` on the row, no ask offered |
| K3 | 2 | vitest: an unmarked symbol, type a note; choose a mark | no Save, `Choose a mark to save this note.`; the line gone, Save drawn |
| K4 | 3 | vitest: `Open the thread` with the thread not in the feed, then the feed lists it; and once with Pablo moving first | the asked seat's direct chat, never archive; then the thread selected; not selected after a move; the `aria-current` row has the fill |
| K5 | 4 | vitest with a file `a b/c.ts` | the button's `aria-describedby` names an element that exists |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `internal/review/marks.go` and its test, `internal/service/review_ask.go`
  and its test (`SetAsked` gets the note), `wails generate module` output
  (not `frontend/wailsjs/runtime/`), `components/ReviewSymbol.tsx` and its
  test, `lib/review.ts` and its test, `styles/review.css`,
  `components/Conversation.tsx` (the landing only) and its test.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf44-ask-survives` | K1-K5, X0 | — | true |

Amendment 1, 2026-10-18, the FSE, from sup85 (thread 01M58GMD): FR-1 keeps
an earlier ask, so `internal/service/review_test.go:566` (TestAskReview's
`Asked == ""` after a failed re-ask) now expects the earlier ask kept. The
boundary adds that one assertion of `internal/service/review_test.go`.
