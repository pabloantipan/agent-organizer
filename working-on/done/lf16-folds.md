---
title: "The strip's folds get glyphs; the floating list splits Asleep from Archived"
status: done
repos: [organizer]
branch: lf16-folds
seat: fo-build
stage: one-window
updated: 2026-10-10
next: "merge lf16-folds (79f3898) to main"
depends_on: []
boundary: ["Rail.tsx (strip fold buttons)", "FloatList.tsx", "lib/floatList.ts", "their css and tests", "not: lib/initiatives.ts"]
spec: "docs/specs/leftovers-16.md (FR-2, FR-3; docs/ux/specs/initiatives-view.md Amendment 1, I14-I15)"
gate: "docs/specs/leftovers-16.md Acceptance, rows F1, F2 and X0"
ui_review: true
review: pass
---

## Goal
initiatives-view A1 and lf15-initiatives-polish V3 (Aglaea, b3295f2).

## Gate
docs/specs/leftovers-16.md, rows F1, F2 and X0.

- [x] F1: `.wt-notes/fo-build/F1-F2-vitest.log`, `ax-strip.txt` (lines 40-41), `F1-strip-crop.png`
- [x] F2: `.wt-notes/fo-build/F1-F2-vitest.log` (`lib/floatList.test.ts`, `components/FloatList.test.tsx`; Amendment 1, 96cc356)
- [x] X0: `.wt-notes/fo-build/X0-make-test.log`, `X0-npm-build.log`, `X0-wails-build.log` (clean clone at 79f3898)

## Done
- 2026-10-10 fo-build: the strip draws a moon / box over each fold's count, named `Asleep, n initiatives`; the floating list has `Asleep (n)` (paused only) and `Archived (n)` (7c0e29b, 4a62e36 on lf16-folds)
- 2026-10-10 fo-build: F2 amended; `FloatFolds` render test added (79f3898), X0 rerun clean, gate met

## Notes
- The floating icon's panel is outside the app's AX windows; opening the list by AX needs a system-wide hit test plus AXPress, refused by this session's permission check (`.wt-notes/fo-build/progress.md`).
- One appearing for one: `Asleep, 1 initiative` (the spec writes `n initiatives`).

## Review
- Verdict: **pass**. Reviewer fo-review, 2026-10-10, on 79f3898 (branch lf16-folds), from a fresh clone at that SHA (removed after). Evidence in `.wt-notes/fo-review/`.
- F1 (FR-2): vitest `Rail.strip.test.tsx`, `folds.test.ts` (lucide-moon over the asleep count, lucide-archive over the archived count, 14 px, svg aria-hidden, names `Asleep, 3 initiatives` / `Archived, 1 initiative`; `F1-F2-vitest.log`, 29 pass). Review build (`make review-build`) on the fixture, launched by me with saved pid, rail collapsed by AXPress on `.strip-toggle`; AX tree of that pid (`ax-strip.txt` lines 39-40): `Asleep, 1 initiative` `.strip-fold.asleep`, `Archived, 1 initiative` `.strip-fold.archived`, below the ranks. Window shot `screencapture -o -l` (`F1-strip-crop.png`): a moon over 1, a box over 1, muted. Met; `1 initiative` is the singular of `n initiatives`.
- F2 (FR-3, Amendment 1): vitest of `lib/floatList.ts` over active, paused, archived and done initiatives (paused only in `asleep`, the rest in `archived`, none archived called asleep, Archived empty at zero) and `FloatList.test.tsx` rendering `FloatFolds`, the component `FloatList.tsx` mounts: `Asleep (2)`, `Archived (2)`; only `Asleep (1)` with no archived, only `Archived (1)` with no paused, nothing at zero. Met.
- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run -- make test` (Go ok, vitest 456 pass), `npm install && test-lease run -- npm run build`, `test-lease run -- wails build`, all exit 0 (`X0-*.log`). Met.
- Unmet rows: none.
- Outside the gate: the new `lib/folds.ts` is not named in the boundary (only imported by the boundary's files); the UI review was on 1543640, and 79f3898 since moved the folds' JSX into `FloatFolds` (covered by the render test, not seen on screen).

## UI review
- 2026-10-10 fo-ui, on 1543640 (all rows; sup53 said the branch moves for a FloatList.tsx render test only, not rechecked on the new head). Verdict: **pass**, no sev 4 or 3.
- F1 (FR-2), checked in WKWebView: `Deltagos Review` built from 1543640, own pid, fixture, rail collapsed by AXPress on `.strip-toggle`. AX: `Asleep, 1 initiative` and `Archived, 1 initiative`, `.strip-fold.asleep|archived`, 33x40, below the ranks after the separator (`.wt-notes/fo-ui/ax-strip.txt` lines 40-41). Shot `wk-1440x932-F1-strip(-crop).png`: a moon over 1, a box over 1, muted; glyph and count measure 5.1:1 on the strip, and 33x40 is over the 24 px target. vitest `Rail.strip.test.tsx`, `folds.test.ts`: 14 px, svg aria-hidden, hover = name then ids.
- F2 (FR-3), checked from code and vitest only (`vitest-F1-F2.log`, 25 pass): `floatList` sorts paused into `asleep` and every other inactive status into `archived` with the rail's `sleepyOf`. `FloatList.tsx` draws `Asleep (n)` and then `Archived (n)`, each only when it has rows, each closed by default, both open under a query, and keyboard order follows the open folds. No archived row is labelled asleep.
- Findings: none at sev 2 or above. U1 (sev 1, words): the strip says `Asleep, 1 initiative` and the spec says `n initiatives`; the singular is the right reading. Proposal: accept it in the spec.
- Spec gaps for the FSE: (1) singular vs plural, as above. (2) Whether each fold in the floating list opens on its own or both together; the build opens them separately. (3) Amended F2 asks for a render test of `FloatList.tsx`, and 1543640 has none (fo-build is adding it).
- For aglaea: none.
- Not verified in WKWebView: the floating list open (F2's screen). Pressing the icon runs `bringList` → `activateIgnoringOtherApps` (`floaticon_darwin.m:828`), which takes focus from Pablo's desktop (0108), so it was not pressed. Also not seen: the strip hover tooltip, which no screen shot can show without a pointer; the title text is covered by vitest.
