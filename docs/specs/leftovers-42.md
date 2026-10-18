# Leftovers 42: Open in editor at the symbol's line: the build spec

status: ruled (0150)
by: the FSE, 2026-10-18, on main at the merge of leftovers 41's cards, in away mode
sources: Aglaea's `docs/ux/specs/review-view.md` §3.3 ("`Open in editor`
at the head line (secondary)"); rs-ui's U3 and G1 (`working-on/done/rv-symbol.md`,
## UI review: a line-taking binding and a choice of checkout).

## Premises (read 2026-10-18)

| Premise | Shown by |
|---|---|
| `OpenInEditor(path)` runs `editor` from config (default `code`) with the path, no line | `internal/service/service.go:846-853`; `app.go:295` |
| Pablo's config has `editor: code` | `~/.config/organizer/config.yaml:29` |
| a card's worktree is the first of `.wt/<branch>`, `.wt/<slug>`, `.wt/<repo>-<slug>` that exists, else the root (`launchDir`, `worktreeCandidates`) | `internal/service/run.go:68-92` |
| the panel's title shows the file and head lines and has no `Open in editor` | `components/ReviewSymbol.tsx`; grep finds no `Open in editor` in `frontend/src` |
| a merged card's branch and worktree are gone; the map's head is the merge's head | `docs/specs/review-map.md` v2 FR-13 |

## Requirements, card `lf42-open-at-line`

- **FR-1** A bound `OpenReviewAt(initiative, card, file, line)`: the
  checkout is the first whose `HEAD` is the map's head: the card's
  worktree (`worktreeCandidates`), then the repo under the initiative root
  (for a multi-repo card, the repo the file belongs to). None: it refuses
  with `<short sha> is not checked out here`, opening nothing. Another
  machine's card is refused. A path outside the checkout is refused.
- **FR-2** The editor command: `editor` may carry `{file}` and `{line}`;
  without them, an editor whose binary is `code` or `cursor` runs `-g
  <file>:<line>`, any other gets the file alone. The existing
  `OpenInEditor(path)` is unchanged.
- **FR-3** The panel's title carries `Open in editor` (secondary) at the
  head start line. When FR-1 would refuse, it is not drawn and the title
  line adds, muted, `Not checked out here at <short sha>.` A read of
  which checkout holds the head is part of the review status (FR-14), so
  the panel knows before the press.

Held: the Tests group's "else the editor" (a test has no line in the map).

## Acceptance → gate

No row launches a real editor: the command runs through a stubbed exec in
go test, a mocked binding in vitest.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| E1 | 1 | go test with temp repos: a worktree at the head; the root at the head and no worktree; neither; `../x`; another machine's card | the worktree's path; the root's; `<sha> is not checked out here`; refused; refused |
| E2 | 2 | go test: `code`, `cursor`, `vim`, `subl {file}:{line}` | `code -g f:12`; `cursor -g f:12`; `vim f`; `subl f:12` |
| E3 | 3 | vitest, mocked: checked out; not | `Open in editor` calls the binding with the head start line; absent, and `Not checked out here at 391ae0f.` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `internal/service` (one new file for the checkout and the editor
  command, and its test; `review.go` only to add the checkout to the
  status), `app.go` (one bound method), `wails generate module` output,
  `components/ReviewSymbol.tsx` and its test, `lib/review.ts` and its test,
  `styles/review.css`.
- Starts after leftovers 41 merged (`depends_on: [lf41-review-words,
  lf41-review-go]`): both touch these files.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf42-open-at-line` | E1, E2, E3, X0 | `lf41-review-words`, `lf41-review-go` | true |
