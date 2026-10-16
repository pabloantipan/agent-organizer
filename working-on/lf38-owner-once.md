---
title: "Needs me says an others' owner once, and the age column keeps one x"
status: now
repos: [organizer]
branch: lf38-owner-once
seat: oo-build
stage: decisions-owned-and-used
updated: 2026-10-16
next: "review: lf38-owner-once, gate met (O1-O6, X0), 1b13701"
risk: low
footprint: [frontend/src/components/Home.tsx (decisionContext, the others' row), frontend/src/styles/shell.css (.ib-row verb column, .lz.waiting.dashed), frontend/src/components/SpecReader.tsx (Contents entry name), frontend/src/lib/diagram.ts (classLine), frontend/src/components/DiagramFigure.tsx, their tests]
depends_on: []
boundary: ["docs/specs/leftovers-38.md Boundary, lf38-owner-once"]
spec: "docs/specs/leftovers-38.md (FR-1 to FR-3; needs-me-waits Amendment 2, W11, W12)"
gate: "docs/specs/leftovers-38.md Acceptance, rows O1 to O6 and X0"
ui_review: true
---

## Goal
An others' row names its owner once, and the age column lines up across every row of Needs me and Waiting on others (needs-me-waits Amendment 2).

## Gate
docs/specs/leftovers-38.md, rows O1 to O6 and X0.
- [x] O1: /Users/pabloantipan/organizer/.wt-notes/oo-build/out/o1-o4-o5-o6-vitest.log (Home.waits.test.tsx, "O1: …")
- [x] O2: /Users/pabloantipan/organizer/.wt-notes/oo-build/out/o2-1024x640.txt, /Users/pabloantipan/organizer/.wt-notes/oo-build/out/o2-1440x900.txt (18 rows in both groups, Rule, Open, Answer in view; spread 0)
- [x] O3: /Users/pabloantipan/organizer/.wt-notes/oo-build/out/o3-grep.txt (nothing, rc=1)
- [x] O4: /Users/pabloantipan/organizer/.wt-notes/oo-build/out/o1-o4-o5-o6-vitest.log (SpecReader.test.tsx, "leftovers-38 O4")
- [x] O5: /Users/pabloantipan/organizer/.wt-notes/oo-build/out/o1-o4-o5-o6-vitest.log (diagram.test.ts, "leftovers-38 O5")
- [x] O6: /Users/pabloantipan/organizer/.wt-notes/oo-build/out/ax-o6.txt, /Users/pabloantipan/organizer/.wt-notes/oo-build/out/o6-ax-excerpt.txt (review build pid, init-a 0012: one AXImage with the alt, no children, the text line after it)
- [x] X0: /Users/pabloantipan/organizer/.wt-notes/oo-build/out/x0-make-test.log, out/x0-pnpm-build.log, out/x0-wails-build.log, out/x0-status.txt (0 bytes), clean clone at 1b13701

## Done
- 2026-10-16 oo-build: FR-1 to FR-6 on lf38-owner-once (52ac8af, 0f141dd, 51ae654, ca257c2, 1b13701), rebased on main; gate met; how to reproduce in /Users/pabloantipan/organizer/.wt-notes/oo-build/progress.md.

## Notes
- A kept draft's `Rule · draft` is wider than the verb column's 72 px floor, so that one row still moves its own age column (the spec lists five verbs).
- The review window's screencapture came back blank; O6 rests on the AX tree.

## Declared changes
- modified `frontend/src/components/Home.tsx:decisionContext`: takes `withOwner`; the others' row passes false (FR-1)
- modified `frontend/src/components/Home.tsx:OthersRow`: context line without the owner (FR-1)
- modified `frontend/src/styles/shell.css`: verb track `minmax(var(--ib-verb-w), auto)`, 72 px, button right-aligned; `.lz.waiting.dashed` deleted (FR-2, FR-3)
- added `frontend/src/components/SpecReader.tsx:Contents`: the Contents list as a component, map entry with a screen-reader-only `, start here` (FR-4)
- modified `frontend/src/components/SpecReader.tsx:SpecReader`: renders `Contents` (FR-4)
- added `frontend/src/lib/diagram.ts:nodeLabels`: node labels by id, glyphs and markup stripped (FR-5)
- added `frontend/src/lib/diagram.ts:classIds`: shared class-line parse
- modified `frontend/src/lib/diagram.ts:changeClasses`: same contract, through classIds
- modified `frontend/src/lib/diagram.ts:classLine`: labels and `Around it` (FR-5)
- added `frontend/src/components/DiagramFigure.tsx:silentSvg`: SVG root aria-hidden, own role and aria names dropped (FR-6)
- modified `frontend/src/components/DiagramFigure.tsx:DiagramView`: image source through silentSvg (FR-6)
- modified `frontend/src/components/Home.waits.test.tsx`: O1
- modified `frontend/src/components/SpecReader.test.tsx`: O4
- modified `frontend/src/lib/diagram.test.ts`: O5, line now with `Around it`
- modified `frontend/src/components/DiagramFigure.test.tsx`: O6, new line and src
Risky:
- `nodeLabels`: a mermaid shape the regex does not know falls back to the id, never a wrong label for an edge
Not changed, on purpose:
- `frontend/src/styles/diagram.css`: outside the boundary; no wrapper around the img, so `.diagram-frame > img` still applies
- `frontend/src/lib/decisions.ts:ownerPhrase`: boundary

## UI review
oo-ui, 2026-10-16, every row checked on 1b13701 (detached clone, fixture plus overlay, auth off). Verdict: **pass**. No sev 4 or 3.

Rows:
- O1 met. The vitest test (`Home.waits.test.tsx`, "O1") matches the row: the others' context is `raised 20 Sep` with no `owner `, and the lead's rows are unchanged. Live, the two Waiting on others rows read `raised 27 Sep by fse · …` and `raised 1 Oct by fse · …`, with the owner only in the subject.
- O2 met. My own steps (`.wt-notes/oo-ui/steps/o2.txt`, every `.home .ib-row`, grouped by heading) ran in the Tab harness against my own `wails dev` on :34233. 1024×640 (compact): 18 rows (16 Needs me, 2 others), verbs Rule, Answer, Open, Agents, Launch, Show; ages at 842, spread 0. 1440×900 (regular): ages at 1258, spread 0. Output: `out/o2-1024x640.txt`, `out/o2-1440x900.txt`. Shots: `wkwebview-1024x640-O2-others-and-needs-me.png`, `wkwebview-1440x900-…`.
- O3 met: the grep prints nothing (rc=1). The diff stays inside the Boundary: no queue.ts, ownerPhrase, Go, store or testdata.
- O4 met. The vitest test (`SpecReader.test.tsx`, "leftovers-38 O4") matches the row. In the review build's AX tree, the entry opened from w-wide's spec link has the title `Change on the map , start here`, with no ✎ (see U2).
- O5 met. The vitest test (`diagram.test.ts`, "leftovers-38 O5") matches the row: `Added: Payments. Changed: BFF. Removed: none. Around it: PWA, cache.`, with no glyph and the id for the unlabelled node.
- O6 met. Review build, AX tree by its pid, init-a 0012: `AXImage d="Change on the map, diagram"` with no children, then Source, then `Added: Payments. Changed: BFF. Removed: Legacy pay. Around it: PWA, Datastore.` The second figure is also a childless AXImage.
- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` ran **fresh**, run `64ef681a-69867`, rc 0, 71 files and 810 vitest tests passed. The code reviewer reused it.

Findings:
- U1 (sev 2). What the lead cannot do: scan ages in one line while a ruling draft is kept. Where: Home, Needs me, a Rule row whose verb reads `Rule · draft`. Evidence: with a draft kept on init-a/0002, that row's age sits at 827.78 against 842 for every other row (1024), and 1243.78 against 1258 (1440); the button is 86.22 px against the 72 px floor (`out/o2-*.txt`, "kept draft"). Severity 2: one row, 14 px, and a verb the spec does not list (FR-2 names five). Proposal: set the floor at the widest label a row can show, `Rule · draft`, or mark the draft another way (for aglaea, Q1).
- U2 (sev 1). What a VoiceOver user cannot do: nothing audible. Where: the spec reader, the Contents entry for the map. Evidence: WebKit's AX title is `Change on the map , start here`, with a space before the comma, because the `sr-only` span is absolutely positioned and joins as its own run. The vitest name is exact. Severity 1: the comma's pause is spoken the same. Proposal: none needed; if wanted, put the suffix inside the text node (`aria-label` on the button).

How each state was checked: O2 in the Tab harness (offscreen WKWebView, own window only) against my own wails dev; O4 and O6 by AX tree and AXPress on the review build's pid. `screencapture -o -l` of the review window came back blank (5 KB, as the builder found), so O4 and O6 rest on the AX tree.

Spec gaps (for the FSE): FR-2 lists five verbs; `Rule · draft` (leftovers-9) and Show (unread rows, 57 px, under the floor) are verbs too. W12's outcome holds for Show, not for `Rule · draft`.

For aglaea: Q1, should a kept draft keep the age column (a wider floor), or is the draft mark better outside the verb?

Not verified in WKWebView: VoiceOver speech itself (AX tree only); firebase states (not touched by this card); W11 at 1280 exactly (checked at 1024 and 1440).
