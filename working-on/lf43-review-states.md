---
title: "Open in editor's refusals and definition line, Save only when it saves, one page marker"
status: now
repos: [organizer]
branch: lf43-review-states
seat: rs-build
stage: review-map
updated: 2026-10-18
next: "review: lf43-review-states, gate met (S1-S5, X0), 78f5fe6"
risk: low
footprint: [internal/service/review_open.go, internal/service/review_open_test.go, frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css]
depends_on: []
boundary: ["docs/specs/leftovers-43.md Boundary"]
spec: "docs/specs/leftovers-43.md (FR-1 to FR-5; docs/ux/specs/review-view.md Amendments 7, 8)"
gate: "docs/specs/leftovers-43.md Acceptance, rows S1-S5 and X0"
ui_review: true
---

## Goal
The review panel never offers a press that cannot work, opens code at the definition, and marks one page.

## Gate
docs/specs/leftovers-43.md, rows S1-S5 and X0.

## Declared changes
- modified `internal/service/review_open.go`: `startEditor` now `runEditor`, waits up to `editorWait` (2 s); `stderrLine` keeps the first stderr line; `OpenReviewAt` doc (FR-2)
- modified `internal/service/review_open_test.go`: `TestStartEditorWaits`, `TestOpenReviewAtEditorFails` (S2)
- modified `frontend/src/lib/review.ts`: `definitionLine`, `editorAt` takes the head text (FR-3); `editorRefusal`, `editorFailed` (FR-1, FR-2); `saveShown`, `focusAfterSave` (FR-4); `WORDS.opening`
- modified `frontend/src/lib/review.test.ts`: S1-S4 lib rows
- modified `frontend/src/components/ReviewSymbol.tsx`: container re-reads the status on a "not checked out" refusal (`left`, `onLeft`); `TitleLine` with its own polite region; `editorRefused`, `EditorFailed`, `EditorAction` busy and described-by (FR-1, FR-2); MarkForm draws Save only while dirty and moves focus after it leaves (FR-4)
- modified `frontend/src/components/ReviewSymbol.test.tsx`: S1-S5; old Save-always rows updated to FR-4; S5 renders TopBar, InitiativeHeader and Conversation from a mocked store (it lives here because the amended boundary has no other test file)
- modified `frontend/src/styles/review.css`: `.rs-editor-failed`
Risky:
- `runEditor`: every press now blocks the bound call up to 2 s while the editor runs; a `code` launcher that exits 0 returns at once
- `MarkForm` focus effect: runs every render, consumes its flag only once a Save press has settled
Not changed, on purpose:
- `InitiativeHeader.tsx`, `TopBar.tsx`, `CharterOnce.test.tsx`: Amendment 1, no aria-current change
- `Review.tsx`: its live region is not reused; the panel has its own
- `app.go`, `frontend/wailsjs/`, `OpenInEditor`, the store: untouched

## Done
- 2026-10-18 rs-build: FR-1 to FR-4 and S5 as amended on lf43-review-states (4b38249, b6d771a, 78f5fe6); X0 from a clean clone: make test 0 (vitest 78 files / 997 tests), pnpm run build 0, wails build 0, porcelain empty. Evidence and reviewer steps: `.wt-notes/rs-build/progress.md`.

## Notes

- FR-5/S5 against FR-7b: settled by fse as (b), leftovers-43 Amendment 1, 2026-10-18: no aria-current change; the crumb keeps `page`, the sub-tab and the chat row stay `"true"`; S5 checks that; `InitiativeHeader.tsx` is out of the boundary.
- 2026-10-18 rs-build: FR-5 conflicts with leftovers-18 FR-7b (I22): TopBar's crumb carries aria-current="page" (TopBar.tsx:150,154; TopBar.test.tsx:99,102,241) and CharterOnce.test.tsx H5 forbids page on the sub-tabs. Both files are outside the boundary.
