---
title: Ruling from Needs me writes the record, end to end
status: blocked
repos: [organizer]
branch: main
updated: 2026-09-26
seat: wave2-rulebox
next: "pablo: grant iTerm2 Screen Recording and Accessibility (System Settings, Privacy), or run the G16 built-app walk yourself; then G16-1…6 from the built app and review: redesign-rule-box (G15, G18 met; 224d4b4 b0f2d13)"
depends_on: ["redesign-overview", "redesign-work", "redesign-roadmap"]
boundary: ["frontend/src/components/RuleDecisionBox.tsx (new)", "frontend/src/components/Home.tsx (the decision row's Rule action)", "frontend/src/styles/rule-box.css (new)"]
spec: "docs/specs/redesign.md (FR-23, FR-22); visual: docs/specs/redesign-mockups.html; values: docs/design-system.md"
gate: "docs/specs/redesign.md Acceptance, rows G15, G16, G18; the Gate section below"
---

## Goal
The redesign, wave 2 of 2: FR-22 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [x] G15: see `docs/specs/redesign.md`, Acceptance
- [ ] G16: see `docs/specs/redesign.md`, Acceptance
- [x] G18: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE
- 2026-09-26 wave2-rulebox: the rule box (224d4b4 `RuleDecisionBox.tsx`, `rule-box.css`; b0f2d13 Home's Rule opens it). G15 met in `wails dev` on the fixture: `.wt-notes/wave2-rulebox/G15-box.png` (0002, one-machine, words), `G15-after.png` (0002 gone, badge 3 → 2); `git -C $FIXTURE_HOME/init-a log -1 --stat` → `docs(decisions): rule 0002 where-the-fixture-runs (one-machine)`, `1 file changed, 6 insertions(+), 4 deletions(-)`; `git show` touches only status, ruled, ruled_by, chosen and the Ruling line (`git-show-dev.txt`). Rule is disabled until option and words; a refusal shows in the box with both kept (`rb-refused.png`). G18: the grep over `main...redesign-rule-box` prints nothing; `npm run build` ✓. G16 partly: walk Home → init-a → Overview → Work → Roadmap → rule 0002 done in `wails dev` (`dev-1-home` … `dev-5-roadmap.png`, then G15-*); console: one error only, the Wails runtime's (Notes); `wails build` ✓, the built app ran on the fixture and was quit by pid, but G16-1…6 could not be taken from it (Blockers)

## Next
1. Pablo grants iTerm2 Screen Recording and Accessibility, or runs the built-app walk himself: `wails build`, run the app on `eval "$(scripts/fixture-home.sh)"`, Home → init-a → Overview → Work → Roadmap → rule 0002, `G16-1-home.png` … `G16-6-ruled.png`
2. Then review: redesign-rule-box, gate G15, G16, G18

## Blockers
- G16's built-app walk: this session has no macOS Accessibility (`osascript is not allowed assistive access (-1719)`, so no click in the native window) and no Screen Recording (`screencapture -x -l <window>` → "could not create image from window", `-R` → "could not create image from rect"). Only Pablo can grant either

## Notes
- 2026-09-26 wave2-rulebox: the console error is Wails' runtime, not `frontend/src`. `Cannot read properties of null (reading 'nodes')`, frames `Fe`, `bn`, `new In` all in `/wails/ipc.js`, which is byte-identical (sha256 3c3b999d…) to wails v2.15.0's `internal/frontend/runtime/ipc_websocket.js`; `In` is its Svelte dev overlay mounted on DOMContentLoaded at `#wails-spinner`. It reproduces on a page holding only `ipc.js`, `runtime.js` and that div, no app code, so main has it too (`.wt-notes/wave2-rulebox/ipc-blank.log`). No 404 appeared in these runs. It is a `wails dev` page only; the built app does not serve `ipc_websocket.js`
- 2026-09-26 wave2-rulebox: `global.css:39` `input:focus, textarea:focus { outline: none }` outranks `:focus-visible`, so every input and textarea loses the ring FR-23 keeps; `rule-box.css` restores it for the box only. CLAUDE.md's Navigation bullet ("Rule opens the record in the initiative's Decisions for now") is stale after this card and outside its boundary
- 2026-09-27 sup3: three builders saw one console error on every browser load of `wails dev`, before any view mounts: `Cannot read properties of null (reading 'nodes')` in `/wails/ipc.js`, plus a 404. G16 says "no console errors": report every error seen with its source, and do not count as met an error you cannot trace to Wails' runtime rather than `frontend/src`; if it is the runtime, say so with the evidence and let the review judge the gate
- 2026-09-27 sup3: the gate screenshots run against `eval "$(scripts/fixture-home.sh)"` (1993e12): a temp copy of `testdata/home` with `testdata/fixture-overlay` laid over it: init-a a git repo with two FSE-signed commits, proposed records 0002 (the fixture record G15/G16 rule) and 0003 raised by the FSE and owned by pablo, the current stage gated on 0002, three cards seated `wave1-*`, and a cell `organizer-fixture` whose `fse` seat has one question thread open to pablo in the mailbox. `testdata/home` and `status.golden` are unchanged
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- 2026-09-27 sup3 runs this card (organizer-probe-sup3), spawned by the FSE after wave 1 passed
