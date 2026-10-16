---
title: "The spec reader: a spec opens in a right drawer with its contents and figures"
status: now
repos: [organizer]
branch: dg-reader
seat: dd-build
stage: review-map
updated: 2026-10-16
next: "review: dg-reader, gate met (D6, D7, G3, X0), 74cf351"
risk: medium
footprint: [app.go, internal/service (spec read), a drawer component, frontend/src/components/Initiatives.tsx, InitiativeHeader.tsx, CardDrawer.tsx, frontend/wailsjs/]
depends_on: [dg-render]
boundary: ["docs/specs/diagrams.md Boundary, dg-reader"]
spec: "docs/specs/diagrams.md (FR-6 to FR-8; diagrams-in-app D1-D8)"
gate: "docs/specs/diagrams.md Acceptance, rows D6, D7, G3 and X0"
ui_review: true
review: pass
---

## Goal
The spec reader: a spec opens in a right drawer with its contents and figures (T11c; review-map exit 3; Aglaea's diagrams-in-app).

## Gate
docs/specs/diagrams.md, rows D6, D7, G3 and X0.

- [x] D6: Tab harness 1024×640, fixture + overlay, auth off: /Users/pabloantipan/organizer/.wt-notes/dd-build/out/d6d7.jsonl, /Users/pabloantipan/organizer/.wt-notes/dd-build/out/d6-section.png, /Users/pabloantipan/organizer/.wt-notes/dd-build/out/d6-contents.png
- [x] D7: /Users/pabloantipan/organizer/.wt-notes/dd-build/out/d6d7.jsonl, /Users/pabloantipan/organizer/.wt-notes/dd-build/out/d7-record.png, /Users/pabloantipan/organizer/.wt-notes/dd-build/out/d7-back.png, /Users/pabloantipan/organizer/.wt-notes/dd-build/out/d7-escape.png
- [x] G3: `internal/service/spec_test.go` TestG3ReadSpecRefusesUnresolved
- [x] X0: clean clone at 74cf351, make test 0, pnpm run build 0, wails build 0, status empty: /Users/pabloantipan/organizer/.wt-notes/dd-build/out/x0-exit.txt, /Users/pabloantipan/organizer/.wt-notes/dd-build/out/x0-status.txt

## Done
- dd-build, 2026-10-16: Service.ReadSpec/App.ReadSpec (only resolved specs: files and cards' spec:), SpecReader drawer (Contents with the map first, figures via DiagramFigure, links, ← Back, Esc, missing), opened from the Specs list, header Details and the card back's Spec; fixture init-a docs/reader.md named by w-wide; gate met at 74cf351 on main 5ad49a4; status golden unmoved.

## Notes
- The reader is mounted in CardDrawer.tsx beside the card back (App.tsx is outside the boundary); its state is its own store in SpecReader.tsx.
- The shared Tab harness has no Escape key; D7 ran on a copy in the notes dir that adds `escape` (keyCode 53, same sendEvent path). scripts/ is outside this boundary.
- Offscreen, WebKit never advances CSS animations, so the slide-in is transform only (an opacity keyframe left the drawer invisible in the harness); harness shots show the drawer 24 px right of its place.
- In wails dev (StrictMode) React re-set the body's dangerouslySetInnerHTML after mount, emptying the figure slot; the reader sets its body in a layout effect instead.
- The scan does not check a card's spec: path; fixture alpha's docs/alpha.md reads missing on its card back with no Problem.

## Declared changes
- added `internal/service/spec.go`: SpecDoc, ErrSpecRefused, Service.ReadSpec, specRel, cleanRel
- added `internal/service/spec_test.go`: G3, resolved, missing, specRel
- modified `app.go`: added App.ReadSpec
- modified `frontend/wailsjs/go/main/App.d.ts`: generated ReadSpec
- modified `frontend/wailsjs/go/main/App.js`: generated ReadSpec
- modified `frontend/wailsjs/go/models.ts`: generated service.SpecDoc
- added `frontend/src/components/SpecReader.tsx`: SpecReader drawer, useSpecReader, openSpec, useSpecProbe, SpecOpener, SpecOpenerView
- added `frontend/src/components/SpecReader.test.tsx`: opener states, openers' wiring
- added `frontend/src/lib/specReader.ts`: specRef, pathRef, joinPath, slug, withAnchors, sectionId, linkTarget
- added `frontend/src/lib/specReader.test.ts`: Contents order, anchors, sections, link targets
- added `frontend/src/styles/spec-reader.css`: drawer, Contents, body measure, openers
- modified `frontend/src/components/CardDrawer.tsx`: CardDrawer mounts CardBack and SpecReader; CardSpec, the spec: link
- modified `frontend/src/components/Initiatives.tsx`: Specs opens the reader instead of the editor
- modified `frontend/src/components/InitiativeHeader.tsx`: HeaderSpecs in the open Details
- added `testdata/fixture-overlay/init-a/docs/reader.md`: D6, D7 fixture spec
- modified `testdata/fixture-overlay/init-a/working-on/w-wide.md`: spec: docs/reader.md#the-scan-report
- modified `testdata/fixture-overlay/README.md`: one bullet for reader.md
Risky:
- `SpecReader`: the body's HTML is set imperatively, so useDiagrams and the landing depend on that effect running first (declaration order)
- `useSpecProbe`: reads the card's spec file each time a local card back with a spec: opens
- `readSpecFile`: a package var the test swaps
Not changed, on purpose:
- `DiagramFigure.tsx`, `lib/diagram.ts`: imported as they are
- `App.tsx`, `board.store.ts`: the reader mounts in CardDrawer and keeps its own store
- `internal/scan`: card spec: paths are resolved in the service, at read time

## Review
**Pass**: D6, D7, G3 and X0 met at 74cf351 (branch unmoved), fresh clone at `.wt-notes/dd-review/clean`, removed after. Evidence under `/Users/pabloantipan/organizer/.wt-notes/dd-review/`.

- **D6** met. My own `wails dev :34252` from the clone, fixture + overlay, `auth: off` (out/auth.txt), the builder's harness copy (with `escape`) at 1024×640, my steps (steps.txt; out/run.jsonl). Return on w-wide's `spec:` link: drawer on docs/reader.md, focus on h2 "The scan report" (focus-visible, in view, 43 px under the top at scrollTop 1527 = max, the section is last-but-one); Contents `✎ Change on the map` first (`li.map`), then the other seven in document order although the heading sits sixth in the file (out/d6-section.png, d6-contents.png).
- **D7** met, on the builder's harness copy with the `escape` verb. Unlike the builder's run I scrolled to 700 before the record link, so `← Back` cannot pass by re-landing on the section: Return on the 0012 link shows the record in the same drawer (one drawer, h1 "0012 Draw the change on the map", `← Back`); Return on `← Back`: docs/reader.md at 700 (700 before); Esc: drawer gone, card back stays, focus on `Read docs/reader.md#the-scan-report`, focus-visible (out/d7-*.png). The 0099 link reads missing, no href.
- **FR-7, other openers** (supervisor's ask): with no card back open, the header's Details Specs (docs/one-spec.md) and Home's init-a chevron Specs (specs/01-shape.md) open the reader by Return; Esc returns focus to each list (out/fr7-header.png, fr7-home.png).
- **G3** met. `TestG3ReadSpecRefusesUnresolved` passes (g3.log): eight unresolved paths (unlisted file, initiative.yaml, a card file, `../`, `specs/../`, absolute, /etc/passwd, empty) are `ErrSpecRefused` with no text, and a counting `readSpecFile` stays at 0, so it proves nothing was read, not only the error. `ReadSpec` has no other disk access.
- **X0** met. make test: **reused** run e116364f-58078 of 74cf351e20b1 (organizer-probe-dd-ui), exit 0, 801 vitest + all go packages ok; `pnpm run build` 0, `wails build` 0, `git status --porcelain` empty; again empty after my `wails dev` and a second `wails build`.
- **Boundary and No-gos**: the diff reads, never writes (WriteFile/MkdirAll only in the test's TempDir); no network (http links go to BrowserOpenURL on a press); `DiagramFigure.tsx`, `lib/diagram.ts` untouched, imported (`useDiagrams`, `slotDiagrams`).
- **change-check** (`organizer dg-reader --base main --head 74cf351`): 0 undeclared, 0 declared-not-changed, 0 new env/dep/host. 13 `outside boundary` and 39 `outside footprint` are explained: the card's `boundary:` points at the spec's prose, which the tool cannot match. CardDrawer.tsx is the card back's `spec:` link, InitiativeHeader.tsx the header's Specs, SpecReader.tsx plus lib/specReader.ts plus spec-reader.css the drawer component, wailsjs/ the generated output of the one bound read, and the fixture overlay the D6/D7 data. 14 `untested?` are internal helpers covered through the tested exports or the harness.
- Unmet rows: none.
- Not covered by the gate: the shared `scripts/tab-harness` has no Escape, so D7 depends on a copy in a notes dir. A card's `spec:` naming a missing file raises no scan Problem.

Reviewer dd-review, 2026-10-16, commit 74cf351e20b141e55d19a694bc9024856e297272. No `## UI review` yet: status and place left as they are.

## UI review
**Pass**, at 74cf351e20b141e55d19a694bc9024856e297272 (branch unmoved). Checked against diagrams.md FR-6 to FR-8 (D6, D7, G3, X0), diagrams-in-app §3 and D6/D7, and the design system. The task prompt names "§0-§4 and W1-W6": that spec has §1-§3 and D1-D8 only, so I checked §2 (figure reuse) and §3. No severity 4 or 3 finding. Evidence: `/Users/pabloantipan/organizer/.wt-notes/dd-ui/` (shots `wk-1024x640-<row>-<state>.png`, out/ui-d6d7.jsonl, out/ui-extra.jsonl).

**Shared test run: fresh**, run e116364f-58078 of 74cf351, exit 0, 801 vitest plus the go packages (x0-make-test.log). dd-review reused it.

How each state was checked:
- D6, met (Tab harness, my `wails dev :34253` from a clean detached clone, fixture + overlay, `auth: off`, 1024×640): Return on w-wide's `spec:` link opens docs/reader.md. Focus is on h2 "The scan report", focus-visible, 43 px under the top. Contents lists `✎ Change on the map` first (amber ✎), then the rest in document order. The figure is drawn (alt "Change on the map, diagram"). Body measure is 615 px, page scrollWidth 1024 (D6-section, D6-contents).
- D7, met, run on the builder's harness copy with the `escape` verb (`.wt-notes/dd-build/tabharness.swift`, copied into my notes dir). Return on the 0012 link shows the record in the same drawer with `← Back` ("Back to docs/reader.md"), both figures drawn. Return on ← Back puts the spec back at scrollTop 1527, the same as before. Esc closes the drawer, the card back stays, and focus is on `Read docs/reader.md#the-scan-report`, focus-visible (D7-record, D7-back, D7-escape). The 0099 link reads `missing` and has no href.
- FR-7, the other openers, with no card back open: the header's Details Specs and Home's init-a chevron Specs each open the reader on Return. Focus goes to the path, and Esc gives focus back to that opener (FR7-header-details, FR7-header-drawer, FR7-home-specs, FR7-home-drawer). Tab stays inside the drawer. The reader is mounted in CardDrawer, and App.tsx always renders CardDrawer, so the reader opens from any view.
- FR-8 missing: card alpha's `docs/alpha.md#shape` reads `missing` and has no button (FR8-missing-opener).
- G3: the code reviewer's run, plus my reading of the test. A counting `readSpecFile` stays at 0 for eight refused paths, so the test proves nothing was read, not only that an error came back.
- Review app (`make review-build`, my pid, AX only): I pressed init-a, Work, w-wide and its spec link by AX at 1024×672. The drawer opened on "The scan report" with AXFocused on that heading (D6-reviewapp-drawer).
- Computed contrast on `--surface-overlay` #2e273c: text 12.1:1, Contents items and missing words (`--fg-muted`) 6.7:1, ✎ amber 7.8:1, links `--accent-fg` 7.1:1. Contents rows are 28 px tall and ✕ is 38-51×28, both over 24 px. The body is a named scroll region and a Tab stop ("docs/reader.md, spec"). Tokens only in spec-reader.css. No light panel.
- Boundary and No-gos: the diff only reads files, reuses DiagramFigure/useDiagrams unforked, and makes no network call except BrowserOpenURL on a press.

Findings (none 4 or 3):
- U1 (2). **What the lead cannot do:** at 1024×640 with Details open, find the header's Specs without scrolling. **Where:** InitiativeHeader, FR7-header-details. **Evidence:** `.ihead-specs` sits at y 406-434, inside the header's own scroll region (y 89-269, scrollHeight 496 over 178). It is reachable by scroll and Tab, and the edge rule shows there is more. **Proposal:** put Specs above Scope in the open Details, or count them on the bar ("3 specs").
- U2 (1). **What the lead cannot do:** a screen reader does not hear the ✎ mark, because `.sr-map-mark` is aria-hidden. Being first in the list still carries the meaning. **Where:** SpecReader Contents. **Evidence:** DOM. **Proposal:** give the item an accessible name that includes the mark (e.g. "Change on the map, the change"), or leave it as is.
- U3 (1). **What the lead cannot do:** see the drawer at its real place in the shots. **Where:** harness and review-app shots. **Evidence:** the drawer sits 24 px right and ✕ is at the window edge, both offscreen and in my on-screen but probably occluded review window: the slide-in animation is paused while hidden. **Proposal:** none for the build. A reviewer reads it as an artifact, not a layout bug (see Not verified).

Spec gaps (for the FSE):
- §3 "keeps its scroll position per path … reopening a spec lands where it was left" conflicts with a `#section` opener. Reopening w-wide's link lands on the section again, not on where the reader left off (600 → 1527). The build lets the section win, which I think is right, but the spec does not say so.
- A card's `spec:` naming a missing file raises no scan Problem. §3 says "the scan's existing problem says why", but nothing tells the lead why it is missing.
- The shared `scripts/tab-harness` has no Escape key, so D7 depends on a copy in a notes dir.

For aglaea: A1. Should the header's Specs be on the folded bar (U1)? A2. Should the ✎ mark be announced (U2)?

Not verified in WKWebView:
- The drawer at its final place after the slide-in in a visible, front window: I may not bring a window front. Code: the transform runs from 24 px to none over 200 ms.
- Reopen of a spec without a `#section` at its kept scroll: the fixture's header specs are shorter than the drawer. Code: `leftAt` per path.
- Esc in my review app (no synthetic keys there). Esc was checked in the harness only.
- `auth: firebase`: not relevant to this card.

Process note: my first harness run overlapped for part of its run with dd-review's harness on :34252. I had not checked before starting. Each harness drives only its own offscreen window and both runs passed, but the one-at-a-time rule was broken once. My second run started only after confirming none was running.

UI reviewer dd-ui, 2026-10-16, commit 74cf351e20b141e55d19a694bc9024856e297272. Status, `review:` and place left as they are.
