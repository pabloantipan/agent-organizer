---
title: The board carries the FSE's hand-off and recent commits
status: done
repos: [organizer]
branch: redesign-fse-activity
updated: 2026-09-26
next: "review: redesign-fse-activity, gate G7, G9, G17 met, 1a9a812 b210d35"
review: pass
seat: wave1-fse
depends_on: ["redesign-goal-stages"]
boundary: ["internal/model/model.go (BoardInitiative: fse activity; nothing else)", "internal/scan/fse.go (new)", "internal/scan/fse_test.go (new)", "internal/merge/ (carry it)", "testdata/home/init-a/docs/bitacora/"]
spec: "docs/specs/redesign.md (FR-11); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G7, G9, G17; the Gate section below"
---

## Goal
The redesign, wave 1 of 2: FR-11 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [x] G7: see `docs/specs/redesign.md`, Acceptance
- [x] G9: see `docs/specs/redesign.md`, Acceptance
- [x] G17: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE
- 2026-09-26 FR-11 built on `redesign-fse-activity` (1a9a812, b210d35): `internal/scan/fse.go` reads the HAND-OFF section of `docs/bitacora/fse_bitacora.md` and the last 10 commits with a `Committed-by: FSE` trailer (short sha, RFC 3339 time, subject) by shelling out to git, and `model.FSEActivity` rides the scan onto `BoardInitiative.fse` through `internal/merge`. Gate met:
  - G7 — `TestReadFSEHandOff`, `TestReadFSECommits` (`two commits`, `capped at ten`), `TestReadFSENoBitacora` and `TestFSECommitsIgnoreTheEnclosingRepo` in `internal/scan/fse_test.go`, `TestBuildCarriesFSEActivity` in `internal/merge/merge_test.go`; `cd /Users/pabloantipan/organizer/.wt/redesign-fse-activity && XDG_DATA_HOME=$(mktemp -d) go test ./internal/scan/ ./internal/merge/ -run FSE -count=1 -v` → `--- PASS: TestReadFSECommits (0.79s)` and `ok organizer/internal/scan 1.283s`, `ok organizer/internal/merge 0.474s`
  - G9 — `cd /Users/pabloantipan/organizer/.wt/redesign-fse-activity && XDG_DATA_HOME=$(mktemp -d) make test` after rebasing onto main → `go vet ./...` clean and every package `ok`, including `ok organizer/internal/scan 2.347s` and `ok organizer/internal/cli 4.805s`; no golden refresh needed
  - G17 — `git -C /Users/pabloantipan/organizer/.wt/redesign-fse-activity diff --name-only main...redesign-fse-activity -- '*.css'` → no output; the branch changes `internal/{scan,merge,model}` and one testdata file only

## Next
1. review: redesign-fse-activity, gate G7, G9, G17 met, 1a9a812 b210d35. Branch left unmerged, rebased onto main.

## Blockers
none

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- 2026-09-26 sup2 runs this card (organizer-probe-sup2), spawned by the FSE after 0023; seat wave1-fse, worktree .wt/redesign-fse-activity, branch redesign-fse-activity
- FR-11's third part, **the FSE's open threads, is not built**: threads come from the discuss API through `internal/service` (`AgentGroup.Threads`, `Service.openers`), which neither `internal/scan` nor `internal/merge` can reach, and `internal/service` is not in this card's boundary. The hand-off and the commits are delivered; the threads want a line in `redesign-overview` (FR-12 already reads threads there) or a card of their own.
- `BoardInitiative` lives in `internal/merge/merge.go`, not in `internal/model/model.go` as the boundary line says. `model.FSEActivity`/`model.FSECommit` are new types there and the field went on `ScannedInitiative` beside `Decisions` and `Cell`, which `merge` carries onto `BoardInitiative.fse` exactly as it carries `Decisions`; no other struct in `model.go` was touched.
- Git runs at the initiative root and only when the root is a repo itself. A root that merely sits inside one — `testdata/home/init-a` inside this repo — would otherwise report the enclosing repo's history as the FSE's (`TestFSECommitsIgnoreTheEnclosingRepo`). The initiative's listed repos are not searched: the FSE commits the bitácora, the specs and the records, and those live at the root.
- `--grep` only narrows the walk; the `%(trailers:key=Committed-by)` field decides, so a trailer quoted inside a commit body is not counted as a signature.
- Wave 2 will need a TypeScript `FSECommit`: Wails only emits a nested type that a binding reaches (the `App.MilestoneType` case), and `app.go` plus `frontend/wailsjs/` belong to other cards. `redesign-overview` needs a dummy binding field or the hand-written type.

## Review
- Verdict: pass. G7, G9 and G17 are all demonstrably met by `main...redesign-fse-activity` (1a9a812, b210d35).
- Unmet gate items: none.
  - G7 — `XDG_DATA_HOME=$(mktemp -d) go test ./internal/scan/ -run 'TestReadFSEHandOff|TestReadFSECommits|TestReadFSENoBitacora|TestFSECommitsIgnoreTheEnclosingRepo' -count=1 -v` → all PASS, and `./internal/merge/ -run TestBuildCarriesFSEActivity -v` → PASS. The row's first scenario is `TestReadFSECommits/two_commits` exactly: a temp root that is its own repo, the fixture bitácora, two `Committed-by: FSE` commits over two that are not (one with the trailer quoted in a body paragraph), and it asserts the hand-off heading, two commits, newest first by `At`, and no problems. `capped_at_ten` proves the cap of ten with twelve. The second scenario — no bitácora, empty, no problem — is `TestBuildCarriesFSEActivity`'s `bare` initiative (`FSE.Empty()` on the board) plus `TestReadFSENoBitacora` (no `HandOff`, no `Path`, no problems).
  - G9 — `cd /Users/pabloantipan/organizer/.wt/redesign-fse-activity && XDG_DATA_HOME=$(mktemp -d) make test` → `go vet ./...` clean and every package `ok` (`internal/scan 1.968s`, `internal/cli 5.571s`, `internal/service 6.107s`). `status.golden` is not in the diff, so there is no golden refresh to show.
  - G17 — `git diff --name-only main...redesign-fse-activity -- '*.css'` → empty. The diff is `internal/{scan,merge,model}` and one testdata file.
- Boundary: two deviations, both the minimum the wiring needs and both disclosed on the card and in `progress.md`; neither is rework.
  - `internal/scan/scan.go` is not in the boundary and carries one added line (`si.FSE = readFSE(root, opts)`). Without it nothing calls `fse.go`. No other wave 1 card holds that file now.
  - The boundary says `internal/model/model.go (BoardInitiative: fse activity; nothing else)`, but `BoardInitiative` is declared in `internal/merge/merge.go`. The branch adds `model.FSEActivity`, `FSECommit` and one `FSE` field on `ScannedInitiative` in `model.go`, and the `FSE` field plus its carry on `BoardInitiative` in `merge.go`. No other struct in `model.go` is widened. The boundary line was wrong, not the build.
- Not covered by the gate, for Pablo:
  - FR-11's third bullet, the FSE's open threads, is not built, and G7's check text never asks for it — so the gate passes on two thirds of the requirement. The builder's reason is right (threads live behind the discuss API in `internal/service`, outside this boundary). Either `redesign-overview` takes it or it needs a card; as it stands FR-11 has no owner for that bullet.
  - G7 reads "with no bitácora it is empty", and the build is narrower: no bitácora means no hand-off, but FSE-signed commits at the root are still reported (`TestReadFSENoBitacora` asserts exactly that). For the case FR-11 cares about — an initiative with no FSE — the activity is empty, so the intent holds; the literal clause does not. A defensible refinement, but it is a behaviour the spec does not state.
  - `readFSE` adds one `git log` per initiative per scan whenever `opts.Git` is on. Bounded by `GitTimeout` and cheap, but the scan's git cost per initiative grew and no gate row watches it.
  - `handOff` takes the first `##`-level HAND-OFF section. If a future bitácora ever keeps a history of them newest-last, the board would show the oldest. Nothing in the fse skill fixes the order; worth a line in the skill rather than code here.
- Reviewer: wave1-review-fse
- Date: 2026-09-26
