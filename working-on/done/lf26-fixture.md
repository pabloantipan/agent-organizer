---
title: "The fixture draws a ruling and a low group"
status: done
repos: [organizer]
branch: lf26-fixture
seat: fx-build
stage: one-window
updated: 2026-10-14
next: "review: lf26-fixture, gate met (F1, F2, X0), 5b87b66"
depends_on: []
boundary: ["docs/specs/leftovers-26.md Boundary, lf26-fixture"]
spec: "docs/specs/leftovers-26.md (FR-11, FR-12; leftovers-25 Amendment 1)"
gate: "docs/specs/leftovers-26.md Acceptance, rows F1, F2 and X0"
ui_review: false
review: pass
---

## Goal
The fixture draws a ruling and a low group (Aglaea, 70a43e9, from sup61's close).

## Gate
docs/specs/leftovers-26.md, rows F1, F2 and X0.

- [x] F1 (11): one decision thread after two runs, F5 `Open the thread …` in Solved — .wt-notes/fx-build/f1-after-run1.jsonl, f1-after-run2.jsonl, f1-ax.txt
- [x] F2 (12, Amendment 2): review build, `--groups`, 1024x640, rail at its end: ccint menu 449-537 above its ⋯ 539-563, inside the window — .wt-notes/fx-build/f2-review-ax.txt, f2-review.png
- [x] X0 (all): clean clone of 5b87b66, make test, pnpm run build, wails build pass, status empty — .wt-notes/fx-build/x0-rc.txt, x0-status.txt

## Done
- 2026-10-14 fx-build: the fixture leaves one solved thread with pablo's ruling (b48ccc3) and `--groups` lays a home whose last group ends the rail (5b87b66); F1, F2, X0 met, rebased on main.

## Notes
- F2 (FR-12): Asleep (43 px) and Archived (43 px), laid from testdata/fixture-sleep, always trail the last group, so at 1024x640 with the rail scrolled to its end the lowest group's ⋯ keeps 179 px below it against an 88 px menu; more initiatives or groups above cannot change that. Asked sup62 (options: a --groups fixture without fixture-sleep, amend F2 as leftovers-25 Amendment 1 did R3, or widen the boundary). Geometry: .wt-notes/fx-build/f2-main-geometry.jsonl.
- The mailbox already held a decision (w-queued thread, pablo, 2026-10-05) whose body was a reviewer's pasted JS; the script posts the fixture's ruling into that thread, so it stays one thread.

## Review
Verdict: pass. Unmet rows: none.

- F1 (FR-11): `count-decisions.py` (read only) before, then `scripts/fixture-home.sh` twice from the clean clone: one open organizer-fixture thread holding a decision each time (w-queued, latest decision pablo's fixture words), the thread list identical before, after run 1 and after run 2 (nothing posted); `state.json` marks `thread:01M3G7D8…` solved. The screen was locked (`CGSSessionScreenIsLocked` = 1), so AX on the review build returned no window; the ruling row was read in the offscreen harness against my `wails dev` (:34125) on that fixture: init-a → Conversations → needs me → Solved 1 shows one `button type=button` named `Open the thread w-queued: which repo does the queued card start in`, `aria-describedby` "pablo ruled 13 Oct 15:59: It starts in repo-one; … · next fse sets w-queued's next to start in repo-one". .wt-notes/fx-review/f1-*.jsonl, f1-harness.jsonl
- F2 (FR-12, Amendment 2): `fixture-home.sh --groups`, harness at 1024×640, Group by client: groups acme, personal, ccint, no Asleep or Archived fold, init-blind the last row; rail scrolled to its end (538/538), Return on `Actions for ccint`: menu `.up` at 449–537 above the ⋯ 539–563, 77 px below against an 88 px menu, inside the window. AX/screenshot of the review build not possible (locked screen); computed geometry in the WKWebView instead. .wt-notes/fx-review/f2-harness.jsonl
- X0: fresh clone at 5b87b66, `pnpm install --frozen-lockfile`, `XDG_DATA_HOME=$(mktemp -d) make test` (go ok, 51 files / 603 vitest), `pnpm run build`, `wails build`, all exit 0 under test-lease; `git status --porcelain` empty. .wt-notes/fx-review/x0-*
- Diff stays inside the boundary (`scripts/fixture-home.sh`, `testdata/fixture-overlay/README.md`).
- Gate note: F2's table row still says "no scroll"; Amendment 2 (scrolled to the end) was applied as the row on main now reads with it.

Reviewer: fx-review, 2026-10-14, commit 5b87b6623c3acab59d34b53839743f48feda98f3.
