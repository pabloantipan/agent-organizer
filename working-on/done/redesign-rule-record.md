---
title: The owner's ruling is written into a proposed record and committed
status: done
repos: [organizer]
branch: redesign-rule-record
updated: 2026-09-26
review: pass
next: "review: redesign-rule-record, gate G8, G9, G17 met, f6f6c7b 80c5055 748bb9f 180e8eb"
seat: wave1-rule
depends_on: ["redesign-runs-binding"]
boundary: ["internal/service/rule.go (new)", "internal/service/rule_test.go (new)", "internal/cli/rule.go (new)", "internal/cli/cli.go (dispatch and help)", "app.go (a RuleDecision method only)", "frontend/wailsjs/ (regenerated)", "frontend/src/hooks/useWails.ts (the rule wrapper)", "CLAUDE.md (line 37, per 0019)"]
spec: "docs/specs/redesign.md (FR-13); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G8, G9, G17; the Gate section below"
---

## Goal
The redesign, wave 1 of 2: FR-13 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [x] G8: see `docs/specs/redesign.md`, Acceptance
- [x] G9: see `docs/specs/redesign.md`, Acceptance
- [x] G17: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE
- 2026-09-26 FR-13 built on `redesign-rule-record` (f6f6c7b, 80c5055, 748bb9f, 180e8eb, rebased onto main, unmerged). `Service.RuleDecision` (`internal/service/rule.go`) writes `status: ruled`, `ruled`, `ruled_by` (the record's `owner`, A4) and `chosen` into a proposed record and the words under `## Ruling` as "<owner>, <date>, in the organizer on <machine>: <words>", editing the file as text so every other byte survives, then shells out to git to commit that one file. `organizer rule <initiative> <NNNN> --chosen <option> --words <text>` (`internal/cli/rule.go`, dispatch and help in `cli.go`), `App.RuleDecision` bound with the wailsjs bindings regenerated and `api.ruleDecision` in `useWails.ts`, CLAUDE.md's Decisions bullet rewritten per 0019.
  - G8 met: `TestRuleDecisionWritesAndCommits` in `internal/service/rule_test.go` rules a proposed fixture in a temp git repo and asserts the diff's added lines are exactly `status: ruled`, `ruled: 2026-09-26`, `ruled_by: pablo`, `chosen: fsnotify` and the ruling line, that `## Consequences` and the options survive, and `git show --name-only` has one file with one commit; `TestRuleDecisionRefusals` gives each refusal its own fixture (ruled again, a chosen outside options, no chosen, empty words, a record that is not there) and asserts the record is byte-identical, HEAD unmoved and the tree clean; `TestWriteRulingShapes` covers a missing key, a missing heading, an occupied section and multi-line words. `go test ./internal/service/ -run TestRuleDecision -v` → `--- PASS: TestRuleDecisionWritesAndCommits`, `--- PASS: TestRuleDecisionRefusals`. `go run . rule --help` prints the usage and exits 0.
  - G9 met: `XDG_DATA_HOME=$(mktemp -d) make test` in the worktree after the rebase → `ok` for all 13 packages with tests (`ok organizer/internal/service 15.645s`, `ok organizer/internal/cli 16.097s`), no golden refresh needed.
  - G17 met: `git diff --name-only main...redesign-rule-record -- '*.css'` prints nothing.

## Review
- 2026-09-26 **pass**. Gate G8, G9, G17 all met by the diff (`f6f6c7b`, `80c5055`, `748bb9f`, `180e8eb`).
  - **G8** re-run: `XDG_DATA_HOME=$(mktemp -d) go test ./internal/service/ -run 'TestRuleDecision|TestWriteRulingShapes' -v` → `--- PASS: TestRuleDecisionWritesAndCommits`, `--- PASS: TestRuleDecisionRefusals` (5 subtests), `--- PASS: TestWriteRulingShapes` (4 subtests). The first half of the row is verified as written and not by proxy: the fixture is a proposed record in a temp `git init` root, the assertion is on `git diff <before>..HEAD` itself — added lines exactly `status: ruled`, `ruled: 2026-09-26`, `ruled_by: pablo`, `chosen: fsnotify` and `pablo, 2026-09-26, in the organizer on lodestar: …`, removed lines exactly the four old field values plus the blank the ruling replaced, counted both ways so a fifth added line fails — then `git log --oneline` = 1 commit and `git show --name-only` = that one path, with `git status --porcelain` clean. The second half gives each refusal its own fixture, so no earlier refusal can be the reason for the next: ruling it again, a `chosen` outside `options`, no `chosen`, empty words, and a record that is not there each return an error and leave the record byte-identical, HEAD unmoved and the tree clean. `organizer rule --help` prints the usage and exits 0 (re-run in the worktree).
  - **G9** re-run in the worktree: `cd .wt/redesign-rule-record && XDG_DATA_HOME=$(mktemp -d) make test` → `go vet ./...` silent, every package `ok` or no test files (`ok organizer/internal/cli 23.007s`, `ok organizer/internal/service 17.746s`), exit 0, zero `FAIL` lines. `main`'s `TestAttachSessions` failure does not appear, as the temp `XDG_DATA_HOME` is set; that one is `retire-keeps-the-cell`'s. The golden clause does not apply: `internal/cli/testdata/status.golden` is not in the diff, so no refresh was needed and none was taken.
  - **G17** re-run: `git diff --name-only main...redesign-rule-record -- '*.css'` → empty.
  - **FR-13 clause by clause**, read off `internal/service/rule.go`: the four fields are set (`writeRuling`, `setFrontmatterKey` replacing in place and inserting before the closing `---` when the key is absent); the words go under `## Ruling` with where they were said, `<owner>, <date>, in the organizer on <machine>` (A4, and `ruled_by` is `d.Owner`, not an account); every other byte survives because the file is edited line by line and rewritten with its own `os.Stat` permissions, never re-serialised; one file is committed by `git add -- <name>` then `git commit -m … -- <name>`, pathspec-scoped so a dirty index elsewhere cannot ride along, shelling out to git as the spec's rabbit hole requires rather than pulling in a library. The three refusals are ordered before any write, and the two beyond FR-13 (no `owner`, directory not in a git repo) are preflights, so no refusal can leave a half-written record. `0019`'s consequence is honoured literally: no recommendation, no proposal, no other field.
  - **Boundary** clean: the 9 changed files are all named by the card — `internal/service/rule.go`, `internal/service/rule_test.go`, `internal/cli/rule.go`, `internal/cli/cli.go` (the `rule` entry in `Subcommands`, one dispatch case, one usage line), `app.go` (`RuleDecision` only, in the established nil-svc shape), the regenerated `frontend/wailsjs/go/main/App.{d.ts,js}`, `frontend/src/hooks/useWails.ts` (the one wrapper). `internal/model/model.go` is untouched, so the struct clause cannot bite. `CLAUDE.md` is the single Decisions bullet 0019 names — it sits at line 38 rather than 37 because the rebase onto main's new "Goal and stages" bullet pushed it down, which is a line number moving, not a boundary crossed. No real initiative's `working-on/`, no `agents/`, no `firestore.rules`, no `internal/sync`, no stylesheet, no card file, no new card status.
- Unmet gate items: none.
- Not in the gate, for whoever comes next:
  - **Nothing type-checks `useWails.ts`.** G9 is `make test`, which is `go vet ./... && go test ./...`; the only row that builds the frontend is G16, and that is wave 2's end-to-end. So wave 1 can ship a TypeScript line no gate compiles. Here the risk is small (one wrapper against the regenerated `App.d.ts`, and the worktree has no `node_modules` to check it with, per `progress.md`), but `cd frontend && npx tsc --noEmit` belongs in G9 the moment a wave-1 card touches `frontend/src` again.
  - **The two extra refusals are untested.** A record with no `owner` and a record outside a git repo both refuse in `RuleDecision`, and both are the right call, but `TestRuleDecisionRefusals` covers only FR-13's three plus "not there". G8 names no more, so this is not unmet; two fixtures would close the gap, and the git-repo preflight is the one most likely to rot silently.
  - **`organizer rule` is a live write with no dry run.** Every other verb that changes the world is dry by default (`retire` needs `--run`, `crew` and `run` have `--print`). `rule` commits on the first invocation, against a real record in a real repo, and a typo in `--words` is a commit to amend. `--print` showing the record diff before writing would cost one flag.
  - **`padNumber` is undocumented.** `organizer rule fix 19` rules `0019`. Reasonable, but the help text says `<NNNN>` and nothing mentions padding, and a non-digit or over-long number falls through to "has no decision <arg>" rather than saying the number is malformed.
  - **The commit is made with the repo's git identity, not the owner.** `ruled_by` is the record's `owner` by A4, but the committer is whoever runs the binary. On this machine they are the same person; the day they are not, the record will say `pablo` over someone else's commit. A `--author` from the owner, or a line in the trailer, would keep the two honest.
- Reviewer: `wave1-review-rule`, 2026-09-26.

## Next
1. review: redesign-rule-record, gate G8, G9, G17 met, f6f6c7b 80c5055 748bb9f 180e8eb

## Blockers
none

## Notes
- Two refusals FR-13 does not name are preflighted, so nothing is written half-way: a record with no `owner` (A4 signs the ruling with the owner, so there is nothing to sign with) and a record whose directory is not in a git repo (the commit could not happen). Phase notes, including the rebase conflict with main's new "Goal and stages" CLAUDE.md bullet, are in `.wt-notes/wave1-rule/progress.md`.
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- 2026-09-26 sup2 runs this card (organizer-probe-sup2), spawned by the FSE after 0023; seat wave1-rule, worktree .wt/redesign-rule-record, branch redesign-rule-record
