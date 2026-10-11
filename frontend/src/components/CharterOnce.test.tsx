// Vitest blanks CSS modules, so stylesheets and sources are read from disk;
// the frontend has no Node types (vitest runs in Node).
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { merge } from "../../wailsjs/go/models";
import { Charter } from "./Charter";
import { CardDetails, InitiativesView, raisesOn } from "./InitiativesView";
import { HEADER_OMITS, InitiativeHeader } from "./InitiativeHeader";
import { InitiativeDetail } from "./Initiatives";

// zustand answers a server render with the store's initial state, so the
// store is a plain object here that the tests set.
const store = vi.hoisted(() => {
  const state: Record<string, unknown> = {};
  const useBoard = Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), {
    getState: () => state,
    setState: (p: Record<string, unknown>) => Object.assign(state, p),
  });
  return { state, useBoard };
});
vi.mock("../stores/board.store", () => ({ useBoard: store.useBoard }));
const useBoard = store.useBoard;

// H1-H4 (docs/specs/leftovers-18.md). No DOM library is a dependency here:
// markup is the server render, the pointer is the decision the card's
// handler makes over the element under it, and the layout rules are read
// from the stylesheets. The review build covers the rest (progress.md).

const GOAL = "One board for every initiative";
const init = (over: Partial<merge.BoardInitiative>): merge.BoardInitiative => ({
  id: "organizer", title: "", description: "", machine: "lodestar", local: true, path: "/r/organizer", status: "active",
  goal: GOAL, measure: "Pablo opens it first each day", target: "2026-10-31",
  scope: { in: ["the board"], out: ["Jira"] },
  stages: [{ id: "s1", title: "first", outcome: "o1", done: "2026-09-01" }, { id: "s2", title: "second", outcome: "o2", current: true }],
  repos_state: [], problems: [], decisions: [], also_on: [], specs: [], ...over,
} as unknown as merge.BoardInitiative);
const viewOf = (inits: merge.BoardInitiative[]) => ({ board: { initiatives: inits, columns: {} }, order: {} }) as never;
const text = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const count = (h: string, w: string) => h.split(w).length - 1;
const src = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8") as string;
const el = (...is: string[]) => ({
  closest: (sel: string) => (sel.split(",").map((x) => x.trim()).some((x) => is.includes(x)) ? {} : null),
});

describe("H1: a fact shows once; one Charter with omit (FR-4)", () => {
  it("the Charter leaves out exactly the fields named in omit, and nothing else", () => {
    const all = text(renderToStaticMarkup(<Charter i={init({})} />));
    for (const w of ["Goal", "Measure", "Target", "In scope", "Out of scope", "Stage"]) expect(all).toContain(w);
    const less = text(renderToStaticMarkup(<Charter i={init({})} omit={["target", "stage"]} />));
    expect(less).not.toContain("Target");
    expect(less).not.toContain("Stage");
    for (const w of ["Goal", "Measure", "In scope", "Out of scope"]) expect(less).toContain(w);
  });

  it("each field is defined once in Charter.tsx", () => {
    const s = src("./Charter.tsx");
    for (const w of ['"no goal yet"', '"no measure yet"', '"no target yet"']) expect(count(s, w)).toBe(1);
    expect(count(s, "<ScopeLines ")).toBe(1);
    expect(count(s, "<StageLine ")).toBe(1);
  });

  it("the header's open Details pass omit target and stage: no Target and no Stage lines there; the bar's target and the strip's label stay", () => {
    expect(HEADER_OMITS).toEqual(["target", "stage"]);
    const i = init({});
    useBoard.setState({ view: viewOf([i]), agents: null, headerOpen: true, sub: "overview", widthClass: "wide" } as never);
    const h = renderToStaticMarkup(<InitiativeHeader initiative={i} />);
    const charter = h.slice(h.indexOf("data-charter="), h.indexOf('class="ihead-source"'));
    expect(charter).not.toMatch(/class="lbl">Target</);
    expect(charter).not.toMatch(/class="lbl">Stage</);
    expect(h).toMatch(/class="ihead-target">target <b class="num">31 Oct/);
    expect(h).toContain('class="stg-label"');
    expect(h).toContain("2 of 2");
  });

  it("an open Initiatives card hides its head's goal line, so the goal shows once (the Charter's)", () => {
    // The open state is the view's own; the guard is read from the source,
    // and the open card is the closed card's body minus that line plus CardDetails.
    expect(src("./InitiativesView.tsx")).toContain("{!open && <div className={`ic-goal ");
    useBoard.setState({ view: viewOf([init({})]), agents: null });
    const closed = renderToStaticMarkup(<InitiativesView />);
    expect(count(closed, GOAL)).toBe(2); // the goal line's text and its hover title
    expect(count(text(renderToStaticMarkup(<CardDetails id="d" i={init({})} readOnly={false} />)), GOAL)).toBe(1);
  });
});

describe("H2: hover raises a card on its body only, open or closed (FR-5)", () => {
  it("the body and the id link raise (leftovers-19 FR-7); Details, Sleep, Wake (buttons) and the confirm do not", () => {
    expect(raisesOn(el("div"))).toBe(true);
    expect(raisesOn(el("button"))).toBe(false);
    expect(raisesOn(el("a", ".ic-id"))).toBe(true);
    expect(raisesOn(el("div", "[role=group]"))).toBe(false);
    expect(raisesOn(null)).toBe(false);
  });

  it("the raise is a class set from the body's pointer, never a :hover of the whole card, and not tied to closed", () => {
    const css = src("../styles/initiatives.css");
    expect(css).toContain(".ic.raised { background: var(--surface-hover); }");
    expect(css).not.toMatch(/\.ic(:not\(\.open\))?:hover/);
    const s = src("./InitiativesView.tsx");
    // Bound on .ic-main, which holds the body and the foot but not the open
    // details; leaving it clears the raise.
    expect(s).toContain('onMouseOver={(e) => setRaised(raisesOn(e.target as Element) ? c.id : null)} onMouseLeave={() => setRaised(null)}');
    expect(s).toContain('${raised === c.id ? "raised" : ""}');
    useBoard.setState({ view: viewOf([init({})]), agents: null });
    expect(renderToStaticMarkup(<InitiativesView />)).not.toMatch(/class="ic [^"]*raised/);
  });
});

describe("H3: InitiativeDetail's readOnly, not a css rule (FR-6)", () => {
  it("readOnly hides Review with agent; without it a local initiative shows it", () => {
    expect(renderToStaticMarkup(<InitiativeDetail i={init({})} readOnly />)).not.toContain("Review with agent");
    expect(renderToStaticMarkup(<InitiativeDetail i={init({})} />)).toContain("Review with agent");
    expect(renderToStaticMarkup(<CardDetails id="d" i={init({ status: "paused" })} readOnly />)).not.toContain("Review with agent");
  });

  it("the order-tied rule is gone", () => {
    expect(src("../styles/initiatives.css")).not.toContain("last-of-type");
    expect(src("../styles/initiatives.css")).not.toContain(".ic-ws.read-only");
  });
});

describe("H4: the header's pills wrap inside the header (FR-7)", () => {
  it("the bar and the id's group wrap", () => {
    const css = src("../styles/header.css");
    expect(css).toMatch(/\.ihead \.ihead-bar \{[^}]*flex-wrap: wrap/);
    expect(css).toMatch(/\.ihead \.ihead-id \{[^}]*flex-wrap: wrap[^}]*min-width: 0/);
  });
});

describe("H5: the sub-tabs mark the current one aria-current true, never page (FR-7b)", () => {
  it("on every sub-view, one sub-tab is current with true and none says page", () => {
    const i = init({});
    for (const sub of ["overview", "work", "roadmap", "decisions", "conversations", "agents"]) {
      useBoard.setState({ view: viewOf([i]), agents: null, headerOpen: false, sub, widthClass: "wide" } as never);
      const h = renderToStaticMarkup(<InitiativeHeader initiative={i} />);
      const nav = h.slice(h.indexOf('<nav class="subtabs"'), h.indexOf("</nav>"));
      expect(nav).not.toContain('aria-current="page"');
      expect([...nav.matchAll(/aria-current="true"/g)]).toHaveLength(1);
      expect(nav).toMatch(/<button class="on" aria-current="true">/);
      expect(h).not.toContain('aria-current="page"');
    }
  });
});
