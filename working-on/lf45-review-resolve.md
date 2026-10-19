---
title: "Every merged card resolves to its merge, and a multi-repo card is checked repo by repo"
status: now
repos: [organizer]
branch: lf45-review-resolve
seat: rr-build
reviewer: rr-review
stage: review-map
updated: 2026-10-18
next: "review: lf45-review-resolve, gate met (M1, M2, X0), f81c09e"
risk: low
footprint: [internal/review/resolve.go, internal/review/reconcile.go, internal/review/resolve_test.go, internal/review/reconcile_test.go]
depends_on: []
boundary: ["docs/specs/leftovers-45.md Boundary"]
spec: "docs/specs/leftovers-45.md (FR-1, FR-2)"
gate: "docs/specs/leftovers-45.md Acceptance, rows M1, M2 and X0"
ui_review: false
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
