# Leftovers 41: the review's words and links, and the Go and fixture loose ends: the build spec

status: proposed (0149)
by: the FSE, 2026-10-18, on main at 443d8c5, in away mode
sources: Aglaea's `docs/ux/specs/review-view.md` Amendments 5 and 6
(R26-R30, words given); lf40's UF1 (verb labels); sup82's run report
(`runs/2026-10-18-sup82-review-map-v3.md`) and the Go leftovers held in
`docs/bitacora/fse_bitacora.md`. Every premise below was read on main today
(443d8c5).

## Premises

| Premise | Shown by |
|---|---|
| a failed ask's line is `Saved here; couldn't ask ${seat}: ${firstLine(error)}`; Go sends the error's first line, unmapped (`open /var/folders/…/tokens.json: no such file or directory`; `dial unix …discuss.sock: connect: …`, au-ui U3) | `frontend/src/lib/review.ts:72-75`; `internal/service/review_ask.go:131,136`; `internal/service/review.go:417-424` |
| `Open the thread` is `<button className="link">` | `components/ReviewSymbol.tsx:254` |
| a row draws glyph, name, change word, then `asked`; its name reads name, change, flags, mark, `asked` | `components/Review.tsx:409-412`; `lib/review.ts:386` |
| the pre-press line renders whatever the ask state; no `Ask <seat> again` | `components/ReviewSymbol.tsx:189, 213`; `lib/review.ts:61-66, 530` |
| the chat list marks its current row by class only, no `aria-current` (the People panel has it) | `components/Conversation.tsx:321-336`; `components/SlackView.tsx:103` |
| Needs me's verbs are inline literals in `Home.tsx`; only Rule and Open are tested | `components/Home.tsx:202-404`; `components/Home.waits.test.tsx:107` |
| the help line for review lacks `--card`, `--work`, `--marks` and says "the Go change" | `internal/cli/cli.go:175` vs `internal/cli/review.go:19` |
| review runs `git archive --format=tar` piped to `tar -x`; doctor's review line checks only go and node | `internal/review/git.go:100-101`; `internal/cli/review.go:153-166` |
| the map's `Source` joins every registered source, used or not | `internal/review/review.go:101, 528`; `source.go:78` |
| one `Thread` per head's marks; `SetAsked` overwrites it; `--marks` prints it for every asked mark, so marks asked in a replaced thread show the new id | `internal/review/marks.go:34-36, 52, 173`; `internal/service/review_ask.go:126-127`; `internal/cli/review.go:139-140` |
| `setSeat` settles and unlocks before `notifyLaunch`; `organizer run` sets `OnLaunch` and never waits (crew waits) | `internal/service/launch.go:185-188`; `internal/cli/run.go:64`; `internal/cli/crew.go:78` |
| `scan.cardSpecRel` duplicates `service.specRel` | `internal/scan/scan.go:257-260`; `internal/service/spec.go:66` |
| the fixture's default and `--review` config writes no `discuss_state_dir`, so the default `~/.local/state/discuss` (the real socket) is used | `scripts/fixture-home.sh:555-566`; `internal/config/config.go:131, 173` |
| the only canned config field is `canned_health`; `AskReview` always posts through `PostToCell` | `internal/config/config.go:54`; `internal/service/review_ask.go:91, 125` |

## Requirements

Card `lf41-review-words` (frontend):

- **FR-1** (R26) The failed-ask line by cause, matched on the error text:
  `tokens.json` or `no discuss identity` → `Saved here; couldn't ask
  <seat>: Deltagos has no discuss identity for this cell. organizer doctor
  says why.`; `discuss.sock` → `Saved here; couldn't ask <seat>: discuss
  isn't running. organizer doctor says why.`; `409` or `closed` → `Saved
  here; the review's thread is closed. Try again opens a new one.`;
  anything else → the first line with `/Users/<name>` shortened to `~`.
- **FR-2** (R27) `Open the thread` is a link (an `<a>` with the in-app link
  ring, Enter activates), not a button.
- **FR-3** (R28) An asked row draws `? asked` / `✕ asked` as one unit in
  the mark's place before the name; its accessible name keeps `asked`
  next to the mark.
- **FR-4** (R29) Once asked, the panel shows only `Asked <seat> · Open the
  thread`, no pre-press line. Editing the note brings back `Saves the mark
  and asks <seat> again in this review's thread. Wakes <seat>.` and the
  primary `Ask <seat> again` (`, next` while one is left).
- **FR-5** (R30) The chat list's current row carries `aria-current="true"`
  and follows the chat shown, a review's `Open the thread` included.
- **FR-6** (lf40 UF1) Needs me's verbs live in one exported list in `lib`
  (`Rule`, `Rule · draft`, `Answer`, `Open`, `Agents`, `Launch`, `Show`);
  `Home.tsx` reads it; a vitest names each row kind's verb.

Card `lf41-review-go` (Go, review):

- **FR-7** The help line reads `organizer review <initiative> <card | sha>
  [--card slug] [--json] [--out path] [--work dir] [--marks]  the change
  of a card's branch or merge as revmap.json …`, the same flags as
  `review.go`'s usage.
- **FR-8** Doctor's review line names `tar` with go and node, and says
  `missing` when it is not on the PATH.
- **FR-9** The map's `Source` names only the sources that produced a node.
- **FR-10** Each asked mark keeps the thread it was asked in
  (`asked_thread`); `--marks` prints that one. A mark asked before this
  field exists reads the head's `thread`.

Card `lf41-fixture-launch` (Go, service and fixture):

- **FR-11** `setSeat` calls `notifyLaunch` before it settles, so `organizer
  run` prints every seat's line with no wait.
- **FR-12** One spec-path helper in a package both `scan` and `service` can
  import; both call it; the two copies go.
- **FR-13** `fixture-home.sh`'s default and `--review` homes write
  `discuss_state_dir: $tmp/discuss`, unless `--live-mailbox`.
- **FR-14** A config `canned_post: <file>`: when set, `PostToCell` writes
  the request as one JSON line to the file and returns a thread id
  `canned-<n>` and a message id, posting nothing. `fixture-home.sh
  --canned-post` sets it to `$tmp/posts.jsonl`.

Held: multi-repo reconciliation (one change-check on the first range,
`review.go:104`), the cgo-off problem lines, the second `packages.Load`
(~1 s), runs.jsonl attribution of root-run seats, the top bar at 1024 and
Home from 1920 (not measured), Open in editor at a line.

## Acceptance → gate

No row posts to a real mailbox, drives Pablo's screen, starts a seat or
writes the clipboard (0095, 0108). Harness rows run in the Tab harness's
hidden window on `fixture-home.sh --review`, with discuss pointed away.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| W1 | 1 | vitest of the four causes with the two au-ui error texts, a 409 text and `open /Users/x/y: denied` | each cause's words exactly; the last reads `open ~/y: denied` |
| W2 | 2 | vitest and harness | `Open the thread` has role link, is a Tab stop, Enter opens the thread |
| W3 | 3 | harness at 1024×640 and 1440×900, an asked row and an unasked marked row | the glyph's left x equal on both; `asked` before the name |
| W4 | 4 | vitest: after an ask; then edit the note | only `Asked <seat> · Open the thread`; the `again` line and `Ask <seat> again` |
| W5 | 5 | vitest | after `openSlack` with a thread, that chat's row has `aria-current="true"`, `channel` none |
| W6 | 6 | vitest | each Needs me row kind renders its verb from the one list |
| G1 | 7, 8 | go test of the help text and of doctor with tar off the PATH | the flags as FR-7; `tar missing` |
| G2 | 9 | go test: a Go-only change | `Source` is `go/types` alone |
| G3 | 10 | go test: ask a, the thread closes (409), ask b; `--marks` | a prints the old thread, b the new |
| G4 | 11 | go test of `organizer run --print`-free launch with a fake probe, 20 runs | every seat line printed in each run |
| G5 | 12 | grep and go test | one helper, no `cardSpecRel`/`specRel` copies; scan and service tests pass |
| G6 | 13, 14 | `fixture-home.sh --review --canned-post`, the app's AskReview through a go test on that config | `config.yaml` has `discuss_state_dir` under the temp dir and `canned_post`; one line in `posts.jsonl`; no socket touched |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf41-review-words`: `lib/review.ts` and its test, `components/ReviewSymbol.tsx`,
  `components/Review.tsx` and their tests, `styles/review.css`,
  `components/Conversation.tsx` (the chat row's `aria-current` only) and its
  test, `components/Home.tsx` (the verbs only), a `lib/verbs.ts` and its
  test, `components/Home.waits.test.tsx`.
- `lf41-review-go`: `internal/review/*` and tests, `internal/cli/review.go`,
  `internal/cli/cli.go` (the help line), `internal/cli/review_test.go`,
  `internal/service/review_ask.go` and its test, `wails generate module`
  output.
- `lf41-fixture-launch`: `internal/service/launch.go` and its test,
  `internal/cli/run.go` and its test, `internal/scan/scan.go`,
  `internal/service/spec.go`, one new small package for the helper,
  `internal/config/config.go`, `internal/service/cell.go`,
  `scripts/fixture-home.sh`, their tests.
- The three share no file; they run in one wave.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf41-review-words` | W1-W6, X0 | — | true |
| `lf41-review-go` | G1-G3, X0 | — | false |
| `lf41-fixture-launch` | G4-G6, X0 | — | false |
