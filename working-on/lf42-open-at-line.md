---
title: "Open in editor at the symbol's line, in the checkout that holds the head"
status: next
repos: [organizer]
branch: lf42-open-at-line
seat: oe-build
stage: review-map
updated: 2026-10-18
next: "review: lf42-open-at-line, gate met (E1 E2 E3 E4 X0), 969c9a1"
risk: low
footprint: [internal/service/review_open.go, internal/service/review_open_test.go, internal/service/review.go, app.go, frontend/wailsjs/*, frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css]
depends_on: [lf41-review-words, lf41-review-go]
boundary: ["docs/specs/leftovers-42.md Boundary"]
spec: "docs/specs/leftovers-42.md (FR-1 to FR-3; docs/ux/specs/review-view.md §3.3)"
gate: "docs/specs/leftovers-42.md Acceptance, rows E1, E2, E3, E4 and X0"
ui_review: true
---

## Goal
From a symbol in the Review screen Pablo opens its code at the line, in a checkout that holds what he is reviewing.

## Gate
docs/specs/leftovers-42.md, rows E1, E2, E3, E4 and X0.

## Done
- oe-build, 2026-10-18: E1, E2 (go test, stubbed exec), E3, E4 (vitest, mocked binding) and X0 (clean clone: make test, pnpm run build, wails build, porcelain empty) pass on 969c9a1; branch on main at 9699e08, not merged. Evidence and reviewer states in `.wt-notes/oe-build/progress.md`.

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
