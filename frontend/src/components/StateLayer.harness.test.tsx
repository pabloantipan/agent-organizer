import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { merge } from "../../wailsjs/go/models";
import type { Seat } from "../hooks/useWails";
import { EASE, RULES, mediaOn, parseSelector, specificity, type Compound, type Rule } from "./stateLayer.kit";

// leftovers-52 S3 (FR-1, FR-2; review-view R43 amended, R50): a click from
// one marked control to another, in the rail, the People panel, the
// sub-tabs and a segmented control. No DOM library is a dependency here, so
// a click is what it does to the markup: the component rendered with the
// mark on one control, then rendered again with it on the next (the
// server render of the real component, both times). The style of the
// control that lost its mark is then computed from every stylesheet but
// review.css, over the rendered tree, the way a browser's cascade picks
// it (specificity, then order). CSS takes a transition from the style after
// a change: the old control has no fill in the next frame when its layer
// paints nothing and nothing it keeps can ease toward the old look.

const store = vi.hoisted(() => {
  const state: Record<string, unknown> = {};
  const useBoard = Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), {
    getState: () => state,
    setState: (p: Record<string, unknown>) => Object.assign(state, p),
  });
  return { state, useBoard };
});
vi.mock("../stores/board.store", () => ({ useBoard: store.useBoard }));
const { Rail } = await import("./Rail");
const { People } = await import("./SlackView");
const { InitiativeHeader } = await import("./InitiativeHeader");
const { UsageTable } = await import("./UsageTable");

// ---- the rendered tree -------------------------------------------------

type Node = { tag: string; attrs: Map<string, string>; classes: string[]; children: Node[]; parent: Node | null; text: string };
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr", "path", "circle", "rect", "line", "polyline", "polygon", "ellipse"]);
const unescape = (s: string) => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
function parse(html: string): Node {
  const root: Node = { tag: "#root", attrs: new Map(), classes: [], children: [], parent: null, text: "" };
  let cur = root;
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:="[^"]*")?)*)\s*(\/?)>|([^<]+)/g)) {
    if (m[5] !== undefined) { for (let n: Node | null = cur; n; n = n.parent) n.text += unescape(m[5]); continue; }
    const tag = m[2].toLowerCase();
    if (m[1]) { while (cur.parent && cur.tag !== tag) cur = cur.parent; if (cur.parent) cur = cur.parent; continue; }
    const attrs = new Map<string, string>();
    for (const a of m[3].matchAll(/([^\s=>/]+)(?:="([^"]*)")?/g)) attrs.set(a[1], unescape(a[2] ?? ""));
    const node: Node = { tag, attrs, classes: (attrs.get("class") ?? "").split(/\s+/).filter(Boolean), children: [], parent: cur, text: "" };
    cur.children.push(node);
    if (!m[4] && !VOID.has(tag)) cur = node;
  }
  return root;
}
const all = (n: Node): Node[] => [n, ...n.children.flatMap(all)];
const isUnder = (n: Node, a: Node) => { for (let p: Node | null = n; p; p = p.parent) if (p === a) return true; return false; };

const attrMatch = (n: Node, a: string) => {
  const m = /^([\w-]+)(?:([~^$*|]?=)"(.*)")?$/.exec(a); if (!m) return false;
  const v = n.attrs.get(m[1]); if (v === undefined) return false;
  if (!m[2]) return true;
  if (m[2] === "=") return v === m[3];
  if (m[2] === "^=") return v.startsWith(m[3]);
  if (m[2] === "*=") return v.includes(m[3]);
  return false;
};
/** Whether `n` matches one compound, the pointer over `hover` (and so over its ancestors). */
const matchCompound = (n: Node, c: Compound, hover: Node | null): boolean =>
  (!c.tag || c.tag === n.tag) && c.classes.every((k) => n.classes.includes(k)) && c.attrs.every((a) => attrMatch(n, a)) &&
  c.nots.every((x) => !matchCompound(n, { ...x, pe: null }, hover)) &&
  c.pseudos.every((p) => (p === "hover" ? !!hover && isUnder(hover, n) : p === "first-child" ? n.parent?.children[0] === n : p === "last-child" ? n.parent?.children.at(-1) === n : false));
/** A selector against the tree, combinators read as descent (none of the controls here hangs on a child or sibling combinator). */
const matches = (n: Node, parts: Compound[], hover: Node | null, pe: string | null) => {
  const subject = parts[parts.length - 1];
  if (subject.pe !== pe || !matchCompound(n, subject, hover)) return false;
  let at: Node | null = n.parent;
  for (let i = parts.length - 2; i >= 0; i--) {
    while (at && !matchCompound(at, parts[i], hover)) at = at.parent;
    if (!at) return false;
    at = at.parent;
  }
  return true;
};
/** The cascaded value of `prop` on `n` (or its ::before), the pointer over `hover`; custom properties inherit. */
function style(n: Node, prop: string, hover: Node | null = null, pe: string | null = null): string | null {
  let best: { s: number; o: number; v: string } | null = null;
  for (const r of RULES as Rule[]) {
    if (!mediaOn(r.media) || !r.decls.has(prop)) continue;
    for (const p of r.parts) {
      if (!matches(n, p, hover, pe)) continue;
      const s = specificity(p);
      if (!best || s > best.s || (s === best.s && r.order >= best.o)) best = { s, o: r.order, v: r.decls.get(prop)! };
    }
  }
  if (best) return best.v;
  if (prop.startsWith("--")) return pe ? style(n, prop, hover, null) : n.parent ? style(n.parent, prop, hover) : null;
  return null;
}
/** A var(--x) reference resolved on `n`, so the layer reads what the control set. */
const resolved = (n: Node, v: string | null, hover: Node | null = null) => v?.replace(/var\((--[\w-]+)\)/g, (_m, name) => style(n, name, hover) ?? "") ?? null;

/** What a control looks like to the eye, layer and all. */
const look = (n: Node, hover: Node | null = null) => ({
  layerFill: resolved(n, style(n, "background", hover, "before"), hover),
  layerLine: resolved(n, style(n, "box-shadow", hover, "before"), hover),
  ownBackground: style(n, "background-color", hover) ?? style(n, "background", hover),
  border: style(n, "border-color", hover), ink: style(n, "color", hover),
});
const PLAIN = { layerFill: "transparent", layerLine: "0 0 transparent" };

/**
 * The checks for one surface: `before` and `after` are the two renders,
 * `pick(tree, name)` finds a control by its name in either.
 */
function clickCheck(before: string, after: string, pick: (t: Node, name: string) => Node, from: string, to: string, quietHover = false) {
  let A: Node, B: Node, oldA: Node, oldB: Node, newB: Node;
  const setup = () => { A = parse(before); B = parse(after); oldA = pick(A, from); oldB = pick(B, from); newB = pick(B, to); };
  return {
    "both renders hold both controls": () => setup(),
    "the old control and the new one take the shared layer": () => {
      for (const n of [oldA, oldB, newB]) expect(n.classes).toContain("sl");
      expect(style(oldB, "transition", null, "before")).toBe("none");
      expect(style(oldB, "content", null, "before")).toBe('""');
    },
    "the mark moved: the new control's layer paints, the old one's does not": () => {
      const a = look(oldA), n = look(newB);
      expect(a.layerFill !== PLAIN.layerFill || a.layerLine !== PLAIN.layerLine, `marked before: ${JSON.stringify(a)}`).toBe(true);
      expect(n.layerFill !== PLAIN.layerFill || n.layerLine !== PLAIN.layerLine, `marked after: ${JSON.stringify(n)}`).toBe(true);
    },
    "the row that lost its mark has no fill in the next frame (R43 amended)": () => {
      const b = look(oldB);
      // The layer is gone at once: it paints transparent, and it has no transition to hold the old fill.
      expect({ layerFill: b.layerFill, layerLine: b.layerLine }).toEqual(PLAIN);
      // The control's own background did not move with the mark, so hover's ease has nothing to run.
      expect(b.ownBackground).toBe(look(oldA).ownBackground);
      // What did move (border, ink) is not transitioned: only background-color is.
      expect(style(oldB, "transition")).toBe(EASE);
      expect(style(oldA, "transition")).toBe(EASE);
    },
    "hover on the unmarked control eases in and out (R49 amended, R50)": () => {
      expect(style(oldB, "transition", oldB)).toBe(EASE);
      expect(style(oldB, "transition")).toBe(EASE);
      // The sub-tabs' hover is ink only (quiet text tabs, shell.css): the ease is set and runs on nothing; every other surface's hover fills.
      if (!quietHover) expect(look(oldB, oldB).ownBackground, "hover paints the control's own background").not.toBe(look(oldB).ownBackground);
      expect({ layerFill: look(oldB, oldB).layerFill, layerLine: look(oldB, oldB).layerLine }).toEqual(PLAIN);
    },
    "hover on the marked control does not change its fill": () => {
      const rest = look(newB), over = look(newB, newB);
      expect(over.layerFill).toBe(rest.layerFill);
      if (/rgba\(|accent-soft|accent-muted/.test(String(rest.layerFill))) expect(over.ownBackground).toBe(rest.ownBackground);
    },
  };
}
const run = (checks: Record<string, () => void>) => { for (const [name, fn] of Object.entries(checks)) it(name, () => { checks["both renders hold both controls"](); fn(); }); };
const byText = (sel: string) => (t: Node, name: string) => {
  const hit = all(t).filter((n) => matches(n, parseSelector(sel), null, null) && n.text.includes(name));
  expect(hit, `${sel} "${name}"`).toHaveLength(1);
  return hit[0];
};

// ---- the four surfaces ---------------------------------------------------

const init = (id: string) =>
  ({ id, title: id, client: "", machine: "m", local: true, status: "active", now: 1, blocked: 0, next: 1, live: 0, working: 0, goal: "g", stages: [], scope: { in: [], out: [] }, repos_state: [], problems: [], decisions: [], also_on: [], specs: [] }) as unknown as merge.BoardInitiative;

function rail(selected: string, strip = false) {
  store.useBoard.setState({
    view: { board: { initiatives: [init("alpha"), init("beta")], columns: {} }, order: { groups: [] } },
    agents: { groups: [], roles: [] }, selectedInitiative: selected, setSelectedInitiative: () => undefined, reorderInitiatives: () => undefined,
    setGroups: () => undefined, railCollapsed: strip, setRailCollapsed: () => undefined, roleOpen: null, openInitiatives: () => undefined, screen: "initiative",
  });
  return renderToStaticMarkup(<Rail />);
}
const railRow = (t: Node, id: string) => {
  const hit = all(t).filter((n) => n.classes.includes("rail-item") && (n.attrs.get("data-rail-row") === id || all(n).some((c) => c.attrs.get("data-rail-row") === id) || n.text.includes(id)));
  expect(hit, `rail-item ${id}`).toHaveLength(1);
  return hit[0];
};
const stripRow = (t: Node, id: string) => {
  const hit = all(t).filter((n) => n.classes.includes("strip-item") && (n.attrs.get("aria-label") ?? n.attrs.get("title") ?? "").includes(id));
  expect(hit, `strip-item ${id}`).toHaveLength(1);
  return hit[0];
};

const seat = (name: string) => ({ name, agent: { state: "running" }, watcher: "alive", deaf: false, capped: false, owes: [] }) as unknown as Seat;
const people = (focus: string) => renderToStaticMarkup(<People seats={[seat("dev_ana"), seat("dev_bruno")]} human="pablo" focus={focus} onFocus={() => undefined} onClose={() => undefined} />);

function header(sub: string) {
  store.useBoard.setState({ view: { board: { initiatives: [init("alpha")], columns: {} }, order: {} }, agents: null, headerOpen: false, sub, widthClass: "wide", openInitiative: () => undefined });
  return renderToStaticMarkup(<InitiativeHeader initiative={init("alpha")} />);
}

const usage = (cut: "initiative" | "role") => renderToStaticMarkup(<UsageTable rows={[]} cut={cut} setCut={() => undefined} sessions={[]} />);

describe("S3: the rail, Pick another initiative", () => run(clickCheck(rail("alpha"), rail("beta"), railRow, "alpha", "beta")));
describe("S3: the rail as the strip, Pick another initiative", () => run(clickCheck(rail("alpha", true), rail("beta", true), stripRow, "alpha", "beta")));
describe("S3: the People panel, a press on another seat", () => run(clickCheck(people("dev_ana"), people("dev_bruno"), byText("button.person"), "dev_ana", "dev_bruno")));
describe("S3: the sub-tabs, Overview to Work", () => run(clickCheck(header("overview"), header("work"), byText(".subtabs button"), "Overview", "Work", true)));
describe("S3: a segmented control, Usage's cut, initiative to role", () => run(clickCheck(usage("initiative"), usage("role"), byText(".seg button"), "initiative", "role")));
