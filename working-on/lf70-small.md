---
title: "Rings whole in the wait line, one gap at the dot, the runs paragraph current"
status: now
repos: [organizer]
branch: lf70-small
seat: l70-build
reviewer: l70-rev, l70-ui
review: "pass: V1 V2 D1 X0 met (l70-rev, 2026-11-02, fed7495); AR32 U10 for l70-ui"
stage:
updated: 2026-11-02
next: "PR with talos-lab"
depends_on: []
boundary: ["frontend/src/styles/runreport.css", "frontend/src/components/UsageTable.tsx", "frontend/src/styles/usage.css", "frontend/src/components/Usage.rejected.test.tsx", "frontend/src/components/RunReport.test.tsx", "CLAUDE.md"]
spec: "docs/specs/leftovers-70.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-70.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No ring cut in the run report, the Usage title evenly spaced, CLAUDE.md true about runs.

## Gate
docs/specs/leftovers-70.md, rows V1, V2, D1, AR32, U10 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); UI rows in the review build.
- Design: Aglaea's 5a333ac; anything else to the FSE.
- Short-sample fallback: the existing run-report and Usage fixtures; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-02 l70-build: FR-1 9b33504, FR-2 b546e67, FR-3 fed7495 on lf70-small, rebased on origin/main 440d577; V1 and V2 fail on 440d577 and pass on the branch, D1 holds, X0 passes in a clean clone. U10 measured in the review build (4 px before the dot, 5 after). AR32 not painted: the review window was not key, so no ring showed; it needs the reviewer to make the window key. Steps in `.wt-notes/l70-build/progress.md`.

## Declared changes
- modified `frontend/src/styles/runreport.css`: `.rt-waitline button:focus-visible, .rt-waitline a:focus-visible` draw the ring at `outline-offset: -2px`, since the line is `overflow: hidden` (FR-1, AR32)
- modified `frontend/src/components/UsageTable.tsx:UsageRejected`: title phrase and count wrapped in one `<span>`, so `.sec-title`'s flex gap no longer replaces the space after the dot (FR-2, U10)
- modified `frontend/src/components/RunReport.test.tsx`: V1
- modified `frontend/src/components/Usage.rejected.test.tsx`: V2
- modified `CLAUDE.md`: Runs baseline paragraph names `MatchRun`'s seat match, the reviewer and supervisor attribution and `task NNNN` (FR-3)
Risky:
- `.rt-waitline` controls: top and bottom of the inset ring fit only while the line box grows to the 24 px button; a fixed height on the line would cut them
Not changed, on purpose:
- `frontend/src/styles/usage.css`: the cause was markup, not a usage rule
- `frontend/src/styles/shell.css` `.sec-title`: out of boundary; `Home.tsx:79`, `:357` and `Overview.tsx:145` share the flex-gap cause (progress.md, Found, not asked)

## Review
- Verdict: **pass** on the code gate. Unmet rows: none. AR32 and U10 are l70-ui's.
- Reviewer l70-rev, 2026-11-02, commit fed7495 (lf70-small rebased on origin/main 440d577), fresh clone of origin plus the local branch.
- change-check `organizer lf70-small --base origin/main`: 5 files, 0 flags (outside boundary 0, undeclared 0, declared not changed 0). `usage.css` is in the boundary and declared not changed; the diff agrees.
- V1, V2: `npx vitest run src/components/RunReport.test.tsx src/components/Usage.rejected.test.tsx -t "leftovers-70"`: 2 passed on fed7495; both fail on a clone at 440d577 with the tests copied in (V1: no `.rt-waitline …:focus-visible` rule; V2: title is a bare text node plus the count span, two flex items).
- Extra cases (temp test, deleted): Waits over a record, a slug and plain words renders only `<button class="rr-card">` as focusables in `.rt-waitline`; `+N` (`.rt-more`) is a span with no tabindex, so it takes no ring. The new rule (0,2,1) outranks global `:focus-visible` (0,1,0); no other rule names `.rt-waitline` or `.rr-card` with focus, and `.rr-card` in `.rr-cards` is outside the selector, so rings elsewhere are unchanged. `UsageRejected` with one row: `<span>Not accepted · <span class="num sec-count">1</span></span>`. `.sec-title`'s uppercase and letter-spacing inherit into the span; `.sec-count` is a descendant class rule (shell.css:39), so the count keeps mono, `--fg`, no tracking.
- D1: `grep` finds both on CLAUDE.md:56, the Runs baseline paragraph, the only changed line (1+, 1-). True to the code: `MatchRun` (runs.go:265) falls back to the one card of the cwd's initiative whose `seat:` is the part after `-probe-`; `withAttribution` (run.go:481) names only runs MatchRun left cardless (`cardless`), reviewers by `reviewer:` (attribute.go:258), supervisors by the record's `supervisor:`, labelled `task NNNN` by `Attribution.Label` (ledger.go:75).
- X0: pnpm install --frozen-lockfile ok; `make test` exit 0 (19 Go packages ok, vitest 1689 passed), test-lease **fresh** run `2f0b1ed1-57727`; `wails build` 0; `make review-build` 0; `git status --porcelain` empty (wailsjs/runtime unchanged). Logs in `.wt-notes/l70-rev/`.
- Note (goes to the FSE, next leftovers): the same flex-gap spacing sits in `Home.tsx:79`, `Home.tsx:357` and `Overview.tsx:145` (builder's Found, not asked); not proved here, outside this boundary.

## UI review
- Verdict: **pass**. Reviewer l70-ui, 2026-11-02, commit fed7495 (detached worktree, `make review-build`, auth off). AR32 met, U10 met. Rows unmet: none. Sev 4/3: none.
- Shared test run: **reused** `2f0b1ed1-57727` of fed74951f3a8 (l70-rev's, exit 0).
- Environment: `testdata/fixture-report/launch.sh … rr --rejected --resize 1024x640@2` as the builder's recipe; `ORGANIZER_CONFIG` and `XDG_DATA_HOME` both under `/private/tmp/organizer-fixture.izp5RI`; review app pid 95501, stopped by that pid; screen not locked. Shots and logs in `.wt-notes/l70-ui/`.
- **U10 met, review build on screen.** Usage, `NOT ACCEPTED · 2`. AX: phrase `NOT ACCEPTED · ` @1024 99 wide, count `2` @1122, so no flex gap after the phrase's space. Ink on the 1x window shot: 4 px before the `·`, 5 px after (the extra px is the mono `2`'s side bearing) (`u10-measure.txt`). Shots `shots/1024x640-U10-rejected.png`, `shots/1024x640-U10-zoom.png`. No proper name uppercased: `discuss-record` sits in the line under the title.
- **AR32 met, offscreen.** Why offscreen: the task asks for a keyboard Tab into the line, and I may not send keys or make the review window key on Pablo's screen. How: the earlier reviewers' harness (`rp-ui/tabharness.swift`, copied to `.wt-notes/l70-ui/off/`): a window that is never shown, claims key only to its own WKWebView, and gets keys only through `sendEvent`. It loads the branch's built `frontend/dist` from 127.0.0.1, with the bindings mocked from the fixture's real outputs (`off/bindings.json`, dumped by a test given through `go test -overlay`, so nothing was written into the worktree). Viewport 1024x608 (the review window's web area). Steps: rail expanded, `fixture`, Last run · 20 Oct, focus on `1 track done · Show`, one Tab. Focus lands on `0002`, the first control of `.rt-waitline`, with `:focus-visible` true and `outline: 2px solid #c0abfe` at offset −2px. The line's clip is flush with the button on the left, top and bottom (both 349.8–378.6 × 350–374): the worst case. At 2x the ring is 951 px, all inside the clip, four sides whole, corners rounded (`off/ar32-branch-ring.txt`). Shots `shots/1024x640-AR32-offscreen-tab-branch@2x.png`, `-zoom.png`. **The cut it fixes:** same steps on origin/main 440d577's dist give offset 2px, and the ring leaves the clip. Only the right arc is drawn; the left, top and bottom are cut (`off/ar32-main-ring.txt`, `shots/1024x640-AR32-offscreen-tab-main440d577@2x.png`, `-zoom.png`). On screen in the review build, an AX focus on `0002` also painted the ring inside its 30x24 box, four sides whole (`shots/1024x640-AR32-onscreen-axfocus.png`, `-zoom.png`). The keyboard proof stays the offscreen one.
- Finding R1 (sev 2, not a fail).
  - What the person cannot do: read the waits-on slug cleanly while it is focused. The inset ring sits on the first and last glyphs.
  - Where: Overview › Last run › a track's `waits on 0002` (`shots/1024x640-AR32-offscreen-tab-branch-zoom.png`).
  - Evidence: `.rr-card` has `padding: var(--space-1) 0`, so no side padding. At 2x the ring takes columns 700–703 and 754–757, and the glyph ink spans 701–754: about 1.5 CSS px of the first `0` and 0.5 px of the `2` sit under the ring (`off/ar32-glyph-overlap.txt`). The slug still reads.
  - Severity: 2.
  - Proposal: `padding-inline: var(--space-1)` on `.rt-waitline .rr-card`, the same as design-system's rule for inset rings on scroll regions ("pads its content at least 4 px so the ring never covers text", design-system.md:536). The `+N` fit then measures 8 px wider per control.
- Tokens: the diff adds only a selector with `outline-offset: -2px` (the value design-system names for inset rings) and one `<span>`. No raw colour, no new token.
- Spec gaps (for the FSE): FR-1 says "inset" but says nothing about the 4 px pad the design system asks for under an inset ring, so R1 is not covered. The same flex-gap cause in `Home.tsx:79`, `:357` and `Overview.tsx:145` (builder's Found, not asked) was not checked here.
- For aglaea: Q1, does design-system.md:536's 4 px pad under an inset ring apply to every inset ring (controls in a clipped one-line cell), not only to scroll regions? Q2, should an inset ring keep "a focus ring adds 2 to the element's radius" (line 131), or follow the element's own radius?
- Not verified: AR32 by a real keyboard on the review window (not allowed: no keys or activation on Pablo's screen; done offscreen instead). Both rows only at 1024x640, the width the gate names. The fixture's stand-in agents (8 pids) were refused by safe-kill as not this session's children; they exit by themselves within 6 h.

## Notes
- AR32 on screen needs the review window key; an AX focus on an inactive window paints no ring in WKWebView.
