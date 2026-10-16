---
title: "A mermaid block in a record or card draws as a dark figure, with its source and a text line"
status: done
repos: [organizer]
branch: dg-render
seat: dr-build
stage: review-map
updated: 2026-10-16
next: "review: dg-render, gate met (G1, G2, D1, D2, D5, D8, X0), 47a6e58"
risk: medium
footprint: [internal/diagram/ (new), app.go, frontend/wailsjs/, internal/cli (doctor), frontend/src/lib/ (mermaid blocks, class line), a figure component, the five marked sites, frontend/src/styles/, a fixture record]
depends_on: []
boundary: ["docs/specs/diagrams.md Boundary, dg-render"]
spec: "docs/specs/diagrams.md (FR-1 to FR-5; diagrams-in-app D1-D8)"
gate: "docs/specs/diagrams.md Acceptance, rows G1, G2, D1, D2, D5, D8 and X0"
ui_review: true
review: pass
---

## Goal
A mermaid block in a record or card draws as a dark figure, with its source and a text line (T11c; review-map exit 3; Aglaea's diagrams-in-app).

## Gate
docs/specs/diagrams.md, rows G1, G2, D1, D2, D5, D8 and X0.

- [x] G1: go test, fake mmdc and fake home: `internal/diagram/diagram_test.go` (TestG1RenderCachesAndAppendsDarkClassdefs, TestG1MmdcFromNewestNvm)
- [x] G2: `internal/diagram/diagram_test.go` TestG2Reasons; `frontend/src/components/DiagramFigure.test.tsx` "G2: …"
- [x] D1: Tab harness 1024×640, real mmdc (nvm), dark style: /Users/pabloantipan/organizer/.wt-notes/dr-build/out/d1-figure.png, /Users/pabloantipan/organizer/.wt-notes/dr-build/out/d1d2d8.jsonl
- [x] D2: touched classes' strokes 5.14, 9.16, 5.32:1; labels 14.23, 14.23, 7.89:1 (context label 5.32:1): /Users/pabloantipan/organizer/.wt-notes/dr-build/out/d1d2d8.jsonl line 9
- [x] D5: `frontend/src/lib/diagram.test.ts` "D5: …"
- [x] D8: frame 890 holds 2418 and scrolls, page scrollWidth 1024 = 1024, Tab stop "The nightly scan, end to end, diagram": /Users/pabloantipan/organizer/.wt-notes/dr-build/out/d1d2d8.jsonl, /Users/pabloantipan/organizer/.wt-notes/dr-build/out/d8-frame.png
- [x] X0: clean clone at 47a6e58, make test 0, pnpm run build 0, wails build 0, status empty: /Users/pabloantipan/organizer/.wt-notes/dr-build/out/x0-exit.txt, /Users/pabloantipan/organizer/.wt-notes/dr-build/out/x0-status.txt

## Done
- dr-build, 2026-10-15: internal/diagram (mmdc -b transparent, cache by sha256 over block and style), App.RenderDiagram, doctor line, DiagramFigure in the five marked sites, fixture init-a 0012; gate met at 47a6e58 on main 8e1a72d; status golden unmoved.

## Notes
- mmdc paints the SVG white unless `-b transparent` is passed, and `mermaid2svg --style dark` passes none. This card passes it (a light panel otherwise). The toolchain's own script still draws white, which is Hephaistos's to fix.
- D2: context's stroke (#44404d, `--border-strong`, 1.66:1) is below 3:1 by design. diagrams-in-app §1 asks 3:1 of touched classes only, and context's label passes at 5.32:1.
- Bundling mermaid, measured once: 2.75 MB (792 KB gz) against today's whole bundle of 744 KB (233 KB gz). First render takes 55 ms in WKWebView, against about 2.4 s for a cold mmdc. The dist needs Safari 15.4 (`structuredClone`, `Object.hasOwn`, `.at`), above the 15.0 floor. Details: /Users/pabloantipan/organizer/.wt-notes/dr-build/progress.md.
- The skill's example still uses ➕; the fixture follows Amendment 1 (✚).

## Declared changes
- added `internal/diagram/diagram.go`: Renderer (Mmdc lookup PATH then nvm newest, Render with cache, Status), Key, Input, FirstError, Background
- added `internal/diagram/diagram_test.go`: G1, G2, Status over a fake mmdc and home
- modified `internal/cli/cli.go:doctor`: the `diagrams:` line
- added `internal/cli/diagram_test.go`: doctor's diagrams line
- modified `app.go`: `App.diagrams` field, `NewApp`, added `App.RenderDiagram`
- modified `frontend/wailsjs/go/main/App.d.ts`: generated RenderDiagram
- modified `frontend/wailsjs/go/main/App.js`: generated RenderDiagram
- added `frontend/src/lib/diagram.ts`: slotDiagrams, mermaidBlocks, changeClasses, classLine, diagramName, svgSource
- added `frontend/src/lib/diagram.test.ts`: D5, slots
- added `frontend/src/components/DiagramFigure.tsx`: DiagramFigure, DiagramView, useDiagrams, nearestHeading
- added `frontend/src/components/DiagramFigure.test.tsx`: G2 view half, FR-3, the five sites' wiring
- added `frontend/src/styles/diagram.css`: figure, frame, state and class line
- modified `frontend/src/components/CardDrawer.tsx`: slot mermaid blocks, mount figures
- modified `frontend/src/components/RoleDrawer.tsx`: HandOffBody slots mermaid blocks, mounts figures
- modified `frontend/src/components/RuleDecisionBox.tsx`: Clamped slots mermaid blocks, mounts figures
- modified `frontend/src/components/DecisionsView.tsx`: RecordBody takes the title, slots mermaid blocks, mounts figures
- modified `frontend/src/components/HelpView.tsx`: slot mermaid blocks, mount figures
- added `testdata/fixture-overlay/init-a/working-on/decisions/0012-draw-the-change-on-the-map.md`: D1, D2, D8 fixture
- modified `testdata/fixture-overlay/README.md`: one bullet for 0012
Risky:
- `MERMAID_HOME`: a new env var read, as mermaid2svg reads it, else ~/.mermaid
- `useDiagrams`: portals into nodes inside dangerouslySetInnerHTML; a body set again replaces the slots and the figures remount
- `Renderer.Render`: a hung mmdc holds the mutex until the 90 s timeout kills its process group
Not changed, on purpose:
- `lib/useScrollEdges.ts`: the frame reuses watchEdges, sideEdges, scrollStop as they are
- `~/.mermaid`: read only; the white background is fixed by the `-b` flag, not the style files


## UI review
dr-ui, 2026-10-15, on 47a6e58 (the whole review; the branch did not move). Verdict: **pass**. No severity 4 or 3 against the spec. D2 judged against diagrams.md Amendment 1 (3e6b136).

Shared test run: **fresh**, test-lease run a4ca3634-59570 of 47a6e58, `make test` exit 0 (Go ok, vitest 69 files / 781 tests); dr-review reused it. Log: /Users/pabloantipan/organizer/.wt-notes/dr-ui/x0-make-test.log.

How each row was checked (shots and logs under /Users/pabloantipan/organizer/.wt-notes/dr-ui/):
- G1, G2 (Go): read `internal/diagram/diagram_test.go` against the rows. One mmdc run for two renders, one more after a node changes, one more after `classdefs-dark.mmd` changes. The input ends with the four classDef lines (`-b transparent` too). nvm's newest is picked by number when the PATH has none. The three reasons are returned. Every test uses a TempDir home, a fake PATH and its own cache dir, so none touches the real ~/.nvm, ~/.mermaid or data dir. Passed in the shared run.
- G2 (view), D5: vitest in the shared run. Also on screen: with `MERMAID_HOME` pointing at an empty dir, both figures read `Diagram not drawn: dark style missing: …/classdefs-dark.mmd` over the source and the class line, with no img, `role=status` and `--fg-muted` (wkwebview-1024x640-G2-not-drawn.png).
- D1: Tab harness, 1024×640, my own `wails dev` (fixture + overlay, auth off, probe stub), real mmdc from nvm, dark style from ~/.mermaid. A dark figure with no light panel: the SVG background is transparent and the frame is `--surface` rgb(32,27,43). ✚ is lilac, ✎ amber, ✕ dashed 5 3 and struck through, context grey (wkwebview-1024x640-D1-drawn.png). Same in the review build, by AXPress on my own pid (review-1024x640-D1-drawn.png).
- D2: computed in the drawn SVG against `--surface` #201b2b. Strokes: added #b06cff 5.14:1, changed #ffb020 9.16:1, removed #958ea2 5.32:1. These three pass Amendment 1's 3:1; context #44404d measures 1.66:1, which Amendment 1 does not hold to 3:1. Labels: added 14.23:1, changed 14.23:1, removed 7.89:1, context 5.32:1, all ≥ 4.5:1. On their own fills the labels measure added 11.33:1 and changed 10.69:1. Edges #958ea2 measure 5.32:1.
- D8: the wide figure's frame is 890 px holding 2418 and scrolls (scrollLeft 0→200; Right ×3 by key moves it 40). Page scrollWidth 1024 = innerWidth, scrollX stays 0, and no ancestor overflows. Tab from Source lands on `region "The nightly scan, end to end, diagram"`, focus-visible, ring 2px #c0abfe inset (wkwebview-1024x640-D8-scrolled.png). In the review build at 1024 with the rail open the frame is 688 px, so the first figure (704) scrolls and is named too (AX: `AXGroup "Change on the map, diagram"` > `AXImage d="Change on the map, diagram"`).
- FR-3: Source is a button with aria-expanded false→true by Return; the source opens under it, and the class line is the img's aria-describedby (wkwebview-1024x640-FR3-source-open.png).
- No-gos and Boundary from the diff: mermaid is not bundled (package.json and lockfile untouched), no network call, no red for removed, no light panel. The cache landed only in the fixture's data dir (2 files), the real ~/.local/share/organizer/diagrams does not exist, and ~/.mermaid mtimes predate the run. The diff stays inside the Boundary.

Findings:
- **U1 (2) Source shows no open state and has no figure in its name.** Someone who opened Source cannot tell from the button that it is open, and a screen-reader user hears two identical "Source" buttons in one record. Where: every figure's `button.diagram-source` (wkwebview-1024x640-FR3-source-open.png). Evidence: once open and blurred, its background stays rgba(0,0,0,0) and its colour #b5afc3, the same as closed; there is no chevron; AX names both buttons `Source`. design-system.md "Disclosure state" (`--surface-selected` while open) and "Names" (a repeated verb carries its row). Proposal: `--surface-selected` (or a ▸/▾) while expanded, and name it `Source, <heading>` or describe it by the heading.
- **U2 (2, from code, not seen) The rule box's clamp is measured before a figure mounts.** The builder records it in progress.md. A proposed record whose Question holds a block may show more than six lines until "less". Where: `RuleDecisionBox.tsx` Clamped. No fixture record reaches it. Proposal: measure again when the slot's figure resizes (ResizeObserver on the clamped body).
- **U3 (1, already on main) Code blocks in markdown bodies draw a background per line.** Here that includes the figure's source and the not-drawn source. Cause: `.markdown code` sets a background and there is no `pre code` reset; Help has one (help.css:70). Proposal: `.markdown pre code { background: none; padding: 0 }`.

Spec gaps (for the FSE):
- diagrams-in-app §2 prunes cache files unused for 30 days; no FR asks for it, so the cache only grows.
- "No write outside the diagrams cache": mmdc's headless Chromium (puppeteer) normally makes a temporary profile under $TMPDIR. I did not measure it. Decide whether the No-go covers the child process, and if it does, whether `TMPDIR=<cache>` is wanted for it.
- FR-2's five places: the fixture has a block only in a decision record, so CardDrawer, RoleDrawer, RuleDecisionBox and HelpView are checked only by vitest wiring.

For aglaea:
- A1: the not-drawn line has the same style as `Drawing the diagram…` (muted, small); only the words differ. Is that "the blocked-reason style" §2 means?
- A2: context and unclassed boxes have strokes at 1.66:1, so PWA and Datastore read faint. Amendment 1 rules out 3:1 for D2. Does WCAG 1.4.11 still want it where a box's outline is needed to read the map?
- A3: WebKit exposes the SVG's node labels inside the AXImage, besides its alt (`✎ BFF`, `✚ Payments`, …). Does §2 want that, or `aria-hidden` contents with the class line as the only text?

Not verified in WKWebView:
- `Drawing the diagram…`: transient, since the cache answers at once; checked by vitest and by slotDiagrams' HTML.
- The `mmdc not found` and `mmdc exit 1` reasons on screen: go test and vitest only (dark style missing was seen on screen).
- The four other markdown sites: no fixture holds a block there.
- The figure's source `pre` as a Tab stop when it overflows: no overflowing source in the fixture at 1024.
- Firebase states: not applicable.
- 400 px: below the 1024 minimum.

## Review
dr-review, 2026-10-16, on 47a6e5820570eafddd414f759635060f1c118eef (the branch did not move). Verdict: **pass**. Unmet rows: none. D2 judged against diagrams.md Amendment 1 (3e6b136). Clean clone at /Users/pabloantipan/organizer/.wt-notes/dr-review/clean (removed after); notes, logs and shots under /Users/pabloantipan/organizer/.wt-notes/dr-review/.

change-check (organizer dg-render --base main --head 47a6e58), 19 files: undeclared 0, declared not changed 0, new env var 0, new dependency 0, new host 0; outside boundary 11, outside footprint 17, untested? 12 (full output: change-check.txt). Explained: the card's boundary is the spec's prose ("the five markdown places", "one figure component", "`wails generate module` output", "the fixture record, their tests"), which change-check cannot map to paths. The 11 outside-boundary files are exactly those: CardDrawer, DecisionsView, HelpView, RoleDrawer, RuleDecisionBox, DiagramFigure.tsx and its test, App.d.ts, App.js, the 0012 record and the overlay README's bullet for it. Outside footprint is the same set against the card's looser footprint list. The untested? lines are helpers that the G1/G2 tests reach through Render and Mmdc (executable, nodeVersion, shortDir, FirstError), and through bindings and wiring (RenderDiagram, NewApp, RecordBody, Clamped, reasonOf, nearestHeading). None is a gate row's own claim.

- G1: read TestG1RenderCachesAndAppendsDarkClassdefs and TestG1MmdcFromNewestNvm against the row. A fake mmdc logs each run. Two renders of one block make 1 run, a changed node makes 2, and a changed classdefs-dark.mmd makes 3. The input starts with the block unchanged and ends with the four classDef lines. With an empty PATH it picks nvm v24.0.1 over v9.11.2 and v18.20.4. Every test uses a TempDir home, PATH and cache; TestNewFollowsTheDataDir reads New() only and renders nothing. So no test touches the real ~/.nvm, ~/.mermaid or data dir. I ran `go test -v` for both: PASS.
- G2: TestG2Reasons returns `mmdc not found …`, `dark style missing: ~/.mermaid/mermaid-styles-dark.css` (mmdc not run), and on exit 1 `Error: Parse error on line 2:` (nothing cached, not cached as a failure): PASS. vitest DiagramFigure.test.tsx "G2: …": for each reason, `Diagram not drawn: <reason>` directly over the source `<pre><code>`, with no img and the class line; while drawing it shows the source under `Drawing the diagram…`: PASS.
- D1: Tab harness at 1024×640 against my own `wails dev -devserver localhost:34242` from the clean clone. The fixture and overlay were exported, auth off, probe stub. No mmdc on the PATH, so nvm v24.0.1 was used, with the dark style from ~/.mermaid. Both figures of init-a 0012 drew. Shot out/d1-figure.png: no light panel (SVG background transparent, frame rgb(32,27,43) = --surface). ✚ Payments is lilac, ✎ BFF amber, ✕ Legacy pay grey dashed 5 3 and struck, PWA and Datastore grey. No red: the fixture's light classDef stroke #c00000 is overridden by the appended dark lines.
- D2: computed in the drawn SVG (out/d1d2d8.jsonl) and recomputed in Python (out/d2-ratios.txt) against --surface #201b2b. Strokes: added #b06cff 5.14:1, changed #ffb020 9.16:1, removed #958ea2 5.32:1, all ≥ 3:1. Context #44404d measures 1.66:1, not held to 3:1 by Amendment 1. Labels: added #eeebf4 14.23:1, changed 14.23:1, removed #b5afc3 7.89:1, context #958ea2 5.32:1, all ≥ 4.5:1.
- D5: vitest lib/diagram.test.ts "D5: added, changed and no removed" gives `Added: a, b. Changed: c. Removed: none.`: PASS.
- D8: same harness. The second figure's frame is 890 px holding 2418, and scrollLeft 0→200 sets. Page scrollWidth 1024 = innerWidth 1024, with no wide ancestors. Tab from the first figure's Source lands on `DIV role=region "The nightly scan, end to end, diagram"`, focus-visible. Right ×3 scrolls the frame 40 px while scrollX stays 0 (out/d8-frame.png).
- X0: shared `make test` was **reused**: test-lease reused run a4ca3634-59570 of 47a6e5820570 by organizer-probe-dr-ui, exit 0 (internal/diagram and internal/cli ok, vitest 69 files / 781 tests). Then, in the clean clone, `pnpm run build` exited 0, `wails build` exited 0, and `git status --porcelain` was empty (x0-exit.txt, x0-status.txt). `wails build` was run again after the dev session and exited 0.
- No-gos and Boundary from the diff: package.json and lockfile untouched, and the dist has no mermaid; no network call in internal/diagram or the frontend; no light panel; removed is grey; Render writes only temp files inside CacheDir and removes them. After the run the fixture's diagrams dir holds just 2 .svg files, the real ~/.local/share/organizer/diagrams does not exist, and the ~/.mermaid style files' mtimes (2026-10-15 21:14) predate the run.
- Not covered by the gate: puppeteer's temporary Chromium profile under $TMPDIR (dr-ui's spec gap); four of the five markdown sites have no fixture block (vitest wiring only); no cache prune.

