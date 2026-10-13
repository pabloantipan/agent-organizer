import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { merge } from "../../wailsjs/go/models";
import { rovingMove, rovingStop } from "./Rail";

// zustand answers a server render with the store's initial state, so the
// store is a plain object here that the tests set (as InitiativesView.test).
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

const init = (id: string, now: number, blocked: number, next: number) =>
  ({ id, title: id, client: "", machine: "m", local: true, status: "active", now, blocked, next, live: 0, working: 0 }) as unknown as merge.BoardInitiative;

function rail(selected: string | null, groups: { name: string; initiatives: string[] }[] = []) {
  store.useBoard.setState({
    view: { board: { initiatives: [init("a", 1, 0, 2), init("b", 2, 1, 0), init("c", 0, 0, 3)], columns: {} }, order: { groups } },
    agents: null, selectedInitiative: selected, setSelectedInitiative: () => undefined, reorderInitiatives: () => undefined,
    setGroups: () => undefined, railCollapsed: false, setRailCollapsed: () => undefined, roleOpen: null,
    openInitiatives: () => undefined, screen: selected ? "initiative" : "home",
  });
  return renderToStaticMarkup(<Rail />);
}

const rowTabs = (html: string) =>
  [...html.matchAll(/<div[^>]*data-rail-row="([^"]+)"[^>]*>/g)].map((m) => [m[1], /tabindex="(-?\d+)"/.exec(m[0])?.[1]]);

describe("V1: the rail's rows are one Tab stop (FR-5, T3)", () => {
  it("on an initiative, its row is the one tabindex 0 and the rest -1", () => {
    expect(rowTabs(rail("b"))).toEqual([["a", "-1"], ["b", "0"], ["c", "-1"]]);
  });

  it("with no initiative open, the first row is the stop", () => {
    expect(rowTabs(rail(null))).toEqual([["a", "0"], ["b", "-1"], ["c", "-1"]]);
  });

  it("keeps the rail's own buttons as ordinary stops before the rows, and drag's handle on the rows", () => {
    const html = rail("b", [{ name: "one", initiatives: ["a", "b"] }]);
    const firstRow = html.indexOf("data-rail-row");
    expect(html.indexOf('aria-label="Back to Initiatives"')).toBeLessThan(firstRow);
    expect(html.indexOf('aria-label="Initiatives rail"')).toBeLessThan(firstRow);
    expect(html.indexOf("rail-chevron")).toBeLessThan(firstRow);
    expect(html.slice(0, firstRow).match(/<button[^>]*tabindex="-1"/)).toBeNull();
    expect(html).toMatch(/<div[^>]*data-rfd-drag-handle-draggable-id="b"[^>]*data-rail-row="b"/);
    // one stop per shown group (leftovers-24 FR-7, T9): b in "one", c the rest
    expect(rowTabs(html).filter(([, t]) => t === "0")).toEqual([["b", "0"], ["c", "0"]]);
  });

  it("the stop follows Up and Down while focus is in the rows, else the current row", () => {
    const rows = ["a", "b", "c"];
    expect(rovingStop(rows, "b", null)).toBe("b");
    expect(rovingStop(rows, null, null)).toBe("a");
    expect(rovingStop(rows, "gone", null)).toBe("a");
    expect(rovingStop(rows, "b", "c")).toBe("c");
    expect(rovingStop([], null, null)).toBeNull();
  });

  it("Down twice and Up once from the current row lands one below it; the ends hold; other keys pass", () => {
    const rows = ["a", "b", "c"];
    let at = "a";
    at = rovingMove(rows, at, "ArrowDown")!;
    at = rovingMove(rows, at, "ArrowDown")!;
    at = rovingMove(rows, at, "ArrowUp")!;
    expect(at).toBe("b");
    expect(rovingMove(rows, "c", "ArrowDown")).toBe("c");
    expect(rovingMove(rows, "a", "ArrowUp")).toBe("a");
    for (const k of ["Tab", "Enter", " ", "ArrowLeft"]) expect(rovingMove(rows, "a", k)).toBeNull();
  });
});
