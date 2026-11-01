---
title: "A C4 level draws as an inline, sanitized dark SVG with a real button over each node"
status: now
repos: [organizer]
branch: lf58-map-render
seat: l58-render
stage:
updated: 2026-11-01
next: "review: lf58-map-render, V1 V2 X0 pass (round 2, CSS fix), 9c545b6"
review: fail
reviewer: l58-render-rev
cause: execution
depends_on: []
boundary: ["frontend/src/lib/mapSvg.ts", "frontend/src/lib/mapSvg.test.ts", "frontend/src/components/MapFigure.tsx", "frontend/src/components/MapFigure.test.tsx", "frontend/package.json", "frontend/pnpm-lock.yaml", "frontend/src/lib/testdata/"]
spec: "docs/specs/leftovers-58.md (FR-4 and FR-5)"
gate: "docs/specs/leftovers-58.md#Acceptance → gate"
ui_review: false
autonomy: unattended
---

## Goal
A lens can recolour the map's nodes, and every node is reachable by keyboard.

## Gate
docs/specs/leftovers-58.md, rows V1, V2 and X0.

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
- 2026-11-01: FR-4 and FR-5 built (f226344 mapSvg, 6935178 MapFigure), on origin/main bf66580; V1, V2 fail on the base (modules absent) and pass on the branch (43 tests); X0 passes from a clean clone (vitest 1475, Go, pnpm build, wails build, review-build, porcelain empty). Detail and the lens's API: `.wt-notes/l58-render/progress.md`.

- 2026-11-01: review fail fixed (9c545b6): the drawing's CSS is read as the browser's tokenizer reads it (strings, bad strings, escapes, comments, nesting) and every fetching function but url(#fragment) is denied, in sheets, style and presentation attributes; V1 carries the reviewer's six forms, the brace-in-string case and more. Rebased on origin/main a7bd633 (7897f06, e5a4f53, 9c545b6); X0 passes again from a fresh clean clone (vitest 1504); the reviewer's live probe makes no request.

## Notes
- The dark render draws node labels as HTML in `<foreignObject>` (mermaid 11 ignores `flowchart.htmlLabels`); ruled as Amendment 1 (a): the sanitizer swaps each for `<text>`. Root `htmlLabels: false` at the source is held for a later card.
- mmdc's SVG carries the dark style's CSS unscoped (`.node rect`, `marker path`, …); inlined it would restyle the page, so the sanitizer renames the root (`map-svg-N`) and scopes every rule under it. A lens rule therefore needs `#id .node rect`-level specificity or `!important`.

## Declared changes
- added `frontend/src/lib/mapSvg.ts`: FR-4 sanitizer (own XML reader and escaping serializer, element allowlist, foreignObject label to `<text>`, stylesheet read the tokenizer's way and scoped, default-deny for every CSS load but url(#fragment), aria-hidden root) and FR-5 node boxes, reading order, roving step, button names, lens classes
- added `frontend/src/lib/mapSvg.test.ts`: V1 (hostile SVG; the review's CSS load forms and brace cases; Amendment 1 over the real L2 render) and V2 (id to box over the fixture's L2)
- added `frontend/src/lib/testdata/harbor-containers.svg`: the contract's L2 block rendered through `internal/diagram`, the V2 test data
- added `frontend/src/lib/testdata/README.md`: the SVG's source, contract sha and how it was rendered
- added `frontend/src/components/MapFigure.tsx`: renders a level through RenderDiagram, inlines the sanitized SVG, a roving set of real buttons over the nodes, lens classes as a prop
- added `frontend/src/components/MapFigure.test.tsx`: the figure's states, names, roving stop, percent placement, lens classes
Risky:
- `parseXml`: a hand-written XML reader; it throws on what it cannot read (the figure then says `Map not drawn`), and only escaped, allowlisted output is inlined
- `scopeCss`/`walkCss`: a hand-written CSS scanner mirroring the tokenizer's strings, escapes and comments; where it could disagree with the browser (a bad string) the rule is dropped, and a sheet still fetching is dropped whole
Not changed, on purpose:
- `frontend/src/components/DiagramFigure.tsx`: its render cache is copied in MapFigure, not exported from it
- `frontend/package.json`, `frontend/pnpm-lock.yaml`: no sanitizer dependency; DOMParser is absent in vitest's Node and a DOM test library is outside the boundary
- `internal/diagram`, `~/.mermaid/mermaid-config-dark.json`: Amendment 1 holds the source-side fix for a later card
- `frontend/src/styles/`: the lens's map.css; the figure's only styles are inline layout

## Review
**Verdict: fail.** Gate rows V1, V2 and X0 pass as written; the card fails on a proved FR-4 finding outside V1's four inputs: the sanitizer lets the inlined SVG's CSS load external resources.
- Unmet gate items: none of V1, V2, X0 as written; FR-4 ("no external href", the brief's "loads an external resource") is not met.
- Reviewer `l58-render-rev`, 2026-11-01, X0 on 6935178, fresh run (test-lease printed no run id; it queued and executed, not replayed).
- cause: execution (the regex in `localUrls`, `mapSvg.ts:116`, misses valid CSS url forms).

**change-check** (from the clean clone; base f97c622, which adds only cards/docs over bf66580; `git diff --stat bf66580...6935178` shows the same 6 files):
```
6 files, 19 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 19
untested?: reasonOf, escText, escAttr, attrOf, setAttr, localUrls, cleanAttr, scopeSelectors, blockEnd, labelText, cleanChildren, cleanEl, newMapId, mul, nums, transformOf, arcPoints, shapePoints, boxOf
```
No undeclared, outside-boundary or declared-not-changed lines. The 19 `untested?` are private helpers exercised through `sanitizeMapSvg`/`drawnNodes` in mapSvg.test.ts; `localUrls` is the one whose coverage missed the finding below.

**Blocking finding (FR-4): external loads survive the sanitizer.** Input bundled from `mapSvg.ts` at 6935178, run through `sanitizeMapSvg`, inlined by `innerHTML` (as `dangerouslySetInnerHTML` does) in headless Chrome against a local server (`.wt-notes/l58-render-rev/mkpage.mjs`, `probe/sanitized.txt`, `http.log`). Sanitized output kept, e.g.:
```
case 1: <style>#map-svg-1{background:url("http://127.0.0.1:48731/hit-1?a)b")}</style>
case 2: <style>#map-svg-2{background:u\rl(http://127.0.0.1:48731/hit-2)}</style>
case 3: <style>#map-svg-3{background:\75 rl(http://127.0.0.1:48731/hit-3)}</style>
case 4: <svg id="map-svg-4" style="background:url('http://127.0.0.1:48731/hit-4?x)y')" …>
case 5: <svg id="map-svg-5" style="background:u\rl(http://127.0.0.1:48731/hit-5)" …>
case 6: <style>#map-svg-6{background-image:-webkit-image-set("http://127.0.0.1:48731/hit-6" 1x)}</style>
case 7 (control, plain url()): <style>#map-svg-7{background:none}</style>
```
Server log: `GET /hit-1?a)b`, `/hit-2`, `/hit-3`, `/hit-4?x)y`, `/hit-5`, `/hit-6`; no `/hit-7`. Six forms fetch; plain `url()` is blocked. Root cause: `url\(\s*(['"]?)([^)'"]*)\1\s*\)` cannot match a quoted url containing `)`, a CSS-escaped `url` name, or a string url in `image-set`. These are standard CSS, so this is not just a Chrome behaviour; WebKit was not driven.

**Adversarial inputs handled** (`.wt-notes/l58-render-rev/adversarial.txt`): `<SCRIPT>`, `<Script>`, `<svg:script>` dropped (case-sensitive allowlist); `ONLOAD`/`OnClick` dropped; `xlink:onload`/`ev:onclick` kept, but they are not event handlers in the HTML parser (Note); `javascript:` href on `a` dropped, `a` unwrapped; `<use>` with https, data:, `//`, `XLINK:HREF` stripped, `#ok` kept; `@import`, plain `url()` in sheets, `@font-face src` and `fill="url(...)"` made `none`; foreignObject turned into text, lowercase `foreignobject` dropped; escaped `</svg><img onerror>` in text and style stays escaped; CDATA breakout emptied; `animate`/`set`/`image`/`feImage` dropped; malformed and unquoted markup throws (`Map not drawn`).

**Checked and met:** FR-4 aria-hidden on the svg, the name `<initiative> base map, <level>` on the figure (`MapFigure.tsx:152`); Amendment 1 over the committed render and over a fresh render (`foreignObject left: 0`, all six labels as `<text>`). FR-5: nodes by `flowchart-<id>-<n>` with a `node` class, boxes from transforms and shapes, real `<button>`s named by `nodeName`, one roving tabIndex set in reading order with arrows/Home/End, positioned in % of the viewBox so they follow scale, lens = classes on node elements (`withNodeClasses`), no geometry change. Safari 15: no lookbehind, `.at`, `structuredClone`, `hasOwn`, `findLast`, oklch or color-mix; `aspect-ratio` is 15.0+. `harbor-containers.svg`: re-rendered via `internal/diagram` `Renderer.Render` (throwaway test in a copy outside the clone). It is byte-identical after stripping path `d` data; two fresh renders also differ only in `d` (mmdc's rough paths are random), and the flowchart ids and viewBox are identical. Fails on main: the new tests on bf66580's code end `Cannot find module './mapSvg'` / `'./MapFigure'`. Lens API in progress.md exists as listed. X0: `make test` exit 0 (Go ok, vitest 1475 passed), `pnpm run build` 0, `wails build` 0, `make review-build` 0, porcelain empty.

Note: `scopeCss` counts braces without reading strings, so `a{content:"}"} body{background:red}` gives `#map-svg-1 a{content:"}#map-svg-1 "} body{background:red}`, which the browser reads as an unscoped `body` rule. That is a page restyle, not a load or script. Fix it with the finding.
Note: `@keyframes` names stay global (progress.md says so too).
Gate gap: V1 tests one url form; it should carry the escaped, quoted-paren and image-set forms.
