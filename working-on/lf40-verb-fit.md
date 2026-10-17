---
title: "The verb column fits 'Rule · draft', and the map entry is one accessible name"
status: now
repos: [organizer]
branch: lf40-verb-fit
seat: vf-build
stage: decisions-owned-and-used
updated: 2026-10-17
next: "review: lf40-verb-fit, gate met (V1, V2, X0), 608880e"
risk: low
footprint: [frontend/src/styles/shell.css (verb cell), frontend/src/components/SpecReader.tsx (map entry), their tests]
depends_on: [lf38-owner-once]
boundary: ["docs/specs/leftovers-40.md Boundary, lf40-verb-fit"]
spec: "docs/specs/leftovers-40.md (FR-1, FR-2; needs-me-waits A3, diagrams-in-app A4)"
gate: "docs/specs/leftovers-40.md Acceptance, rows V1, V2 and X0"
ui_review: true
review: pass
---

## Goal
Every age in Needs me lines up even when a ruling draft is kept, and VoiceOver reads the map entry cleanly (lf38's UI review U1, U2).

## Gate
docs/specs/leftovers-40.md, rows V1, V2 and X0.
- [x] V1: every `ib-age` left x equal within 0.5 px, at each width: 1024×640 822, 1440×900 1238, spread 0 with a kept draft on init-a 0002 (`Rule · draft` 86.22 px) and without; Rule, Open, Answer and Show rows in view. `/Users/pabloantipan/organizer/.wt-notes/vf-build/out/v1-1024x640.txt`, `/Users/pabloantipan/organizer/.wt-notes/vf-build/out/v1-1440x900.txt`
- [x] V2: the entry's accessible name is exactly `Change on the map, start here`; no `sr-only` span inside it. vitest `SpecReader.test.tsx` "leftovers-40 V2", 2 tests pass
- [x] X0: `XDG_DATA_HOME=$(mktemp -d) make test` rc 0 (71 files, 810 vitest), `pnpm run build` rc 0, `wails build` rc 0, `git status --porcelain` empty, clean clone of 608880e. `/Users/pabloantipan/organizer/.wt-notes/vf-build/out/x0-*.log`, `/Users/pabloantipan/organizer/.wt-notes/vf-build/out/x0-status.txt`

## Declared changes
- modified `frontend/src/styles/shell.css:.ib-row`: `--ib-verb-w` from 72px to `calc(5.5 * var(--font-size-sm) + 2 * var(--space-3) + 2px)` (92px), fits `Rule · draft` (FR-1)
- modified `frontend/src/components/SpecReader.tsx:Contents`: the map entry carries `aria-label="<heading>, start here"`, the `sr-only` span is gone (FR-2)
- modified `frontend/src/components/SpecReader.test.tsx`: lf38 O4 block replaced by leftovers-40 V2, asserting the exact name from aria-label and no sr-only span
Risky:
- `.ib-row`: the verb column is 20px wider, so every age moved 20px left and the subject column is 20px narrower at 1024
Not changed, on purpose:
- `lib/drafts`, `Home.tsx` rows: the label stays `Rule · draft`; only the floor moved (Boundary)
- wide Home (`rule-box.css`): it reads the same `--ib-verb-w`; not measured, V1 names 1024 and 1440

## Done
- 2026-10-17 vf-build: verb floor fits `Rule · draft`, map entry named by one aria-label; gate met on 18c9e4a, 608880e (branch `lf40-verb-fit`, unmerged, rebased on main)

## Review
Verdict: **pass**, rows V1, V2, X0 met on 608880e4ed909c90c137cb0c17cb30e1984090fd. Unmet: none.

- change-check (clean clone, `--base main --head 608880e…`):
```
change-check: working-on/lf40-verb-fit.md
risk: low
repo organizer: base 29aa20f62 (--base main) ... head 608880e4ed909c90c137cb0c17cb30e1984090fd 608880e4e; 3 files

## Changed

- organizer/frontend/src/components/SpecReader.test.tsx (modified, test)
- organizer/frontend/src/components/SpecReader.tsx (modified): Contents
- organizer/frontend/src/styles/shell.css (modified)

## Tests touched

- organizer/frontend/src/components/SpecReader.test.tsx

## Risky (declared)

- `.ib-row`: the verb column is 20px wider, so every age moved 20px left and the subject column is 20px narrower at 1024

## Not changed, on purpose (declared)

- `lib/drafts`, `Home.tsx` rows: the label stays `Rule · draft`; only the floor moved (Boundary)
- wide Home (`rule-box.css`): it reads the same `--ib-verb-w`; not measured, V1 names 1024 and 1440

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| outside footprint | organizer/frontend/src/components/SpecReader.test.tsx |  | modified |
| undeclared | organizer/frontend/src/styles/shell.css |  | modified |
| declared, not changed |  | frontend/src/styles/shell.css:.ib-row | no matching change |

3 flags: outside boundary 0, outside footprint 1, undeclared 1, declared, not changed 1, new env var 0, new dependency 0, new host 0, risk 0, untested? 0, could not read 0, boundary unreadable 0
```
  The three flags are explained: SpecReader.test.tsx is "their tests" in the footprint (written as words, not a path); the shell.css `undeclared` and `.ib-row` `declared, not changed` are the same one change (`--ib-verb-w` on `.ib-row`, which change-check cannot match as a symbol in CSS). Diff is 3 files, all inside the Boundary; `lib/drafts` and `Home.tsx` untouched.
- V1: met. Own `wails dev -devserver localhost:34232` from the clean clone, fixture exported, `auth: off`, probe stub; Tab harness (`scripts/tab-harness/tabharness.swift` at the SHA) with vf-build's `steps/v1.txt` (keeps a draft on `decision:init-a/0002` through `lib/drafts` in the page, measures, discards, measures). 1024×640: every `ib-age` left x 822, spread 0, in all three states; 1440×900: 1238, spread 0; `Rule · draft` 86.22 px with the draft kept; 18 rows with Rule, Answer, Open, Agents, Launch and Show verbs. `.wt-notes/vf-review/out/v1-1024x640.txt`, `v1-1440x900.txt`.
- V2: met. Read the test against the row: the name comes from the one `aria-label="Change on the map, start here"` (asserted exactly, no space before the comma), no `sr-only` in the entry's content, ✎ `aria-hidden`, other entries carry no aria-label; source `SpecReader.tsx:357` agrees. `vitest run src/components/SpecReader.test.tsx -t leftovers-40`: 2 passed. `.wt-notes/vf-review/v2.txt`.
- X0: met. `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` rc 0 (Go ok, 71 files / 810 vitest), `pnpm run build` rc 0, `wails build` rc 0, `git status --porcelain` empty, clean clone of 608880e. `.wt-notes/vf-review/x0-*.log`, `x0-status.txt`.
- Shared test run: reused, run 29e31527-80277 of 608880e4ed90 by organizer-probe-vf-ui.
- Not in the gate, noted: wide Home (rule-box.css, button as grid item) was not measured by V1; the floor (92 px) would not fit a future `Answer · draft` (~99 px, the builder's note).

Reviewer vf-review, 2026-10-17, commit 608880e4ed909c90c137cb0c17cb30e1984090fd. `## UI review` not yet written: status and place left as they are.
