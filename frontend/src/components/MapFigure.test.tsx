import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import harbor from "../lib/testdata/harbor-containers.svg?raw";
import type { MapNode } from "../lib/mapSvg";
import { MapFigureView, type MapState } from "./MapFigure";

// FR-4 and FR-5 (leftovers-58) at the figure: what it draws in each state,
// rendered to markup (no DOM library here). The drawing is the fixture's L2
// as the app renders it; the nodes are the contract's containers level.

const g = (kind: string, ref: string) => [{ kind, ref }];
const nodes: MapNode[] = [
  { id: "card_gateway", label: "Card gateway", kind: "external", status: "exists", grounding: g("deploy", "harbor-api/deploy/k8s.yaml key CARD_GATEWAY_URL") },
  { id: "harbor_api", label: "harbor-api", kind: "container", status: "exists", grounding: g("repo", "harbor-api@def7c12") },
  { id: "harbor_db", label: "harbor_db", kind: "store", status: "exists", grounding: g("deploy", "harbor-api/deploy/k8s.yaml key API_DB_HOST") },
  { id: "ledger", label: "harbor-ledger", kind: "container", status: "ruled", grounding: g("record", "0012"), ruledBy: "0012" },
  { id: "mail_relay", label: "Mail relay", kind: "external", status: "exists", grounding: [] },
  { id: "web", label: "harbor-web", kind: "container", status: "retiring", grounding: g("repo", "harbor-web@6c88101") },
];

const view = (st: MapState, over: Partial<Parameters<typeof MapFigureView>[0]> = {}) =>
  renderToStaticMarkup(<MapFigureView initiative="harbor" level="containers" source="flowchart LR" nodes={nodes} st={st} {...over} />);
const drawn: MapState = { state: "drawn", svg: harbor };
const buttons = (html: string) => [...html.matchAll(/<button[^>]*>/g)].map((m) => m[0]);
const attr = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];

describe("FR-4: the figure", () => {
  const html = view(drawn);
  it("is one figure named <initiative> base map, <level>", () => {
    expect(html).toMatch(/^<figure class="map-figure" aria-label="harbor base map, containers"/);
    expect(html.match(/aria-label="harbor base map/g)).toHaveLength(1);
  });
  it("inlines the drawing sanitized and aria-hidden: no foreignObject, script, on* or external href", () => {
    expect(html).toMatch(/<svg id="map-svg-\d+"[^>]*aria-hidden="true"/);
    expect(html).not.toMatch(/foreignObject|<script|\son\w+=|href="(?!#)/i);
    expect(html.match(/class="nodeLabel map-label"/g)).toHaveLength(6);
  });
  it("the drawing holds nothing focusable; the buttons sit outside it", () => {
    const svg = html.slice(html.indexOf("<svg"), html.indexOf("</svg>"));
    expect(svg).not.toMatch(/tabindex|<button|<a[\s>]/i);
    expect(html.indexOf("</svg>")).toBeLessThan(html.indexOf("<button"));
  });
  it("while drawing, says so; a failed draw says why; never an empty box", () => {
    expect(view({ state: "drawing" })).toBe('<div class="map-figure"><p class="map-figure-state ">Drawing the map…</p></div>');
    expect(view({ state: "failed", reason: "mmdc not found" })).toBe('<div class="map-figure"><p class="map-figure-state failed" role="status">Map not drawn: mmdc not found</p></div>');
    expect(view({ state: "drawn", svg: "<div>no</div>" })).toContain("Map not drawn: the drawing could not be read (not an SVG drawing)");
  });
});

describe("FR-5: a real button over each node", () => {
  const html = view(drawn);
  const bs = buttons(html);
  it("one button per drawn node, in reading order, named <label>, <kind>, <status>", () => {
    expect(bs.map((b) => attr(b, "aria-label"))).toEqual([
      "harbor-web, container, retiring",
      "harbor-api, container, exists",
      "harbor-ledger, container, ruled 0012",
      "harbor_db, store, exists",
      "Card gateway, external, exists",
      "Mail relay, external, exists, not grounded",
    ]);
    for (const b of bs) expect(b).toMatch(/^<button type="button" class="map-node"/);
  });
  it("is one roving set: the first is the Tab stop, the rest -1", () => {
    expect(bs.map((b) => attr(b, "tabindex"))).toEqual(["0", "-1", "-1", "-1", "-1", "-1"]);
  });
  it("the stop follows `current` when it is drawn", () => {
    expect(buttons(view(drawn, { current: "harbor_db" })).map((b) => attr(b, "tabindex"))).toEqual(["-1", "-1", "-1", "0", "-1", "-1"]);
    expect(buttons(view(drawn, { current: "nowhere" })).map((b) => attr(b, "tabindex"))[0]).toBe("0");
  });
  it("each button sits over its node's box as percentages of the viewBox, so it follows the scale", () => {
    const api = bs.find((b) => attr(b, "data-node") === "harbor_api")!;
    // box 182.078125,60.25 120.578125x49 in viewBox -12 -12 688.5288696289062 324.9422302246094
    expect(attr(api, "style")).toContain("left:28.1874%;top:22.2347%;width:17.5124%;height:15.0796%");
    expect(html).toContain('style="position:relative;width:100%;min-width:540.99px;max-width:688.53px;aspect-ratio:688.5288696289062 / 324.9422302246094"');
  });
  it("natural fit keeps the drawn size, for a frame that scrolls", () => {
    expect(view(drawn, { fit: "natural" })).toContain('style="position:relative;width:688.5288696289062px;height:324.9422302246094px"');
  });
  it("a node map.json lists but the drawing lacks, or one drawn but not listed, gets no button", () => {
    const some = [...nodes.filter((n) => n.id !== "web"), { id: "ghost", label: "ghost", kind: "container", status: "exists", grounding: [] }];
    expect(buttons(view(drawn, { nodes: some })).map((b) => attr(b, "data-node"))).toEqual(["harbor_api", "ledger", "harbor_db", "card_gateway", "mail_relay"]);
  });
});

describe("FR-5: a lens is classes on the node elements; no node moves", () => {
  it("adds the lens's classes to the node elements and leaves the buttons where they were", () => {
    const plain = view(drawn);
    const lensed = view(drawn, { classes: { ledger: ["map-ruled"], mail_relay: ["map-ungrounded"] } });
    expect(lensed).toContain('<g class="node default map-ruled" id="flowchart-ledger-2"');
    expect(lensed).toContain('<g class="node default map-ungrounded" id="flowchart-mail_relay-5"');
    expect(buttons(lensed)).toEqual(buttons(plain));
    expect(lensed.replace(/ map-ruled| map-ungrounded/g, "").replace(/map-svg-\d+/g, "")).toBe(plain.replace(/map-svg-\d+/g, ""));
  });
});
