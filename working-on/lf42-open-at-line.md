---
title: "Open in editor at the symbol's line, in the checkout that holds the head"
status: next
repos: [organizer]
branch: lf42-open-at-line
seat: oe-build
stage: review-map
updated: 2026-10-18
next: "review: lf42-open-at-line, gate met (E1 E2 E3 E4 X0), 4406ed5"
risk: low
footprint: [internal/service/review_open.go, internal/service/review_open_test.go, internal/service/review.go, app.go, frontend/wailsjs/*, frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css]
depends_on: [lf41-review-words, lf41-review-go]
boundary: ["docs/specs/leftovers-42.md Boundary"]
spec: "docs/specs/leftovers-42.md (FR-1 to FR-3; docs/ux/specs/review-view.md §3.3)"
gate: "docs/specs/leftovers-42.md Acceptance, rows E1, E2, E3, E4 and X0"
ui_review: true
review: pass
---

## Goal
From a symbol in the Review screen Pablo opens its code at the line, in a checkout that holds what he is reviewing.

## Gate
docs/specs/leftovers-42.md, rows E1, E2, E3, E4 and X0.

## Done
- oe-build, 2026-10-18: E1, E2 (go test, stubbed exec), E3, E4 (vitest, mocked binding) and X0 (clean clone: make test, pnpm run build, wails build, porcelain empty) pass on 969c9a1 (the same code tree as 4406ed5; main since then adds only this card); not merged. Evidence and reviewer states in `.wt-notes/oe-build/progress.md`.

## Declared changes
- added `internal/service/review_open.go`: `OpenReviewAt` (the checkout whose HEAD is the map's head, refusals), `ReviewCheckout`, `reviewCheckouts`, `checkoutsAt`, `headOf`, `checkoutOf`, `inside`, `editorCommand`, `startEditor` (FR-1, FR-2)
- added `internal/service/review_open_test.go`: E1 and E2
- modified `internal/service/review.go:ReviewStatus`: carries `Checkouts` for the shown map's head (FR-3)
- modified `app.go:OpenReviewAt`: the one bound method
- modified `frontend/wailsjs/go/main/App.d.ts`, `frontend/wailsjs/go/main/App.js`, `frontend/wailsjs/go/models.ts`: generated
- modified `frontend/src/lib/review.ts`: `WORDS.openInEditor`, `editorAt`, `notCheckedOut`, `threadOf` (FR-3, FR-4)
- modified `frontend/src/lib/review.test.ts`: their tests
- modified `frontend/src/components/ReviewSymbol.tsx`: the container reads `ReviewStatus`; `TitleLine`, `EditorAction`, `openAt`; MarkForm's thread from `threadOf` (FR-3, FR-4)
- modified `frontend/src/components/ReviewSymbol.test.tsx`: E3, E4
- modified `frontend/src/styles/review.css`: `.rs-where-line`, `.rs-not-here`
Risky:
- `ReviewStatus`: now reads the map file and runs `git rev-parse HEAD` in up to four candidates per repo on every status read (CardDrawer, Review, each symbol shown)
- `editorCommand`: an `editor` with `{line}` but no `{file}` gets the file appended
Not changed, on purpose:
- `OpenInEditor`: FR-2 keeps it as it was
- `Review.tsx`, the store: the panel reads the status itself, so neither changes
- `testdata/`, `scripts/`: the tests build their own temp repos

## Notes
- The premise "grep finds no `Open in editor` in `frontend/src`" is literally false (UnreadFiles.tsx, SpecReader.tsx); its point, that the review panel has none, holds.
- `--canned-post` never replaces a thread, so a mark asked in a replaced thread is reached in the review build only by editing the temp `state.json` (progress.md says how); E4 proves it in vitest.

## Review
Verdict: **pass** on 4406ed5228f939170968ab318bd2714e407c8167 (branch `lf42-open-at-line` did not move), reviewer `oe-review`, 2026-10-18.
Unmet gate items: none (E1, E2, E3, E4, X0 met).

### change-check (clean clone at 4406ed5)
```
risk: low
repo organizer: base 27702435c (default main) ... head lf42-open-at-line 4406ed522; 12 files
| outside boundary | organizer/frontend/wailsjs/go/main/App.d.ts |  | modified |
| outside boundary | organizer/frontend/wailsjs/go/main/App.js |  | modified |
| outside boundary | organizer/frontend/wailsjs/go/models.ts |  | modified |
| undeclared | organizer/frontend/wailsjs/go/main/App.js | OpenReviewAt | added |
| undeclared | organizer/frontend/wailsjs/go/models.ts | ReviewCheckout | added |
| undeclared | organizer/frontend/wailsjs/go/models.ts | ReviewStatus | modified |
| untested? | organizer/frontend/src/components/ReviewSymbol.tsx | TitleLine | no test file names it |
| untested? | organizer/frontend/wailsjs/go/models.ts | ReviewCheckout | no test file names it |
| untested? | organizer/internal/service/review_open.go | reviewCheckouts | no test file names it |
| untested? | organizer/internal/service/review_open.go | headOf | no test file names it |
| untested? | organizer/internal/service/review_open.go | checkoutOf | no test file names it |
| untested? | organizer/internal/service/review_open.go | checkoutsAt | no test file names it |
12 flags: outside boundary 3, outside footprint 0, undeclared 3, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 6, could not read 0, boundary unreadable 0
```
(Full output: `.wt-notes/oe-review/change-check.txt`.)
- outside boundary ×3: the spec's Boundary allows "`wails generate module` output". `wails generate module` in the clone rewrote nothing under `frontend/wailsjs/go/` (`git diff --stat -- frontend/wailsjs/go/` empty; only `runtime/` moved, by the local CLI version). Not a finding.
- undeclared ×3: the card declares all three generated files in one bullet; change-check took only the first path of that bullet. They are generated and match the regeneration. Not a finding.
- untested? ×6: `TitleLine` renders in every E3 panel case. `ReviewCheckout` is the status shape the E3 and lib tests build. `reviewCheckouts`, `headOf`, `checkoutOf` and `checkoutsAt` run on every path of `TestOpenReviewAt` through `OpenReviewAt` and `ReviewStatus` (worktree, root, neither). Not findings.
- Boundary checked by hand: 12 files, all in the spec's Boundary. `review.go` only adds `Checkouts` to the status (plus `si` and `repos` for it). `app.go` adds one bound method. `OpenInEditor` is unchanged. No package, lock, `go.mod` or `go.sum` change.

### Rows
- E1: `TestOpenReviewAt` checks the worktree's path, then the root's path (as the argv's `<path>:3`); neither is `<head[:7]> is not checked out here` and opens nothing; `../x` (plus `/etc/passwd`, `p/../../x`, `""` and a symlink out) is refused and opens nothing; another machine's card is refused, with the error naming `odyssey`. Status `Checkouts` is checked for each case. Ran: PASS.
- E2: `TestEditorCommand`: `code -g f:12`, `cursor -g f:12`, `vim f`, `subl f:12`, word for word. Ran: PASS.
- E3: vitest, binding mocked. When checked out, the title line holds `Open in editor` and the press reaches `OpenReviewAt("init-a","rv-fixture","svc/greet.go",3)`, the head start line. When not checked out there is no button and the muted line reads `Not checked out here at 391ae0f.`. The words match review-view.md §3.3 and the spec.
- E4: `threadOf` returns `asked_thread` (`01OLD`) over the head's `thread` (`01NEW`), and the head's thread when the mark has no `asked_thread`; MarkForm takes its thread from `threadOf`.
- X0: from the clean clone, `CI=true pnpm install --frozen-lockfile`, then `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`. That was a **fresh** run, id `71a0af2c-14664` (oe-ui reused it): exit 0, 19 go packages ok, vitest 78 files / 981 tests passed. `test-lease run -- pnpm run build` exited 0, `test-lease run -- wails build` exited 0, and `git status --porcelain` was empty.
- No path runs the editor without a press: `startEditor` is called only from `OpenReviewAt`, which is called only by `App.OpenReviewAt`, which is called only by `openAt`, from the button's onClick.

### Notes (do not fail the card)
- Note (to the FSE): E3's press and E4's link are proved in parts. The pure function and `EditorAction`'s onClick are tested, and the container's wiring (`onOpenEditor` → `openAt`; `onOpenThread(thread)`) is tested by source-string checks, not by a rendered press. That is the limit of a suite with no DOM library. A DOM test library would let these rows press the real element.
- Note (to the FSE): FR-1's multi-repo path (`checkoutOf` by repo prefix, the per-repo head from `rm.Repos`) has no Go test. E1 does not ask for one; the frontend covers the prefix in `editorAt`.
- Note (to the FSE): the declared risk stands: `ReviewStatus` now runs `git rev-parse HEAD` in up to four directories per repo on every read, including CardDrawer's. No measurement was asked for.
- Note (to the FSE): `Review.test.tsx`'s App mock has no `OpenReviewAt` (the builder found this). It is harmless under static rendering, but a future DOM test will need it.
