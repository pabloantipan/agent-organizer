---
title: "Roadmap gains Map: levels, status, drift and each node's grounding"
status: now
repos: [organizer]
branch: lf58-map-lens
seat: l58-lens
stage:
updated: 2026-11-02
next: "M3: every curated: line opens its page in the spec reader (ReadSpec refuses docs/architecture/ unless listed under specs:; needs a Go or fixture change outside this boundary: FSE amends leftovers-58), and the fixture gives repo/deploy an entry that can open"
review: fail
reviewer: l58-lens-rev
cause: gate
depends_on: [lf58-map-read, lf58-map-render]
boundary: ["frontend/src/components/RoadmapView.tsx", "frontend/src/components/MapView.tsx", "frontend/src/components/MapPanel.tsx", "frontend/src/components/MapView.test.tsx", "frontend/src/styles/map.css", "internal/service/spec.go", "internal/service/spec_test.go", "testdata/fixture-map/"]
spec: "docs/specs/leftovers-58.md (FR-6 to FR-9)"
gate: "docs/specs/leftovers-58.md#Acceptance → gate"
ui_review: true
autonomy: unattended
---

## Goal
Pablo sees where the system is, what is planned and what has drifted, in the Roadmap he already reads.

## Gate
docs/specs/leftovers-58.md, rows M1-M7 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Fixture: `testdata/fixture-map/` from the contract's harbor files (specs 54cf10d or later), plus the three variants the spec names; lf58-map-read creates it, the others read it.
- Short-sample fallback: a state the fixture lacks is added as a variant beside it; never the real home, never skipped.
- Data shape across states: c4-map/1 as `contracts/c4-map/map.schema.json` gives it; Deltagos stores nothing but the diagram cache it already keeps.
- Tests: Go in `internal/service/map_test.go`; vitest beside the new lib and components (`cd frontend && npm test`).
- Design questions: Aglaea's map-and-roadmap Amendments 1 and 2 answer them; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Evidence: test output and review-build shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- Map on Roadmap's switch (Stages, Map, Cards, Calendar): L2 first, trail Context › Containers › container, L3 from the panel, `No module map for this container.`; lens classes ruled/retiring/ungrounded with words under nodes; MapPanel as the map's text, Grounding lines each an action or its reason; empty and refused states (ca224b5, 77b1505, 1123beb, rebased on origin/main 1bc2d44).
- X0 pass at 1123beb from `.wt-notes/l58-lens/clean`; vitest 1611 passed.
- M1-M7 pass at 1440x900 and 1024x640 in WebKit (wails dev of the branch + offscreen harness), fail on base e968fc1 (no Map); shots `.wt-notes/l58-lens/shots/{1440x900,1024x640}-m{1..7}-*.png`, `1440x900-base-roadmap.png`; recipe and numbers in `.wt-notes/l58-lens/progress.md`.

## Notes
- The screen was locked all session (CGSSessionScreenIsLocked): AX of the review build's window and `screencapture -l` return nothing, so M1-M7 ran in WebKit via wails dev + the offscreen harness (earlier seats' method). The review-build window pass is written as a recipe in progress.md, not run.
- repo/deploy not on this machine: a line with no press and its reason (`not on this machine: <repo> is not in this initiative's repos` / `has no checkout here`).
- curated: pages open only when `docs/architecture` is under `specs:` (ReadSpec's allow-list); otherwise the line says why. A Go card could let ReadSpec read the map's pages.
- c4-map/1 has no members field, so merged nodes list none.

## Declared changes
- modified `frontend/src/components/RoadmapView.tsx`: the switch gains Map and mounts MapView
- added `frontend/src/components/MapView.tsx`: reads App.Map, levels, trail, lens classes, the words under nodes, the states
- added `frontend/src/components/MapPanel.tsx`: the map as text, node facts, Grounding lines and their actions (OpenInEditor, record in the drawer, spec reader)
- added `frontend/src/components/MapView.test.tsx`: headless states, levels, classes, lines, actions against mocked bindings
- added `frontend/src/styles/map.css`: status looks, panel, legend, the node ring (tier-2 tokens)
Risky:
- `MapTags`: a portal into MapFigure's frame, keyed on its class hooks (`.map-figure-frame`, `button.map-node` styles)
- `openRecord`: sets useSpecReader directly; focus return by its own subscription
Not changed, on purpose:
- `MapFigure.tsx`, `lib/mapSvg.ts`, `SpecReader.tsx`, Go: outside the boundary

## Review
Fail. Unmet: M3 (FR-8). Reviewer l58-lens-rev, 2026-11-02. X0 on 1123beb (base 1bc2d44): pass, `make test` reused run efe0f92b-99162 of 1123beb by l58-lens-ui (Go ok, vitest 96 files / 1611 tests passed); `pnpm run build`, `wails build`, `make review-build` fresh, all exit 0; `git status --porcelain` empty. Code review only; M1-M7 on screen are l58-lens-ui's.
cause: gate

change-check (`change-check organizer lf58-map-lens`, from the clean clone at 1123beb; base read as origin/main 2f75c52, same 5 files as 1bc2d44...1123beb):
```
5 files, 11 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 11, could not read 0, boundary unreadable 0
untested?: MapPanel.tsx inRepo, isRepoName, openRecord, errText, GroundRow, nodesLabel; MapView.tsx placeKey, samePlace, sourceAt, labelOf, MapTags
```
No undeclared, outside-boundary or declared-not-changed lines. The 11 `untested?` are private helpers exercised through exported functions the tests call (`groundLine` uses inRepo/isRepoName; `runGround` record → openRecord, test "record opens the record in the drawer"; `MapPanel` renders GroundRow and nodesLabel; `MapBody` uses placeKey/samePlace/sourceAt/labelOf). MapTags is not rendered by any test, since renderToStaticMarkup runs no layout effect: Note, below.

Fails on main: MapView.test.tsx at 1123beb run against 1bc2d44's code: `Error: Cannot find module '/src/components/MapView'`, Test Files 1 failed.

Finding (blocking, M3 / FR-8): in the gate's fixture no `curated:` line opens its page. Aglaea's M3 asks for "each evidence entry a working link", and FR-8 says `curated: <page>` opens the page in the spec reader. `groundLine` gives `curated` an action only when `docs/architecture/<page>` is in `spec_files` (MapPanel.tsx, `case "curated"`), because `ReadSpec` reads only paths under `specs:`, a card's `spec:` or a run record (internal/service/spec.go:40-55). No fixture-map initiative.yaml has `specs:` (`testdata/fixture-map/*/working-on/initiative.yaml`), so harbor's four context nodes (card_gateway, clerk, mail_relay, traveller: `curated context.md`) render "not readable here: docs/architecture/ is not under specs: in initiative.yaml" with no press. The branch's own test proves it: MapView.test.tsx:210, `line("curated", "context.md", bare)` → `act: null`, where `bare` is harbor's map as given. The same holds in general: no initiative lists `docs/architecture` under `specs:`, so the map's curated pages never open. The fixture also has no `repos:`, so every `repo` and `deploy` entry in it reads "not on this machine" or "not a file". Only `record` can be pressed, and M3's "each entry's action run against the stub" cannot run for repo, deploy or curated there. The fix is Go (ReadSpec allows the map's `levels[].page` and curated pages under `docs/architecture/`) or the fixture (`specs: [docs/architecture]`, a `repos:` entry with a checkout), and both are outside this card's boundary (lf58-map-read owns `testdata/fixture-map/` and Go). So the cause is the gate: the spec's boundary leaves out what FR-8 needs. For the FSE: amend leftovers-58 so a card owns that change. The builder's handling of an entry it cannot act on (a line with its reason, no dead press) is right and should stay.

Met by the diff (FR-6, FR-7, FR-9, X0):
- FR-6: switch order Stages, Map, Cards, Calendar (RoadmapView.tsx); `firstPlace` picks containers; drill from a container to its modules via the panel, trail Context › Containers › container with buttons back; `No module map for this container.` (NO_L3).
- FR-7: lens classes only (`lensClasses`), the test proves the markup differs by the classes alone; ruled dashed `6 4`, retiring muted fill and `--fg-muted` text with the word, ungrounded dotted; `ruled 0002` under the node (aria-hidden tag) and a button opening the record in the panel; `not grounded` in the button name (MapFigure) and the panel title and Grounding.
- FR-8 else: the panel ends with Grounding; repo mono → OpenInEditor at the repo path; deploy → the file; record → the drawer with focus return.
- FR-9: `No base map yet.` / `Daedalus makes one with c4-map gen; the FSE cuts the card.`, no action; `refused` shown verbatim.
- map.css: every var is tier 2 in tokens.css (accent-fg, bg, border-strong, decision-ruled-fg, fg*, focus-ring, warning, surface*, space/radius/type); no oklch, color-mix, nesting, @layer, raw colour; DOM APIs used (MutationObserver, CSS.escape, createPortal) exist in Safari 15.0.

Notes (not failing):
- Note: a Go error from App.Map shows as `Map not drawn: <error text>` (MapView.tsx, `state: "error"`). The prefix is the lens's, not the reader's. That is fine for FR-9, which covers only the reader's lines.
- Note: FR-8's "a merged node lists its members" cannot be met while c4-map/1 has no members field; the builder says so. It goes to Hephaistos's c4-map/2 work.
- Note: MapTags (the words under nodes) has no vitest, since it needs layout. Only the UI review's shots prove it.
