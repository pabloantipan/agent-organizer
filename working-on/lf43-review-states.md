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
review: pass
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


## Review

**Verdict: pass** at 78f5fe6c171717037ef8731e8bb798ee38c61619 (branch not moved). Unmet gate items: none (S1, S2, S3, S4, S5, X0 met).

### change-check (clean clone at 78f5fe6)

```
change-check: working-on/lf43-review-states.md
risk: low
repo organizer: base 26e983ad3 (default main) ... head lf43-review-states 78f5fe6c1; 7 files

## Changed

- organizer/frontend/src/components/ReviewSymbol.test.tsx (modified, test)
- organizer/frontend/src/components/ReviewSymbol.tsx (modified): ReviewSymbolViewProps, ReviewSymbolView, TitleLine, EditorAction, editorRefused, EditorFailed
- organizer/frontend/src/lib/review.test.ts (modified, test)
- organizer/frontend/src/lib/review.ts (modified): editorAt, definitionLine, editorRefusal, editorFailed, saveShown, focusAfterSave
- organizer/frontend/src/styles/review.css (modified)
- organizer/internal/service/review_open.go (modified): startEditor, runEditor, stderrLine, stderrLine.Write, stderrLine.String
- organizer/internal/service/review_open_test.go (modified, test)

## Tests touched

- organizer/frontend/src/components/ReviewSymbol.test.tsx
- organizer/frontend/src/lib/review.test.ts
- organizer/internal/service/review_open_test.go

## Risky (declared)

- `runEditor`: every press now blocks the bound call up to 2 s while the editor runs; a `code` launcher that exits 0 returns at once
- `MarkForm` focus effect: runs every render, consumes its flag only once a Save press has settled

## Not changed, on purpose (declared)

- `InitiativeHeader.tsx`, `TopBar.tsx`, `CharterOnce.test.tsx`: Amendment 1, no aria-current change
- `Review.tsx`: its live region is not reused; the panel has its own
- `app.go`, `frontend/wailsjs/`, `OpenInEditor`, the store: untouched

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| untested? | organizer/frontend/src/components/ReviewSymbol.tsx | TitleLine | no test file names it |
| untested? | organizer/internal/service/review_open.go | runEditor | no test file names it |

2 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 2, could not read 0, boundary unreadable 0
```

Explained: no `undeclared`, `outside boundary` or `declared, not changed` lines. The 7 changed files are exactly the amended Boundary (Amendment 1 drops `InitiativeHeader.tsx`); `git diff main...78f5fe6` is empty for `app.go`, `frontend/wailsjs/`, `InitiativeHeader.tsx`, `TopBar.tsx`, `package.json`, `pnpm-lock.yaml`, `go.mod`, `go.sum`: no new dependency, no aria-current change. The two `untested?` flags are change-check's name match missing indirect tests: `TitleLine` is drawn by every `panel()` render in `ReviewSymbol.test.tsx` (S1's one polite region) and its refusal path is `editorRefused`, tested by name; `runEditor` is `startEditor`'s body, run unstubbed through `realStart` in `TestStartEditorWaits`.

### Rows

- **S1**: `editorRefused` on `c176574 is not checked out here` calls left, focus h2, say `Not checked out here at c176574.` once, in that order, no `Error`; the panel with `dir ""` has no button, the muted `rs-not-here` span (`--fg-muted`), one polite region; the container sets `left` at once and re-reads `ReviewStatus` (`reviewCheckouts` keeps the repo with `dir ""`, so the muted line stays after the re-read). The h2 is `tabIndex={-1}`; focus moves before the button unmounts. Region empties then sets after 100 ms (`useLiveRegion`), per Amendment 7 U1.
- **S2 go**: run myself, `go test -count=1 -run 'TestStartEditorWaits|TestOpenReviewAtEditorFails|TestOpenReviewAt|TestEditorCommand' ./internal/service/` PASS; `sh -c 'echo nope >&2; exit 1'` → `editor didn't open: nope` (also through `OpenReviewAt`, word for word), `sleep 5` opened with a per-case 2.5 s ceiling (the whole test took 2.02 s), `true` opened. **S2 panel**: `Editor didn't open: nope` in `blocked-reason rs-editor-failed` (global `.blocked-reason` is sm, `--fg-muted`; no danger token), the button names it by `aria-describedby`, stays the same element and is `aria-disabled` (not `disabled`) while busy, so focus is kept.
- **2 s cannot hang longer**: `runEditor` returns at the first of exit or `time.After(editorWait)`; `OpenReviewAt` holds no service lock while it waits (`ReviewStatus` returns first). `cmd.Wait` is reaped in a goroutine; `WaitDelay` 100 ms keeps a launcher's child from holding stderr. **No editor without a press**: the one caller is `openAt` via `onOpenEditor` from the click (`busyButton.onClick`); no CLI or effect calls `OpenReviewAt`.
- **S3**: `//` → 5, `/** */` (multi-line, one-line, code after `*/`) → code line, `#` → 3, decorator first → 1, `#[derive]` after `///` → 2; R33's format.ts `1-4` opens at 2 with `range_head` untouched and the label `3-6` kept in the panel.
- **S4**: asked unedited: no Save, no `rs-buttons`; edited note: `saveShown` true and `Ask sup81 again, next`; after Save: `saveShown` false and focus by `focusAfterSave` (primary, else checked radio, else first radio), never body.
- **S5** (Amendment 1): TopBar + InitiativeHeader + Conversation rendered from a mocked store: exactly one `aria-current="page"` (the crumb), one `"true"` chat row (`fse`), the Conversations sub-tab `"true"`.
- **Words** checked string by string against leftovers-43 and review-view Amendments 7, 8: `Not checked out here at <sha>.`, `editor didn't open: <line>` (Go), `Editor didn't open: <line>` (panel), `Ask <seat> again`, `Opening…` (busy gerund, not in the spec; busy rule).

### X0

- `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` from the clean clone: **fresh**, run `b5072609-8166` (`b507260956d29c59b4c2c6a0bf90fb96`) of 78f5fe6, rc 0 (go ok; vitest 78 files, 997 tests); rs-ui reused it.
- `test-lease run -- pnpm run build` 0; `test-lease run -- wails build` 0; `git status --porcelain` empty.

### Notes (not blocking)

- Note: S1's focus and region, S2's kept focus and S4's focus after Save are proved by pure helpers, callback logs and source-string assertions, not a pressed DOM: vitest here has no DOM library by convention. The gate's "vitest, mocked" allows it; a harness row would prove the focus moves. To the FSE.
- Note: S4's test takes "the asking primary" from the pre-save controls; after saving an edited note on an asked mark, the saved note equals the asked note again, so the live form would land on the radio group, which the row's "else" allows. To the FSE.
- Note: `failedId` is `rs-editor-failed-<file>`; a file path with a space would split `aria-describedby` into two ids. To the FSE.
- Note: if the status re-read after a refusal answers a different `map_head`, `editorAt` is null and the muted line goes with the button. To the FSE.

Reviewer `rs-review`, 2026-10-18.

## UI review

rs-ui, 2026-10-18. I checked every row on 78f5fe6c171717037ef8731e8bb798ee38c61619 (the branch did not move). **Verdict: pass.** No finding of severity 4 or 3 against leftovers-43 or review-view Amendments 7 and 8. Evidence is in `.wt-notes/rs-ui/`: the `out/rb-*.png` and `out/wk-*.png` shots, the harness logs `out/h-*.txt`, the editor logs `out/editor-calls*.txt` and `out/rb-editor-calls.txt`, `steps/`, and `out/killed.txt`.

Shared test run: **reused**, run `b5072609-8166` of 78f5fe6c1717 by organizer-probe-rs-review, exit 0, vitest 78 files / 997 tests (`.wt-notes/rs-ui/x0-make-test.log`).

No mailbox, no editor. Both fixtures were `--review --canned-post`. Each launch checked that the config had exactly one `discuss_state_dir:` line, under the fixture's temp dir, and `auth: off` (`out/rb-config-check.txt`, `out/dev-config-check.txt`). The probe was stubbed. `editor:` was a stub named `code` (`bin/code`, `rb/bin/code`): it logs its argv, or with its mode file set to `fail` it prints `nope` to stderr and exits 1. No real editor ran. Nothing was posted: the asks went to the fixture's `posts.jsonl`.

How each state was checked:
- **Review build** (`make review-build` in my detached worktree): pid saved, AX and AXPress on that pid only, `screencapture -o -l` of its window, at window sizes 1440×900 and 1024×640. The screen was unlocked.
  - Not checked out: `web/src/format.ts 1-4  Not checked out here at 49f252c.`, no button.
  - Root moved to `rv-fixture`: `Open in editor` shows. The presses logged `-g …/svc/greet.go:4` (label `3-6`, `//` comment on 3) and `-g …/web/src/format.ts:2` (label `1-4`, `/** */` on 1). That is R33.
  - Stub in fail mode: the button stays and keeps AX focus, and `Editor didn't open: nope` sits under it in `.blocked-reason.rs-editor-failed`. That is R32.
  - Mode back to ok and root back on main, then a press: no editor call was logged, the button is gone, the line reads `Not checked out here at 49f252c.`, and AX focus is on the h2 `format.formatName modified` (also at 1024 on `svc.Greet`). That is R31.
  - In both cases the panel's sr-only region held the line within 1.5 s.
  - `Opening…` showed for one AX read, then `Open in editor` came back.
  - R34 could not be driven here: AX cannot type a note in a way React sees.
- **Tab harness** (rs-build's `tabharness.swift`, read; I added a `waitfile` step so the shell can move the checkout mid-run). It ran offscreen with `isKey: true` under `harness.lock`, against my own `wails dev -devserver localhost:34265` from a clean clone of 78f5fe6. Each run used a fresh fixture. There were five runs: 1024 ×3 and 1440 ×2. The dev server and stand-ins were killed by saved pid.
  - **Not here**: from the h2, Tab goes to the diff, so the muted line is no stop.
  - **R32**: `Editor didn't open: nope` appears at 400 ms. The button keeps focus and carries `aria-describedby="rs-editor-failed-svc/greet.go"`. Tab goes to the diff and Shift+Tab comes back to the button.
  - **R31**: the button is gone and focus is on the h2. The next Tab goes to the diff.
  - **R33**: logged `format.ts:2` and `greet.go:4`, the same as the review build.
  - **R34**:
    - An asked, unedited symbol has no `rs-buttons` and ends at `Asked fse · Open the thread`. From the note, Tab goes to `Open the thread`, then to body (the document's end, A2), then to `Skip to content`. Save is no stop.
    - Editing the note shows `Ask fse again, next` and `Save`.
    - After Save, Save is gone and focus is on the primary with `:focus-visible` (2px rgb(192,171,254)).
    - On an unasked symbol, choosing Reviewed and saving sends focus to the checked radio. Its label shows the same 2px ring, offset 2px.
  - **R35**, at both sizes, after `Open the thread`: one `aria-current="page"` (the crumb `init-a`); `"true"` on the Conversations sub-tab and on one chat row.
- **Style** (computed): the muted line and the failed line are both 12px/400 rgb(181,175,195), which is `--fg-muted`. A scan of the review screen for red text found nothing, and `innerText` has no `Error:` in any state. There is no horizontal scroll: 992/992 and 1408/1408, document 1024 and 1440.
- **Rest of the panel** (as oe-ui saw it on lf42): at both sizes these are unchanged:
  - the header `<head> ← <base> · 2 symbols changed, 0 tests` and `Reviewed n of 2 · 1 must-visit left`;
  - the h2 focused on N, and `Open in editor` on the file line's row (centres within 2px);
  - `? asked` before the row name, `Asked fse · Open the thread` as a link, and the primary `Reviewed, next`.
  - At 1024 the panel scrolls inside itself, as before.

Words, design vs screen:
- `Not checked out here at <short sha>.` reads `Not checked out here at 49f252c.` in the review build, and `… ad73b87.`, `… 285a5ac.`, `… 501c154.` in WKWebView. Same.
- `Editor didn't open: <first error line>` reads `Editor didn't open: nope`. Same.
- `Open in editor`: same.
- `Asked <seat> · Open the thread` reads `Asked fse · Open the thread`. Same.
- `Ask <seat> again` reads `Ask fse again, next`. The `, next` comes from lf41's primary naming.
- `Save`: same.
- `Opening…` is not in the spec. It is the design system's busy example.

Findings:
- **RS1 (2)**:
  - What the person cannot do: after editing the note on an asked symbol and pressing Save, the panel no longer shows the thread. `Asked fse · Open the thread` goes, and the row drops `asked`. The primary reads `Ask fse, next`, not `Ask fse again, next`, so the next press asks as if for the first time.
  - Where: `out/h-1024x640-run2.txt` and `out/h-1440x900-run2.txt` (G_edited → H_saved → J).
  - Evidence: `review.SetMark` (`internal/review/marks.go:134`) rewrites the mark without `Asked`/`AskedThread`. This branch does not touch it, so the behaviour predates this card. FR-4 now draws Save exactly in this state. Focus lands on the asking primary as FR-4 says. This differs from rs-review's note, which expected the radio group.
  - Severity: 2. It is not a fail: the spec covers Save's drawing and focus, not what a save keeps.
  - Proposal: SetMark keeps `Asked`/`AskedThread` when the state is unchanged, or the spec words what Save after an ask means.
- **RS2 (2)**:
  - What the person cannot do: a note typed on an unmarked symbol draws `Save`, but it stays disabled (the `canSave` check refuses a note with no mark), and nothing on screen says a mark is needed. That is a button that does nothing beside a working `Reviewed`.
  - Where: `out/h-1024x640-run1.txt` G_edited: `Reviewed`, `Save [disabled]`.
  - Evidence: FR-4's letter is met (the note differs → drawn). R34's intent ("not meet a button that does nothing") is not met in this one state.
  - Severity: 2.
  - Proposal: draw Save only when `canSave`, or say "choose a mark to save the note".
- **RS3 (1)**:
  - What the person cannot do: with the canned post, the thread is not in the feed. Conversations then lands on `# archive`, `Nothing here.`, with `aria-current="true"` on archive while `# channel` shows the selected fill.
  - Where: `out/wk-1024x640-R35-conversations.png`.
  - Evidence: this happens only in the fixture with no mailbox, and `Conversation.tsx` is untouched.
  - Severity: 1.
  - Proposal: none for this card.

Spec gaps (for the FSE): what a Save of an asked mark keeps (RS1); Save with a note and no mark (RS2).

For aglaea: RS1 (should an edited-and-saved ask stay asked, with its thread link?) and RS3 (where Conversations lands when the named thread is not listed).

Not verified in WKWebView:
- The thread's own chat as the one `"true"` row. There is no mailbox, so the canned thread is never listed; S5 vitest covers it.
- An editor still running at 2 s (go test only).
- The other refusals, a path outside the checkout and another machine's card (code and vitest only).
- `#` comments and decorators for FR-3 (vitest S3; the fixture has `//` and `/** */` only).
- R34 in the review build (AX cannot type a note).
- The timing of the region's line after a refused press. The offscreen harness read it empty at 2.5 s and set 0.7 s later; the review build had it within 1.5 s.

## Notes

- FR-5/S5 against FR-7b: settled by fse as (b), leftovers-43 Amendment 1, 2026-10-18: no aria-current change; the crumb keeps `page`, the sub-tab and the chat row stay `"true"`; S5 checks that; `InitiativeHeader.tsx` is out of the boundary.
- 2026-10-18 rs-build: FR-5 conflicts with leftovers-18 FR-7b (I22): TopBar's crumb carries aria-current="page" (TopBar.tsx:150,154; TopBar.test.tsx:99,102,241) and CharterOnce.test.tsx H5 forbids page on the sub-tabs. Both files are outside the boundary.
