---
title: "Open in editor at the symbol's line, in the checkout that holds the head"
status: done
repos: [organizer]
branch: lf42-open-at-line
seat: oe-build
stage: review-map
updated: 2026-10-18
next: "none: merged review pass (oe-review, oe-ui); findings routed in ## Review"
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
- Where the UI review's findings go (I did not edit `## UI review`): U1 (sev 2, refusal at the press shows a raw `Error:` and keeps the button) goes to the FSE, as the refused-at-press spec gap oe-ui names. U2 (sev 1, the doc comment is the head start line) goes to the FSE through aglaea's A2. A1 goes to aglaea, via the FSE.

## UI review
oe-ui, 2026-10-18, on 4406ed5228f939170968ab318bd2714e407c8167 for every row (the branch did not move). **Verdict: pass.** No finding of severity 4 or 3. Evidence is in `.wt-notes/oe-ui/` (`out/rb-*.png`, `out/wk-*.png`, `out/h-*.txt`, `out/editor-calls.txt`, `steps/`).

Shared test run: **reused** run `71a0af2c-14664` of 4406ed5228f9 by organizer-probe-oe-review (exit 0; vitest 78 files / 981 tests; `.wt-notes/oe-ui/x0-make-test.log`).

No mailbox, no editor. main's `fixture-home.sh --review` already writes `discuss_state_dir` under its temp dir. Each run checked that there was exactly one such line and that it sat under that temp dir, appended nothing, and confirmed `auth: off` (`out/rb-config-check.txt`, `out/dev-config-check.txt`). The probe was stubbed. `editor:` was set to `.wt-notes/oe-ui/bin/code`, a script that only logs its argv; its base name is `code`, so FR-2's `-g` path runs. No real editor was launched.

How each state was checked:
- **Review build** (`make review-build` in my detached worktree; pid saved, quit by pid). The screen was unlocked, so AX and `screencapture -o -l` worked on my window, at window sizes 1024×640 and 1440×900. I walked it by AXPress on my pid: init-a → Work → rv-fixture → Review the change → Make the map → a row.
  - Not checked out (the fixture's default): `svc/greet.go 3-6  Not checked out here at c176574.`, with no button (`rb-*-E3-notcheckedout.png`).
  - `git checkout rv-fixture` in the root, then a symbol picked: `Open in editor` appears. AXPress logged `-g …/init-a/svc/greet.go:3` (`rb-*-E3-root-*.png`).
  - Root back on main plus `.wt/rv-fixture`: AXPress logged `-g …/init-a/.wt/rv-fixture/web/src/format.ts:1`.
  - Worktree removed while the button showed, then pressed: nothing opens, and `Error: c176574 is not checked out here` appears (U1, `rb-1024x640-E3-refused-at-press.png`).
- **Tab harness** (lw-ui's `tabharness.swift`, read and rebuilt; the builder left no copy under `oe-build/`). It ran offscreen with `isKey: true`, under `harness.lock`, against my own `wails dev -devserver localhost:34265` from a clean clone of 4406ed5. It used a fresh fixture at each size and the same four steps: A not checked out, B root, C worktree, D FR-4. The dev server and the fixture stand-ins were killed by saved pid (`out/killed.txt`).
  - Both sizes, B and C: `Open in editor` and the file line sit on one row (centres within 2 px), and the file stays one line.
  - Opening a symbol focuses the h2. One Tab reaches `Open in editor` (`:focus-visible`, `solid 2px rgb(192,171,254)`, offset 2px, 8.9:1 on the ground). The next Tab reaches the diff, and Shift+Tab goes back. Return and Space each logged one call (`out/editor-calls.txt`), and focus stayed on the button.
  - A: from the h2, Tab goes straight to the diff, so the muted line is not a stop. There is no horizontal scroll (`scrollWidth` 1024/1440, screen 992/992 and 1408/1408).
  - D (FR-4 / E4 in WK): stubs in my page only, nothing posted. With the review's `thread` 01REVIEWTHREAD and the mark's `asked_thread` 01MARKTHREAD, pressing `Open the thread` set `slackDraft` to `01MARKTHREAD` only, `sub: conversations`, `reviewBack: true`, at both sizes.
- **Style** (computed): `Open in editor` is the default button, the same as Save: `rgb(39,32,51)` fill, 1px `rgba(255,255,255,.09)` border, radius 6, 13px/500, 28px tall, text 13.3:1. The muted line is `--fg-muted` rgb(181,175,195) on rgb(26,21,35) (8.4:1), Manrope 12px, the same size as the mono file line.
- **Rest of the Review panel** (as lw-ui saw it on lf41): the header `head ← base · 2 symbols changed, 0 tests` and `Reviewed n of 2 · 1 must-visit left` stay 56px tall and unchanged at both sizes. The h2 is 21px, one line, and is focused on N. The title row grows from 20 to 28px only when the button is drawn. `? asked` sits before the name. `Asked fse · Open the thread` is a link. The primary reads `Ask fse, next` with Question and a note. `Reviewed 1 of 2` shows after the ask (`wk-*-E4-asked.png`).

Words, design vs screen:
- `Open in editor` (§3.3): same in RB and WK.
- `Not checked out here at <short sha>.` (FR-3): `Not checked out here at c176574.` in RB, `… adbc0a1.` and `… 57d87e6.` in WK. Same, 7 characters, full stop.
- `Open the thread`, `Asked fse · Open the thread`: same.

Findings:
- **U1 (2)**:
  - What the person cannot do: when the checkout moves after the panel read it, the press opens nothing and the panel shows a raw error. The button stays, as if a second press would work.
  - Where: the title, `rb-1024x640-E3-refused-at-press.png`.
  - Evidence: `Error: c176574 is not checked out here` appears in `.review-error` red with the `Error:` prefix, and the status is not re-read.
  - Severity: 2. It is rare, and the design and the spec never word this state.
  - Proposal: on a refusal, re-read the status, so the muted `Not checked out here at <sha>.` replaces the button. Never show the `Error:` prefix.
- **U2 (1)**:
  - What the person cannot do: on a symbol with a doc comment, the editor opens at the comment, not at the definition.
  - Where: format.ts `1-4`, logged as `:1`; the definition is line 2.
  - Evidence: the map's head range starts at the doc comment. This is as FR-1 and FR-3 say ("head start line").
  - Severity: 1.
  - Proposal: none for now; it is noted for aglaea.

Spec gaps (for the FSE): the refused-at-press state (U1) has no words or behaviour in FR-3 or §3.3. The moved branch (the map's head is older) is covered only by E1's logic.

For aglaea:
- A1: the button sits on the file line under the h2 rather than inside the h2. I read that as §3.3's "title" (the h2 keeps a clean name for focus); confirm.
- A2: does a doc comment count as the head line (U2)?

Not verified in WKWebView: the moved-branch state (`FIXTURE_REVIEW_MOVE`; vitest and E1 only), a multi-repo card's prefix match (vitest `editorAt` only), another machine's card (E1 only), and the `vim`/`subl`/`{line}` command forms (E2 only). FR-4 was seen in WK only with stubbed bindings; the real replaced-thread path through `state.json` was not driven.
