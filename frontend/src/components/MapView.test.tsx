import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import harborSvg from "../lib/testdata/harbor-containers.svg?raw";
import harborMap from "../../../testdata/fixture-map/harbor/docs/architecture/map.json";
import ruledMap from "../../../testdata/fixture-map/harbor-ruled/docs/architecture/map.json";
import ungroundedMap from "../../../testdata/fixture-map/harbor-ungrounded/docs/architecture/map.json";
import roadmapSrc from "./RoadmapView.tsx?raw";
import { read as readSheet, parseCompound, winners } from "./stateLayer.kit";
import type { merge, service } from "../../wailsjs/go/models";
// @ts-expect-error node:fs has no type declarations in this tsconfig (as stateLayer.kit)
import { existsSync, readFileSync } from "node:fs";

// leftovers-58 FR-6 to FR-9 at the lens, headless: the states, the level
// walk, the lens classes, the panel's lines and what each line runs,
// against mocked bindings. Vitest runs in Node with no DOM library, so the
// views are rendered to markup; the figure, the drawer and the editor are
// checked in the review build (M1-M7, progress.md).

const openInEditor = vi.fn(async (_p: string) => undefined);
const readSpec = vi.fn(async (_i: string, p: string) => ({ path: p, text: "# context", missing: false }));
vi.mock("../hooks/useWails", () => ({ api: { openInEditor: (p: string) => openInEditor(p) } }));
vi.mock("../../wailsjs/go/main/App", () => ({
  Map: vi.fn(),
  RenderDiagram: vi.fn(() => new Promise(() => undefined)),
  ReadSpec: (i: string, p: string) => readSpec(i, p),
}));
vi.mock("../../wailsjs/runtime/runtime", () => ({ BrowserOpenURL: vi.fn() }));

const { MapBody, inReadingOrder, NO_MAP, NO_L3, READING_MAP, firstPlace, nodesAt, drillOf, trailOf, lensClasses, tagOf, placeName, restorePlace, figureNodes } = await import("./MapView");
const { useBoard } = await import("../stores/board.store");
const { MapPanel, groundLine, groundCtx, runGround, statusWords, ruledBy } = await import("./MapPanel");
const { MapFigureView } = await import("./MapFigure");
const { useSpecReader } = await import("./SpecReader");

const sourceOf = (m: service.C4Map) =>
  (m.levels ?? []).map((l) => ({ level: l.level, page: l.page, container: l.container, source: `flowchart LR %% ${l.level}` }));
const drawn = (m: unknown): service.MapResult => ({ state: "drawn", index: m as service.C4Map, levels: sourceOf(m as service.C4Map) }) as service.MapResult;

const mapCss = readSheet("map.css");
const ROOT = "/fx/harbor";
const init = (over: Partial<merge.BoardInitiative> = {}) => ({
  id: "harbor", path: ROOT, local: true, machine: "fixture", spec_files: {}, repos_state: [],
  decisions: [
    { number: "0001", path: `${ROOT}/working-on/decisions/0001-harbor-is-one-system.md`, title: "Harbor is one system", body: "one" },
    { number: "0002", path: `${ROOT}/working-on/decisions/0002-ledger-is-its-own-container.md`, title: "Ledger is its own container", body: "two" },
  ],
  ...over,
}) as unknown as merge.BoardInitiative;

const body = (read: Parameters<typeof MapBody>[0]["read"], i = init()) => renderToStaticMarkup(<MapBody initiative={i} read={read} />);
const text = (html: string) => html.replace(/<[^>]+>/g, "\n").split("\n").map((s) => s.trim()).filter(Boolean);

afterEach(() => {
  useSpecReader.setState({ initiative: null, stack: [], missing: {} });
  useBoard.setState({ mapPlace: {} });
  openInEditor.mockClear();
  readSpec.mockClear();
});

describe("FR-6: Map on Roadmap's switch", () => {
  it("the switch reads Stages, Map, Cards, Calendar, and Map mounts MapView", () => {
    expect(roadmapSrc).toContain('(["stages", "map", "cards", "calendar"] as const)');
    expect(roadmapSrc).toMatch(/mode === "map"\) return <MapView initiative=\{selected\} head=\{modes\} \/>/);
  });
  it("opens on the containers level (L2), with the trail Context › Containers", () => {
    const r = drawn(harborMap);
    expect(firstPlace(r)).toEqual({ level: "containers" });
    expect(trailOf(r, { level: "containers" }).map((t) => t.label)).toEqual(["Context", "Containers"]);
    const html = body(r);
    expect(html).toContain('<nav class="map-trail" aria-label="Map level">');
    expect(html).toContain('<span aria-current="location" class="map-trail-here">Containers</span>');
    expect(html).toContain('class="linkish map-trail-go">Context</button>');
    expect(html).toContain("Drawing the map…");
  });
  it("draws only the level's nodes; L3 only its container's modules", () => {
    const m = harborMap as unknown as service.C4Map;
    expect(nodesAt(m, { level: "containers" }).map((n) => n.id)).toEqual(["card_gateway", "harbor_api", "harbor_db", "ledger", "mail_relay", "web"]);
    expect(nodesAt(m, { level: "modules", container: "harbor_api" }).map((n) => n.id)).toEqual(["harbor_api__booking", "harbor_api__pricing"]);
    expect(nodesAt(m, { level: "modules", container: "ledger" })).toEqual([]);
  });
  it("a container with modules opens L3 with a trail back; one without says so", () => {
    const r = drawn(harborMap);
    const m = r.index!;
    const node = (id: string) => m.nodes.find((n) => n.id === id && n.level === "containers")!;
    expect(drillOf(r, { level: "containers" }, node("harbor_api"))).toEqual({ to: { level: "modules", container: "harbor_api" }, label: "Open harbor-api's modules" });
    expect(drillOf(r, { level: "containers" }, node("ledger"))).toEqual({ none: NO_L3 });
    expect(NO_L3).toBe("No module map for this container.");
    expect(drillOf(r, { level: "containers" }, node("card_gateway"))).toBeNull();
    const sys = m.nodes.find((n) => n.id === "harbor" && n.level === "context")!;
    expect(drillOf(r, { level: "context" }, sys)).toEqual({ to: { level: "containers" }, label: "Open Harbor ferry-ticket shop's containers".replace("Harbor ferry-ticket shop", sys.label) });
    const l3 = { level: "modules", container: "harbor_api" };
    expect(trailOf(r, l3).map((t) => t.label)).toEqual(["Context", "Containers", "harbor-api"]);
    expect(placeName(m, l3)).toBe("Modules of harbor-api");
  });
});

describe("FR-7: status and drift as lens classes", () => {
  const ruled = (ruledMap as unknown as service.C4Map).nodes.filter((n) => n.level === "containers");
  const ungr = (ungroundedMap as unknown as service.C4Map).nodes.filter((n) => n.level === "containers");
  it("ruled and retiring get their class; exists none", () => {
    expect(lensClasses(ruled, null)).toEqual({ ledger: ["map-ruled"], web: ["map-retiring"] });
  });
  it("an ungrounded node is map-ungrounded; the picked node is marked", () => {
    expect(lensClasses(ungr, "web")).toEqual({ mail_relay: ["map-ungrounded"], web: ["map-picked"] });
  });
  it("the words under a node: ruled NNNN, retiring, not grounded", () => {
    const by = (ns: service.C4Node[], id: string) => ns.find((n) => n.id === id)!;
    expect(tagOf(by(ruled, "ledger"))).toBe("ruled 0002");
    expect(tagOf(by(ruled, "web"))).toBe("retiring");
    expect(tagOf(by(ruled, "harbor_api"))).toBeNull();
    expect(tagOf(by(ungr, "mail_relay"))).toBe("not grounded");
    expect(ruledBy(by(ruled, "ledger"))).toBe("0002");
  });
  it("the classes land on the drawn node elements and nothing else changes (no node moves)", () => {
    const nodes = ruled.map((n) => ({ id: n.id, label: n.label, kind: n.kind ?? null, status: n.status ?? null, grounding: n.grounding }));
    const plain = renderToStaticMarkup(<MapFigureView initiative="harbor-ruled" level="containers" source="x" nodes={nodes} st={{ state: "drawn", svg: harborSvg }} />);
    const lens = renderToStaticMarkup(<MapFigureView initiative="harbor-ruled" level="containers" source="x" nodes={nodes} classes={lensClasses(ruled, null)} st={{ state: "drawn", svg: harborSvg }} />);
    expect(lens).toMatch(/<g class="node default map-ruled" id="flowchart-ledger-\d+"/);
    expect(lens).toMatch(/<g class="node default map-retiring" id="flowchart-web-\d+"/);
    const strip = (h: string) => h.replace(/ map-(ruled|retiring)/g, "").replace(/map-svg-\d+/g, "map-svg-N");
    expect(strip(lens)).toBe(plain.replace(/map-svg-\d+/g, "map-svg-N"));
  });
  it("the node's name carries not grounded (MapFigure's names)", () => {
    const nodes = ungr.map((n) => ({ id: n.id, label: n.label, kind: n.kind ?? null, status: n.status ?? null, grounding: n.grounding }));
    const html = renderToStaticMarkup(<MapFigureView initiative="harbor-ungrounded" level="containers" source="x" nodes={nodes} st={{ state: "drawn", svg: harborSvg }} />);
    expect(html).toContain('aria-label="Mail relay, kind unknown, status unknown, not grounded"');
  });
  it("map.css: dashed ruled, muted retiring, dotted ungrounded, the ring on the node button; no oklch, color-mix, nesting or @layer", () => {
    expect(mapCss).toMatch(/\.node\.map-ruled \.label-container,\n[^{]*\.node\.map-ruled \.label-container path\[fill="none"\] \{[^}]*stroke-dasharray: 6 4 !important/);
    expect(mapCss).toMatch(/\.node\.map-retiring text \{ fill: var\(--fg-muted\) !important/);
    expect(mapCss).toMatch(/\.node\.map-ungrounded \.label-container,\n[^{]*\.node\.map-ungrounded \.label-container path\[fill="none"\] \{[^}]*stroke-dasharray: 1\.5 3\.5 !important/);
    expect(mapCss).toMatch(/button\.map-node:focus-visible \{ outline: 2px solid var\(--focus-ring\)/);
    const rules = mapCss.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(rules).not.toMatch(/oklch|color-mix|@layer|--(plum|violet|lilac|red|amber|indigo)-\d/);
    expect(rules).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(rules.replace(/@media[^{]*\{/g, "")).not.toMatch(/\{[^}]*\{/); // no nesting
  });
});

describe("FR-8: the panel, the map as text", () => {
  const m = ruledMap as unknown as service.C4Map;
  const level = nodesAt(m, { level: "containers" });
  const panel = (picked: string | null, i = init(), drill: Parameters<typeof MapPanel>[0]["drill"] = null) =>
    renderToStaticMarkup(<MapPanel initiative={i} index={m} nodes={level} levelName="Containers" picked={level.find((n) => n.id === picked) ?? null} pick={() => undefined} drill={drill} />);

  it("with nothing picked, lists every node with its words", () => {
    const t = text(panel(null));
    expect(t.slice(0, 2)).toEqual(["Containers", "6 nodes. Pick one for its grounding."]);
    expect(t).toContain("harbor-ledger");
    expect(t).toContain("container · ruled 0002");
    expect(t).toContain("container · retiring");
  });
  it("a node ends with Grounding, one line per entry", () => {
    const t = text(panel("harbor_api"));
    expect(t.slice(t.indexOf("Grounding"))).toEqual([
      "Grounding",
      "repo", "harbor-api@def7c12", "not on this machine: harbor-api is not in this initiative&#x27;s repos",
      "deploy", "harbor-api/deploy/k8s.yaml", "not on this machine: harbor-api is not in this initiative&#x27;s repos",
    ]);
  });
  it("a ruled node's status is ruled NNNN, a button opening the record in the drawer", () => {
    const html = panel("ledger");
    expect(html).toContain('<button type="button" class="linkish map-ruled-link" title="Open record 0002">ruled 0002</button>');
    expect(text(html)).toContain("record");
  });
  it("an ungrounded node says not grounded in its title and its Grounding", () => {
    const u = ungroundedMap as unknown as service.C4Map;
    const ns = nodesAt(u, { level: "containers" });
    const html = renderToStaticMarkup(<MapPanel initiative={init()} index={u} nodes={ns} levelName="Containers" picked={ns.find((n) => n.id === "mail_relay")!} pick={() => undefined} drill={null} />);
    expect(html).toContain('Mail relay<span class="map-panel-drift">, not grounded</span></h3>');
    expect(html).toContain("not grounded: no evidence names this node.");
    expect(statusWords(ns.find((n) => n.id === "mail_relay")!)).toEqual(["status unknown", "not grounded"]);
  });
  it("a container without modules says so; with modules offers the level", () => {
    expect(panel("ledger", init(), { none: NO_L3 })).toContain(`<p class="map-panel-meta map-no-l3">${NO_L3}</p>`);
    expect(panel("harbor_api", init(), { label: "Open harbor-api's modules", go: () => undefined })).toContain('<button type="button" class="map-drill">Open harbor-api&#x27;s modules</button>');
  });
});

describe("FR-8: each grounding line, its action or why it has none", () => {
  const withRepos = init({
    repos_state: [
      { name: "harbor-api", path: `${ROOT}/harbor-api`, missing: false },
      { name: "harbor-web", path: `${ROOT}/harbor-web`, missing: true },
    ] as merge.BoardInitiative["repos_state"],
  });
  const ctx = groundCtx(withRepos, (harborMap as unknown as service.C4Map).inputs);
  const bare = groundCtx(init(), (harborMap as unknown as service.C4Map).inputs);
  const line = (kind: string, ref: string, c = ctx) => { const l = groundLine({ kind, ref } as service.C4Evidence, c); return { word: l.word, ref: l.ref, mono: l.mono, act: l.act, reason: l.reason }; };

  it("repo <name>@<sha>: mono, opens the editor at the repo", () => {
    expect(line("repo", "harbor-api@def7c12")).toEqual({ word: "repo", ref: "harbor-api@def7c12", mono: true, act: { to: "editor", path: `${ROOT}/harbor-api` }, reason: undefined });
    expect(line("repo", "harbor-api/src/booking").act).toEqual({ to: "editor", path: `${ROOT}/harbor-api/src/booking` });
  });
  it("a repo not on this machine is a line with the reason and no press", () => {
    expect(line("repo", "harbor-ledger@0989d68")).toMatchObject({ act: null, reason: "not on this machine: harbor-ledger is not in this initiative's repos" });
    expect(line("repo", "harbor-web@6c88101")).toMatchObject({ act: null, reason: "not on this machine: harbor-web has no checkout here" });
    expect(line("repo", "harbor-api@def7c12", bare)).toMatchObject({ act: null, reason: "not on this machine: harbor-api is not in this initiative's repos" });
  });
  it("deploy <path> opens the file; a key after it is not part of the path; an adapter's reference has no press", () => {
    expect(line("deploy", "harbor-api/deploy/k8s.yaml key API_DB_HOST").act).toEqual({ to: "editor", path: `${ROOT}/harbor-api/deploy/k8s.yaml` });
    expect(line("deploy", "infra/k8s.yaml").act).toEqual({ to: "editor", path: `${ROOT}/infra/k8s.yaml` });
    expect(line("deploy", "fakedeploy qa harbor-ledger")).toMatchObject({ act: null, reason: "not a file: the deploy adapter's own reference" });
    expect(line("deploy", "harbor-api/deploy/k8s.yaml", bare)).toMatchObject({ act: null, reason: "not on this machine: harbor-api is not in this initiative's repos" });
  });
  it("record NNNN opens the record; one the initiative lacks says so", () => {
    expect(line("record", "0002")).toMatchObject({ word: "record", ref: "0002", act: { to: "record", number: "0002" } });
    expect(line("record", "2").act).toEqual({ to: "record", number: "0002" });
    expect(line("record", "0099")).toMatchObject({ act: null, reason: "not among this initiative's decisions" });
  });
  it("curated: <page> opens docs/architecture/<page> in the spec reader, with or without specs: (FR-10)", () => {
    expect(line("curated", "context.md")).toMatchObject({ word: "curated:", act: { to: "spec", path: "docs/architecture/context.md" } });
    expect(line("curated", "context.md", bare)).toMatchObject({ word: "curated:", act: { to: "spec", path: "docs/architecture/context.md" }, reason: undefined });
  });
  it("the committed harbor fixture holds every repo dir and deploy file its grounding names (Amendment 2)", () => {
    const fx = new URL("../../../testdata/fixture-map/harbor", import.meta.url).pathname;
    const yaml = readFileSync(`${fx}/working-on/initiative.yaml`, "utf8") as string;
    const repos = (yaml.match(/^repos: \[(.*)\]$/m)?.[1] ?? "").split(",").map((s: string) => s.trim());
    expect(repos).toEqual(["harbor-api", "harbor-web", "harbor-ledger"]);
    const live = groundCtx(init({ repos_state: repos.map((name: string) => ({ name, path: `${fx}/${name}`, missing: false })) as merge.BoardInitiative["repos_state"] }), (harborMap as unknown as service.C4Map).inputs);
    const kinds = new Set<string>();
    for (const n of (harborMap as unknown as service.C4Map).nodes ?? []) for (const e of n.grounding ?? []) {
      const l = groundLine(e, live);
      if (l.act?.to === "editor") { expect(existsSync(l.act.path), l.act.path).toBe(true); kinds.add(e.kind); }
      else if (l.act) kinds.add(e.kind);
      else expect(l.reason, `${e.kind} ${e.ref}`).toBe("not a file: the deploy adapter's own reference");
    }
    expect([...kinds].sort()).toEqual(["curated", "deploy", "record", "repo"]);
  });
  it("a kind that names nothing to open is plain text, no reason", () => {
    expect(line("pipeline", "ci/build")).toMatchObject({ word: "pipeline", act: null, reason: undefined });
  });
  it("a line with no action renders no button; one with an action is a button", () => {
    const m = harborMap as unknown as service.C4Map;
    const ns = nodesAt(m, { level: "containers" });
    const html = renderToStaticMarkup(<MapPanel initiative={withRepos} index={m} nodes={ns} levelName="Containers" picked={ns.find((n) => n.id === "harbor_db")!} pick={() => undefined} drill={null} />);
    expect(html).toContain('<li class="map-ground-line" data-kind="deploy"><span class="map-ground-off"><span class="map-ground-kind">deploy</span> <span class="mono">fakedeploy qa harbor-ledger</span></span><span class="map-ground-why">not a file: the deploy adapter&#x27;s own reference</span></li>');
    expect(html).toContain('<button type="button" class="linkish map-ground-act" title="Open /fx/harbor/harbor-api/deploy/k8s.yaml in the editor">');
  });
});

describe("FR-8: what a line runs (mocked bindings)", () => {
  beforeEach(() => useSpecReader.setState({ initiative: null, stack: [], missing: {} }));
  const i = init();
  it("repo and deploy run OpenInEditor with the path, nothing else", async () => {
    await runGround({ to: "editor", path: `${ROOT}/harbor-api` }, null, i);
    expect(openInEditor.mock.calls).toEqual([[`${ROOT}/harbor-api`]]);
    expect(useSpecReader.getState().stack).toEqual([]);
  });
  it("record opens the record in the drawer, root-relative, with its body", async () => {
    await runGround({ to: "record", number: "0002" }, null, i);
    const s = useSpecReader.getState();
    expect(s.initiative).toBe("harbor");
    expect(s.stack).toEqual([{ kind: "record", path: "working-on/decisions/0002-ledger-is-its-own-container.md", section: "", text: "two", number: "0002", title: "Ledger is its own container" }]);
    expect(openInEditor).not.toHaveBeenCalled();
  });
  it("curated opens the page through ReadSpec into the drawer", async () => {
    await runGround({ to: "spec", path: "docs/architecture/context.md" }, null, i);
    expect(readSpec.mock.calls).toEqual([["harbor", "docs/architecture/context.md"]]);
    expect(useSpecReader.getState().stack.map((e) => [e.kind, e.path])).toEqual([["spec", "docs/architecture/context.md"]]);
  });
});

describe("FR-9, FR-2, FR-3: the states", () => {
  it("reading", () => {
    expect(text(body({ state: "reading" }))).toEqual([READING_MAP]);
  });
  it("no map.json: the empty state's two lines and no action", () => {
    const html = body({ state: "empty" } as service.MapResult);
    expect(text(html)).toEqual(["No base map yet.", "Daedalus makes one with c4-map gen; the FSE cuts the card."]);
    expect([...NO_MAP]).toEqual(text(html));
    expect(html).not.toContain("<button");
  });
  it("a refusal shows the reader's line as given", () => {
    for (const line of ["Map not drawn: map.json is c4-map/2; this Deltagos reads c4-map/1", "Map not drawn: the map is read on odyssey"]) {
      const html = body({ state: "refused", refused: line } as service.MapResult);
      expect(text(html)).toEqual([line]);
      expect(html).toContain('role="status"');
    }
  });
  it("a Go error reads Map not drawn: <reason>", () => {
    expect(text(body({ state: "error", reason: "no initiative x on this machine" }))).toEqual(["Map not drawn: no initiative x on this machine"]);
  });
  it("the figure's own drawing state shows while it draws (MapFigure's words)", () => {
    expect(body(drawn(harborMap))).toContain('<p class="map-figure-state ">Drawing the map…</p>');
  });
});

describe("round 2: U1, U4, U5", () => {
  it("U1: the panel's actions draw in --accent-fg over button.linkish { color: inherit }", () => {
    for (const k of ["map-ground-act", "map-panel-node", "map-ruled-link"]) {
      const t = { parts: [parseCompound(`button.linkish.${k}`)], hover: false };
      expect(winners(t, "color").map((w) => w.v), k).toEqual(["var(--accent-fg)"]);
    }
  });
  it("U4: the drawing is a block (no baseline gap) and the scroller keeps room for the bottom row's words", () => {
    expect(mapCss).toMatch(/\.map-figure-svg > svg \{ display: block; \}/);
    expect(mapCss).toMatch(/\.map-scroll \{ overflow: auto; padding-bottom: calc\(var\(--line-xs\) \+ var\(--space-0-5\)\);/);
  });
  it("U5: the panel lists nodes in the roving set's order; undrawn ones trail in map.json order", () => {
    const ns = nodesAt(harborMap as unknown as service.C4Map, { level: "containers" });
    const ids = ns.map((n) => n.id);
    expect(inReadingOrder(ns, undefined).map((n) => n.id)).toEqual(ids);
    const drawnOrder = ["web", "harbor_api", "ledger", "harbor_db"].filter((x) => ids.includes(x));
    const got = inReadingOrder(ns, drawnOrder).map((n) => n.id);
    expect(got.slice(0, drawnOrder.length)).toEqual(drawnOrder);
    expect(got.slice(drawnOrder.length)).toEqual(ids.filter((x) => !drawnOrder.includes(x)));
  });
});

// leftovers-67 (map-and-roadmap Amendments 3 and 4). V2: the trail, the
// panel's order and the unknown fact; V3: the place kept per initiative.
const harbor = harborMap as unknown as service.C4Map;
const place = (p: Partial<import("../stores/board.store").MapPlace>) => useBoard.getState().setMapPlace("harbor", { level: "containers", picks: {}, containersSeen: true, ...p });
const trailText = (html: string) => text(html.slice(html.indexOf('<nav class="map-trail"'), html.indexOf("</nav>")));

describe("V2: the trail at Context (FR-2, M9)", () => {
  const r = drawn(harborMap);
  it("after Containers → Context it reads Context › harbor containers, the second a button back to Containers", () => {
    expect(trailOf(r, { level: "context" }, true)).toEqual([
      { label: "Context", place: { level: "context" } },
      { label: "harbor containers", place: { level: "containers" } },
    ]);
    place({ level: "context", containersSeen: true });
    const html = body(r);
    expect(trailText(html)).toEqual(["Context", "›", "harbor containers"]);
    expect(html).toContain('<span aria-current="location" class="map-trail-here">Context</span>');
    expect(html).toContain('class="linkish map-trail-go">harbor containers</button>');
  });
  it("with no containers view open before, the trail is drawn and reads Context alone", () => {
    expect(trailOf(r, { level: "context" }).map((t) => t.label)).toEqual(["Context"]);
    place({ level: "context", containersSeen: false });
    expect(trailText(body(r))).toEqual(["Context"]);
  });
  it("going anywhere but Context marks Containers seen; the first place (L2) is seen", () => {
    expect(restorePlace(r, null)).toEqual({ level: "containers", picks: {}, containersSeen: true });
  });
});

describe("V2: the panel's list in the roving set's order (FR-4, M11)", () => {
  it("over the fixture's L2 drawing, the panel lists node for node what the arrows visit", () => {
    const fig = renderToStaticMarkup(<MapFigureView st={{ state: "drawn", svg: harborSvg }} initiative="harbor" level="containers" source="x"
      nodes={nodesAt(harbor, { level: "containers" }).map((n) => ({ id: n.id, label: n.label, kind: n.kind ?? null, status: n.status ?? null, grounding: n.grounding ?? [] }))} />);
    const roving = [...fig.matchAll(/<button[^>]*data-node="([^"]+)"/g)].map((m) => m[1]);
    expect(roving).toHaveLength(6);
    const ns = inReadingOrder(nodesAt(harbor, { level: "containers" }), roving);
    const list = renderToStaticMarkup(<MapPanel initiative={init()} index={harbor} nodes={ns} levelName="Containers" picked={null} pick={() => undefined} drill={null} />);
    expect([...list.matchAll(/class="linkish map-panel-node" data-node="([^"]+)"/g)].map((m) => m[1])).toEqual(roving);
  });
});

describe("V2: an unknown fact reads unknown beside its label (FR-7, M14)", () => {
  it("an ungrounded node's panel: kind  unknown, status  unknown; the list keeps kind unknown", () => {
    const u = ungroundedMap as unknown as service.C4Map;
    const ns = nodesAt(u, { level: "containers" });
    const relay = ns.find((n) => n.id === "mail_relay")!;
    const html = renderToStaticMarkup(<MapPanel initiative={init()} index={u} nodes={ns} levelName="Containers" picked={relay} pick={() => undefined} drill={null} />);
    expect(html).toContain("<dt>kind</dt><dd>unknown</dd>");
    expect(html).toMatch(/<dt>status<\/dt><dd class="map-status map-status-unknown">unknown<\/dd>/);
    expect(html).not.toContain("kind unknown</dd>");
    const list = renderToStaticMarkup(<MapPanel initiative={init()} index={u} nodes={ns} levelName="Containers" picked={null} pick={() => undefined} drill={null} />);
    expect(list).toContain("kind unknown · status unknown · not grounded");
  });
});

describe("V3: the map's place kept per initiative (FR-5, M12)", () => {
  const booking = { level: "modules", container: "harbor_api", picks: { "modules:harbor_api": "harbor_api__booking" }, containersSeen: true };
  it("L3 of harbor-api with booking picked, Map unmounted and mounted again: the same level, pick and trail", () => {
    useBoard.getState().setMapPlace("harbor", booking);
    const first = body(drawn(harborMap));
    const again = body(drawn(harborMap)); // a second mount reads the store, not its own state
    for (const html of [first, again]) {
      expect(trailText(html)).toEqual(["Context", "›", "Containers", "›", "harbor-api"]);
      expect(html).toContain('<span aria-current="location" class="map-trail-here">harbor-api</span>');
      expect(html).toContain('<aside class="map-panel" aria-label="booking: node">');
    }
    expect(useBoard.getState().mapPlace.harbor).toEqual(booking);
  });
  it("kept per initiative: another initiative's place does not move harbor's", () => {
    useBoard.getState().setMapPlace("harbor", booking);
    useBoard.getState().setMapPlace("other", { level: "context", picks: {}, containersSeen: false });
    expect(body(drawn(harborMap))).toContain('aria-label="booking: node"');
  });
  it("a map read again without the picked node drops the pick and keeps the level", () => {
    const without = { ...harbor, nodes: (harbor.nodes ?? []).filter((n) => n.id !== "harbor_api__booking") };
    expect(restorePlace(drawn(without), booking)).toEqual({ level: "modules", container: "harbor_api", picks: {}, containersSeen: true });
    useBoard.getState().setMapPlace("harbor", booking);
    const html = body(drawn(without));
    expect(trailText(html)).toEqual(["Context", "›", "Containers", "›", "harbor-api"]);
    expect(html).toContain('<aside class="map-panel" aria-label="Modules of harbor-api: the map as text">');
  });
  it("a level the map no longer draws falls back to the first place", () => {
    const flat = { ...harbor, levels: (harbor.levels ?? []).filter((l) => l.level !== "modules") };
    expect(restorePlace(drawn(flat), booking)).toMatchObject({ level: "containers", picks: {} });
  });
});

describe("FR-6 (M13): picked is the selected mark, focus the ring", () => {
  it("the picked node's button carries map-node-picked and aria-current; the others neither", () => {
    const fig = renderToStaticMarkup(<MapFigureView st={{ state: "drawn", svg: harborSvg }} initiative="harbor" level="containers" source="x" picked="harbor_api"
      nodes={nodesAt(harbor, { level: "containers" }).map((n) => ({ id: n.id, label: n.label, kind: n.kind ?? null, status: n.status ?? null, grounding: n.grounding ?? [] }))} />);
    const bs = [...fig.matchAll(/<button[^>]*>/g)].map((m) => m[0]);
    expect(bs.filter((b) => b.includes("map-node-picked"))).toEqual([expect.stringContaining('data-node="harbor_api" aria-current="true"')]);
    expect(bs.filter((b) => b.includes("aria-current"))).toHaveLength(1);
  });
  it("map.css: picked fills --surface-selected under the label with a 2 px --accent edge inset on the button; focus stays the violet-11 ring 2 px outside", () => {
    expect(mapCss).toContain(".map-figure-nodes button.map-node.map-node-picked { box-shadow: inset 0 0 0 2px var(--accent); transition: none; }");
    expect(mapCss).toContain(".map-figure-nodes button.map-node:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }");
    expect(mapCss).toMatch(/\.node\.map-picked \.label-container path:not\(\[fill="none"\]\) \{ fill: var\(--surface-selected\) !important; \}/);
    expect(mapCss).not.toMatch(/map-picked[^{]*\{[^}]*stroke/);
  });
});

describe("FR-1 (M8): the scroller's edges", () => {
  it("each side with figure hidden past it carries 1 px --fg-subtle; none when it fits", () => {
    expect(mapCss).toContain("border-left: 1px solid transparent; border-right: 1px solid transparent;");
    expect(mapCss).toContain(".map-scroll.edge-left { border-left-color: var(--fg-subtle); }");
    expect(mapCss).toContain(".map-scroll.edge-right { border-right-color: var(--fg-subtle); }");
  });
});

describe("FR-3 (M10): the word under a node is in its button's name", () => {
  it("harbor-ruled's ledger button is named harbor-ledger, container, ruled 0002", async () => {
    const { nodeName } = await import("../lib/mapSvg");
    const ns = figureNodes(nodesAt(ruledMap as unknown as service.C4Map, { level: "containers" }));
    expect(nodeName(ns.find((n) => n.id === "ledger")!)).toBe("harbor-ledger, container, ruled 0002");
    expect(nodeName(ns.find((n) => n.id === "web")!)).toBe("harbor-web, container, retiring");
  });
});

describe("FR-3 (M10): a Grounding action is accent from its first word", () => {
  it("the kind word inside an action inherits --accent-fg; on a line with no action it stays muted", () => {
    const inAct = { parts: [parseCompound("button.linkish.map-ground-act"), parseCompound("span.map-ground-kind")], hover: false };
    expect(winners(inAct, "color").map((w) => w.v)).toEqual(["inherit"]);
    const bare = { parts: [parseCompound("span.map-ground-off"), parseCompound("span.map-ground-kind")], hover: false };
    expect(winners(bare, "color").map((w) => w.v)).toEqual(["var(--fg-muted)"]);
  });
});

// leftovers-69 V1 (FR-1, FR-2, FR-5; map-and-roadmap Amendment 5, M15,
// A2, M18): a trail step that goes somewhere looks it and the current one
// does not; the panel title focus lands on draws no ring; the panel's
// list renders once, in reading order.
describe("leftovers-69 V1 (FR-1, M15): the trail's steps", () => {
  it("at L3: earlier steps are buttons drawn in --accent-fg over button.linkish { color: inherit }; the current one is --fg text, aria-current=location, no button", () => {
    place({ level: "modules", container: "harbor_api" });
    const html = body(drawn(harborMap));
    const nav = html.slice(html.indexOf('<nav class="map-trail"'), html.indexOf("</nav>"));
    expect([...nav.matchAll(/<button[^>]*>([^<]*)<\/button>/g)].map((m) => m[1])).toEqual(["Context", "Containers"]);
    expect(nav).toContain('<span aria-current="location" class="map-trail-here">harbor-api</span>');
    expect(nav).not.toMatch(/<button[^>]*>harbor-api</);
    expect(nav).not.toContain('aria-current="page"');
    const go = { parts: [parseCompound("button.linkish.map-trail-go")], hover: false };
    expect(winners(go, "color").map((w) => w.v)).toEqual(["var(--accent-fg)"]);
    const here = { parts: [parseCompound("span.map-trail-here")], hover: false };
    expect(winners(here, "color").map((w) => w.v)).toEqual(["var(--fg)"]);
  });
});

describe("leftovers-69 V1 (FR-2, A2): the panel title after a level change is a landing", () => {
  it("focus still lands on it (tabindex -1, the panel's focus target) and no rule draws a ring on it, :focus or :focus-visible", () => {
    const list = renderToStaticMarkup(<MapPanel initiative={init()} index={harbor} nodes={nodesAt(harbor, { level: "containers" })} levelName="Containers" picked={null} pick={() => undefined} drill={null} />);
    expect(list).toContain('<h3 class="map-panel-title" tabindex="-1">Containers</h3>');
    const panelSrc = readFileSync(new URL("./MapPanel.tsx", import.meta.url), "utf8") as string;
    expect(panelSrc).toContain('el.querySelector<HTMLElement>(".map-panel-title"))?.focus()');
    for (const pseudo of ["focus", "focus-visible"]) {
      const t = { parts: [{ ...parseCompound("h3.map-panel-title"), pseudos: [pseudo] }], hover: false };
      expect(winners(t, "outline").map((w) => w.v), pseudo).toEqual(["none"]);
    }
  });
});
