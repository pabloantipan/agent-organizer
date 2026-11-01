---
title: "A C4 level draws as an inline, sanitized dark SVG with a real button over each node"
status: now
repos: [organizer]
branch: lf58-map-render
seat: l58-render
stage:
updated: 2026-11-01
next: "PR with talos-lab"
review: pass
reviewer: l58-render-rev
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
**Verdict: pass (round 2).** V1, V2 and X0 are met at 9c545b6; FR-4, FR-5 and Amendment 1 read against the code hold.
- Unmet gate items: none.
- Reviewer `l58-render-rev`, 2026-11-01, X0 on 9c545b6, fresh run (fresh clean clone; test-lease queued and executed it, no run id printed).
- Round 1 (6935178): fail, cause execution; six CSS url forms fetched past the sanitizer (c8e8871).

**change-check** (fresh clone at 9c545b6; merge-base a7bd633, `git diff --stat a7bd633...9c545b6` the same 6 files):
```
6 files, 23 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 23
```
No undeclared, outside-boundary or declared-not-changed lines. The 23 `untested?` are private helpers (`stringEnd`, `walkCss`, `splitTop`, `cleanDecls`, `cleanStyle`, `cleanRules`, the round-1 ones) exercised through `sanitizeMapSvg`, `scopeCss` and `drawnNodes`.

**Adversarial probe, round 2** (`.wt-notes/l58-render-rev/adv2.mjs`, `adversarial-r2.txt`, live load in `probe2/`, `http2.log`). The sanitized output of every case was inlined by `innerHTML` and loaded in headless Chrome and in a real WKWebView (`wkprobe`, macOS 26.1 WebKit; offscreen window never ordered front, prohibited activation) against a logging server. Each engine fetched only the unsanitized control `/control-unsanitized`; no `/hit-*` request from either. Cases:
- the six round-1 forms (quoted url with `)`, `u\rl(`, `\75 rl(`, both again in a style attribute, `-webkit-image-set("…")`): dropped;
- new: `URL(`, `\55\52\4c(`, `url\28…)`, a custom property holding a url, `@import "…"`, `@\69mport`, `@font-face src`, url inside `@media` and `@keyframes`, `filter=`/`cursor=` attributes, `mask="u\rl(…)"`, a brace and a bad string inside a style attribute, an unterminated comment: dropped;
- kept as text but no fetch in either engine: `u/**/rl(…)` (a comment splits the token), `var(--u)(…)` (not a function token), `url(#a\)http…)` and `url(\23 http…)` (fragment-only urls), `xml:base` on the root and on `<use href="#a">` (neither engine resolves it);
- brace-in-string: now `#map-svg-1 a{content:"}"}#map-svg-1 body{…}`, scoped; bad string: its rule dropped.
Round-2 V1 tests fail on round 1's sanitizer (27 of 61), so they cover the finding.

**Checked and met:** FR-4: no script, foreignObject, on* or external href; aria-hidden on the svg; the name `<initiative> base map, <level>` on the figure (`MapFigure.tsx:152`). Amendment 1: over the committed render and over a fresh render, `foreignObject left: 0`, all six labels as `<text>`. FR-5: nodes found by `flowchart-<id>-<n>`, boxes from the tree, real `<button>`s named `<label>, <kind>, <status>` (+ `not grounded`), one roving tabIndex set in reading order, placed in % of the viewBox, lens = classes on node elements with no geometry change. Safari 15: no lookbehind, `.at`, `structuredClone`, `hasOwn`, `findLast`, oklch, color-mix. `harbor-containers.svg` is unchanged since round 1, where a re-render through `internal/diagram` matched it except for mmdc's random path `d` data (two fresh renders also differ only there); `internal/diagram` is unchanged bf66580..a7bd633. Fails on main: on a7bd633 the new tests end `Cannot find module './mapSvg'` / `'./MapFigure'`. Lens API in progress.md exists as listed. X0: `make test` exit 0 (Go ok, vitest 1504 passed), `pnpm run build` 0, `wails build` 0, `make review-build` 0, porcelain empty.

No finding outside the gate. Note (not a finding, needs no home): a sheet selector already under the scope, e.g. `#m ~ *`, is kept as written. Inside `.map-figure-svg` the svg has no siblings, so it matches nothing.
