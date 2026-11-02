---
title: "Roadmap gains Map: levels, status, drift and each node's grounding"
status: now
repos: [organizer]
branch: lf58-map-lens
seat: l58-lens
stage:
updated: 2026-11-02
next: "review: lf58-map-lens, X0 pass (fresh clone) and M1-M7 pass in WebKit (wails dev + harness, committed fixture, no overlay); review-build window pass not run, screen locked, 8974fd6"
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

- Round 2 (8974fd6, rebased on origin/main e4098ed): FR-10 ReadSpec reads exactly the map's level and curated pages, R3 `TestR3ReadSpecMapPages` (0360749); harbor fixture holds harbor-api (deploy/k8s.yaml, src/booking, src/pricing), harbor-web, harbor-ledger, home.sh git-inits them (a53cade); curated acts without `specs:`; U1 accent actions, U4 no idle scrollbar, U5 panel list in reading order (8974fd6).
- Round 2 X0 pass at 8974fd6 from `.wt-notes/l58-lens/x0-round2/clean` (vitest 1615 passed, porcelain empty).
- Round 2 M1-M7 pass at 1440x900 and 1024x640 in WebKit (wails dev of 8974fd6 + offscreen harness) on the committed fixture with only config's editor stub: every Grounding kind acts (`editor2-<size>.log`), U1/U4/U5 measured (`h2-<size>.txt`, `shots-r2/`). The review-build window pass was not run: the screen locked again before the build was up (`.wt-notes/l58-lens/progress.md`, Round 2, 4b).

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
- modified `internal/service/spec.go`: ReadSpec also reads the map's level and curated pages under docs/architecture/ (FR-10, `mapPages`)
- modified `internal/service/spec_test.go`: `TestR3ReadSpecMapPages`
- modified `testdata/fixture-map/home.sh`: git-inits each listed repo dir in the temp copy
- modified `testdata/fixture-map/harbor/working-on/initiative.yaml`: `repos: [harbor-api, harbor-web, harbor-ledger]`
- added `testdata/fixture-map/harbor/harbor-api/`, `harbor-web/`, `harbor-ledger/`: the dirs and deploy file harbor's grounding names
- modified `testdata/fixture-map/README.md`: the repos and home.sh's checkouts
- modified `frontend/src/components/MapPanel.tsx`: curated acts without the specs: gate (`GroundCtx.readable` removed)
- modified `frontend/src/components/MapView.tsx`: `inReadingOrder`, MapTags reports the buttons' order (U5)
- modified `frontend/src/styles/map.css`: `button.linkish.<class>` accent (U1), svg block and scroller padding (U4)
- modified `frontend/src/components/MapView.test.tsx`: fixture proof, curated FR-10, U1/U4/U5
Not changed, on purpose:
- `MapFigure.tsx`, `lib/mapSvg.ts`, `SpecReader.tsx`: outside the boundary; U5 reads the figure's button order from the DOM instead

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

## UI review
Pass (UI). Commit 1123beb, `make review-build` from a detached worktree, `Deltagos Review` run by its path (pid saved, killed by pid), fixture `testdata/fixture-map/home.sh` plus the builder's recipe (`.wt-notes/l58-lens/fixture.sh`, copied to `.wt-notes/l58-lens-ui/fixture.sh`): `editor:` a stub logging to `$FIXTURE_TMP/editor.log`, and in the temp copy only harbor gets `repos: [harbor-api, harbor-web]` (harbor-api a one-commit checkout) and `specs: [docs/architecture]`. auth off. Screen unlocked (`CGSessionCopyCurrentDictionary`: no lock key, on console). Every state read by AX of my pid (AXManualAccessibility + AXEnhancedUserInterface), moved by AXPress/AXFocused, window sized by AXSize on my own window, shot with `screencapture -o -l <my window id>`; no keys, no CGEvents. Reviewer l58-lens-ui, 2026-11-02. Shots and AX dumps in `.wt-notes/l58-lens-ui/shots/` and beside it.
Shared test run: **fresh**, test-lease run `efe0f92b-99162` of 1123beb (`make test`: Go ok, vitest 1611 passed, exit 0); l58-lens-rev reused it.

| Row | 1440x900 | 1024x640 | Met |
|---|---|---|---|
| M1 | harbor, Roadmap → Map: switch `Stages, Map, Cards, Calendar`; figure `harbor base map, containers`; 6 buttons named `<label>, <kind>, <status>` over the drawn boxes; dark, no light panel. `1440x900-m1-harbor-l2.png` | `1024x640-m1-harbor-l2.png` | met |
| M2 | harbor-ruled: harbor-ledger dashed, `ruled 0002` under it, panel status `ruled 0002` (button) opens `0002-ledger-is-its-own-container.md` in the drawer, close returns focus to it (AX FOCUSED); harbor-web muted with `retiring` under it and in the panel. `1440x900-m2-ruled-retiring.png`, `1440x900-m2-ledger-panel.png` | `1024x640-m2-ruled-retiring.png`, `-m2-ledger-panel.png`, `-m2-record-0002-drawer.png`, `-m2-web-retiring-panel.png` | met |
| M3 | Every panel ends with Grounding. Run against the stub (`editor.log`): `repo harbor-api@def7c12` → `…/harbor/harbor-api`; `deploy harbor-api/deploy/k8s.yaml` → the file; harbor_db `deploy … key API_DB_HOST` → the file; booking (L3) `repo harbor-api/src/booking` → the dir. `record 0001` → drawer (`1440x900-m3-record-drawer.png`); clerk `curated: context.md` → spec reader (`1440x900-m3-curated-drawer.png`). Lines that cannot act say why on screen, no silent press: `fakedeploy qa harbor-ledger` "not a file: the deploy adapter's own reference", `repo harbor-ledger@0989d68` / harbor-ruled's `repo harbor-web@6c88101` "not on this machine: … is not in this initiative's repos". `1440x900-m3-harbor-api-panel.png`, `-m3-harbor-db-panel.png` | `1024x640-m3-harbor-db-panel.png` | met with the recipe's overlay; on the committed fixture only `record` can act (curated, repo, deploy show their reasons): Amendment 2 (FR-10 + fixture) already carries this from the code review, not repeated as a UI finding; re-shoot M3 after that round |
| M4 | harbor-ungrounded: Mail relay dotted amber, `not grounded` under it; name `Mail relay, kind unknown, status unknown, not grounded`; panel title `Mail relay, not grounded`, Grounding `not grounded: no evidence names this node.` `1440x900-m4-ungrounded.png` | `1024x640-m4-ungrounded.png`, `-m4-ungrounded-panel.png` | met |
| M5 | harbor-v2 `Map not drawn: map.json is c4-map/2; this Deltagos reads c4-map/1`; harbor-nomap `No base map yet.` / `Daedalus makes one with c4-map gen; the FSE cuts the card.`, no action. `1440x900-m5-v2-refused.png`, `-m5-nomap-empty.png` | `1024x640-m5-v2-refused.png`, `-m5-nomap-empty.png` | met |
| M6 | L2 → harbor-api's modules (L3, trail Context › Containers › harbor-api) → trail back: the 6 button boxes identical (`m6-l2-before.txt` = `m6-l2-after-l3.txt`); harbor-ledger: `No module map for this container.` AXSize 1440x900 → 1024x640: svg 689x325 → 444x210, every button scaled ≈0.65 and still on its shape; back to 1440x900: boxes identical to before (`m6-1440.txt` = `m6b-1440.txt`). `1440x900-m6-l3-modules.png`, `-m6-resized-back.png` | `1024x640-m6-resized.png` | met |
| M7 | AX: the node set is 6 `AXButton`s in reading order (harbor-web, harbor-api, harbor-ledger, harbor_db, Card gateway, Mail relay); the svg group exposes no child (aria-hidden), so nothing in it is focusable; AXFocused lands on each node (FOCUSED). `1440x900-m7-focus-first.png`, `1024x640-m7-ring-first.png`, `-m7-ring-moved.png` | same | met in part: ring and arrows **not verified** on screen (below) |

Findings (none severity 4 or 3):
- **U1 (2) the lines that open something look like the ones that cannot.** Pablo cannot tell, before hovering, which Grounding lines, list entries or the `ruled 0002` status open anything. Where: every node panel (`1440x900-m3-harbor-api-panel.png`, `-m2-ledger-panel.png`: `record 0002` is a button and reads like plain text). Evidence: `.map-ground-act`, `.map-panel-node`, `.map-ruled-link` set `color: var(--accent-fg)` (0,1,0), and `button.linkish { color: inherit }` (global.css:612, 0,1,1) wins, so they draw in `--fg`; the intended accent never shows. Proposal: scope them `button.linkish.map-ground-act` etc., so actions read as the accent links the design system names (`--accent-fg`, "accent-coloured text and links").
- **U2 (2) at 1024x640 the map's words are about 10 px.** Where: `1024x640-m1-harbor-l2.png`. Evidence: the figure scales to 0.644 (689 → 444 px), so 16 px labels draw at about 10 px, under the smallest size the type scale allows (`--font-size-xs` 11 px); Amendment 2 says "a frame that cannot fit the figure scrolls in its own region (D8)". Proposal: a floor scale (labels ≥ 11 px), scrolling in the frame past it, the buttons following. For aglaea, since M6's "buttons follow the scale" reads as scaling.
- **U3 (2) at Context there is no trail back.** Where: Context level (pressing `Context` in the trail). Evidence: `trailOf` renders only with more than one entry, so at L1 the trail vanishes; the way back to Containers is picking the system node and then `Open Harbor ferry-ticket shop's containers`. Proposal: at Context keep `Context › Containers` with Containers as a button (or a forward hint). For aglaea.
- **U4 (1)** a vertical scrollbar shows in the figure frame at every level and both sizes though the figure fits (all M1/M6 shots); a few px of overflow, probably the words under the nodes. Proposal: find the overflow, or no scrollbar when it fits.
- **U5 (1)** the panel's list (the map as text) is in `map.json` order (Card gateway, harbor-api, harbor_db, …) while the roving set is in reading order (harbor-web, harbor-api, …); MapPanel's own comment says reading order. Proposal: the same order in both.
- **U6 (1)** `ruled 0002` under the node is a word, not a link (the tag layer is `pointer-events: none`); the link is in the panel, one press away. M2 is met that way. For aglaea: is the figure's word to be pressable.

Not verified:
- The focus ring on screen: WebKit paints `:focus-visible` only after keyboard input, and no keys may be sent. A control (the `Cards` switch, focused the same way) shows no ring either, so its absence is this method, not the branch. Computed instead: `--focus-ring` (violet-11 #c0abfe) on `--surface` #201b2b is 8.4:1 (≥ 3:1). The builder's harness shot the ring with keys in its own window.
- Arrow stepping and Tab entering the set once: not exercised (no keys). The source gives `tabIndex` 0 to one stop and -1 to the rest (`MapFigure.tsx:164`, `rovingStep`), covered by vitest and the builder's harness.
- "No script in the svg": AX shows no child under the svg group; the sanitizer is V1's (vitest), not re-checked in the DOM.

Contrast and colour: the status words on `--surface`: `--decision-ruled-fg` 7.8:1, `--warning` 9.2:1, `--fg-muted` 7.9:1. Every status has a word under the node, in the button's name and in the panel, and the legend names each look, so status is never colour alone. map.css uses tier-2 tokens only.

Spec gaps (for the FSE): what the trail shows at L1 (U3); whether the map scales without limit or scrolls past a legible size (U2); whether the word under a ruled node links (U6).
For aglaea: U2, U3, U6.
