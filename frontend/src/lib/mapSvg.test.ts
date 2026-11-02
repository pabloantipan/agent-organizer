import { describe, expect, it } from "vitest";
import harbor from "./testdata/harbor-containers.svg?raw";
import {
  boxPercent, decodeCss, drawnNodes, mapFigureName, nodeIdOf, nodeName, parseXml, pathPoints, readingOrder, rovingStep,
  sanitizeMapSvg, sanitizeMapTree, scopeCss, serialize, viewBoxOf, withNodeClasses, type MapNode,
  FLOOR_PX, figureScale, floorScale, smallestTextSize,
} from "./mapSvg";

// leftovers-58 V1 (FR-4, Amendment 1) and V2 (FR-5). Vitest runs in Node
// with no DOM library; mapSvg reads and writes the SVG itself, so the
// strings here are exactly what the figure inlines.

// A drawing carrying every hazard FR-4 names, plus the ones an inlined SVG
// adds: a focusable link, an external use, a stylesheet that would reach
// the page, an @import and an external url().
const hostile = `<?xml version="1.0"?><!-- c --><svg id="my-svg" width="100" height="50" viewBox="0 0 100 50" role="graphics-document document" aria-roledescription="flowchart-v2" onload="alert(1)" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<style>@import url(https://evil.example/x.css);#my-svg .node rect{fill:red;background:url(https://evil.example/p.png)}.node text{fill:url(#my-svg_grad)}</style>
<script>alert(2)</script><script type="text/javascript"><![CDATA[alert(3)]]></script>
<g class="node default" id="flowchart-api-0" transform="translate(50, 25)" onclick="alert(4)" tabindex="0">
<rect x="-20" y="-10" width="40" height="20" style="fill:url(https://evil.example/f.png)"/>
<g class="label" transform="translate(-15, -8)"><rect/><foreignObject width="30" height="16"><div xmlns="http://www.w3.org/1999/xhtml"><span class="nodeLabel"><p>A &amp; B</p></span></div></foreignObject></g></g>
<a href="https://evil.example/" xlink:href="javascript:alert(5)"><text x="1" y="1">link</text></a>
<use href="https://evil.example/s.svg#x"/><use xlink:href="#flowchart-api-0"/>
<image href="https://evil.example/i.png"/><path d="M0 0" marker-end="url(#my-svg_flowchart-v2-pointEnd)"/>
<marker id="my-svg_flowchart-v2-pointEnd"><path d="M 0 0 L 10 5 z"/></marker>
</svg>`;

describe("V1: the sanitizer (FR-4)", () => {
  const out = sanitizeMapSvg(hostile, "map-svg-7");
  it("removes every script, foreignObject, on* attribute and external href", () => {
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toMatch(/alert\((2|3)\)/);
    expect(out).not.toMatch(/foreignObject/i);
    expect(out).not.toMatch(/\son\w+=/i);
    expect(out).not.toMatch(/evil\.example/);
    expect(out).not.toMatch(/javascript:/i);
    expect(out).not.toMatch(/@import/);
  });
  it("keeps a local reference, in a use and in a marker, renamed with the root", () => {
    expect(out).toContain('<use xlink:href="#flowchart-api-0"/>');
    expect(out).toContain('marker-end="url(#map-svg-7_flowchart-v2-pointEnd)"');
    expect(out).toContain('<marker id="map-svg-7_flowchart-v2-pointEnd">');
  });
  it("leaves nothing focusable: no tabindex, a link unwrapped to its text", () => {
    expect(out).not.toMatch(/tabindex/i);
    expect(out).not.toMatch(/<a[\s>]/);
    expect(out).toContain('<text x="1" y="1">link</text>');
  });
  it("is aria-hidden, without the root's role or names, filling its box, under its new id", () => {
    const root = out.match(/^<svg[^>]*>/)![0];
    expect(root).toContain('aria-hidden="true"');
    expect(root).toContain('id="map-svg-7"');
    expect(root).toContain('viewBox="0 0 100 50"');
    expect(root).not.toMatch(/\s(role|aria-roledescription)=/);
    expect(root).toContain('width="100%" height="100%"');
    expect(root).not.toMatch(/width="100"\s|height="50"/);
  });
  it("scopes every stylesheet rule to the drawing, so nothing reaches the page", () => {
    const css = out.match(/<style>([\s\S]*?)<\/style>/)![1];
    expect(css).toBe("#map-svg-7 .node rect{fill:red}#map-svg-7 .node text{fill:url(#map-svg-7_grad)}");
  });
  it("turns a node's foreignObject label into SVG text centred in its box", () => {
    expect(out).toContain('<g class="label" transform="translate(-15, -8)"><rect/><text x="15" y="8" text-anchor="middle" dominant-baseline="central" class="nodeLabel map-label">A &amp; B</text></g>');
  });
  it("the figure is named <initiative> base map, <level>", () => {
    expect(mapFigureName("harbor", "containers")).toBe("harbor base map, containers");
  });
  it("refuses what is not one svg, and markup it cannot read", () => {
    expect(() => sanitizeMapSvg("<div/>", "x")).toThrow("not an SVG drawing");
    expect(() => sanitizeMapSvg("<svg><g></svg>", "x")).toThrow();
    expect(() => sanitizeMapSvg("<svg/><svg/>", "x")).toThrow("not an SVG drawing");
  });
  it("a multi-line label keeps each line, centred as a block", () => {
    const s = sanitizeMapSvg('<svg viewBox="0 0 10 10"><g><foreignObject width="20" height="40"><div><p>one<br/>two</p></div></foreignObject></g></svg>', "m");
    expect(s).toContain('<text x="10" y="20" text-anchor="middle" dominant-baseline="central" class="nodeLabel map-label"><tspan x="10" dy="-0.6em">one</tspan><tspan x="10" dy="1.2em">two</tspan></text>');
  });
  it("an empty foreignObject (an edge with no label) leaves nothing", () => {
    expect(sanitizeMapSvg('<svg><g class="edgeLabel"><foreignObject width="0" height="0"><div><span></span></div></foreignObject></g></svg>', "m"))
      .toBe('<svg id="m" width="100%" height="100%" aria-hidden="true" focusable="false"><g class="edgeLabel"/></svg>');
  });
});

// The review of 6935178 (l58-render-rev): CSS forms that loaded from a
// local server through the first sanitizer, then more of the same family.
// The rule (default-deny): a declaration or presentation attribute whose
// value, CSS escapes decoded, calls any fetching function is dropped unless
// every call is url(#fragment); a sheet still fetching is dropped whole.
describe("V1: no CSS form loads anything (review of 6935178)", () => {
  const sheet = (css: string) => sanitizeMapSvg(`<svg><style>${css.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</style></svg>`, "s").match(/<style>([\s\S]*)<\/style>/)?.[1] ?? "";
  const styled = (style: string) => /<rect([^>]*)\/>/.exec(sanitizeMapSvg(`<svg><rect style="${style.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}" width="1" height="1"/></svg>`, "s"))![1];
  const sheets: [string, string][] = [
    ["a quoted url holding )", '.a{background:url("https://evil.example/2.png?a)b")}'],
    ["an escaped name u\\rl(", ".a{background:u\\rl(https://evil.example/3.png)}"],
    ["a hex-escaped name \\75 rl(", ".a{background:\\75 rl(https://evil.example/4.png)}"],
    ["a six-digit hex escape", ".a{background:\\000055RL(https://evil.example/4b.png)}"],
    ["image-set with a string", '.b{background-image:image-set("https://evil.example/7.png" 1x)}'],
    ["-webkit-image-set with a string", '.b{background-image:-webkit-image-set("https://evil.example/8.png" 1x)}'],
    ["upper case URL(", ".a{background:URL(https://evil.example/9.png)}"],
    ["cursor url", ".a{cursor:url(https://evil.example/c.cur),auto}"],
    ["a local url beside an external one", ".a{fill:url(#ok);background:url(#ok),url(https://evil.example/m.png)}"],
    ["cross-fade", ".a{background:cross-fade(url(#a),url(https://evil.example/x.png),50%)}"],
    ["@import as a string", '@import "https://evil.example/i.css";.a{fill:red}'],
    ["@import with an escaped name", "@\\69mport url(https://evil.example/j.css);.a{fill:red}"],
    ["@font-face", "@font-face{font-family:x;src:url(https://evil.example/f.woff)}.a{fill:red}"],
    ["a url inside @media", "@media (min-width:1px){.a{background:url(https://evil.example/q.png)}}"],
    ["a url inside @keyframes", "@keyframes k{from{background:url(https://evil.example/k.png)}}"],
  ];
  for (const [name, css] of sheets) {
    it(`sheet: ${name}`, () => {
      const out = sheet(css);
      expect(out).not.toMatch(/evil\.example/);
      expect(decodeCss(out).toLowerCase()).not.toMatch(/(url|image-set|image|cross-fade)\((?!#)/);
    });
  }
  it("a custom property is kept, unless its value fetches", () => {
    expect(sheet(".a{--f:Inter,sans-serif;--g:url(https://evil.example/v.png)}")).toBe("#s .a{--f:Inter,sans-serif}");
  });
  it("keeps the declarations around a dropped one, and a local url(#…)", () => {
    expect(sheet(".a{fill:red;background:url(https://evil.example/x.png);stroke:url(#g)}")).toBe("#s .a{fill:red;stroke:url(#g)}");
  });
  it("a comment between letters is not url(: the declaration stays harmless", () => {
    const out = sheet(".a{background:u/**/rl(https://evil.example/c.png)}");
    expect(out).not.toMatch(/url\(/i);
  });
  const styles: [string, string][] = [
    ["a quoted url holding )", "fill:url('https://evil.example/5.svg#g)x')"],
    ["an escaped name", "background:u\\rl(https://evil.example/6.png)"],
    ["a hex-escaped name", "background:\\75 rl(https://evil.example/6b.png)"],
    ["image-set", 'background-image:-webkit-image-set("https://evil.example/6c.png" 1x)'],
  ];
  for (const [name, style] of styles) {
    it(`style attribute: ${name}`, () => {
      const out = styled(`fill:#fff;${style};stroke:#000`);
      expect(out).not.toMatch(/evil/);
      expect(out).toContain('style="fill:#fff;stroke:#000"');
    });
  }
  it("a presentation attribute that fetches is dropped, a local one kept", () => {
    const out = sanitizeMapSvg('<svg><rect fill="\\75 rl(https://evil.example/p.png)" stroke="url(#g)" mask="url(https://evil.example/m.svg#m)"/></svg>', "s");
    expect(out).toBe('<svg id="s" width="100%" height="100%" aria-hidden="true" focusable="false"><rect stroke="url(#g)"/></svg>');
  });
  it("a brace inside a string does not end the rule (the reviewer's note)", () => {
    expect(sheet('a{content:"}"} body{background:red}')).toBe('#s a{content:"}"}#s body{background:red}');
  });
  it("a brace inside a quoted attribute selector stays in the selector", () => {
    expect(sheet('[title="}"] b{fill:red} body{fill:blue}')).toBe('#s [title="}"] b{fill:red}#s body{fill:blue}');
  });
  it("an escaped brace is not a brace", () => {
    expect(sheet(".a\\}{fill:red} body{fill:blue}")).toBe("#s .a\\}{fill:red}#s body{fill:blue}");
  });
  it("a string a newline ends (a bad string) is read as the browser reads it, and its rule dropped", () => {
    const out = sheet('a{content:"x\n} body{background:red}');
    expect(out.startsWith("#s ") || out === "").toBe(true);
    expect(out).not.toMatch(/(^|})\s*body/);
  });
  it("a comma inside :is() or a string is not a selector split", () => {
    expect(sheet(':is(.a,.b) c, [d=","] e{fill:red}')).toBe('#s :is(.a,.b) c,#s [d=","] e{fill:red}');
  });
});

describe("V1, Amendment 1: over the real L2 render", () => {
  const tree = sanitizeMapTree(harbor, "map-svg-1");
  const out = serialize(tree);
  const labels = ["harbor-api", "harbor_db", "harbor-ledger", "harbor-web", "Card gateway", "Mail relay"];
  it("the render as committed draws its labels in foreignObject (the reason for the amendment)", () => {
    expect(harbor.match(/<foreignObject/g)).toHaveLength(6);
  });
  it("no foreignObject, script, on* or external href remains", () => {
    expect(out).not.toMatch(/foreignObject|<script|\son\w+=|href="(?!#)/i);
  });
  it("every node keeps its label as <text>, inside its own node element", () => {
    for (const label of labels) {
      expect(out).toMatch(new RegExp(`<g class="node default" id="flowchart-[a-z_]+-\\d+"[^>]*>(?:(?!</g></g>).)*<text [^>]*class="nodeLabel map-label">${label}</text>`));
    }
    expect(out.match(/class="nodeLabel map-label"/g)).toHaveLength(6);
  });
  it("the subgraph's own title stays as mermaid drew it", () => {
    expect(out).toContain(">Harbor</tspan>");
  });
  it("keeps every declaration of mermaid's own sheet (nothing in it loads)", () => {
    expect(out).toContain('--mermaid-font-family:"trebuchet ms",verdana,arial,sans-serif');
    expect(out).toContain("#map-svg-1 .node rect,#map-svg-1 .node polygon,#map-svg-1 .node circle,#map-svg-1 .node ellipse,#map-svg-1 .node path{fill: #272033;stroke: #44404d;stroke-width: 1px}");
  });
  it("both stylesheets are scoped to the root", () => {
    const css = [...out.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("");
    const rules = css.replace(/@keyframes[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, "");
    const selectors = [...rules.matchAll(/([^{}]+)\{[^}]*\}/g)].flatMap((m) => m[1].split(","));
    expect(selectors.length).toBeGreaterThan(40);
    expect(selectors.filter((s) => !s.trim().startsWith("#map-svg-1"))).toEqual([]);
    expect(css).toContain("#map-svg-1 .node rect,#map-svg-1 .node polygon");
  });
  it("reads back as one svg (well formed)", () => {
    expect(() => parseXml(out)).not.toThrow();
  });
});

describe("V2: id to box over the fixture's rendered L2 SVG (FR-5)", () => {
  const tree = sanitizeMapTree(harbor, "map-svg-1");
  const nodes = drawnNodes(tree);
  // The containers level of the contract's expected.json.
  const expected = ["card_gateway", "harbor_api", "harbor_db", "ledger", "mail_relay", "web"];
  it("finds every drawn node once, by its flowchart-<id>-<n> element", () => {
    expect(nodes.map((n) => n.id).sort()).toEqual(expected);
    expect(new Set(nodes.map((n) => n.elementId)).size).toBe(6);
    for (const n of nodes) expect(n.elementId).toMatch(new RegExp(`^flowchart-${n.id}-\\d+$`));
  });
  it("each box is non-empty and inside the viewBox", () => {
    const vb = viewBoxOf(tree)!;
    expect(vb).toEqual({ x: -12, y: -12, width: 688.5288696289062, height: 324.9422302246094 });
    for (const n of nodes) {
      expect(n.box.width).toBeGreaterThan(20);
      expect(n.box.height).toBeGreaterThan(20);
      expect(n.box.x).toBeGreaterThanOrEqual(vb.x);
      expect(n.box.y).toBeGreaterThanOrEqual(vb.y);
      expect(n.box.x + n.box.width).toBeLessThanOrEqual(vb.x + vb.width);
      expect(n.box.y + n.box.height).toBeLessThanOrEqual(vb.y + vb.height);
    }
  });
  it("a rect node's box is its translate plus its rect", () => {
    // flowchart-harbor_api-0: translate(242.3671875, 84.75), rect x=-60.2890625 y=-24.5 120.578125x49
    expect(nodes.find((n) => n.id === "harbor_api")!.box).toEqual({ x: 182.078125, y: 60.25, width: 120.578125, height: 49 });
  });
  it("a cylinder's box (arcs) holds its top and bottom ellipses", () => {
    const db = nodes.find((n) => n.id === "harbor_db")!.box;
    // translate(386.9453125, 158.97…) + path translate(-39.2890625, -31.97…); width 2 * 39.2890625
    expect(db.x).toBeCloseTo(347.65625, 3);
    expect(db.width).toBeCloseTo(78.578125, 3);
    expect(db.y).toBeCloseTo(126.9967, 3);
    expect(db.height).toBeCloseTo(63.9489, 3);
  });
  it("no two boxes overlap", () => {
    for (const a of nodes) for (const b of nodes) {
      if (a === b) continue;
      const apart = a.box.x + a.box.width <= b.box.x || b.box.x + b.box.width <= a.box.x || a.box.y + a.box.height <= b.box.y || b.box.y + b.box.height <= a.box.y;
      expect(apart, `${a.id} / ${b.id}`).toBe(true);
    }
  });
  it("reading order: top to bottom, left to right in a row", () => {
    expect(readingOrder(nodes).map((n) => n.id)).toEqual(["web", "harbor_api", "ledger", "harbor_db", "card_gateway", "mail_relay"]);
  });
  it("as percentages of the viewBox, the layer's geometry", () => {
    const vb = viewBoxOf(tree)!;
    expect(boxPercent({ x: -12, y: -12, width: vb.width / 2, height: vb.height / 4 }, vb)).toEqual({ left: "0%", top: "0%", width: "50%", height: "25%" });
  });
});

describe("FR-5: node ids, transforms, paths", () => {
  it("reads flowchart-<id>-<n>, with or without an svg-id prefix", () => {
    expect(nodeIdOf("flowchart-harbor_api-0")).toBe("harbor_api");
    expect(nodeIdOf("my-svg-flowchart-harbor_api-12")).toBe("harbor_api");
    expect(nodeIdOf("harbor")).toBeNull();
    expect(nodeIdOf("L_web_harbor_api_0_0")).toBeNull();
  });
  it("composes nested transforms, scale included", () => {
    const t = parseXml('<svg viewBox="0 0 100 100"><g transform="translate(10,10) scale(2)"><g class="node" id="flowchart-a-0" transform="translate(5 5)"><rect x="-1" y="-1" width="2" height="2"/></g></g></svg>').children[0];
    expect(drawnNodes(t as never)).toEqual([{ id: "a", elementId: "flowchart-a-0", box: { x: 18, y: 18, width: 4, height: 4 }, corner: null }]);
  });
  it("relative path commands and curves count their control points", () => {
    expect(pathPoints("M1 1 l2 0 v3 h-2 z")).toEqual([[1, 1], [3, 1], [3, 4], [1, 4]]);
    expect(pathPoints("M0 0 C 0 -5, 10 -5, 10 0")).toEqual([[0, 0], [0, -5], [10, -5], [10, 0]]);
  });
  it("a node drawn twice under one id counts once", () => {
    const t = parseXml('<svg><g class="node" id="flowchart-a-0"><rect width="2" height="2"/></g><g class="node" id="flowchart-a-1"><rect width="2" height="2"/></g></svg>').children[0];
    expect(drawnNodes(t as never).map((n) => n.elementId)).toEqual(["flowchart-a-0"]);
  });
});

describe("FR-5: names, the roving set, the lens", () => {
  const node = (over: Partial<MapNode>): MapNode => ({ id: "harbor_api", label: "harbor-api", kind: "container", status: "exists", grounding: [{ kind: "repo", ref: "harbor-api@def7c12" }], ...over });
  it("names a node <label>, <kind>, <status>", () => {
    expect(nodeName(node({}))).toBe("harbor-api, container, exists");
    expect(nodeName(node({ status: "ruled" }))).toBe("harbor-api, container, ruled");
  });
  it("says not grounded when its grounding is empty (M4)", () => {
    expect(nodeName(node({ grounding: [] }))).toBe("harbor-api, container, exists, not grounded");
    expect(nodeName(node({ kind: null, status: null, grounding: [] }))).toBe("harbor-api, kind unknown, status unknown, not grounded");
  });
  it("arrows step in reading order and stop at the ends; Home and End jump", () => {
    expect(rovingStep(3, 0, "ArrowRight")).toBe(1);
    expect(rovingStep(3, 0, "ArrowDown")).toBe(1);
    expect(rovingStep(3, 2, "ArrowRight")).toBe(2);
    expect(rovingStep(3, 0, "ArrowLeft")).toBe(0);
    expect(rovingStep(3, 2, "ArrowUp")).toBe(1);
    expect(rovingStep(3, 1, "Home")).toBe(0);
    expect(rovingStep(3, 1, "End")).toBe(2);
    expect(rovingStep(3, 1, "Enter")).toBeNull();
    expect(rovingStep(0, 0, "ArrowRight")).toBeNull();
  });
  it("a lens adds classes on node elements and moves nothing (M6)", () => {
    const tree = sanitizeMapTree(harbor, "map-svg-1");
    const lensed = withNodeClasses(tree, { harbor_api: ["map-ruled"], web: ["map-ungrounded", "bad\"class"] });
    const out = serialize(lensed);
    expect(out).toContain('<g class="node default map-ruled" id="flowchart-harbor_api-0" transform="translate(242.3671875, 84.75)">');
    expect(out).toContain('<g class="node default map-ungrounded" id="flowchart-web-3"');
    expect(out).not.toContain("bad");
    expect(drawnNodes(lensed)).toEqual(drawnNodes(tree));
    expect(out.replace(/ map-ruled| map-ungrounded/g, "")).toBe(serialize(tree));
    expect(serialize(tree)).not.toContain("map-ruled");
    expect(withNodeClasses(tree, {})).toBe(tree);
  });
});

describe("scopeCss", () => {
  it("scopes inside @media, keeps keyframes, drops other at-rules (@font-face too)", () => {
    expect(scopeCss("@charset 'x';@media (min-width:1px){a{b:c}}@keyframes k{from{o:0}}@font-face{src:url(http://x/f)}@page{x:y}", "#s"))
      .toBe("@media (min-width:1px){#s a{b:c}}@keyframes k{from{o:0}}");
  });
});

// leftovers-67 V1 (FR-1, M8; map-and-roadmap Amendment 3, U2): the figure
// scales to fit only while its smallest text draws at 11 px or more.
describe("V1: the legible floor", () => {
  const tree = sanitizeMapTree(harbor, "map-svg-v1");
  const vb = viewBoxOf(tree)!;
  it("the harbor L2's smallest drawn text is 14 px: the 12 px tooltip and 18 px title rules size nothing drawn", () => {
    expect(smallestTextSize(tree)).toBe(14);
    expect(floorScale(14)).toBeCloseTo(11 / 14, 10);
  });
  it("16 px labels give Aglaea's floor, 0.6875; an attribute, a style and an em size count, the smallest wins", () => {
    const svg = (body: string) => sanitizeMapTree(`<svg id="s" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><style>#s{font-size:16px}#s .small{font-size:0.75em}</style>${body}</svg>`, "x");
    expect(floorScale(smallestTextSize(svg('<text>a</text>')))).toBe(0.6875);
    expect(smallestTextSize(svg('<text>a</text><text font-size="10">b</text>'))).toBe(10);
    expect(smallestTextSize(svg('<g style="font-size:13px"><text>a</text></g>'))).toBe(13);
    expect(smallestTextSize(svg('<g class="small"><text>a</text></g>'))).toBe(12);
    expect(smallestTextSize(svg('<text font-size="6"> </text><text>b</text>'))).toBe(16);
    expect(smallestTextSize(svg('<rect width="1" height="1"/>'))).toBeNull();
    expect(floorScale(null)).toBe(0);
  });
  it("scale = max(fit, 11 ÷ smallest): fitted while wide enough, held at the floor past it, never under 11 px", () => {
    const floor = 11 / 14;
    expect(figureScale(vb.width * 2, vb.width, 14)).toBe(1);
    expect(figureScale(650, vb.width, 14)).toBeCloseTo(650 / vb.width, 10);
    expect(figureScale(400, vb.width, 14)).toBeCloseTo(floor, 10);
    for (let w = 120; w <= 1600; w += 10) expect(figureScale(w, vb.width, 14) * 14).toBeGreaterThanOrEqual(FLOOR_PX - 1e-9);
    // past the floor the figure is wider than its column: the frame scrolls
    expect(vb.width * figureScale(400, vb.width, 14)).toBeGreaterThan(400);
    // a drawing whose smallest text is under 11 px at its own size draws larger than drawn
    expect(figureScale(vb.width * 2, vb.width, 9)).toBeCloseTo(11 / 9, 10);
  });
});

describe("FR-3 (M10): a ruled node's button name carries its record", () => {
  it("`<label>, <kind>, ruled NNNN` with the record MapView passes; a ruled node with no record reads ruled", () => {
    expect(nodeName({ id: "ledger", label: "harbor-ledger", kind: "container", status: "ruled", grounding: [{ kind: "record", ref: "2" }], ruledBy: "0002" })).toBe("harbor-ledger, container, ruled 0002");
    expect(nodeName({ id: "x", label: "x", kind: "container", status: "ruled", grounding: [{ kind: "repo", ref: "x@1" }], ruledBy: null })).toBe("x, container, ruled");
    expect(nodeName({ id: "m", label: "Mail relay", kind: null, status: null, grounding: [] })).toBe("Mail relay, kind unknown, status unknown, not grounded");
  });
});
