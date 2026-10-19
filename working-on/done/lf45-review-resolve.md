---
title: "Every merged card resolves to its merge, and a multi-repo card is checked repo by repo"
status: done
repos: [organizer]
branch: lf45-review-resolve
seat: rr-build
reviewer: rr-review
stage: review-map
updated: 2026-10-18
next: "merge lf45-review-resolve (f81c09e) to main"
risk: low
footprint: [internal/review/resolve.go, internal/review/reconcile.go, internal/review/resolve_test.go, internal/review/reconcile_test.go]
depends_on: []
boundary: ["docs/specs/leftovers-45.md Boundary"]
spec: "docs/specs/leftovers-45.md (FR-1, FR-2)"
gate: "docs/specs/leftovers-45.md Acceptance, rows M1, M2 and X0"
ui_review: false
review: pass
---

## Goal
Before the odyssey trial, any merged card can be reviewed, and a card across repos is checked against each repo's own change.

## Gate
docs/specs/leftovers-45.md, rows M1, M2 and X0.

## Declared changes
- modified `internal/review/resolve.go:mergeOf`: a merge is `merge: <slug>` then the end or a non-slug character (FR-1)
- added `internal/review/resolve.go:isMergeOf`: the FR-1 subject test
- modified `internal/review/resolve.go:CardRanges`: the refusal names the FR-1 pattern, with two example subjects
- modified `internal/review/resolve.go:Make`: one change-check per range with --repo, its base and head; failures named per repo (FR-2)
- added `internal/review/resolve.go:repoLabel`: a range's repo name for the reconciliation
- modified `internal/review/reconcile.go:ChangeCheck`: delegates to ChangeCheckRepo with no repo
- added `internal/review/reconcile.go:ChangeCheckRepo`: change-check with `--repo`, flags stamped with that repo
- modified `internal/review/reconcile.go:Reconcile`: delegates to reconcileIn over every node
- added `internal/review/reconcile.go:ReconcileRepo`: a repo's flags onto that repo's nodes only
- added `internal/review/reconcile.go:inRepo`: whether a node is a repo's
- added `internal/review/reconcile.go:reconcileIn`: the former Reconcile body with a node filter
- modified `internal/review/resolve_test.go`: the refusal's words; M1 tests TestIsMergeOf, TestCardRangesMergeSubjects
- modified `internal/review/reconcile_test.go`: M2 tests TestMakeChecksEachRepo, TestMakeOneRangeNoRepoFlag with a stub change-check
Risky:
- `Make`: a multi-range card whose range is the root (Name "") runs change-check without --repo
Not changed, on purpose:
- `internal/service/review_test.go`: its `"merge: c2 "` assertion still holds through the refusal's examples
- `internal/review/review.go`, `internal/review/git.go`: Range already carries Name, Build already prefixes node files

## Done
- 2026-10-18 rr-build: FR-1 and FR-2 on lf45-review-resolve (7e41b56, 86d1e4d, f81c09e), rebased on main at cad0558; M1, M2, X0 pass; evidence in .wt-notes/rr-build/

## Notes
- The refusal adds `such as "merge: <slug> " or "merge: <slug>,"` so `internal/service/review_test.go:216` (outside the boundary) keeps passing without an edit.
- A multi-range card with the root as one range runs change-check there without --repo; not reached by any card seen (progress.md, Found, not asked).

## Review
Verdict: pass, at f81c09e (the pinned SHA; the branch had not moved). Unmet gate items: none.

change-check (from a clean clone at f81c09e):
```
change-check: working-on/lf45-review-resolve.md
risk: low
repo organizer: base 0cde13ed5 (default origin/main) ... head lf45-review-resolve (clone HEAD f81c09eba, on detached) f81c09eba; 4 files, 6 flags; read in /Users/pabloantipan/organizer/.wt-notes/rr-review/clean

## Changed

- organizer/internal/review/reconcile.go (modified): ChangeCheck, ChangeCheckRepo, Reconcile, ReconcileRepo, inRepo, reconcileIn
- organizer/internal/review/reconcile_test.go (modified, test)
- organizer/internal/review/resolve.go (modified): CardRanges, mergeOf, isMergeOf, Make, repoLabel
- organizer/internal/review/resolve_test.go (modified, test)

## Tests touched

- organizer/internal/review/reconcile_test.go
- organizer/internal/review/resolve_test.go

## Risky (declared)

- `Make`: a multi-range card whose range is the root (Name "") runs change-check without --repo

## Not changed, on purpose (declared)

- `internal/service/review_test.go`: its `"merge: c2 "` assertion still holds through the refusal's examples
- `internal/review/review.go`, `internal/review/git.go`: Range already carries Name, Build already prefixes node files

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| untested? | organizer/internal/review/reconcile.go | ChangeCheckRepo | no test file names it |
| untested? | organizer/internal/review/reconcile.go | ReconcileRepo | no test file names it |
| untested? | organizer/internal/review/reconcile.go | inRepo | no test file names it |
| untested? | organizer/internal/review/reconcile.go | reconcileIn | no test file names it |
| untested? | organizer/internal/review/resolve.go | mergeOf | no test file names it |
| untested? | organizer/internal/review/resolve.go | repoLabel | no test file names it |

6 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 6, could not read 0, boundary unreadable 0
```
Explanations: no `undeclared`, `outside boundary` or `declared, not changed` lines; the 4 files are all in the Boundary. The six `untested?` are a name heuristic: `mergeOf` runs in TestCardRangesMerged and TestCardRangesMergeSubjects through `CardRanges`; `ChangeCheckRepo`, `ReconcileRepo`, `inRepo`, `reconcileIn` and `repoLabel` all run through `Make` in TestMakeChecksEachRepo (its log shows both `--repo` calls and `beta: …` from `repoLabel`).

Rows:
- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` fresh, run id bcd5d2cd4c5b41293ba4783207771157 (sha f81c09e, rc 0): every go package ok, vitest 78 files / 1013 tests passed. `test-lease run -- wails build` exit 0. `git status --porcelain` of the clone: empty.
- M1: the clone's binary, `organizer review organizer lf44-ask-survives --json` in the root: head 5164ee4f1aab, base 1e813923bb15 = `git rev-parse 5164ee4^1`, reconciled true (subject `merge: lf44-ask-survives, an ask survives a Save (0152)`). main's binary (0cde13e) exits 2 with `… starts "merge: lf44-ask-survives " or "merge: lf44-ask-survives("`. TestCardRangesMergeSubjects (real git merges) and TestIsMergeOf pass: `merge: x, y`, `merge: x/y`, `merge: x` resolve, `merge: x-2 y` does not; the refusal reads "followed by the end of the subject or any character that cannot be in a slug (not a-z, 0-9, -)" and TestCardRangesMerged asserts it. My own inputs against `isMergeOf` (a test in a scratch copy, not the clone): `merge: x<TAB>trailing`, `merge: x(0153)`, `merge: x_y`, `merge: x.` are x's; `merge: xy`, `merge: x-`, `merge:  x`, `Merge: x` are not, as FR-1 says.
- M2: TestMakeChecksEachRepo: two temp repos, a stub change-check put first on the test's PATH with t.Setenv; calls `<root> c2 --repo alpha --base 3bc2558 --head 32c9eb1 --json` and `… --repo beta --base 9672ab3 --head 7a78f89 --json` (distinct ranges asserted); alpha's flag on alpha's A only, one mismatch; reconciled false, reconciliation `beta: change-check failed: exit status 3: boom in beta`; then both repos check: reconciled true, two mismatches. TestMakeOneRangeNoRepoFlag: one call with no `--repo`, reconciled as before. No test runs the real change-check or touches a repo outside temp dirs. My own check (scratch copy): a path-qualified flag (`path: p/a.go`, symbol `A`) from each repo's run lands on that repo's A only, reconciled true.

Notes (not gate failures):
- Note: a multi-range card with the root as one range runs change-check there without `--repo` (declared Risky; builder's Found, not asked); not reached by any current card. To the FSE.
- Note: M2 checks only a symbol-only flag; a path-qualified flag per repo (what the real change-check prints: `repo`, repo-relative `path`) is worth a gate line. I checked it passes. To the FSE.

Reviewer: rr-review, 2026-10-18.
