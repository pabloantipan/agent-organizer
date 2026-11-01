---
title: "The floating icon keeps its place on every desktop, and comes back after a display change"
status: now
repos: [organizer]
branch: lf60-icon-spaces
seat: l60-icon
reviewer: l60-icon-rev
stage:
updated: 2026-11-01
next: "talos-lab merges the PR (thread 01M6C28DQ9TS5YWJ00QKMEQENW; pass at d4d0e35); the FSE moves it to done/ on the merge sha. sup98 ended 2026-11-01"
review: pass
depends_on: []
boundary: ["docs/specs/leftovers-60.md Boundary"]
spec: "docs/specs/leftovers-60.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-60.md#Acceptance → gate"
ui_review: false
prs:
  - {repo: organizer, pr: 14, target: main, state: merged, merge: 70b21eb}
---

## Goal
The icon is on whichever desktop Pablo is on, however long Deltagos has run.

## Gate
docs/specs/leftovers-60.md, rows I1-I4 and X0.

## Declared changes
- modified `floaticon_darwin.m:orderInIfDropped`: also catches a panel not on the active desktop (or the .away stand-in); sets `kIconSpaces` again and orders front, once per read; read-back only logs (FR-1)
- added `floaticon_darwin.m:kIconSpaces`: the one collection behaviour, used by `build` and the recovery
- modified `floaticon_darwin.m:readBack`: logs on-the-active-desktop and the behaviour read back
- modified `floaticon_darwin.m:FloatIconStart`: the space-change re-read drops the `was` guard; the screen-parameters observer runs the recovery after `kScreenSettle` (1 s) (FR-2); `readAway` reads `<FLOAT_LOG>.away` on SIGUSR1 and SIGWINCH, inside `if (logFile)` (FR-3)
- modified `floaticon_darwin_test.go`: TestSpaceChangeReread and TestCheckHooksOnlyWithLog extended (I3, I4)
Risky:
- `orderInIfDropped`: without the `was` guard a re-read right after a show may order front once more; no loop, the read-back only logs
Not changed, on purpose:
- `floaticon_darwin.go`, `floaticon_darwin.h`: no hook needed a Go line
- no second screen observer: main already had one (the spec's premise was wrong); the read was added to it

## Done
- I1: met. `.wt-notes/l60-icon/i1.log`: `screens settled: not-on-the-active-desktop stand-in from the .away file (0 left)`, `screens settled: icon wanted, isVisible=1 but not on the active desktop: collection behaviour set again, ordered front`, `icon read back: isVisible=1 on screen=1 ... behaviour 0x251 (all desktops 1)`.
- I2: met. Same log after SIGINFO then SIGUSR1: `screens settled: icon wanted, isVisible=1 but off screen (occlusion 8192): collection behaviour set again, ordered front again`, then read back on screen=1. Desktop-change path also shown in `w.log` (FLOAT_COMPACT, SIGWINCH).
- I3: met. TestSpaceChangeReread passes; 7 new assertions fail over origin/main's source (`.wt-notes/l60-icon/tests-on-main.txt`).
- I4: met. TestCheckHooksOnlyWithLog passes with `awayStandIn = `, `%s.away"`, `readAway(` inside the logFile branch; 2 fail on main.
- X0: met. make test (go 19 ok, vitest 1297), wails build, make review-build exit 0; `git status --porcelain` empty (`x0-*.txt`).

## Notes
- Spec premise "nothing listens for a display change" was wrong; the read went into the existing observer.
- I1/I2 trigger the read with SIGUSR1: with FLOAT_SHOW_ICON alone a SIGWINCH hides the icon (state home), so the desktop-change path needs FLOAT_COMPACT.

## Review

**Verdict: pass** at d4d0e35 (base 21b5d5d), clean clone `.wt-notes/l60-icon-rev/clean` (removed after). Unmet gate items: none.

change-check (`.wt-notes/l60-icon-rev/change-check.txt`):

```
| outside boundary | organizer/floaticon_darwin.m |  | modified |
| undeclared | organizer/floaticon_darwin.m | readBack | modified |
| undeclared | organizer/floaticon_darwin.m | orderInIfDropped | modified |
| undeclared | organizer/floaticon_darwin.m | build | modified |
| undeclared | organizer/floaticon_darwin.m | FloatIconStart | modified |
| untested? | organizer/floaticon_darwin.m | FloatIconStart | no test file names it |
| declared, not changed |  | floaticon_darwin.m:orderInIfDropped | no matching change |
| declared, not changed |  | floaticon_darwin.m:kIconSpaces | no matching change |
| declared, not changed |  | floaticon_darwin.m:readBack | no matching change |
| declared, not changed |  | floaticon_darwin.m:FloatIconStart | no matching change |
```

- outside boundary: the card's boundary is `docs/specs/leftovers-60.md Boundary`, a file not in the branch (spec is on main, 3ef5dff); that Boundary names `floaticon_darwin.m`, so the file is inside it. Explained.
- the 4 undeclared and 4 "declared, not changed" are one set: the card declares `floaticon_darwin.m:<Symbol>`, change-check names `organizer/floaticon_darwin.m`; readBack, orderInIfDropped, FloatIconStart pair one to one, and `build` is the `setCollectionBehavior:kIconSpaces` line the kIconSpaces bullet describes. kIconSpaces is a `static const`, not a function, so change-check lists no symbol for it; the diff adds it (floaticon_darwin.m:83). Explained.
- untested? FloatIconStart: covered by TestSpaceChangeReread and TestCheckHooksOnlyWithLog, which match its source by regex without naming it. Explained.
- change-check read base 67d3e9f (local main); `git diff --stat 21b5d5d..67d3e9f -- floaticon_darwin.m floaticon_darwin_test.go` is empty, so same diff.

Evidence per row (logs in `.wt-notes/l60-icon-rev/`):
- I1 met. Review build pid 92527, fixture home, `FLOAT_SHOW_ICON=1`, `echo 1 > i1.log.away; kill -USR1` (second run, after startup settled), `i1.log`: `SIGUSR1: not-on-the-active-desktop stand-in for the next 1 read(s)` → `screens settled: not-on-the-active-desktop stand-in from the .away file (0 left)` → `screens settled: icon wanted, isVisible=1 but not on the active desktop: collection behaviour set again, ordered front` → `icon read back: isVisible=1 on screen=1 ... on the active desktop=1 behaviour 0x251 (all desktops 1)`. (First run, the startup space-change re-read consumed the stand-in: same three lines under `re-read:`, which also shows the desktop-change read without the `was` guard.)
- I2 met. Same pid, `kill -INFO`, 0.4 s, `kill -USR1`: `SIGINFO: the panel dropped at the window server: isVisible=1 on screen=0` → `screens settled: icon wanted, isVisible=1 but off screen (occlusion 8192): collection behaviour set again, ordered front again` → `icon read back: isVisible=1 on screen=1 ... (all desktops 1)`. Pid 92527 killed by saved pid, gone.
- I3 met. `go test -run 'TestSpaceChangeReread|TestCheckHooksOnlyWithLog' -v .` PASS on the branch (`i34-branch.txt`). Test file copied onto a 21b5d5d clone: TestSpaceChangeReread FAIL with 7 errors (re-read without `was`, `isOnActiveSpace`, `setCollectionBehavior:kIconSpaces` + orderFront, screen observer `after(kScreenSettle …) orderInIfDropped(@"screens settled")`, `if (was)` still present, setCollectionBehavior count 0) (`i34-main.txt`).
- I4 met. Same runs: PASS on branch; on main FAIL `no "awayStandIn = "`, `no "%s.away\""`. `readAway(`, `awayStandIn = `, `%s.away"` all checked inside the `if (logFile)` branch.
- X0 met. Clean clone: `XDG_DATA_HOME=$(mktemp -d) test-lease run -- make test` exit 0 (19 go packages ok, vitest 86 files / 1297 tests), `test-lease run -- wails build` exit 0, `test-lease run -- make review-build` exit 0, `git status --porcelain` empty (`x0-*.txt`).

FR-2 judged against the existing observer: the read was added to it after a 1 s settle, superseded by a later change (`screenChanges`). Met.

Findings, none blocking:
- Note: spec premise "nothing listens for a display change" is wrong on main; the spec has no amendment for it. Nowhere yet: `next` asks to file it.
- Note: with `FLOAT_SHOW_ICON` alone a SIGWINCH hides the icon (state home), so the desktop-change path is checked only with FLOAT_COMPACT; worth a line in the spec's check-hooks text. Nowhere yet.
- Note (gate does not cover): no row reproduces the real fault (window server holding the panel on one desktop); whether setting the behaviour again cures it is only Pablo's use after install, as the spec says.
- Note (tooling): change-check does not match `file:Symbol` declarations against repo-prefixed paths, so a correct declaration reads as 8 flags.

reviewer l60-icon-rev, 2026-11-01

Findings filed (sup98, 2026-11-01): the spec premise "nothing listens for a display change" and the FLOAT_SHOW_ICON + SIGWINCH hook quirk go to the FSE as a leftovers-60 amendment (sup98's closing post); the change-check `file:Symbol` mismatch goes to the FSE for hephaistos (same post); the real fault is Pablo's use after `make install`, as the spec says.
