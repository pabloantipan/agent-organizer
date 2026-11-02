---
title: "Status reads, usage state, spec reader and review guard close their gaps"
status: now
repos: [organizer]
branch: lf66-go
seat: l66-go
reviewer: l66-go-rev
stage:
updated: 2026-11-02
next: "review: lf66-go, G1-G4 and X0 pass, 2b60199"
depends_on: []
boundary: ["internal/service/draft.go", "internal/cli/decisions.go", "internal/service/literals_test.go", "internal/service/usagepost.go", "internal/service/spec.go", "internal/specpath/", "reviewguard.go", "internal/service/draft_test.go", "internal/cli/decisions_test.go", "internal/service/usagepost_test.go", "internal/service/spec_test.go", "reviewguard_test.go"]
spec: "docs/specs/leftovers-66.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-66.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
Four review findings closed, each with a test that fails on main.

## Gate
docs/specs/leftovers-66.md, rows G1-G4 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #43, the review guard).
- Merge target: `main` through talos-lab's PR.
- Tests: `go test ./...`; every fixture in a temp dir.
- Short-sample fallback: the real home is injected in G4, never read.
- Data shape across states: as the premises give it.
- Evidence: logs under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-02: FR-1 to FR-4 on branch lf66-go (e273638, 06ed0bd, dd54fd5, 2b60199), on origin/main cb9a890, not pushed; G1-G4 fail (G1: plant passes) on cb9a890 and pass on the branch, X0 passes in a clean clone; evidence in .wt-notes/l66-go/progress.md.

## Declared changes
- modified `internal/service/draft.go:acceptRecord`: compares to model.DecisionProposed, not "proposed"
- modified `internal/cli/decisions.go:statusWord`: compares to model.DecisionProposed, not "proposed"
- modified `internal/service/literals_test.go`: the guard also flags a status string literal in ==, != or case; draft.go and decisions.go allowlisted with their reason; TestLF66G1GuardFindsStatusLiteral added
- modified `internal/service/usagepost.go:pruneGone`: was pruneRejected, also drops Accepted keys whose ledger row is gone
- modified `internal/service/usagepost.go:pruneUsageGone`: renamed from pruneUsageRejected, same call sites
- added `internal/service/usagepost_test.go:TestLF66G2PassPrunesGoneAcceptedRow`: G2
- modified `internal/service/spec.go:ReadSpec`: each allowed path carries its admitting folder; reads through specpath.Within, refusing a link out
- added `internal/service/spec.go:slashDir`: the folder of a root-relative path (the parameter `path` shadows the package)
- added `internal/specpath/specpath.go:Within`: evaluates symlinks, containment by os.SameFile against ancestors
- added `internal/specpath/specpath.go:ErrOutside`: the refusal Within wraps
- added `internal/service/spec_test.go`: TestLF66G3ReadSpecSymlinks (G3), TestLF66ReadSpecSymlinksOtherRules
- added `internal/specpath/specpath_test.go:TestWithin`: folder rules, "." root, folder links
- added `reviewguard.go:underHome`: os.SameFile of the home against the path and each existing ancestor
- deleted `reviewguard.go:underDir`: the text compare FR-4 replaces
- modified `reviewguard.go:guardDecision`: stats the home (refuses if it cannot) and decides with underHome
- added `reviewguard_test.go`: TestLF66G4GuardSeesHomeByIdentity (G4, injected home), swapCase
Risky:
- `ReadSpec`: a specs:, card, runs or map path that reached outside its folder through a symlink now refuses; a real initiative relying on that loses the read
- `pruneGone`: an unreadable ledger (LoadLedger nil) empties Accepted, so the next pass resends every row (the record upserts)
- `guardDecision`: a home that resolves but cannot be stat'ed now refuses a review or dev build
Not changed, on purpose:
- `internal/model`: no new helper; Open() would read awaiting-cells as proposed, so both reads keep the exact constant on the allowlist
- `internal/scan/scan.go:resolveSpecs`: still lists symlinked files; the reader refuses them, the scan is not the gate

## Notes
- The clean clone .wt-notes/l66-go/clean is left in place: the session's safety check refused rm -rf of a former working directory. Safe to delete.
