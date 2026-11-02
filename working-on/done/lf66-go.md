---
title: "Status reads, usage state, spec reader and review guard close their gaps"
status: done
repos: [organizer]
branch: lf66-go
seat: l66-go
reviewer: l66-go-rev
stage:
updated: 2026-11-02
next: "done: merged as organizer #45 784a1f3"
depends_on: []
boundary: ["internal/service/draft.go", "internal/cli/decisions.go", "internal/service/literals_test.go", "internal/service/usagepost.go", "internal/service/spec.go", "internal/specpath/", "reviewguard.go", "internal/service/draft_test.go", "internal/cli/decisions_test.go", "internal/service/usagepost_test.go", "internal/service/spec_test.go", "reviewguard_test.go"]
spec: "docs/specs/leftovers-66.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-66.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
review: "pass at 2b60199, unmet: none (l66-go-rev, 2026-11-02)"
prs:
  - {repo: organizer, pr: 45, target: main, state: merged, merge: 784a1f3}
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

## Review
**Verdict: pass** at 2b60199 (lf66-go on origin/main cb9a890). Unmet rows: none. Reviewer l66-go-rev, 2026-11-02. Clean clone at 2b60199, a second at cb9a890; logs in `.wt-notes/l66-go-rev/`.

change-check (`change-check organizer lf66-go --base origin/main`; the clone's origin/main is a2087c9, which differs from cb9a890 only in cards, specs and decisions):
```
| undeclared | internal/service/usagepost.go | postUsage | modified |
| undeclared | internal/service/usagepost.go | pruneRejected | deleted |
| undeclared | internal/service/usagepost.go | pruneUsageRejected | modified |
| undeclared | internal/service/usagepost.go | passRejected | modified |
| undeclared | internal/service/usagepost_test.go |  | modified |
| undeclared | internal/specpath/specpath_test.go |  | modified |
| untested? | internal/service/spec.go | slashDir | no test file names it |
| untested? | internal/service/usagepost.go | pruneGone | no test file names it |
| untested? | internal/service/usagepost.go | pruneUsageRejected | no test file names it |
| untested? | internal/service/usagepost.go | pruneUsageGone | no test file names it |
| untested? | reviewguard.go | underDir | no test file names it |
| declared, not changed | | usagepost_test.go:TestLF66G2PassPrunesGoneAcceptedRow | no matching change |
| declared, not changed | | specpath/specpath.go:ErrOutside | no matching change |
| declared, not changed | | specpath/specpath_test.go:TestWithin | no matching change |
14 flags: outside boundary 0, undeclared 6, declared, not changed 3, untested? 5
```
Explained, none a finding: pruneRejected and pruneUsageRejected are the renames to pruneGone and pruneUsageGone, declared as "was"/"renamed from"; postUsage and passRejected changed only those call sites. The two test files and TestLF66G2…/TestWithin are declared as `file:Symbol` and are in the diff (change-check does not match test symbols); ErrOutside is a `var` added at specpath.go:43, which change-check does not read as a symbol. untested?: underDir is deleted; pruneGone, pruneUsageGone and slashDir run inside G2 (postUsage, passRejected) and G3 (ReadSpec).

- **G1** pass. `TestLF62G4NoDecisionStatusLiterals`, `TestLF62G4GuardFindsPlantedComparison`, `TestLF66G1GuardFindsStatusLiteral` pass at 2b60199. Plant `d.Status == "ruled"` (internal/service/zz_plant.go, temp copies, not the tree): cb9a890's guard `ok`; 2b60199's guard `FAIL … zz_plant.go:6: compares to a decision status literal`.
- **G2** pass. `TestLF66G2PassPrunesGoneAcceptedRow` passes; on cb9a890 with the test copied in it fails (`accepted map[s-0000 s-0001 s-0002], want s-0000 and s-0001 kept`).
- **G3** pass. `TestLF66G3ReadSpecSymlinks`, `TestLF66ReadSpecSymlinksOtherRules`, `TestWithin` pass; on cb9a890 G3 fails (`want refused`, 3 reads of refused links).
- **G4** pass. `TestLF66G4GuardSeesHomeByIdentity` (8 subtests, case-changed and /System/Volumes/Data forms) passes; on cb9a890 all 8 fail (`started: it is under the injected home`). The home is injected (`newGuardFixture`, t.TempDir); the added test reads neither os/user nor $HOME (the existing realHomeDir test at reviewguard_test.go:263 predates the card).
- **X0** pass. pnpm install exit 0; `make test` exit 0 (fresh run, not shared: every Go package ok, vitest 1643 passed); `wails build` exit 0; `git status --porcelain` empty, runtime unchanged.

Inputs beyond the builder's tests (scratch copies; `rev-fr123.txt`, `rev-fr4.txt`):
- FR-1: `"ruled" == x` flagged; `case "superseded", "applied"` flagged twice; a raw-string literal `` x == `withdrawn` `` flagged; `x == ("ruled")` and `x == r` (const r = "ruled") not flagged.
- FR-2: two keys accepted and still in the ledger, after a second post pass and the view's pass: both kept, no new post.
- FR-3: a symlinked directory in docs/specs pointing outside: refused (the scan does not list it, so the allow list refuses it); a chain of two links ending in the folder: reads `# A`; a chain ending outside: refused with ErrOutside; a link to docs/other/card.md (a sibling folder another rule allows): refused with ErrOutside.
- FR-4: XDG_DATA_HOME equal to the home, a non-existent dir under the home, and with the home itself a symlink (data through the real path, through the link, and non-existent through the link): all refuse "under the real home"; both outside starts.

- Note: the literal guard misses a parenthesized literal (`x == ("ruled")`), as the lf62 constant guard misses `x == (model.DecisionRuled)`; nobody writes it by accident. Goes to: the FSE's leftovers list, low.
- Note: an allowlisted file is exempt whole, so draft.go or decisions.go going back to `"proposed"` would pass the guard; only the "allowlisted but compares no status" check holds them. Goes to: the FSE's leftovers list, low.

