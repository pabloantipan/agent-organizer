# Leftovers 46: runs know their card and their resumes, and the review panel's last loose words: the build spec

status: proposed (0154)
by: the FSE, 2026-10-22, on main at ab419ac
sources: the held list in `docs/bitacora/fse_bitacora.md` (2026-10-18
hand-offs: sup83 to sup86's findings), Aglaea's `docs/ux/specs/review-view.md`
Amendment 10 (9cef151). Every premise re-read today.

## Premises (read 2026-10-22 at ab419ac)

| Premise | Shown by |
|---|---|
| a session record carries `Session` (AGENT_SESSION), `Persona`, `Cell`; `Run` copies them | `internal/session/session.go:27-29, 102-104`; `internal/session/runs.go:30-32` |
| `MatchCard(cwd, branch, cards)` sees neither the session nor the card's `seat:`; `CardRef` is Initiative, Slug, Branch, Root; a seat run from the root on main is unattributed | `internal/session/runs.go:139-144, 153, 196-200, 260`; `internal/service/run.go:222-224, 452`; `model.Card.Seat` at `internal/model/model.go:265` |
| runs fold by `pid:session_id`; a seat frozen and thawed resumes the same conversation under a new pid, so `organizer runs` lists it twice (rr-build, sup86) | `internal/session/runs.go:61, 96`; `~/bin/seat-thaw`; sup86's report. Not verified: whether Claude Code's cost on a resumed process restarts at 0 |
| SetMark carries `AskedNote`; a mark asked before that field existed has it empty, and the panel's `asked_note ?? note` does not fall back on "", so an edited note never offers `Ask … again` | `internal/review/marks.go:186-187`; `frontend/src/lib/review.ts:592, 77-78` |
| the hint `Choose a mark to save this note.` is drawn by `noteHint` | `frontend/src/lib/review.ts:54, 673`; `components/ReviewSymbol.tsx:332, 351` |
| `Open the thread` calls `openSlack(initiative, null, thread)`; an unlisted thread shows channel first, then the asked seat's chat | `components/Review.tsx:209`; `stores/board.store.ts:284-286`; `components/Conversation.tsx:182-202` |
| `domId` maps every unsafe character to `_`, so `a b`, `a_b`, `a.b`, `a/b` collide | `frontend/src/lib/review.ts:678` |
| a status re-read with another `map_head` makes `editorAt` null, so the muted `Not checked out here` line goes with the button, against its own comment | `frontend/src/lib/review.ts:610`; `components/ReviewSymbol.tsx:58-64, 156-161, 185, 224` |
| no wails drift: go.mod and the CLI are v2.15.0 and `frontend/wailsjs/runtime` matches it (the held item is dropped) | `go.mod:6`; `wails version`; c126e29 |

## Requirements

Card `lf46-runs-seat` (Go):

- **FR-1** When cwd and branch match no card, a run matches the one card
  of its initiative whose `seat:` equals the session's short name
  (`Session` after `<project>-probe-`); two such cards leave it
  unattributed, as today.
- **FR-2** `organizer runs` shows one row per conversation: lines with the
  same non-empty session id fold into one run, started the earliest,
  ended the latest, context the last, cost the sum of each process's
  final cost, and a `resumed n` note when n > 0.
- **FR-3** SetMark on a mark with `Asked` set and `AskedNote` empty takes
  the mark's previous note as `AskedNote`.

Card `lf46-review-words` (frontend):

- **FR-4** (Amendment 10, AS1) The hint line goes; no Save without a mark;
  the primary is the press that saves.
- **FR-5** (Amendment 10, AS3) `Open the thread` passes the asked seat, so
  Conversations is on that seat's direct chat on the first frame; channel
  is never current in between.
- **FR-6** `domId` is injective: unsafe characters are escaped (`_`
  followed by the code point in hex), so no two raw strings share an id.
- **FR-7** A status re-read whose `map_head` differs keeps the muted line
  `Not checked out here at <short sha>.` in place of the button.
- **FR-8** The panel's asked note falls back to the note when
  `asked_note` is empty, not only when it is missing.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| R1 | 1 | go test: a run at the root on main, one card with `seat: rr-build` and session `organizer-probe-rr-build`; two cards with that seat | attributed to the card; unattributed |
| R2 | 2 | go test of LoadRuns and `organizer runs` with two pids of one session id (costs 1.00 and 0.50) | one row, cost 1.50, wall earliest to latest, `resumed 1` |
| R3 | 3 | go test: an old asked mark (Asked set, AskedNote empty, note "q"), SetMark with "q2" | `AskedNote` "q" |
| W1 | 4, 8 | vitest: unmarked with a note; an old asked mark edited | no hint, no Save; `Ask <seat> again` offered |
| W2 | 5 | vitest: `Open the thread` with the thread unlisted | `openSlack` gets the seat; the first render's current chat is the seat's, never channel |
| W3 | 6 | vitest: `a b`, `a_b`, `a.b`, `a/b` | four distinct ids, each a valid id |
| W4 | 7 | vitest: re-read status with another map_head | the muted line shows, the button does not |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf46-runs-seat`: `internal/session/runs.go` and its test,
  `internal/service/run.go` (the CardRef and MatchCard calls) and its test,
  `internal/cli/run.go` (the runs table) and its test,
  `internal/review/marks.go` and its test.
- `lf46-review-words`: `frontend/src/lib/review.ts` and its test,
  `components/ReviewSymbol.tsx`, `components/Review.tsx` and their tests,
  `styles/review.css`, `components/Conversation.tsx` (the landing only)
  and its tests, `stores/board.store.ts` (openSlack's seat) only if needed.
- The two share no file; one wave.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf46-runs-seat` | R1-R3, X0 | — | false |
| `lf46-review-words` | W1-W4, X0 | — | true |
