// Vitest blanks CSS modules, so stylesheets and sources are read from disk;
// the frontend has no Node types (vitest runs in Node).
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { merge } from "../../wailsjs/go/models";
import { raisesOn } from "./InitiativesView";
import { InitiativeHeader } from "./InitiativeHeader";

// C1-C2 (docs/specs/leftovers-19.md). The store is a plain object the tests
// set, as in CharterOnce.test.tsx; the review build covers the computed
// styles and AX frames (.wt-notes/cd-build/progress.md).
const store = vi.hoisted(() => {
  const state: Record<string, unknown> = {};
  const useBoard = Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), {
    getState: () => state,
    setState: (p: Record<string, unknown>) => Object.assign(state, p),
  });
  return { state, useBoard };
});
vi.mock("../stores/board.store", () => ({ useBoard: store.useBoard }));

const init = {
  id: "organizer", title: "", description: "", machine: "lodestar", local: true, path: "/r/organizer", status: "active",
  goal: "One board", measure: "", target: "", scope: { in: [], out: [] },
  stages: [], repos_state: [], problems: [], decisions: [], also_on: [], specs: [],
} as unknown as merge.BoardInitiative;
const src = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8") as string;
// An element under the pointer: closest answers for the selectors it is.
const el = (...is: string[]) => ({
  closest: (sel: string) => (sel.split(",").map((x) => x.trim()).some((x) => is.includes(x)) ? {} : null),
});

describe("C1: the id link raises the card, as the body does (FR-7, I33)", () => {
  it("the pointer on the id link raises; on the body too; Details, Sleep, Wake and the confirm do not", () => {
    expect(raisesOn(el("a", ".ic-id"))).toBe(true);
    expect(raisesOn(el("div"))).toBe(true);
    expect(raisesOn(el("button"))).toBe(false);
    expect(raisesOn(el("div", "[role=group]"))).toBe(false);
    expect(raisesOn(el("a"))).toBe(false);
    expect(raisesOn(null)).toBe(false);
  });

  it("the raise is the card's class, the id link sits inside the body that sets it", () => {
    expect(src("../styles/initiatives.css")).toContain(".ic.raised { background: var(--surface-hover); }");
    const s = src("./InitiativesView.tsx");
    const main = s.indexOf('<div className="ic-main"');
    expect(main).toBeGreaterThan(0);
    expect(s.indexOf('className="ic-id mono"', main)).toBeGreaterThan(main);
  });
});

describe("C2: the header's Details reads one label, one height, aria-expanded (FR-8, I34)", () => {
  const button = (open: boolean) => {
    store.useBoard.setState({ view: { board: { initiatives: [init], columns: {} }, order: {} }, agents: null, headerOpen: open, sub: "overview", widthClass: "wide" });
    const h = renderToStaticMarkup(<InitiativeHeader initiative={init} />);
    const m = h.match(/<button class="ihead-details"[^>]*>(.*?)<\/button>/);
    expect(m).not.toBeNull();
    return { tag: m![0], label: m![1].replace(/<[^>]+>/g, "").trim() };
  };

  it("closed: Details, aria-expanded false", () => {
    const b = button(false);
    expect(b.label).toBe("Details");
    expect(b.tag).toContain('aria-expanded="false"');
    expect(b.tag).toContain("<svg");
  });

  it("open: Details, aria-expanded true; Hide details is gone", () => {
    const b = button(true);
    expect(b.label).toBe("Details");
    expect(b.tag).toContain('aria-expanded="true"');
    expect(src("./InitiativeHeader.tsx")).not.toContain("Hide details");
  });

  it("one height and the chevron turns when open", () => {
    expect(src("../styles/header.css")).toMatch(/\.ihead \.ihead-details \{[^}]*height: var\(--control-sm\)[^}]*white-space: nowrap/);
    expect(src("../styles/shell.css")).toContain('.ihead-details[aria-expanded="true"] svg { transform: rotate(180deg); }');
  });
});
